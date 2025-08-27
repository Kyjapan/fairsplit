import LZString from 'lz-string';
import { Participant, RoleCoefficient, BillSplitData, SessionInfo, AppMode } from '@/types';

/**
 * 精算データをURL用に圧縮
 */
export function compressDataForURL(
  eventName: string,
  totalAmount: number,
  participants: Participant[],
  roleCoefficients: RoleCoefficient
): string {
  const data: BillSplitData = {
    eventName,
    mode: 'simple',
    totalAmount,
    participants,
    roleCoefficients,
    results: [], // URL共有時は結果は含めない
    createdAt: new Date()
  };

  const jsonString = JSON.stringify(data);
  return LZString.compressToEncodedURIComponent(jsonString);
}

/**
 * 複数次会用精算データをURL用に圧縮
 */
export function compressMultiSessionDataForURL(
  eventName: string,
  sessions: SessionInfo[],
  participants: Participant[],
  roleCoefficients: RoleCoefficient
): string {
  const data: BillSplitData = {
    eventName,
    mode: 'multi-session',
    sessions,
    participants,
    roleCoefficients,
    results: [], // URL共有時は結果は含めない
    createdAt: new Date()
  };

  const jsonString = JSON.stringify(data);
  return LZString.compressToEncodedURIComponent(jsonString);
}

/**
 * 圧縮されたURLデータを復元
 */
export function decompressDataFromURL(compressedData: string): BillSplitData | null {
  try {
    const jsonString = LZString.decompressFromEncodedURIComponent(compressedData);
    if (!jsonString) return null;
    
    const data = JSON.parse(jsonString);
    
    // データ構造の検証
    if (!isValidBillSplitData(data)) {
      console.error('Invalid bill split data structure');
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to decompress URL data:', error);
    return null;
  }
}

/**
 * BillSplitDataの構造検証
 */
function isValidBillSplitData(data: any): data is BillSplitData {
  const baseValidation = (
    typeof data === 'object' &&
    data !== null &&
    typeof data.mode === 'string' &&
    ['simple', 'multi-session'].includes(data.mode) &&
    Array.isArray(data.participants) &&
    typeof data.roleCoefficients === 'object' &&
    data.participants.every((p: any) => 
      typeof p.id === 'string' &&
      typeof p.name === 'string' &&
      ['junior', 'middle', 'senior', 'manager'].includes(p.role)
    ) &&
    typeof data.roleCoefficients.junior === 'number' &&
    typeof data.roleCoefficients.middle === 'number' &&
    typeof data.roleCoefficients.senior === 'number' &&
    typeof data.roleCoefficients.manager === 'number'
  );

  if (!baseValidation) return false;

  // モード別の検証
  if (data.mode === 'simple') {
    return typeof data.totalAmount === 'number';
  } else if (data.mode === 'multi-session') {
    return (
      Array.isArray(data.sessions) &&
      data.sessions.length > 0 &&
      data.sessions.every((s: any) => 
        typeof s.session === 'number' &&
        typeof s.amount === 'number' &&
        typeof s.name === 'string'
      )
    );
  }

  return false;
}

/**
 * 共有URLの生成
 */
export function generateShareURL(
  eventName: string,
  totalAmount: number,
  participants: Participant[],
  roleCoefficients: RoleCoefficient
): string {
  const compressedData = compressDataForURL(eventName, totalAmount, participants, roleCoefficients);
  const baseURL = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseURL}?data=${compressedData}`;
}

/**
 * 複数次会用共有URLの生成
 */
export function generateMultiSessionShareURL(
  eventName: string,
  sessions: SessionInfo[],
  participants: Participant[],
  roleCoefficients: RoleCoefficient
): string {
  const compressedData = compressMultiSessionDataForURL(eventName, sessions, participants, roleCoefficients);
  const baseURL = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseURL}?data=${compressedData}`;
}

/**
 * クリップボードにコピー
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // フォールバック: テキストエリアを使用（安全なDOM操作）
      let textArea: HTMLTextAreaElement | null = null;
      
      try {
        textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const success = document.execCommand('copy');
        return success;
      } finally {
        // 確実なクリーンアップ
        if (textArea && textArea.parentNode) {
          document.body.removeChild(textArea);
        }
      }
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}