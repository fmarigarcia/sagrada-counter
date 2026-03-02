import { useCallback, useState } from 'react';
import type { AnalysisPlacement, DiceColor, DiceValue } from '../types/game';

interface GitHubModelsResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    code?: string;
    message?: string;
  };
}

interface UsePhotoAnalysisReturn {
  analyse: (dataUrl: string) => Promise<AnalysisPlacement[]>;
  loading: boolean;
  error: string | null;
}

const validColors: DiceColor[] = ['red', 'yellow', 'green', 'blue', 'purple'];
const validValues: DiceValue[] = [1, 2, 3, 4, 5, 6];

const isValidPlacement = (entry: unknown): entry is AnalysisPlacement => {
  if (typeof entry !== 'object' || entry === null) {
    return false;
  }
  const placement = entry as Record<string, unknown>;
  return (
    typeof placement.row === 'number' &&
    Number.isInteger(placement.row) &&
    placement.row >= 0 &&
    placement.row <= 3 &&
    typeof placement.col === 'number' &&
    Number.isInteger(placement.col) &&
    placement.col >= 0 &&
    placement.col <= 4 &&
    typeof placement.color === 'string' &&
    validColors.includes(placement.color as DiceColor) &&
    typeof placement.value === 'number' &&
    validValues.includes(placement.value as DiceValue)
  );
};

const usePhotoAnalysis = (): UsePhotoAnalysisReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyse = useCallback(async (dataUrl: string): Promise<AnalysisPlacement[]> => {
    setLoading(true);
    setError(null);

    const githubToken = import.meta.env.VITE_GITHUB_TOKEN;
    if (!githubToken) {
      const keyError = 'MISSING_API_KEY';
      setError(keyError);
      setLoading(false);
      return [];
    }

    try {
      if (!dataUrl.startsWith('data:')) {
        throw new Error('INVALID_IMAGE');
      }

      const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${githubToken}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: { url: dataUrl },
                },
                {
                  type: 'text',
                  text: 'This is a Sagrada board game window (4 rows × 5 columns grid). Identify each die placed on the board. Return ONLY a valid JSON array, no markdown fences, with objects: { "row": 0-3, "col": 0-4, "color": "red|yellow|green|blue|purple", "value": 1-6 }. Use 0-based row/col indices. Omit empty cells.',
                },
              ],
            },
          ],
          temperature: 0,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('RATE_LIMITED');
        }
        throw new Error('API_ERROR');
      }

      const payload = (await response.json()) as GitHubModelsResponse;
      const jsonText = payload.choices?.[0]?.message?.content;
      if (!jsonText) {
        throw new Error('INVALID_RESPONSE');
      }

      // gpt-4o with json_object format returns a JSON object, not always a bare array.
      // Support both: bare array or { placements: [...] } / any top-level array value.
      const rawParsed = JSON.parse(jsonText) as unknown;
      let parsed: unknown[];
      if (Array.isArray(rawParsed)) {
        parsed = rawParsed;
      } else if (typeof rawParsed === 'object' && rawParsed !== null) {
        const firstArray = Object.values(rawParsed as Record<string, unknown>).find(Array.isArray);
        parsed = (firstArray as unknown[] | undefined) ?? [];
      } else {
        throw new Error('INVALID_FORMAT');
      }

      const placements = parsed.filter(isValidPlacement);
      if (placements.length !== parsed.length) {
        throw new Error('INVALID_PLACEMENTS');
      }

      return placements;
    } catch (analysisError: unknown) {
      setError(analysisError instanceof Error ? analysisError.message : 'ANALYSIS_FAILED');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { analyse, loading, error };
};

export default usePhotoAnalysis;
