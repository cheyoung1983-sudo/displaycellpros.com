import React, { useRef, useState, useEffect } from 'react';
import { RefreshCcw, Check } from 'lucide-react';

interface SignaturePadProps {
  onSign: (signatureDataUrl: string) => void;
  onCancel?: () => void;
  title?: string;
}

export function SignaturePad({ onSign, onCancel, title = "Sign for Approval" }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Fix internal resolution based on CSS size to avoid distortion
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Handle window resize
    const handleResize = () => {
      // Just clear it for standard resizing (or could save/restore data)
      const currentRect = canvas.getBoundingClientRect();
      canvas.width = currentRect.width;
      canvas.height = currentRect.height;
      if (ctx) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
      setHasSignature(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
    setShowError(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    // Prevent scrolling when touching the canvas
    if (e.cancelable && e.type.includes('touch')) {
      e.preventDefault();
    }

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setShowError(false);
  };

  const handleConfirm = () => {
    if (!hasSignature) {
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      return;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      onSign(canvas.toDataURL('image/png'));
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
        {onCancel && (
          <button 
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-white uppercase tracking-wider font-bold transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
      
      <div ref={containerRef} className={`relative bg-slate-950 border rounded-lg overflow-hidden mb-4 h-[200px] transition-colors ${showError ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-slate-800'}`}>
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasSignature && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <span className="text-slate-600 font-mono text-sm uppercase tracking-widest opacity-50">Sign Here</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={clearSignature}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          Clear
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className={`flex items-center gap-2 px-6 py-2.5 text-white text-xs font-extrabold rounded-lg transition-all shadow-lg uppercase tracking-wider ${
            showError 
              ? "bg-red-600 hover:bg-red-500 shadow-red-600/15 animate-pulse" 
              : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/15"
          }`}
        >
          <Check className="w-4 h-4" />
          {showError ? "Signature Required" : "Confirm Approval"}
        </button>
      </div>
    </div>
  );
}
