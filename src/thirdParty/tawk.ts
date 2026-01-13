declare global {
  interface Window {
    Tawk_API?: unknown;
    Tawk_LoadStart?: Date;
  }
}

type InitTawkOptions = {
  tawkId?: string;
  tawkKey?: string;
};

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

export function initTawk({ tawkId, tawkKey }: InitTawkOptions): void {
  if (!tawkId || !tawkKey) return;
  if (!hasDocument() || !hasWindow()) return;
  if (isScriptPresent('embed.tawk.to')) return;

  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://embed.tawk.to/${encodeURIComponent(tawkId)}/${encodeURIComponent(tawkKey)}`;
  script.charset = 'UTF-8';
  script.setAttribute('crossorigin', '*');
  document.head.appendChild(script);
}
