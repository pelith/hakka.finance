declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

function hasDocument(): boolean {
  return typeof document !== 'undefined';
}

function hasWindow(): boolean {
  return typeof window !== 'undefined';
}

function isScriptPresent(srcIncludes: string): boolean {
  if (!hasDocument()) return false;
  return Array.from(document.getElementsByTagName('script')).some((s) =>
    (s.src || '').includes(srcIncludes),
  );
}

export function initGtm(gtmId: string): void {
  if (!gtmId) return;
  if (!hasDocument() || !hasWindow()) return;
  if (isScriptPresent('googletagmanager.com/gtm.js')) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
  document.head.appendChild(script);
}

type TrackOptions = {
  eventName: string;
};

function pushRouteChange(eventName: string) {
  if (!hasWindow()) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    page_path:
      window.location.pathname + window.location.search + window.location.hash,
    page_location: window.location.href,
    page_title: document?.title,
  });
}

export function trackSpaRouteChangesWithGtm({ eventName }: TrackOptions): void {
  if (!eventName) return;
  if (!hasWindow()) return;

  // Initial page view
  pushRouteChange(eventName);

  const handler = () => pushRouteChange(eventName);

  // back/forward
  window.addEventListener('popstate', handler);

  // patch pushState/replaceState so SPA navigations are tracked too
  const historyRef = window.history;
  const originalPushState = historyRef.pushState;
  const originalReplaceState = historyRef.replaceState;

  if (!(historyRef as any).__gtm_patched__) {
    (historyRef as any).__gtm_patched__ = true;

    historyRef.pushState = function (...args) {
      const ret = originalPushState.apply(this, args as any);
      handler();
      return ret;
    } as any;

    historyRef.replaceState = function (...args) {
      const ret = originalReplaceState.apply(this, args as any);
      handler();
      return ret;
    } as any;
  }
}
