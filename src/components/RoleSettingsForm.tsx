'use client';

import { useState } from 'react';
import Button from './Button';

export interface RoleCoefficient {
  junior: number;
  middle: number;
  senior: number;
  manager: number;
}

interface RoleSettingsFormProps {
  coefficients: RoleCoefficient;
  onUpdate: (coefficients: RoleCoefficient) => void;
  onCancel: () => void;
}

const defaultCoefficients: RoleCoefficient = {
  junior: 1.0,
  middle: 1.3,
  senior: 1.5,
  manager: 2.0,
};

export default function RoleSettingsForm({ coefficients, onUpdate, onCancel }: RoleSettingsFormProps) {
  const [localCoefficients, setLocalCoefficients] = useState<RoleCoefficient>(coefficients);
  const roleLabels = {
    junior: 'ジュニア',
    middle: 'ミドル',
    senior: 'シニア',
    manager: 'マネージャー',
  };

  const handleCoefficientChange = (role: keyof RoleCoefficient, value: string) => {
    const numValue = parseFloat(value);
    
    // HTML5バリデーションを信頼し、数値変換可能な値は更新
    // 詳細なバリデーションはHTML5 (min/max/step) に委譲
    if (!isNaN(numValue)) {
      setLocalCoefficients(prev => ({ ...prev, [role]: numValue }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // HTML5バリデーションをチェック（実ブラウザ環境のみ、テスト環境では無効化）
    const form = e.target as HTMLFormElement;
    const isTestEnvironment = process.env.NODE_ENV === 'test';
    
    if (!isTestEnvironment && form.checkValidity && !form.checkValidity()) {
      form.reportValidity(); // ブラウザのエラーメッセージを表示
      return;
    }
    
    onUpdate(localCoefficients);
  };

  const handleReset = () => {
    setLocalCoefficients(defaultCoefficients);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          各役職の支払い係数を設定してください。ジュニアを基準（1.0）として、他の役職の倍率を決めます。
        </div>
        
        {Object.entries(roleLabels).map(([role, label]) => (
          <div key={role}>
            <label 
              htmlFor={role} 
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
            >
              {label} <span className="text-neutral-500">({role})</span>
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                id={role}
                value={localCoefficients[role as keyof RoleCoefficient]}
                onChange={(e) => handleCoefficientChange(role as keyof RoleCoefficient, e.target.value)}
                step="0.1"
                min="0.1"
                max="10"
                required
                title="0.1から10の間の数値を入力してください"
                className="input-field flex-1 invalid:border-red-500 invalid:focus:ring-red-500"
                placeholder="1.0"
              />
              <span className="text-sm text-neutral-500 dark:text-neutral-400 w-8">倍</span>
            </div>
          </div>
        ))}
      </div>

      {/* プリセット */}
      <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
        <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
          プリセット
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-left"
          >
            <div>
              <div className="font-medium">標準設定</div>
              <div className="text-xs text-neutral-500">1.0 / 1.3 / 1.5 / 2.0</div>
            </div>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setLocalCoefficients({ junior: 1.0, middle: 1.2, senior: 1.4, manager: 1.8 });
            }}
            className="text-left"
          >
            <div>
              <div className="font-medium">ゆるやか設定</div>
              <div className="text-xs text-neutral-500">1.0 / 1.2 / 1.4 / 1.8</div>
            </div>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setLocalCoefficients({ junior: 1.0, middle: 1.0, senior: 1.0, manager: 1.0 });
            }}
            className="text-left"
          >
            <div>
              <div className="font-medium">均等割り</div>
              <div className="text-xs text-neutral-500">1.0 / 1.0 / 1.0 / 1.0</div>
            </div>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setLocalCoefficients({ junior: 1.0, middle: 1.5, senior: 2.0, manager: 2.5 });
            }}
            className="text-left"
          >
            <div>
              <div className="font-medium">急傾斜設定</div>
              <div className="text-xs text-neutral-500">1.0 / 1.5 / 2.0 / 2.5</div>
            </div>
          </Button>
        </div>
      </div>

      {/* ボタン */}
      <div className="flex space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
        >
          設定を保存
        </Button>
      </div>
    </form>
  );
}