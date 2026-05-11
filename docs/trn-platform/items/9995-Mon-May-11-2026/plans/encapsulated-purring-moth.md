# Plan: switch image-drop hook to script runner

## Context

The AI hook (claude-haiku-4-5) hangs on "thinking" indefinitely. Root cause: using AI for
a 100% deterministic task (fill placeholder → update state → copy/move files). No AI
reasoning is needed. hooksai has a first-class **script runner** that invokes a plain Node.js
script instead of an AI model — fast, reliable, no API calls.

---

## How the script runner works

- `runner: image-drop.js` in the hook frontmatter (filename only, `.js` suffix = script)
- hooksai resolves it to `.hooksai/scripts/image-drop.js`
- Invokes: `node /full/path/.hooksai/scripts/image-drop.js --hook=<json>`
- `--hook` JSON: `{ hookName, diff, fileInfo: { changeTypes, filenames, filepaths } }`
  - `filenames` = basenames, `filepaths` = full absolute paths
- stdout → TUI as "Script output: ..."
- Non-zero exit → error status in TUI

---

## Files to change

### 1. `.hooksai/on-change/image-drop.hook.md`
- Change `runner: claude-haiku-4-5` → `runner: image-drop.js`
- Remove `pre_processing_script` (script handles everything)
- Remove `permissions` block (script runs as Node, not through AI tool system)
- Remove the prompt body (scripts don't use prompts)
- Keep only: `description`, `glob`, `runner`

```yaml
---
description: 'Fill image placeholders as images are dropped into drop/'
glob: 'drop/**'
runner: image-drop.js
---
```

### 2. `.hooksai/scripts/image-drop.js` (NEW — replaces pre-process script)

Full logic in one script:

```js
#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, renameSync, unlinkSync } from 'fs';
import { basename, join } from 'path';
import { execSync } from 'child_process';

const STATE_PATH    = '.hooksai/state.json';
const PENDING_PATH  = '.hooksai/pending-doc-name.txt';
const TEMPLATE_PATH = 'template.md';
const DESTINATION   = '/mnt/c/Users/lmiller/Documents/inner-agility.dev/trn-platform/docs/trn-platform/items/auto';

// Parse --hook arg
const hookArg = process.argv.find(a => a.startsWith('--hook='));
const payload = JSON.parse(hookArg.slice(7));
const { fileInfo } = payload;

// Filter to actual image files in drop/
const IMAGE_EXTS = new Set(['.png','.jpg','.jpeg','.gif','.webp','.PNG','.JPG','.JPEG']);
const droppedFiles = (fileInfo?.filepaths ?? []).filter(p => {
  const ext = '.' + p.split('.').pop();
  return p.includes('drop/') && IMAGE_EXTS.has(ext) && !p.endsWith('.gitkeep');
});

if (droppedFiles.length === 0) process.exit(0);
const droppedFile = droppedFiles[0];
const droppedName = basename(droppedFile);

// Load or initialize state
let state;
if (existsSync(STATE_PATH)) {
  state = JSON.parse(readFileSync(STATE_PATH, 'utf-8'));
} else {
  if (!existsSync(PENDING_PATH)) {
    console.error('No pending-doc-name.txt. Use [d] in test-drop CLI first.');
    process.exit(1);
  }
  const docName = readFileSync(PENDING_PATH, 'utf-8').trim();
  const outputFile = `${docName}.md`;
  const template = readFileSync(TEMPLATE_PATH, 'utf-8');
  writeFileSync(outputFile, template.replace('DOCUMENT_TITLE', docName));
  unlinkSync(PENDING_PATH);
  state = { count: 0, documentName: docName, outputFile, images: [] };
}

// Fill next placeholder
const slot = state.count + 1;
let content = readFileSync(state.outputFile, 'utf-8');
content = content.replace(`IMAGE_PLACEHOLDER_${slot}`, droppedName);
writeFileSync(state.outputFile, content);

// Update state
state.count += 1;
state.images.push(droppedFile);
writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));

console.log(`Filled slot ${slot} with ${droppedName} (${state.count}/5)`);

// Finalize on 5th image
if (state.count === 5) {
  mkdirSync(join(DESTINATION, 'images'), { recursive: true });
  for (const img of state.images) {
    copyFileSync(img, join(DESTINATION, 'images', basename(img)));
  }
  renameSync(state.outputFile, join(DESTINATION, state.outputFile));
  unlinkSync(STATE_PATH);
  console.log(`Done! Moved ${state.outputFile} and 5 images to ${DESTINATION}`);
}
```

### 3. `.hooksai/scripts/image-drop.pre-process.js` — DELETE (no longer needed)

---

## Verification

1. Restart hooksai in `~/sandbox/image-collector`
2. In test CLI: `[d]` → name → `[n]`
3. TUI should show "Script output: Filled slot 1 with <filename> (1/5)" within ~1 second
4. `[s]` in test CLI → confirms state.json has count=1
5. Repeat `[n]` 4 more times
6. After 5th: TUI shows "Done! Moved..." and `auto/` has the .md + images
