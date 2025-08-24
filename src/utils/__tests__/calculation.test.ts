import { calculateBillSplit, hasRemainder, hasOrganizer, getRemainderWarning, validateCalculation } from '../calculation';
import { Participant, RoleCoefficient } from '@/types';

const defaultCoefficients: RoleCoefficient = {
  junior: 1.0,
  middle: 1.3,
  senior: 1.5,
  manager: 2.0,
};

describe('calculation utilities', () => {
  describe('hasRemainder', () => {
    it('10円・1円の桁がある場合にtrueを返す', () => {
      expect(hasRemainder(1234)).toBe(true);
      expect(hasRemainder(1001)).toBe(true);
      expect(hasRemainder(1010)).toBe(true);
    });

    it('100円単位の場合にfalseを返す', () => {
      expect(hasRemainder(1200)).toBe(false);
      expect(hasRemainder(1000)).toBe(false);
      expect(hasRemainder(2500)).toBe(false);
    });
  });

  describe('hasOrganizer', () => {
    it('幹事がいる場合にtrueを返す', () => {
      const participants: Participant[] = [
        { id: '1', name: '田中', role: 'junior', isOrganizer: false },
        { id: '2', name: '佐藤', role: 'manager', isOrganizer: true },
      ];
      expect(hasOrganizer(participants)).toBe(true);
    });

    it('幹事がいない場合にfalseを返す', () => {
      const participants: Participant[] = [
        { id: '1', name: '田中', role: 'junior' },
        { id: '2', name: '佐藤', role: 'manager' },
      ];
      expect(hasOrganizer(participants)).toBe(false);
    });
  });

  describe('getRemainderWarning', () => {
    const participants: Participant[] = [
      { id: '1', name: '田中', role: 'junior' },
      { id: '2', name: '佐藤', role: 'manager' },
    ];

    it('端数があり幹事がいない場合に警告メッセージを返す', () => {
      const warning = getRemainderWarning(1234, participants);
      expect(warning).toBe('合計金額に34円の端数があります。正確な計算のため、幹事を設定してください。');
    });

    it('端数がない場合にnullを返す', () => {
      const warning = getRemainderWarning(1200, participants);
      expect(warning).toBeNull();
    });

    it('幹事がいる場合にnullを返す', () => {
      const participantsWithOrganizer: Participant[] = [
        { id: '1', name: '田中', role: 'junior' },
        { id: '2', name: '佐藤', role: 'manager', isOrganizer: true },
      ];
      const warning = getRemainderWarning(1234, participantsWithOrganizer);
      expect(warning).toBeNull();
    });
  });

  describe('calculateBillSplit with organizer', () => {
    it('幹事がいる場合、幹事が端数を負担する', () => {
      const participants: Participant[] = [
        { id: '1', name: '田中', role: 'junior', isOrganizer: false },
        { id: '2', name: '佐藤', role: 'manager', isOrganizer: true },
        { id: '3', name: '鈴木', role: 'middle', isOrganizer: false },
      ];

      const results = calculateBillSplit(1234, participants, defaultCoefficients);
      
      // 結果の基本チェック
      expect(results).toHaveLength(3);
      
      // 合計金額の検証
      const total = results.reduce((sum, r) => sum + r.amount, 0);
      expect(total).toBe(1234);
      
      // 非幹事は100円単位で切り捨て
      const nonOrganizerResults = results.filter(r => !r.isOrganizer);
      nonOrganizerResults.forEach(result => {
        expect(result.amount % 100).toBe(0);
      });
      
      // 幹事が端数を負担
      const organizerResult = results.find(r => r.isOrganizer);
      expect(organizerResult).toBeDefined();
      expect(organizerResult!.name).toBe('佐藤');
    });

    it('幹事がいない場合、従来の100円単位調整を行う', () => {
      const participants: Participant[] = [
        { id: '1', name: '田中', role: 'junior' },
        { id: '2', name: '佐藤', role: 'manager' },
      ];

      const results = calculateBillSplit(1234, participants, defaultCoefficients);
      
      // 合計金額の検証
      const validation = validateCalculation(results, 1234);
      expect(validation.isValid).toBe(true);
      
      // 全員が100円単位
      results.forEach(result => {
        expect(result.amount % 100).toBe(0);
      });
    });

    it('複数の参加者がいても正しく計算される', () => {
      const participants: Participant[] = [
        { id: '1', name: '田中', role: 'junior', isOrganizer: false },
        { id: '2', name: '佐藤', role: 'manager', isOrganizer: true },
        { id: '3', name: '鈴木', role: 'middle', isOrganizer: false },
        { id: '4', name: '高橋', role: 'senior', isOrganizer: false },
      ];

      const results = calculateBillSplit(2500, participants, defaultCoefficients);
      
      // 全参加者が結果に含まれる
      expect(results).toHaveLength(4);
      
      // 参加者の順序が保持される
      expect(results[0].name).toBe('田中');
      expect(results[1].name).toBe('佐藤');
      expect(results[2].name).toBe('鈴木');
      expect(results[3].name).toBe('高橋');
      
      // 合計金額が正確
      const total = results.reduce((sum, r) => sum + r.amount, 0);
      expect(total).toBe(2500);
    });
  });

  describe('validateCalculation', () => {
    it('計算結果が正確な場合にvalidを返す', () => {
      const results = [
        { participantId: '1', name: '田中', role: 'junior' as const, coefficient: 1.0, amount: 800 },
        { participantId: '2', name: '佐藤', role: 'manager' as const, coefficient: 2.0, amount: 1200 },
      ];

      const validation = validateCalculation(results, 2000);
      expect(validation.isValid).toBe(true);
      expect(validation.calculatedTotal).toBe(2000);
      expect(validation.difference).toBe(0);
    });

    it('計算結果が不正確な場合にinvalidを返す', () => {
      const results = [
        { participantId: '1', name: '田中', role: 'junior' as const, coefficient: 1.0, amount: 800 },
        { participantId: '2', name: '佐藤', role: 'manager' as const, coefficient: 2.0, amount: 1100 },
      ];

      const validation = validateCalculation(results, 2000);
      expect(validation.isValid).toBe(false);
      expect(validation.calculatedTotal).toBe(1900);
      expect(validation.difference).toBe(100);
    });
  });
});