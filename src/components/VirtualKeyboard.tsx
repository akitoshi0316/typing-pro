import React from 'react';

interface VirtualKeyboardProps {
  targetKey: string;
  activeKey: string | null;
  onKeyClick?: (key: string) => void;
  theme?: 'dark' | 'light';
}

interface KeyConfig {
  id: string;
  primary: string;
  shift?: string;
  altShift?: string;
  flexGrow?: string;
  maxWidth?: string;
}

const ROW_0: KeyConfig[] = [
  { id: '1', primary: '1', shift: '!' },
  { id: '2', primary: '2', shift: '"' },
  { id: '3', primary: '3', shift: '#' },
  { id: '4', primary: '4', shift: '$' },
  { id: '5', primary: '5', shift: '%' },
  { id: '6', primary: '6', shift: '&' },
  { id: '7', primary: '7', shift: "'" },
  { id: '8', primary: '8', shift: '(' },
  { id: '9', primary: '9', shift: ')' },
  { id: '0', primary: '0' },
  { id: 'hyphen', primary: '-', shift: '=' },
  { id: 'caret', primary: '^', shift: '~' },
  { id: 'yen', primary: '\\', shift: '|', altShift: '_' },
];

const ROW_1: KeyConfig[] = [
  { id: 'q', primary: 'q' },
  { id: 'w', primary: 'w' },
  { id: 'e', primary: 'e' },
  { id: 'r', primary: 'r' },
  { id: 't', primary: 't' },
  { id: 'y', primary: 'y' },
  { id: 'u', primary: 'u' },
  { id: 'i', primary: 'i' },
  { id: 'o', primary: 'o' },
  { id: 'p', primary: 'p' },
  { id: 'at', primary: '@', shift: '`' },
  { id: 'bracket-left', primary: '[', shift: '{' },
];

const ROW_2: KeyConfig[] = [
  { id: 'a', primary: 'a' },
  { id: 's', primary: 's' },
  { id: 'd', primary: 'd' },
  { id: 'f', primary: 'f' },
  { id: 'g', primary: 'g' },
  { id: 'h', primary: 'h' },
  { id: 'j', primary: 'j' },
  { id: 'k', primary: 'k' },
  { id: 'l', primary: 'l' },
  { id: 'semicolon', primary: ';', shift: '+' },
  { id: 'colon', primary: ':', shift: '*' },
  { id: 'bracket-right', primary: ']', shift: '}' },
];

