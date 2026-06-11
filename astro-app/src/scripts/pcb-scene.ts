/**
 * Three.js hero — a stylized WillowSoft PCB that assembles itself.
 * Navy board, black ICs, gold pads, silver connector; cyan signal pulses
 * travel the copper traces once assembly lands. Mouse tilts the board,
 * scroll lifts the components into an exploded view.
 * "From bare metal to dashboard" — this is the bare metal.
 * Mounts on `.pcb-canvas` (homepage hero).
 */
import {
  BoxGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SphereGeometry,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const NAVY_BOARD = "#101e4e";
const CHIP_BLACK = "#0d0f14";
const GOLD = "#e8b54a";
const SILVER = "#c9ccd4";
const CYAN = "#1aa3c4";

/* Manhattan-routed copper traces: [x, z] waypoints on the board surface */
const TRACES: [number, number][][] = [
  [[0.6, 0.15], [1.5, 0.15], [1.5, 1.2], [1.55, 1.2]],
  [[-0.6, -0.2], [-1.3, -0.2], [-1.3, -1.2], [-1.5, -1.2]],
  [[0.6, -0.25], [2.0, -0.25], [2.0, 0.0], [2.3, 0.0]],
  [[-0.6, 0.3], [-1.6, 0.3], [-1.6, 1.3], [-2.0, 1.3]],
  [[0.2, 0.6], [0.2, 1.5], [0.9, 1.5]],
  [[-0.2, -0.6], [-0.2, -1.3], [0.75, -1.3]],
];

function softShadowTexture(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 6, 64, 64, 64);
  grad.addColorStop(0, "rgba(16,18,22,0.34)");
  grad.addColorStop(1, "rgba(16,18,22,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new CanvasTexture(c);
}

export function initPcbScene(): void {
  const canvas = document.querySelector<HTMLCanvasElement>(".pcb-canvas");
  if (!canvas) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.05).texture;

  const camera = new PerspectiveCamera(34, 1, 0.1, 60);
  camera.position.set(4.6, 4.4, 6.2);
  camera.lookAt(0, 0, 0);

  const root = new Group();
  scene.add(root);

  /* --- Contact shadow ------------------------------------------------ */
  const shadow = new Mesh(
    new PlaneGeometry(9, 7),
    new MeshBasicMaterial({ map: softShadowTexture(), transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.55;
  root.add(shadow);

  /* --- Board ---------------------------------------------------------- */
  const board = new Mesh(
    new BoxGeometry(6, 0.14, 4),
    new MeshPhysicalMaterial({
      color: new Color(NAVY_BOARD),
      roughness: 0.42,
      metalness: 0.1,
      clearcoat: 0.8,
      clearcoatRoughness: 0.3,
      transparent: true,
      opacity: 0,
    })
  );
  root.add(board);

  /* --- Copper traces ---------------------------------------------------- */
  const traceMat = new MeshStandardMaterial({
    color: new Color(CYAN),
    emissive: new Color(CYAN),
    emissiveIntensity: 0.32,
    roughness: 0.4,
    metalness: 0.6,
    transparent: true,
    opacity: 0,
  });
  const TRACE_Y = 0.078;
  TRACES.forEach((path) => {
    for (let i = 0; i < path.length - 1; i++) {
      const [x1, z1] = path[i];
      const [x2, z2] = path[i + 1];
      const len = Math.hypot(x2 - x1, z2 - z1) + 0.05;
      const seg = new Mesh(
        new BoxGeometry(Math.abs(x2 - x1) > 0.001 ? len : 0.05, 0.014, Math.abs(z2 - z1) > 0.001 ? len : 0.05),
        traceMat
      );
      seg.position.set((x1 + x2) / 2, TRACE_Y, (z1 + z2) / 2);
      root.add(seg);
    }
  });

  /* --- Components --------------------------------------------------------- */
  type Comp = { mesh: Mesh | Group; finalY: number };
  const comps: Comp[] = [];

  const chipMat = new MeshPhysicalMaterial({ color: new Color(CHIP_BLACK), roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.25 });
  const goldMat = new MeshStandardMaterial({ color: new Color(GOLD), metalness: 1, roughness: 0.32 });
  const silverMat = new MeshStandardMaterial({ color: new Color(SILVER), metalness: 1, roughness: 0.28 });

  function addComp(mesh: Mesh | Group, x: number, y: number, z: number) {
    mesh.position.set(x, y, z);
    root.add(mesh);
    comps.push({ mesh, finalY: y });
  }

  /* MCU with gold pins */
  const mcu = new Group();
  const mcuBody = new Mesh(new BoxGeometry(1.1, 0.16, 1.1), chipMat);
  mcu.add(mcuBody);
  const pinGeo = new BoxGeometry(0.05, 0.05, 0.14);
  for (let i = 0; i < 7; i++) {
    const off = -0.42 + i * 0.14;
    const pinN = new Mesh(pinGeo, goldMat);
    pinN.position.set(off, -0.045, -0.6);
    const pinS = new Mesh(pinGeo, goldMat);
    pinS.position.set(off, -0.045, 0.6);
    const pinE = new Mesh(pinGeo, goldMat);
    pinE.rotation.y = Math.PI / 2;
    pinE.position.set(0.6, -0.045, off);
    const pinW = new Mesh(pinGeo, goldMat);
    pinW.rotation.y = Math.PI / 2;
    pinW.position.set(-0.6, -0.045, off);
    mcu.add(pinN, pinS, pinE, pinW);
  }
  addComp(mcu, 0, 0.16, 0);

  /* Secondary ICs */
  addComp(new Mesh(new BoxGeometry(0.62, 0.12, 0.5), chipMat), 1.8, 0.14, 1.2);
  addComp(new Mesh(new BoxGeometry(0.72, 0.12, 0.72), chipMat), -1.8, 0.14, -1.2);

  /* Antenna can (gold) + connector (silver) */
  addComp(new Mesh(new CylinderGeometry(0.2, 0.2, 0.42, 24), goldMat), -2.3, 0.28, 1.3);
  addComp(new Mesh(new BoxGeometry(0.55, 0.34, 0.85), silverMat), 2.55, 0.24, 0);

  /* Capacitors */
  const capGeo = new CylinderGeometry(0.09, 0.09, 0.24, 16);
  [[0.9, -1.3], [-0.6, 1.4], [1.2, 1.5], [-1.0, -0.4]].forEach(([x, z], i) => {
    addComp(new Mesh(capGeo, i % 2 ? silverMat : goldMat), x, 0.19, z);
  });

  /* Edge pads */
  const padGeo = new CylinderGeometry(0.06, 0.06, 0.02, 12);
  [[-2.7, -1.7], [-2.7, 1.7], [2.7, -1.7], [2.7, 1.7], [0, -1.8], [-1.4, 1.8]].forEach(([x, z]) => {
    addComp(new Mesh(padGeo, goldMat), x, 0.085, z);
  });

  /* --- Signal pulses --------------------------------------------------------- */
  const pulseMat = new MeshBasicMaterial({ color: new Color(CYAN), transparent: true, opacity: 0 });
  const pulseGeo = new SphereGeometry(0.05, 12, 12);
  const pulses = TRACES.slice(0, 5).map((path, i) => ({
    mesh: new Mesh(pulseGeo, pulseMat),
    path,
    t: (i * 0.37) % 1,
    speed: 0.0035 + (i % 3) * 0.0014,
  }));
  pulses.forEach((p) => root.add(p.mesh));

  function pulsePos(path: [number, number][], t: number): [number, number] {
    const lens: number[] = [];
    let total = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const l = Math.hypot(path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1]);
      lens.push(l);
      total += l;
    }
    let d = t * total;
    for (let i = 0; i < lens.length; i++) {
      if (d <= lens[i]) {
        const r = d / lens[i];
        return [path[i][0] + (path[i + 1][0] - path[i][0]) * r, path[i][1] + (path[i + 1][1] - path[i][1]) * r];
      }
      d -= lens[i];
    }
    return path[path.length - 1];
  }

  /* --- Sizing ------------------------------------------------------------------- */
  function resize() {
    const rect = canvas!.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  /* --- Assembly choreography ------------------------------------------------------ */
  const exploded = { value: 0 }; // scroll-driven lift
  let assembled = reducedMotion;

  if (reducedMotion) {
    (board.material as MeshPhysicalMaterial).opacity = 1;
    traceMat.opacity = 0.9;
    pulseMat.opacity = 0.9;
    renderer.render(scene, camera);
  } else {
    // Components hover scattered above, then settle in
    comps.forEach(({ mesh, finalY }, i) => {
      mesh.position.y = finalY + 2.4 + (i % 5) * 0.5;
      mesh.rotation.y = (i % 2 ? 1 : -1) * 0.7;
      (Array.isArray((mesh as Mesh).material) ? null : null);
    });

    const introOnScreen = !!document.querySelector(".intro-curtain");
    const tl = gsap.timeline({ delay: introOnScreen ? 1.7 : 0.35, onComplete: () => (assembled = true) });

    tl.to(board.material, { opacity: 1, duration: 0.55, ease: "power2.out" }, 0)
      .from(board.position, { y: -1.1, duration: 0.7, ease: "power3.out" }, 0)
      .add("drop", 0.45);

    comps.forEach(({ mesh, finalY }, i) => {
      tl.to(mesh.position, { y: finalY, duration: 0.75, ease: "power3.inOut" }, `drop+=${i * 0.055}`);
      tl.to(mesh.rotation, { y: 0, duration: 0.75, ease: "power3.inOut" }, `drop+=${i * 0.055}`);
    });

    tl.to(traceMat, { opacity: 0.92, duration: 0.5, ease: "power2.out" }, "-=0.3")
      .to(pulseMat, { opacity: 0.95, duration: 0.4 }, "-=0.1");

    // Scroll: exploded view as the hero leaves
    const hero = canvas.closest(".hero");
    if (hero) {
      gsap.to(exploded, {
        value: 1,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom 25%", scrub: 1 },
      });
    }
  }

  /* --- Mouse tilt --------------------------------------------------------------------- */
  let targetX = 0;
  let targetY = 0;
  if (!reducedMotion) {
    window.addEventListener(
      "pointermove",
      (e) => {
        targetX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetY = (e.clientY / window.innerHeight - 0.5) * 2;
      },
      { passive: true }
    );
  }

  /* --- Render loop ----------------------------------------------------------------------- */
  let running = false;
  let raf = 0;
  const start = performance.now();

  function frame() {
    if (!running) return;
    const t = (performance.now() - start) / 1000;

    // Idle drift + mouse tilt
    root.rotation.y += (targetX * 0.16 + Math.sin(t * 0.16) * 0.06 - root.rotation.y) * 0.04;
    root.rotation.x += (targetY * 0.08 - root.rotation.x) * 0.04;
    root.position.y = Math.sin(t * 0.55) * 0.05;

    // Exploded view lift (per-component, staggered heights)
    if (assembled) {
      comps.forEach(({ mesh, finalY }, i) => {
        mesh.position.y = finalY + exploded.value * (0.45 + (i % 4) * 0.22);
      });
    }

    // Signal pulses along traces
    pulses.forEach((p) => {
      p.t += p.speed;
      if (p.t > 1) p.t = 0;
      const [x, z] = pulsePos(p.path, p.t);
      p.mesh.position.set(x, 0.12 + exploded.value * 0.1, z);
    });

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  if (reducedMotion) return;

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
}
