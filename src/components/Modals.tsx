import React, { useState, useEffect } from 'react';
import { ResultStats, WordItem } from '../types';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  onQuit,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="pauseModal"
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-lg z-50 flex items-center justify-center p-4 transition-opacity duration-300"
    >
      <div
        id="pauseCard"
        className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 sm:p-8 text-center shadow-2xl transition-transform duration-300"
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 mx-auto flex items-center justify-center text-2xl shadow-lg mb-4">
          <i className="fa-solid fa-pause"></i>
        </div>
        <h2 className="text-2xl font-black text-slate-100 mb-1">一時停止中</h2>
        <p className="text-xs text-slate-400 mb-6">
          [ Esc ] キーまたは下のボタンで再開できます
        </p>

        <div className="space-y-3">
          <button
            id="btnResume"
            onClick={onResume}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold transition shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <i className="fa-solid fa-play"></i>
            <span>再開する (Esc)</span>
          </button>
          <button
            id="btnRestart"
            onClick={onRestart}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition border border-slate-700 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <i className="fa-solid fa-rotate-right"></i>
            <span>最初からやり直す</span>
          </button>
          <button
            id="btnQuit"
            onClick={onQuit}
            className="w-full py-3 rounded-2xl bg-slate-800/50 hover:bg-rose-950/50 text-rose-400 font-bold transition border border-slate-800 hover:border-rose-800/50 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <i className="fa-solid fa-xmark"></i>
            <span>終了してメニューに戻る</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface ResultModalProps {
  isOpen: boolean;
  stats: ResultStats | null;
  onRetry: () => void;
  onClose: () => void;
  onOpenAI: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  stats,
  onRetry,
  onClose,
  onOpenAI,
}) => {
  if (!isOpen || !stats) return null;

  return (
    <div
      id="resultModal"
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-lg z-50 flex items-center justify-center p-4 transition-opacity duration-300"
    >
      <div
        id="resultCard"
        className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 sm:p-8 text-center shadow-2xl transition-transform duration-300"
      >
        <div
          id="rankBadge"
          className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr ${stats.rankColor} text-white font-extrabold text-3xl shadow-xl mb-3`}
        >
          {stats.rank}
        </div>
        <h2 id="rankTitle" className="text-xl font-bold text-slate-200">
          {stats.rankTitle}
        </h2>
        <p className="text-xs text-slate-400 mb-6">トレーニング結果</p>

        <div className="grid grid-cols-2 gap-3 mb-6 text-left">
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">
              総合スコア
            </div>
            <div
              id="resScore"
              className="text-2xl font-black text-cyan-400 font-mono-code"
            >
              {stats.score}
            </div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">
              打鍵速度 (CPM)
            </div>
            <div
              id="resCPM"
              className="text-2xl font-black text-white font-mono-code"
            >
              {stats.cpm}
            </div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">
              正確率
            </div>
            <div
              id="resAccuracy"
              className="text-2xl font-black text-emerald-400 font-mono-code"
            >
              {stats.accuracy}%
            </div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">
              最大コンボ
            </div>
            <div
              id="resMaxCombo"
              className="text-2xl font-black text-amber-400 font-mono-code"
            >
              {stats.maxCombo}
            </div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">
              正解打鍵数
            </div>
            <div
              id="resCorrectKeys"
              className="text-lg font-bold text-slate-200 font-mono-code"
            >
              {stats.totalCorrectKeys}
            </div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">
              ミス打鍵数
            </div>
            <div
              id="resMissedKeys"
              className="text-lg font-bold text-rose-400 font-mono-code"
            >
              {stats.totalMissedKeys}
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            id="btnPlayAgain"
            onClick={onRetry}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold transition shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <i className="fa-solid fa-rotate-right mr-1"></i> もう一度挑む
          </button>
          <button
            id="btnCloseResult"
            onClick={onClose}
            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition border border-slate-700 cursor-pointer"
          >
            閉じる
          </button>
        </div>

        {/* Chrome AI Advice Trigger Button */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <button
            id="btnOpenAIAdvice"
            onClick={onOpenAI}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold transition shadow-lg shadow-purple-500/25 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <i className="fa-solid fa-robot text-yellow-300 animate-bounce"></i>
            <span>Chrome内蔵AIのアドバイスを聞く</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface AIModalProps {
  isOpen: boolean;
  stats: ResultStats | null;
  onClose: () => void;
}

export const AIModal: React.FC<AIModalProps> = ({ isOpen, stats, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [adviceList, setAdviceList] = useState<string[]>([]);
  const [badgeText, setBadgeText] = useState('AI Ready');
  const [badgeClass, setBadgeClass] = useState(
    'text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30'
  );

  const fetchAdvice = async () => {
    if (!stats) return;
    setLoading(true);
    setAdviceList([]);

    try {
      // Check Chrome Built-in AI (window.ai.languageModel) availability
      const windowAi = (window as unknown as { ai?: { languageModel?: { capabilities: () => Promise<{ available: string }>; create: (opts: { systemPrompt: string }) => Promise<{ prompt: (p: string) => Promise<string>; destroy: () => void }> } } }).ai;

      if (windowAi?.languageModel) {
        const capabilities = await windowAi.languageModel.capabilities();
        if (capabilities.available !== 'no') {
          setBadgeText('Gemini Nano (Local)');
          setBadgeClass(
            'text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30'
          );

          const session = await windowAi.languageModel.create({
            systemPrompt:
              'あなたはプロのタイピングコーチです。タイピング速度(CPM)、正確率、ミス数、コンボ数から、練習者の強みと具体的な改善方法を日本語で親切・簡潔にアドバイスしてください。',
          });

          const prompt = `カテゴリ:${stats.category}, CPM:${stats.cpm}, 正確率:${stats.accuracy}%, ミス数:${stats.totalMissedKeys}, 最大コンボ:${stats.maxCombo}, ランク:${stats.rank}。この成績に基づくフィードバックをお願いします。`;

          const response = await session.prompt(prompt);
          session.destroy();

          const parts = response
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0);
          setAdviceList(parts);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Chrome AI API unavailable or error:', err);
    }

    // Fallback AI Diagnostic Engine
    setBadgeText('Chrome AI (Simulated)');
    setBadgeClass(
      'text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30'
    );

    setTimeout(() => {
      const simulated: string[] = [];

      // CPM Evaluation
      if (stats.cpm >= 260) {
        simulated.push(
          `⚡ 打鍵速度（CPM ${stats.cpm}）はプロ級です！高い指の独立性とリズム感を持っています。`
        );
      } else if (stats.cpm >= 160) {
        simulated.push(
          `👍 打鍵速度（CPM ${stats.cpm}）はとても良好です。実務や日常作業には十分な速さです。`
        );
      } else {
        simulated.push(
          `🌱 打鍵速度はCPM ${stats.cpm}です。まずはホームポジションを固定し、キーを探す時間を削ることから始めましょう。`
        );
      }

      // Accuracy Evaluation
      if (stats.accuracyNum >= 97) {
        simulated.push(
          `🎯 正確率${stats.accuracy}%と極めて正確です！打ち直しのロスタイムが最小限に抑えられています。`
        );
      } else if (stats.accuracyNum >= 90) {
        simulated.push(
          `⚠️ 正確率${stats.accuracy}%です。ミスが${stats.totalMissedKeys}回発生しています。スピードを少し落として正確性を意識すると、総合スコアがさらに伸びます。`
        );
      } else {
        simulated.push(
          `❗ 正確率は${stats.accuracy}%です。正確性を高めることでコンボが繋がり、結果として速度も上がります。`
        );
      }

      // Next Actionable Advice
      if (stats.maxCombo > 30) {
        simulated.push(
          `🔥 最大コンボ数${stats.maxCombo}を達成！集中力が持続しています。次は「無制限」モードで長時間の持続力トレーニングに挑戦しましょう。`
        );
      } else {
        simulated.push(
          `💡 アドバイス: 画面から目を離さず、画面上のキーガイドを見ながらブラインドタッチの精度を高める練習が効果的です。`
        );
      }

      setAdviceList(simulated);
      setLoading(false);
    }, 600);
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdvice();
    }
  }, [isOpen, stats]);

  if (!isOpen) return null;

  return (
    <div
      id="aiModal"
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-lg z-50 flex items-center justify-center p-4 transition-opacity duration-300"
    >
      <div
        id="aiCard"
        className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl transition-transform duration-300 flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <i className="fa-solid fa-brain"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <span>Chrome内蔵AI コーチ</span>
                <span id="aiStatusBadge" className={badgeClass}>
                  {badgeText}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Gemini Nanoによる個別タイピング診断
              </p>
            </div>
          </div>
          <button
            id="btnCloseAIModal"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Advice Output Container */}
        <div className="py-5 flex-grow overflow-y-auto space-y-3">
          {loading ? (
            <div
              id="aiLoading"
              className="flex flex-col items-center justify-center py-8 space-y-3"
            >
              <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin"></div>
              <p className="text-xs text-slate-400 font-medium">
                Chrome内蔵AIが成績を分析中...
              </p>
            </div>
          ) : (
            <div id="aiContent" className="text-sm text-slate-200 leading-relaxed space-y-3">
              {adviceList.map((advice, idx) => (
                <p
                  key={idx}
                  className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80"
                >
                  {advice}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
          <button
            id="btnReanalyze"
            onClick={fetchAdvice}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition flex items-center space-x-1.5 cursor-pointer"
          >
            <i className="fa-solid fa-arrows-rotate"></i>
            <span>再分析</span>
          </button>
          <button
            id="btnConfirmAdvice"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md shadow-purple-600/30 cursor-pointer"
          >
            了解！
          </button>
        </div>
      </div>
    </div>
  );
};

interface CustomModalProps {
  isOpen: boolean;
  customList: WordItem[];
  onClose: () => void;
  onAdd: (item: WordItem) => void;
  onDelete: (index: number) => void;
  onReset: () => void;
  onStartCustomPractice: () => void;
}

export const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  customList,
  onClose,
  onAdd,
  onDelete,
  onReset,
  onStartCustomPractice,
}) => {
  const [main, setMain] = useState('');
  const [sub, setSub] = useState('');
  const [romaji, setRomaji] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMain = main.trim();
    const trimmedSub = sub.trim();
    const trimmedRomaji = romaji.trim().toLowerCase();

    if (!trimmedMain || !trimmedRomaji) {
      alert('「表示テキスト」と「タイピング用ローマ字」は必須です。');
      return;
    }

    onAdd({
      main: trimmedMain,
      sub: trimmedSub || trimmedMain,
      romaji: trimmedRomaji,
    });

    setMain('');
    setSub('');
    setRomaji('');
  };

  return (
    <div
      id="customModal"
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-lg z-50 flex items-center justify-center p-4 transition-opacity duration-300"
    >
      <div
        id="customCard"
        className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl transition-transform duration-300 max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <i className="fa-solid fa-user-pen text-cyan-400 text-xl"></i>
            <h2 className="text-lg font-bold text-slate-100">
              カスタム文章エディタ
            </h2>
          </div>
          <button
            id="btnCloseCustomModal"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAdd} className="py-4 space-y-3 border-b border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                表示テキスト (漢字・かな・英文など)
              </label>
              <input
                id="inputMain"
                type="text"
                placeholder="例: 吾輩は猫である"
                value={main}
                onChange={(e) => setMain(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                サブ表示 (読みがな・解説など)
              </label>
              <input
                id="inputSub"
                type="text"
                placeholder="例: わがはいはねこである"
                value={sub}
                onChange={(e) => setSub(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              タイピング用ローマ字 / 英数字キー
            </label>
            <input
              id="inputRomaji"
              type="text"
              placeholder="例: wagahaihanekodearu"
              value={romaji}
              onChange={(e) => setRomaji(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-cyan-300 font-mono-code focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            id="btnAddSentence"
            type="submit"
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <i className="fa-solid fa-plus"></i>
            <span>課題文章を追加する</span>
          </button>
        </form>

        {/* Sentence List */}
        <div className="flex-grow overflow-y-auto py-4 space-y-2 pr-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>
              登録中の文章 (<span id="customCount">{customList.length}</span>件)
            </span>
            <button
              id="btnResetDefaults"
              type="button"
              onClick={onReset}
              className="text-rose-400 hover:underline cursor-pointer"
            >
              デフォルトに戻す
            </button>
          </div>
          <div id="customList" className="space-y-2">
            {customList.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                登録された課題がありません。上のフォームから自由に追加できます。
              </div>
            ) : (
              customList.map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div className="overflow-hidden mr-2">
                    <div className="font-bold text-slate-200 truncate">{item.main}</div>
                    <div className="text-[11px] text-slate-400 truncate">{item.sub}</div>
                    <div className="text-[11px] font-mono-code text-cyan-400 truncate">
                      {item.romaji}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(index)}
                    className="text-slate-500 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800 transition flex-shrink-0 cursor-pointer"
                    title="削除"
                  >
                    <i className="fa-solid fa-trash-can text-sm"></i>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 text-right">
          <button
            id="btnStartCustomPractice"
            type="button"
            onClick={onStartCustomPractice}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-sm border border-slate-700 transition cursor-pointer"
          >
            「カスタムモード」で練習を開始
          </button>
        </div>
      </div>
    </div>
  );
};
