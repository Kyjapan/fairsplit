// 共通型定義

// 参加者の役職タイプ
export type Role = 'junior' | 'middle' | 'senior' | 'manager';

// 参加者インターフェース
export interface Participant {
  id: string;
  name: string;
  role: Role;
}

// 役職係数インターフェース
export interface RoleCoefficient {
  junior: number;
  middle: number;
  senior: number;
  manager: number;
}

// フォームバリデーションエラー
export interface FormValidationError {
  eventName?: string;
  totalAmount?: string;
  participants?: string;
  general?: string;
}

// 参加者バリデーションエラー
export interface ParticipantValidationError {
  name?: string;
  duplicate?: string;
}

// バリデーション結果
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// 精算結果インターフェース（将来の拡張用）
export interface CalculationResult {
  participantId: string;
  name: string;
  role: Role;
  coefficient: number;
  amount: number;
}

// 精算データインターフェース（将来の拡張用）
export interface BillSplitData {
  eventName?: string;
  totalAmount: number;
  participants: Participant[];
  roleCoefficients: RoleCoefficient;
  results: CalculationResult[];
  createdAt: Date;
}