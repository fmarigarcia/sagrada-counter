import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PrivateObjective, PublicObjective } from '../../types/game';
import ObjectiveCard from './ObjectiveCard';

interface ObjectiveSelectorProps {
  objectives: Array<PublicObjective | PrivateObjective>;
  selectedIds: string[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  max: number;
}

const ObjectiveSelector: React.FC<ObjectiveSelectorProps> = ({
  objectives,
  selectedIds,
  onAdd,
  onRemove,
  max,
}) => {
  const { t } = useTranslation();
  const selectedObjectives = useMemo(
    () => objectives.filter((objective) => selectedIds.includes(objective.id)),
    [objectives, selectedIds],
  );
  const availableObjectives = useMemo(
    () => objectives.filter((objective) => !selectedIds.includes(objective.id)),
    [objectives, selectedIds],
  );
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const activeOptionId = selectedOptionId || availableObjectives[0]?.id || '';

  return (
    <div className="flex flex-col gap-2">
      {selectedIds.length < max && availableObjectives.length > 0 && (
        <div className="flex items-center gap-2">
          <select
            value={activeOptionId}
            onChange={(event) => setSelectedOptionId(event.target.value)}
            aria-label={t('objectives.selectObjective')}
            className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
          >
            {availableObjectives.map((objective) => (
              <option key={objective.id} value={objective.id}>
                {t(objective.nameKey)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              onAdd(activeOptionId);
              setSelectedOptionId('');
            }}
            disabled={activeOptionId.length === 0}
            className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {t('objectives.add')}
          </button>
        </div>
      )}
      {selectedObjectives.map((objective) => (
        <ObjectiveCard
          key={objective.id}
          objective={objective}
          onRemove={() => onRemove(objective.id)}
        />
      ))}
    </div>
  );
};

export default ObjectiveSelector;
