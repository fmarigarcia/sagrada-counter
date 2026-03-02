import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ValidationError } from '../../types/game';

interface ValidationBannerProps {
  errors: ValidationError[];
}

const ValidationBanner: React.FC<ValidationBannerProps> = ({ errors }) => {
  const { t } = useTranslation();

  if (errors.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-red-200 bg-red-50 p-3">
      <h2 className="text-sm font-semibold text-red-700">{t('validation.title')}</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-red-700">
        {errors.map((error) => (
          <li key={`${error.row}-${error.col}-${error.rule}`}>
            {t('validation.cellRef', { row: error.row + 1, col: error.col + 1 })}: {error.message}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ValidationBanner;
