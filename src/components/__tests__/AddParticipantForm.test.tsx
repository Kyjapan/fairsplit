import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddParticipantForm from '../AddParticipantForm';
import { RoleCoefficient } from '../RoleSettingsForm';

const mockCoefficients: RoleCoefficient = {
  junior: 1.0,
  middle: 1.3,
  senior: 1.5,
  manager: 2.0,
};

const mockOnAdd = jest.fn();
const mockOnCancel = jest.fn();

describe('AddParticipantForm', () => {
  beforeEach(() => {
    mockOnAdd.mockClear();
    mockOnCancel.mockClear();
  });

  it('TC006: 参加者追加フォームが正常に表示される', () => {
    render(
      <AddParticipantForm
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
        coefficients={mockCoefficients}
        existingNames={[]}
      />
    );

    expect(screen.getByLabelText(/名前/)).toBeInTheDocument();
    expect(screen.getByText('役職・レベル')).toBeInTheDocument();
    expect(screen.getByText('ジュニア')).toBeInTheDocument();
    expect(screen.getByText('ミドル')).toBeInTheDocument();
    expect(screen.getByText('シニア')).toBeInTheDocument();
    expect(screen.getByText('マネージャー')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '追加' })).toBeInTheDocument();
  });

  it('TC007: 参加者が正常に追加できる', async () => {
    const user = userEvent.setup();
    render(
      <AddParticipantForm
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
        coefficients={mockCoefficients}
        existingNames={[]}
      />
    );

    const nameInput = screen.getByLabelText(/名前/);
    const middleRadio = screen.getByRole('radio', { name: /ミドル/ });
    const addButton = screen.getByRole('button', { name: '追加' });

    await user.type(nameInput, '田中太郎');
    await user.click(middleRadio);
    
    await waitFor(async () => {
      await user.click(addButton);
    });

    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith({
        name: '田中太郎',
        role: 'middle',
      });
    });
  });

  it('TC008-1: 名前が空の場合エラーを表示', async () => {
    const user = userEvent.setup();
    render(
      <AddParticipantForm
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
        coefficients={mockCoefficients}
        existingNames={[]}
      />
    );

    const addButton = screen.getByRole('button', { name: '追加' });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('名前を入力してください')).toBeInTheDocument();
    });
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('TC008-2: 21文字以上の名前でエラーを表示', async () => {
    const user = userEvent.setup();
    render(
      <AddParticipantForm
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
        coefficients={mockCoefficients}
        existingNames={[]}
      />
    );

    const nameInput = screen.getByLabelText(/名前/);
    const addButton = screen.getByRole('button', { name: '追加' });
    const longName = 'あ'.repeat(21);

    await user.type(nameInput, longName);
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('名前は20文字以内で入力してください')).toBeInTheDocument();
    });
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('TC008-3: 不正文字でエラーを表示', async () => {
    const user = userEvent.setup();
    render(
      <AddParticipantForm
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
        coefficients={mockCoefficients}
        existingNames={[]}
      />
    );

    const nameInput = screen.getByLabelText(/名前/);
    const addButton = screen.getByRole('button', { name: '追加' });

    await user.type(nameInput, '<script>');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('使用できない文字が含まれています')).toBeInTheDocument();
    });
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('TC009: 重複名前でエラーを表示', async () => {
    const user = userEvent.setup();
    render(
      <AddParticipantForm
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
        coefficients={mockCoefficients}
        existingNames={['田中太郎']}
      />
    );

    const nameInput = screen.getByLabelText(/名前/);
    const addButton = screen.getByRole('button', { name: '追加' });

    await user.type(nameInput, '田中太郎');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('この名前は既に登録されています')).toBeInTheDocument();
    });
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('リアルタイムバリデーションが動作する', async () => {
    const user = userEvent.setup();
    render(
      <AddParticipantForm
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
        coefficients={mockCoefficients}
        existingNames={[]}
      />
    );

    const nameInput = screen.getByLabelText(/名前/);
    const addButton = screen.getByRole('button', { name: '追加' });

    // エラー状態を作る
    await user.click(addButton);
    await waitFor(() => {
      expect(screen.getByText('名前を入力してください')).toBeInTheDocument();
    });

    // 正しい値に修正
    await user.type(nameInput, '田中太郎');
    
    // エラーが解除されることを確認
    await waitFor(() => {
      expect(screen.queryByText('名前を入力してください')).not.toBeInTheDocument();
    });
  });

  it('キャンセルボタンが動作する', async () => {
    const user = userEvent.setup();
    render(
      <AddParticipantForm
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
        coefficients={mockCoefficients}
        existingNames={[]}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('役職係数が正しく表示される', () => {
    render(
      <AddParticipantForm
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
        coefficients={mockCoefficients}
        existingNames={[]}
      />
    );

    expect(screen.getByText(/新人・若手（係数: 1x）/)).toBeInTheDocument();
    expect(screen.getByText(/中堅（係数: 1\.3x）/)).toBeInTheDocument();
    expect(screen.getByText(/上級（係数: 1\.5x）/)).toBeInTheDocument();
    expect(screen.getByText(/管理職（係数: 2x）/)).toBeInTheDocument();
  });

  it('フォームリセットが動作する', async () => {
    const user = userEvent.setup();
    render(
      <AddParticipantForm
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
        coefficients={mockCoefficients}
        existingNames={[]}
      />
    );

    const nameInput = screen.getByLabelText(/名前/);
    const middleRadio = screen.getByRole('radio', { name: /ミドル/ });
    const addButton = screen.getByRole('button', { name: '追加' });

    // 入力
    await user.type(nameInput, '田中太郎');
    await user.click(middleRadio);
    
    await waitFor(async () => {
      await user.click(addButton);
    });

    // フォームがリセットされることを確認
    await waitFor(() => {
      expect(nameInput).toHaveValue('');
      expect(screen.getByRole('radio', { name: /ジュニア/ })).toBeChecked();
    });
  });
});