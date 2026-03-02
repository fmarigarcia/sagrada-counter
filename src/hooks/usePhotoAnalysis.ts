import { useCallback, useState } from 'react';
import type { AnalysisPlacement, DiceColor, DiceValue } from '../types/game';

interface UsePhotoAnalysisReturn {
  analyse: (dataUrl: string) => Promise<AnalysisPlacement[]>;
  loading: boolean;
  error: string | null;
}

const BOARD_ROWS = 4;
const BOARD_COLS = 5;
const DIE_STD_LUMA_MIN = 24;
const DIE_COLORFULNESS_MIN = 24;
const DIE_SATURATION_MIN = 0.24;
const DIE_LOW_STD_LUMA_MIN = 18;
const VALUE_STD_MULTIPLIER = 0.8;
const VALUE_BRIGHT_THRESHOLD_MAX = 245;
const VALUE_DARK_THRESHOLD_MIN = 10;
const VALUE_COMPONENT_MIN_AREA_RATIO = 0.002;
const VALUE_COMPONENT_MAX_AREA_RATIO = 0.08;
const CELL_SAMPLE_PADDING_RATIO = 0.18;
const validColors: DiceColor[] = ['red', 'yellow', 'green', 'blue', 'purple'];
const validValues: DiceValue[] = [1, 2, 3, 4, 5, 6];

interface CellStats {
  avgR: number;
  avgG: number;
  avgB: number;
  avgSaturation: number;
  stdLuma: number;
  colorfulness: number;
}

const rgbToHsl = (
  red: number,
  green: number,
  blue: number,
): { hue: number; saturation: number; lightness: number } => {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;

  if (delta > 0) {
    if (max === r) {
      hue = ((g - b) / delta) % 6;
    } else if (max === g) {
      hue = (b - r) / delta + 2;
    } else {
      hue = (r - g) / delta + 4;
    }
    hue *= 60;
    if (hue < 0) {
      hue += 360;
    }
  }

  const lightness = (max + min) / 2;
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

  return { hue, saturation, lightness };
};

const getCellStats = (data: Uint8ClampedArray): CellStats => {
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let sumSat = 0;
  let sumLuma = 0;
  let sumLumaSq = 0;
  let sumRG = 0;
  let sumYB = 0;
  let sumRGSq = 0;
  let sumYBSq = 0;
  let pixels = 0;

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const { saturation } = rgbToHsl(red, green, blue);
    const luma = 0.299 * red + 0.587 * green + 0.114 * blue;
    const rg = red - green;
    const yb = 0.5 * (red + green) - blue;

    sumR += red;
    sumG += green;
    sumB += blue;
    sumSat += saturation;
    sumLuma += luma;
    sumLumaSq += luma * luma;
    sumRG += rg;
    sumYB += yb;
    sumRGSq += rg * rg;
    sumYBSq += yb * yb;
    pixels += 1;
  }

  if (pixels === 0) {
    return {
      avgR: 0,
      avgG: 0,
      avgB: 0,
      avgSaturation: 0,
      stdLuma: 0,
      colorfulness: 0,
    };
  }

  const meanLuma = sumLuma / pixels;
  const varianceLuma = Math.max(0, sumLumaSq / pixels - meanLuma * meanLuma);
  const meanRG = sumRG / pixels;
  const meanYB = sumYB / pixels;
  const stdRG = Math.sqrt(Math.max(0, sumRGSq / pixels - meanRG * meanRG));
  const stdYB = Math.sqrt(Math.max(0, sumYBSq / pixels - meanYB * meanYB));

  return {
    avgR: sumR / pixels,
    avgG: sumG / pixels,
    avgB: sumB / pixels,
    avgSaturation: sumSat / pixels,
    stdLuma: Math.sqrt(varianceLuma),
    colorfulness: Math.sqrt(stdRG * stdRG + stdYB * stdYB) + 0.3 * Math.sqrt(meanRG * meanRG + meanYB * meanYB),
  };
};

const isLikelyDie = (stats: CellStats): boolean =>
  (stats.stdLuma > DIE_STD_LUMA_MIN && stats.colorfulness > DIE_COLORFULNESS_MIN) ||
  (stats.avgSaturation > DIE_SATURATION_MIN && stats.stdLuma > DIE_LOW_STD_LUMA_MIN);

const detectDieColor = (stats: CellStats): DiceColor => {
  const { hue } = rgbToHsl(stats.avgR, stats.avgG, stats.avgB);
  if (hue < 20 || hue >= 340) {
    return 'red';
  }
  if (hue < 75) {
    return 'yellow';
  }
  if (hue < 165) {
    return 'green';
  }
  if (hue < 270) {
    return 'blue';
  }
  return 'purple';
};

