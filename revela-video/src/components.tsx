import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BG, BG_GLOW, sora } from "./theme";

export const Backdrop: React.FC<{ glow?: string; children?: React.ReactNode }> = ({ glow = BG_GLOW, children }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 70% 60% at 50% 45%, ${glow} 0%, ${BG} 75%)`,
      fontFamily: sora,
    }}
  >
    {children}
  </AbsoluteFill>
);

/** Fade + rise in, starting at `delay` frames. */
export const Rise: React.FC<{ delay?: number; distance?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  delay = 0,
  distance = 24,
  style,
  children,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - delay, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return <div style={{ opacity: t, transform: `translateY(${(1 - t) * distance}px)`, ...style }}>{children}</div>;
};

// The glow renders are 1344×768 with the wand centred and a tool watermark in
// the bottom-right corner. Showing only the middle 600×700 crops it out.
const SRC_W = 1344;
const CROP_X = 372;
const CROP_W = 600;
const CROP_H = 700;

export const WandShot: React.FC<{ src: string; height: number; opacity?: number; filter?: string }> = ({
  src,
  height,
  opacity = 1,
  filter,
}) => {
  const s = height / CROP_H;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity }}>
      <Img
        src={staticFile(src)}
        style={{ position: "absolute", width: SRC_W * s, left: -CROP_X * s, top: 0, filter }}
      />
    </div>
  );
};

export const wandFrameSize = (height: number) => ({ width: (CROP_W / CROP_H) * height, height });
