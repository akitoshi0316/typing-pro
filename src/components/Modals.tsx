import React, { useState, useEffect } from 'react';
import { ResultStats, WordItem } from '../types';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  theme?: 'dark' | 'light';
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  onQuit,
  theme = 'dark',
}) => {
  if (!isOpen) return null;

  const isLight = theme === 'light';

  return (
    <div
      id="pauseModal"
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-lg z-50 flex items-center justify-center p-4 transition-opacity duration-300"
    >
      <div
        id="pauseCard"
        className={`w-full max-w-md rounded-3xl p-6 sm:p-8 text-center shadow-2xl transition-transform duration-300 border ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/40 mx-auto flex items-center justify-center text-2xl shadow-lg mb-4">
          <i className="fa-solid fa-pause"></i>
        </div>
        <h2 className={`text-2xl font-black mb-1 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
          一時停止中
        </h2>
        <p className={`text-xs mb-6 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
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
            className={`w-full py-3 rounded-2xl font-bold transition border flex items-center justify-center space-x-2 cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <i className="fa-solid fa-rotate-right"></i>
            <span>最初からやり直す</span>
          </button>
          <button
            id="btnQuit"
            onClick={onQuit}
            className={`w-full py-3 rounded-2xl font-bold transition border flex items-center justify-center space-x-2 cursor-pointer ${
              isLight
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'
                : 'bg-slate-800/50 hover:bg-rose-950/50 text-rose-400 border-slate-800 hover:border-rose-800/50'
            }`}
          >
            <i className="fa-solid fa-xmark"></i>
            <span>終了してメニューに戻る</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import { RankingEntry, subscribeTodayRankings, getTodayDateKey } from '../services/rankingService';

interface ResultModalProps {
  isOpen: boolean;
  stats: ResultStats | null;
  onFinishWithNickname: (nickname: string, action: 'retry' | 'close' | 'ranking') => Promise<void>;
  theme?: 'dark' | 'light';
}

export const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  stats,
  onFinishWithNickname,
  theme = 'dark',
}) => {
  const [nickname, setNickname] = useState(() => {
    try {
      return localStorage.getItem('typemaster_nickname') || '';
    } catch {
      return '';
    }
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      try {
        const saved = localStorage.getItem('typemaster_nickname');
        if (saved) setNickname(saved);
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  if (!isOpen || !stats) return null;

  const isLight = theme === 'light';

  const handleAction = async (action: 'retry' | 'close' | 'ranking') => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setErrorMsg('ニックネームを入力してください（入力しないと終了できません）');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      try {
        localStorage.setItem('typemaster_nickname', trimmed);
      } catch {
        // ignore
      }
      await onFinishWithNickname(trimmed, action);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'スコアの保存中にエラーが発生しました。もう一度お試しください。';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="resultModal"
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-lg z-50 flex items-center justify-center p-4 transition-opacity duration-300"
    >
      <div
        id="resultCard"
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 text-center shadow-2xl transition-transform duration-300 border ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        <div
          id="rankBadge"
          className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr ${stats.rankColor} text-white font-extrabold text-3xl shadow-xl mb-3`}
        >
          {stats.rank}
        </div>
        <h2 id="rankTitle" className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
          {stats.rankTitle}
        </h2>
        <p className={`text-xs mb-5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>トレーニング結果</p>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-5 text-left">
          <div className={`p-3 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">
              総合スコア
            </div>
            <div
              id="resScore"
              className="text-2xl font-black text-cyan-600 font-mono-code"
            >
              {stats.score}
            </div>
          </div>
          <div className={`p-3 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">
              打鍵速度 (CPM)
            </div>
            <div
              id="resCPM"
              className={`text-2xl font-black font-mono-code ${isLight ? 'text-slate-800' : 'text-white'}`}
            >
              {stats.cpm}
            </div>
          </div>
          <div className={`p-3 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">
              正確率
            </div>
            <div
              id="resAccuracy"
              className="text-2xl font-black text-emerald-600 font-mono-code"
            >
              {stats.accuracy}%
            </div>
          </div>
          <div className={`p-3 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">
              最大コンボ
            </div>
            <div
              id="resMaxCombo"
              className="text-2xl font-black text-amber-500 font-mono-code"
            >
              {stats.maxCombo}
            </div>
          </div>
          <div className={`p-3 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">
              正解打鍵数
            </div>
            <div
              id="resCorrectKeys"
              className={`text-lg font-bold font-mono-code ${isLight ? 'text-slate-700' : 'text-slate-200'}`}
            >
              {stats.totalCorrectKeys}
            </div>
          </div>
          <div className={`p-3 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">
              ミス打鍵数
            </div>
            <div
              id="resMissedKeys"
              className="text-lg font-bold text-rose-500 font-mono-code"
            >
              {stats.totalMissedKeys}
            </div>
          </div>
        </div>

        {/* Mandatory Nickname Input Field */}
        <div className={`p-4 rounded-2xl border mb-5 text-left transition-colors ${
          errorMsg
            ? isLight
              ? 'bg-rose-50/70 border-rose-300'
              : 'bg-rose-950/30 border-rose-800/80'
            : isLight
            ? 'bg-slate-50/80 border-slate-200'
            : 'bg-slate-950/70 border-slate-800'
        }`}>
          <label htmlFor="resultNicknameInput" className="block text-xs font-bold mb-1.5 flex items-center justify-between">
            <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>
              <i className="fa-solid fa-trophy mr-1.5 text-amber-500"></i>
              ニックネーム（今日のランキングに登録）
            </span>
            <span className="text-[11px] font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
              必須
            </span>
          </label>
          <input
            id="resultNicknameInput"
            type="text"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAction('close');
              }
            }}
            placeholder="ランキングに表示する名前を入力..."
            maxLength={20}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold outline-none transition ${
              isLight
                ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
                : 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
            }`}
          />
          {errorMsg ? (
            <p className="text-xs text-rose-500 mt-2 font-semibold flex items-center animate-bounce">
              <i className="fa-solid fa-circle-exclamation mr-1.5"></i>
              {errorMsg}
            </p>
          ) : (
            <p className={`text-[11px] mt-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              ※ニックネームを入力するとスコアが「今日のランキング」に即座に反映されます。
            </p>
          )}
        </div>

        {/* Action Buttons: Mandatory registration to exit or retry */}
        <div className="flex flex-col sm:flex-row space-y-2.5 sm:space-y-0 sm:space-x-3">
          <button
            id="btnPlayAgain"
            disabled={isSubmitting}
            onClick={() => handleAction('retry')}
            className={`flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold transition shadow-lg shadow-cyan-500/20 cursor-pointer flex items-center justify-center space-x-2 ${
              isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <i className="fa-solid fa-spinner animate-spin"></i>
                <span>送信中...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-rotate-right"></i>
                <span>登録してもう一度挑む</span>
              </>
            )}
          </button>

          <button
            id="btnCloseResult"
            disabled={isSubmitting}
            onClick={() => handleAction('close')}
            className={`px-6 py-3.5 rounded-2xl font-bold transition border cursor-pointer flex items-center justify-center space-x-1.5 ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <i className="fa-solid fa-check"></i>
            <span>登録して終了</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface RankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFullScreen?: () => void;
  theme?: 'dark' | 'light';
}

export const RankingModal: React.FC<RankingModalProps> = ({
  isOpen,
  onClose,
  onOpenFullScreen,
  theme = 'dark',
}) => {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const isLight = theme === 'light';
  const todayDate = getTodayDateKey();

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    const unsubscribe = subscribeTodayRankings(
      (list) => {
        setRankings(list);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredRankings = filterCategory === 'all'
    ? rankings
    : rankings.filter((r) => r.category === filterCategory);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'japanese': return '日本語';
      case 'english': return 'English';
      case 'programming': return 'コード';
      case 'numbers': return '数字';
      case 'custom': return 'カスタム';
      default: return cat;
    }
  };

  return (
    <div
      id="rankingModal"
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-lg z-50 flex items-center justify-center p-3 sm:p-4 transition-opacity duration-300"
    >
      <div
        id="rankingCard"
        className={`w-full max-w-3xl rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[90vh] border ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-white text-xl shadow-lg shadow-amber-500/25">
              <i className="fa-solid fa-trophy"></i>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className={`text-lg sm:text-xl font-black ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                  今日のランキング
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-600 border border-amber-500/30">
                  {todayDate}
                </span>
                <span className="hidden sm:inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Firebase 同期中</span>
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                毎日0時にリセット。全デバイスのプレイヤーと本日の記録を競い合おう！
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            {onOpenFullScreen && (
              <button
                onClick={() => {
                  onClose();
                  onOpenFullScreen();
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1 transition cursor-pointer ${
                  isLight
                    ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-800'
                    : 'bg-amber-950/40 hover:bg-amber-900/50 border-amber-500/40 text-amber-300'
                }`}
                title="全画面ページへ移動 (/ランキング)"
              >
                <i className="fa-solid fa-up-right-from-square"></i>
                <span className="hidden sm:inline">全画面で開く</span>
              </button>
            )}
            <button
              id="btnCloseRanking"
              onClick={onClose}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center space-x-1.5 py-3 overflow-x-auto">
          {[
            { id: 'all', label: 'すべて' },
            { id: 'japanese', label: '日本語' },
            { id: 'english', label: 'English' },
            { id: 'programming', label: 'コード' },
            { id: 'numbers', label: '数字' },
            { id: 'custom', label: 'カスタム' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filterCategory === tab.id
                  ? isLight
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-amber-500 text-slate-950 font-bold'
                  : isLight
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Rankings Table / List */}
        <div className="flex-grow overflow-y-auto py-2 pr-1 space-y-2.5 min-h-[220px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
              <p className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Firebaseから本日の最新ランキングを取得中...
              </p>
            </div>
          ) : filteredRankings.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-16 text-center rounded-2xl border ${
              isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/40 border-slate-800/80'
            }`}>
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-3xl mb-3">
                <i className="fa-solid fa-award"></i>
              </div>
              <p className={`text-sm font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                本日のランキング記録はまだありません
              </p>
              <p className={`text-xs max-w-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                タイピング練習を完了してニックネームを登録すると、本日最初の1位に輝きます！
              </p>
            </div>
          ) : (
            filteredRankings.map((item, index) => {
              const rank = index + 1;
              const isTop1 = rank === 1;
              const isTop2 = rank === 2;
              const isTop3 = rank === 3;

              return (
                <div
                  key={item.id}
                  className={`p-3 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    isTop1
                      ? isLight
                        ? 'bg-gradient-to-r from-amber-50 via-yellow-50/40 to-white border-amber-300 shadow-sm'
                        : 'bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-slate-900 border-amber-500/50 shadow-md'
                      : isTop2
                      ? isLight
                        ? 'bg-slate-50 border-slate-300'
                        : 'bg-slate-800/60 border-slate-700/80'
                      : isTop3
                      ? isLight
                        ? 'bg-amber-50/30 border-amber-200'
                        : 'bg-amber-950/20 border-amber-800/40'
                      : isLight
                      ? 'bg-white border-slate-200 hover:bg-slate-50'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/40'
                  }`}
                >
                  {/* Left: Rank & Nickname */}
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm ${
                        isTop1
                          ? 'bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 ring-2 ring-amber-400/50'
                          : isTop2
                          ? 'bg-gradient-to-tr from-slate-300 to-slate-400 text-slate-950'
                          : isTop3
                          ? 'bg-gradient-to-tr from-amber-600 to-amber-700 text-white'
                          : isLight
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : rank}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold text-sm sm:text-base truncate ${
                          isLight ? 'text-slate-900' : 'text-slate-100'
                        }`}>
                          {item.nickname}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                          isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {getCategoryLabel(item.category)}
                        </span>
                      </div>
                      <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Right: CPM, Accuracy, Max Combo, Score */}
                  <div className="flex items-center justify-between sm:justify-end space-x-4 sm:space-x-6 text-right">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">CPM</div>
                      <div className="font-mono-code font-black text-sm sm:text-base text-cyan-500">
                        {item.cpm}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">正確率</div>
                      <div className="font-mono-code font-bold text-sm sm:text-base text-emerald-500">
                        {item.accuracy}%
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">最大コンボ</div>
                      <div className="font-mono-code font-bold text-sm sm:text-base text-amber-500">
                        {item.maxCombo}
                      </div>
                    </div>

                    <div className="min-w-[70px]">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">スコア</div>
                      <div className={`font-mono-code font-black text-sm sm:text-lg ${
                        isTop1
                          ? 'text-amber-500'
                          : isLight
                          ? 'text-slate-800'
                          : 'text-white'
                      }`}>
                        {item.score}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className={`pt-4 border-t flex justify-end ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
          <button
            onClick={onClose}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition border cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            閉じる
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
  theme?: 'dark' | 'light';
}

export const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  customList,
  onClose,
  onAdd,
  onDelete,
  onReset,
  onStartCustomPractice,
  theme = 'dark',
}) => {
  const [main, setMain] = useState('');
  const [sub, setSub] = useState('');
  const [romaji, setRomaji] = useState('');

  if (!isOpen) return null;

  const isLight = theme === 'light';

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
        className={`w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl transition-transform duration-300 max-h-[90vh] flex flex-col border ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        <div className={`flex items-center justify-between pb-4 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
          <div className="flex items-center space-x-2">
            <i className="fa-solid fa-user-pen text-cyan-500 text-xl"></i>
            <h2 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              カスタム文章エディタ
            </h2>
          </div>
          <button
            id="btnCloseCustomModal"
            onClick={onClose}
            className={`p-2 rounded-lg transition cursor-pointer ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAdd} className={`py-4 space-y-3 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                表示テキスト (漢字・かな・英文など)
              </label>
              <input
                id="inputMain"
                type="text"
                placeholder="例: 吾輩は猫である"
                value={main}
                onChange={(e) => setMain(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 border ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-800 focus:bg-white'
                    : 'bg-slate-950 border-slate-800 text-slate-100'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                サブ表示 (読みがな・解説など)
              </label>
              <input
                id="inputSub"
                type="text"
                placeholder="例: わがはいはねこである"
                value={sub}
                onChange={(e) => setSub(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 border ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-800 focus:bg-white'
                    : 'bg-slate-950 border-slate-800 text-slate-100'
                }`}
              />
            </div>
          </div>
          <div>
            <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              タイピング用ローマ字 / 英数字キー
            </label>
            <input
              id="inputRomaji"
              type="text"
              placeholder="例: wagahaihanekodearu"
              value={romaji}
              onChange={(e) => setRomaji(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 text-sm font-mono-code focus:outline-none focus:border-cyan-500 border ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-cyan-700 focus:bg-white'
                  : 'bg-slate-950 border-slate-800 text-cyan-300'
              }`}
            />
          </div>
          <button
            id="btnAddSentence"
            type="submit"
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-cyan-600/20"
          >
            <i className="fa-solid fa-plus"></i>
            <span>課題文章を追加する</span>
          </button>
        </form>

        {/* Sentence List */}
        <div className="flex-grow overflow-y-auto py-4 space-y-2 pr-1">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>
              登録中の文章 (<span id="customCount">{customList.length}</span>件)
            </span>
            <button
              id="btnResetDefaults"
              type="button"
              onClick={onReset}
              className="text-rose-500 hover:underline cursor-pointer"
            >
              デフォルトに戻す
            </button>
          </div>
          <div id="customList" className="space-y-2">
            {customList.length === 0 ? (
              <div className={`text-center py-6 text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                登録された課題がありません。上のフォームから自由に追加できます。
              </div>
            ) : (
              customList.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-2xl flex items-center justify-between text-xs border ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="overflow-hidden mr-2">
                    <div className={`font-bold truncate ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      {item.main}
                    </div>
                    <div className={`text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {item.sub}
                    </div>
                    <div className="text-[11px] font-mono-code text-cyan-600 truncate">
                      {item.romaji}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(index)}
                    className={`p-2 rounded-lg transition flex-shrink-0 cursor-pointer ${
                      isLight
                        ? 'text-slate-400 hover:text-rose-500 hover:bg-slate-100'
                        : 'text-slate-500 hover:text-rose-400 hover:bg-slate-800'
                    }`}
                    title="削除"
                  >
                    <i className="fa-solid fa-trash-can text-sm"></i>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`pt-4 border-t text-right ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
          <button
            id="btnStartCustomPractice"
            type="button"
            onClick={onStartCustomPractice}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm border transition cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700'
            }`}
          >
            「カスタムモード」で練習を開始
          </button>
        </div>
      </div>
    </div>
  );
};
