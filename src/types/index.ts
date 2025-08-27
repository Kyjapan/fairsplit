// 共通型定義

// 参加者の役職タイプ
export type Role = 'junior' | 'middle' | 'senior' | 'manager';

// 次会の種類（最大10次会まで対応）
export type PartySession = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// 参加者インターフェース
export interface Participant {
  id: string;
  name: string;
  role: Role;
  isOrganizer?: boolean; // 幹事フラグ (シンプルモード用)
  // 複数次会モード用
  participatingSessions?: PartySession[]; // 参加する次会の配列 [1, 2] = 1次会・2次会参加
  organizingSessions?: PartySession[]; // 幹事を務める次会の配列 [1, 3] = 1次会・3次会で幹事
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
  isOrganizer?: boolean; // 幹事フラグ
}

// 次会情報インターフェース
export interface SessionInfo {
  session: PartySession;
  amount: number;
  name: string; // "1次会", "2次会"など
}

// 複数次会用の精算結果
export interface MultiSessionCalculationResult {
  participantId: string;
  name: string;
  role: Role;
  sessionResults: {
    session: PartySession;
    amount: number;
    coefficient: number;
    isOrganizer: boolean;
  }[];
  totalAmount: number;
}

// アプリケーションモード
export type AppMode = 'simple' | 'multi-session';

// 精算データインターフェース（将来の拡張用）
export interface BillSplitData {
  eventName?: string;
  mode: AppMode;
  // シンプルモード用
  totalAmount?: number;
  // 複数次会モード用
  sessions?: SessionInfo[];
  participants: Participant[];
  roleCoefficients: RoleCoefficient;
  results: CalculationResult[] | MultiSessionCalculationResult[];
  createdAt: Date;
}