"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    let activeCanvasCleanups: (() => void)[] = [];
    let observers: IntersectionObserver[] = [];

    // Run after a brief frame delay to let Next.js mount the DOM elements
    const timer = setTimeout(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // 1. REVEAL ANIMATIONS
      const allRevealSel = ".reveal, .reveal-left, .reveal-right, .reveal-scale";
      const revealItems = document.querySelectorAll(allRevealSel);
      if (revealItems.length > 0) {
        if (reducedMotion) {
          revealItems.forEach((item) => item.classList.add("visible"));
        } else {
          const revealObserver = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  entry.target.classList.add("visible");
                  revealObserver.unobserve(entry.target);
                }
              });
            },
            { threshold: 0.01, rootMargin: "120px 0px 120px 0px" }
          );
          observers.push(revealObserver);
          revealItems.forEach((item) => revealObserver.observe(item));

          // Pre-trigger visible on screen
          const vh = window.innerHeight;
          revealItems.forEach((item) => {
            const rect = item.getBoundingClientRect();
            if (rect.top < vh && rect.bottom > 0) {
              item.classList.add("visible");
              revealObserver.unobserve(item);
            }
          });
        }
      }

      // 2. COUNTERS ANIMATIONS
      const counters = document.querySelectorAll("[data-count], [data-company-fact]");
      if (counters.length > 0) {
        const animateCounter = (el: HTMLElement) => {
          let target = 0;
          let suffix = "";
          
          if (el.dataset.count) {
            target = Number(el.dataset.count || 0);
            suffix = el.dataset.suffix || "";
          } else {
            const text = el.textContent?.trim() || "";
            const match = text.match(/^([\d.,]+)\s*(.*)$/);
            if (!match) return;
            target = parseFloat(match[1].replace(/,/g, ""));
            suffix = match[2];
          }

          const duration = reducedMotion ? 1 : 1200;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(target * eased);
            el.textContent = current.toLocaleString() + suffix;
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        };

        const counterObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                animateCounter(entry.target as HTMLElement);
                counterObserver.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.1 }
        );
        observers.push(counterObserver);
        counters.forEach((counter) => counterObserver.observe(counter));
      }

      // 3. SIGNAL CANVAS DYNAMICS
      if (!reducedMotion) {
        const canvases = document.querySelectorAll(".signal-canvas");
        canvases.forEach((canvasEl) => {
          const canvas = canvasEl as HTMLCanvasElement;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          let width = 0, height = 0, points: any[] = [], pulses: any[] = [];
          let raf = 0, running = false;
          const density = Number(canvas.dataset.density || 36);
          const color = canvas.dataset.color || "35, 168, 216";
          const DIST_MAX = 150, DIST_MAX_SQ = DIST_MAX * DIST_MAX;

          function resize() {
            const rect = canvas.getBoundingClientRect();
            const scale = Math.min(window.devicePixelRatio || 1, 2);
            width = Math.max(1, Math.floor(rect.width));
            height = Math.max(1, Math.floor(rect.height));
            canvas.width = Math.floor(width * scale);
            canvas.height = Math.floor(height * scale);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx?.setTransform(scale, 0, 0, scale, 0, 0);
            build();
          }

          function build() {
            points = [];
            pulses = [];
            for (let i = 0; i < density; i++) {
              points.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.18,
                vy: (Math.random() - 0.5) * 0.18,
              });
            }
            for (let i = 0; i < Math.max(7, density / 5); i++) {
              pulses.push({
                from: Math.floor(Math.random() * points.length),
                to: Math.floor(Math.random() * points.length),
                t: Math.random(),
                speed: 0.003 + Math.random() * 0.006,
              });
            }
          }

          function draw() {
            if (!running || !ctx) return;
            ctx.clearRect(0, 0, width, height);

            // Update positions
            for (let i = 0; i < points.length; i++) {
              const p = points[i];
              p.x += p.vx; p.y += p.vy;
              if (p.x < 0 || p.x > width) p.vx *= -1;
              if (p.y < 0 || p.y > height) p.vy *= -1;
            }

            ctx.beginPath();
            ctx.strokeStyle = `rgba(${color}, 0.15)`;
            ctx.lineWidth = 1;
            for (let i = 0; i < points.length; i++) {
              for (let j = i + 1; j < points.length; j++) {
                const dx = points[i].x - points[j].x;
                const dy = points[i].y - points[j].y;
                if (dx * dx + dy * dy < DIST_MAX_SQ) {
                  ctx.moveTo(points[i].x, points[i].y);
                  ctx.lineTo(points[j].x, points[j].y);
                }
              }
            }
            ctx.stroke();

            ctx.beginPath();
            ctx.fillStyle = `rgba(${color}, 0.55)`;
            for (let i = 0; i < points.length; i++) {
              ctx.moveTo(points[i].x + 2, points[i].y);
              ctx.arc(points[i].x, points[i].y, 2, 0, Math.PI * 2);
            }
            ctx.fill();

            ctx.fillStyle = "rgba(255,255,255,0.82)";
            for (let k = 0; k < pulses.length; k++) {
              const pulse = pulses[k];
              const a = points[pulse.from], b = points[pulse.to];
              if (!a || !b || pulse.from === pulse.to) continue;
              pulse.t += pulse.speed;
              if (pulse.t > 1) {
                pulse.from = Math.floor(Math.random() * points.length);
                pulse.to = Math.floor(Math.random() * points.length);
                pulse.t = 0;
              }
              ctx.beginPath();
              ctx.arc(a.x + (b.x - a.x) * pulse.t, a.y + (b.y - a.y) * pulse.t, 3, 0, Math.PI * 2);
              ctx.fill();
            }

            raf = requestAnimationFrame(draw);
          }

          resize();
          window.addEventListener("resize", resize, { passive: true });

          const canvasObserver = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                if (!running) { running = true; draw(); }
              } else {
                running = false;
                cancelAnimationFrame(raf);
              }
            });
          }, { threshold: 0.01 });
          canvasObserver.observe(canvas);
          observers.push(canvasObserver);

          activeCanvasCleanups.push(() => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(raf);
          });
        });
      }

      // 4. PROCESS STEPS ACTIVE DYNAMICS
      const steps = document.querySelectorAll(".process-step");
      if (steps.length > 0) {
        const processObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) entry.target.classList.add("active");
            });
          },
          { threshold: 0.35 }
        );
        observers.push(processObserver);
        steps.forEach((step) => processObserver.observe(step));
      }

      // 5. DYNAMIC DATA-PAGE ATTRIBUTE
      const parts = pathname.split("/").filter(Boolean);
      let pageKey = "home";
      if (parts.length > 0) {
        const first = parts[0];
        const hasLocale = ["en", "tr", "de", "fr", "es", "it", "ar", "ja"].includes(first);
        const route = hasLocale ? parts[1] : first;
        
        if (!route) {
          pageKey = "home";
        } else if (route === "admin") {
          pageKey = "admin";
        } else if (route === "products" && parts[hasLocale ? 2 : 1]) {
          const slug = parts[hasLocale ? 2 : 1];
          if (slug.includes("air")) pageKey = "product-air";
          else if (slug.includes("mod")) pageKey = "product-mod";
          else pageKey = "product-bee";
        } else if (route === "news" && parts[hasLocale ? 2 : 1]) {
          pageKey = "news-detail";
        } else {
          pageKey = route;
        }
      }
      document.body.setAttribute("data-page", pageKey);

      // 6. WebGL HERO SHADER
      const shaderCanvas = document.querySelector(".hero-shader-canvas") as HTMLCanvasElement;
      if (shaderCanvas) {
        const gl =
          shaderCanvas.getContext("webgl", { antialias: false, premultipliedAlpha: false }) ||
          (shaderCanvas.getContext("experimental-webgl") as WebGLRenderingContext);

        if (gl) {
          const vertSrc = `
            attribute vec2 aPos;
            void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
          `;

          const fragSrc = `
            precision highp float;
            uniform vec2 uResolution;
            uniform float uTime;
            uniform float uReduceMotion;
            uniform vec3 uBase;
            uniform vec3 uBloomA;
            uniform vec3 uBloomB;
            uniform vec3 uAccent;
            uniform vec3 uElectric;
            uniform vec3 uViolet;
            uniform vec3 uWarm;

            float hash(vec2 p) {
              p = fract(p * vec2(123.34, 456.21));
              p += dot(p, p + 45.32);
              return fract(p.x * p.y);
            }

            float noise(vec2 p) {
              vec2 i = floor(p);
              vec2 f = fract(p);
              vec2 u = f * f * (3.0 - 2.0 * f);
              return mix(
                mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
                u.y
              );
            }

            float fbm(vec2 p) {
              float v = 0.0;
              float a = 0.55;
              for (int i = 0; i < 5; i++) {
                v += a * noise(p);
                p = p * 2.0 + vec2(7.13, 3.71);
                a *= 0.5;
              }
              return v;
            }

            vec3 scene(vec2 uv, float t) {
              float aspect = uResolution.x / max(uResolution.y, 1.0);
              vec2 p = uv * vec2(aspect, 1.0);
              float sweep = 0.5 + 0.5 * sin(t * 0.285);
              vec2 swirlCenter = vec2(aspect * mix(0.74, 0.18, sweep), mix(0.22, 0.82, sweep));
              vec2 center = p - swirlCenter;
              float dist = length(center);
              float spin = 0.18 * sin(t * 0.55) + 0.62 * exp(-dist * 1.45) + t * 0.08;
              float cs = cos(spin);
              float sn = sin(spin);
              mat2 rot = mat2(cs, -sn, sn, cs);
              p = swirlCenter + rot * center;
              
              vec2 focusCenter = vec2(aspect * mix(0.68, 0.24, sweep), mix(0.42, 0.88, sweep));
              center = p - focusCenter;

              float b1 = fbm(p * 1.28 + vec2(t * 0.28, -t * 0.20));
              float b2 = fbm(p * 1.86 + vec2(-t * 0.24, t * 0.16) + 4.7);
              float liquid = fbm(p * 2.55 + vec2(t * 0.62, -t * 0.42) + b1 * 1.9);

              float wa = smoothstep(0.42, 0.95, b1);
              float wb = smoothstep(0.48, 0.92, b2);
              float riverA = sin((p.x * 4.15 - p.y * 2.9) + liquid * 5.4 + t * 1.55);
              float riverB = sin((p.x * 2.15 + p.y * 5.35) - b2 * 3.65 - t * 1.20);
              float riverC = sin((p.x * 6.35 - p.y * 1.28) + b1 * 3.2 + t * 1.85);
              float ribbonA = smoothstep(0.48, 0.98, riverA);
              float ribbonB = smoothstep(0.52, 0.99, riverB);
              float ribbonC = smoothstep(0.62, 0.998, riverC);
              float ribbon = ribbonA * 0.85 + ribbonB * 0.58 + ribbonC * 0.44;
              float focus = smoothstep(1.22, 0.08, length(center));
              
              float rightField = smoothstep(mix(0.18, -0.45, sweep), mix(0.92, 0.38, sweep), uv.x);
              float topField = smoothstep(mix(1.0, 1.6, sweep), mix(0.10, -0.3, sweep), uv.y);

              vec3 col = uBase;
              col = mix(col, uBloomA, wa * 0.62);
              col = mix(col, uBloomB, wb * 0.66);
              float energy = clamp((ribbon * 0.85 + smoothstep(0.42, 0.98, b1 * b2 + 0.2) * 0.62) * rightField, 0.0, 1.0);
              float stage = clamp(focus * 0.88 + rightField * 0.86 + topField * 0.34, 0.0, 1.0);
              col = mix(col, uAccent, energy * stage * 0.58);
              col = mix(col, uElectric, ribbonA * stage * rightField * 0.66);
              col = mix(col, uViolet, ribbonB * stage * rightField * 0.42);
              col = mix(col, uWarm, ribbonC * stage * rightField * topField * 0.36);
              col += vec3(ribbon * 0.22 * stage);
              return col;
            }

            void main() {
              vec2 uv = gl_FragCoord.xy / uResolution.xy;
              float t = uTime * mix(1.0, 0.0, uReduceMotion);
              float angle = radians(31.0);
              vec2 dir = vec2(cos(angle), sin(angle));
              vec2 perp = vec2(-dir.y, dir.x);
              float coord = dot(uv * 11.0, dir);
              float flute = sin(coord * 6.2831853 + t * 0.72);
              float refraction = flute * 0.022;
              vec2 displaced = uv + perp * refraction;
              float ca = 0.014 * (0.4 + abs(flute));
              vec3 r = scene(displaced + perp * ca, t);
              vec3 g = scene(displaced, t);
              vec3 b = scene(displaced - perp * ca, t);
              vec3 col = vec3(r.r, g.g, b.b);
              float highlight = pow(0.5 + 0.5 * flute, 16.0);
              col += vec3(highlight * 0.24);
              vec2 c = uv - 0.5;
              col *= 1.0 - dot(c, c) * 0.08;
              float grain = hash(gl_FragCoord.xy + t * 73.0) - 0.5;
              col += grain * 0.016;
              gl_FragColor = vec4(col, 1.0);
            }
          `;

          const compile = (type: number, src: string) => {
            const sh = gl.createShader(type);
            if (!sh) return null;
            gl.shaderSource(sh, src);
            gl.compileShader(sh);
            if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
              console.error("Hero shader compile error:", gl.getShaderInfoLog(sh));
              gl.deleteShader(sh);
              return null;
            }
            return sh;
          };

          const vs = compile(gl.VERTEX_SHADER, vertSrc);
          const fs = compile(gl.FRAGMENT_SHADER, fragSrc);
          if (vs && fs) {
            const prog = gl.createProgram();
            if (prog) {
              gl.attachShader(prog, vs);
              gl.attachShader(prog, fs);
              gl.linkProgram(prog);
              if (gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                gl.useProgram(prog);

                const buf = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buf);
                gl.bufferData(
                  gl.ARRAY_BUFFER,
                  new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
                  gl.STATIC_DRAW
                );
                const aPos = gl.getAttribLocation(prog, "aPos");
                gl.enableVertexAttribArray(aPos);
                gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

                const uResolution = gl.getUniformLocation(prog, "uResolution");
                const uTime = gl.getUniformLocation(prog, "uTime");
                const uReduceMotion = gl.getUniformLocation(prog, "uReduceMotion");
                const uBase = gl.getUniformLocation(prog, "uBase");
                const uBloomA = gl.getUniformLocation(prog, "uBloomA");
                const uBloomB = gl.getUniformLocation(prog, "uBloomB");
                const uAccent = gl.getUniformLocation(prog, "uAccent");
                const uElectric = gl.getUniformLocation(prog, "uElectric");
                const uViolet = gl.getUniformLocation(prog, "uViolet");
                const uWarm = gl.getUniformLocation(prog, "uWarm");

                const css = getComputedStyle(document.documentElement);
                const readColor = (name: string, fallback: string) => {
                  const raw = css.getPropertyValue(name).trim() || fallback;
                  let hex = raw.replace("#", "");
                  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
                  const r = parseInt(hex.substring(0, 2), 16) / 255;
                  const g = parseInt(hex.substring(2, 4), 16) / 255;
                  const b = parseInt(hex.substring(4, 6), 16) / 255;
                  return [r, g, b];
                };

                const base = readColor("--shader-base", "#faf8ff");
                const bloomA = readColor("--shader-bloom-a", "#dfe0ff");
                const bloomB = readColor("--shader-bloom-b", "#bbc3ff");
                const accent = readColor("--shader-accent", "#2d3a8c");
                const electric = readColor("--shader-electric", "#18a7ff");
                const violet = readColor("--shader-violet", "#704dff");
                const warm = readColor("--shader-warm", "#ff6b3d");

                gl.uniform3f(uBase, base[0], base[1], base[2]);
                gl.uniform3f(uBloomA, bloomA[0], bloomA[1], bloomA[2]);
                gl.uniform3f(uBloomB, bloomB[0], bloomB[1], bloomB[2]);
                gl.uniform3f(uAccent, accent[0], accent[1], accent[2]);
                gl.uniform3f(uElectric, electric[0], electric[1], electric[2]);
                gl.uniform3f(uViolet, violet[0], violet[1], violet[2]);
                gl.uniform3f(uWarm, warm[0], warm[1], warm[2]);
                gl.uniform1f(uReduceMotion, reducedMotion ? 1.0 : 0.0);

                let localRunning = false;
                let localRafId = 0;
                const start = performance.now();

                const resize = () => {
                  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
                  const w = shaderCanvas.clientWidth;
                  const h = shaderCanvas.clientHeight;
                  if (w === 0 || h === 0) return;
                  shaderCanvas.width = Math.floor(w * dpr);
                  shaderCanvas.height = Math.floor(h * dpr);
                  gl.viewport(0, 0, shaderCanvas.width, shaderCanvas.height);
                  gl.uniform2f(uResolution, shaderCanvas.width, shaderCanvas.height);
                };

                window.addEventListener("resize", resize, { passive: true });
                resize();

                const frame = () => {
                  if (!localRunning) return;
                  const now = (performance.now() - start) / 1000;
                  gl.uniform1f(uTime, now);
                  gl.drawArrays(gl.TRIANGLES, 0, 6);
                  localRafId = requestAnimationFrame(frame);
                };

                const startLoop = () => {
                  if (localRunning) return;
                  localRunning = true;
                  localRafId = requestAnimationFrame(frame);
                };

                const stopLoop = () => {
                  localRunning = false;
                  if (localRafId) cancelAnimationFrame(localRafId);
                  localRafId = 0;
                };

                // Single draw frame
                gl.uniform1f(uTime, 0.0);
                gl.drawArrays(gl.TRIANGLES, 0, 6);

                if (!reducedMotion) {
                  if ("IntersectionObserver" in window) {
                    const shaderObserver = new IntersectionObserver(
                      (entries) => {
                        entries.forEach((e) => (e.isIntersecting ? startLoop() : stopLoop()));
                      },
                      { threshold: 0.01 }
                    );
                    shaderObserver.observe(shaderCanvas);
                    activeCanvasCleanups.push(() => {
                      shaderObserver.disconnect();
                    });
                  } else {
                    startLoop();
                  }
                }

                activeCanvasCleanups.push(() => {
                  window.removeEventListener("resize", resize);
                  stopLoop();
                });
              }
            }
          }
        }
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      observers.forEach((obs) => obs.disconnect());
      activeCanvasCleanups.forEach((cleanup) => cleanup());
    };
  }, [pathname]);

  return null;
}

