// バリデーション用ユーティリティ関数

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ParticipantValidationError {
  name?: string;
  duplicate?: string;
}

export interface FormValidationError {
  eventName?: string;
  totalAmount?: string;
  participants?: string;
  general?: string;
}

/**
 * 参加者名のバリデーション
 */
export const validateParticipantName = (name: string, existingNames: string[]): ParticipantValidationError => {
  const errors: ParticipantValidationError = {};
  const trimmedName = name.trim();

  // 空文字チェック
  if (!trimmedName) {
    errors.name = '名前を入力してください';
    return errors;
  }

  // 長さチェック
  if (trimmedName.length > 20) {
    errors.name = '名前は20文字以内で入力してください';
    return errors;
  }

  // 不正文字チェック
  const invalidChars = /[<>"/\\&]/;
  if (invalidChars.test(trimmedName)) {
    errors.name = '使用できない文字が含まれています';
    return errors;
  }

  // 重複チェック（大文字小文字区別なし）
  const isDuplicate = existingNames.some(
    existing => existing.toLowerCase() === trimmedName.toLowerCase()
  );
  if (isDuplicate) {
    errors.duplicate = 'この名前は既に登録されています';
    return errors;
  }

  return errors;
};

/**
 * 合計金額のバリデーション
 */
export const validateTotalAmount = (amount: string): ValidationResult => {
  const errors: string[] = [];
  const trimmedAmount = amount.trim();

  // 空文字チェック
  if (!trimmedAmount) {
    errors.push('合計金額を入力してください');
    return { isValid: false, errors };
  }

  // 数値変換チェック
  const numAmount = parseFloat(trimmedAmount);
  if (isNaN(numAmount)) {
    errors.push('有効な数値を入力してください');
    return { isValid: false, errors };
  }

  // 範囲チェック
  if (numAmount <= 0) {
    errors.push('金額は0より大きい値を入力してください');
    return { isValid: false, errors };
  }

  if (numAmount > 10000000) {
    errors.push('金額は1000万円以下で入力してください');
    return { isValid: false, errors };
  }

  // 小数点チェック（円単位）
  if (numAmount % 1 !== 0) {
    errors.push('円単位で入力してください（小数点は使用できません）');
    return { isValid: false, errors };
  }

  return { isValid: true, errors: [] };
};

/**
 * イベント名のバリデーション
 */
export const validateEventName = (name: string): ValidationResult => {
  const errors: string[] = [];
  const trimmedName = name.trim();

  // 任意項目なので空文字は許可
  if (!trimmedName) {
    return { isValid: true, errors: [] };
  }

  // 長さチェック
  if (trimmedName.length > 50) {
    errors.push('イベント名は50文字以内で入力してください');
  }

  // 不正文字チェック
  const invalidChars = /[<>"/\\&]/;
  if (invalidChars.test(trimmedName)) {
    errors.push('使用できない文字が含まれています');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * フォーム全体のバリデーション
 */
export const validateForm = (
  eventName: string,
  totalAmount: string,
  participantCount: number
): FormValidationError => {
  const errors: FormValidationError = {};

  // イベント名バリデーション
  const eventNameResult = validateEventName(eventName);
  if (!eventNameResult.isValid) {
    errors.eventName = eventNameResult.errors[0];
  }

  // 合計金額バリデーション
  const totalAmountResult = validateTotalAmount(totalAmount);
  if (!totalAmountResult.isValid) {
    errors.totalAmount = totalAmountResult.errors[0];
  }

  // 参加者数チェック
  if (participantCount === 0) {
    errors.participants = '参加者を1人以上追加してください';
  } else if (participantCount > 100) {
    errors.participants = '参加者は100人以下で設定してください';
  }

  return errors;
};

/**
 * 役職係数のバリデーション
 */
export const validateRoleCoefficient = (coefficient: number): ValidationResult => {
  const errors: string[] = [];

  if (isNaN(coefficient)) {
    errors.push('有効な数値を入力してください');
    return { isValid: false, errors };
  }

  if (coefficient <= 0) {
    errors.push('係数は0より大きい値を入力してください');
    return { isValid: false, errors };
  }

  if (coefficient > 10) {
    errors.push('係数は10以下で設定してください');
    return { isValid: false, errors };
  }

  return { isValid: true, errors: [] };
};