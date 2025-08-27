import { Participant, RoleCoefficient, CalculationResult, SessionInfo, MultiSessionCalculationResult, PartySession } from '@/types';

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

/**
 * 複数次会用の傾斜配分計算を実行する
 */
export function calculateMultiSessionBillSplit(
  sessions: SessionInfo[],
  participants: Participant[],
  roleCoefficients: RoleCoefficient
): MultiSessionCalculationResult[] {
  // 金額が0より大きい次会のみを計算対象とする
  const activeSessions = sessions.filter(session => session.amount > 0);
  
  if (participants.length === 0 || activeSessions.length === 0) {
    return [];
  }

  const results: MultiSessionCalculationResult[] = participants.map(participant => {
    const sessionResults = activeSessions.map(session => {
      // この参加者がこの次会に参加しているかチェック
      const isParticipating = (participant.participatingSessions || []).includes(session.session);
      
      if (!isParticipating) {
        return {
          session: session.session,
          amount: 0,
          coefficient: 0,
          isOrganizer: false
        };
      }

      // この次会の参加者のみを抽出
      const sessionParticipants = participants.filter(p => 
        (p.participatingSessions || []).includes(session.session)
      );

      if (sessionParticipants.length === 0) {
        return {
          session: session.session,
          amount: 0,
          coefficient: 0,
          isOrganizer: false
        };
      }

      // この次会での参加者の係数を取得
      const coefficient = roleCoefficients[participant.role];
      
      // この次会の係数合計を計算
      const totalCoefficient = sessionParticipants.reduce(
        (sum, p) => sum + roleCoefficients[p.role],
        0
      );

      // この参加者がこの次会で幹事を務めるかチェック
      const isOrganizer = (participant.organizingSessions || []).includes(session.session);

      // 基本金額を計算
      const baseAmount = (session.amount * coefficient) / totalCoefficient;

      return {
        session: session.session,
        amount: baseAmount,
        coefficient: coefficient,
        isOrganizer: isOrganizer
      };
    }).filter(result => result.amount > 0); // 参加しない次会は除外

    return {
      participantId: participant.id,
      name: participant.name,
      role: participant.role,
      sessionResults: sessionResults,
      totalAmount: sessionResults.reduce((sum, result) => sum + result.amount, 0)
    };
  });

  // 各次会で端数調整を実行
  return adjustMultiSessionAmountWithRemainder(results, activeSessions, participants);
}

/**
 * 複数次会での端数調整
 */
function adjustMultiSessionAmountWithRemainder(
  results: MultiSessionCalculationResult[],
  sessions: SessionInfo[],
  participants: Participant[]
): MultiSessionCalculationResult[] {
  const adjustedResults = [...results];

  sessions.forEach(session => {
    // この次会の参加者を取得
    const sessionParticipants = participants.filter(p => 
      (p.participatingSessions || []).includes(session.session)
    );

    // この次会の幹事を探す
    const organizer = sessionParticipants.find(p => 
      (p.organizingSessions || []).includes(session.session)
    );

    // この次会の結果を取得
    const sessionResults = adjustedResults.map(result => ({
      ...result,
      sessionResult: result.sessionResults.find(sr => sr.session === session.session)
    })).filter(r => r.sessionResult);

    if (organizer) {
      // 幹事がいる場合：他の参加者は100円単位で切り捨て、幹事が残りを負担
      let nonOrganizerTotal = 0;

      sessionResults.forEach(result => {
        if (result.participantId !== organizer.id && result.sessionResult) {
          // 非幹事は100円単位で切り捨て
          const roundedAmount = Math.floor(result.sessionResult.amount / 100) * 100;
          result.sessionResult.amount = roundedAmount;
          nonOrganizerTotal += roundedAmount;

          // 元の結果を更新
          const originalResult = adjustedResults.find(r => r.participantId === result.participantId);
          if (originalResult) {
            const sessionResultIndex = originalResult.sessionResults.findIndex(sr => sr.session === session.session);
            if (sessionResultIndex !== -1) {
              originalResult.sessionResults[sessionResultIndex].amount = roundedAmount;
            }
          }
        }
      });

      // 幹事が残りを負担
      const organizerAmount = session.amount - nonOrganizerTotal;
      const organizerResult = adjustedResults.find(r => r.participantId === organizer.id);
      if (organizerResult) {
        const sessionResultIndex = organizerResult.sessionResults.findIndex(sr => sr.session === session.session);
        if (sessionResultIndex !== -1) {
          organizerResult.sessionResults[sessionResultIndex].amount = organizerAmount;
        }
      }
    } else {
      // 幹事がいない場合：従来の100円単位調整
      adjustMultiSessionToHundredYen(sessionResults, session.amount, adjustedResults);
    }
  });

  // 合計金額を再計算
  adjustedResults.forEach(result => {
    result.totalAmount = result.sessionResults.reduce((sum, sr) => sum + sr.amount, 0);
  });

  return adjustedResults;
}

