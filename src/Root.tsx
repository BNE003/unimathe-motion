import React from 'react';
import {Composition} from 'remotion';
import {Video, VideoProps} from './Video';
import {FPS, H, W} from './theme';
import {TOTAL} from './timeline';
import {VideoVR, VRProps} from './vr/Video';
import {TOTAL as TOTAL_VR} from './vr/timeline';
import {KUProps, VideoKU} from './ku/Video';
import {TOTAL as TOTAL_KU} from './ku/timeline';
import {EKGProps, VideoEKG} from './ekg/Video';
import {TOTAL as TOTAL_EKG} from './ekg/timeline';

const base = {component: Video, durationInFrames: Math.round(TOTAL * FPS), fps: FPS, width: W, height: H};

const baseVR = {component: VideoVR, durationInFrames: Math.round(TOTAL_VR * FPS), fps: FPS, width: W, height: H};

const baseKU = {component: VideoKU, durationInFrames: Math.round(TOTAL_KU * FPS), fps: FPS, width: W, height: H};

const baseEKG = {component: VideoEKG, durationInFrames: Math.round(TOTAL_EKG * FPS), fps: FPS, width: W, height: H};

export const Root: React.FC = () => (
  <>
    <Composition id="Eigenvektoren" {...base} defaultProps={{music: true, voice: true} as VideoProps} />
    <Composition id="Eigenvektoren-ohneMusik" {...base} defaultProps={{music: false, voice: true} as VideoProps} />
    <Composition id="Vektorraeume" {...baseVR} defaultProps={{music: true, voice: true} as VRProps} />
    <Composition id="Vektorraeume-ohneMusik" {...baseVR} defaultProps={{music: false, voice: true} as VRProps} />
    <Composition id="Klausur-Unterraum" {...baseKU} defaultProps={{music: true, voice: true} as KUProps} />
    <Composition id="Klausur-Unterraum-ohneMusik" {...baseKU} defaultProps={{music: false, voice: true} as KUProps} />
    <Composition id="EKG-Fourier" {...baseEKG} defaultProps={{music: true, voice: true} as EKGProps} />
    <Composition id="EKG-Fourier-ohneMusik" {...baseEKG} defaultProps={{music: false, voice: true} as EKGProps} />
    <Composition id="EKG-Fourier-Vorschau" {...baseEKG} defaultProps={{music: true, voice: false} as EKGProps} />
    <Composition id="EKG-Fourier-stumm" {...baseEKG} defaultProps={{music: false, voice: false} as EKGProps} />
  </>
);
