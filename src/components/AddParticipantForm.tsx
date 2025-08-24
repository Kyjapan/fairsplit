'use client';

import { useState } from 'react';
import Button from './Button';
import { RoleCoefficient } from './RoleSettingsForm';
import { validateParticipantName } from '@/utils/validation';

interface Participant {
  id: string;
  name: string;
  role: 'junior' | 'middle' | 'senior' | 'manager';
}

interface AddParticipantFormProps {
  onAdd: (participant: Omit<Participant, 'id'>) => void;
  onCancel: () => void;
  coefficients: RoleCoefficient;
  existingNames: string[];
}

export default function AddParticipantForm({ onAdd, onCancel, coefficients, existingNames }: AddParticipantFormProps) {
  const getRoleOptions = () => [
    { value: 'junior', label: 'ジュニア', description: `新人・若手（係数: ${coefficients.junior}x）` },
    { value: 'middle', label: 'ミドル', description: `中堅（係数: ${coefficients.middle}x）` },
    { value: 'senior', label: 'シニア', description: `上級（係数: ${coefficients.senior}x）` },
    { value: 'manager', label: 'マネージャー', description: `管理職（係数: ${coefficients.manager}x）` },
  ] as const;
  const [name, setName] = useState('');
  const [role, setRole] = useState<'junior' | 'middle' | 'senior' | 'manager'>('junior');
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; duplicate?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    const validationErrors = validateParticipantName(name, existingNames);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // 参加者追加
    onAdd({ name: name.trim(), role, ...(isOrganizer && { isOrganizer }) });
    
    // フォームリセット
    setName('');
    setRole('junior');
    setIsOrganizer(false);
    setErrors({});
  };

  const handleNameChange = (value: string) => {
    setName(value);
    // リアルタイムバリデーション
    if (errors.name || errors.duplicate) {
      const validationErrors = validateParticipantName(value, existingNames);
      setErrors(validationErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* 名前入力 */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          名前 <span className="text-error-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="例: 田中太郎"
          className={`input-field text-base sm:text-sm ${(errors.name || errors.duplicate) ? 'border-error-500 focus:ring-error-500' : ''}`}
        />
        {(errors.name || errors.duplicate) && (
          <p className="text-sm text-error-500 mt-1">{errors.name || errors.duplicate}</p>
        )}
      </div>

      {/* 役職選択 */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          役職・レベル
        </label>
        <div className="space-y-3">
          {getRoleOptions().map((option) => (
            <label
              key={option.value}
              className={`flex items-start p-4 border rounded-md cursor-pointer transition-colors min-h-[44px] ${
                role === option.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500'
              }`}
            >
              <input
                type="radio"
                name="role"
                value={option.value}
                checked={role === option.value}
                onChange={(e) => setRole(e.target.value as typeof role)}
                className="mt-1 text-primary-500 focus:ring-primary-500 w-4 h-4 sm:w-auto sm:h-auto"
              />
              <div className="ml-3 flex-1">
                <div className="font-medium text-neutral-900 dark:text-neutral-100 text-base sm:text-sm">
                  {option.label}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  {option.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 幹事設定 */}
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isOrganizer}
            onChange={(e) => setIsOrganizer(e.target.checked)}
            className="rounded border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500 dark:bg-neutral-700"
          />
          <span className="text-sm text-neutral-700 dark:text-neutral-300">
            この参加者を幹事に設定する
          </span>
        </label>
        <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          幹事は端数（10円・1円の桁）を負担します
        </div>
      </div>

      {/* ボタン */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 min-h-[44px] text-base sm:text-sm order-2 sm:order-1"
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1 min-h-[44px] text-base sm:text-sm order-1 sm:order-2"
        >
          追加
        </Button>
      </div>
    </form>
  );
}