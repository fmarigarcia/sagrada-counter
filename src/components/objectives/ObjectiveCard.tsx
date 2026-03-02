import React from 'react';
import { useTranslation } from 'react-i18next';
import type { PrivateObjective, PublicObjective } from '../../types/game';

const COLOR_CLASS: Record<string, string> = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-400',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
};

interface ObjectiveCardProps {
  objective: PublicObjective | PrivateObjective;
  onRemove: () => void;
}

const ObjectiveCard: React.FC<ObjectiveCardProps> = ({ objective, onRemove }) => {
  const { t } = useTranslation();
  const isPublic = 'descriptionKey' in objective;
  const isColorPrivate = !isPublic && objective.scoringType === 'color';
  const isPatternPrivate = !isPublic && objective.scoringType === 'pattern';

  return (
    <div className="w-full rounded-xl border border-indigo-600 bg-indigo-50 p-3 text-left">
      <div className="flex items-center gap-2">
        {isColorPrivate && (
          <span
            className={`inline-block h-4 w-4 shrink-0 rounded-full ${COLOR_CLASS[objective.color]}`}
            aria-hidden="true"
          />
        )}
        {isPatternPrivate && (
          <span
            className="inline-block h-4 w-4 shrink-0 rounded bg-gray-400 opacity-60"
            aria-hidden="true"
          />
        )}
        <p className="text-sm font-semibold text-gray-900">{t(objective.nameKey)}</p>
      </div>
      {isPublic && (
        <p className="mt-1 text-xs text-gray-600">
          {t('objectives.vpPerUnit', { value: objective.vpPerUnit })} ·{' '}
          {t(objective.descriptionKey)}
        </p>
      )}
      {isPatternPrivate && (
        <p className="mt-1 text-xs text-gray-600">{t('objectives.patternDescription')}</p>
      )}
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white"
        >
          {t('objectives.remove')}
        </button>
      </div>
    </div>
  );
};

export default ObjectiveCard;
