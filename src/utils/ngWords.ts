/**
 * Utility for detecting and preventing inappropriate words (NG words) in nicknames.
 * Covers Japanese profanities, insults, offensive slurs, violence, and common English profanities.
 */

// Normalized list of prohibited words and patterns
const NG_PATTERNS: RegExp[] = [
  // Violence / death / insults (Japanese)
  /死ね|シネ|しね|死ねよ|死に晒せ/i,
  /殺す|ころす|コロス|殺害|ブッ殺/i,
  /自殺|じさつ|首吊り/i,
  /ガイジ|がいじ|害児|障害児/i,
  /キチガイ|きちがい|気違い|気狂い/i,
  /馬鹿|バカ|ばか|あほ|アホ|阿呆/i,
  /クソ|くそ|糞|うんこ|ウンコ|小便|大便/i,
  /ゴミ|ごみ|屑|カス|かす/i,
  /死ね/i,

  // Sexual / Vulgar / Harassment (Japanese)
  /ちんこ|チンコ|ちんぽ|チンポ|陰茎|ペニス|penis/i,
  /まんこ|マンコ|陰部|オメコ|おめこ|クリトリス|ヴァギナ|vagina/i,
  /セックス|せっくす|\bsex\b/i,
  /オナニー|おなにー|自慰|射精|精子|精液/i,
  /童貞|処女|ヤリマン|やりまん|乱交/i,
  /おっぱい|巨乳|爆乳|母乳/i,
  /ポルノ|エロ|レイプ|強姦|痴漢/i,
  /風俗|ソープ|デリヘル/i,

  // Severe Slurs & English Profanities
  /\bfuck\b|\bfucking\b|\bfucker\b/i,
  /\bshit\b|\bbitch\b|\basshole\b/i,
  /\bcunt\b|\bdick\b|\bpussy\b/i,
  /\bnigger\b|\bnigga\b|\bfaggot\b|\bretard\b/i,
];

/**
 * Normalizes user input text by:
 * - Converting full-width characters (zenkaku) to half-width (hankaku)
 * - Lowercasing
 * - Stripping symbols, spaces, and punctuation intended to bypass filters
 */
export function normalizeText(raw: string): string {
  if (!raw) return '';

  // Zenkaku to hankaku for ASCII letters and numbers
  let text = raw.replace(/[！-～]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  );

  // Convert zenkaku spaces to halfwidth
  text = text.replace(/[\u3000]/g, ' ');

  // Lowercase
  text = text.toLowerCase();

  return text;
}

/**
 * Validates a nickname against prohibited words and general requirements.
 * Returns an error message string if invalid, or null if valid.
 */
export function validateNickname(nickname: string): { valid: boolean; error?: string } {
  const trimmed = nickname.trim();

  if (!trimmed) {
    return { valid: false, error: 'ニックネームを入力してください。' };
  }

  if (trimmed.length > 30) {
    return { valid: false, error: 'ニックネームは30文字以内で入力してください。' };
  }

  // Normalized version without spaces or symbols for obfuscation checks (e.g. "死・ね", "f u c k")
  const normalized = normalizeText(trimmed);
  const strippedSymbols = normalized.replace(/[\s\-_・.、。~〜!！?？*＊/\\]/g, '');

  for (const pattern of NG_PATTERNS) {
    if (pattern.test(normalized) || pattern.test(strippedSymbols)) {
      return {
        valid: false,
        error: 'ニックネームに不適切な言葉（NGワード）が含まれているため登録できません。別の名前を入力してください。',
      };
    }
  }

  return { valid: true };
}
