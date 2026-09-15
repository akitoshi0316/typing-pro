import React from 'react';

interface VirtualKeyboardProps {
  targetKey: string;
  activeKey: string | null;
  onKeyClick?: (key: string) => void;
}

const ROW_1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '-'];
const ROW_2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'];
const ROW_3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.'];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  targetKey,
  activeKey,
  onKeyClick,
}) => {
  const getKeyClass = (key: string) => {
    const isTarget = targetKey.toLowerCase() === key.toLowerCase();
    const isActive = activeKey?.toLowerCase() === key.toLowerCase();

    let base =
      'key rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs sm:text-sm h-10 sm:h-12 flex-1 max-w-[50px] flex items-center justify-center cursor-pointer select-none';

    if (key === ' ') {
      base =
        'key rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs sm:text-sm h-10 sm:h-11 w-full max-w-[320px] flex items-center justify-center cursor-pointer select-none';
    }

    if (isActive) {
      base += ' key-active';
    } else if (isTarget) {
      base += ' key-target';
    }

    return base;
  };

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 p-3 sm:p-5 rounded-3xl backdrop-blur-md shadow-xl flex flex-col items-center space-y-2">
      {/* Row 1 */}
      <div className="flex space-x-1 sm:space-x-1.5 w-full justify-center">
        {ROW_1.map((k) => (
          <div
            key={k}
            id={`key-${k}`}
            className={getKeyClass(k)}
            data-key={k}
            onClick={() => onKeyClick?.(k)}
          >
            {k.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Row 2 */}
      <div className="flex space-x-1 sm:space-x-1.5 w-full justify-center">
        {ROW_2.map((k) => (
          <div
            key={k}
            id={`key-${k}`}
            className={getKeyClass(k)}
            data-key={k}
            onClick={() => onKeyClick?.(k)}
          >
            {k.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Row 3 */}
      <div className="flex space-x-1 sm:space-x-1.5 w-full justify-center">
        {ROW_3.map((k) => (
          <div
            key={k}
            id={`key-${k === ',' ? 'comma' : k === '.' ? 'dot' : k}`}
            className={getKeyClass(k)}
            data-key={k}
            onClick={() => onKeyClick?.(k)}
          >
            {k.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Space Row */}
      <div className="flex space-x-1 sm:space-x-1.5 w-full justify-center pt-1">
        <div
          id="key-space"
          className={getKeyClass(' ')}
          data-key=" "
          onClick={() => onKeyClick?.(' ')}
        >
          Space
        </div>
      </div>
    </div>
  );
};
