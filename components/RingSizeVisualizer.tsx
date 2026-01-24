
import React, { useRef, useEffect } from 'react';

interface RingSizeVisualizerProps {
  diameterMM: number;
  circumferenceMM?: number;
}

const RingSizeVisualizer: React.FC<RingSizeVisualizerProps> = ({ diameterMM, circumferenceMM }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scale so a ~32mm diameter ring fits in 80% of canvas; 25 was too large on screen
    const scale = Math.min(canvas.width, canvas.height) * 0.8 / 32;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = (diameterMM / 2) * scale;
    const bandWidth = 3 * scale;

    const gradient = ctx.createRadialGradient(
      centerX, centerY, radius - bandWidth,
      centerX, centerY, radius + bandWidth
    );
    gradient.addColorStop(0, '#333');
    gradient.addColorStop(0.3, '#999');
    gradient.addColorStop(0.5, '#eee');
    gradient.addColorStop(0.7, '#999');
    gradient.addColorStop(1, '#333');

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
    ctx.lineWidth = bandWidth * 2;
    ctx.strokeStyle = gradient;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
    ctx.fillStyle = '#1E1E1E';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2, false);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fill();
  }, [diameterMM]);

  const circum = circumferenceMM ?? diameterMM * Math.PI;

  return (
    <div className="flex flex-col items-center justify-center">
      <canvas
        ref={canvasRef}
        width={200}
        height={200}
        className="border-2 border-current/10 rounded"
      />
      <p className="text-[10px] text-center font-thin opacity-60 mt-2">
        Actual ring size: {diameterMM.toFixed(2)}mm diameter / {circum.toFixed(2)}mm circumference
      </p>
    </div>
  );
};

export default RingSizeVisualizer;
