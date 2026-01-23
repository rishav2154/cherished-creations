// Mug Editor Types

export interface PrintAreaDimensions {
  width: number; // in pixels at 300 DPI
  height: number; // in pixels at 300 DPI
  aspectRatio: number;
}

export interface MugVariant {
  id: string;
  name: string;
  printArea: PrintAreaDimensions;
  price: number;
}

export const MUG_VARIANTS: MugVariant[] = [
  {
    id: '11oz',
    name: '11oz Classic',
    printArea: {
      width: 2100, // 7in × 300 DPI
      height: 1197, // 3.99in × 300 DPI
      aspectRatio: 7 / 3.99
    },
    price: 349
  },
  {
    id: '15oz',
    name: '15oz Large',
    printArea: {
      width: 2400, // 8in × 300 DPI
      height: 1350, // 4.5in × 300 DPI
      aspectRatio: 8 / 4.5
    },
    price: 449
  }
];

export interface EditorState {
  canvasDataUrl: string | null;
  hasChanges: boolean;
  selectedVariant: MugVariant;
}

export interface CanvasExportOptions {
  format: 'png' | 'jpeg';
  quality: number;
  multiplier: number; // For high-resolution export
}
