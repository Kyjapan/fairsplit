import { Participant, RoleCoefficient, CalculationResult } from '@/types';

/**
 * 傾斜配分計算を実行する
 */
export function calculateBillSplit(
  totalAmount: number,
  participants: Participant[],
  roleCoefficients: RoleCoefficient
): CalculationResult[] {
  if (participants.length === 0) {
    return [];
  }

  // 各参加者の係数を取得
  const participantsWithCoefficients = participants.map(participant => ({
    ...participant,
    coefficient: roleCoefficients[participant.role]
  }));

  // 係数の合計を計算
  const totalCoefficient = participantsWithCoefficients.reduce(
    (sum, p) => sum + p.coefficient,
    0
  );

  // 各参加者の基本金額を計算
  const participantsWithBaseAmounts = participantsWithCoefficients.map(participant => ({
    ...participant,
    baseAmount: (totalAmount * participant.coefficient) / totalCoefficient
  }));

  // 端数調整（幹事がいる場合は幹事が端数を負担、いない場合は100円単位で調整）
  const adjustedResults = adjustAmountWithRemainder(participantsWithBaseAmounts, totalAmount);

  return adjustedResults.map(result => ({
    participantId: result.id,
    name: result.name,
    role: result.role,
    coefficient: result.coefficient,
    amount: result.amount,
    ...(result.isOrganizer && { isOrganizer: result.isOrganizer })
  }));
}

/**
 * 端数調整（幹事がいる場合は幹事が端数負担、いない場合は100円単位調整）
 */
function adjustAmountWithRemainder(
  participants: Array<Participant & { coefficient: number; baseAmount: number }>,
  totalAmount: number
): Array<Participant & { coefficient: number; amount: number }> {
  // 幹事を探す
  const organizer = participants.find(p => p.isOrganizer);
  
  if (organizer) {
    // 幹事がいる場合：他の参加者は100円単位で切り捨て、幹事が残りを負担
    const results = participants.map(p => {
      if (p.isOrganizer) {
        // 幹事の金額は後で計算
        return { ...p, amount: 0 };
      } else {
        // 非幹事は100円単位で切り捨て
        return { ...p, amount: Math.floor(p.baseAmount / 100) * 100 };
      }
    });
    
    // 非幹事の合計金額
    const nonOrganizerTotal = results
      .filter(p => !p.isOrganizer)
      .reduce((sum, p) => sum + p.amount, 0);
    
    // 幹事が残りを負担
    const organizerAmount = totalAmount - nonOrganizerTotal;
    
    // 幹事の金額を設定
    return results.map(p => 
      p.isOrganizer ? { ...p, amount: organizerAmount } : p
    );
  } else {
    // 幹事がいない場合：従来の100円単位調整
    return adjustToHundredYen(participants, totalAmount);
  }
}

/**
 * 100円単位での端数調整（従来のロジック）
 */
function adjustToHundredYen(
  participants: Array<Participant & { coefficient: number; baseAmount: number }>,
  totalAmount: number
): Array<Participant & { coefficient: number; amount: number }> {
  // 100円単位で切り捨て
  const roundedParticipants = participants.map(p => ({
    ...p,
    amount: Math.floor(p.baseAmount / 100) * 100,
    remainder: p.baseAmount % 100
  }));

  // 調整済み金額の合計
  const currentTotal = roundedParticipants.reduce((sum, p) => sum + p.amount, 0);
  const difference = totalAmount - currentTotal;

  // 差額を100円単位で配分
  const adjustmentCount = Math.round(difference / 100);
  
  if (adjustmentCount > 0) {
    // 余りが大きい順にソート
    const sortedByRemainder = roundedParticipants
      .map((p, index) => ({ ...p, originalIndex: index }))
      .sort((a, b) => b.remainder - a.remainder);

    // 上位から100円ずつ追加
    for (let i = 0; i < Math.min(adjustmentCount, sortedByRemainder.length); i++) {
      sortedByRemainder[i].amount += 100;
    }

    // 元の順序に戻す
    return sortedByRemainder
      .sort((a, b) => a.originalIndex - b.originalIndex)
      .map(({ originalIndex, remainder, ...rest }) => rest);
  }

  return roundedParticipants.map(({ remainder, ...rest }) => rest);
}

/**
 * 計算結果の検証
 */
export function validateCalculation(
  results: CalculationResult[],
  totalAmount: number
): { isValid: boolean; calculatedTotal: number; difference: number } {
  const calculatedTotal = results.reduce((sum, result) => sum + result.amount, 0);
  const difference = Math.abs(calculatedTotal - totalAmount);
  
  return {
    isValid: difference === 0,
    calculatedTotal,
    difference
  };
}

/**
 * 端数があるかどうかをチェック（10円・1円の桁があるか）
 */
export function hasRemainder(totalAmount: number): boolean {
  return totalAmount % 100 !== 0;
}

/**
 * 幹事が設定されているかチェック
 */
export function hasOrganizer(participants: Participant[]): boolean {
  return participants.some(p => p.isOrganizer);
}

/**
 * 端数処理に関する警告メッセージを取得
 */
export function getRemainderWarning(totalAmount: number, participants: Participant[]): string | null {
  if (hasRemainder(totalAmount) && !hasOrganizer(participants)) {
    const remainder = totalAmount % 100;
    return `合計金額に${remainder}円の端数があります。正確な計算のため、幹事を設定してください。`;
  }
  return null;
}

/**
 * 計算結果のフォーマット
 */
export function formatCalculationResults(results: CalculationResult[]): string {
  const roleLabels = {
    junior: 'ジュニア',
    middle: 'ミドル', 
    senior: 'シニア',
    manager: 'マネージャー'
  };

  return results
    .map(result => 
      `${result.name}（${roleLabels[result.role]}${result.isOrganizer ? '・幹事' : ''}）: ¥${result.amount.toLocaleString()}`
    )
    .join('\n');
}