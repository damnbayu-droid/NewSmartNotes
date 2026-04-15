declare module 'react-signature-canvas' {
  import { Component, ReactNode } from 'react';

  export interface SignatureCanvasProps {
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
    clearOnResize?: boolean;
    minWidth?: number;
    maxWidth?: number;
    dotSize?: number;
    penColor?: string;
    backgroundColor?: string;
    velocityFilterWeight?: number;
    onBegin?: () => void;
    onEnd?: () => void;
  }

  export default class SignatureCanvas extends Component<SignatureCanvasProps> {
    clear: () => void;
    fromDataURL: (dataURL: string, options?: { ratio?: number; width?: number; height?: number; callback?: () => void }) => void;
    toDataURL: (type?: string, encoderOptions?: number) => string;
    on: () => void;
    off: () => void;
    isEmpty: () => boolean;
    fromData: (pointGroups: any[]) => void;
    toData: () => any[];
    getTrimmedCanvas: () => HTMLCanvasElement;
    getCanvas: () => HTMLCanvasElement;
    toBlob: (callback: (blob: Blob | null) => void, type?: string, encoderOptions?: number) => void;
  }
}
