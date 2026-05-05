export interface FeedbackAction {
  type: 'click' | 'input' | 'navigation';
  label: string;
  path: string;
  timestamp: string;
}

const MAX_ACTIONS = 30;
const actions: FeedbackAction[] = [];
let installed = false;
let lastPath = window.location.pathname + window.location.search;

export function installFeedbackActionTracking() {
  if (installed) return;
  installed = true;

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const actionable = target.closest('button, a, [role="button"], [role="tab"], input, textarea, select');
    if (!actionable) return;

    pushAction({
      type: 'click',
      label: describeElement(actionable),
      path: window.location.pathname + window.location.search,
      timestamp: new Date().toISOString(),
    });
  }, { capture: true });

  document.addEventListener('change', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target?.matches('input, textarea, select')) return;

    pushAction({
      type: 'input',
      label: describeElement(target),
      path: window.location.pathname + window.location.search,
      timestamp: new Date().toISOString(),
    });
  }, { capture: true });

  window.addEventListener('popstate', recordNavigation);
  window.setInterval(recordNavigation, 1000);
}

export function getRecentFeedbackActions() {
  return [...actions];
}

function recordNavigation() {
  const nextPath = window.location.pathname + window.location.search;
  if (nextPath === lastPath) return;
  lastPath = nextPath;
  pushAction({
    type: 'navigation',
    label: nextPath,
    path: nextPath,
    timestamp: new Date().toISOString(),
  });
}

function pushAction(action: FeedbackAction) {
  actions.push(action);
  if (actions.length > MAX_ACTIONS) {
    actions.splice(0, actions.length - MAX_ACTIONS);
  }
}

function describeElement(element: Element) {
  const explicit = element.getAttribute('aria-label') || element.getAttribute('title');
  if (explicit) return explicit.trim();

  const text = element.textContent?.replace(/\s+/g, ' ').trim();
  if (text) return text.slice(0, 120);

  const name = element.getAttribute('name') || element.getAttribute('id');
  if (name) return `${element.tagName.toLowerCase()}#${name}`;

  return element.tagName.toLowerCase();
}
