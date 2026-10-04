import React from "react";
import { AbsoluteFill, Easing, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Rise, WandShot, wandFrameSize } from "./components";
import { BG, CREAM, MUTED, STATES, sora } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FLOOR = 860;
const rad = (d: number) => (d * Math.PI) / 180;
// interpolateColors() returns rgba(), so alpha can't be appended as hex.
const alpha = (c: string, a: number) => {
  if (c.startsWith("#")) {
    const n = parseInt(c.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  }
  const [r, g, b] = c.match(/[\d.]+/g)!.map(Number);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};
const WAND_SCALE = 1.5;
// Direction of a limb at angle `a` (0 = straight down, positive = swung back).
const dir = (a: number) => ({ x: -Math.sin(rad(a)), y: Math.cos(rad(a)) });

/* ---------------- the room ---------------- */

type BeaconLight = { color: string; strength: number } | null;

const ObjectBeacon: React.FC<{ x: number; y: number; light: BeaconLight; check?: number }> = ({ x, y, light, check = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    {light ? <circle r={34 + 10 * light.strength} fill={light.color} opacity={0.25 * light.strength} /> : null}
    <rect x={-17} y={-6} width={34} height={14} rx={4} fill="#b22a24" />
    <ellipse cx={0} cy={-6} rx={17} ry={6} fill={light ? "#fff3dc" : "#d9bf91"} />
    <path d="M-4 -9 h8 v3 q0 3 -4 4 q-4 -1 -4 -4 z" fill="#b22a24" />
    {check > 0 ? (
      <g transform={`translate(20 -26) scale(${check})`}>
        <circle r={16} fill={STATES.all.color} />
        <path d="M-7 0 l5 5 l9 -10" stroke={BG} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ) : null}
  </g>
);

export type RoomBeacons = { shoe: BeaconLight; teddy: BeaconLight; backpack: BeaconLight; checks?: [number, number, number] };

const Room: React.FC<RoomBeacons> = ({ shoe, teddy, backpack, checks = [0, 0, 0] }) => (
  <g>
    {/* wall + floor */}
    <rect width={1920} height={FLOOR} fill="#2b0f0b" />
    {Array.from({ length: 24 }).map((_, i) => (
      <rect key={i} x={i * 80 + 30} y={0} width={20} height={FLOOR} fill="#ffffff" opacity={0.018} />
    ))}
    <rect y={FLOOR - 18} width={1920} height={18} fill="#3c1511" />
    <rect y={FLOOR} width={1920} height={220} fill="#1d0907" />
    {Array.from({ length: 8 }).map((_, i) => (
      <line key={i} x1={0} x2={1920} y1={FLOOR + 22 + i * i * 4} y2={FLOOR + 22 + i * i * 4} stroke="#000" strokeOpacity={0.25} strokeWidth={2} />
    ))}
    <ellipse cx={960} cy={FLOOR + 90} rx={520} ry={60} fill="#3a1713" />
    <ellipse cx={960} cy={FLOOR + 90} rx={470} ry={48} fill="none" stroke="#5a2a20" strokeWidth={6} strokeDasharray="18 14" />

    {/* window with moon */}
    <rect x={800} y={150} width={280} height={330} rx={10} fill="#4a1d16" />
    <rect x={818} y={168} width={244} height={294} fill="#141c36" />
    <circle cx={1010} cy={230} r={34} fill="#f3e6c4" />
    {[
      [860, 210],
      [900, 300],
      [1030, 330],
      [940, 400],
      [870, 380],
    ].map(([x, y]) => (
      <circle key={`${x}`} cx={x} cy={y} r={2.5} fill="#f3e6c4" opacity={0.8} />
    ))}
    <rect x={937} y={168} width={6} height={294} fill="#4a1d16" />
    <rect x={818} y={312} width={244} height={6} fill="#4a1d16" />
    <path d="M790 140 h300 v24 h-300 z" fill="#5a2219" />
    <path d="M800 160 q-30 160 -10 340 l40 0 q-20 -170 0 -340 z" fill="#6a2a1f" />
    <path d="M1080 160 q30 160 10 340 l-40 0 q20 -170 0 -340 z" fill="#6a2a1f" />

    {/* bed */}
    <rect x={30} y={430} width={40} height={430} rx={10} fill="#4a1d16" />
    <rect x={30} y={430} width={300} height={36} rx={14} fill="#55231a" />
    <rect x={50} y={620} width={520} height={110} rx={18} fill="#5c2a20" />
    <rect x={60} y={598} width={180} height={50} rx={24} fill="#d8c2a6" opacity={0.55} />
    <path d="M200 610 h360 q20 0 20 20 v110 h-380 z" fill="#7a3328" />
    <rect x={540} y={700} width={30} height={160} rx={8} fill="#4a1d16" />

    {/* shoe under the bed */}
    <g transform="translate(150 846)">
      <path d="M-50 10 q0 -30 30 -30 q20 0 30 14 q30 4 40 16 v10 h-100 z" fill="#3b5a8c" />
      <rect x={-52} y={8} width={104} height={8} rx={4} fill="#e9e2d4" />
    </g>
    <ObjectBeacon x={150} y={822} light={shoe} check={checks[0]} />

    {/* shelf with teddy and books */}
    <rect x={1120} y={540} width={300} height={16} rx={4} fill="#5a2219" />
    {[
      [1140, 70, "#7b3a2c"],
      [1168, 82, "#a8662f"],
      [1198, 64, "#4f6a8a"],
      [1222, 76, "#8c3b3b"],
    ].map(([x, h, c]) => (
      <rect key={x as number} x={x as number} y={540 - (h as number)} width={24} height={h as number} rx={3} fill={c as string} />
    ))}
    <g transform="translate(1330 540)">
      <ellipse cx={0} cy={-38} rx={40} ry={38} fill="#8a5a3c" />
      <circle cx={0} cy={-98} r={30} fill="#8a5a3c" />
      <circle cx={-24} cy={-122} r={12} fill="#8a5a3c" />
      <circle cx={24} cy={-122} r={12} fill="#8a5a3c" />
      <ellipse cx={0} cy={-90} rx={13} ry={10} fill="#c49a74" />
      <circle cx={-10} cy={-104} r={3.5} fill="#1a0a06" />
      <circle cx={10} cy={-104} r={3.5} fill="#1a0a06" />
    </g>
    <ObjectBeacon x={1330} y={505} light={teddy} check={checks[1]} />

    {/* backpack */}
    <g transform="translate(1690 860)">
      <path d="M-70 0 v-150 q0 -50 70 -50 q70 0 70 50 v150 z" fill="#2f6b5e" />
      <path d="M-30 -200 q30 -40 60 0" stroke="#24544a" strokeWidth={12} fill="none" />
      <rect x={-52} y={-90} width={104} height={70} rx={16} fill="#3b8574" />
      <rect x={-52} y={-90} width={104} height={8} rx={4} fill="#24544a" />
    </g>
    <ObjectBeacon x={1690} y={-50 + 860} light={backpack} check={checks[2]} />
  </g>
);

/* ---------------- the wand ---------------- */

const Wand: React.FC<{ color: string; glow: number }> = ({ color, glow }) => {
  // Two red strands twisting up from the orb to a point, like the render.
  const strand = (phase: number) =>
    Array.from({ length: 24 }, (_, i) => {
      const t = i / 23;
      const amp = 9 * (1 - t) ** 1.2;
      return `${i === 0 ? "M" : "L"}${(amp * Math.sin(t * 9 + phase)).toFixed(1)} ${(-62 - t * 110).toFixed(1)}`;
    }).join(" ");
  return (
    <g>
      {/* handle, held in the fist */}
      <rect x={-9} y={-44} width={18} height={66} rx={7} fill="#3a2418" />
      {[-34, -22, -10, 2, 14].map((y) => (
        <line key={y} x1={-9} x2={9} y1={y} y2={y + 6} stroke="#5a3a26" strokeWidth={2} />
      ))}
      <rect x={-11} y={-48} width={22} height={6} rx={3} fill="#e9c9a2" />
      {/* orb */}
      <circle cy={-56} r={24 * glow} fill={color} opacity={0.7} style={{ filter: "blur(10px)" }} />
      <circle cy={-56} r={13} fill={color} />
      <circle cy={-58} r={6} fill="#fff" opacity={0.75} />
      {/* twisted tip */}
      <path d={strand(0)} stroke="#d2322b" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d={strand(Math.PI)} stroke="#a8221d" strokeWidth={5} fill="none" strokeLinecap="round" />
    </g>
  );
};

/* ---------------- the child ---------------- */

type ChildProps = { x: number; phase: number; walk: number; color: string; glow: number; raise: number };

const SKIN = "#c98a62";
const SKIN_SHADE = "#a9704f";

const Leg: React.FC<{ thigh: number; knee: number; front: boolean }> = ({ thigh, knee, front }) => {
  const pants = front ? "#3b5a8c" : "#2d4670";
  return (
    <g transform={`rotate(${thigh})`}>
      <rect x={-15} y={-6} width={30} height={92} rx={14} fill={pants} />
      <g transform={`translate(0 84) rotate(${knee})`}>
        <rect x={-13} y={-6} width={26} height={78} rx={12} fill={pants} />
        <rect x={-12} y={62} width={24} height={12} rx={5} fill="#f1ece2" />
        <g transform={`translate(0 76) rotate(${-(thigh + knee)})`}>
          <path d="M-16 -6 h26 q24 0 28 14 v6 h-54 z" fill={front ? "#e94b3c" : "#c23b30"} />
          <rect x={-16} y={10} width={56} height={6} rx={3} fill="#f1ece2" />
        </g>
      </g>
    </g>
  );
};

const THIGH = 84;
const SHIN = 76;
const FOOT = 16;

const Child: React.FC<ChildProps> = ({ x, phase, walk, color, glow, raise }) => {
  const A = 26 * walk;
  const legs = [phase, phase + Math.PI].map((p) => {
    const thigh = -A * Math.sin(p);
    const knee = walk * (6 + 34 * Math.max(0, Math.cos(p)));
    const reach = THIGH * Math.cos(rad(thigh)) + SHIN * Math.cos(rad(thigh + knee));
    return { thigh, knee, reach };
  });
  // Keep the planted foot on the floor.
  const hipY = FLOOR - Math.max(legs[0].reach, legs[1].reach) - FOOT;
  const torsoTop = hipY - 140;
  const shoulder = { x: 4, y: torsoTop + 22 };

  // Wand arm: upper arm forward-down, forearm pointing forward and up.
  const a1 = -38 - 25 * raise;
  const a2 = -112 - 20 * raise;
  const d1 = dir(a1);
  const elbow = { x: shoulder.x + 56 * d1.x, y: shoulder.y + 56 * d1.y };
  const d2 = dir(a2);
  const hand = { x: elbow.x + 52 * d2.x, y: elbow.y + 52 * d2.y };
  const wandAngle = 42 - 10 * raise;

  const backSwing = 24 * walk * Math.sin(phase);
  const headY = torsoTop - 60;

  return (
    <g transform={`translate(${x} 0)`}>
      {/* back arm */}
      <g transform={`translate(${shoulder.x} ${shoulder.y}) rotate(${backSwing})`}>
        <rect x={-12} y={-8} width={24} height={62} rx={11} fill="#c8862f" />
        <g transform={`translate(0 52) rotate(${-14 - 10 * walk})`}>
          <rect x={-10} y={-4} width={20} height={52} rx={10} fill={SKIN_SHADE} />
          <circle cy={52} r={12} fill={SKIN_SHADE} />
        </g>
      </g>

      {/* legs: back one first */}
      <g transform={`translate(0 ${hipY})`}>
        <Leg thigh={legs[1].thigh} knee={legs[1].knee} front={false} />
        <Leg thigh={legs[0].thigh} knee={legs[0].knee} front />
      </g>

      {/* torso */}
      <g transform={`translate(0 ${hipY}) rotate(4)`}>
        <path d="M-40 6 q-4 -70 6 -128 q34 -22 66 0 q12 58 6 128 z" fill="#e8a33d" />
        <path d="M-41 -40 h82 v14 h-82 z" fill="#d38c2b" />
        <rect x={-42} y={-4} width={84} height={22} rx={8} fill="#3b5a8c" />
      </g>

      {/* head */}
      <g transform={`translate(10 ${headY})`}>
        <rect x={-10} y={36} width={20} height={26} fill={SKIN_SHADE} />
        <circle cx={-10} cy={-10} r={60} fill="#2b1a14" />
        <circle r={56} fill={SKIN} />
        <circle cx={-14} cy={6} r={11} fill={SKIN_SHADE} />
        <path d="M-62 4 C-66 -66 44 -86 60 -16 C44 -30 26 -24 12 -36 C2 -20 -24 -22 -36 -4 C-44 8 -54 10 -62 4 Z" fill="#2b1a14" />
        <ellipse cx={34} cy={-2} rx={5.5} ry={7.5} fill="#1a0d08" />
        <circle cx={36} cy={-5} r={2} fill="#fff" />
        <path d="M26 -16 q8 -5 16 -1" stroke="#2b1a14" strokeWidth={3} fill="none" strokeLinecap="round" />
        <circle cx={28} cy={16} r={9} fill="#e0705a" opacity={0.45} />
        <path d="M55 4 q6 5 1 9" stroke={SKIN_SHADE} strokeWidth={3} fill="none" strokeLinecap="round" />
        <path d="M36 26 q9 7 17 -2" stroke="#6b2b1f" strokeWidth={3.5} fill="none" strokeLinecap="round" />
      </g>

      {/* wand, then the arm holding it on top */}
      <g transform={`translate(${hand.x} ${hand.y}) rotate(${wandAngle}) scale(${WAND_SCALE})`}>
        <Wand color={color} glow={glow} />
      </g>
      <g transform={`translate(${shoulder.x} ${shoulder.y}) rotate(${a1})`}>
        <rect x={-13} y={-8} width={26} height={62} rx={12} fill="#e8a33d" />
        <g transform={`translate(0 56) rotate(${a2 - a1})`}>
          <rect x={-10} y={-4} width={20} height={54} rx={10} fill={SKIN} />
        </g>
      </g>
      <circle cx={hand.x} cy={hand.y} r={13} fill={SKIN} />
    </g>
  );
};

/** Where the orb ends up on screen, so the room light can follow it. */
const orbPosition = (x: number, raise: number, walk: number, phase: number) => {
  // Mirrors the geometry in <Child>; recomputed rather than measured from the DOM.
  const A = 26 * walk;
  const reach = Math.max(
    ...[phase, phase + Math.PI].map((p) => {
      const thigh = -A * Math.sin(p);
      const knee = walk * (6 + 34 * Math.max(0, Math.cos(p)));
      return THIGH * Math.cos(rad(thigh)) + SHIN * Math.cos(rad(thigh + knee));
    }),
  );
  const torsoTop = FLOOR - reach - FOOT - 140;
  const s = { x: 4, y: torsoTop + 22 };
  const d1 = dir(-38 - 25 * raise);
  const d2 = dir(-112 - 20 * raise);
  const hx = s.x + 56 * d1.x + 52 * d2.x;
  const hy = s.y + 56 * d1.y + 52 * d2.y;
  const w = rad(42 - 10 * raise);
  return { x: x + hx + 56 * WAND_SCALE * Math.sin(w), y: hy - 56 * WAND_SCALE * Math.cos(w) };
};

/* ---------------- shared scene chrome ---------------- */

const Light: React.FC<{ x: number; y: number; color: string; strength: number }> = ({ x, y, color, strength }) => (
  <>
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle ${600 * strength}px at ${x}px ${y}px, ${alpha(color, 0.5)} 0%, ${alpha(color, 0.16)} 45%, transparent 75%)`,
        mixBlendMode: "screen",
      }}
    />
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse ${320 * strength}px 50px at ${x}px ${FLOOR + 14}px, ${alpha(color, 0.45)} 0%, transparent 100%)`,
        mixBlendMode: "screen",
      }}
    />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 75% at 50% 50%, transparent 55%, rgba(10,2,1,0.55) 100%)" }} />
  </>
);

