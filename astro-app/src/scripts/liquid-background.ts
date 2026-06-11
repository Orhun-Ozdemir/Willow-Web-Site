/**
 * Three.js organic liquid background shader.
 * Mounts on `.hero-liquid-canvas`.
 * Generates slow, morphing organic watercolor-like blobs in the background:
 * off-white base with Deep Navy, Cyber Cyan, and Amber Gold highlights.
 * Reacts to mouse coordinates and is fully optimized with lifecycle cleanups.
 */
import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "three";

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;

  float wave(vec2 p, float angle, float speed, float freq) {
    float a = angle * 3.14159 / 180.0;
    vec2 dir = vec2(cos(a), sin(a));
    return sin(dot(p, dir) * freq + uTime * speed);
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * 2.0;
    
    // Adjust aspect ratio
    p.x *= uResolution.x / uResolution.y;

    // Build plasma field for organic flow
    float f = 0.0;
    f += wave(p, 10.0, 0.7, 0.9);
    f += wave(p, 55.0, 0.5, 1.3);
    f += wave(p, 110.0, 0.9, 0.75);
    f += wave(p, 145.0, 0.4, 1.4);
    f = f * 0.25 + 0.5;

    // Mouse interactive field
    float mDist = distance(uv, uMouse);
    float mouseGlow = smoothstep(0.7, 0.0, mDist);

    // Fluid procedural blobs
    vec2 p1 = p + vec2(sin(uTime * 0.25) * 0.45, cos(uTime * 0.18) * 0.35);
    vec2 p2 = p + vec2(cos(uTime * 0.32) * 0.35, sin(uTime * 0.22) * 0.45);
    vec2 p3 = p + vec2(sin(uTime * 0.15 + 1.5) * 0.55, cos(uTime * 0.38) * 0.25);

    // Smooth soft blobs
    float blob1 = smoothstep(1.1, 0.0, length(p1) - 0.18 * sin(uTime * 0.5));
    float blob2 = smoothstep(0.95, 0.0, length(p2) - 0.22 * cos(uTime * 0.4));
    float blob3 = smoothstep(1.3, 0.0, length(p3) - 0.35 * sin(uTime * 0.3));

    // Editorial Palette (Light off-white background + accents)
    vec3 baseBg = vec3(0.98, 0.976, 0.965);  // #FAF9F6 Off-white paper
    vec3 navy = vec3(0.075, 0.129, 0.459);    // #132175 Deep Navy
    vec3 cyan = vec3(0.102, 0.639, 0.769);    // #1AA3C4 Cyber Cyan
    vec3 gold = vec3(0.910, 0.709, 0.290);    // #E8B54A Amber Gold

    // Layer the colors softly
    vec3 color = baseBg;
    color = mix(color, navy, blob1 * 0.18);
    color = mix(color, cyan, blob2 * 0.24);
    color = mix(color, gold, blob3 * 0.15);

    // Soft mouse interactives
    color = mix(color, cyan, mouseGlow * 0.07);

    gl_FragColor = vec4(color, 1.0);
  }
`;

let activeCleanup: (() => void) | null = null;

export function initLiquidBackground(): void {
  // Dispose of any existing instances
  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }

  const canvas = document.querySelector<HTMLCanvasElement>(".hero-liquid-canvas");
  if (!canvas) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new WebGLRenderer({ canvas, alpha: false, antialias: false });
  renderer.setClearColor(0xfaf9f6, 1.0);

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new Vector2(1, 1) },
    uMouse: { value: new Vector2(0.5, 0.5) },
  };

  const geometry = new PlaneGeometry(2, 2);
  const material = new ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms,
    depthWrite: false,
    depthTest: false,
  });

  const mesh = new Mesh(geometry, material);
  scene.add(mesh);

  function resize() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    renderer.setPixelRatio(0.65);
    renderer.setSize(w, h, false);
    uniforms.uResolution.value.set(w, h);
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  const targetMouse = new Vector2(0.5, 0.5);
  const handlePointerMove = (e: PointerEvent) => {
    targetMouse.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
  };
  window.addEventListener("pointermove", handlePointerMove, { passive: true });

  let running = false;
  let raf = 0;
  const start = performance.now();

  function frame() {
    if (!running) return;
    uniforms.uTime.value = (performance.now() - start) / 1000;
    uniforms.uMouse.value.lerp(targetMouse, 0.08);

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  if (reducedMotion) {
    renderer.render(scene, camera);
    return;
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
  observer.observe(canvas);

  // Register cleanup
  activeCleanup = () => {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", handlePointerMove);
    observer.disconnect();

    // Dispose resources
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };
}
