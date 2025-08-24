import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '../page';

// console.logをモック
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

describe('HomePage', () => {
  beforeEach(() => {
    mockConsoleLog.mockClear();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  it('初期状態が正しく表示される', () => {
    render(<HomePage />);

    expect(screen.getAllByText('新しい精算を作成')).toHaveLength(2); // デスクトップ版とモバイル版
    expect(screen.getAllByText('係数設定')).toHaveLength(2); // デスクトップ版とモバイル版
    expect(screen.getByLabelText(/イベント名/)).toBeInTheDocument();
    expect(screen.getByLabelText(/合計金額/)).toBeInTheDocument();
    expect(screen.getByText('参加者を追加してください')).toBeInTheDocument();
  });

  it('TC002: イベント名が正常に入力できる', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    const eventNameInput = screen.getByLabelText(/イベント名/);
    await user.type(eventNameInput, '忘年会');

    expect(eventNameInput).toHaveValue('忘年会');
    expect(screen.queryByText(/イベント名は/)).not.toBeInTheDocument();
  });

  it('TC003: イベント名の文字数制限エラー', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    const eventNameInput = screen.getByLabelText(/イベント名/);
    const longName = 'あ'.repeat(51);
    
    await user.type(eventNameInput, longName);

    await waitFor(() => {
      expect(screen.getByText('イベント名は50文字以内で入力してください')).toBeInTheDocument();
    });
  });

  it('TC004: 合計金額が正常に入力できる', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    const amountInput = screen.getByLabelText(/合計金額/);
    await user.type(amountInput, '20000');

    expect(amountInput).toHaveValue(20000);
    expect(screen.queryByText(/金額は/)).not.toBeInTheDocument();
  });

  it('TC005: 合計金額のバリデーションエラー', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    const amountInput = screen.getByLabelText(/合計金額/);
    
    // 0を入力
    await user.type(amountInput, '0');
    await waitFor(() => {
      expect(screen.getByText('金額は0より大きい値を入力してください')).toBeInTheDocument();
    });

    // クリアして負の値を入力（数値フィールドで確実に動作する）
    await user.clear(amountInput);
    await user.type(amountInput, '-5');
    await waitFor(() => {
      expect(screen.getByText('金額は0より大きい値を入力してください')).toBeInTheDocument();
    });
  });

  it('TC006: 参加者追加モーダルが表示される', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    const addButton = screen.getByRole('button', { name: '+ 参加者を追加' });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('参加者を追加')).toBeInTheDocument();
      expect(screen.getByLabelText(/名前/)).toBeInTheDocument();
      expect(screen.getByText('ジュニア')).toBeInTheDocument();
    });
  });

  it('TC007: 参加者が正常に追加される', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    // 参加者追加モーダルを開く
    const addButton = screen.getByRole('button', { name: '+ 参加者を追加' });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('参加者を追加')).toBeInTheDocument();
    });

    // 参加者情報を入力
    const nameInput = screen.getByLabelText(/名前/);
    await user.type(nameInput, '田中太郎');

    const middleRadio = screen.getByRole('radio', { name: /ミドル/ });
    await user.click(middleRadio);

    const submitButton = screen.getByRole('button', { name: '追加' });
    await user.click(submitButton);

    // 参加者が追加されたことを確認
    await waitFor(() => {
      expect(screen.getByText('田中太郎')).toBeInTheDocument();
      expect(screen.getByText('ミドル')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument();
    });

    // モーダルが閉じることを確認
    await waitFor(() => {
      expect(screen.queryByText('参加者を追加')).not.toBeInTheDocument();
    });
  });

  it('TC010: 参加者が削除される', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    // 参加者を追加
    const addButton = screen.getByRole('button', { name: '+ 参加者を追加' });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('参加者を追加')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/名前/);
    await user.type(nameInput, '田中太郎');

    const submitButton = screen.getByRole('button', { name: '追加' });
    await user.click(submitButton);

    // 参加者が追加されることを確認
    await waitFor(() => {
      expect(screen.getByText('田中太郎')).toBeInTheDocument();
    });

    // 削除ボタンをクリック
    const deleteButton = screen.getByRole('button', { name: '削除' });
    await user.click(deleteButton);

    // 参加者が削除されることを確認
    await waitFor(() => {
      expect(screen.queryByText('田中太郎')).not.toBeInTheDocument();
      expect(screen.getByText('参加者を追加してください')).toBeInTheDocument();
    });
  });

  it('TC011: 係数設定モーダルが表示される', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    const settingsButtons = screen.getAllByRole('button', { name: '係数設定' });
    // 最初の係数設定ボタンをクリック（デスクトップ版）
    await user.click(settingsButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('役職係数の設定')).toBeInTheDocument();
      expect(screen.getByLabelText(/ジュニア/)).toBeInTheDocument();
      expect(screen.getByLabelText(/ミドル/)).toBeInTheDocument();
      expect(screen.getByLabelText(/シニア/)).toBeInTheDocument();
      expect(screen.getByLabelText(/マネージャー/)).toBeInTheDocument();
    });
  });

  it('TC015: 合計金額と参加者を入力すると結果が表示される', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    // 合計金額を入力
    const amountInput = screen.getByLabelText(/合計金額/);
    await user.type(amountInput, '2000');

    // 参加者を追加
    const addButton = screen.getByRole('button', { name: '+ 参加者を追加' });
    await user.click(addButton);

    const nameInput = screen.getByLabelText(/名前/);
    await user.type(nameInput, '田中太郎');

    const submitButton = screen.getByRole('button', { name: '追加' });
    await user.click(submitButton);

    // 計算結果が自動表示される
    await waitFor(() => {
      expect(screen.getByText('精算結果')).toBeInTheDocument();
    });
  });

  it('TC016: リアルタイム計算が実行される', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    // 合計金額を入力
    const amountInput = screen.getByLabelText(/合計金額/);
    await user.type(amountInput, '2000');

    // 参加者を追加
    const addButton = screen.getByRole('button', { name: '+ 参加者を追加' });
    await user.click(addButton);

    const nameInput = screen.getByLabelText(/名前/);
    await user.type(nameInput, '田中太郎');

    const submitButton = screen.getByRole('button', { name: '追加' });
    await user.click(submitButton);

    // 計算結果が自動表示される
    await waitFor(() => {
      expect(screen.getByText('精算結果')).toBeInTheDocument();
      expect(screen.getByText('田中太郎')).toBeInTheDocument();
    });
  });

  it('役職ラベルが正しく表示される', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    // 参加者を各役職で追加してラベル確認
    const roles = [
      { name: '田中', role: 'ジュニア', label: 'ジュニア' },
      { name: '佐藤', role: 'ミドル', label: 'ミドル' },
      { name: '鈴木', role: 'シニア', label: 'シニア' },
      { name: '高橋', role: 'マネージャー', label: 'マネージャー' },
    ];

    for (const { name, role, label } of roles) {
      const addButton = screen.getByRole('button', { name: '+ 参加者を追加' });
      await user.click(addButton);

      const nameInput = screen.getByLabelText(/名前/);
      await user.type(nameInput, name);

      const roleRadio = screen.getByRole('radio', { name: new RegExp(role) });
      await user.click(roleRadio);

      const submitButton = screen.getByRole('button', { name: '追加' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(name)).toBeInTheDocument();
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    }
  });
});