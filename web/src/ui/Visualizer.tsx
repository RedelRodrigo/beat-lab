import { useEffect, useRef } from "react";
import { engine } from "../audio/playback";
import { useTransportStore } from "../store/transportStore";

const WIDTH = 320;
const HEIGHT = 56;

export function Visualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPlaying = useTransportStore((state) => state.isPlaying);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = WIDTH * dpr;
    canvas.height = HEIGHT * dpr;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const data = new Uint8Array(64);
    let raf = 0;
    const draw = () => {
      context.clearRect(0, 0, WIDTH, HEIGHT);
      if (engine.analyser) {
        engine.analyser.getByteFrequencyData(data);
        const barWidth = WIDTH / data.length;
        for (let index = 0; index < data.length; index += 1) {
          const height = Math.max(2, (data[index] / 255) * HEIGHT);
          context.fillStyle = `hsl(${150 + index * 2.2} 85% 60%)`;
          context.beginPath();
          context.roundRect(
            index * barWidth + 1,
            HEIGHT - height,
            barWidth - 2,
            height,
            2,
          );
          context.fill();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    if (isPlaying) draw();
    else context.clearRect(0, 0, WIDTH, HEIGHT);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ width: WIDTH, height: HEIGHT }}
      className="hidden max-w-full sm:block"
    />
  );
}
