import {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {loadFont as loadInterTight} from '@remotion/google-fonts/InterTight';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';

export const F = {
  display: loadInterTight('normal', {weights: ['600', '700', '800'], subsets: ['latin']}).fontFamily,
  body: loadInter('normal', {weights: ['400', '500', '600'], subsets: ['latin']}).fontFamily,
  mono: loadMono('normal', {weights: ['400', '500', '600'], subsets: ['latin']}).fontFamily,
  texMain: 'KaTeX_Main',
  texMath: 'KaTeX_Math',
};

// KaTeX-Schriften kommen über das CSS und müssen vor dem ersten Frame geladen sein
export const useTexFonts = () => {
  const [handle] = useState(() => delayRender('KaTeX-Schriften'));
  useEffect(() => {
    Promise.all([
      document.fonts.load('48px KaTeX_Main'),
      document.fonts.load('bold 48px KaTeX_Main'),
      document.fonts.load('italic 48px KaTeX_Math'),
      document.fonts.load('48px KaTeX_Size1'),
      document.fonts.load('48px KaTeX_Size2'),
      document.fonts.load('48px KaTeX_Size3'),
    ]).then(() => continueRender(handle));
  }, [handle]);
};
