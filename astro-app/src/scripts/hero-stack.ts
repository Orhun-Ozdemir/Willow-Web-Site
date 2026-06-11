/**
 * Three.js hero centerpiece — "The Stack".
 * Five tinted glass slabs (hardware → firmware → connectivity → backend →
 * interfaces) floating as a sculpture: PBR transmission materials with
 * studio reflections, idle bobbing, mouse parallax, and a scroll-driven
 * spread as the hero leaves the viewport.
 * Refined with high-refraction indices for clean light/white B2B editorial theme.
 * Mounts on `.hero-stack-canvas` (homepage hero).
 */
import {
  BoxGeometry,
  Color,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LAYER_TINTS = ["#132175", "#ffffff", "#1aa3c4", "#e8b54a", "#0e1a5e"];

let activeCleanup: (() => void) | null = null;

export function initHeroStack(): void {
  // Clean up any existing instances first
  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }

  const canvas = document.querySelector<HTMLCanvasElement>(".hero-stack-canvas");
  if (!canvas) return;
  if (window.innerWidth < 900) return; // desktop-only sculpture

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new PerspectiveCamera(38, 1, 0.1, 60);
  camera.position.set(0, 0.4, 9.5);

  const group = new Group();
  group.rotation.set(0.32, -0.5, 0.06);
  scene.add(group);

  const GAP = 0.52;
  const slabs: Mesh[] = [];
  const geo = new BoxGeometry(3.1, 0.16, 2.1);

  LAYER_TINTS.forEach((tint, i) => {
    // Premium heavy-refraction crystal physical material settings
    const material = new MeshPhysicalMaterial({
      color: new Color(tint),
      transmission: 0.96, // highly transparent
      thickness: 2.2, // thick glass creates beautiful refraction edges
      roughness: 0.08, // highly polished
      metalness: 0.05, // subtle metallic highlights
      ior: 1.65, // high refractive index for editorial flint crystal look
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      transparent: true,
      envMapIntensity: 1.8, // boost studio lighting reflection details
    });
    const slab = new Mesh(geo, material);
    slab.position.y = (i - 2) * GAP;
    slab.rotation.y = (i - 2) * 0.07;
    group.add(slab);
    slabs.push(slab);
  });

  // Scroll-driven spread: layers separate as the hero scrolls away
  const spread = { value: 0 };
  const hero = canvas.closest(".hero") || canvas.parentElement;
  
  let scrollTween: gsap.core.Tween | null = null;
  if (!reducedMotion && hero) {
    scrollTween = gsap.to(spread, {
      value: 1,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom 20%",
        scrub: 1,
      },
    });
  }

  function resize() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  let targetX = 0;
  let targetY = 0;

  const handlePointerMove = (e: PointerEvent) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  };

  if (!reducedMotion) {
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
  }

  let running = false;
  let raf = 0;
  const start = performance.now();

  function frame() {
    if (!running) return;
    const t = (performance.now() - start) / 1000;

    slabs.forEach((slab, i) => {
      const base = (i - 2) * (GAP + spread.value * 0.85);
      slab.position.y = base + Math.sin(t * 0.7 + i * 1.1) * 0.05;
      slab.rotation.y = (i - 2) * 0.07 + spread.value * (i - 2) * 0.16 + Math.sin(t * 0.3 + i) * 0.02;
    });

    group.rotation.y += (-0.5 + targetX * 0.22 - group.rotation.y) * 0.04;
    group.rotation.x += (0.32 + targetY * 0.14 - group.rotation.x) * 0.04;

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

  // Set the cleanup handler for view transitions
  activeCleanup = () => {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", handlePointerMove);
    observer.disconnect();

    if (scrollTween) {
      scrollTween.scrollTrigger?.kill();
      scrollTween.kill();
    }

    // Dispose WebGL resources to prevent GPU memory leaks
    geo.dispose();
    slabs.forEach((slab) => {
      if (Array.isArray(slab.material)) {
        slab.material.forEach((m) => m.dispose());
      } else {
        slab.material.dispose();
      }
    });
    if (scene.environment) {
      scene.environment.dispose();
    }
    pmrem.dispose();
    renderer.dispose();
  };
}
