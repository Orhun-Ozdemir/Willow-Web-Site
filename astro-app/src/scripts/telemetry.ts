/**
 * Live telemetry hero panel — the product, demonstrated.
 * A self-drawing sensor trace (oscilloscope style) plus live readouts
 * (temperature, humidity, RSSI, packet counter), exactly the kind of
 * field data WillowSoft hardware ships to dashboards.
 * Mounts on `.telemetry-panel`.
 */

const TRACE_COLOR = "#1aa3c4";
const GRID_COLOR = "rgba(19, 27, 46, 0.07)";
const TICK_COLOR = "#e8b54a";

export function initTelemetry(): void {
  const panel = document.querySelector<HTMLElement>(".telemetry-panel");
  if (!panel) return;

  const canvas = panel.querySelector<HTMLCanvasElement>(".telemetry-trace");
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width = 0;
  let height = 0;

  function resize() {
    const rect = canvas!.getBoundingClientRect();
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas!.width = Math.floor(width * scale);
    canvas!.height = Math.floor(height * scale);
    ctx!.setTransform(scale, 0, 0, scale, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  // Smooth pseudo-sensor signal: layered sines + slow random walk
  let walk = 0;
  function signal(t: number): number {
    walk += (Math.random() - 0.5) * 0.012;
    walk = Math.max(-0.18, Math.min(0.18, walk));
    return (
      Math.sin(t * 1.1) * 0.22 +
      Math.sin(t * 0.37 + 1.7) * 0.3 +
      Math.sin(t * 2.9 + 0.4) * 0.07 +
      walk
    );
  }

  const SAMPLES = 160;
  const buffer: number[] = new Array(SAMPLES).fill(0);

  function draw(t: number) {
    ctx!.clearRect(0, 0, width, height);

    // Hairline grid — engineering paper
    ctx!.strokeStyle = GRID_COLOR;
    ctx!.lineWidth = 1;
    ctx!.beginPath();
    for (let x = 0; x <= width; x += 28) {
      ctx!.moveTo(x + 0.5, 0);
      ctx!.lineTo(x + 0.5, height);
    }
    for (let y = 0; y <= height; y += 28) {
      ctx!.moveTo(0, y + 0.5);
      ctx!.lineTo(width, y + 0.5);
    }
    ctx!.stroke();

    // Midline
    ctx!.strokeStyle = "rgba(19, 27, 46, 0.14)";
    ctx!.setLineDash([4, 6]);
    ctx!.beginPath();
    ctx!.moveTo(0, height / 2 + 0.5);
    ctx!.lineTo(width, height / 2 + 0.5);
    ctx!.stroke();
    ctx!.setLineDash([]);

    // Trace
    ctx!.strokeStyle = TRACE_COLOR;
    ctx!.lineWidth = 1.8;
    ctx!.lineJoin = "round";
    ctx!.beginPath();
    for (let i = 0; i < SAMPLES; i++) {
      const x = (i / (SAMPLES - 1)) * width;
      const y = height / 2 + buffer[i] * height * 0.62;
      i === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
    }
    ctx!.stroke();

    // Glowing head
    const headY = height / 2 + buffer[SAMPLES - 1] * height * 0.62;
    ctx!.fillStyle = TRACE_COLOR;
    ctx!.beginPath();
    ctx!.arc(width - 2, headY, 3, 0, Math.PI * 2);
    ctx!.fill();

    // Amber peak ticks where the signal crests
    ctx!.strokeStyle = TICK_COLOR;
    ctx!.lineWidth = 1.5;
    ctx!.beginPath();
    for (let i = 2; i < SAMPLES - 2; i++) {
      if (buffer[i] < buffer[i - 2] - 0.04 && buffer[i] < buffer[i + 2] - 0.04) {
        const x = (i / (SAMPLES - 1)) * width;
        const y = height / 2 + buffer[i] * height * 0.62;
        ctx!.moveTo(x, y - 9);
        ctx!.lineTo(x, y - 4);
      }
    }
    ctx!.stroke();
  }

  // Live readouts
  const readouts = {
    temp: panel.querySelector<HTMLElement>('[data-ro="temp"]'),
    rh: panel.querySelector<HTMLElement>('[data-ro="rh"]'),
    rssi: panel.querySelector<HTMLElement>('[data-ro="rssi"]'),
    pkts: panel.querySelector<HTMLElement>('[data-ro="pkts"]'),
  };
  let pkts = 1024 + Math.floor(Math.random() * 400);
  let lastReadout = 0;

  function updateReadouts(now: number, t: number) {
    if (now - lastReadout < 1400) return;
    lastReadout = now;
    pkts += 1 + Math.floor(Math.random() * 3);
    if (readouts.temp) readouts.temp.textContent = (23.1 + Math.sin(t * 0.21) * 1.4).toFixed(1) + "°C";
    if (readouts.rh) readouts.rh.textContent = Math.round(48 + Math.sin(t * 0.13 + 2) * 5) + "%";
    if (readouts.rssi) readouts.rssi.textContent = "-" + Math.round(86 + Math.sin(t * 0.4) * 5) + " dBm";
    if (readouts.pkts) readouts.pkts.textContent = pkts.toLocaleString();
  }

  // Static render for reduced motion
  if (reducedMotion) {
    for (let i = 0; i < SAMPLES; i++) buffer[i] = signal(i * 0.12);
    draw(0);
    return;
  }

  let running = false;
  let raf = 0;
  const start = performance.now();
  let lastSample = 0;

  function frame(now: number) {
    if (!running) return;
    const t = (now - start) / 1000;

    // ~30 samples/sec scroll speed
    if (now - lastSample > 33) {
      lastSample = now;
      buffer.shift();
      buffer.push(signal(t * 1.6));
    }

    draw(t);
    updateReadouts(now, t);
    raf = requestAnimationFrame(frame);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          if (!running) {
            running = true;
            raf = requestAnimationFrame(frame);
          }
        } else {
          running = false;
          cancelAnimationFrame(raf);
        }
      });
    },
    { threshold: 0.01 }
  );
  observer.observe(panel);
}
