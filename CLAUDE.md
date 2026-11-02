# UniMathe Motion – Erklärvideos

Remotion-Projekt für 9:16-Mathe-Erklärvideos (Marketing für die iOS-App UniMathe).

## Git-Workflow: ein Branch pro Video

- `main` enthält die gemeinsame Basis (Theme, UI-Bausteine, tools/, Outro/CTA) und alle fertigen Videos.
- Jedes neue Video bekommt vor dem ersten Code einen eigenen Branch von `main`: `video/<thema>`, z. B. `video/klausur-unterraum`.
- Code eines Videos liegt in einem eigenen Ordner (`src/<kürzel>/`), Storyboard als `storyboard-<thema>.md` im Projektordner.
- Varianten eines Videos (z. B. andere Sprache) entstehen als Branch vom Video-Branch: `video/<thema>-<sprache>`, z. B. `video/klausur-unterraum-en`.
- Änderungen an gemeinsamen Dateien (src/theme.ts, src/ui.tsx, src/scenes/outro.tsx, tools/) erst nach `main` bringen, dann in die Video-Branches mergen, damit ältere Videos nicht kaputtgehen.
- `out/` (Renders) und `node_modules/` werden nicht eingecheckt. Stimmen (public/voice/) und Musik werden eingecheckt, weil sie Credits kosten bzw. zum Rendern nötig sind.

## Rendern

- Nie `npx remotion render`, sondern `node tools/render.mjs <Composition> <out.mp4>`.
- Standbilder: `COMP=<id> node tools/stills.mjs <dir> <sekunden…>`.
