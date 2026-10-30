import { useEffect, useRef } from 'react';
import ProjectHero from './ProjectHero';
import { setRevealSkip } from '../utils/revealSkip';
import type { Project } from '../types';

export interface CardExpandRequest {
  /** Changes per run, so a second tap restarts the effect. */
  id: number;
  project: Project;
  /** `open`: card → case study. `close`: case study → its card on Work. */
  dir: 'open' | 'close';
  /** The tapped card, for `open`. `close` finds the card on Work itself. */
  card: HTMLElement | null;
  /** Swap the view underneath. Called once the overlay fully covers it. */
  swap: () => void;
  done: () => void;
}

const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
const EASE_DRAWER = 'cubic-bezier(0.32, 0.72, 0, 1)';
// --ground and --surface-1, as colours the panel can interpolate between.
const GROUND = 'rgb(1, 3, 9)';
const LIFTED = 'rgb(13, 20, 28)';
/** The move itself, the same length both ways. */
const MOVE_MS = 460;
/** Cover fade before closing; uncover fade after opening. */
const HANDOFF_MS = 220;

/**
 * One part of the move, written as it plays when opening. Closing plays every
 * step mirrored: the keyframes run the other way, and a step that happens late
 * on the way in happens just as early on the way out, for just as long. Both
 * directions run forwards on the same curves — playing the opening literally
 * backwards would start the close slowly and slam it into the card.
 */
type Step = { el: Element; keyframes: Keyframe[]; start: number; duration: number; easing: string };

const perform = (steps: Step[], dir: 'open' | 'close') =>
  Promise.all(steps.map(({ el, keyframes, start, duration, easing }) => {
    const ordered = dir === 'open'
      ? keyframes
      : [...keyframes].reverse().map((k) => (k.offset == null ? k : { ...k, offset: 1 - k.offset }));
    const delay = dir === 'open' ? start : MOVE_MS - start - duration;
    return play(el, ordered, { duration, easing, delay });
  }));

/** What parts around the tapped card: everything a reader would see move. */
const NEIGHBOURS = '#main a[aria-label^="Open case study"], #main h2, #main a[href="#explorations"], #main button';

const frames = (n = 2) =>
  new Promise<void>((resolve) => {
    const tick = () => (--n <= 0 ? resolve() : requestAnimationFrame(tick));
    requestAnimationFrame(tick);
  });

const waitFor = async <T,>(get: () => T | null, timeout = 4000): Promise<T | null> => {
  const start = performance.now();
  for (;;) {
    const value = get();
    if (value) return value;
    if (performance.now() - start > timeout) return null;
    await frames(1);
  }
};

/** Resolves once every image inside is decoded, or after `cap` ms regardless. */
const decoded = (root: Element, cap = 400) =>
  Promise.race([
    Promise.all([...root.querySelectorAll('img')].map((img) => img.decode().catch(() => {}))),
    new Promise((resolve) => setTimeout(resolve, cap)),
  ]);

const play = (el: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) =>
  el.animate(keyframes, { fill: 'both', ...options }).finished.catch(() => {});

/**
 * An exact, inert copy of the card, pinned over the original. It is never
 * scaled — it only fades — so the thumbnail inside can't stretch, blur or
 * re-crop on the way. That was the failure mode of scaling a snapshot of the
 * card, which is what the View Transitions API would have done here.
 */
const cloneCard = (card: HTMLElement, rect: DOMRect) => {
  const clone = card.cloneNode(true) as HTMLElement;
  clone.removeAttribute('id');
  clone.tabIndex = -1;
  clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
  clone.querySelectorAll('img').forEach((img) => { img.loading = 'eager'; img.decoding = 'sync'; });
  Object.assign(clone.style, {
    position: 'fixed', left: `${rect.left}px`, top: `${rect.top}px`,
    width: `${rect.width}px`, height: `${rect.height}px`, margin: '0', transform: 'none',
  });
  const title = clone.querySelector('h3');
  if (title) title.style.visibility = 'hidden';
  return clone;
};

/**
 * Where each word of a title sits on screen, and which line it is on,
 * measured without touching its DOM.
 */
const wordBoxes = (el: HTMLElement) => {
  const boxes: { word: string; rect: DOMRect; line: number }[] = [];
  const range = document.createRange();
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    for (const match of (node.textContent ?? '').matchAll(/\S+/g)) {
      range.setStart(node, match.index);
      range.setEnd(node, match.index + match[0].length);
      const rect = range.getBoundingClientRect();
      const previous = boxes[boxes.length - 1];
      const line = !previous ? 0 : previous.line + (rect.top - previous.rect.top > rect.height / 2 ? 1 : 0);
      boxes.push({ word: match[0], rect, line });
    }
  }
  return boxes;
};

