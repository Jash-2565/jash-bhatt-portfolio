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
const EASE_IN = 'cubic-bezier(0.4, 0, 1, 1)';
const EASE_DRAWER = 'cubic-bezier(0.32, 0.72, 0, 1)';
// --ground and --surface-1, as colours the panel can interpolate between.
const GROUND = 'rgb(1, 3, 9)';
const LIFTED = 'rgb(13, 20, 28)';
const OPEN_MS = 460;
const CLOSE_MS = 420;

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
 * A free-standing copy of the card's title. Its type is copied from the
 * computed style rather than the classes: the Archive titles size themselves
 * from their column with container units, which a detached copy has no
 * column to read.
 */
const cloneTitle = (h3: HTMLElement) => {
  const rect = h3.getBoundingClientRect();
  const cs = getComputedStyle(h3);
  const title = document.createElement('div');
  title.textContent = h3.textContent;
  Object.assign(title.style, {
    position: 'fixed', left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`,
    margin: '0', font: cs.font, letterSpacing: cs.letterSpacing, lineHeight: cs.lineHeight,
    color: cs.color, textWrap: 'balance', transformOrigin: '0 0',
  });
  return title;
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
    h1.style.transformOrigin = '0 0';
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

    /**
     * The transform that lays `moving` over `target`'s box: translate plus a
     * scale of the type size. Both titles scale about their top-left corner.
     */
    const between = (target: Element, moving: Element) => {
      const a = target.getBoundingClientRect();
      const b = moving.getBoundingClientRect();
      const scale = parseFloat(getComputedStyle(target).fontSize) / parseFloat(getComputedStyle(moving).fontSize);
      return `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${scale})`;
    };

    const fadeAway = async () => {
      await play(overlay, [{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: EASE_OUT });
    };

    const open = async () => {
      card = request.card;
      const h3 = card?.querySelector('h3');
      const rect = card?.getBoundingClientRect();
      if (!card || !card.isConnected || !h3 || !rect || rect.bottom < 0 || rect.top > window.innerHeight) {
        // Nothing on screen to grow from: cover, swap, uncover.
        await play(overlay, [{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: EASE_OUT });
        return covered();
      }
      const { clip, full, bg } = geometry(card);
      const copy = add(cloneCard(card, rect));
      const title = add(cloneTitle(h3));
      const toHeading = between(h1, h3);
      const fromCard = between(h3, h1);
      moved = neighboursOf(card);
      await decoded(copy);
      if (cancelled) return;

      card.style.visibility = 'hidden';
      overlay.style.opacity = '1';
      await Promise.all([
        // Lifted to the card surface colour mid-move: most cards sit straight
        // on the ground, and a panel the colour of the page behind it can't
        // be seen growing. It starts and ends on the real colours, so neither
        // end of the move shows a change.
        play(surface, [{ clipPath: clip, backgroundColor: bg }, { backgroundColor: LIFTED, offset: 0.35 }, { clipPath: full, backgroundColor: GROUND }], { duration: OPEN_MS, easing: EASE_DRAWER }),
        play(copy, [{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: EASE_OUT }),
        // The two titles cross over in the first half of the move, so a
        // different line break between them never shows as a jump.
        play(title, [{ transform: 'none', opacity: 1 }, { opacity: 1, offset: 0.15 }, { opacity: 0, offset: 0.5 }, { transform: toHeading, opacity: 0 }], { duration: OPEN_MS, easing: EASE_DRAWER }),
        play(h1, [{ transform: fromCard, opacity: 0 }, { opacity: 0, offset: 0.15 }, { opacity: 1, offset: 0.5 }, { transform: 'none', opacity: 1 }], { duration: OPEN_MS, easing: EASE_DRAWER }),
        play(hero, [{ borderBottomColor: 'transparent' }, { borderBottomColor: heroRule }], { duration: 300, easing: EASE_OUT, delay: 200 }),
        ...heroParts.map((part, i) =>
          play(part, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: EASE_OUT, delay: 200 + i * 40 })),
        ...moved.map(({ el, dy }) =>
          play(el, [{ transform: 'none', opacity: 1 }, { transform: `translateY(${dy}px)`, opacity: 0 }], { duration: 380, easing: EASE_OUT })),
      ]);
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
      await play(overlay, [{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: EASE_OUT });
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
      const { clip, full, bg } = geometry(card);
      const copy = add(cloneCard(card, rect));
      const title = add(cloneTitle(h3));
      copy.style.opacity = '0';
      title.style.opacity = '0';
      const toCard = between(h3, h1);
      const fromHeading = between(h1, h3);
      moved = neighboursOf(card);
      card.style.visibility = 'hidden';
      await frames(1);
      if (cancelled) return;

      await Promise.all([
        ...heroParts.map((part) => play(part, [{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: EASE_IN })),
        play(hero, [{ borderBottomColor: heroRule }, { borderBottomColor: 'transparent' }], { duration: 120, easing: EASE_IN }),
        play(surface, [{ clipPath: full, backgroundColor: GROUND }, { backgroundColor: LIFTED, offset: 0.65 }, { clipPath: clip, backgroundColor: bg }], { duration: CLOSE_MS, easing: EASE_DRAWER, delay: 60 }),
        play(h1, [{ transform: 'none', opacity: 1 }, { opacity: 1, offset: 0.5 }, { opacity: 0, offset: 0.85 }, { transform: toCard, opacity: 0 }], { duration: CLOSE_MS, easing: EASE_DRAWER, delay: 60 }),
        play(title, [{ transform: fromHeading, opacity: 0 }, { opacity: 0, offset: 0.5 }, { opacity: 1, offset: 0.85 }, { transform: 'none', opacity: 1 }], { duration: CLOSE_MS, easing: EASE_DRAWER, delay: 60 }),
        // The copy — thumbnail and all — fades in where the card already is
        // over most of the move, so the page closes around it rather than
        // uncovering it at the end. It is never scaled.
        play(copy, [{ opacity: 0 }, { opacity: 1 }], { duration: CLOSE_MS * 0.65, easing: 'ease-out', delay: 60 + CLOSE_MS * 0.35 }),
        ...moved.map(({ el, dy }) =>
          play(el, [{ transform: `translateY(${dy}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 380, easing: EASE_OUT, delay: 120 })),
      ]);
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
