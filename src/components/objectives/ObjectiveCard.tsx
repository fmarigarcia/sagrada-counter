import React from 'react';
import { useTranslation } from 'react-i18next';
import type { PrivateObjective, PublicObjective } from '../../types/game';

interface ObjectiveCardProps {
  objective: PublicObjective | PrivateObjective;
  selected: boolean;
  onAction: (id: string) => void;
  actionLabel: string;
  actionDisabled: boolean;
}

const ObjectiveCard: React.FC<ObjectiveCardProps> = ({
  objective,
  selected,
  onAction,
  actionLabel,
  actionDisabled,
}) => {
  const { t } = useTranslation();
  const isPublic = 'descriptionKey' in objective;

  return (
    <div
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
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={() => onAction(objective.id)}
          disabled={actionDisabled}
          className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
};

export default ObjectiveCard;
