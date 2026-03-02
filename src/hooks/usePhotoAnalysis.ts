import { useCallback, useState } from 'react';
import type { AnalysisPlacement, DiceColor, DiceValue } from '../types/game';

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

interface UsePhotoAnalysisReturn {
  analyse: (dataUrl: string) => Promise<AnalysisPlacement[]>;
  loading: boolean;
  error: string | null;
}

const validColors: DiceColor[] = ['red', 'yellow', 'green', 'blue', 'purple'];
const validValues: DiceValue[] = [1, 2, 3, 4, 5, 6];

const getImageData = (dataUrl: string): { mimeType: string; data: string } | null => {
  const [metadata, data] = dataUrl.split(',');
  if (!metadata || !data) {
    return null;
  }
  const mimeType = metadata.match(/^data:(.*);base64$/)?.[1] ?? 'image/jpeg';
  return { mimeType, data };
};

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

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      const keyError = 'MISSING_API_KEY';
      setError(keyError);
      setLoading(false);
      return [];
    }

    try {
      const imageData = getImageData(dataUrl);
      if (!imageData) {
        throw new Error('INVALID_IMAGE');
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inlineData: {
                      mimeType: imageData.mimeType,
                      data: imageData.data,
                    },
                  },
                  {
                    text: 'This is a Sagrada board game window (4 rows × 5 columns grid). Identify each die placed on the board. Return ONLY a valid JSON array, no markdown fences, with objects: { "row": 0-3, "col": 0-4, "color": "red|yellow|green|blue|purple", "value": 1-6 }. Use 0-based row/col indices. Omit empty cells.',
                  },
                ],
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        throw new Error('API_ERROR');
      }

      const payload = (await response.json()) as GeminiResponse;
      const jsonText = payload.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!jsonText) {
        throw new Error('INVALID_RESPONSE');
      }

      const parsed = JSON.parse(jsonText) as unknown;
      if (!Array.isArray(parsed)) {
        throw new Error('INVALID_FORMAT');
      }

      const placements = parsed.filter(isValidPlacement);
      if (placements.length !== parsed.length) {
        throw new Error('INVALID_PLACEMENTS');
      }

      return placements;
    } catch {
      setError('ANALYSIS_FAILED');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { analyse, loading, error };
};

export default usePhotoAnalysis;
