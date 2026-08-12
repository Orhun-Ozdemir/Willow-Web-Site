"use strict";

var canvas = null;
var gl = null;
var program = null;
var uResolution = null;
var uTime = null;
var active = false;
var timer = 0;
var startTime = 0;
var frameInterval = 1000 / 24;

var vertexSource = "attribute vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }";
var fragmentSource = [
  "precision highp float;",
  "uniform vec2 uResolution; uniform float uTime;",
  "uniform vec3 uBase, uBloomA, uBloomB, uAccent, uElectric, uViolet, uWarm;",
  "float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }",
  "float noise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); vec2 u=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y); }",
  "float fbm(vec2 p){ float v=0.0; float a=0.55; for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.0+vec2(7.13,3.71); a*=0.5; } return v; }",
  "vec3 scene(vec2 uv, float t){",
  " float aspect=uResolution.x/max(uResolution.y,1.0); vec2 p=uv*vec2(aspect,1.0);",
  " float sweep=0.5+0.5*sin(t*0.285);",
  " vec2 swirlCenter=vec2(aspect*mix(0.74,0.18,sweep),mix(0.22,0.82,sweep));",
  " vec2 center=p-swirlCenter; float dist=length(center);",
  " float spin=0.18*sin(t*0.55)+0.62*exp(-dist*1.45)+t*0.08;",
  " float cs=cos(spin); float sn=sin(spin); mat2 rot=mat2(cs,-sn,sn,cs); p=swirlCenter+rot*center;",
  " vec2 focusCenter=vec2(aspect*mix(0.68,0.24,sweep),mix(0.42,0.88,sweep)); center=p-focusCenter;",
  " float b1=fbm(p*1.28+vec2(t*0.28,-t*0.20)); float b2=fbm(p*1.86+vec2(-t*0.24,t*0.16)+4.7);",
  " float liquid=fbm(p*2.55+vec2(t*0.62,-t*0.42)+b1*1.9);",
  " float wa=smoothstep(0.42,0.95,b1); float wb=smoothstep(0.48,0.92,b2);",
  " float riverA=sin((p.x*4.15-p.y*2.9)+liquid*5.4+t*1.55);",
  " float riverB=sin((p.x*2.15+p.y*5.35)-b2*3.65-t*1.20);",
  " float riverC=sin((p.x*6.35-p.y*1.28)+b1*3.2+t*1.85);",
  " float ribbonA=smoothstep(0.48,0.98,riverA); float ribbonB=smoothstep(0.52,0.99,riverB); float ribbonC=smoothstep(0.62,0.998,riverC);",
  " float ribbon=ribbonA*0.85+ribbonB*0.58+ribbonC*0.44; float focus=smoothstep(1.22,0.08,length(center));",
  " float rightField=smoothstep(mix(0.18,-0.45,sweep),mix(0.92,0.38,sweep),uv.x);",
  " float topField=smoothstep(mix(1.0,1.6,sweep),mix(0.10,-0.3,sweep),uv.y);",
  " float trailCenterY=0.12+(uv.x-0.10)*0.58; float trailBand=1.0-smoothstep(0.03,0.26,abs(uv.y-trailCenterY));",
  " float trailFade=smoothstep(0.05,0.92,uv.x); float trailField=trailBand*mix(0.34,0.88,trailFade);",
  " float energyField=max(rightField,trailField*0.62); vec3 col=uBase;",
  " col=mix(col,uBloomA,wa*0.62); col=mix(col,uBloomB,wb*0.66);",
  " float energy=clamp((ribbon*0.85+smoothstep(0.42,0.98,b1*b2+0.2)*0.62)*energyField,0.0,1.0);",
  " float stage=clamp(focus*0.78+rightField*0.80+trailField*0.44+topField*0.24,0.0,1.0);",
  " col=mix(col,uAccent,energy*stage*0.58); col=mix(col,uElectric,ribbonA*stage*rightField*0.66);",
  " col=mix(col,uElectric,ribbonA*stage*trailField*0.22); col=mix(col,uViolet,ribbonB*stage*energyField*0.42);",
  " col=mix(col,uWarm,ribbonC*stage*max(rightField,trailField*0.45)*topField*0.36);",
  " col+=vec3(ribbon*(0.22*rightField+0.10*trailField)*stage); return col;",
  "}",
  "void main(){",
  " vec2 uv=gl_FragCoord.xy/uResolution.xy; float t=uTime;",
  " float angle=radians(31.0); vec2 dir=vec2(cos(angle),sin(angle)); vec2 perp=vec2(-dir.y,dir.x);",
  " float coord=dot(uv*11.0,dir); float flute=sin(coord*6.2831853+t*0.72); float refraction=flute*0.022;",
  " vec2 displaced=uv+perp*refraction; float ca=0.014*(0.4+abs(flute));",
  " vec3 r=scene(displaced+perp*ca,t); vec3 g=scene(displaced,t); vec3 b=scene(displaced-perp*ca,t);",
  " vec3 col=vec3(r.r,g.g,b.b); float highlight=pow(0.5+0.5*flute,16.0);",
  " float heroTrailY=0.12+(uv.x-0.10)*0.58;",
  " float heroTrail=(1.0-smoothstep(0.03,0.24,abs(uv.y-heroTrailY)))*mix(0.26,0.84,smoothstep(0.05,0.92,uv.x));",
  " float highlightField=max(smoothstep(0.24,0.82,uv.x),heroTrail*0.42); col+=vec3(highlight*0.24*highlightField);",
  " vec2 c=uv-0.5; col*=1.0-dot(c,c)*0.08; float grain=hash(gl_FragCoord.xy+t*73.0)-0.5; col+=grain*0.016;",
  " gl_FragColor=vec4(col,1.0);",
  "}"
].join("\n");

