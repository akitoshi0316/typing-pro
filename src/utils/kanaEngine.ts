import { DisplayParts, WordItem } from '../types';

export const KANA_MAP: Record<string, string[]> = {
  'あ': ['a'], 'い': ['i', 'yi'], 'う': ['u', 'wu', 'whu'], 'え': ['e', 'le', 'xe'], 'お': ['o', 'co'],
  'か': ['ka', 'ca'], 'き': ['ki'], 'く': ['ku', 'cu', 'qu'], 'け': ['ke'], 'こ': ['ko', 'co'],
  'さ': ['sa'], 'し': ['si', 'shi', 'ci'], 'す': ['su'], 'せ': ['se', 'ce'], 'そ': ['so'],
  'た': ['ta'], 'ち': ['ti', 'chi', 'ci'], 'つ': ['tu', 'tsu'], 'て': ['te'], 'と': ['to'],
  'な': ['na'], 'に': ['ni'], 'ぬ': ['nu'], 'ね': ['ne'], 'の': ['no'],
  'は': ['ha', 'wa'], 'ひ': ['hi'], 'ふ': ['hu', 'fu'], 'へ': ['he', 'e'], 'ほ': ['ho'],
  'ま': ['ma'], 'み': ['mi'], 'む': ['mu'], 'め': ['me'], 'も': ['mo'],
  'や': ['ya'], 'ゆ': ['yu'], 'よ': ['yo'],
  'ら': ['ra'], 'り': ['ri'], 'る': ['ru'], 'れ': ['re'], 'ろ': ['ro'],
  'わ': ['wa'], 'ゐ': ['wi'], 'ゑ': ['we'], 'を': ['wo', 'o'],
  'ん': ['nn', 'xn'], // Dynamic single 'n' handled in logic

  'が': ['ga'], 'ぎ': ['gi'], 'ぐ': ['gu'], 'げ': ['ge'], 'ご': ['go'],
  'ざ': ['za'], 'じ': ['ji', 'zi'], 'ず': ['zu'], 'ぜ': ['ze'], 'ぞ': ['zo'],
  'だ': ['da'], 'ぢ': ['di'], 'づ': ['du'], 'で': ['de'], 'ど': ['do'],
  'ば': ['ba'], 'び': ['bi'], 'ぶ': ['bu'], 'べ': ['be'], 'ぼ': ['bo'],
  'ぱ': ['pa'], 'ぴ': ['pi'], 'ぷ': ['pu'], 'ぺ': ['pe'], 'ぽ': ['po'],

  'きゃ': ['kya'], 'きゅ': ['kyu'], 'きょ': ['kyo'],
  'しゃ': ['sya', 'sha'], 'しゅ': ['syu', 'shu'], 'しょ': ['syo', 'sho'], 'しぇ': ['sye', 'she'],
  'ちゃ': ['tya', 'cha', 'cya'], 'ちゅ': ['tyu', 'chu', 'cyu'], 'ちょ': ['tyo', 'cho', 'cyo'], 'ちぇ': ['tye', 'che', 'cye'],
  'にゃ': ['nya'], 'にゅ': ['nyu'], 'にょ': ['nyo'],
  'ひゃ': ['hya'], 'ひゅ': ['hyu'], 'ひょ': ['hyo'],
  'みゃ': ['mya'], 'みゅ': ['myu'], 'みょ': ['myo'],
  'りゃ': ['rya'], 'りゅ': ['ryu'], 'りょ': ['ryo'],
  'ぎゃ': ['gya'], 'ぎゅ': ['gyu'], 'ぎょ': ['gyo'],
  'じゃ': ['ja', 'zya', 'jya'], 'じゅ': ['ju', 'zyu', 'jyu'], 'じょ': ['jo', 'zyo', 'jyo'], 'じぇ': ['je', 'zye', 'jye'],
  'びゃ': ['bya'], 'びゅ': ['byu'], 'びょ': ['byo'],
  'ぴゃ': ['pya'], 'ぴゅ': ['pyu'], 'ぴょ': ['pyo'],
  'ふぁ': ['fa', 'fua'], 'ふぃ': ['fi', 'fui'], 'ふぇ': ['fe', 'fue'], 'ふぉ': ['fo', 'fuo'],
  'てぃ': ['thi'], 'てゅ': ['thu'], 'でぃ': ['dhi'], 'でゅ': ['dhu'],
  'うぃ': ['wi'], 'うぇ': ['we'], 'うぉ': ['who'],

  'ぁ': ['la', 'xa'], 'ぃ': ['li', 'xi'], 'ぅ': ['lu', 'xu'], 'ぇ': ['le', 'xe'], 'ぉ': ['lo', 'xo'],
  'ゃ': ['lya', 'xya'], 'ゅ': ['lyu', 'xyu'], 'ょ': ['lyo', 'xyo'], 'ゎ': ['lwa', 'xwa'],
  'っ': ['ltu', 'ltsu', 'xtu', 'xtsu'],
  'ー': ['-'], '、': [','], '。': ['.'], '！': ['!'], '？': ['?'],
  ' ': [' ']
};

