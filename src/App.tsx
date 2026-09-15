import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CategoryKey, DisplayParts, ResultStats, WordItem } from './types';
import { soundEngine } from './utils/soundEngine';
import { KanaRomajiEngine } from './utils/kanaEngine';
import { DEFAULT_CUSTOM, INITIAL_DATASETS } from './data/sentences';
import { ParticleCanvas, ParticleCanvasHandle } from './components/ParticleCanvas';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { AIModal, CustomModal, PauseModal, ResultModal } from './components/Modals';

export default function App() {
  // Audio state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Categories and Datasets
  const [category, setCategory] = useState<CategoryKey>('japanese');
  const [customSentences, setCustomSentences] = useState<WordItem[]>(() => {
    try {
      const saved = localStorage.getItem('typemaster_custom_sentences');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CUSTOM;
  });

  // Time Limit Settings
  const [timeLimit, setTimeLimit] = useState<number>(30); // 0 = endless
  const [customTimeInput, setCustomTimeInput] = useState<string>('');

  // Challenge Mode: Miss Limit
  const [missLimit, setMissLimit] = useState<number>(0); // 0 = challenge mode off
  const [missLimitInput, setMissLimitInput] = useState<string>('');

  // Game Engine & State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Statistics
  const [totalCorrectKeys, setTotalCorrectKeys] = useState<number>(0);
  const [totalMissedKeys, setTotalMissedKeys] = useState<number>(0);
  const [currentCombo, setCurrentCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);

  // Current Word & Engine
  const [currentWord, setCurrentWord] = useState<WordItem>({
    main: 'スタートを押して練習を開始',
    sub: 'すたーとおおしてれんしゅうをかいし',
    romaji: 'suta-to',
  });
  const [displayParts, setDisplayParts] = useState<DisplayParts>({
    done: '',
    activeBuffer: '',
    activeRemaining: '',
    future: 'suta-to',
  });
  const [targetKey, setTargetKey] = useState<string>('');
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [progressBarWidth, setProgressBarWidth] = useState<number>(0);

  // Modals
  const [pauseModalOpen, setPauseModalOpen] = useState<boolean>(false);
  const [resultModalOpen, setResultModalOpen] = useState<boolean>(false);
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [customModalOpen, setCustomModalOpen] = useState<boolean>(false);
  const [lastResultStats, setLastResultStats] = useState<ResultStats | null>(null);

  // Refs for state inside timer and listeners
  const particleCanvasRef = useRef<ParticleCanvasHandle | null>(null);
  const typingAreaRef = useRef<HTMLDivElement | null>(null);
  const wordQueueRef = useRef<WordItem[]>([]);
  const engineRef = useRef<KanaRomajiEngine | null>(null);
  const timerRef = useRef<number | null>(null);

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;
  const timeLimitRef = useRef(timeLimit);
  timeLimitRef.current = timeLimit;
  const elapsedTimeRef = useRef(elapsedTime);
  elapsedTimeRef.current = elapsedTime;
  const timeRemainingRef = useRef(timeRemaining);
  timeRemainingRef.current = timeRemaining;
  const totalCorrectRef = useRef(totalCorrectKeys);
  totalCorrectRef.current = totalCorrectKeys;
  const totalMissedRef = useRef(totalMissedKeys);
  totalMissedRef.current = totalMissedKeys;
  const currentComboRef = useRef(currentCombo);
  currentComboRef.current = currentCombo;
  const maxComboRef = useRef(maxCombo);
  maxComboRef.current = maxCombo;
  const categoryRef = useRef(category);
  categoryRef.current = category;
  const missLimitRef = useRef(missLimit);
  missLimitRef.current = missLimit;

  // Toggle sound
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEngine.enabled = next;
  };

  // Get active dataset
  const getDataset = useCallback(
    (cat: CategoryKey): WordItem[] => {
      if (cat === 'custom') {
        return customSentences;
      }
      return INITIAL_DATASETS[cat] || [];
    },
    [customSentences]
  );

  // Save custom sentences
  const saveCustom = (items: WordItem[]) => {
    setCustomSentences(items);
    try {
      localStorage.setItem('typemaster_custom_sentences', JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  };

  // Switch category
  const handleSelectCategory = (cat: CategoryKey) => {
    if (isPlaying) return;
    setCategory(cat);
  };

  // Set time limit
  const handleSelectTimeLimit = (sec: number) => {
    if (isPlaying) return;
    setTimeLimit(sec);
    setTimeRemaining(sec);
    setCustomTimeInput('');
  };

  const handleCustomTimeChange = (val: string) => {
    if (isPlaying) return;
    setCustomTimeInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      setTimeLimit(parsed);
      setTimeRemaining(parsed);
    }
  };

  const handleMissLimitChange = (val: string) => {
    if (isPlaying) return;
    setMissLimitInput(val);
    const parsed = parseInt(val, 10);
    const limit = !isNaN(parsed) && parsed > 0 ? parsed : 0;
    setMissLimit(limit);
  };

  // Stop Timer
  const clearGameTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // End Game
  const endGame = useCallback(() => {
    clearGameTimer();
    setIsPlaying(false);
    setIsPaused(false);
    setPauseModalOpen(false);

    soundEngine.playClearFanfare();

    const durationMinutes =
      elapsedTimeRef.current > 0 ? elapsedTimeRef.current / 60 : 0.1 / 60;
    const cpm = Math.round(totalCorrectRef.current / durationMinutes);
    const totalInputs = totalCorrectRef.current + totalMissedRef.current;
    const accuracyNum =
      totalInputs > 0 ? (totalCorrectRef.current / totalInputs) * 100 : 100;
    const accuracyStr = accuracyNum.toFixed(1);
    const score = Math.round(
      totalCorrectRef.current * 10 * (accuracyNum / 100) + maxComboRef.current * 5
    );

    let rank = 'D';
    let rankTitle = '初級タイピスト 🌱';
    let rankColor = 'from-slate-600 to-slate-800';

    if (cpm >= 320 && accuracyNum >= 97) {
      rank = 'SSS';
      rankTitle = '伝説の神速タイピスト 👑';
      rankColor = 'from-amber-400 via-rose-500 to-purple-600';
    } else if (cpm >= 260 && accuracyNum >= 95) {
      rank = 'SS';
      rankTitle = '超人タイピスト 🔥';
      rankColor = 'from-cyan-400 to-indigo-600';
    } else if (cpm >= 200 && accuracyNum >= 90) {
      rank = 'S';
      rankTitle = 'マスタータイピスト ⚡';
      rankColor = 'from-emerald-400 to-cyan-600';
    } else if (cpm >= 150) {
      rank = 'A';
      rankTitle = '上級タイピスト ✨';
      rankColor = 'from-blue-500 to-indigo-600';
    } else if (cpm >= 90) {
      rank = 'B';
      rankTitle = '中級タイピスト 👍';
      rankColor = 'from-slate-500 to-blue-600';
    }

    const stats: ResultStats = {
      cpm,
      accuracy: accuracyStr,
      accuracyNum,
      score,
      maxCombo: maxComboRef.current,
      totalCorrectKeys: totalCorrectRef.current,
      totalMissedKeys: totalMissedRef.current,
      rank,
      rankTitle,
      rankColor,
      category: categoryRef.current,
    };

    setLastResultStats(stats);
    setResultModalOpen(true);
    setTargetKey('');
  }, []);

  // Timer Tick
  const startTimer = useCallback(() => {
    clearGameTimer();
    timerRef.current = window.setInterval(() => {
      setElapsedTime((prev) => prev + 0.1);
      if (timeLimitRef.current > 0) {
        setTimeRemaining((prev) => {
          const next = prev - 0.1;
          if (next <= 0.0001) {
            endGame();
            return 0;
          }
          return next;
        });
      }
    }, 100);
  }, [endGame]);

  // Load next word
  const nextWord = useCallback(() => {
    const list = getDataset(categoryRef.current);
    if (wordQueueRef.current.length === 0) {
      wordQueueRef.current = [...list].sort(() => Math.random() - 0.5);
    }

    const word = wordQueueRef.current.pop() || list[0];
    setCurrentWord(word);

    const eng = new KanaRomajiEngine(word);
    engineRef.current = eng;

    setDisplayParts(eng.getDisplayParts());
    setTargetKey(eng.getTargetKey());
    setProgressBarWidth(0);
  }, [getDataset]);

  // Start Game
  const startGame = useCallback(() => {
    const dataset = getDataset(category);
    if (!dataset || dataset.length === 0) {
      alert(
        'このカテゴリには文章が登録されていません。「文章を編集」ボタンから課題を追加してください。'
      );
      setCustomModalOpen(true);
      return;
    }

    soundEngine.initCtx();

    setIsPlaying(true);
    setIsPaused(false);
    setPauseModalOpen(false);
    setResultModalOpen(false);

    setTotalCorrectKeys(0);
    setTotalMissedKeys(0);
    setCurrentCombo(0);
    setMaxCombo(0);
    setElapsedTime(0);
    setTimeRemaining(timeLimit);

    wordQueueRef.current = [...dataset].sort(() => Math.random() - 0.5);

    nextWord();
    startTimer();
  }, [category, getDataset, nextWord, startTimer, timeLimit]);

  // Pause / Resume
  const togglePause = useCallback(() => {
    if (!isPlayingRef.current) return;

    if (!isPausedRef.current) {
      clearGameTimer();
      setIsPaused(true);
      setPauseModalOpen(true);
    } else {
      setIsPaused(false);
      setPauseModalOpen(false);
      startTimer();
    }
  }, [startTimer]);

  const quitGame = useCallback(() => {
    clearGameTimer();
    setIsPlaying(false);
    setIsPaused(false);
    setPauseModalOpen(false);

    setCurrentWord({
      main: 'スタートを押して練習を開始',
      sub: 'すたーとおおしてれんしゅうをかいし',
      romaji: 'suta-to',
    });
    setDisplayParts({
      done: '',
      activeBuffer: '',
      activeRemaining: '',
      future: 'suta-to',
    });
    setTargetKey('');
    setProgressBarWidth(0);
    setTimeRemaining(timeLimit);
    setTotalCorrectKeys(0);
    setTotalMissedKeys(0);
    setCurrentCombo(0);
  }, [timeLimit]);

  // Process a key strike
  const processKey = useCallback(
    (keyChar: string) => {
      const eng = engineRef.current;
      if (!eng || !isPlayingRef.current || isPausedRef.current) return;

      const lower = keyChar.toLowerCase();
      setActiveKey(lower);
      setTimeout(() => setActiveKey(null), 120);

      const isCorrect = eng.handleKey(lower);

      if (isCorrect) {
        setTotalCorrectKeys((prev) => {
          const next = prev + 1;
          totalCorrectRef.current = next;
          return next;
        });

        setCurrentCombo((prev) => {
          const next = prev + 1;
          currentComboRef.current = next;
          if (next > maxComboRef.current) {
            maxComboRef.current = next;
            setMaxCombo(next);
          }
          if (next % 10 === 0) {
            soundEngine.playComboChime(next);
          }
          return next;
        });

        soundEngine.playKeySound();

        if (eng.isCompleted()) {
          if (typingAreaRef.current && particleCanvasRef.current) {
            const rect = typingAreaRef.current.getBoundingClientRect();
            particleCanvasRef.current.createExplosion(
              rect.left + rect.width / 2,
              rect.top + rect.height / 2
            );
          }
          nextWord();
        } else {
          setDisplayParts(eng.getDisplayParts());
          setTargetKey(eng.getTargetKey());
          const progress = (eng.tokenIndex / eng.tokens.length) * 100;
          setProgressBarWidth(progress);
        }
      } else {
        const nextMissed = totalMissedRef.current + 1;
        totalMissedRef.current = nextMissed;
        setTotalMissedKeys(nextMissed);
        setCurrentCombo(0);
        currentComboRef.current = 0;

        soundEngine.playErrorSound();

        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 260);

        // Challenge mode: end game when miss limit is reached
        if (missLimitRef.current > 0 && nextMissed >= missLimitRef.current) {
          endGame();
          return;
        }
      }
    },
    [endGame, nextWord]
  );

  // Global Keydown Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle pause with Escape
      if (e.key === 'Escape' || e.code === 'Escape') {
        if (isPlayingRef.current) {
          e.preventDefault();
          togglePause();
          return;
        }
      }

      if (isPausedRef.current) return;

      // Start game with Space when not playing
      if (!isPlayingRef.current && e.code === 'Space') {
        // Prevent starting if focus is inside an input modal
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
          return;
        }
        e.preventDefault();
        startGame();
        return;
      }

      if (!isPlayingRef.current) return;

      // Ignore special modifier keys like Shift, Control, Alt, Meta
      if (e.key.length > 1 && e.key !== ' ' && e.code !== 'Space') {
        return;
      }

      e.preventDefault();
      const char = e.code === 'Space' ? ' ' : e.key;
      processKey(char);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [processKey, startGame, togglePause]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => clearGameTimer();
  }, []);

  // Calculated Real-Time Metrics
  const minutes = elapsedTime > 0 ? elapsedTime / 60 : 0.1 / 60;
  const currentCPM = Math.round(totalCorrectKeys / minutes);
  const totalInputs = totalCorrectKeys + totalMissedKeys;
  const currentAccuracy =
    totalInputs > 0 ? ((totalCorrectKeys / totalInputs) * 100).toFixed(1) : '100.0';

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      {/* Particle Effect Canvas Background */}
      <ParticleCanvas ref={particleCanvasRef} />

      {/* Top Navigation Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 py-3 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-cyan-500/20">
              <i className="fa-solid fa-keyboard"></i>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                TypeMaster <span className="text-cyan-400 font-light text-sm">PRO</span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                タイピング速度 & 精度向上トレーニング
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              id="btnOpenCustomModal"
              onClick={() => setCustomModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition flex items-center space-x-2 shadow-sm hover:border-cyan-500/50 cursor-pointer"
            >
              <i className="fa-solid fa-pen-to-square text-cyan-400"></i>
              <span>文章を編集</span>
            </button>

            <button
              id="btnPause"
              onClick={togglePause}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition flex items-center space-x-2 cursor-pointer"
            >
              <i className="fa-solid fa-pause text-amber-400"></i>
              <span className="hidden sm:inline">一時停止 (Esc)</span>
            </button>

            <button
              id="btnToggleSound"
              onClick={handleToggleSound}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition flex items-center space-x-2 cursor-pointer"
            >
              <i
                id="soundIcon"
                className={
                  soundEnabled
                    ? 'fa-solid fa-volume-high text-cyan-400'
                    : 'fa-solid fa-volume-xmark text-slate-500'
                }
              ></i>
              <span id="soundLabel" className="hidden sm:inline">
                {soundEnabled ? 'サウンド: ON' : 'サウンド: OFF'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-grow max-w-5xl w-full mx-auto px-4 py-6 flex flex-col justify-center items-center space-y-6">
        {/* Control Bar: Category & Timer selection */}
        <div className="w-full bg-slate-900/80 border border-slate-800 p-3 sm:p-4 rounded-2xl backdrop-blur-md shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category buttons */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
              カテゴリ:
            </span>
            <button
              id="cat-japanese"
              onClick={() => handleSelectCategory('japanese')}
              className={`cat-btn py-2 px-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center space-x-1.5 transition cursor-pointer ${
                category === 'japanese'
                  ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300'
                  : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <i className="fa-solid fa-language"></i>
              <span>日本語</span>
            </button>
            <button
              id="cat-english"
              onClick={() => handleSelectCategory('english')}
              className={`cat-btn py-2 px-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center space-x-1.5 transition cursor-pointer ${
                category === 'english'
                  ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300'
                  : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <i className="fa-solid fa-font"></i>
              <span>English</span>
            </button>
            <button
              id="cat-programming"
              onClick={() => handleSelectCategory('programming')}
              className={`cat-btn py-2 px-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center space-x-1.5 transition cursor-pointer ${
                category === 'programming'
                  ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300'
                  : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <i className="fa-solid fa-code"></i>
              <span>コード</span>
            </button>
            <button
              id="cat-custom"
              onClick={() => handleSelectCategory('custom')}
              className={`cat-btn py-2 px-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center space-x-1.5 transition cursor-pointer ${
                category === 'custom'
                  ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300'
                  : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <i className="fa-solid fa-user-pen"></i>
              <span>カスタム</span>
            </button>
          </div>

          {/* Time Limit buttons */}
          <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 w-full md:w-auto flex-wrap gap-y-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
              時間制限:
            </span>
            <button
              id="time-15"
              onClick={() => handleSelectTimeLimit(15)}
              className={`time-btn py-1.5 px-3 rounded-xl border text-xs sm:text-sm font-medium transition cursor-pointer ${
                timeLimit === 15 && !customTimeInput
                  ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300'
                  : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              15秒
            </button>
            <button
              id="time-30"
              onClick={() => handleSelectTimeLimit(30)}
              className={`time-btn py-1.5 px-3 rounded-xl border text-xs sm:text-sm font-medium transition cursor-pointer ${
                timeLimit === 30 && !customTimeInput
                  ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300'
                  : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              30秒
            </button>
            <button
              id="time-60"
              onClick={() => handleSelectTimeLimit(60)}
              className={`time-btn py-1.5 px-3 rounded-xl border text-xs sm:text-sm font-medium transition cursor-pointer ${
                timeLimit === 60 && !customTimeInput
                  ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300'
                  : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              60秒
            </button>
            <button
              id="time-0"
              onClick={() => handleSelectTimeLimit(0)}
              className={`time-btn py-1.5 px-3 rounded-xl border text-xs sm:text-sm font-medium transition cursor-pointer ${
                timeLimit === 0 && !customTimeInput
                  ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300'
                  : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              無制限
            </button>

            {/* Custom Time Input */}
            <div className="flex items-center space-x-1 border border-slate-800 bg-slate-800/50 rounded-xl px-1.5 py-0.5">
              <input
                id="customTimeInput"
                type="number"
                min="0.1"
                max="3600"
                step="0.1"
                placeholder="カスタム"
                value={customTimeInput}
                onChange={(e) => handleCustomTimeChange(e.target.value)}
                className="w-16 bg-slate-950 border border-slate-700/80 rounded-lg px-1.5 py-1 text-xs font-mono-code text-center text-cyan-300 focus:outline-none focus:border-cyan-500 font-bold placeholder:text-slate-500 placeholder:font-normal"
              />
              <span className="text-xs text-slate-400 font-medium pr-1">秒</span>
            </div>
          </div>

          {/* Challenge Mode: Miss Limit */}
          <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 w-full md:w-auto flex-wrap gap-y-1.5">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider mr-1 flex items-center space-x-1">
              <i className="fa-solid fa-skull"></i>
              <span>チャレンジ:</span>
            </span>
            <div
              id="missLimitBox"
              className={`flex items-center space-x-1 border rounded-xl px-1.5 py-0.5 transition ${
                missLimit > 0
                  ? 'border-rose-500/50 bg-rose-950/40'
                  : 'border-slate-800 bg-slate-800/50'
              }`}
            >
              <span className="text-xs text-slate-400 font-medium pl-1">ミスタイプ</span>
              <input
                id="missLimitInput"
                type="number"
                min="1"
                max="9999"
                step="1"
                placeholder="OFF"
                value={missLimitInput}
                onChange={(e) => handleMissLimitChange(e.target.value)}
                className="w-14 bg-slate-950 border border-slate-700/80 rounded-lg px-1.5 py-1 text-xs font-mono-code text-center text-rose-300 focus:outline-none focus:border-rose-500 font-bold placeholder:text-slate-500 placeholder:font-normal"
              />
              <span className="text-xs text-slate-400 font-medium pr-1">回</span>
            </div>
          </div>
        </div>

        {/* Real-time Metrics Header */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 w-full">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-center backdrop-blur-md">
            <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">
              速度 (CPM)
            </div>
            <div
              id="statCPM"
              className="text-xl sm:text-3xl font-black text-cyan-400 mt-1 font-mono-code"
            >
              {currentCPM}
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-center backdrop-blur-md">
            <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">
              正確率
            </div>
            <div className="text-xl sm:text-3xl font-black text-emerald-400 mt-1 font-mono-code">
              <span id="statAccuracy">{currentAccuracy}</span>
              <span className="text-sm font-normal">%</span>
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-center backdrop-blur-md">
            <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">
              コンボ
            </div>
            <div
              id="statCombo"
              className="text-xl sm:text-3xl font-black text-amber-400 mt-1 font-mono-code"
            >
              {currentCombo}
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-center backdrop-blur-md">
            <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">
              残り時間
            </div>
            <div
              id="statTimer"
              className="text-xl sm:text-3xl font-black text-purple-400 mt-1 font-mono-code"
            >
              {timeLimit > 0 ? Math.max(0, timeRemaining).toFixed(1) : '∞'}
            </div>
          </div>
        </div>

        {/* Main Display Typing Area */}
        <div
          id="typingArea"
          ref={typingAreaRef}
          className={`relative w-full bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-6 sm:p-10 text-center shadow-2xl backdrop-blur-xl transition-all min-h-[220px] flex flex-col justify-center items-center overflow-hidden ${
            isShaking ? 'shake' : ''
          }`}
        >
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-800">
            <div
              id="progressBar"
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-150"
              style={{ width: `${progressBarWidth}%` }}
            ></div>
          </div>

          {/* Start Overlay Button */}
          {!isPlaying && (
            <div
              id="startOverlay"
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-20 flex flex-col items-center justify-center transition-opacity duration-300"
            >
              <button
                id="btnStartGame"
                onClick={startGame}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-lg sm:text-xl shadow-xl shadow-cyan-500/25 transition transform hover:scale-105 active:scale-95 flex items-center space-x-3 cursor-pointer"
              >
                <i className="fa-solid fa-play"></i>
                <span>スタート (SPACEキー)</span>
              </button>
              <p className="text-xs text-slate-400 mt-4">
                またはキーボードの [ Space ] を押して開始
              </p>
            </div>
          )}

          {/* Sentence Display */}
          <div
            id="displayMain"
            className="text-2xl sm:text-4xl font-extrabold text-white tracking-wide mb-2"
          >
            {currentWord.main}
          </div>

          <div
            id="displaySub"
            className="text-sm sm:text-base text-cyan-400/80 font-medium mb-6"
          >
            {currentWord.sub}
          </div>

          {/* Romaji / Key Target Display */}
          <div
            id="displayRomaji"
            className="text-xl sm:text-3xl font-mono-code tracking-wider text-slate-400 bg-slate-950/60 px-6 py-3 rounded-2xl border border-slate-800/80 max-w-full overflow-x-auto whitespace-nowrap"
          >
            {displayParts.done && (
              <span className="text-emerald-400 font-bold border-b-2 border-emerald-400">
                {displayParts.done}
              </span>
            )}
            {displayParts.activeBuffer && (
              <span className="text-emerald-300 font-bold border-b-2 border-emerald-400">
                {displayParts.activeBuffer}
              </span>
            )}
            {displayParts.activeRemaining && (
              <span className="text-cyan-300 font-bold bg-cyan-500/20 px-1 rounded animate-pulse border-b-2 border-cyan-400">
                {displayParts.activeRemaining}
              </span>
            )}
            {displayParts.future && (
              <span className="text-slate-500">{displayParts.future}</span>
            )}
          </div>
        </div>

        {/* Interactive Virtual Keyboard */}
        <VirtualKeyboard
          targetKey={targetKey}
          activeKey={activeKey}
          onKeyClick={(k) => processKey(k)}
        />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 py-4 text-center text-xs text-slate-500">
        TypeMaster Pro &copy; 2026 - 全てのキーボード練習に対応
      </footer>

      {/* Modals */}
      <PauseModal
        isOpen={pauseModalOpen}
        onResume={togglePause}
        onRestart={startGame}
        onQuit={quitGame}
      />

      <ResultModal
        isOpen={resultModalOpen}
        stats={lastResultStats}
        onRetry={startGame}
        onClose={() => setResultModalOpen(false)}
        onOpenAI={() => {
          setResultModalOpen(false);
          setAiModalOpen(true);
        }}
      />

      <AIModal
        isOpen={aiModalOpen}
        stats={lastResultStats}
        onClose={() => setAiModalOpen(false)}
      />

      <CustomModal
        isOpen={customModalOpen}
        customList={customSentences}
        onClose={() => setCustomModalOpen(false)}
        onAdd={(item) => {
          const next = [...customSentences, item];
          saveCustom(next);
        }}
        onDelete={(index) => {
          const next = customSentences.filter((_, i) => i !== index);
          saveCustom(next);
        }}
        onReset={() => saveCustom(DEFAULT_CUSTOM)}
        onStartCustomPractice={() => {
          setCustomModalOpen(false);
          setCategory('custom');
        }}
      />
    </div>
  );
}
