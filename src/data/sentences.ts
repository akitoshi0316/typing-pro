import { CategoryKey, WordItem } from '../types';

export const DEFAULT_CUSTOM: WordItem[] = [
  {
    main: '自分の好きな言葉を入力しよう！',
    sub: 'じぶんのすきなことばをにゅうりょくしよう！',
    romaji: 'jibunnosukinakotobawonyuuryokushyou!',
  },
  {
    main: 'タイピング練習',
    sub: 'たいぴんぐれんしゅう',
    romaji: 'taipingurenshuu',
  },
  {
    main: 'カスタム文章モード',
    sub: 'かすたむぶんしょうもーど',
    romaji: 'kasutamubunshoumo-do',
  },
];

export const INITIAL_DATASETS: Record<CategoryKey, WordItem[]> = {
  japanese: [
    { main: 'こんにちは', sub: 'こんにちは', romaji: 'konnichiha' },
    { main: 'プログラミング', sub: 'ぷろぐらみんぐ', romaji: 'puroguramingu' },
    { main: '迅速な対応', sub: 'じんそくなたいおう', romaji: 'jinsokunataiou' },
    { main: '情報処理技術者', sub: 'じょうほうしょりぎじゅつしゃ', romaji: 'jouhoushorigijutsusha' },
    { main: '人工知能の発展', sub: 'じんこうちのうのはってん', romaji: 'jinkoutinounohatten' },
    { main: '継続は力なり', sub: 'けいぞくはちからなり', romaji: 'keizokuhachikaranari' },
    { main: 'キーボード入力', sub: 'きーぼーどにゅうりょく', romaji: 'ki-bo-donyuuryoku' },
    { main: 'クラウドサービス', sub: 'くらうどさーびす', romaji: 'kuraudosa-bisu' },
    { main: '創造的な思考', sub: 'そうぞうてきなしこう', romaji: 'souzoutekinashikou' },
    { main: '最高のパフォーマンス', sub: 'さいこうのぱふぉーまんす', romaji: 'saikounopafo-mansu' },
    { main: '明日は明日の風が吹く', sub: 'あしたはあしたのかぜがふく', romaji: 'ashitahaashitanokazegafuku' },
  ],
  english: [
    { main: 'Hello World', sub: 'Standard greeting', romaji: 'hello world' },
    { main: 'Speed Typing', sub: 'Fast typing test', romaji: 'speed typing' },
    { main: 'Artificial Intelligence', sub: 'AI technology', romaji: 'artificial intelligence' },
    { main: 'Keyboard Shortcut', sub: 'Productivity tip', romaji: 'keyboard shortcut' },
    { main: 'Responsive Design', sub: 'Web development', romaji: 'responsive design' },
    { main: 'Continuous Learning', sub: 'Growth mindset', romaji: 'continuous learning' },
    { main: 'Algorithm and Data Structure', sub: 'Computer science', romaji: 'algorithm and data structure' },
  ],
  programming: [
    { main: "const express = require('express');", sub: 'Node.js Server setup', romaji: "const express = require('express');" },
    { main: 'function calculateTotal(price) {', sub: 'JS Function syntax', romaji: 'function calculatetotal(price) {' },
    { main: "document.getElementById('app');", sub: 'DOM Manipulation', romaji: "document.getelementbyid('app');" },
    { main: "import React, { useState } from 'react';", sub: 'React Hook import', romaji: "import react, { usestate } from 'react';" },
    { main: "git commit -m 'Initial commit'", sub: 'Git Command', romaji: "git commit -m 'initial commit'" },
  ],
  custom: [],
};
