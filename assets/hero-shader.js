(function () {
  const canvas = document.querySelector(".hero-shader-canvas");
  if (!canvas) return;

  const gl =
    canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false }) ||
    canvas.getContext("experimental-webgl");

  if (!gl) {
    canvas.style.display = "none";
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      vec2 swirlCenter = vec2(aspect * 0.72, 0.22);
      vec2 center = p - swirlCenter;
      float dist = length(center);
      float spin = 0.18 * sin(t * 0.55) + 0.62 * exp(-dist * 1.45) + t * 0.08;
      float cs = cos(spin);
      float sn = sin(spin);
      mat2 rot = mat2(cs, -sn, sn, cs);
      p = swirlCenter + rot * center;
      center = p - vec2(aspect * 0.66, 0.42);

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
      float rightField = smoothstep(0.18, 0.92, uv.x);
      float topField = smoothstep(1.0, 0.10, uv.y);

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

  function compile(type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error("Hero shader compile error:", gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  const vs = compile(gl.VERTEX_SHADER, vertSrc);
  const fs = compile(gl.FRAGMENT_SHADER, fragSrc);
  if (!vs || !fs) {
    canvas.style.display = "none";
    return;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("Hero shader link error:", gl.getProgramInfoLog(prog));
    canvas.style.display = "none";
    return;
  }
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

  // Willow palette — read from CSS custom properties so the shader stays in sync
  // with any future token changes.
  const css = getComputedStyle(document.documentElement);
  const readColor = (name, fallback) => {
    const raw = css.getPropertyValue(name).trim() || fallback;
    const hex = raw.replace("#", "");
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
  gl.uniform1f(uReduceMotion, reduceMotion ? 1.0 : 0.0);

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uResolution, canvas.width, canvas.height);
  }
  window.addEventListener("resize", resize, { passive: true });
  resize();

  const start = performance.now();
  let running = false;
  let rafId = 0;

  function frame() {
    if (!running) return;
    const now = (performance.now() - start) / 1000;
    gl.uniform1f(uTime, now);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    rafId = requestAnimationFrame(frame);
  }

  function startLoop() {
    if (running) return;
    running = true;
    rafId = requestAnimationFrame(frame);
  }

  function stopLoop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  // Draw one frame so the static look is correct even before the loop starts
  // or when reduced motion is on.
  gl.uniform1f(uTime, 0.0);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  if (reduceMotion) return;

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? startLoop() : stopLoop()));
      },
      { threshold: 0.01 }
    );
    io.observe(canvas);
  } else {
    startLoop();
  }
})();
