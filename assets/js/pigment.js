/* Egyptian blue pigment field for the hero.
   One fragment shader: domain-warped noise ramped from kohl through Egyptian blue to a pale glow,
   with a soft swirl that follows the pointer and a little extra drift when the page scrolls fast.
   Off for reduced motion, Save-Data, low-memory devices and when WebGL is missing; the CSS ground stays. */
(function () {
  "use strict";
  var canvas = document.querySelector("[data-pigment]");
  if (!canvas) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  var lowMem = navigator.deviceMemory && navigator.deviceMemory <= 2;
  if (saveData || lowMem) return;

  var gl = canvas.getContext("webgl", { antialias: false, alpha: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: "low-power" });
  if (!gl) return;

  var vsrc = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
  var fsrc = [
    "precision highp float;",
    "uniform vec2 R;uniform float T;uniform vec2 M;uniform float V;uniform float O;",
    "float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}",
    "float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);",
    " return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}",
    "float fbm(vec2 p){float a=.5,s=0.;mat2 r=mat2(.8,.6,-.6,.8);",
    " for(int i=0;i<5;i++){s+=a*n(p);p=r*p*2.03+vec2(3.1,1.7);a*=.5;}return s;}",
    "void main(){",
    " vec2 uv=gl_FragCoord.xy/R;",
    " vec2 p=(gl_FragCoord.xy-.5*R)/R.y;",
    " float t=T*.045+V;",
    " vec2 d=p-M;float md=exp(-dot(d,d)*4.);",
    " p+=vec2(-d.y,d.x)*md*.28;",
    " vec2 q=vec2(fbm(p*1.25+vec2(0.,t)),fbm(p*1.25+vec2(5.2,-t*1.2)+1.7));",
    " vec2 w=vec2(fbm(p*1.5+2.8*q+vec2(1.7,9.2)+t*.5),fbm(p*1.5+2.8*q+vec2(8.3,2.8)-t*.35));",
    " float f=fbm(p*1.1+2.4*w);",
    " vec3 kohl=vec3(.020,.035,.120);",
    " vec3 deep=vec3(.031,.090,.330);",
    " vec3 eg=vec3(.071,.208,.659);",
    " vec3 bright=vec3(.145,.330,.900);",
    " vec3 glow=vec3(.62,.70,1.);",
    " vec3 c=mix(kohl,deep,smoothstep(.02,.30,f));",
    " c=mix(c,eg,smoothstep(.22,.48,f));",
    " c=mix(c,bright,smoothstep(.46,.72,f+.16*length(w-q)));",
    " c=mix(c,glow,smoothstep(.70,.96,f+.10*w.x+md*.18)*.62);",
    " float g=h(gl_FragCoord.xy*.5+fract(T*.37)*91.)-.5;",
    " c+=g*.045;",
    " float vg=1.-.30*pow(length((uv-.5)*vec2(1.05,1.2)),2.4);",
    " c*=vg;",
    " c=mix(c,kohl*.6,O);",
    " gl_FragColor=vec4(c,1.);",
    "}"
  ].join("\n");

  function sh(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  var vs = sh(gl.VERTEX_SHADER, vsrc), fs = sh(gl.FRAGMENT_SHADER, fsrc);
  if (!vs || !fs) return;
  var pr = gl.createProgram();
  gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(pr, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var uR = gl.getUniformLocation(pr, "R"), uT = gl.getUniformLocation(pr, "T"), uM = gl.getUniformLocation(pr, "M"),
      uV = gl.getUniformLocation(pr, "V"), uO = gl.getUniformLocation(pr, "O");

  var coarse = window.matchMedia("(pointer: coarse)").matches;
  var scale = coarse ? 0.42 : 0.55;
  var w = 0, hgt = 0;
  function size() {
    var r = canvas.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) return false; // not laid out yet (hidden tab, collapsed frame): wait for a real size
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(2, Math.round(r.width * dpr * scale));
    hgt = Math.max(2, Math.round(r.height * dpr * scale));
    if (canvas.width !== w || canvas.height !== hgt) { canvas.width = w; canvas.height = hgt; }
    gl.viewport(0, 0, w, hgt);
    return true;
  }

  // pointer, eased; in shader space (centre origin, height = 1)
  var mx = 0.35, my = 0.1, tx = 0.35, ty = 0.1;
  window.addEventListener("pointermove", function (e) {
    var r = canvas.getBoundingClientRect();
    if (e.clientY > r.bottom) return;
    tx = (e.clientX - r.left - r.width / 2) / r.height;
    ty = -(e.clientY - r.top - r.height / 2) / r.height;
  }, { passive: true });

  // scroll speed adds drift; scroll position darkens toward kohl as the hero leaves
  var lastY = window.scrollY, drift = 0, vel = 0, fade = 0;
  window.addEventListener("scroll", function () {
    var y = window.scrollY;
    vel += Math.min(Math.abs(y - lastY), 120) * 0.0009;
    lastY = y;
  }, { passive: true });

  var visible = true, running = false, start = performance.now(), frozen = 7.5;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible && !reduce) loop();
    }).observe(canvas);
  }
  document.addEventListener("visibilitychange", function () { if (!document.hidden && visible && !reduce) loop(); });

  var shown = false;
  function draw(t) {
    if (w < 8 && !size()) return; // never draw into a canvas that was measured before layout
    if (!shown) { shown = true; requestAnimationFrame(function () { canvas.classList.add("live"); }); }
    mx += (tx - mx) * 0.045; my += (ty - my) * 0.045;
    vel *= 0.94; drift += vel * 0.016;
    var hh = canvas.getBoundingClientRect();
    fade = Math.min(1, Math.max(0, -hh.top / (hh.height || 1))) * 0.85;
    gl.uniform2f(uR, w, hgt);
    gl.uniform1f(uT, t);
    gl.uniform2f(uM, mx, my);
    gl.uniform1f(uV, drift);
    gl.uniform1f(uO, fade);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function loop() {
    if (running) return;
    running = true;
    (function f(now) {
      if (!visible || document.hidden) { running = false; return; }
      draw((now - start) / 1000 + frozen);
      requestAnimationFrame(f);
    })(performance.now());
  }

  size();
  var onSize = function () { if (size() && reduce) draw(frozen); };
  // follow the canvas's own box, so a page that loads hidden or zero-width still gets a correct buffer later
  if ("ResizeObserver" in window) { new ResizeObserver(onSize).observe(canvas); }
  else { window.addEventListener("resize", onSize, { passive: true }); }
  if (reduce) { draw(frozen); } else { loop(); }
})();