export function tokenizeHiragana(text: string): string[] {
  // Normalize katakana to hiragana
  const hiragana = text.replace(/[\u30a1-\u30f6]/g, match => {
    return String.fromCharCode(match.charCodeAt(0) - 0x60);
  });

  const tokens: string[] = [];
  let i = 0;
  while (i < hiragana.length) {
    if (i + 1 < hiragana.length) {
      const pair = hiragana.slice(i, i + 2);
      if (KANA_MAP[pair]) {
        tokens.push(pair);
        i += 2;
        continue;
      }
    }
    tokens.push(hiragana[i]);
    i++;
  }
  return tokens;
}

export class KanaRomajiEngine {
  public main: string;
  public sub: string;
  public rawRomaji: string;
  public tokens: string[];
  public tokenIndex: number = 0;
  public currentBuffer: string = '';
  public completedRomaji: string = '';

  constructor(wordObj: WordItem) {
    this.main = wordObj.main;
    this.sub = wordObj.sub || wordObj.main;
    this.rawRomaji = wordObj.romaji || '';

    const isJapanese = /[\u3040-\u309F\u30A0-\u30FF]/.test(this.sub);

    if (isJapanese) {
      this.tokens = tokenizeHiragana(this.sub);
    } else {
      const srcStr = (this.rawRomaji || this.sub).toLowerCase();
      this.tokens = srcStr.split('');
    }
  }

  getOptionsForToken(idx: number): string[] {
    if (idx >= this.tokens.length) return [];
    const token = this.tokens[idx];

    if (!KANA_MAP[token]) {
      return [token.toLowerCase()];
    }

    const options = [...KANA_MAP[token]];

    // Rule for 'っ' (Sokuon geminate consonant)
    if (token === 'っ') {
      const nextToken = this.tokens[idx + 1];
      if (nextToken) {
        const nextOptions = this.getOptionsForToken(idx + 1);
        nextOptions.forEach(opt => {
          const firstChar = opt[0];
          if (/^[bcdfghjklmnpqrstvwxz]$/.test(firstChar)) {
            if (!options.includes(firstChar)) {
              options.unshift(firstChar);
            }
          }
        });
      }
    }

    return options;
  }

  handleKey(key: string): boolean {
    key = key.toLowerCase();
    if (this.isCompleted()) return false;

    const options = this.getOptionsForToken(this.tokenIndex);
    const testBuffer = this.currentBuffer + key;

    const matchingOptions = options.filter(opt => opt.startsWith(testBuffer));

    if (matchingOptions.length > 0) {
      this.currentBuffer = testBuffer;

      const exactMatch = matchingOptions.find(opt => opt === testBuffer);

      if (exactMatch) {
        this.completedRomaji += exactMatch;
        this.currentBuffer = '';
        this.tokenIndex++;
      }
      return true;
    } else {
      // Special fallback for 'ん': single 'n' dynamic processing
      if (this.tokens[this.tokenIndex] === 'ん' && this.currentBuffer === 'n') {
        if (this.tokenIndex + 1 < this.tokens.length) {
          const nextOptions = this.getOptionsForToken(this.tokenIndex + 1);
          const startsWithVowelYN = nextOptions.some(opt => /^[aiueoyn]/.test(opt));
          if (!startsWithVowelYN) {
            const matchesNext = nextOptions.some(opt => opt.startsWith(key));
            if (matchesNext) {
              this.completedRomaji += 'n';
              this.currentBuffer = '';
              this.tokenIndex++;
              return this.handleKey(key);
            }
          }
        } else {
          // 'ん' is the last token
          this.completedRomaji += 'n';
          this.currentBuffer = '';
          this.tokenIndex++;
          return true;
        }
      }
      return false;
    }
  }

  isCompleted(): boolean {
    return this.tokenIndex >= this.tokens.length;
  }

  getTargetKey(): string {
    if (this.isCompleted()) return '';
    const options = this.getOptionsForToken(this.tokenIndex);
    const matching = options.filter(opt => opt.startsWith(this.currentBuffer));
    const targetOpt = matching[0] || options[0] || '';
    if (targetOpt.length > this.currentBuffer.length) {
      return targetOpt[this.currentBuffer.length].toLowerCase();
    }
    return '';
  }

  getDisplayParts(): DisplayParts {
    if (!this.isCompleted()) {
      const options = this.getOptionsForToken(this.tokenIndex);
      const matching = options.filter(opt => opt.startsWith(this.currentBuffer));
      const activeOpt = matching[0] || options[0] || '';
      const remainingActive = activeOpt.slice(this.currentBuffer.length);

      let futureTokensStr = '';
      for (let i = this.tokenIndex + 1; i < this.tokens.length; i++) {
        const opts = this.getOptionsForToken(i);
        futureTokensStr += opts[0] || '';
      }

      return {
        done: this.completedRomaji,
        activeBuffer: this.currentBuffer,
        activeRemaining: remainingActive,
        future: futureTokensStr,
      };
    } else {
      return {
        done: this.completedRomaji,
        activeBuffer: '',
        activeRemaining: '',
        future: '',
      };
    }
  }
}
