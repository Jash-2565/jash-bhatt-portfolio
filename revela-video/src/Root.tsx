import React from "react";
import { Composition } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { EndCard, Hook, HowItWorks, Montage, Reveal } from "./scenes";
import { AllFound, PHASE_LEN, Proximity } from "./walk";
import { FPS, TRANSITION } from "./theme";

type Scene = { C: React.FC; frames: number };

const sequence = (scenes: Scene[]) => {
  const Comp: React.FC = () => (
    <TransitionSeries>
      {scenes.flatMap(({ C, frames }, i) => [
        <TransitionSeries.Sequence key={`s${i}`} durationInFrames={frames}>
          <C />
        </TransitionSeries.Sequence>,
        ...(i < scenes.length - 1
          ? [<TransitionSeries.Transition key={`t${i}`} presentation={fade()} timing={linearTiming({ durationInFrames: TRANSITION })} />]
          : []),
      ])}
    </TransitionSeries>
  );
  const total = scenes.reduce((n, s) => n + s.frames, 0) - TRANSITION * (scenes.length - 1);
  return { Comp, total };
};

const PROXIMITY = PHASE_LEN * 4;

const promo = sequence([
  { C: Hook, frames: 105 },
  { C: Reveal, frames: 90 },
  { C: Proximity, frames: PROXIMITY },
  { C: AllFound, frames: 90 },
  { C: HowItWorks, frames: 120 },
  { C: Montage, frames: 100 },
  { C: EndCard, frames: 105 },
]);

const short = sequence([
  { C: Reveal, frames: 60 },
  { C: Proximity, frames: PROXIMITY },
  { C: EndCard, frames: 90 },
]);

export const Root: React.FC = () => (
  <>
    <Composition id="RevelaPromo" component={promo.Comp} durationInFrames={promo.total} fps={FPS} width={1920} height={1080} />
    <Composition id="RevelaShort" component={short.Comp} durationInFrames={short.total} fps={FPS} width={1920} height={1080} />
  </>
);
