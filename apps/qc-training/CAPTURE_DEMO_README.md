# Feedback Capture Prototype

Last updated: May 1, 2026.

This replaces the failed screen-capture-first prototype with a lower-friction app feedback flow.

## Why This Direction

Browser screen capture through `getDisplayMedia` always shows a picker, cannot persist permission, and can fail in ways that feel hostile for consumer users. MDN documents that the browser must prompt every time and that the call requires user activation:

https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia

For day-to-day product/design/course QA, the better baseline is an app-native feedback bundle:

- User comment
- Optional email
- Category
- Current URL/path/title
- Viewport and browser metadata
- Recent app actions
- Best-effort app screenshot

This does not capture the operating system desktop, other apps, or browser chrome. That is the tradeoff that removes the screen picker.

## How To Run

```bash
AUTH_DISABLED=true pnpm dev:qc
```

Open:

```text
http://localhost:5174/capture-demo
```

Submissions are written to:

```text
server/uploads/feedback
```

Override the storage location:

```bash
FEEDBACK_CAPTURE_DIR=/absolute/path AUTH_DISABLED=true pnpm dev:qc
```

## Implementation

Frontend:

```ts
import { submitFeedback } from './src/capture';

await submitFeedback({
  message: 'The course slide spacing feels cramped.',
  category: 'design',
  includeScreenshot: true,
});
```

Backend:

```text
POST /api/v2/feedback
GET  /api/v2/feedback/info
```

The screenshot is rendered with `html-to-image`, which serializes the app DOM into an image. That is intentionally different from OS screen capture.

## Known Limits

The screenshot is best effort. Browser security rules still apply: cross-origin images, tainted canvas content, video frames, and some iframe content may be blank or fail. MDN documents the underlying tainted-canvas restriction:

https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image

This is not a video. For replay/video-like debugging without user friction, evaluate Sentry Replay, OpenReplay, or rrweb:

- Sentry Replay: https://docs.sentry.dev/product/explore/session-replay/web/getting-started/
- Sentry User Feedback screenshots: https://sentry.io/changelog/user-feedback-widget-screenshots/
- OpenReplay Session Replay: https://docs.openreplay.com/en/session-replay/
- rrweb: https://github.com/rrweb-io/rrweb

For true desktop recording, keep a separate advanced “Record Screen” path using `getDisplayMedia`, Loom SDK, a browser extension, or a native helper. Those options still involve either a browser picker, third-party hosting, or installation friction.
