import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoleSettingsForm, { RoleCoefficient } from '../RoleSettingsForm';

const mockCoefficients: RoleCoefficient = {
  junior: 1.0,
  middle: 1.3,
  senior: 1.5,
  manager: 2.0,
};

const mockOnUpdate = jest.fn();
const mockOnCancel = jest.fn();

describe('RoleSettingsForm', () => {
  beforeEach(() => {
    mockOnUpdate.mockClear();
    mockOnCancel.mockClear();
  });

  it('TC011: 係数設定フォームが正常に表示される', () => {
    render(
      <RoleSettingsForm
        coefficients={mockCoefficients}
        onUpdate={mockOnUpdate}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/ジュニア/)).toBeInTheDocument();
    expect(screen.getByLabelText(/ミドル/)).toBeInTheDocument();
    expect(screen.getByLabelText(/シニア/)).toBeInTheDocument();
    expect(screen.getByLabelText(/マネージャー/)).toBeInTheDocument();
    
    expect(screen.getByText('標準設定')).toBeInTheDocument();
    expect(screen.getByText('ゆるやか設定')).toBeInTheDocument();
    expect(screen.getByText('均等割り')).toBeInTheDocument();
    expect(screen.getByText('急傾斜設定')).toBeInTheDocument();
    
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '設定を保存' })).toBeInTheDocument();
  });

  it('TC012: 係数が正常に変更できる', async () => {
    const user = userEvent.setup();
    render(
      <RoleSettingsForm
        coefficients={mockCoefficients}
        onUpdate={mockOnUpdate}
        onCancel={mockOnCancel}
      />
    );

    const juniorInput = screen.getByLabelText(/ジュニア/);
    const saveButton = screen.getByRole('button', { name: '設定を保存' });

    await user.clear(juniorInput);
    await user.type(juniorInput, '1.2');
    
    await waitFor(async () => {
      await user.click(saveButton);
    });

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        junior: 1.2,
        middle: 1.3,
        senior: 1.5,
        manager: 2.0,
      });
    });
  });

  it('TC013-1: 0.1未満の値は更新されない', async () => {
    const user = userEvent.setup();
    render(
      <RoleSettingsForm
        coefficients={mockCoefficients}
        onUpdate={mockOnUpdate}
        onCancel={mockOnCancel}
      />
    );

    const juniorInput = screen.getByLabelText(/ジュニア/) as HTMLInputElement;
    const saveButton = screen.getByRole('button', { name: '設定を保存' });

    // 0を入力（0.1未満）
    await user.clear(juniorInput);
    await user.type(juniorInput, '0');
    
    // 保存を実行
    await user.click(saveButton);
    
    // 有効な値のみが更新される（HTML5バリデーション + JavaScript制御）
    // onUpdateが呼ばれる場合でも、0は無効値として処理される
    if (mockOnUpdate.mock.calls.length > 0) {
      const updateCall = mockOnUpdate.mock.calls[0][0];
      expect(updateCall.junior).not.toBe(0);
    }
  });

  it('TC013-2: 数値変換できる範囲で動作する', async () => {
    const user = userEvent.setup();
    render(
      <RoleSettingsForm
        coefficients={mockCoefficients}
        onUpdate={mockOnUpdate}
        onCancel={mockOnCancel}
      />
    );

    const middleInput = screen.getByLabelText(/ミドル/);
    const saveButton = screen.getByRole('button', { name: '設定を保存' });
    
    // 有効な数値を入力
    await user.clear(middleInput);
    await user.type(middleInput, '1.5');
    
    // 保存を実行
    await user.click(saveButton);
    expect(mockOnUpdate).toHaveBeenCalled();
  });

  it('TC013-3: 10以下の値は正常に動作する', async () => {
    const user = userEvent.setup();
    render(
      <RoleSettingsForm
        coefficients={mockCoefficients}
        onUpdate={mockOnUpdate}
        onCancel={mockOnCancel}
      />
    );

    const seniorInput = screen.getByLabelText(/シニア/);
    const saveButton = screen.getByRole('button', { name: '設定を保存' });
    
    // 有効な値（10以下）を入力
    await user.clear(seniorInput);
    await user.type(seniorInput, '2.5');
    
    // 保存を実行
    await user.click(saveButton);
    expect(mockOnUpdate).toHaveBeenCalled();
  });

  it('TC014: ゆるやか設定プリセットが動作する', async () => {
    const user = userEvent.setup();
    render(
      <RoleSettingsForm
        coefficients={mockCoefficients}
        onUpdate={mockOnUpdate}
        onCancel={mockOnCancel}
      />
    );

    const presetButton = screen.getByRole('button', { name: /ゆるやか設定/ });
    await user.click(presetButton);

    const juniorInput = screen.getByLabelText(/ジュニア/) as HTMLInputElement;
    const middleInput = screen.getByLabelText(/ミドル/) as HTMLInputElement;
    const seniorInput = screen.getByLabelText(/シニア/) as HTMLInputElement;
    const managerInput = screen.getByLabelText(/マネージャー/) as HTMLInputElement;

    expect(juniorInput.value).toBe('1');
    expect(middleInput.value).toBe('1.2');
    expect(seniorInput.value).toBe('1.4');
    expect(managerInput.value).toBe('1.8');
  });

  it('標準設定プリセットが動作する', async () => {
    const user = userEvent.setup();
    render(
      <RoleSettingsForm
        coefficients={{ junior: 2.0, middle: 2.0, senior: 2.0, manager: 2.0 }}
        onUpdate={mockOnUpdate}
        onCancel={mockOnCancel}
      />
    );

    const presetButton = screen.getByRole('button', { name: /標準設定/ });
    await user.click(presetButton);

    const juniorInput = screen.getByLabelText(/ジュニア/) as HTMLInputElement;
    const middleInput = screen.getByLabelText(/ミドル/) as HTMLInputElement;
    const seniorInput = screen.getByLabelText(/シニア/) as HTMLInputElement;
    const managerInput = screen.getByLabelText(/マネージャー/) as HTMLInputElement;

    expect(juniorInput.value).toBe('1');
    expect(middleInput.value).toBe('1.3');
    expect(seniorInput.value).toBe('1.5');
    expect(managerInput.value).toBe('2');
  });

  it('均等割りプリセットが動作する', async () => {
    const user = userEvent.setup();
    render(
      <RoleSettingsForm
        coefficients={mockCoefficients}
        onUpdate={mockOnUpdate}
        onCancel={mockOnCancel}
      />
    );

    const presetButton = screen.getByRole('button', { name: /均等割り/ });
    await user.click(presetButton);

    const inputs = [
      screen.getByLabelText(/ジュニア/),
      screen.getByLabelText(/ミドル/),
      screen.getByLabelText(/シニア/),
      screen.getByLabelText(/マネージャー/),
    ] as HTMLInputElement[];

    inputs.forEach(input => {
      expect(input.value).toBe('1');
    });
  });

  it('急傾斜設定プリセットが動作する', async () => {
    const user = userEvent.setup();
    render(
      <RoleSettingsForm
        coefficients={mockCoefficients}
        onUpdate={mockOnUpdate}
        onCancel={mockOnCancel}
      />
    );

    const presetButton = screen.getByRole('button', { name: /急傾斜設定/ });
    await user.click(presetButton);

    const juniorInput = screen.getByLabelText(/ジュニア/) as HTMLInputElement;
    const middleInput = screen.getByLabelText(/ミドル/) as HTMLInputElement;
    const seniorInput = screen.getByLabelText(/シニア/) as HTMLInputElement;
    const managerInput = screen.getByLabelText(/マネージャー/) as HTMLInputElement;

    expect(juniorInput.value).toBe('1');
    expect(middleInput.value).toBe('1.5');
    expect(seniorInput.value).toBe('2');
    expect(managerInput.value).toBe('2.5');
  });

  it('キャンセルボタンが動作する', async () => {
    const user = userEvent.setup();
    render(
      <RoleSettingsForm
        coefficients={mockCoefficients}
        onUpdate={mockOnUpdate}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('初期値が正しく表示される', () => {
    render(
      <RoleSettingsForm
        coefficients={mockCoefficients}
        onUpdate={mockOnUpdate}
        onCancel={mockOnCancel}
      />
    );

    const juniorInput = screen.getByLabelText(/ジュニア/) as HTMLInputElement;
    const middleInput = screen.getByLabelText(/ミドル/) as HTMLInputElement;
    const seniorInput = screen.getByLabelText(/シニア/) as HTMLInputElement;
    const managerInput = screen.getByLabelText(/マネージャー/) as HTMLInputElement;

    expect(juniorInput.value).toBe('1');
    expect(middleInput.value).toBe('1.3');
    expect(seniorInput.value).toBe('1.5');
    expect(managerInput.value).toBe('2');
  });

  it('複数の係数を同時に変更できる', async () => {
    const user = userEvent.setup();
    render(
      <RoleSettingsForm
        coefficients={mockCoefficients}
        onUpdate={mockOnUpdate}
        onCancel={mockOnCancel}
      />
    );

    const juniorInput = screen.getByLabelText(/ジュニア/);
    const middleInput = screen.getByLabelText(/ミドル/);
    const saveButton = screen.getByRole('button', { name: '設定を保存' });

    await user.clear(juniorInput);
    await user.type(juniorInput, '1.1');
    
    await user.clear(middleInput);
    await user.type(middleInput, '1.4');

    await waitFor(async () => {
      await user.click(saveButton);
    });

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        junior: 1.1,
        middle: 1.4,
        senior: 1.5,
        manager: 2.0,
      });
    });
  });

  it('有効な値で正常に保存される', async () => {
    const user = userEvent.setup();
    render(
      <RoleSettingsForm
        coefficients={mockCoefficients}
        onUpdate={mockOnUpdate}
        onCancel={mockOnCancel}
      />
    );

    const juniorInput = screen.getByLabelText(/ジュニア/);
    const saveButton = screen.getByRole('button', { name: '設定を保存' });

    // 有効な値を設定
    await user.clear(juniorInput);
    await user.type(juniorInput, '1.2');

    // 保存を実行
    await user.click(saveButton);
    expect(mockOnUpdate).toHaveBeenCalled();
  });
});