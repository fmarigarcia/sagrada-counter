import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ScoreBreakdown } from '../../types/game';
import ScoreBreakdownTable from './ScoreBreakdown';

interface ScoreDisplayProps {
  score: ScoreBreakdown | null;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
  const { t } = useTranslation();

  if (score === null) {
    return <p className="text-sm text-gray-500">{t('score.selectPrivateObjective')}</p>;
  }

  return (
    <section className="flex flex-col gap-2 rounded-xl border border-indigo-200 bg-indigo-50 p-3">
      <p className="text-sm font-semibold text-indigo-700">{t('score.total')}</p>
      <p className="text-3xl font-bold text-indigo-800">{score.total}</p>
      <ScoreBreakdownTable score={score} />
    </section>
  );
};

export default ScoreDisplay;
