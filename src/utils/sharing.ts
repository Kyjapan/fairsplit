import LZString from 'lz-string';
import { Participant, RoleCoefficient, BillSplitData } from '@/types';

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
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.totalAmount === 'number' &&
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
 * クリップボードにコピー
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // フォールバック: テキストエリアを使用
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}