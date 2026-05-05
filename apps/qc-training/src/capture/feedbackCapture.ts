import { toBlob } from 'html-to-image';

import { getRecentFeedbackActions, type FeedbackAction } from './actionTracker';

export interface SubmitFeedbackInput {
  message: string;
  email?: string;
  category?: 'bug' | 'design' | 'course' | 'other';
  includeScreenshot?: boolean;
}

export interface FeedbackSubmission {
  id: string;
  savedAt: string;
  screenshotSaved: boolean;
}

export interface FeedbackPayload {
  message: string;
  email?: string;
  category: 'bug' | 'design' | 'course' | 'other';
  page: {
    url: string;
    path: string;
    title: string;
  };
  viewport: {
    width: number;
    height: number;
    devicePixelRatio: number;
  };
  browser: {
    userAgent: string;
    language: string;
    platform: string;
  };
  recentActions: FeedbackAction[];
  screenshot?: {
    dataUrl: string;
    mimeType: string;
  };
  createdAt: string;
}

const DEFAULT_ENDPOINT = '/api/v2/feedback';

export async function submitFeedback(
  input: SubmitFeedbackInput,
  endpoint = DEFAULT_ENDPOINT,
): Promise<FeedbackSubmission> {
  const payload = await buildFeedbackPayload(input);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(typeof body.message === 'string' ? body.message : 'Feedback submission failed.');
  }

  return response.json() as Promise<FeedbackSubmission>;
}

export async function buildFeedbackPayload(input: SubmitFeedbackInput): Promise<FeedbackPayload> {
  const screenshot = input.includeScreenshot === false ? undefined : await captureAppScreenshot();

  return {
    message: input.message,
    email: input.email || undefined,
    category: input.category ?? 'other',
    page: {
      url: window.location.href,
      path: window.location.pathname + window.location.search,
      title: document.title,
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
    },
    browser: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
    },
    recentActions: getRecentFeedbackActions(),
    screenshot,
    createdAt: new Date().toISOString(),
  };
}

async function captureAppScreenshot() {
  const target = document.querySelector<HTMLElement>('[data-feedback-capture-root]') ?? document.body;
  const blob = await toBlob(target, {
    cacheBust: true,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    filter: (node) => {
      if (!(node instanceof Element)) return true;
      return !node.closest('[data-feedback-ignore="true"]');
    },
  });

  if (!blob) {
    throw new Error('Unable to render the app screenshot.');
  }

  return {
    dataUrl: await blobToDataUrl(blob),
    mimeType: blob.type || 'image/png',
  };
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Unable to encode screenshot.'));
    reader.readAsDataURL(blob);
  });
}
