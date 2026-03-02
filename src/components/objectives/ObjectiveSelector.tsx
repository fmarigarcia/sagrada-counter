import React from 'react';
import { useTranslation } from 'react-i18next';
import type { PrivateObjective, PublicObjective } from '../../types/game';
import ObjectiveCard from './ObjectiveCard';

interface ObjectiveSelectorProps {
  objectives: Array<PublicObjective | PrivateObjective>;
  selectedIds: string[];
  onToggle: (id: string) => void;
  max: number;
  allowMultiple: boolean;
}

const ObjectiveSelector: React.FC<ObjectiveSelectorProps> = ({
  objectives,
  selectedIds,
  onToggle,
  max,
  allowMultiple,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      {objectives.map((objective) => (
        <ObjectiveCard
          key={objective.id}
          objective={objective}
          selected={selectedIds.includes(objective.id)}
          onAction={onToggle}
          actionLabel={
            selectedIds.includes(objective.id)
              ? allowMultiple
                ? t('objectives.remove')
                : t('objectives.added')
              : t('objectives.add')
          }
          actionDisabled={
            selectedIds.includes(objective.id)
              ? !allowMultiple
              : allowMultiple
                ? selectedIds.length >= max
                : false
          }
        />
      ))}
    </div>
  );
};

export default ObjectiveSelector;
