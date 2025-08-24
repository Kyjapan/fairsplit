'use client';

import { useState } from 'react';
import Button from './Button';
import { Role } from '@/types';

interface ParticipantEntry {
  name: string;
  role: Role;
  isOrganizer?: boolean;
}

interface BulkAddParticipantFormProps {
  onAdd: (participants: ParticipantEntry[]) => void;
  onCancel: () => void;
  existingNames: string[];
}

export default function BulkAddParticipantForm({ onAdd, onCancel, existingNames }: BulkAddParticipantFormProps) {
  const [participants, setParticipants] = useState<ParticipantEntry[]>([
    { name: '', role: 'junior', isOrganizer: false }
  ]);
  const [errors, setErrors] = useState<string[]>([]);

  const roleLabels = {
    junior: 'ジュニア',
    middle: 'ミドル',
    senior: 'シニア',
    manager: 'マネージャー',
  };

  const addParticipantRow = () => {
    setParticipants([...participants, { name: '', role: 'junior', isOrganizer: false }]);
  };

  const removeParticipantRow = (index: number) => {
    if (participants.length > 1) {
      const newParticipants = participants.filter((_, i) => i !== index);
      setParticipants(newParticipants);
    }
  };

  const updateParticipant = (index: number, field: keyof ParticipantEntry, value: string | boolean) => {
    const newParticipants = [...participants];
    if (field === 'role') {
      newParticipants[index][field] = value as Role;
    } else if (field === 'isOrganizer') {
      newParticipants[index][field] = value as boolean;
    } else {
      newParticipants[index][field] = value as string;
    }
    setParticipants(newParticipants);
  };

  const validateParticipants = (): string[] => {
    const errors: string[] = [];
    const names = new Set<string>();

    participants.forEach((participant, index) => {
      const trimmedName = participant.name.trim();
      
      // 名前の必須チェック
      if (!trimmedName) {
        errors.push(`${index + 1}行目: 名前を入力してください`);
        return;
      }

      // 文字数チェック
      if (trimmedName.length > 20) {
        errors.push(`${index + 1}行目: 名前は20文字以内で入力してください`);
      }

      // 重複チェック（入力内での重複）
      if (names.has(trimmedName)) {
        errors.push(`${index + 1}行目: "${trimmedName}" は既に入力されています`);
      } else {
        names.add(trimmedName);
      }

      // 既存の参加者との重複チェック
      if (existingNames.includes(trimmedName)) {
        errors.push(`${index + 1}行目: "${trimmedName}" は既に登録されています`);
      }
    });

    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateParticipants();
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      const validParticipants = participants
        .map(p => ({ ...p, name: p.name.trim() }))
        .filter(p => p.name);
      
      onAdd(validParticipants);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          複数の参加者を一度に追加できます。各行に名前と役職を入力し、幹事がいる場合はチェックを入れてください。
        </div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-700 p-3 rounded-md">
          💡 幹事は端数（10円・1円の桁）を負担します。通常は1名を幹事に設定してください。
        </div>

        {/* エラー表示 */}
        {errors.length > 0 && (
          <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-md p-4">
            <div className="text-sm text-error-700 dark:text-error-400">
              <div className="font-medium mb-2">入力エラー:</div>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 参加者入力行 */}
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 px-1">
            <div className="col-span-4">名前</div>
            <div className="col-span-4">役職</div>
            <div className="col-span-2">幹事</div>
            <div className="col-span-2">操作</div>
          </div>

          {participants.map((participant, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              {/* 名前入力 */}
              <div className="col-span-4">
                <input
                  type="text"
                  value={participant.name}
                  onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                  placeholder={`参加者${index + 1}`}
                  className="input-field text-sm"
                  maxLength={20}
                />
              </div>

              {/* 役職選択 */}
              <div className="col-span-4">
                <select
                  value={participant.role}
                  onChange={(e) => updateParticipant(index, 'role', e.target.value)}
                  className="input-field text-sm"
                >
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 幹事チェック */}
              <div className="col-span-2 flex justify-center items-center">
                <input
                  type="radio"
                  name="organizer"
                  checked={participant.isOrganizer || false}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // 他の参加者の幹事フラグをクリア
                      const newParticipants = participants.map((p, i) => ({
                        ...p,
                        isOrganizer: i === index
                      }));
                      setParticipants(newParticipants);
                    }
                  }}
                  className="text-primary-600 focus:ring-primary-500 w-4 h-4"
                />
              </div>

              {/* 削除ボタン */}
              <div className="col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeParticipantRow(index)}
                  disabled={participants.length <= 1}
                  className="w-full text-xs"
                >
                  削除
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* 行追加ボタン */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addParticipantRow}
          className="w-full"
          disabled={participants.length >= 10}
        >
          + 参加者を追加
        </Button>

        {participants.length >= 10 && (
          <div className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
            一度に追加できるのは10名までです
          </div>
        )}
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
          disabled={participants.every(p => !p.name.trim())}
        >
          {participants.filter(p => p.name.trim()).length}名を追加
        </Button>
      </div>
    </form>
  );
}