const INSET_H = 250;

const Inset: React.FC<{ layers: { src: string; opacity: number; filter?: string }[] }> = ({ layers }) => {
  const { width, height } = wandFrameSize(INSET_H);
  return (
    <div style={{ position: "absolute", right: 60, top: 56, textAlign: "center" }}>
      <div
        style={{
          width,
          height,
          borderRadius: 18,
          overflow: "hidden",
          position: "relative",
          background: BG,
          border: "2px solid rgba(255,255,255,0.14)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.5)",
        }}
      >
        {layers.map((l) => (
          <WandShot key={l.src} src={l.src} height={INSET_H} opacity={l.opacity} filter={l.filter} />
        ))}
      </div>
      <div style={{ fontSize: 20, color: MUTED, marginTop: 10, letterSpacing: 2, textTransform: "uppercase" }}>The real wand</div>
    </div>
  );
};

/* ---------------- 3. Proximity: walking to the backpack ---------------- */

const PHASES = [STATES.far, STATES.approaching, STATES.near, STATES.found];
export const PHASE_LEN = 60;
const START_X = 330;
const END_X = 1500;
const ARRIVE = 3 * PHASE_LEN;
const STRIDE = 150;
// How far the wand lifts on arrival; higher and the tip reaches the inset.
const RAISE = 0.4;

