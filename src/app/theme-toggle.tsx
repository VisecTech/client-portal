'use client';

import { useEffect, useState } from 'react';

type Mode = 'system' | 'light' | 'dark';
const ORDER: Mode[] = ['system', 'light', 'dark'];
const ICON: Record<Mode, React.ReactNode> = {
  system: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>,
  light: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>,
  dark: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>,
};

/** System (default) → Light → Dark. */
export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>('system');
  useEffect(() => {
    try {
      const s = localStorage.getItem('up-theme');
      if (s === 'light' || s === 'dark') setMode(s);
    } catch {}
  }, []);
  function cycle() {
    const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
    setMode(next);
    try {
      if (next === 'system') { localStorage.removeItem('up-theme'); delete document.documentElement.dataset.theme; }
      else { localStorage.setItem('up-theme', next); document.documentElement.dataset.theme = next; }
    } catch {}
  }
  return (
    <button type="button" className="theme" onClick={cycle} aria-label={`Theme: ${mode}. Change theme`} title={`Theme: ${mode}`}>
      {ICON[mode]}
    </button>
  );
}
