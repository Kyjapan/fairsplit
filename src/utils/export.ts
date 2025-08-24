import { CalculationResult } from '@/types';

/**
 * CSV生成
 */
export function generateCSV(results: CalculationResult[], eventName: string, totalAmount: number): string {
  const roleLabels = {
    junior: 'ジュニア',
    middle: 'ミドル', 
    senior: 'シニア',
    manager: 'マネージャー'
  };

  // ヘッダー行
  const headers = ['名前', '役職', '係数', '金額', '支払状況'];
  
  // データ行
  const rows = results.map(result => [
    result.name,
    roleLabels[result.role],
    result.coefficient.toString(),
    result.amount.toString(),
    '未'
  ]);

  // 合計行を追加
  const totalRow = ['合計', '', '', totalAmount.toString(), ''];
  
  // CSVコンテンツの生成
  const csvRows = [
    // イベント情報（空行で区切り）
    eventName ? [`イベント名: ${eventName}`] : [],
    [`合計金額: ${totalAmount.toLocaleString()}円`],
    [`参加者数: ${results.length}名`],
    [`作成日時: ${new Date().toLocaleString('ja-JP')}`],
    [''], // 空行
    headers,
    ...rows,
    [''], // 空行
    totalRow
  ].filter(row => row.length > 0); // 空配列を除去

  const csvContent = csvRows.map(row => row.join(',')).join('\n');
  
  // BOMを追加してExcelでの文字化けを防ぐ
  return '\uFEFF' + csvContent;
}

/**
 * CSVファイルのダウンロード
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // メモリリークを防ぐためにオブジェクトURLを削除
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
}

/**
 * CSVファイル名の生成
 */
export function generateCSVFilename(eventName: string): string {
  const date = new Date().toISOString().split('T')[0];
  const name = eventName ? eventName.replace(/[/\\?%*:|"<>]/g, '_') : '無題';
  return `精算結果_${name}_${date}.csv`;
}