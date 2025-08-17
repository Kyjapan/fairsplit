'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import AddParticipantForm from '@/components/AddParticipantForm';
import RoleSettingsForm, { RoleCoefficient } from '@/components/RoleSettingsForm';
import { validateForm, validateTotalAmount, validateEventName, FormValidationError } from '@/utils/validation';

interface Participant {
  id: string;
  name: string;
  role: 'junior' | 'middle' | 'senior' | 'manager';
}

export default function HomePage() {
  const [eventName, setEventName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRoleSettingsOpen, setIsRoleSettingsOpen] = useState(false);
  const [roleCoefficients, setRoleCoefficients] = useState<RoleCoefficient>({
    junior: 1.0,
    middle: 1.3,
    senior: 1.5,
    manager: 2.0,
  });
  const [formErrors, setFormErrors] = useState<FormValidationError>({});

  const addParticipant = (participantData: Omit<Participant, 'id'>) => {
    const newParticipant: Participant = {
      ...participantData,
      id: crypto.randomUUID(),
    };
    setParticipants([...participants, newParticipant]);
    setIsAddModalOpen(false);
  };

  const getRoleLabel = (role: Participant['role']) => {
    const roleMap = {
      junior: 'ジュニア',
      middle: 'ミドル', 
      senior: 'シニア',
      manager: 'マネージャー',
    };
    return roleMap[role];
  };

  const updateRoleCoefficients = (newCoefficients: RoleCoefficient) => {
    setRoleCoefficients(newCoefficients);
    setIsRoleSettingsOpen(false);
  };

  // リアルタイムバリデーション
  const handleEventNameChange = (value: string) => {
    setEventName(value);
    const validation = validateEventName(value);
    setFormErrors(prev => ({
      ...prev,
      eventName: validation.isValid ? undefined : validation.errors[0]
    }));
  };

  const handleTotalAmountChange = (value: string) => {
    setTotalAmount(value);
    const validation = validateTotalAmount(value);
    setFormErrors(prev => ({
      ...prev,
      totalAmount: validation.isValid ? undefined : validation.errors[0]
    }));
  };

  // フォーム送信前の統合バリデーション
  const handleCalculate = () => {
    const errors = validateForm(eventName, totalAmount, participants.length);
    setFormErrors(errors);
    
    const hasErrors = Object.keys(errors).length > 0;
    if (!hasErrors) {
      // 計算処理を実行
      console.log('計算実行 - バリデーション通過');
      // TODO: 計算ロジック実装
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        {/* デスクトップ表示 */}
        <div className="hidden md:flex items-center justify-between mb-4">
          <div></div>
          <h1 className="text-3xl font-bold text-primary-600">
            新しい精算を作成
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRoleSettingsOpen(true)}
            className="flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>係数設定</span>
          </Button>
        </div>
        
        {/* モバイル表示 */}
        <div className="md:hidden mb-4 space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-600">
            新しい精算を作成
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRoleSettingsOpen(true)}
            className="flex items-center space-x-1 mx-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.5 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>係数設定</span>
          </Button>
        </div>
        
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 px-4 md:px-0">
          役職に応じた公平な割り勘を自動計算します
        </p>
      </div>

      <div className="space-y-6">
        {/* 基本情報入力 */}
        <Card title="基本情報">
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="eventName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                イベント名（任意）
              </label>
              <input
                type="text"
                id="eventName"
                value={eventName}
                onChange={(e) => handleEventNameChange(e.target.value)}
                placeholder="例: 歓送迎会、忘年会"
                className={`input-field text-base sm:text-sm ${formErrors.eventName ? 'border-error-500 focus:ring-error-500' : ''}`}
              />
              {formErrors.eventName && (
                <p className="text-sm text-error-500 mt-1">{formErrors.eventName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="totalAmount" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                合計金額 <span className="text-error-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="totalAmount"
                  value={totalAmount}
                  onChange={(e) => handleTotalAmountChange(e.target.value)}
                  placeholder="20000"
                  className={`input-field text-base sm:text-sm pr-12 ${formErrors.totalAmount ? 'border-error-500 focus:ring-error-500' : ''}`}
                  min="0"
                  step="100"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-neutral-500 dark:text-neutral-400 text-sm">円</span>
                </div>
              </div>
              {formErrors.totalAmount ? (
                <p className="text-sm text-error-500 mt-1">{formErrors.totalAmount}</p>
              ) : (
                <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                  円単位で入力してください
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* 参加者管理 */}
        <Card title="参加者">
          <div className="space-y-4">
            {participants.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className={`text-sm sm:text-base ${formErrors.participants ? 'text-error-500' : 'text-neutral-500 dark:text-neutral-400'}`}>
                  {formErrors.participants || '参加者を追加してください'}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-md space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <div className="font-medium text-neutral-900 dark:text-neutral-100 text-base sm:text-sm">
                        {participant.name}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 sm:mt-0 sm:inline sm:ml-2">
                        {getRoleLabel(participant.role)}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setParticipants(participants.filter(p => p.id !== participant.id));
                      }}
                      className="self-end sm:self-auto w-auto sm:w-auto min-h-[44px] sm:min-h-auto"
                    >
                      削除
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <Button
              variant="secondary"
              onClick={() => setIsAddModalOpen(true)}
              className="w-full min-h-[44px] text-base sm:text-sm"
            >
              + 参加者を追加
            </Button>
          </div>
        </Card>

        {/* 計算実行 */}
        <div className="flex justify-center px-4 sm:px-0">
          <Button
            variant="primary"
            size="lg"
            disabled={!totalAmount || participants.length === 0}
            onClick={handleCalculate}
            className="w-full sm:w-auto min-h-[52px] text-base sm:text-lg font-semibold"
          >
            精算額を計算する
          </Button>
        </div>
      </div>

      {/* 参加者追加モーダル */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="参加者を追加"
      >
        <AddParticipantForm
          onAdd={addParticipant}
          onCancel={() => setIsAddModalOpen(false)}
          coefficients={roleCoefficients}
          existingNames={participants.map((p: Participant) => p.name)}
        />
      </Modal>

      {/* 役職係数設定モーダル */}
      <Modal
        isOpen={isRoleSettingsOpen}
        onClose={() => setIsRoleSettingsOpen(false)}
        title="役職係数の設定"
      >
        <RoleSettingsForm
          coefficients={roleCoefficients}
          onUpdate={updateRoleCoefficients}
          onCancel={() => setIsRoleSettingsOpen(false)}
        />
      </Modal>
    </div>
  );
}