export const Proximity: React.FC = () => {
  const frame = useCurrentFrame();
  const phase = Math.min(PHASES.length - 1, Math.floor(frame / PHASE_LEN));

  const x = interpolate(frame, [0, ARRIVE - 24, ARRIVE + 4], [START_X, END_X - 70, END_X], clamp);
  const walk = interpolate(frame, [ARRIVE - 18, ARRIVE + 6], [1, 0], clamp);
  // Step phase follows distance travelled, so feet don't slide.
  const stepPhase = ((x - START_X) / STRIDE) * Math.PI * 2;
  const raise = interpolate(frame, [ARRIVE, ARRIVE + 14], [0, RAISE], { ...clamp, easing: Easing.out(Easing.cubic) });

  const color = interpolateColors(
    frame,
    PHASES.flatMap((_, i) => (i === 0 ? [0] : [i * PHASE_LEN - 10, i * PHASE_LEN])),
    PHASES.flatMap((p, i) => (i === 0 ? [p.color] : [PHASES[i - 1].color, p.color])),
  );
  const pulse = phase === 3 ? 0.5 + 0.5 * Math.sin((frame - ARRIVE) / 4.2) : 0;
  const glow = 1 + 0.6 * pulse;

  const orb = orbPosition(x, raise, walk, stepPhase);
  const layerOpacity = (i: number) => (i === 0 ? 1 : interpolate(frame, [i * PHASE_LEN - 10, i * PHASE_LEN], [0, 1], clamp));
  const labelPop = spring({ frame: frame - phase * PHASE_LEN, fps: 30, config: { damping: 14 } });

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: sora }}>
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <Room shoe={null} teddy={null} backpack={phase === 3 ? { color: "#ffffff", strength: 0.6 + 0.4 * pulse } : null} />
        <Child x={x} phase={stepPhase} walk={walk} color={color} glow={glow} raise={raise} />
      </svg>
      <Light x={orb.x} y={orb.y} color={color} strength={0.85 + 0.25 * pulse} />

      <div style={{ position: "absolute", left: 80, top: 64 }}>
        <Rise>
          <div style={{ fontSize: 26, color: MUTED, letterSpacing: 4, textTransform: "uppercase" }}>No numbers. No arrows.</div>
          <div style={{ fontSize: 60, color: CREAM, fontWeight: 700, letterSpacing: -1.2, marginTop: 6 }}>Distance becomes colour.</div>
        </Rise>
      </div>

      <Inset
        layers={PHASES.map((p, i) => ({
          src: p.img,
          opacity: layerOpacity(i),
          filter: i === 3 ? `brightness(${1 + 0.35 * pulse})` : undefined,
        }))}
      />

      <div style={{ position: "absolute", left: 80, bottom: 54, display: "flex", alignItems: "center", gap: 40 }}>
        <div
          style={{
            fontSize: 84,
            fontWeight: 700,
            color,
            letterSpacing: -2,
            minWidth: 520,
            transform: `scale(${0.85 + 0.15 * labelPop})`,
            transformOrigin: "left center",
            textShadow: `0 0 36px ${alpha(color, 0.55)}`,
          }}
        >
          {PHASES[phase].label}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {PHASES.map((p, i) => (
            <div
              key={p.label}
              style={{
                padding: "8px 20px",
                borderRadius: 999,
                fontSize: 22,
                fontWeight: 600,
                border: `2px solid ${i <= phase ? p.color : "rgba(255,255,255,0.18)"}`,
                color: i === phase ? BG : i < phase ? p.color : "rgba(255,255,255,0.4)",
                background: i === phase ? p.color : "rgba(0,0,0,0.25)",
              }}
            >
              {p.label}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- 4. All found ---------------- */

export const AllFound: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const purple = STATES.all.color;
  const pulse = 0.5 + 0.5 * Math.sin(frame / 5);
  const checks = [0, 1, 2].map((i) => spring({ frame: frame - 10 - i * 10, fps: 30, config: { damping: 12 } })) as [
    number,
    number,
    number,
  ];
  const lit = (i: number): BeaconLight => (checks[i] > 0.05 ? { color: purple, strength: 0.6 + 0.4 * pulse } : null);
  const zoom = interpolate(frame, [0, durationInFrames], [1.04, 1]);
  const orb = orbPosition(END_X, RAISE, 0, 0);

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: sora }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
          <Room shoe={lit(0)} teddy={lit(1)} backpack={lit(2)} checks={checks} />
          <Child x={END_X} phase={0} walk={0} color={purple} glow={1.2 + 0.3 * pulse} raise={RAISE} />
        </svg>
        <Light x={orb.x} y={orb.y} color={purple} strength={1.15} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 80, top: 64 }}>
        <Rise>
          <div style={{ fontSize: 84, color: purple, fontWeight: 700, letterSpacing: -2 }}>Found them all.</div>
          <div style={{ fontSize: 32, color: MUTED, marginTop: 8 }}>Purple means every beacon is home.</div>
        </Rise>
      </div>
      <Inset layers={[{ src: STATES.all.img, opacity: 1 }]} />
    </AbsoluteFill>
  );
};
