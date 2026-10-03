/**
 * Utility functions for keyboard handling and filtering disallowed keys
 * (Windows key, Control key, Alt key, Caps Lock, Tab, Fn, F1 ~ F12)
 * to prevent accidental misoperations and browser shortcut conflicts during typing.
 */

export function isDisallowedGameKey(e: KeyboardEvent): boolean {
  const key = e.key;
  const code = e.code || '';

  // 1. Tab key - prevents losing focus from typing area
  if (key === 'Tab' || code === 'Tab') {
    return true;
  }

  // 2. Caps Lock key - prevents switching uppercase/lowercase state accidentally
  if (key === 'CapsLock' || code === 'CapsLock') {
    return true;
  }

  // 3. Windows / Meta / OS key (MetaLeft, MetaRight, OSLeft, OSRight, or metaKey combinations)
  if (
    key === 'Meta' ||
    key === 'OS' ||
    code.startsWith('Meta') ||
    code.startsWith('OS') ||
    e.metaKey
  ) {
    return true;
  }

  // 4. Control key and Control combinations (Ctrl+R reload, Ctrl+W close tab, Ctrl+F search, etc.)
  if (
    key === 'Control' ||
    code.startsWith('Control') ||
    e.ctrlKey
  ) {
    return true;
  }

  // 5. Alt key and Alt combinations (Alt menu bar activation, Alt+Left back, etc.)
  if (
    key === 'Alt' ||
    code.startsWith('Alt') ||
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
    /^F([1-9]|1[0-2])$/i.test(key) ||
    /^F([1-9]|1[0-2])$/i.test(code) ||
    /^F([1-9]|[12][0-9])$/i.test(key) ||
    /^F([1-9]|[12][0-9])$/i.test(code)
  ) {
    return true;
  }

  // 7. ContextMenu key
  if (key === 'ContextMenu' || code === 'ContextMenu') {
    return true;
  }

  return false;
}
