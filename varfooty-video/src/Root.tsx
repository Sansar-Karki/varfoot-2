import React from 'react';
import { Composition } from 'remotion';
import { VarFooty } from './Main';
import { DemoShort, DS_FPS, DS_TOTAL } from './DemoShort';
import { FPS, H, TOTAL_FRAMES, W } from './theme';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VarFooty"
        component={VarFooty}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="DemoShort"
        component={DemoShort}
        durationInFrames={DS_TOTAL}
        fps={DS_FPS}
        width={W}
        height={H}
      />
    </>
  );
};