const countConnectedComponents = (
  mask: boolean[],
  width: number,
  height: number,
  minArea: number,
  maxArea: number,
): number => {
  const visited = new Array<boolean>(mask.length).fill(false);
  let components = 0;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const startIndex = y * width + x;
      if (!mask[startIndex] || visited[startIndex]) {
        continue;
      }

      const queue: number[] = [startIndex];
      visited[startIndex] = true;
      let area = 0;

      while (queue.length > 0) {
        const current = queue.pop();
        if (current === undefined) {
          continue;
        }
        area += 1;
        const currentY = Math.floor(current / width);
        const currentX = current % width;
        const neighbours = [
          (currentY - 1) * width + currentX,
          (currentY + 1) * width + currentX,
          currentY * width + (currentX - 1),
          currentY * width + (currentX + 1),
        ];
        for (const neighbour of neighbours) {
          if (neighbour < 0 || neighbour >= mask.length || visited[neighbour] || !mask[neighbour]) {
            continue;
          }
          visited[neighbour] = true;
          queue.push(neighbour);
        }
      }

      if (area >= minArea && area <= maxArea) {
        components += 1;
      }
    }
  }

  return components;
};

const detectDieValue = (data: Uint8ClampedArray, width: number, height: number): DiceValue | null => {
  const gray = new Array<number>(width * height).fill(0);
  let sum = 0;
  let sumSq = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelIndex = (y * width + x) * 4;
      const value = 0.299 * data[pixelIndex] + 0.587 * data[pixelIndex + 1] + 0.114 * data[pixelIndex + 2];
      const grayIndex = y * width + x;
      gray[grayIndex] = value;
      sum += value;
      sumSq += value * value;
    }
  }

  const total = width * height;
  const mean = sum / total;
  const variance = Math.max(0, sumSq / total - mean * mean);
  const std = Math.sqrt(variance);
  const brightThreshold = Math.min(VALUE_BRIGHT_THRESHOLD_MAX, mean + std * VALUE_STD_MULTIPLIER);
  const darkThreshold = Math.max(VALUE_DARK_THRESHOLD_MIN, mean - std * VALUE_STD_MULTIPLIER);
  const minArea = Math.max(3, Math.round(total * VALUE_COMPONENT_MIN_AREA_RATIO));
  const maxArea = Math.max(minArea + 1, Math.round(total * VALUE_COMPONENT_MAX_AREA_RATIO));
  const brightMask = gray.map((value) => value >= brightThreshold);
  const darkMask = gray.map((value) => value <= darkThreshold);
  const brightCount = countConnectedComponents(brightMask, width, height, minArea, maxArea);
  const darkCount = countConnectedComponents(darkMask, width, height, minArea, maxArea);
  const candidateCounts = [brightCount, darkCount].filter(
    (count): count is DiceValue => validValues.includes(count as DiceValue),
  );

  if (candidateCounts.length === 0) {
    return null;
  }
  return candidateCounts[0];
};

const loadImage = (dataUrl: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('INVALID_IMAGE'));
    image.src = dataUrl;
  });

const detectPlacements = (context: CanvasRenderingContext2D): AnalysisPlacement[] => {
  const placements: AnalysisPlacement[] = [];
  const cellWidth = context.canvas.width / BOARD_COLS;
  const cellHeight = context.canvas.height / BOARD_ROWS;

  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLS; col += 1) {
      const paddingX = Math.floor(cellWidth * CELL_SAMPLE_PADDING_RATIO);
      const paddingY = Math.floor(cellHeight * CELL_SAMPLE_PADDING_RATIO);
      const x = Math.floor(col * cellWidth + paddingX);
      const y = Math.floor(row * cellHeight + paddingY);
      const width = Math.max(8, Math.floor(cellWidth - paddingX * 2));
      const height = Math.max(8, Math.floor(cellHeight - paddingY * 2));
      const imageData = context.getImageData(x, y, width, height);
      const stats = getCellStats(imageData.data);
      if (!isLikelyDie(stats)) {
        continue;
      }

      const color = detectDieColor(stats);
      const value = detectDieValue(imageData.data, width, height);
      if (value === null) {
        continue;
      }

      placements.push({ row, col, color, value });
    }
  }

  return placements;
};

const isValidPlacement = (entry: AnalysisPlacement): boolean => {
  return (
    Number.isInteger(entry.row) &&
    entry.row >= 0 &&
    entry.row < BOARD_ROWS &&
    Number.isInteger(entry.col) &&
    entry.col >= 0 &&
    entry.col < BOARD_COLS &&
    validColors.includes(entry.color) &&
    validValues.includes(entry.value)
  );
};

const usePhotoAnalysis = (): UsePhotoAnalysisReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyse = useCallback(async (dataUrl: string): Promise<AnalysisPlacement[]> => {
    setLoading(true);
    setError(null);

    try {
      if (!dataUrl.startsWith('data:')) {
        throw new Error('INVALID_IMAGE');
      }

      const image = await loadImage(dataUrl);
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('CONTEXT_UNAVAILABLE');
      }
      context.drawImage(image, 0, 0, image.width, image.height);
      const placements = detectPlacements(context).filter(isValidPlacement);
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
