'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import AddParticipantForm from '@/components/AddParticipantForm';
import BulkAddParticipantForm from '@/components/BulkAddParticipantForm';
import RoleSettingsForm, { RoleCoefficient } from '@/components/RoleSettingsForm';
import { validateForm, validateTotalAmount, validateEventName, FormValidationError } from '@/utils/validation';
import { calculateBillSplit, validateCalculation, formatCalculationResults, getRemainderWarning } from '@/utils/calculation';
import { generateCSV, downloadCSV, generateCSVFilename } from '@/utils/export';
import { generateShareURL, copyToClipboard, decompressDataFromURL } from '@/utils/sharing';
import { Participant, CalculationResult } from '@/types';
import { useEffect } from 'react';

export default function HomePage() {
  const [eventName, setEventName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [isRoleSettingsOpen, setIsRoleSettingsOpen] = useState(false);
  const [roleCoefficients, setRoleCoefficients] = useState<RoleCoefficient>({
    junior: 1.0,
    middle: 1.3,
    senior: 1.5,
    manager: 2.0,
  });
  const [formErrors, setFormErrors] = useState<FormValidationError>({});
  const [calculationResults, setCalculationResults] = useState<CalculationResult[]>([]);
  const [shareMessage, setShareMessage] = useState<string>('');

  // URL共有データの読み込み
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const compressedData = urlParams.get('data');
    
    if (compressedData) {
      const sharedData = decompressDataFromURL(compressedData);
      if (sharedData) {
        setEventName(sharedData.eventName || '');
        setTotalAmount(sharedData.totalAmount.toString());
        setParticipants(sharedData.participants);
        setRoleCoefficients(sharedData.roleCoefficients);
        
        // URL共有データを読み込んだ後、URLをクリア
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        
        // リアルタイム計算を実行
        updateCalculation(
          sharedData.totalAmount.toString(),
          sharedData.participants,
          sharedData.roleCoefficients
        );
      }
    }
  }, []);

  const addParticipant = (participantData: Omit<Participant, 'id'>) => {
    let updatedParticipants = [...participants];
    
    // 新しい参加者が幹事の場合、既存の幹事フラグをクリア
    if (participantData.isOrganizer) {
      updatedParticipants = updatedParticipants.map(p => ({
        ...p,
        isOrganizer: false
      }));
    }
    
    const newParticipant: Participant = {
      ...participantData,
      id: crypto.randomUUID(),
    };
    
    const newParticipants = [...updatedParticipants, newParticipant];
    setParticipants(newParticipants);
    setIsAddModalOpen(false);
    
    // リアルタイム計算
    updateCalculation(totalAmount, newParticipants, roleCoefficients);
  };

  const addBulkParticipants = (participantDataList: Array<Omit<Participant, 'id'>>) => {
    // 新しい参加者に幹事が含まれている場合、既存の幹事フラグをクリア
    const hasNewOrganizer = participantDataList.some(p => p.isOrganizer);
    let updatedExistingParticipants = [...participants];
    
    if (hasNewOrganizer) {
      updatedExistingParticipants = updatedExistingParticipants.map(p => ({
        ...p,
        isOrganizer: false
      }));
    }
    
    const newParticipants = participantDataList.map(participantData => ({
      ...participantData,
      id: crypto.randomUUID(),
    }));
    
    const updatedParticipants = [...updatedExistingParticipants, ...newParticipants];
    setParticipants(updatedParticipants);
    setIsBulkAddModalOpen(false);
    
    // リアルタイム計算
    updateCalculation(totalAmount, updatedParticipants, roleCoefficients);
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
    
    // リアルタイム計算
    updateCalculation(totalAmount, participants, newCoefficients);
  };

  // リアルタイム計算の統合関数
  const updateCalculation = (amount: string, participantList: Participant[], coefficients: RoleCoefficient) => {
    if (amount && participantList.length > 0) {
      const totalAmountNum = parseInt(amount, 10);
      if (!isNaN(totalAmountNum) && totalAmountNum > 0) {
        const results = calculateBillSplit(totalAmountNum, participantList, coefficients);
        const validation = validateCalculation(results, totalAmountNum);
        if (validation.isValid) {
          setCalculationResults(results);
        }
      }
    } else {
      setCalculationResults([]);
    }
  };

  // CSV出力機能
  const handleExportCSV = () => {
    if (calculationResults.length === 0) return;
    
    const csvContent = generateCSV(calculationResults, eventName, parseInt(totalAmount));
    const filename = generateCSVFilename(eventName);
    downloadCSV(csvContent, filename);
  };

  // URL共有機能
  const handleShareURL = async () => {
    if (calculationResults.length === 0 || !totalAmount) return;
    
    const shareURL = generateShareURL(
      eventName,
      parseInt(totalAmount),
      participants,
      roleCoefficients
    );
    
    const success = await copyToClipboard(shareURL);
    if (success) {
      setShareMessage('URLをクリップボードにコピーしました');
      setTimeout(() => setShareMessage(''), 3000);
    } else {
      setShareMessage('URLのコピーに失敗しました');
      setTimeout(() => setShareMessage(''), 3000);
    }
  };

  // リアルタイムバリデーション
  const handleEventNameChange = (value: string) => {
    setEventName(value);
    const validation = validateEventName(value);
    if (validation.isValid) {
      setFormErrors(prev => {
        const { eventName, ...rest } = prev;
        return rest;
      });
    } else {
      setFormErrors(prev => ({
        ...prev,
        eventName: validation.errors[0]
      }));
    }
  };

  const handleTotalAmountChange = (value: string) => {
    setTotalAmount(value);
    const validation = validateTotalAmount(value);
    if (validation.isValid) {
      setFormErrors(prev => {
        const { totalAmount, ...rest } = prev;
        return rest;
      });
    } else {
      setFormErrors(prev => ({
        ...prev,
        totalAmount: validation.errors[0]
      }));
    }
    
    // リアルタイム計算
    updateCalculation(value, participants, roleCoefficients);
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
                        const newParticipants = participants.filter(p => p.id !== participant.id);
                        setParticipants(newParticipants);
                        
                        // リアルタイム計算
                        updateCalculation(totalAmount, newParticipants, roleCoefficients);
                      }}
                      className="self-end sm:self-auto w-auto sm:w-auto min-h-[44px] sm:min-h-auto"
                    >
                      削除
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="secondary"
                onClick={() => setIsAddModalOpen(true)}
                className="flex-1 min-h-[44px] text-base sm:text-sm"
              >
                + 参加者を追加
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsBulkAddModalOpen(true)}
                className="flex-1 min-h-[44px] text-base sm:text-sm"
              >
                まとめて追加
              </Button>
            </div>
          </div>
        </Card>

        {/* 端数警告表示 */}
        {totalAmount && participants.length > 0 && (() => {
          const warning = getRemainderWarning(parseInt(totalAmount), participants);
          return warning ? (
            <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-md p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-warning-600 dark:text-warning-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <div className="text-sm font-medium text-warning-800 dark:text-warning-200">
                    端数処理のお知らせ
                  </div>
                  <div className="text-sm text-warning-700 dark:text-warning-300 mt-1">
                    {warning}
                  </div>
                </div>
              </div>
            </div>
          ) : null;
        })()}

        {/* 出力・共有ボタン（計算結果がある場合のみ表示） */}
        {calculationResults.length > 0 && (
          <div className="space-y-4 px-4 sm:px-0">
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button
                variant="primary"
                size="lg"
                onClick={handleExportCSV}
                className="w-full sm:w-auto min-h-[52px] text-base sm:text-lg font-semibold flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>CSV出力</span>
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                onClick={handleShareURL}
                className="w-full sm:w-auto min-h-[52px] text-base sm:text-lg font-semibold flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span>URL共有</span>
              </Button>
            </div>
            
            {/* 共有メッセージ */}
            {shareMessage && (
              <div className="text-center">
                <div className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                  shareMessage.includes('失敗') 
                    ? 'bg-error-100 text-error-700 dark:bg-error-900/20 dark:text-error-400'
                    : 'bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400'
                }`}>
                  {shareMessage.includes('失敗') ? (
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {shareMessage}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 計算結果表示 */}
        {calculationResults.length > 0 && (
          <Card title="精算結果">
            <div className="space-y-6">
              {/* イベント情報表示 */}
              <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-md">
                <div className="space-y-2">
                  {eventName && (
                    <div className="text-sm text-primary-700 dark:text-primary-300">
                      <span className="font-medium">イベント名:</span> {eventName}
                    </div>
                  )}
                  <div className="text-sm text-primary-700 dark:text-primary-300">
                    <span className="font-medium">合計金額:</span> ¥{parseInt(totalAmount).toLocaleString()}
                  </div>
                  <div className="text-sm text-primary-700 dark:text-primary-300">
                    <span className="font-medium">参加者数:</span> {calculationResults.length}名
                  </div>
                </div>
              </div>

              {/* 参加者別金額表示 */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  各参加者の支払い金額
                </h3>
                <div className="grid gap-3">
                  {calculationResults.map((result) => (
                    <div key={result.participantId} className="flex justify-between items-center p-4 bg-neutral-50 dark:bg-neutral-700 rounded-md border border-neutral-200 dark:border-neutral-600">
                      <div className="flex-1">
                        <div className="font-medium text-neutral-900 dark:text-neutral-100 text-base">
                          {result.name}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                          {getRoleLabel(result.role)} (係数: {result.coefficient}x){result.isOrganizer && ' ・幹事'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
                          ¥{result.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 合計確認 */}
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                <div className="bg-success-50 dark:bg-success-900/20 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-success-700 dark:text-success-300">
                      支払い総額
                    </span>
                    <span className="text-2xl font-bold text-success-700 dark:text-success-300">
                      ¥{calculationResults.reduce((sum, result) => sum + result.amount, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-success-600 dark:text-success-400 mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    合計金額と一致しています
                  </div>
                </div>
              </div>

              {/* 役職係数の表示 */}
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                  使用した役職係数
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="text-center p-2 bg-neutral-100 dark:bg-neutral-700 rounded">
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">ジュニア</div>
                    <div className="font-semibold">{roleCoefficients.junior}x</div>
                  </div>
                  <div className="text-center p-2 bg-neutral-100 dark:bg-neutral-700 rounded">
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">ミドル</div>
                    <div className="font-semibold">{roleCoefficients.middle}x</div>
                  </div>
                  <div className="text-center p-2 bg-neutral-100 dark:bg-neutral-700 rounded">
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">シニア</div>
                    <div className="font-semibold">{roleCoefficients.senior}x</div>
                  </div>
                  <div className="text-center p-2 bg-neutral-100 dark:bg-neutral-700 rounded">
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">マネージャー</div>
                    <div className="font-semibold">{roleCoefficients.manager}x</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
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

      {/* まとめて参加者追加モーダル */}
      <Modal
        isOpen={isBulkAddModalOpen}
        onClose={() => setIsBulkAddModalOpen(false)}
        title="参加者をまとめて追加"
        size="lg"
      >
        <BulkAddParticipantForm
          onAdd={addBulkParticipants}
          onCancel={() => setIsBulkAddModalOpen(false)}
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