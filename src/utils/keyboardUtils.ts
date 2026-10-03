/**
 * Utility functions for keyboard handling and filtering disallowed keys
 * (Windows key, Control key, Alt key, Caps Lock, Tab, Fn, F1 ~ F12)
 * to prevent accidental misoperations and browser shortcut conflicts during typing.
 */

export function isDisallowedGameKey(e: KeyboardEvent): boolean {
  const key = e.key || '';
  const code = e.code || '';
  const keyCode = e.keyCode || e.which || 0;

  // 1. Tab key - prevents losing focus from typing area
  if (key === 'Tab' || code === 'Tab' || keyCode === 9) {
    return true;
  }

  // 2. Caps Lock key - prevents switching uppercase/lowercase state accidentally
  if (key === 'CapsLock' || code === 'CapsLock' || keyCode === 20) {
    return true;
  }

  // 3. Windows / Meta / OS key (MetaLeft, MetaRight, OSLeft, OSRight, or metaKey combinations)
  // Covers e.key ('Meta', 'OS', 'Win', 'Windows'), e.code, e.keyCode (91, 92, 224), e.metaKey
  if (
    key === 'Meta' ||
    key === 'OS' ||
    key === 'Win' ||
    key === 'Windows' ||
    code === 'MetaLeft' ||
    code === 'MetaRight' ||
    code === 'OSLeft' ||
    code === 'OSRight' ||
    code.startsWith('Meta') ||
    code.startsWith('OS') ||
    code.includes('Win') ||
    keyCode === 91 ||
    keyCode === 92 ||
    keyCode === 224 ||
    e.metaKey
  ) {
    return true;
  }

  // 4. Control key and Control combinations (Ctrl+R reload, Ctrl+W close tab, Ctrl+F search, etc.)
  if (
    key === 'Control' ||
    code === 'ControlLeft' ||
    code === 'ControlRight' ||
    code.startsWith('Control') ||
    keyCode === 17 ||
    e.ctrlKey
  ) {
    return true;
  }

  // 5. Alt key and Alt combinations (Alt menu bar activation, Alt+Left back, etc.)
  if (
    key === 'Alt' ||
    key === 'AltGraph' ||
    code === 'AltLeft' ||
    code === 'AltRight' ||
    code.startsWith('Alt') ||
    keyCode === 18 ||
    e.altKey
  ) {
    return true;
  }

  // 6. Function keys: Fn, FnLock, F1 ~ F12 (also F1 ~ F24)
  // F1 (Help), F3 (Find), F5 (Refresh), F6 (URL bar), F7 (Caret), F11 (Fullscreen), F12 (DevTools)
  if (
    key === 'Fn' ||
    key === 'FnLock' ||
    code === 'Fn' ||
    code === 'FnLock' ||
    (keyCode >= 112 && keyCode <= 123) ||
    /^F([1-9]|1[0-2])$/i.test(key) ||
    /^F([1-9]|1[0-2])$/i.test(code) ||
    /^F([1-9]|[12][0-9])$/i.test(key) ||
    /^F([1-9]|[12][0-9])$/i.test(code)
  ) {
    return true;
  }

  // 7. ContextMenu key / Right-click menu shortcuts (Shift+F10, Menu key)
  if (
    key === 'ContextMenu' ||
    code === 'ContextMenu' ||
    keyCode === 93 ||
    (e.shiftKey && (key === 'F10' || code === 'F10' || keyCode === 121))
  ) {
    return true;
  }

  return false;
}

/**
 * Attempts to lock system keys (Windows key, Alt+Tab, Escape, etc.)
 * via the HTML5 Keyboard Lock API when available.
 */
export async function enableKeyboardLock(): Promise<boolean> {
  try {
    const nav = navigator as any;
    if (nav.keyboard && typeof nav.keyboard.lock === 'function') {
      await nav.keyboard.lock([
        'MetaLeft',
        'MetaRight',
        'Tab',
        'CapsLock',
        'AltLeft',
        'AltRight',
        'ControlLeft',
        'ControlRight',
        'Escape',
        'F1',
        'F2',
        'F3',
        'F4',
        'F5',
        'F6',
        'F7',
        'F8',
        'F9',
        'F10',
        'F11',
        'F12',
      ]);
      return true;
    }
  } catch {
    // Keyboard Lock API requires user gesture or fullscreen in some browsers
  }
  return false;
}

export function disableKeyboardLock(): void {
  try {
    const nav = navigator as any;
    if (nav.keyboard && typeof nav.keyboard.unlock === 'function') {
      nav.keyboard.unlock();
    }
  } catch {
    // ignore
  }
}

/**
 * Locks the mouse pointer using the Pointer Lock API.
 * This locks the mouse cursor to prevent accidental cursor movement or clicks during typing.
 */
export async function lockMousePointer(): Promise<boolean> {
  try {
    const target = document.body || document.documentElement;
    if (target && typeof target.requestPointerLock === 'function') {
      const res = target.requestPointerLock() as any;
      if (res && typeof res.catch === 'function') {
        res.catch(() => {
          // pointer lock denied or not supported
        });
      }
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

/**
 * Releases the mouse pointer lock.
 */
export function unlockMousePointer(): void {
  try {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  } catch {
    // ignore
  }
}