function compile(type, source) {
  var shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function color(value) {
  var hex = String(value || "#000000").replace("#", "");
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  return [parseInt(hex.slice(0,2),16)/255, parseInt(hex.slice(2,4),16)/255, parseInt(hex.slice(4,6),16)/255];
}

function setColor(name, value) {
  var rgb = color(value);
  gl.uniform3f(gl.getUniformLocation(program, name), rgb[0], rgb[1], rgb[2]);
}

function resize(width, height, dpr) {
  if (!gl || !canvas) return;
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform2f(uResolution, canvas.width, canvas.height);
  draw();
}

function draw() {
  if (!gl || !program) return;
  gl.uniform1f(uTime, Math.max(0, performance.now() - startTime) / 1000);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function loop() {
  if (!active) return;
  draw();
  timer = setTimeout(loop, frameInterval);
}

function setActive(next) {
  active = !!next;
  clearTimeout(timer);
  if (active) loop();
}

function init(message) {
  canvas = message.canvas;
  gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
  if (!gl) return;
  var vs = compile(gl.VERTEX_SHADER, vertexSource);
  var fs = compile(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vs || !fs) return;
  program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  var position = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  uResolution = gl.getUniformLocation(program, "uResolution");
  uTime = gl.getUniformLocation(program, "uTime");
  setColor("uBase", message.colors.base);
  setColor("uBloomA", message.colors.bloomA);
  setColor("uBloomB", message.colors.bloomB);
  setColor("uAccent", message.colors.accent);
  setColor("uElectric", message.colors.electric);
  setColor("uViolet", message.colors.violet);
  setColor("uWarm", message.colors.warm);
  startTime = performance.now();
  resize(message.width, message.height, message.dpr);
}

self.onmessage = function(event) {
  var message = event.data || {};
  if (message.type === "init") init(message);
  else if (message.type === "resize") resize(message.width, message.height, message.dpr);
  else if (message.type === "active") setActive(message.active);
};