/**
 * The title as one free-standing span per word, set in the heading's type and
 * sitting on that word in the heading, with the transform that lays it over
 * the same word in the card's title.
 *
 * Per word because the two break their lines in different places — the
 * heading is balanced, the card title isn't — so "The Soundtrack of / Seven
 * Years" on the card is "The Soundtrack / of Seven Years" in the heading.
 * Moving or crossfading the title as one block made "of" jump between lines;
 * this way each word travels to wherever it lands.
 *
 * Card titles are balanced too, which makes the two break alike for every
 * multi-line card title. What's left are the one-line Archive titles that
 * wrap as a heading: a word changing line dips while it crosses the others,
 * so the overlap reads as movement rather than a collision.
 */
const titleWords = (cardTitle: HTMLElement, heading: HTMLElement) => {
  const from = wordBoxes(cardTitle);
  const to = wordBoxes(heading);
  if (from.length === 0 || from.length !== to.length) return [];
  const card = getComputedStyle(cardTitle);
  const head = getComputedStyle(heading);
  return to.map(({ word, rect: b, line }, i) => {
    const a = from[i].rect;
    const crosses = line !== from[i].line;
    const span = document.createElement('span');
    span.textContent = word;
    // A line box exactly the height of the glyphs, so the span's top is the
    // measured top of the word.
    Object.assign(span.style, {
      position: 'fixed', left: `${b.left}px`, top: `${b.top}px`, margin: '0', whiteSpace: 'nowrap',
      font: head.font, letterSpacing: head.letterSpacing, lineHeight: `${b.height}px`,
      color: head.color, transformOrigin: '0 0',
    });
    const atCard: Keyframe = { transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.height / b.height})`, color: card.color, opacity: 1 };
    const atHeading: Keyframe = { transform: 'none', color: head.color, opacity: 1 };
    const midway: Keyframe[] = crosses ? [{ opacity: 0.3, offset: 0.5 }] : [];
    return { span, toHeading: [atCard, ...midway, atHeading] };
  });
};

/** Cards and headings on screen around the card, with how far each moves away. */
const neighboursOf = (card: HTMLElement) => {
  const c = card.getBoundingClientRect();
  const middle = (c.top + c.bottom) / 2;
  return [...document.querySelectorAll<HTMLElement>(NEIGHBOURS)]
    .filter((el) => {
      if (el === card || card.contains(el) || el.contains(card)) return false;
      // A button inside some other card moves with that card.
      const owner = el.parentElement?.closest('a[aria-label^="Open case study"]');
      if (owner) return false;
      const r = el.getBoundingClientRect();
      return r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
    })
    .map((el) => {
      const r = el.getBoundingClientRect();
      return { el, dy: (r.top + r.bottom) / 2 < middle ? -40 : 90 };
    });
};

const isClear = (colour: string) => colour === 'transparent' || /rgba\(.*,\s*0\)$/.test(colour);

/**
 * Card-expand page transition, phones only.
 *
 * Opening: the tapped card's panel grows to fill the screen while the cards
 * around it part — above slide up, below slide down — and its title travels
 * into the case study's heading. The panel ends on a copy of the case study's
 * header (ProjectHero), drawn in this overlay at exactly the place the real
 * one will render. Only then is the real page mounted, underneath, so the
 * expensive mount happens while nothing on screen is moving — and if the
 * page's code is still downloading, the reader is looking at the header, not
 * an empty screen. Once it has painted, the overlay fades away over it.
 *
 * Closing runs the same thing in reverse, landing on the case study's card on
 * Work. The real card only reappears once the copy sits exactly over it.
 */
const CardExpand = ({ request }: { request: CardExpandRequest }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const surface = overlay.firstElementChild as HTMLElement;
    const hero = surface.querySelector<HTMLElement>('[data-project-hero]')!;
    const h1 = hero.querySelector('h1')!;
    const heroParts = [...(hero.firstElementChild?.children ?? [])].filter((n) => n !== h1);
    const heroRule = getComputedStyle(hero).borderBottomColor;
    const { project } = request;

    let cancelled = false;
    let card: HTMLElement | null = null;
    let moved: { el: HTMLElement; dy: number }[] = [];
    const added: HTMLElement[] = [];
    const add = (el: HTMLElement) => { overlay.appendChild(el); added.push(el); return el; };

    const geometry = (target: HTMLElement) => {
      const box = overlay.getBoundingClientRect();
      const c = target.getBoundingClientRect();
      const cs = getComputedStyle(target);
      const radius = cs.borderTopLeftRadius;
      const clip = `inset(${c.top}px ${box.width - c.right}px ${box.height - c.bottom}px ${c.left}px round ${radius})`;
      const full = `inset(0px 0px 0px 0px round 0px)`;
      return { c, clip, full, bg: isClear(cs.backgroundColor) ? GROUND : cs.backgroundColor };
    };

    const fadeAway = async () => {
      await play(overlay, [{ opacity: 1 }, { opacity: 0 }], { duration: HANDOFF_MS, easing: EASE_OUT });
    };
    const fadeOver = async () => {
      await play(overlay, [{ opacity: 0 }, { opacity: 1 }], { duration: HANDOFF_MS, easing: EASE_OUT });
    };

    /** The whole move, between `card` and the header, as opening plays it. */
    const choreography = (
      geo: ReturnType<typeof geometry>,
      copy: HTMLElement,
      words: ReturnType<typeof titleWords>,
    ): Step[] => [
      // Lifted to the card surface colour mid-move: most cards sit straight
      // on the ground, and a panel the colour of the page behind it can't be
      // seen growing. It starts and ends on the real colours, so neither end
      // of the move shows a change.
      { el: surface, keyframes: [{ clipPath: geo.clip, backgroundColor: geo.bg }, { backgroundColor: LIFTED, offset: 0.35 }, { clipPath: geo.full, backgroundColor: GROUND }], start: 0, duration: MOVE_MS, easing: EASE_DRAWER },
      // The copy — thumbnail and all — fades where the card is over most of
      // the move, never scaled; closing, the page shrinks around it as it
      // fades back in rather than uncovering it at the end.
      { el: copy, keyframes: [{ opacity: 1 }, { opacity: 0 }], start: 0, duration: 300, easing: 'ease-out' },
      ...words.map(({ span, toHeading }) => ({ el: span, keyframes: toHeading, start: 0, duration: MOVE_MS, easing: EASE_DRAWER })),
      ...(words.length ? [] : [{ el: h1, keyframes: [{ opacity: 0 }, { opacity: 1 }], start: 160, duration: 300, easing: EASE_OUT }]),
      { el: hero, keyframes: [{ borderBottomColor: 'transparent' }, { borderBottomColor: heroRule }], start: 160, duration: 300, easing: EASE_OUT },
      ...heroParts.map((part, i) => ({ el: part, keyframes: [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], start: Math.min(120 + i * 40, MOVE_MS - 260), duration: 260, easing: EASE_OUT })),
      ...moved.map(({ el, dy }) => ({ el, keyframes: [{ transform: 'none', opacity: 1 }, { transform: `translateY(${dy}px)`, opacity: 0 }], start: 0, duration: 380, easing: EASE_OUT })),
    ];

    const open = async () => {
      card = request.card;
      const h3 = card?.querySelector('h3');
      const rect = card?.getBoundingClientRect();
      if (!card || !card.isConnected || !h3 || !rect || rect.bottom < 0 || rect.top > window.innerHeight) {
        // Nothing on screen to grow from: cover, swap, uncover.
        await fadeOver();
        return covered();
      }
      const geo = geometry(card);
      const copy = add(cloneCard(card, rect));
      const words = titleWords(h3, h1);
      words.forEach(({ span }) => add(span));
      // The words stand in for the heading until the overlay hands over.
      if (words.length) h1.style.visibility = 'hidden';
      moved = neighboursOf(card);
      await decoded(copy);
      if (cancelled) return;

      card.style.visibility = 'hidden';
      overlay.style.opacity = '1';
      await perform(choreography(geo, copy, words), 'open');
      if (!cancelled) await covered();
    };

    const covered = async () => {
      request.swap();
      // Hand over once the real header has rendered and painted underneath.
      await waitFor(() => {
        const heading = document.querySelector('#main [data-project-hero] h1');
        return heading?.textContent === project.title ? heading : null;
      });
      await frames(2);
      if (cancelled) return;
      await fadeAway();
      if (!cancelled) request.done();
    };

    const close = async () => {
      await fadeOver();
      if (cancelled) return;
      setRevealSkip(true);
      request.swap();
      card = await waitFor(() => document.getElementById(`project-${project.id}`));
      const h3 = card?.querySelector('h3');
      if (cancelled) return;
      if (!card || !h3) {
        await fadeAway();
        return request.done();
      }
      card.scrollIntoView({ block: 'center' });
      await frames(2);
      await decoded(card);
      if (cancelled) return;

      const rect = card.getBoundingClientRect();
      const geo = geometry(card);
      const copy = add(cloneCard(card, rect));
      copy.style.opacity = '0';
      const words = titleWords(h3, h1);
      words.forEach(({ span }) => add(span));
      // Swapped in where the heading already is, so nothing changes yet.
      if (words.length) h1.style.visibility = 'hidden';
      moved = neighboursOf(card);
      card.style.visibility = 'hidden';
      await frames(1);
      if (cancelled) return;

      await perform(choreography(geo, copy, words), 'close');
      if (cancelled) return;
      // The copy now sits exactly over the card: swap them in one frame.
      card.style.visibility = '';
      request.done();
    };

    if (request.dir === 'open') open();
    else close();

    return () => {
      cancelled = true;
      if (card) card.style.visibility = '';
      moved.forEach(({ el }) => el.getAnimations().forEach((a) => a.cancel()));
      added.forEach((el) => el.remove());
      setRevealSkip(false);
    };
    // One run per request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.id]);

  return (
    <div ref={overlayRef} className="card-expand" aria-hidden="true">
      <div className="card-expand-surface">
        <div className="text-ink">
          <ProjectHero project={request.project} />
        </div>
      </div>
    </div>
  );
};

export default CardExpand;
