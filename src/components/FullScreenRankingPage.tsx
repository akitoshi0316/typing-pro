import React, { useState, useEffect } from 'react';
import {
  RankingEntry,
  subscribeTodayRankings,
  getTodayDateKey,
  resetTodayRankings,
} from '../services/rankingService';

interface FullScreenRankingPageProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onBack: () => void;
  customBg: string | null;
}

export const FullScreenRankingPage: React.FC<FullScreenRankingPageProps> = ({
  theme,
  onToggleTheme,
  onBack,
  customBg,
}) => {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessToast, setResetSuccessToast] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const isLight = theme === 'light';

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeTodayRankings(
      (data) => {
        setRankings(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError('ランキングデータの読み込みに失敗しました。');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleOpenResetModal = () => {
    setAdminPassword('');
    setPasswordError('');
    setResetModalOpen(true);
  };

  const handleConfirmReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (adminPassword !== 'shibaurafzk') {
      setPasswordError('管理者パスワードが正しくありません。');
      return;
    }

    try {
      setIsResetting(true);
      setPasswordError('');
      const count = await resetTodayRankings();
      setResetModalOpen(false);
      setResetSuccessToast(`ランキングをリセットしました（${count}件削除）`);
      setTimeout(() => setResetSuccessToast(null), 4000);
    } catch (err: unknown) {
      console.error(err);
      setPasswordError(
        err instanceof Error ? err.message : 'リセット中にエラーが発生しました。'
      );
    } finally {
      setIsResetting(false);
    }
  };

  const todayDateStr = (() => {
    const key = getTodayDateKey();
    const parts = key.split('-');
    if (parts.length === 3) {
      return `${parts[0]}年${parseInt(parts[1], 10)}月${parseInt(parts[2], 10)}日`;
    }
    return key;
  })();

  const filteredRankings = rankings.filter((item) => {
    const matchesSearch =
      searchFilter === '' ||
      item.nickname.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCat =
      selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div
      className={`min-h-screen w-full flex flex-col font-sans transition-colors duration-300 relative ${
        isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Optional custom background layer */}
      {customBg && (
        <div
          className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center transition-all duration-500"
          style={{
            backgroundImage: `url(${customBg})`,
            opacity: isLight ? 0.15 : 0.25,
          }}
        />
      )}

      {/* Decorative background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top Navbar */}
      <header
        className={`sticky top-0 z-30 backdrop-blur-xl border-b transition-colors ${
          isLight
            ? 'bg-white/85 border-slate-200 shadow-sm'
            : 'bg-slate-900/85 border-slate-800 shadow-xl shadow-black/20'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              id="btnBackToHome"
              onClick={onBack}
              className={`px-3.5 py-2 rounded-xl border text-sm font-semibold flex items-center space-x-2 transition cursor-pointer ${
                isLight
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
                  : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span className="hidden sm:inline">タイピング練習に戻る</span>
              <span className="sm:hidden">戻る</span>
            </button>

            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 text-lg">
                <i className="fa-solid fa-trophy"></i>
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight flex items-center space-x-2">
                  <span>本日のランキング</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                    全画面
                  </span>
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live Indicator */}
            <div
              className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isLight
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-emerald-950/50 text-emerald-400 border-emerald-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>リアルタイム同期中</span>
            </div>

            {/* Dark/Light mode toggle */}
            <button
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-400'
              }`}
            >
              <i className={`fa-solid ${isLight ? 'fa-moon' : 'fa-sun'}`}></i>
            </button>

            {/* RESET button with admin password prompt */}
            <button
              id="btnAdminReset"
              onClick={handleOpenResetModal}
              title="管理者用リセットボタン（パスワードが必要です）"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-1.5 shadow-md shadow-rose-500/20 transition cursor-pointer"
            >
              <i className="fa-solid fa-arrows-rotate"></i>
              <span>reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Success Toast */}
      {resetSuccessToast && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 text-sm font-bold">
            <i className="fa-solid fa-circle-check"></i>
            <span>{resetSuccessToast}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 z-10 flex flex-col space-y-6">
        {/* Banner Card */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden transition ${
            isLight
              ? 'bg-gradient-to-br from-amber-500/10 via-white to-blue-50/50 border-slate-200 shadow-sm'
              : 'bg-gradient-to-br from-amber-500/10 via-slate-900 to-cyan-500/5 border-slate-800 shadow-xl'
          }`}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-sm">
                  TODAY'S LEADERBOARD
                </span>
                <span className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  📅 {todayDateStr}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                本日のタイピング全国・全体ランキング
              </h2>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: '全カテゴリ' },
              { id: 'japanese', label: '日本語' },
              { id: 'english', label: '英語' },
              { id: 'programming', label: 'コード' },
              { id: 'numbers', label: '数字' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                  selectedCategory === cat.id
                    ? isLight
                      ? 'bg-cyan-500 text-white border-cyan-500 shadow-md shadow-cyan-500/20'
                      : 'bg-cyan-500 text-white border-cyan-500 shadow-md shadow-cyan-500/20'
                    : isLight
                    ? 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400"></i>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="ニックネームで検索..."
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm font-medium border outline-none transition ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500'
                  : 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500'
              }`}
            />
          </div>
        </div>

        {/* Leaderboard Table Container */}
        <div
          className={`flex-1 rounded-3xl border overflow-hidden shadow-xl flex flex-col ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          {loading ? (
            <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center p-8 space-y-3">
              <i className="fa-solid fa-spinner animate-spin text-3xl text-amber-500"></i>
              <p className="text-sm font-semibold text-slate-500">
                ランキングデータを取得しています...
              </p>
            </div>
          ) : error ? (
            <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center p-8 space-y-3 text-center">
              <i className="fa-solid fa-triangle-exclamation text-3xl text-rose-500"></i>
              <p className="text-sm font-semibold text-rose-500">{error}</p>
            </div>
          ) : filteredRankings.length === 0 ? (
            <div className="flex-1 min-h-[360px] flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-3xl">
                <i className="fa-solid fa-trophy"></i>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold">本日のランキングはまだありません</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
                  {searchFilter || selectedCategory !== 'all'
                    ? '条件に一致する記録が見つかりませんでした。'
                    : 'あなたが本日最初のチャレンジャーです！タイピングをプレイして記録を残しましょう。'}
                </p>
              </div>
              <button
                onClick={onBack}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition cursor-pointer"
              >
                タイピングに挑戦する
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    className={`border-b text-[11px] sm:text-xs font-bold uppercase tracking-wider ${
                      isLight
                        ? 'bg-slate-50 text-slate-500 border-slate-200'
                        : 'bg-slate-950/70 text-slate-400 border-slate-800'
                    }`}
                  >
                    <th className="py-3.5 px-4 sm:px-6 w-16 text-center">順位</th>
                    <th className="py-3.5 px-4 sm:px-6">ニックネーム</th>
                    <th className="py-3.5 px-3 sm:px-4 text-right">スコア</th>
                    <th className="py-3.5 px-3 sm:px-4 text-right">打鍵速度 (CPM)</th>
                    <th className="py-3.5 px-3 sm:px-4 text-right">正答率</th>
                    <th className="py-3.5 px-3 sm:px-4 text-right">最大コンボ</th>
                    <th className="py-3.5 px-3 sm:px-4 text-center">カテゴリ</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right hidden md:table-cell">
                      記録時刻
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
                  {filteredRankings.map((entry, index) => {
                    const isTop1 = index === 0;
                    const isTop2 = index === 1;
                    const isTop3 = index === 2;

                    const timeStr = (() => {
                      try {
                        const date = new Date(entry.createdAt);
                        return date.toLocaleTimeString('ja-JP', {
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                      } catch {
                        return '-';
                      }
                    })();

                    return (
                      <tr
                        key={entry.id}
                        className="transition hover:bg-slate-500/5"
                      >
                        {/* Rank */}
                        <td className="py-4 px-4 sm:px-6 text-center font-black">
                          {isTop1 ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 text-sm shadow-md shadow-amber-500/30">
                              🥇
                            </span>
                          ) : isTop2 ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-900 text-sm shadow-md">
                              🥈
                            </span>
                          ) : isTop3 ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-white text-sm shadow-md">
                              🥉
                            </span>
                          ) : (
                            <span className="text-slate-500 font-mono-code font-bold">
                              #{index + 1}
                            </span>
                          )}
                        </td>

                        {/* Nickname */}
                        <td className="py-4 px-4 sm:px-6">
                          <span className="font-bold text-sm sm:text-base">
                            {entry.nickname}
                          </span>
                        </td>

                        {/* Score */}
                        <td className="py-4 px-3 sm:px-4 text-right font-black font-mono-code text-cyan-500 text-sm sm:text-base">
                          {entry.score.toLocaleString()}
                        </td>

                        {/* CPM */}
                        <td className="py-4 px-3 sm:px-4 text-right font-mono-code font-bold">
                          <span className="text-amber-500">{entry.cpm}</span>
                          <span className="text-[10px] text-slate-400 ml-1">CPM</span>
                        </td>

                        {/* Accuracy */}
                        <td className="py-4 px-3 sm:px-4 text-right font-mono-code font-bold">
                          <span
                            className={
                              entry.accuracy >= 98
                                ? 'text-emerald-500'
                                : entry.accuracy >= 90
                                ? 'text-cyan-500'
                                : 'text-slate-400'
                            }
                          >
                            {entry.accuracy}%
                          </span>
                        </td>

                        {/* Combo */}
                        <td className="py-4 px-3 sm:px-4 text-right font-mono-code font-bold text-indigo-400">
                          {entry.maxCombo}
                        </td>

                        {/* Category */}
                        <td className="py-4 px-3 sm:px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                              entry.category === 'japanese'
                                ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30'
                                : entry.category === 'english'
                                ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30'
                                : entry.category === 'programming'
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                                : entry.category === 'numbers'
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                                : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                            }`}
                          >
                            {entry.category === 'japanese'
                              ? '日本語'
                              : entry.category === 'english'
                              ? '英語'
                              : entry.category === 'programming'
                              ? 'コード'
                              : entry.category === 'numbers'
                              ? '数字'
                              : entry.category}
                          </span>
                        </td>

                        {/* Created At */}
                        <td className="py-4 px-4 sm:px-6 text-right font-mono-code text-slate-400 text-xs hidden md:table-cell">
                          {timeStr}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Admin Password Modal for RESET */}
      {resetModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border transition-all ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
            }`}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-xl">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold">管理者認証 (reset)</h3>
                <p className="text-xs text-slate-500">ランキングの初期化</p>
              </div>
            </div>

            <p className={`text-xs sm:text-sm mb-4 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              本日のランキングデータをすべて消去（リセット）するには管理者パスワードを入力してください。
            </p>

            <form onSubmit={handleConfirmReset}>
              <div className="mb-4">
                <label className="block text-xs font-bold mb-1.5">
                  管理者パスワード
                </label>
                <input
                  type="password"
                  autoFocus
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="管理者パスワードを入力..."
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold outline-none transition ${
                    passwordError
                      ? 'border-rose-500 ring-2 ring-rose-500/20'
                      : isLight
                      ? 'border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-700 bg-slate-950 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  }`}
                />
                {passwordError && (
                  <p className="text-xs text-rose-500 mt-1.5 font-semibold flex items-center">
                    <i className="fa-solid fa-circle-exclamation mr-1.5"></i>
                    {passwordError}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  disabled={isResetting}
                  className={`flex-1 py-2.5 rounded-xl border font-bold text-xs sm:text-sm transition cursor-pointer ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  }`}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isResetting || !adminPassword}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-500/25 transition cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  {isResetting ? (
                    <>
                      <i className="fa-solid fa-spinner animate-spin"></i>
                      <span>リセット中...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-trash-can"></i>
                      <span>ランキングをリセット</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
