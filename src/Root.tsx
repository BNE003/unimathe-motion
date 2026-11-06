import React from 'react';
import {Composition} from 'remotion';
import {Video, VideoProps} from './Video';
import {FPS, H, W} from './theme';
import {TOTAL} from './timeline';
import {VideoVR, VRProps} from './vr/Video';
import {TOTAL as TOTAL_VR} from './vr/timeline';
import {KUProps, VideoKU} from './ku/Video';
import {TOTAL as TOTAL_KU} from './ku/timeline';
import {SKProps, VideoSK} from './sk/Video';
import {TOTAL as TOTAL_SK} from './sk/timeline';

const base = {component: Video, durationInFrames: Math.round(TOTAL * FPS), fps: FPS, width: W, height: H};

const baseVR = {component: VideoVR, durationInFrames: Math.round(TOTAL_VR * FPS), fps: FPS, width: W, height: H};

const baseKU = {component: VideoKU, durationInFrames: Math.round(TOTAL_KU * FPS), fps: FPS, width: W, height: H};

const baseSK = {component: VideoSK, durationInFrames: Math.round(TOTAL_SK * FPS), fps: FPS, width: W, height: H};

export const Root: React.FC = () => (
  <>
    <Composition id="Eigenvektoren" {...base} defaultProps={{music: true, voice: true} as VideoProps} />
    <Composition id="Eigenvektoren-ohneMusik" {...base} defaultProps={{music: false, voice: true} as VideoProps} />
    <Composition id="Vektorraeume" {...baseVR} defaultProps={{music: true, voice: true} as VRProps} />
    <Composition id="Vektorraeume-ohneMusik" {...baseVR} defaultProps={{music: false, voice: true} as VRProps} />
    <Composition id="Klausur-Unterraum" {...baseKU} defaultProps={{music: true, voice: true} as KUProps} />
    <Composition id="Klausur-Unterraum-ohneMusik" {...baseKU} defaultProps={{music: false, voice: true} as KUProps} />
    <Composition id="Skalarprodukt-90" {...baseSK} defaultProps={{music: true, voice: true} as SKProps} />
    <Composition id="Skalarprodukt-90-ohneMusik" {...baseSK} defaultProps={{music: false, voice: true} as SKProps} />
  </>
);
