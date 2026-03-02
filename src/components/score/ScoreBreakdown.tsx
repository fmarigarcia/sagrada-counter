import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ScoreBreakdown as ScoreBreakdownType } from '../../types/game';

interface ScoreBreakdownProps {
  score: ScoreBreakdownType;
}

const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ score }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3">
      <h3 className="text-sm font-semibold text-gray-700">{t('score.breakdown')}</h3>
      {score.publicObjectives.map((item) => (
        <div key={item.objective.id} className="flex items-center justify-between text-sm text-gray-700">
          <span>{t(item.objective.nameKey)}</span>
          <span className="font-semibold text-gray-900">{item.vp}</span>
        </div>
      ))}
      <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-sm text-gray-700">
        <span>{t('score.privateObjective')}</span>
        <span className="font-semibold text-gray-900">{score.privateObjective.vp}</span>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-700">
        <span>{t('score.favorTokens')}</span>
        <span className="font-semibold text-gray-900">{score.favorTokens}</span>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-700">
        <span>{t('score.openSpaces')}</span>
        <span className="font-semibold text-gray-900">{score.openSpacePenalty}</span>
      </div>
    </div>
  );
};

export default ScoreBreakdown;
