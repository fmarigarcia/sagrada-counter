import React from 'react';
import { useTranslation } from 'react-i18next';

interface TokenCounterProps {
  value: number;
  onChange: (value: number) => void;
}

const TokenCounter: React.FC<TokenCounterProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-gray-300 bg-white p-3">
      <p className="text-sm font-semibold text-gray-700">{t('tokens.label')}</p>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="h-9 w-9 rounded-lg border border-gray-300 text-lg font-semibold text-gray-700"
          aria-label={t('tokens.decrement')}
        >
          −
        </button>
        <span className="min-w-8 text-center text-lg font-bold text-gray-900">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="h-9 w-9 rounded-lg border border-gray-300 text-lg font-semibold text-gray-700"
          aria-label={t('tokens.increment')}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default TokenCounter;
