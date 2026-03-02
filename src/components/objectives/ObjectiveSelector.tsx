import React from 'react';
import type { PrivateObjective, PublicObjective } from '../../types/game';
import ObjectiveCard from './ObjectiveCard';

interface ObjectiveSelectorProps {
  objectives: Array<PublicObjective | PrivateObjective>;
  selectedIds: string[];
  onToggle: (id: string) => void;
}

const ObjectiveSelector: React.FC<ObjectiveSelectorProps> = ({
  objectives,
  selectedIds,
  onToggle,
}) => {
  return (
    <div className="flex flex-col gap-2">
      {objectives.map((objective) => (
        <ObjectiveCard
          key={objective.id}
          objective={objective}
          selected={selectedIds.includes(objective.id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
};

export default ObjectiveSelector;
