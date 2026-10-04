import React from "react";
import {
  AbsoluteFill,
  Img,
  Loop,
  OffthreadVideo,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Backdrop, Rise } from "./components";
import { BG, CREAM, MUTED, STATES, sora } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ---------- 1. Hook ---------- */

export const Hook: React.FC = () => {
  const lines = ["Kids lose things.", "They get told off for it.", "Nobody gives them a tool to fix it."];
  return (
    <AbsoluteFill style={{ background: "#120403", justifyContent: "center", paddingLeft: 220, fontFamily: sora }}>
      {lines.map((line, i) => (
        <Rise key={line} delay={8 + i * 24}>
          <div
            style={{
              fontSize: 76,
              fontWeight: i === 2 ? 700 : 300,
              color: i === 2 ? CREAM : MUTED,
              lineHeight: 1.35,
              letterSpacing: -1,
            }}
          >
            {line}
          </div>
        </Rise>
      ))}
    </AbsoluteFill>
  );
};

/* ---------- 2. Reveal ---------- */

export const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.07]);
  const fadeIn = interpolate(frame, [0, 20], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: BG, fontFamily: sora }}>
      <Img
        src={staticFile("Revela Hero Shot.webp")}
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale})`, opacity: fadeIn }}
      />
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 110 }}>
        <Rise delay={28}>
          <div style={{ fontSize: 46, color: CREAM, fontWeight: 400, textShadow: "0 2px 24px rgba(0,0,0,0.5)" }}>
            A wand that gets warmer as you get closer.
          </div>
        </Rise>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- 5. How it works ---------- */

// Exploded view is 1702×2400; the bottom ~450px is its printed legend, which
// is cropped off so the side labels don't compete with it.
const EXP_W = 1702;
const EXP_CROP_H = 1960;

export const HowItWorks: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const frameH = 940;
  const s = frameH / EXP_CROP_H;
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.06]);
  const rows = [
    ["ESP32-S3 microcontroller", "Reads signal strength, drives the light"],
    ["NeoPixel LEDs", "Colour and animation in under 100 ms"],
    ["3.7V Li-Po, charging, switch", "Lasts through play, fully enclosed"],
    ["ESP32 beacons", "One on each thing that goes missing"],
  ];
  return (
    <Backdrop>
      <div
        style={{
          position: "absolute",
          left: 170,
          top: (1080 - frameH) / 2,
          width: EXP_W * s,
          height: frameH,
          borderRadius: 28,
          overflow: "hidden",
          background: "#b89a94",
          boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
        }}
      >
        <Img
          src={staticFile("Exploded View.webp")}
          style={{ width: EXP_W * s, transform: `scale(${zoom})`, transformOrigin: "50% 40%" }}
        />
      </div>
      <div style={{ position: "absolute", left: 1000, top: 190, width: 800 }}>
        <Rise>
          <div style={{ fontSize: 30, color: MUTED, letterSpacing: 4, textTransform: "uppercase" }}>How it works</div>
          <div style={{ fontSize: 72, color: CREAM, fontWeight: 700, letterSpacing: -1.5, marginTop: 10 }}>
            A wand and its beacons.
          </div>
        </Rise>
        <div style={{ marginTop: 60 }}>
          {rows.map(([title, body], i) => (
            <Rise key={title} delay={14 + i * 12} distance={16}>
              <div style={{ display: "flex", gap: 26, alignItems: "baseline", marginBottom: 34 }}>
                <div style={{ fontSize: 26, color: STATES.far.color, fontWeight: 700, width: 34 }}>
                  0{i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 38, color: CREAM, fontWeight: 600 }}>{title}</div>
                  <div style={{ fontSize: 28, color: MUTED, marginTop: 4 }}>{body}</div>
                </div>
              </div>
            </Rise>
          ))}
        </div>
      </div>
    </Backdrop>
  );
};

/* ---------- 6. Montage ---------- */

export const Montage: React.FC = () => {
  const clips = [
    { src: "esp32-soldering.mp4", caption: "Soldering the ESP32", start: 30, loop: 0 },
    { src: "wand-creation.mp4", caption: "Building the wand", start: 0, loop: 76 },
    { src: "distance-testing.mp4", caption: "Tuning the distance response", start: 90, loop: 0 },
  ];
  const H = 720;
  const W = H * (480 / 848);
  return (
    <Backdrop>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 70 }}>
        <Rise>
          <div style={{ fontSize: 64, color: CREAM, fontWeight: 700, letterSpacing: -1.5 }}>
            Built, broken, rebuilt.
          </div>
        </Rise>
        <div style={{ display: "flex", gap: 48, marginTop: 50 }}>
          {clips.map((c, i) => {
            const video = <OffthreadVideo src={staticFile(c.src)} startFrom={c.start} muted style={{ width: W, height: H, objectFit: "cover" }} />;
            return (
              <Rise key={c.src} delay={4 + i * 6}>
                <div style={{ width: W, height: H, borderRadius: 22, overflow: "hidden", background: BG, position: "relative" }}>
                  {c.loop ? <Loop durationInFrames={c.loop}>{video}</Loop> : video}
                </div>
                <div style={{ fontSize: 26, color: MUTED, marginTop: 16, textAlign: "center" }}>{c.caption}</div>
              </Rise>
            );
          })}
        </div>
      </AbsoluteFill>
    </Backdrop>
  );
};

/* ---------- 7. End card ---------- */

// The "Revela" wordmark is baked into the hero render; this crops it out
// rather than re-setting it in a lookalike font.
const MARK = { x: 340, y: 390, w: 680, h: 280 };

export const EndCard: React.FC = () => {
  const scale = 1.25;
  return (
    <Backdrop>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <Rise>
          <div style={{ fontSize: 64, color: CREAM, fontWeight: 300, letterSpacing: -1 }}>
            No screens. No app. <span style={{ fontWeight: 700 }}>Just light.</span>
          </div>
        </Rise>
        <Rise delay={22}>
          <div
            style={{
              width: MARK.w * scale,
              height: MARK.h * scale,
              overflow: "hidden",
              position: "relative",
              margin: "40px auto 10px",
              WebkitMaskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 72%, transparent 100%)",
            }}
          >
            <Img
              src={staticFile("Revela Hero Shot.webp")}
              style={{ position: "absolute", width: 1920 * scale, left: -MARK.x * scale, top: -MARK.y * scale }}
            />
          </div>
        </Rise>
        <Rise delay={36}>
          <div style={{ fontSize: 30, color: MUTED, letterSpacing: 3, textTransform: "uppercase" }}>
            Tangible Interfaces · 2025
          </div>
          <div style={{ fontSize: 26, color: MUTED, opacity: 0.8, marginTop: 22 }}>
            Jash Bhatt with Khushii Mehta, Kaushal Gajipara and Parinita Shiralige
          </div>
        </Rise>
      </AbsoluteFill>
    </Backdrop>
  );
};
