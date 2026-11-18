/* El Hoshy Dental: the clinic site's own 3D arch, live in the portfolio.
   Two stacked meshes (archBefore: crowded, archAfter: aligned) split by a clipping plane.
   Scrolling through the case moves the split from "before" to "after"; dragging turns the arch.
   Loads three.js only when the section is near, and never on reduced motion, Save-Data,
   weak devices or without WebGL2: the still render stays in place. */
const host = document.querySelector("[data-tooth]");
const MODEL = "assets/3d/hoshy-arch.glb";
const DRACO = "assets/3d/draco/";

if (host) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const c = navigator.connection;
  const weak = (navigator.deviceMemory && navigator.deviceMemory < 4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) || (c && c.saveData);
  const gl2 = !!document.createElement("canvas").getContext("webgl2");
  if (!reduce && !weak && gl2 && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => {
      if (es[0].isIntersecting) { io.disconnect(); start().catch((e) => console.warn("3D viewer off:", e)); }
    }, { rootMargin: "700px 0px" });
    io.observe(host);
  }
}

async function start() {
  const THREE = await import("three");
  const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
  const { DRACOLoader } = await import("three/addons/loaders/DRACOLoader.js");
  const { RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js");

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.localClippingEnabled = true;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  host.insertBefore(canvas, host.firstChild);

  // the site's own light rig (SequenceView.tsx)
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.35;
  scene.add(new THREE.AmbientLight(0xffffff, 0.2));
  scene.add(new THREE.HemisphereLight(0xfbf8f3, 0xd9cfc2, 0.25));
  const d1 = new THREE.DirectionalLight(0xffffff, 1.3); d1.position.set(3, 5, 4); scene.add(d1);
  const d2 = new THREE.DirectionalLight(0xf4ead9, 0.5); d2.position.set(-4, 2, -2); scene.add(d2);
  const d3 = new THREE.DirectionalLight(0xffffff, 0.35); d3.position.set(0, 3, -4); scene.add(d3);

  const camera = new THREE.PerspectiveCamera(26, 2, 0.01, 100);

  const draco = new DRACOLoader().setDecoderPath(DRACO);
  const gltf = await new GLTFLoader().setDRACOLoader(draco).loadAsync(MODEL);
  const model = gltf.scene;
  const pivot = new THREE.Group();
  scene.add(pivot); pivot.add(model);
  const box = new THREE.Box3().setFromObject(model);
  model.position.sub(box.getCenter(new THREE.Vector3()));
  const size = box.getSize(new THREE.Vector3());

  // split: before keeps x <= s, after keeps x >= s (world space)
  const keepLeft = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);
  const keepRight = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
  const before = model.getObjectByName("archBefore"), after = model.getObjectByName("archAfter");
  function clip(obj, plane) {
    if (!obj) return;
    obj.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.clippingPlanes = [plane]; } });
  }
  clip(before, keepLeft); clip(after, keepRight);
  const half = size.x / 2 + 0.05;

  // overlay: the wipe line and its labels
  const line = host.querySelector("[data-split]");
  const vec = new THREE.Vector3();

  function frame() {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // the site frames the arch at fov 26 from (0, 1.0, 4.1) in a 2:1 box; push back on narrower boxes
    const k = Math.max(1, 2 / camera.aspect);
    camera.position.set(0, 0.95 * Math.min(k, 1.3), 3.55 * Math.pow(k, 0.62));
    camera.lookAt(0, -0.06, 0);
    camera.updateProjectionMatrix();
  }

  // drag to turn, within the site's gentle limits
  let yaw = 0, pitch = 0, tYaw = 0, tPitch = 0, dragging = false, lx = 0, ly = 0;
  canvas.addEventListener("pointerdown", (e) => { dragging = true; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); host.classList.add("dragging"); });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    tYaw = Math.max(-0.55, Math.min(0.55, tYaw + (e.clientX - lx) * 0.005));
    tPitch = Math.max(-0.18, Math.min(0.3, tPitch + (e.clientY - ly) * 0.003));
    lx = e.clientX; ly = e.clientY;
  });
  const end = () => { dragging = false; host.classList.remove("dragging"); };
  canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", end);

  // scroll through the case drives the split from before (0) to after (1)
  let split = 0, tSplit = 0;
  function readScroll() {
    const r = host.getBoundingClientRect(), vh = window.innerHeight;
    const p = (vh * 0.85 - r.top) / (vh * 0.85 + r.height * 0.15);
    tSplit = Math.max(0, Math.min(1, p));
  }

  let visible = true;
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { rootMargin: "120px 0px" }).observe(host);

  const clock = new THREE.Clock();
  function loop() {
    requestAnimationFrame(loop);
    if (!visible || document.hidden) return;
    readScroll();
    const t = clock.getElapsedTime();
    split += (tSplit - split) * 0.08;
    if (!dragging) { tYaw *= 0.985; }
    yaw += (tYaw + Math.sin(t * 0.4) * 0.12 - yaw) * 0.06;
    pitch += (tPitch + 0.06 - pitch) * 0.06;
    pivot.rotation.set(pitch, yaw, 0);
    const x = half - split * half * 2;
    keepLeft.constant = x; keepRight.constant = -x;
    renderer.render(scene, camera);
    if (line) {
      vec.set(x, 0, 0).project(camera);
      const px = (vec.x * 0.5 + 0.5) * host.clientWidth;
      line.style.transform = "translateX(" + px.toFixed(1) + "px)";
      host.style.setProperty("--split", split.toFixed(3));
    }
  }

  frame();
  if ("ResizeObserver" in window) new ResizeObserver(frame).observe(host);
  else window.addEventListener("resize", frame, { passive: true });
  host.classList.add("live");
  loop();
}
