import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BulkAddParticipantForm from '../BulkAddParticipantForm';

const mockOnAdd = jest.fn();
const mockOnCancel = jest.fn();

describe('BulkAddParticipantForm', () => {
  beforeEach(() => {
    mockOnAdd.mockClear();
    mockOnCancel.mockClear();
  });

  it('TC017: まとめて追加フォームが正常に表示される', () => {
    render(
      <BulkAddParticipantForm
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
        existingNames={[]}
      />
    );

    expect(screen.getByText(/複数の参加者を一度に追加できます/)).toBeInTheDocument();
    expect(screen.getByText(/幹事は端数（10円・1円の桁）を負担します/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('参加者1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ジュニア')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+ 参加者を追加' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
  });

  it('TC018: 参加者の行を追加・削除できる', async () => {
    const user = userEvent.setup();
    render(
      <BulkAddParticipantForm
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
        existingNames={[]}
      />
    );

    // 初期状態で1行
    expect(screen.getAllByPlaceholderText(/参加者/)).toHaveLength(1);

    // 行を追加
    const addRowButton = screen.getByRole('button', { name: '+ 参加者を追加' });
    await user.click(addRowButton);

    await waitFor(() => {
      expect(screen.getAllByPlaceholderText(/参加者/)).toHaveLength(2);
    });

    // 削除ボタンをクリック
    const deleteButtons = screen.getAllByRole('button', { name: '削除' });
    await user.click(deleteButtons[1]);

    await waitFor(() => {
      expect(screen.getAllByPlaceholderText(/参加者/)).toHaveLength(1);
    });
  });

  it('TC019: 幹事がラジオボタンで1名のみ選択できる', async () => {
    const user = userEvent.setup();
    render(
      <BulkAddParticipantForm
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
        existingNames={[]}
      />
    );

    // 2行追加
    const addRowButton = screen.getByRole('button', { name: '+ 参加者を追加' });
    await user.click(addRowButton);

    await waitFor(() => {
      expect(screen.getAllByPlaceholderText(/参加者/)).toHaveLength(2);
    });

    // 幹事ラジオボタンを取得
    const organizerRadios = screen.getAllByRole('radio');
    expect(organizerRadios).toHaveLength(2);

    // 最初の参加者を幹事に設定
    await user.click(organizerRadios[0]);
    
    await waitFor(() => {
      expect(organizerRadios[0]).toBeChecked();
      expect(organizerRadios[1]).not.toBeChecked();
    });

    // 2番目の参加者を幹事に設定（1番目は自動で解除されるべき）
    await user.click(organizerRadios[1]);
    
    await waitFor(() => {
      expect(organizerRadios[0]).not.toBeChecked();
      expect(organizerRadios[1]).toBeChecked();
    });
  });

  it('TC020: バリデーションエラーが正しく表示される', async () => {
    const user = userEvent.setup();
    render(
      <BulkAddParticipantForm
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
        existingNames={['既存太郎']}
      />
    );

    // 名前を入力せずに送信
    const submitButton = screen.getByRole('button', { name: /名を追加/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('1行目: 名前を入力してください')).toBeInTheDocument();
    });

    // 既存の名前と重複する名前を入力
    const nameInput = screen.getByPlaceholderText('参加者1');
    await user.type(nameInput, '既存太郎');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('1行目: "既存太郎" は既に登録されています')).toBeInTheDocument();
    });
  });

  it('TC021: 正常な参加者データで追加が実行される', async () => {
    const user = userEvent.setup();
    render(
      <BulkAddParticipantForm
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
        existingNames={[]}
      />
    );

    // 2行追加
    const addRowButton = screen.getByRole('button', { name: '+ 参加者を追加' });
    await user.click(addRowButton);

    await waitFor(() => {
      expect(screen.getAllByPlaceholderText(/参加者/)).toHaveLength(2);
    });

    // 参加者情報を入力
    const nameInputs = screen.getAllByPlaceholderText(/参加者/);
    await user.type(nameInputs[0], '田中太郎');
    await user.type(nameInputs[1], '佐藤花子');

    // 役職を設定
    const roleSelects = screen.getAllByDisplayValue('ジュニア');
    await user.selectOptions(roleSelects[1], 'manager');

    // 幹事を設定
    const organizerRadios = screen.getAllByRole('radio');
    await user.click(organizerRadios[1]);

    // 送信
    const submitButton = screen.getByRole('button', { name: /名を追加/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith([
        { name: '田中太郎', role: 'junior', isOrganizer: false },
        { name: '佐藤花子', role: 'manager', isOrganizer: true },
      ]);
    });
  });

  it('TC022: キャンセルボタンが動作する', async () => {
    const user = userEvent.setup();
    render(
      <BulkAddParticipantForm
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
        existingNames={[]}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('TC023: 10名制限が正しく動作する', async () => {
    const user = userEvent.setup();
    render(
      <BulkAddParticipantForm
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
        existingNames={[]}
      />
    );

    // 9回追加して合計10名にする
    const addRowButton = screen.getByRole('button', { name: '+ 参加者を追加' });
    for (let i = 0; i < 9; i++) {
      await user.click(addRowButton);
    }

    await waitFor(() => {
      expect(screen.getAllByPlaceholderText(/参加者/)).toHaveLength(10);
    });

    // 追加ボタンが無効化される
    expect(addRowButton).toBeDisabled();
    expect(screen.getByText('一度に追加できるのは10名までです')).toBeInTheDocument();
  });
});