/**
 * Three.js kinetic media — liquid distortion on hover.
 * Mounts a WebGL plane over any `.kinetic-media` container's <img>.
 * Mouse movement displaces the texture with velocity-driven flow and
 * an organic circular ripple wave + subtle RGB split.
 * Optimized with lifecycle cleanup hooks for Astro 5.0+ view transitions.
 */
import {
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  TextureLoader,
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
  uniform sampler2D uTex;
  uniform vec2 uPlaneRes;
  uniform vec2 uImgRes;
  uniform vec2 uMouse;
  uniform vec2 uVel;
  uniform float uHover;
  uniform float uTime;

  /* cover-fit the texture inside the plane */
  vec2 coverUv(vec2 uv) {
    float planeRatio = uPlaneRes.x / uPlaneRes.y;
    float imgRatio = uImgRes.x / uImgRes.y;
    vec2 scale = planeRatio > imgRatio
      ? vec2(1.0, imgRatio / planeRatio)
      : vec2(planeRatio / imgRatio, 1.0);
    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    vec2 uv = vUv;
    float dist = distance(uv, uMouse);
    float influence = smoothstep(0.48, 0.0, dist) * uHover;

    /* organic expanding circular ripple centered at mouse */
    float ripple = sin(dist * 38.0 - uTime * 6.2) * 0.0055 * influence;
    vec2 dir = uv - uMouse;
    vec2 displaced = uv + normalize(dir + 0.0001) * ripple - uVel * influence * 0.38;

    /* gentle idle ripple near the cursor */
    displaced.y += sin(uv.x * 10.0 + uTime * 1.5) * 0.0035 * influence;
    displaced.x += cos(uv.y * 8.0 + uTime * 1.2) * 0.0025 * influence;

    vec2 cuv = coverUv(displaced);

    /* RGB split along the velocity vector */
    vec2 shift = uVel * influence * 0.032 + normalize(dir + 0.0001) * ripple * 0.15;
    float r = texture2D(uTex, coverUv(displaced + shift)).r;
    vec4 g = texture2D(uTex, cuv);
    float b = texture2D(uTex, coverUv(displaced - shift)).b;

    gl_FragColor = vec4(r, g.g, b, g.a);
  }
`;

let activeCleanups: (() => void)[] = [];

export function initKineticMedia(): void {
  // Clear any existing instances
  activeCleanups.forEach((cleanup) => cleanup());
  activeCleanups = [];

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return; // plain <img> stays visible

  document.querySelectorAll<HTMLElement>(".kinetic-media").forEach((container) => {
    const img = container.querySelector("img");
    if (!img) return;

    // Check if canvas already exists
    if (container.querySelector(".kinetic-media-canvas")) return;

    const canvas = document.createElement("canvas");
    canvas.className = "kinetic-media-canvas";
    canvas.setAttribute("aria-hidden", "true");
    container.appendChild(canvas);

    const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setClearColor(0x000000, 0);

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTex: { value: null as any },
      uPlaneRes: { value: new Vector2(1, 1) },
      uImgRes: { value: new Vector2(1, 1) },
      uMouse: { value: new Vector2(0.5, 0.5) },
      uVel: { value: new Vector2(0, 0) },
      uHover: { value: 0 },
      uTime: { value: 0 },
    };

    const geometry = new PlaneGeometry(2, 2);
    const material = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
      transparent: true,
    });
    
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    let textureLoaded = false;
    const texture = new TextureLoader().load(img.currentSrc || img.src, (tex) => {
      tex.minFilter = LinearFilter;
      uniforms.uTex.value = tex;
      uniforms.uImgRes.value.set(tex.image.width, tex.image.height);
      img.style.opacity = "0"; // shader plane takes over
      renderer.render(scene, camera);
      textureLoaded = true;
    });

    function resize() {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      uniforms.uPlaneRes.value.set(w, h);
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Mouse tracking with smoothed velocity
    const target = new Vector2(0.5, 0.5);
    let hoverTarget = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      target.set((e.clientX - rect.left) / rect.width, 1 - (e.clientY - rect.top) / rect.height);
      hoverTarget = 1;
    };

    const handlePointerLeave = () => {
      hoverTarget = 0;
    };

    container.addEventListener("pointermove", handlePointerMove, { passive: true });
    container.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    let running = false;
    let raf = 0;
    const start = performance.now();
    const prevMouse = new Vector2(0.5, 0.5);

    function frame() {
      if (!running) return;
      uniforms.uTime.value = (performance.now() - start) / 1000;

      const m = uniforms.uMouse.value;
      m.lerp(target, 0.12);
      const vel = uniforms.uVel.value;
      vel.set(m.x - prevMouse.x, m.y - prevMouse.y).multiplyScalar(8);
      // ease velocity decay so the wake settles smoothly
      vel.lerp(new Vector2(0, 0), 0.06);
      prevMouse.copy(m);

      uniforms.uHover.value += (hoverTarget - uniforms.uHover.value) * 0.08;

      renderer.render(scene, camera);
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
    observer.observe(container);

    // Register cleanup function
    activeCleanups.push(() => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      observer.disconnect();

      // Dispose GL assets
      geometry.dispose();
      material.dispose();
      if (texture) {
        texture.dispose();
      }
      renderer.dispose();

      // Restore DOM state
      img.style.opacity = "1";
      canvas.remove();
    });
  });
}
