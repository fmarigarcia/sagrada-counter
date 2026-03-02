import React from 'react';
import { useTranslation } from 'react-i18next';
import type { PrivateObjective, PublicObjective } from '../../types/game';

interface ObjectiveCardProps {
  objective: PublicObjective | PrivateObjective;
  onRemove: () => void;
}

const ObjectiveCard: React.FC<ObjectiveCardProps> = ({ objective, onRemove }) => {
  const { t } = useTranslation();
  const isPublic = 'descriptionKey' in objective;

  return (
    <div className="w-full rounded-xl border border-indigo-600 bg-indigo-50 p-3 text-left">
      <p className="text-sm font-semibold text-gray-900">{t(objective.nameKey)}</p>
      {isPublic && (
        <p className="mt-1 text-xs text-gray-600">
          {t('objectives.vpPerUnit', { value: objective.vpPerUnit })} ·{' '}
          {t(objective.descriptionKey)}
        </p>
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