const ROW_3: KeyConfig[] = [
  { id: 'z', primary: 'z' },
  { id: 'x', primary: 'x' },
  { id: 'c', primary: 'c' },
  { id: 'v', primary: 'v' },
  { id: 'b', primary: 'b' },
  { id: 'n', primary: 'n' },
  { id: 'm', primary: 'm' },
  { id: 'comma', primary: ',', shift: '<' },
  { id: 'dot', primary: '.', shift: '>' },
  { id: 'slash', primary: '/', shift: '?' },
  { id: 'underscore', primary: '_', shift: '_' },
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  targetKey,
  activeKey,
  onKeyClick,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  // Check if targetKey requires Shift
  const requiresShift = (
    targetKey === '!' ||
    targetKey === '"' ||
    targetKey === '#' ||
    targetKey === '$' ||
    targetKey === '%' ||
    targetKey === '&' ||
    targetKey === "'" ||
    targetKey === '(' ||
    targetKey === ')' ||
    targetKey === '=' ||
    targetKey === '~' ||
    targetKey === '|' ||
    targetKey === '`' ||
    targetKey === '{' ||
    targetKey === '+' ||
    targetKey === '*' ||
    targetKey === '}' ||
    targetKey === '<' ||
    targetKey === '>' ||
    targetKey === '?' ||
    targetKey === '_'
  );

  const isKeyTarget = (k: KeyConfig) => {
    const t = targetKey.toLowerCase();
    if (k.primary.toLowerCase() === t) return true;
    if (k.shift && k.shift === targetKey) return true;
    if (k.altShift && k.altShift === targetKey) return true;
    return false;
  };

  const isKeyActive = (k: KeyConfig) => {
    if (!activeKey) return false;
    const a = activeKey.toLowerCase();
    if (k.primary.toLowerCase() === a) return true;
    if (k.shift && k.shift === activeKey) return true;
    if (k.altShift && k.altShift === activeKey) return true;
    return false;
  };

  const getKeyClass = (k: KeyConfig) => {
    const isTarget = isKeyTarget(k);
    const isActive = isKeyActive(k);

    let base = isLight
      ? 'key rounded-lg bg-white border border-slate-300 text-slate-700 font-bold h-9 sm:h-12 flex-1 max-w-[44px] sm:max-w-[48px] flex flex-col items-center justify-center cursor-pointer select-none shadow-sm hover:bg-slate-50 transition-colors'
      : 'key rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-bold h-9 sm:h-12 flex-1 max-w-[44px] sm:max-w-[48px] flex flex-col items-center justify-center cursor-pointer select-none hover:bg-slate-700/60 transition-colors';

    if (isActive) {
      base += ' key-active ring-2 ring-cyan-400 bg-cyan-500/20';
    } else if (isTarget) {
      base += ' key-target ring-2 ring-amber-400 bg-amber-500/20';
    }

    return base;
  };

  const handleKeyClick = (k: KeyConfig) => {
    if (!onKeyClick) return;
    if (k.shift && k.shift === targetKey) {
      onKeyClick(k.shift);
    } else if (k.altShift && k.altShift === targetKey) {
      onKeyClick(k.altShift);
    } else {
      onKeyClick(k.primary);
    }
  };

  return (
    <div
      className={`w-full p-2.5 sm:p-5 rounded-3xl backdrop-blur-md shadow-xl flex flex-col items-center space-y-1.5 sm:space-y-2 transition-colors duration-200 ${
        isLight
          ? 'bg-white/80 border border-slate-200 shadow-slate-200/50'
          : 'bg-slate-900/60 border border-slate-800/80 shadow-xl'
      }`}
    >
      {/* Row 0 - Numbers & Symbols */}
      <div className="flex space-x-1 sm:space-x-1.5 w-full justify-center">
        {ROW_0.map((k) => {
          const isTarget = isKeyTarget(k);
          return (
            <div
              key={k.id}
              id={`key-${k.id}`}
              className={getKeyClass(k)}
              data-key={k.primary}
              onClick={() => handleKeyClick(k)}
              title={`${k.shift ? `[Shift] + ${k.primary} = ${k.shift}` : k.primary}`}
            >
              {k.shift && (
                <span
                  className={`text-[9px] sm:text-[10px] leading-tight ${
                    isTarget && targetKey === k.shift
                      ? 'text-amber-500 font-black scale-110'
                      : isLight
                      ? 'text-slate-400'
                      : 'text-slate-400'
                  }`}
                >
                  {k.shift}
                </span>
              )}
              <span
                className={`text-xs sm:text-sm leading-tight ${
                  isTarget && targetKey === k.primary
                    ? 'text-amber-500 font-black'
                    : ''
                }`}
              >
                {k.primary}
              </span>
            </div>
          );
        })}
      </div>

      {/* Row 1 */}
      <div className="flex space-x-1 sm:space-x-1.5 w-full justify-center">
        {ROW_1.map((k) => {
          const isTarget = isKeyTarget(k);
          return (
            <div
              key={k.id}
              id={`key-${k.id}`}
              className={getKeyClass(k)}
              data-key={k.primary}
              onClick={() => handleKeyClick(k)}
            >
              {k.shift && (
                <span
                  className={`text-[9px] sm:text-[10px] leading-tight ${
                    isTarget && targetKey === k.shift
                      ? 'text-amber-500 font-black scale-110'
                      : isLight
                      ? 'text-slate-400'
                      : 'text-slate-400'
                  }`}
                >
                  {k.shift}
                </span>
              )}
              <span className="text-xs sm:text-sm uppercase leading-tight">
                {k.primary}
              </span>
            </div>
          );
        })}
      </div>

      {/* Row 2 */}
      <div className="flex space-x-1 sm:space-x-1.5 w-full justify-center">
        {ROW_2.map((k) => {
          const isTarget = isKeyTarget(k);
          return (
            <div
              key={k.id}
              id={`key-${k.id}`}
              className={getKeyClass(k)}
              data-key={k.primary}
              onClick={() => handleKeyClick(k)}
            >
              {k.shift && (
                <span
                  className={`text-[9px] sm:text-[10px] leading-tight ${
                    isTarget && targetKey === k.shift
                      ? 'text-amber-500 font-black scale-110'
                      : isLight
                      ? 'text-slate-400'
                      : 'text-slate-400'
                  }`}
                >
                  {k.shift}
                </span>
              )}
              <span className="text-xs sm:text-sm uppercase leading-tight">
                {k.primary}
              </span>
            </div>
          );
        })}
      </div>

      {/* Row 3 */}
      <div className="flex space-x-1 sm:space-x-1.5 w-full justify-center">
        {ROW_3.map((k) => {
          const isTarget = isKeyTarget(k);
          return (
            <div
              key={k.id}
              id={`key-${k.id}`}
              className={getKeyClass(k)}
              data-key={k.primary}
              onClick={() => handleKeyClick(k)}
            >
              {k.shift && (
                <span
                  className={`text-[9px] sm:text-[10px] leading-tight ${
                    isTarget && targetKey === k.shift
                      ? 'text-amber-500 font-black scale-110'
                      : isLight
                      ? 'text-slate-400'
                      : 'text-slate-400'
                  }`}
                >
                  {k.shift}
                </span>
              )}
              <span className="text-xs sm:text-sm uppercase leading-tight">
                {k.primary}
              </span>
            </div>
          );
        })}
      </div>

      {/* Space & Shift Status Row */}
      <div className="flex items-center space-x-2 sm:space-x-3 w-full justify-center pt-1">
        {/* Shift indicator badge */}
        <div
          className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all border select-none ${
            requiresShift
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30 animate-pulse font-black'
              : isLight
              ? 'bg-slate-100 text-slate-400 border-slate-200'
              : 'bg-slate-800/60 text-slate-500 border-slate-700/60'
          }`}
          title={requiresShift ? 'Shiftキーを押しながら入力してください' : 'Shiftキー'}
        >
          Shift {requiresShift ? '⇧' : ''}
        </div>

        {/* Space key */}
        <div
          id="key-space"
          className={`key rounded-xl border font-bold text-xs sm:text-sm h-9 sm:h-11 w-full max-w-[280px] sm:max-w-[320px] flex items-center justify-center cursor-pointer select-none shadow-sm transition-colors ${
            targetKey === ' '
              ? 'key-target ring-2 ring-amber-400 bg-amber-500/20'
              : activeKey === ' '
              ? 'key-active ring-2 ring-cyan-400 bg-cyan-500/20'
              : isLight
              ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
          data-key=" "
          onClick={() => onKeyClick?.(' ')}
        >
          Space
        </div>
      </div>
    </div>
  );
};
