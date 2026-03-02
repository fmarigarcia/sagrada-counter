import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { DiceColor, DiceValue, Die } from '../../types/game';

interface DiePickerProps {
  initialDie: Die | null;
  onConfirm: (die: Die | null) => void;
  onClose: () => void;
}

const dieColors: DiceColor[] = ['red', 'yellow', 'green', 'blue', 'purple'];
const dieValues: DiceValue[] = [1, 2, 3, 4, 5, 6];

const colorClasses: Record<DiceColor, string> = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-400',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
};

const DiePicker: React.FC<DiePickerProps> = ({ initialDie, onConfirm, onClose }) => {
  const { t } = useTranslation();
  const [selectedColor, setSelectedColor] = useState<DiceColor | null>(initialDie?.color ?? null);
  const [selectedValue, setSelectedValue] = useState<DiceValue | null>(initialDie?.value ?? null);

  const handleConfirm = (): void => {
    if (selectedColor === null || selectedValue === null) {
      return;
    }
    onConfirm({ color: selectedColor, value: selectedValue });
    onClose();
  };

  const handleClear = (): void => {
    onConfirm(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">{t('diePicker.title')}</h2>
        <p className="mb-2 text-sm font-medium text-gray-700">{t('diePicker.color')}</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {dieColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={`h-10 w-10 rounded-full ${colorClasses[color]} ${
                selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-800' : ''
              }`}
              aria-label={`Color ${color}`}
            />
          ))}
        </div>

        <p className="mb-2 text-sm font-medium text-gray-700">{t('diePicker.value')}</p>
        <div className="mb-4 grid grid-cols-6 gap-2">
          {dieValues.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelectedValue(value)}
              className={`rounded-lg border px-2 py-2 text-sm font-semibold ${
                selectedValue === value
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-gray-300 text-gray-700'
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700"
          >
            {t('diePicker.clear')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700"
          >
            {t('diePicker.cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedColor === null || selectedValue === null}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {t('diePicker.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiePicker;
