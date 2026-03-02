import React from 'react';
import { useTranslation } from 'react-i18next';
import type { PrivateObjective, PublicObjective } from '../../types/game';

interface ObjectiveCardProps {
  objective: PublicObjective | PrivateObjective;
  selected: boolean;
  onToggle: (id: string) => void;
}

const ObjectiveCard: React.FC<ObjectiveCardProps> = ({ objective, selected, onToggle }) => {
  const { t } = useTranslation();
  const isPublic = 'descriptionKey' in objective;

  return (
    <button
      type="button"
      onClick={() => onToggle(objective.id)}
      className={`w-full rounded-xl border p-3 text-left ${
        selected ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 bg-white'
      }`}
    >
      <p className="text-sm font-semibold text-gray-900">{t(objective.nameKey)}</p>
      {isPublic && (
        <p className="mt-1 text-xs text-gray-600">
          {t('objectives.vpPerUnit', { value: objective.vpPerUnit })} ·{' '}
          {t(objective.descriptionKey)}
        </p>
      )}
    </button>
  );
};

export default ObjectiveCard;