/**
 * 複数次会での100円単位調整
 */
function adjustMultiSessionToHundredYen(
  sessionResults: Array<{ participantId: string; sessionResult: any }>,
  sessionAmount: number,
  adjustedResults: MultiSessionCalculationResult[]
): void {
  // 100円単位で切り捨て
  const roundedResults = sessionResults.map(result => ({
    ...result,
    roundedAmount: Math.floor(result.sessionResult.amount / 100) * 100,
    remainder: result.sessionResult.amount % 100
  }));

  // 調整済み金額の合計
  const currentTotal = roundedResults.reduce((sum, r) => sum + r.roundedAmount, 0);
  const difference = sessionAmount - currentTotal;

  // 差額を100円単位で配分
  const adjustmentCount = Math.round(difference / 100);
  
  if (adjustmentCount > 0) {
    // 余りが大きい順にソート
    const sortedByRemainder = roundedResults
      .map((r, index) => ({ ...r, originalIndex: index }))
      .sort((a, b) => b.remainder - a.remainder);

    // 上位から100円ずつ追加
    for (let i = 0; i < Math.min(adjustmentCount, sortedByRemainder.length); i++) {
      sortedByRemainder[i].roundedAmount += 100;
    }

    // 元の結果を更新
    sortedByRemainder.forEach(sorted => {
      const originalResult = adjustedResults.find(r => r.participantId === sorted.participantId);
      if (originalResult) {
        const sessionResultIndex = originalResult.sessionResults.findIndex(sr => sr.session === sorted.sessionResult.session);
        if (sessionResultIndex !== -1) {
          originalResult.sessionResults[sessionResultIndex].amount = sorted.roundedAmount;
        }
      }
    });
  } else {
    // 切り捨てのみの場合
    roundedResults.forEach(rounded => {
      const originalResult = adjustedResults.find(r => r.participantId === rounded.participantId);
      if (originalResult) {
        const sessionResultIndex = originalResult.sessionResults.findIndex(sr => sr.session === rounded.sessionResult.session);
        if (sessionResultIndex !== -1) {
          originalResult.sessionResults[sessionResultIndex].amount = rounded.roundedAmount;
        }
      }
    });
  }
}

/**
 * 複数次会計算結果の検証
 */
export function validateMultiSessionCalculation(
  results: MultiSessionCalculationResult[],
  sessions: SessionInfo[]
): { isValid: boolean; sessionTotals: { session: PartySession; calculatedTotal: number; expectedTotal: number; difference: number }[] } {
  const activeSessions = sessions.filter(s => s.amount > 0);
  
  const sessionTotals = activeSessions.map(session => {
    const calculatedTotal = results.reduce((sum, result) => {
      const sessionResult = result.sessionResults.find(sr => sr.session === session.session);
      return sum + (sessionResult ? sessionResult.amount : 0);
    }, 0);
    
    const difference = Math.abs(calculatedTotal - session.amount);
    
    return {
      session: session.session,
      calculatedTotal,
      expectedTotal: session.amount,
      difference
    };
  });

  const isValid = sessionTotals.every(st => st.difference === 0);

  return {
    isValid,
    sessionTotals
  };
}