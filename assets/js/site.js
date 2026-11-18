/* Hady Ashraf · portfolio interactions.
   The page is complete without this file. With it: smooth scroll, the hero entrance, the credits roll,
   stacked case sheets, the JobPilot demo, the AI reel and small hover details.
   Everything that moves is skipped when the visitor prefers reduced motion. */
(function () {
  "use strict";
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  /* ---------- Cairo clock ---------- */
  var clocks = $$("[data-clock]");
  try {
    var fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Cairo" });
    var tick = function () { var t = fmt.format(new Date()); clocks.forEach(function (c) { c.textContent = t; }); };
    tick(); setInterval(tick, 20000);
  } catch (e) { clocks.forEach(function (c) { c.textContent = "GMT+2"; }); }

  /* ---------- copy email ---------- */
  $$("[data-copy]").forEach(function (btn) {
    var note = $("[data-copy-note]", btn);
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function (msg) {
        if (!note) return;
        note.textContent = msg;
        clearTimeout(btn._t); btn._t = setTimeout(function () { note.textContent = ""; }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done("Copied"); }, function () { window.location.href = "mailto:" + text; });
      } else { window.location.href = "mailto:" + text; }
    });
  });

  /* ---------- mobile menu ---------- */
  var menu = $("#menu"), menuBtn = $("[data-menu]");
  function setMenu(open) {
    if (!menu) return;
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.textContent = open ? "Close" : "Menu";
    if (open) { menu.hidden = false; requestAnimationFrame(function () { menu.classList.add("open"); }); }
    else { menu.classList.remove("open"); setTimeout(function () { if (!menu.classList.contains("open")) menu.hidden = true; }, 420); }
    if (window.__lenis) { open ? window.__lenis.stop() : window.__lenis.start(); }
  }
  if (menuBtn) {
    menuBtn.addEventListener("click", function () { setMenu(menuBtn.getAttribute("aria-expanded") !== "true"); });
    $$("[data-close]", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    d.addEventListener("keydown", function (e) { if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") { setMenu(false); menuBtn.focus(); } });
  }

  /* ---------- nav state + section label ---------- */
  var nav = $("#nav");
  var onScrollNav = function () { nav.classList.toggle("scrolled", window.scrollY > 40); };
  window.addEventListener("scroll", onScrollNav, { passive: true }); onScrollNav();

  var navLinks = $$(".nav-links a");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var id = el.id;
        var group = { hoshy: "work", jobpilot: "work", oria: "work", sandra: "work", escape: "work", reel: "growth" }[id] || id;
        navLinks.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + group); });
      });
    }, { rootMargin: "-48% 0px -48% 0px" });
    $$("[data-show]").forEach(function (s) { io.observe(s); });
  }

  /* ---------- Sandra: a still voice wave ---------- */
  var wave = $("[data-wave]");
  if (wave) {
    var html = "", seed = 7;
    for (var i = 0; i < 56; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      var r = seed / 233280, env = Math.sin((i / 55) * Math.PI);
      html += '<i style="--h:' + Math.round(14 + env * 70 * (0.35 + r * 0.65)) + '"></i>';
    }
    wave.innerHTML = html;
  }

  /* ---------- JobPilot demo ---------- */
  var app = $("[data-app]");
  var demo = (function () {
    if (!app) return null;
    var steps = $$("[data-step]", app), rail = $$("[data-rail] li", app);
    var ring = $("[data-score-ring]", app), score = $("[data-score]", app);
    var C = 2 * Math.PI * 28, target = +(score.getAttribute("data-target") || 87), timers = [];
    function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
    function stage(n) { rail.forEach(function (li, k) { li.classList.toggle("on", k === n); }); }
    function show(n) { steps.forEach(function (s) { if (+s.getAttribute("data-step") === n) s.classList.add("in"); }); }
    function finalState() {
      app.classList.remove("run");
      ring.style.strokeDashoffset = (C * (1 - target / 100)).toFixed(1);
      score.textContent = target; stage(5);
    }
    function play() {
      timers.forEach(clearTimeout); timers = [];
      if (reduce) { finalState(); return; }
      app.classList.add("run");
      steps.forEach(function (s) { s.classList.remove("in"); });
      ring.style.transition = "none"; ring.style.strokeDashoffset = C.toFixed(1); score.textContent = "0";
      stage(0);
      at(150, function () { show(0); });
      at(1000, function () { stage(1); show(1); });
      at(1700, function () {
        stage(2);
        ring.style.transition = "stroke-dashoffset 1.6s cubic-bezier(.16,1,.3,1)";
        ring.style.strokeDashoffset = (C * (1 - target / 100)).toFixed(1);
        var t0 = performance.now();
        (function count(now) {
          var k = Math.min(1, (now - t0) / 1500), e = 1 - Math.pow(1 - k, 4);
          score.textContent = Math.round(target * e);
          if (k < 1) requestAnimationFrame(count);
        })(t0);
        $$("[data-reasons] li", app).forEach(function (li, k) { at(k * 200, function () { li.classList.add("in"); }); });
        at(1400, function () { show(2); });
      });
      at(4100, function () { stage(3); show(3); });
      at(5200, function () { stage(4); show(4); });
      at(6500, function () { stage(5); show(5); });
    }
    // reasons animate one by one: give them their own step class handling
    $$("[data-reasons] li", app).forEach(function (li) { li.removeAttribute("data-step"); li.setAttribute("data-step", "r"); });
    steps = $$("[data-step]", app);
    var replay = $("[data-replay]", app);
    if (replay) replay.addEventListener("click", play);
    if (reduce || !("IntersectionObserver" in window)) { finalState(); return { play: play }; }
    app.classList.add("run"); // hidden until it plays; without JS the finished state shows
    var seen = false;
    new IntersectionObserver(function (es) {
      if (es[0].isIntersecting && !seen) { seen = true; play(); }
    }, { threshold: 0.35 }).observe(app);
    return { play: play };
  })();

  /* ---------- hero name: fit to the full measure ---------- */
  var heroName = $("[data-fit]");
  function fitName() {
    if (!heroName) return;
    var wrap = heroName.parentElement;
    var cs = getComputedStyle(wrap);
    var avail = Math.min(wrap.clientWidth, d.documentElement.clientWidth) - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var stacked = window.matchMedia("(max-width: 720px), (orientation: portrait) and (max-width: 1100px)").matches;
    var words = $$(".w", heroName);
    // measure at the resting state: full width axis, final tracking, whatever the animations are doing
    var keepLS = heroName.style.letterSpacing, keepW = heroName.style.getPropertyValue("--wdth"), keepG = heroName.style.getPropertyValue("--wght");
    heroName.style.letterSpacing = "-0.045em";
    heroName.style.setProperty("--wdth", "125"); heroName.style.setProperty("--wght", "800");
    heroName.style.fontSize = "100px";
    var w;
    if (stacked) {
      words.forEach(function (x) { x.style.display = "block"; x.style.width = "max-content"; });
      w = Math.max.apply(null, words.map(function (x) { return x.getBoundingClientRect().width; }));
    } else {
      words.forEach(function (x) { x.style.display = "inline-block"; x.style.width = ""; });
      var rg = d.createRange(); rg.selectNodeContents(heroName);
      w = rg.getBoundingClientRect().width;
    }
    var size = Math.max(40, Math.floor(100 * avail / (w || 1) * 0.995 * 100) / 100);
    heroName.style.fontSize = size + "px";
    heroName.style.letterSpacing = keepLS;
    if (keepW) heroName.style.setProperty("--wdth", keepW); else heroName.style.removeProperty("--wdth");
    if (keepG) heroName.style.setProperty("--wght", keepG); else heroName.style.removeProperty("--wght");
    heroName.classList.add("ready");
  }

  function boot() {
    fitName();
    window.addEventListener("resize", function () { clearTimeout(boot._r); boot._r = setTimeout(function () { fitName(); if (window.ScrollTrigger) ScrollTrigger.refresh(); }, 150); });
    if (reduce || !window.gsap || !window.ScrollTrigger) { root.classList.add("static"); return; }
    motion();
  }

  if (d.fonts && d.fonts.load) {
    var fired = false;
    var go = function () { if (fired) return; fired = true; boot(); };
    Promise.all([d.fonts.load('800 100px "Archivo"'), d.fonts.load('400 12px "Martian Mono"')]).then(go, go);
    setTimeout(go, 2200);
    // if the display face lands after the fallback timer, fit again
    d.fonts.addEventListener && d.fonts.addEventListener("loadingdone", function () { if (fired) { fitName(); if (window.ScrollTrigger) window.ScrollTrigger.refresh(); } });
  } else { boot(); }

  /* =====================================================================
     Motion (GSAP + ScrollTrigger + Lenis)
     ===================================================================== */
  function motion() {
    var gsap = window.gsap, ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);
    if (window.SplitText) gsap.registerPlugin(window.SplitText);
    root.classList.add("motion");
    ST.config({ ignoreMobileResize: true });

    /* smooth scroll */
    var lenis = null;
    if (window.Lenis) {
      lenis = new window.Lenis({ lerp: 0.095, wheelMultiplier: 0.95, smoothWheel: true });
      window.__lenis = lenis;
      lenis.on("scroll", ST.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (!id || id.length < 2) return;
        var el = d.getElementById(id.slice(1));
        if (!el) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(el, { offset: id === "#top" ? 0 : -12, duration: 1.6, easing: function (x) { return x === 1 ? 1 : 1 - Math.pow(2, -10 * x); } });
        else el.scrollIntoView({ behavior: "smooth" });
        if (history.replaceState) history.replaceState(null, "", id);
        el.setAttribute("tabindex", "-1"); el.focus({ preventScroll: true });
      });
    });

    var mm = gsap.matchMedia();

    /* ---------- hero entrance ---------- */
    if (heroName) {
      $$(".w", heroName).forEach(function (w) {
        var txt = w.textContent; w.textContent = "";
        var m = d.createElement("span"); m.className = "mask";
        var inn = d.createElement("span"); inn.className = "in"; inn.textContent = txt;
        m.appendChild(inn); w.appendChild(m);
      });
      fitName();
      var tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from($$(".mask .in", heroName), { yPercent: 108, duration: 1.5, stagger: 0.12 }, 0.1)
        .from(heroName, { letterSpacing: "0.02em", duration: 1.8, clearProps: "letterSpacing" }, 0.1)
        .from("#nav .nav-bar", { y: -24, opacity: 0, duration: 1.1 }, 0.35)
        .from(".hero-top > *", { y: 16, opacity: 0, duration: 1, stagger: 0.08 }, 0.45)
        .from("[data-enter]", { y: 28, opacity: 0, duration: 1.1, stagger: 0.08 }, 0.55)
        .from(".hero-row", { "--rule": 0, duration: 1.4 }, 0.5);
    }

    /* ---------- hero: pinned while the credits slide over it; the name condenses ---------- */
    var hero = $(".hero");
    if (hero) {
      gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true, pin: true, pinSpacing: false } })
        .to(heroName, { "--wdth": 62, "--wght": 900, yPercent: -18, ease: "none" }, 0)
        .to(".hero-row, .hero-status, .hero-top", { y: -80, opacity: 0, ease: "none" }, 0)
        .to(".hero .wrap", { scale: 0.94, transformOrigin: "50% 100%", ease: "none" }, 0);
    }

    /* ---------- credits roll ---------- */
    var figs = {}; $$(".credits-stage figure").forEach(function (f) { figs[f.getAttribute("data-media")] = f; });
    var current = null;
    function showMedia(key) {
      if (key === current) return; current = key;
      Object.keys(figs).forEach(function (k) { figs[k].classList.toggle("on", k === key); });
    }
    var credits = $$(".credit"), list = $(".credit-list"), activeLi = null;
    function pickCredit() {
      var mid = window.innerHeight / 2, best = null, bestD = 1e9;
      credits.forEach(function (li) {
        var r = li.getBoundingClientRect(), c = r.top + r.height / 2, dd = Math.abs(c - mid);
        if (dd < bestD) { bestD = dd; best = li; }
      });
      if (best && bestD > window.innerHeight * 0.24) best = null;
      if (best === activeLi) return;
      if (activeLi) activeLi.classList.remove("on");
      activeLi = best;
      if (best) { best.classList.add("on"); showMedia(best.getAttribute("data-credit")); } else { showMedia(null); }
    }
    if (list) ST.create({ trigger: list, start: "top 75%", end: "bottom 25%", onUpdate: pickCredit, onToggle: pickCredit, onRefresh: pickCredit });
    var big = $(".credits-end .big");
    if (big) gsap.from(big, { "--x": 0, scale: 0.92, opacity: 0, ease: "expo.out", duration: 1.4, scrollTrigger: { trigger: big, start: "top 80%", once: true } });

    /* ---------- stacked sheets ---------- */
    var chain = $$(".work-intro, .sheet, .growth");
    chain.forEach(function (sec, i) {
      sec.style.zIndex = String(4 + i);
      var next = chain[i + 1];
      if (!next) return;
      var inner = $(".sheet-inner", sec) || $(".wrap", sec), shade = $(".shade", sec);
      var tlS = gsap.timeline({
        scrollTrigger: {
          trigger: sec, start: function () { return sec.offsetHeight > window.innerHeight ? "bottom bottom" : "top top"; },
          end: function () { return "+=" + window.innerHeight; },
          scrub: true, pin: true, pinSpacing: false, invalidateOnRefresh: true
        }
      });
      tlS.to(inner, { scale: 0.93, yPercent: -2, ease: "none" }, 0);
      if (shade) tlS.to(shade, { opacity: 0.55, ease: "none" }, 0);
    });

    /* ---------- headings rise line by line ---------- */
    if (window.SplitText) {
      $$(".h-sec, .case-title").forEach(function (h) {
        var split = window.SplitText.create(h, { type: "lines", mask: "lines", linesClass: "ln", autoSplit: true,
          onSplit: function (self) {
            return gsap.from(self.lines, { yPercent: 110, duration: 1.2, ease: "expo.out", stagger: 0.09, scrollTrigger: { trigger: h, start: "top 86%", once: true } });
          }
        });
      });
    }

    /* ---------- images develop as they enter ---------- */
    $$("[data-reveal]").forEach(function (el) {
      var img = $("img", el);
      gsap.fromTo(el, { clipPath: "inset(14% 8% 14% 8% round 14px)" }, { clipPath: "inset(0% 0% 0% 0% round 12px)", duration: 1.5, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
      if (img) gsap.fromTo(img, { scale: 1.18 }, { scale: 1, duration: 1.8, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%", once: true }, clearProps: "transform" });
    });

    /* ---------- numbers count up once ---------- */
    $$("[data-count]").forEach(function (n) {
      var end = +n.getAttribute("data-count"), obj = { v: 0 };
      gsap.to(obj, { v: end, duration: 1.8, ease: "expo.out", scrollTrigger: { trigger: n, start: "top 85%", once: true },
        onUpdate: function () { n.textContent = Math.round(obj.v); } });
    });

    /* ---------- AI reel: horizontal on wide screens, native swipe on small ones ---------- */
    var reel = $("#reel"), view = $("[data-reel]"), track = $("[data-reel-track]"), bar = $("[data-reel-bar]");
    if (reel && track) {
      mm.add("(min-width: 900px)", function () {
        var dist = function () { return Math.max(0, track.scrollWidth - d.documentElement.clientWidth); };
        gsap.to(track, { x: function () { return -dist(); }, ease: "none",
          scrollTrigger: { trigger: reel, start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 } });
        if (bar) gsap.to(bar, { scaleX: 1, ease: "none", scrollTrigger: { trigger: reel, start: "top top", end: function () { return "+=" + dist(); }, scrub: true } });
        return function () { gsap.set(track, { clearProps: "transform" }); };
      });
      mm.add("(max-width: 899px)", function () {
        view.classList.add("reel-native");
        var upd = function () { if (bar) bar.style.transform = "scaleX(" + (view.scrollLeft / Math.max(1, view.scrollWidth - view.clientWidth)).toFixed(3) + ")"; };
        view.addEventListener("scroll", upd, { passive: true }); upd();
        return function () { view.classList.remove("reel-native"); view.removeEventListener("scroll", upd); };
      });
    }

    /* ---------- cursor label + magnetic buttons (mouse only) ---------- */
    if (fine) {
      var cur = d.createElement("div"); cur.className = "cursor"; cur.setAttribute("aria-hidden", "true");
      var lab = d.createElement("span"); cur.appendChild(lab); d.body.appendChild(cur);
      var xTo = gsap.quickTo(cur, "x", { duration: 0.5, ease: "power3" }), yTo = gsap.quickTo(cur, "y", { duration: 0.5, ease: "power3" });
      window.addEventListener("pointermove", function (e) { xTo(e.clientX); yTo(e.clientY); }, { passive: true });
      $$("[data-cursor]").forEach(function (el) {
        el.addEventListener("pointerenter", function () { lab.textContent = el.getAttribute("data-cursor"); cur.classList.add("on"); });
        el.addEventListener("pointerleave", function () { cur.classList.remove("on"); });
      });
      $$(".hero .btn, .contact .btn, .nav .btn").forEach(function (b) {
        var bx = gsap.quickTo(b, "x", { duration: 0.6, ease: "elastic.out(1,0.5)" }), by = gsap.quickTo(b, "y", { duration: 0.6, ease: "elastic.out(1,0.5)" });
        b.addEventListener("pointermove", function (e) { var r = b.getBoundingClientRect(); bx((e.clientX - r.left - r.width / 2) * 0.18); by((e.clientY - r.top - r.height / 2) * 0.3); });
        b.addEventListener("pointerleave", function () { bx(0); by(0); });
      });
    }

    /* keep triggers honest once late images and fonts settle */
    window.addEventListener("load", function () { ST.refresh(); });
    window.__st = ST;
  }
})();
