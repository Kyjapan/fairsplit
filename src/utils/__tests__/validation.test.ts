import {
  validateEventName,
  validateTotalAmount,
  validateParticipantName,
  validateForm,
  validateRoleCoefficient,
} from '../validation';

describe('Validation Utils', () => {
  describe('validateEventName', () => {
    it('TC002: 正常なイベント名を受け入れる', () => {
      const result = validateEventName('忘年会');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('空文字を受け入れる（任意項目）', () => {
      const result = validateEventName('');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('TC003: 51文字以上の文字列でエラーを返す', () => {
      const longName = 'あ'.repeat(51);
      const result = validateEventName(longName);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('イベント名は50文字以内で入力してください');
    });

    it('不正文字でエラーを返す', () => {
      const result = validateEventName('<script>');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('使用できない文字が含まれています');
    });
  });

  describe('validateTotalAmount', () => {
    it('TC004: 正常な金額を受け入れる', () => {
      const result = validateTotalAmount('20000');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('TC005-1: 0でエラーを返す', () => {
      const result = validateTotalAmount('0');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('金額は0より大きい値を入力してください');
    });

    it('TC005-2: 非数値でエラーを返す', () => {
      const result = validateTotalAmount('abc');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('有効な数値を入力してください');
    });

    it('TC005-3: 小数点でエラーを返す', () => {
      const result = validateTotalAmount('100.5');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('円単位で入力してください（小数点は使用できません）');
    });

    it('空文字でエラーを返す', () => {
      const result = validateTotalAmount('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('合計金額を入力してください');
    });

    it('上限超過でエラーを返す', () => {
      const result = validateTotalAmount('10000001');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('金額は1000万円以下で入力してください');
    });
  });

  describe('validateParticipantName', () => {
    it('TC007: 正常な参加者名を受け入れる', () => {
      const result = validateParticipantName('田中太郎', []);
      expect(Object.keys(result)).toHaveLength(0);
    });

    it('TC008-1: 空文字でエラーを返す', () => {
      const result = validateParticipantName('', []);
      expect(result.name).toBe('名前を入力してください');
    });

    it('TC008-2: 21文字以上でエラーを返す', () => {
      const longName = 'あ'.repeat(21);
      const result = validateParticipantName(longName, []);
      expect(result.name).toBe('名前は20文字以内で入力してください');
    });

    it('TC008-3: 不正文字でエラーを返す', () => {
      const result = validateParticipantName('<script>', []);
      expect(result.name).toBe('使用できない文字が含まれています');
    });

    it('TC009: 重複名前でエラーを返す', () => {
      const result = validateParticipantName('田中太郎', ['田中太郎']);
      expect(result.duplicate).toBe('この名前は既に登録されています');
    });

    it('大文字小文字を区別しない重複チェック', () => {
      const result = validateParticipantName('TANAKA', ['tanaka']);
      expect(result.duplicate).toBe('この名前は既に登録されています');
    });
  });

  describe('validateForm', () => {
    it('TC015: 正常な入力で成功', () => {
      const result = validateForm('忘年会', '20000', 2);
      expect(Object.keys(result)).toHaveLength(0);
    });

    it('参加者0人でエラーを返す', () => {
      const result = validateForm('忘年会', '20000', 0);
      expect(result.participants).toBe('参加者を1人以上追加してください');
    });

    it('参加者101人でエラーを返す', () => {
      const result = validateForm('忘年会', '20000', 101);
      expect(result.participants).toBe('参加者は100人以下で設定してください');
    });

    it('複数エラーを返す', () => {
      const result = validateForm('', 'abc', 0);
      expect(result.totalAmount).toBe('有効な数値を入力してください');
      expect(result.participants).toBe('参加者を1人以上追加してください');
    });
  });

  describe('validateRoleCoefficient', () => {
    it('正常な係数を受け入れる', () => {
      const result = validateRoleCoefficient(1.5);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('NaNでエラーを返す', () => {
      const result = validateRoleCoefficient(NaN);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('有効な数値を入力してください');
    });

    it('0以下でエラーを返す', () => {
      const result = validateRoleCoefficient(0);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('係数は0より大きい値を入力してください');
    });

    it('10超過でエラーを返す', () => {
      const result = validateRoleCoefficient(11);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('係数は10以下で設定してください');
    });
  });
});