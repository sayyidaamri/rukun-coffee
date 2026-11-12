/* RUKUN — site behaviour (vanilla JS, no dependencies) */
(() => {
  "use strict";
  const RK = window.RK || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isDesk = () => innerWidth >= 1024;
  const img = (name) => `${RK.base}assets/img/${name}.jpg`;
  const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch {} } };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const ICON_CLOSE = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M1 22.2 22.2 1M1.3 1l21.2 21.2" stroke="currentColor"/></svg>';

  /* ------------------------------------------------------------ header */
  const header = $("#header");
  if (header) {
    const mode = header.dataset.mode;
    const onScroll = () => {
      if (mode !== "fixed") return;
      const solid = scrollY > 10 || document.body.classList.contains("menu-open");
      header.classList.toggle("bg-rk-tundora", solid);
      header.classList.toggle("bg-transparent", !solid);
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------ mobile menu */
  const menu = $("[data-menu]");
  const openBtn = $("[data-menu-open]");
  const setMenu = (open) => {
    if (!menu) return;
    menu.classList.toggle("translate-x-full", !open);
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    openBtn && openBtn.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (open) setTimeout(() => $("[data-menu-close]", menu)?.focus(), 50); else openBtn?.focus({ preventScroll: true });
  };
  openBtn?.addEventListener("click", () => setMenu(true));
  $("[data-menu-close]")?.addEventListener("click", () => setMenu(false));
  addEventListener("resize", () => { if (isDesk() && menu?.classList.contains("is-open")) setMenu(false); });

  /* ------------------------------------------------------------ language dropdown */
  $$("[data-lang]").forEach((wrap) => {
    const btn = $("[data-lang-btn]", wrap), list = $("[data-lang-menu]", wrap), chev = $("[data-lang-chev]", wrap);
    const set = (open) => { list.classList.toggle("hidden", !open); list.classList.toggle("flex", open); btn.setAttribute("aria-expanded", String(open)); chev.style.transform = open ? "rotate(180deg)" : ""; };
    btn.addEventListener("click", (e) => { e.stopPropagation(); set(list.classList.contains("hidden")); });
    document.addEventListener("click", (e) => { if (!wrap.contains(e.target)) set(false); });
    wrap.addEventListener("keydown", (e) => { if (e.key === "Escape") { set(false); btn.focus(); } });
  });

  /* ------------------------------------------------------------ modals */
  let lastFocus = null, openName = null;
  const focusables = (el) => $$('a[href],button:not([disabled]),select,input,textarea,[tabindex]:not([tabindex="-1"])', el).filter((x) => x.offsetParent !== null);
  function openModal(name, html) {
    const m = $(`[data-modal="${name}"]`); if (!m) return;
    if (html != null) $("[data-modal-body]", m).innerHTML = html;
    if (openName) closeModal(true);
    lastFocus = document.activeElement; openName = name;
    m.classList.remove("hidden");
    // restart entry animation
    $$(".rk-overlay,.rk-dialog", m).forEach((el) => { el.style.animation = "none"; void el.offsetWidth; el.style.animation = ""; });
    document.documentElement.style.overflow = "hidden";
    const d = $(".rk-dialog", m); (focusables(d)[0] || d).focus({ preventScroll: true });
    m.dispatchEvent(new CustomEvent("rk:open"));
  }
  function closeModal(silent) {
    if (!openName) return;
    const m = $(`[data-modal="${openName}"]`);
    m.classList.add("hidden"); m.dispatchEvent(new CustomEvent("rk:close"));
    openName = null;
    if (!document.body.classList.contains("menu-open")) document.documentElement.style.overflow = "";
    if (!silent && lastFocus) lastFocus.focus({ preventScroll: true });
  }
  document.addEventListener("click", (e) => { if (e.target.closest("[data-modal-close]")) closeModal(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { if (openName) closeModal(); else if (menu?.classList.contains("is-open")) setMenu(false); }
    if (e.key === "Tab" && openName) {
      const d = $(`[data-modal="${openName}"] .rk-dialog`); const f = focusables(d); if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ------------------------------------------------------------ 10-year greeting modal */
  const greet = $('[data-modal="greeting"]');
  if (greet) {
    const tabs = $$("[data-gtab]", greet), panels = $$("[data-gpanel]", greet);
    const showTab = (i) => {
      tabs.forEach((b, j) => { b.classList.toggle("bg-rk-fire", i === j); b.classList.toggle("bg-white", i !== j); b.setAttribute("aria-selected", String(i === j)); });
      panels.forEach((p, j) => (p.hidden = i !== j));
    };
    tabs.forEach((b, i) => b.addEventListener("click", () => showTab(i)));
    // audio player
    const audio = $("audio", greet), play = $("[data-play]", greet), prog = $("[data-progress]", greet), time = $("[data-time]", greet), seek = $("[data-seek]", greet);
    const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
    const ICON_PLAY = play.innerHTML, ICON_PAUSE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';
    const toggle = () => (audio.paused ? audio.play().catch(() => {}) : audio.pause());
    play.addEventListener("click", toggle);
    $("[data-play-alt]", greet).addEventListener("click", () => { if (audio.paused) toggle(); });
    audio.addEventListener("play", () => { play.innerHTML = ICON_PAUSE; play.setAttribute("aria-label", "Pause"); });
    audio.addEventListener("pause", () => { play.innerHTML = ICON_PLAY; play.setAttribute("aria-label", "Play"); });
    audio.addEventListener("timeupdate", () => { prog.style.width = (audio.currentTime / (audio.duration || 1)) * 100 + "%"; time.textContent = fmt(audio.currentTime) + (audio.duration ? " / " + fmt(audio.duration) : ""); });
    seek.addEventListener("click", (e) => { const r = seek.getBoundingClientRect(); if (audio.duration) audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration; });
    greet.addEventListener("rk:close", () => { audio.pause(); store.set("rk-greeted", "1"); });
    $$("[data-open-greeting]").forEach((b) => b.addEventListener("click", () => { showTab(0); openModal("greeting"); }));
    if (RK.greetingAuto && !store.get("rk-greeted")) setTimeout(() => { if (!openName) openModal("greeting"); }, 1200);
  }

  /* ------------------------------------------------------------ screensaver (idle / tab left) */
  const ss = $("[data-screensaver]");
  if (ss) {
    const IDLE = 90000; let timer;
    const video = $("[data-ss-video]", ss);
    const show = () => {
      const a = $("audio"); if (a && !a.paused) return arm();
      ss.classList.remove("hidden"); ss.classList.add("flex");
      if (!reduced) video.play().catch(() => {});
    };
    const hide = () => { ss.classList.add("hidden"); ss.classList.remove("flex"); video.pause(); arm(); };
    const arm = () => { clearTimeout(timer); timer = setTimeout(show, IDLE); };
    ["mousemove", "keydown", "scroll", "touchstart", "wheel"].forEach((ev) => addEventListener(ev, () => { if (ss.classList.contains("hidden")) arm(); }, { passive: true }));
    document.addEventListener("visibilitychange", () => { if (document.hidden) show(); });
    ss.addEventListener("click", hide);
    ss.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " " || e.key === "Escape") hide(); });
    arm();
  }

  /* ------------------------------------------------------------ reveal on scroll */
  const io = new IntersectionObserver((ents) => ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { threshold: 0.15 });
  const observeReveal = (root = document) => $$(".reveal", root).forEach((el) => io.observe(el));
  observeReveal();

  /* ------------------------------------------------------------ footer: nearest store carousel */
  const sc = $("[data-store-carousel]");
  if (sc && RK.stores) {
    let i = 0;
    const im = $("[data-sc-img]", sc), nm = $("[data-sc-name]", sc), ad = $("[data-sc-addr]", sc), mp = $("[data-sc-map]", sc);
    const render = () => {
      const s = RK.stores[i];
      im.style.transition = "none"; im.style.opacity = "0"; im.style.transform = "translateX(-100px)";
      im.onload = () => { void im.offsetWidth; im.style.transition = ""; im.style.opacity = "1"; im.style.transform = "translateX(0)"; };
      im.src = img(s.img); im.alt = s.name; if (im.complete) im.onload();
      nm.textContent = s.name; ad.textContent = s.addr; mp.href = s.map;
    };
    $("[data-sc-prev]", sc).addEventListener("click", () => { i = (i - 1 + RK.stores.length) % RK.stores.length; render(); });
    $("[data-sc-next]", sc).addEventListener("click", () => { i = (i + 1) % RK.stores.length; render(); });
    const REG = { "Jakarta Selatan": [-6.26, 106.81], "Jakarta Pusat": [-6.19, 106.83], Tangerang: [-6.3, 106.66], Bandung: [-6.9, 107.61], Yogyakarta: [-7.79, 110.37], Bali: [-8.67, 115.21] };
    $("[data-sc-near]", sc).addEventListener("click", () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition((p) => {
        const d = (r) => { const c = REG[r]; return (c[0] - p.coords.latitude) ** 2 + (c[1] - p.coords.longitude) ** 2; };
        i = RK.stores.map((s, k) => [d(s.region), k]).sort((a, b) => a[0] - b[0])[0][1]; render();
      }, () => {}, { timeout: 8000 });
    });
    new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { render(); o.disconnect(); } }, { threshold: 0.2 }).observe(sc);
  }

  /* ------------------------------------------------------------ drag-to-scroll helper */
  function dragScroll(el, factor = 2) {
    let down = false, x0 = 0, s0 = 0, moved = false;
    el.addEventListener("mousedown", (e) => { down = true; moved = false; x0 = e.pageX - el.offsetLeft; s0 = el.scrollLeft; el.classList.add("cursor-grabbing"); });
    const up = () => { down = false; el.classList.remove("cursor-grabbing"); };
    el.addEventListener("mouseup", up); el.addEventListener("mouseleave", up);
    el.addEventListener("mousemove", (e) => { if (!down) return; e.preventDefault(); const x = e.pageX - el.offsetLeft; if (Math.abs(x - x0) > 3) moved = true; el.scrollLeft = s0 - (x - x0) * factor; });
    el.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  }

  /* ================================================================== HOME */
  const page = document.body.dataset.page;
  if (page === "home") {
    /* hero: barista follows the cursor (desktop) or the horizontal scroll (mobile) */
    const hero = $("[data-hero]"), scroller = $("[data-hero-scroll]"), bar = $("[data-barista]"), flip = $("[data-barista-flip]");
    let lastX = 0, idleT;
    const face = (dir) => { flip.style.transform = dir === "left" ? "scaleX(-1)" : ""; clearTimeout(idleT); idleT = setTimeout(() => (flip.style.transform = ""), 900); };
    hero.addEventListener("mousemove", (e) => {
      if (!isDesk()) return;
      const r = hero.getBoundingClientRect(), x = e.clientX - r.left;
      if (x < lastX) face("left"); else if (x > lastX) face("right");
      lastX = x;
      if (x > 200 && x < r.width - 80) bar.style.left = Math.min(x - 200, r.width * 0.62) + "px";
    });
    let lastS = 0;
    scroller.addEventListener("scroll", () => {
      if (isDesk()) return;
      const s = scroller.scrollLeft; face(s < lastS ? "left" : "right"); lastS = s;
      bar.style.left = Math.min(s + 120, hero.offsetWidth - 260) + "px";
    }, { passive: true });
    const placeBarista = () => { bar.style.left = isDesk() ? hero.offsetWidth * 0.36 + "px" : "420px"; if (!isDesk()) scroller.scrollLeft = 300; };
    placeBarista(); addEventListener("resize", placeBarista);
    /* hotspots: let the label show, then glide to the product line */
    $$("[data-hs-scroll]").forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault(); const id = a.getAttribute("href").slice(1);
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }), matchMedia("(hover:none)").matches ? 2000 : 700);
    }));

    /* product line */
    const P = RK.products, list = $("[data-prod-list]"), pimg = $("[data-prod-img]"), card = $("[data-prod-card]"), arabica = $("[data-arabica]");
    const cupIcon = (p) => p.icon === "cake"
      ? `<svg viewBox="0 0 40 40" class="h-[40px] w-[40px] shrink-0" fill="none" stroke="#000" stroke-width="1.4" stroke-linejoin="round"><path d="M6 30h28V20L6 26z" fill="${p.color}"/><path d="M6 26 34 20M6 30v-4M34 30V20"/><circle cx="27" cy="16" r="2.5" fill="#d87a6b"/></svg>`
      : `<svg viewBox="0 0 40 40" class="h-[40px] w-[40px] shrink-0" fill="none" stroke="#000" stroke-width="1.4" stroke-linejoin="round"><path d="M11 12h18l-2.2 22H13.2z" fill="#fff"/><path d="M12.2 20h15.6l-1.2 14H13.4z" fill="${p.color}"/><path d="M10.5 9h19l1 3h-21z" fill="#f3ead2"/><path d="M22 4l-2 5"/></svg>`;
    let sel = null, filter = { type: "cat", slug: "white-milk" };
    const renderList = () => {
      const items = P.filter((p) => (filter.type === "cat" ? p.cat === filter.slug : p.ing.includes(filter.slug)));
      list.innerHTML = items.map((p) => `<button type="button" class="flex w-full cursor-pointer flex-row items-center justify-start gap-2 border-b border-dotted border-black py-[10px] pl-[25%] text-left text-xs uppercase transition-all duration-300 ease-in hover:bg-rk-janna/60 sm:max-lg:justify-center sm:max-lg:pl-0 lg:gap-1 lg:px-[10%] ${sel === p ? "border border-solid bg-rk-janna" : ""}" data-p="${P.indexOf(p)}">${cupIcon(p)}${esc(p.name)}</button>`).join("");
      const noArab = filter.type === "cat" ? ["kudapan", "non-coffee"].includes(filter.slug) : filter.slug === "tea";
      arabica.style.visibility = noArab ? "hidden" : "visible";
    };
    const swapImg = (src) => {
      if (reduced) { pimg.src = src; return; }
      pimg.style.transition = "transform .25s ease, opacity .2s"; pimg.style.transform = "translateX(100px)"; pimg.style.opacity = "0";
      setTimeout(() => { pimg.style.transition = "none"; pimg.style.transform = "translateX(-100px)"; pimg.src = src;
        requestAnimationFrame(() => requestAnimationFrame(() => { pimg.style.transition = "transform .45s cubic-bezier(.2,.9,.3,1.1), opacity .2s"; pimg.style.transform = ""; pimg.style.opacity = "1"; })); }, 200);
    };
    const showProduct = (p) => {
      sel = p; renderList(); swapImg(img(p.img));
      card.innerHTML = `<div class="mx-[30px] flex w-full flex-row divide-x divide-solid divide-black border border-black lg:mx-[64px] lg:divide-dotted" style="animation:rkPop .5s ease both">
        <div class="flex w-full flex-row items-center justify-start gap-2 bg-rk-fire px-[22px] py-[10px] text-xs uppercase lg:w-[40%] lg:gap-1 lg:py-[18px]">${cupIcon(p)}<div>${esc(p.name)}</div></div>
        <div class="hidden w-[60%] bg-rk-janna px-[22px] py-[18px] text-[10px] lg:block">${esc(p.desc)}</div>
        <button type="button" class="flex cursor-pointer items-center bg-rk-janna p-[10px] lg:hidden" data-p-info aria-label="Info"><svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="#000" stroke-width=".8"><circle cx="10" cy="10" r="9"/><path d="M10 8v6"/><circle cx="10" cy="6" r=".5" fill="#000"/></svg></button></div>`;
      card.classList.remove("hidden"); card.classList.add("flex");
      $("[data-p-info]", card).addEventListener("click", () => openModal("generic", `<div class="flex flex-col divide-y divide-black"><div class="flex flex-row items-center gap-2 bg-rk-fire px-[22px] py-[10px] text-xs uppercase">${cupIcon(p)}${esc(p.name)}</div><div class="bg-rk-janna px-[22px] py-[23px] text-[10px]">${esc(p.desc)}</div></div>`));
    };
    list.addEventListener("click", (e) => { const b = e.target.closest("[data-p]"); if (b) showProduct(P[+b.dataset.p]); });
    const catBtns = $$("[data-cat]"), ingBtns = $$("[data-ing]");
    const markActive = () => {
      catBtns.forEach((b) => { const on = filter.type === "cat" && b.dataset.cat === filter.slug; b.classList.toggle("bg-rk-fire", on); b.setAttribute("aria-selected", String(on)); });
      ingBtns.forEach((b) => b.classList.toggle("bg-rk-fire", filter.type === "ing" && b.dataset.ing === filter.slug));
    };
    const setFilter = (f) => {
      filter = f; markActive();
      list.innerHTML = Array.from({ length: 6 }, () => '<div class="animate-pulse"><div class="flex w-full items-center gap-2 px-[20%] py-[17px] lg:gap-1 lg:px-[10%]"><div class="h-5 w-5 rounded-full bg-gray-400"></div><div class="h-2 flex-1 rounded bg-gray-400"></div></div></div>').join("");
      setTimeout(renderList, 280);
    };
    catBtns.forEach((b) => b.addEventListener("click", () => setFilter({ type: "cat", slug: b.dataset.cat })));
    ingBtns.forEach((b) => b.addEventListener("click", () => setFilter({ type: "ing", slug: b.dataset.ing })));
    renderList();
    const st = document.createElement("style"); st.textContent = "@keyframes rkPop{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:none}}"; document.head.appendChild(st);

    /* neighbors strip */
    const sec = $("[data-neighbors]"), drag = $("[data-drag]"), hint = $("[data-swipe-hint]");
    dragScroll(drag, 2);
    $$("[data-person]", drag).forEach((el) => {
      const lab = $("[data-person-label]", el);
      el.addEventListener("mouseenter", () => { sec.classList.replace("bg-rk-khaki", "bg-rk-rust"); hint.classList.replace("text-rk-rust", "text-rk-khaki"); lab.style.transform = "translate(-50%,-130%)"; lab.style.opacity = "1"; });
      el.addEventListener("mouseleave", () => { sec.classList.replace("bg-rk-rust", "bg-rk-khaki"); hint.classList.replace("text-rk-khaki", "text-rk-rust"); lab.style.transform = ""; lab.style.opacity = ""; });
    });
    const hintVis = () => { hint.style.visibility = (innerWidth <= 768 ? drag.scrollLeft < 210 : drag.scrollLeft === 0) ? "visible" : "hidden"; };
    drag.addEventListener("scroll", hintVis, { passive: true });
    if (innerWidth <= 768) drag.scrollLeft += 200; hintVis();

    /* serbarukun product modal */
    $$("[data-merch]").forEach((b) => b.addEventListener("click", () => {
      const m = RK.merch[+b.dataset.merch];
      openModal("generic", `<div class="grid max-h-[85vh] grid-cols-1 overflow-y-auto lg:grid-cols-5">
        <div class="bg-rk-conifer lg:col-span-2"><div class="flex flex-row gap-[10px] p-5" data-mg>
          <div class="no-scrollbar flex h-[220px] w-auto flex-shrink-0 flex-col gap-[10px] overflow-y-auto">${m.gallery.map((g, i) => `<button type="button" class="h-[41px] w-[41px] flex-shrink-0 ${i ? "" : "border border-black"}" data-mt="${i}"><img src="${img(g)}" alt="" class="h-full w-full object-cover"></button>`).join("")}</div>
          <div class="mb-4 aspect-square w-full overflow-hidden bg-white"><img src="${img(m.gallery[0])}" alt="${esc(m.name)}" class="h-full w-full object-contain transition-opacity duration-200" data-mm></div></div></div>
        <div class="flex flex-col justify-between bg-rk-horizon lg:col-span-3"><div class="flex min-h-[110px] flex-col gap-[10px] p-5"><p class="text-xs uppercase text-white">${esc(m.name)}</p><p class="text-sm text-rk-conifer lg:text-rk-silver">${m.price}</p><p class="pt-[10px] text-xs text-white">${esc(m.desc)}</p></div>
          ${m.buy ? `<a target="_blank" rel="noopener" class="flex px-5 py-[22px] text-[10px] text-white transition-colors hover:bg-rk-tapa" href="https://www.tokopedia.com/"><div class="border-b border-dotted pb-[6px]">${esc(RK.i18n.buy)}</div></a>` : ""}</div></div>`);
      const mg = $('[data-modal="generic"] [data-mg]');
      $$("[data-mt]", mg).forEach((t) => t.addEventListener("click", () => {
        $$("[data-mt]", mg).forEach((x) => x.classList.remove("border", "border-black")); t.classList.add("border", "border-black");
        const mm = $("[data-mm]", mg); mm.style.opacity = "0"; setTimeout(() => { mm.src = img(m.gallery[+t.dataset.mt]); mm.style.opacity = "1"; }, 150);
      }));
    }));

    /* newsboard posters */
    const board = $("[data-board]"), posters = $$("[data-poster]");
    posters.forEach((p, i) => {
      p.addEventListener("mouseenter", () => posters.forEach((q, j) => (q.style.opacity = i === j ? "1" : ".5")));
      p.addEventListener("mouseleave", () => posters.forEach((q) => (q.style.opacity = "1")));
    });
    if (innerWidth <= 768) board.scrollLeft += 165;
  }

  /* ================================================================== ABOUT */
  if (page === "about") {
    const banner = $("[data-about-banner]");
    if (innerWidth < 1024) banner.scrollLeft = 200;
    const bubbles = $$("[data-bubble]");
    const cycle = () => bubbles.forEach((b, i) => setTimeout(() => { b.style.opacity = "1"; b.style.transform = "translateY(-6px)"; }, 600 + i * 900));
    cycle();
    // journey tabs
    const grid = $("[data-year-grid]");
    $$("[data-year]").forEach((b) => b.addEventListener("click", () => {
      $$("[data-year]").forEach((x) => { const on = x === b; x.classList.toggle("text-black", on); x.classList.toggle("text-gray-400", !on); x.setAttribute("aria-selected", String(on)); });
      grid.style.opacity = "0";
      setTimeout(() => {
        grid.innerHTML = RK.journey[b.dataset.year].map((j) => `<div class="flex flex-col items-start gap-4"><div class="h-[321px] w-full overflow-hidden border border-black"><img src="${img(j.img)}" alt="" class="h-full w-full object-cover"></div><p class="font-hand text-xl uppercase">${esc(j.title)}</p><p class="text-sm">${esc(j.desc)}</p></div>`).join("");
        grid.style.transition = "opacity .3s"; grid.style.opacity = "1";
      }, 200);
    }));
    // village: units rise in as you scroll through the sticky section
    const vil = $("[data-village]"), units = $$("[data-unit]"), cnt = $("[data-count]");
    const target = +cnt.dataset.count; let counted = false;
    const onScroll = () => {
      const r = vil.getBoundingClientRect(), total = r.height - innerHeight, p = Math.min(1, Math.max(0, -r.top / total));
      units.forEach((u, i) => { const on = p > 0.12 + i * 0.2; u.style.opacity = on ? "1" : "0"; u.style.transform = on ? "translateY(0)" : "translateY(80px)"; });
      if (p > 0.05 && !counted) { counted = true; const t0 = performance.now(); const step = (t) => { const k = Math.min(1, (t - t0) / 1400); cnt.textContent = Math.round(target * k); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }
    };
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
    units.forEach((u, i) => u.addEventListener("click", () => {
      const d = RK.units[i];
      openModal("generic", `<div class="grid grid-cols-1 lg:grid-cols-2"><img src="${img(d.img)}" alt="" class="h-[260px] w-full object-cover lg:h-full"><div class="flex flex-col gap-4 bg-rk-stark p-8"><div class="relative inline-flex w-fit"><span class="absolute bottom-[1px] h-[75%] w-full bg-rk-japonica"></span><p class="relative px-2 font-hand text-2xl uppercase">${esc(d.name)}</p></div><p class="text-sm leading-6">${esc(d.desc)}</p></div></div>`);
    }));
  }

  /* ================================================================== GALLERY */
  if (page === "gallery") {
    const grid = $("[data-gal-grid]"), tabs = $$("[data-gal-tab]");
    let cur = "activities";
    const skeleton = () => Array.from({ length: 8 }, () => '<div class="space-y-4"><div class="relative h-[167px] animate-pulse rounded-xl bg-rk-khaki"></div><div class="h-6 w-2/4 animate-pulse rounded-lg bg-rk-khaki"></div><div class="h-4 w-full animate-pulse rounded-lg bg-rk-khaki"></div></div>').join("");
    const render = () => {
      grid.innerHTML = skeleton();
      setTimeout(() => {
        grid.innerHTML = RK.gallery[cur].map((g, i) => `<button type="button" class="group space-y-3 text-left reveal" style="transition-delay:${(i % 4) * 0.08}s" data-g="${i}"><div class="relative h-[167px] overflow-hidden rounded-xl"><img src="${img(g.imgs[0])}" alt="${esc(g.title)}" loading="lazy" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"><span class="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px]">${g.imgs.length} foto</span></div><p class="font-hand text-lg uppercase leading-tight">${esc(g.title)}</p><p class="text-xs text-rk-janna">${esc(g.date)}</p></button>`).join("");
        observeReveal(grid);
      }, 350);
    };
    tabs.forEach((b) => b.addEventListener("click", () => { cur = b.dataset.galTab; tabs.forEach((x) => { x.classList.toggle("bg-rk-fire", x === b); x.setAttribute("aria-selected", String(x === b)); }); render(); }));
    render();
    grid.addEventListener("click", (e) => {
      const b = e.target.closest("[data-g]"); if (!b) return;
      const g = RK.gallery[cur][+b.dataset.g]; let k = 0;
      openModal("generic", `<div class="p-5" data-lb><div class="relative aspect-[4/3] w-full overflow-hidden border border-black bg-black"><img data-lbi src="${img(g.imgs[0])}" alt="" class="h-full w-full object-contain transition-opacity duration-200"></div>
        <div class="mt-4 flex items-center justify-between gap-4"><div><p class="font-hand text-2xl uppercase">${esc(g.title)}</p><p class="text-xs">${esc(g.date)} · <span data-lbn>1</span>/${g.imgs.length}</p></div>
        <div class="flex gap-2"><button class="border border-black px-3 py-2 transition-colors hover:bg-black hover:text-white" data-lbp aria-label="prev">←</button><button class="border border-black px-3 py-2 transition-colors hover:bg-black hover:text-white" data-lbx aria-label="next">→</button></div></div>
        <div class="mt-4 flex gap-2">${g.imgs.map((x, i) => `<button class="h-14 w-14 overflow-hidden ${i ? "opacity-50" : ""}" data-lbt="${i}"><img src="${img(x)}" alt="" class="h-full w-full object-cover"></button>`).join("")}</div></div>`);
      const lb = $('[data-modal="generic"] [data-lb]');
      const go = (n) => { k = (n + g.imgs.length) % g.imgs.length; const im = $("[data-lbi]", lb); im.style.opacity = "0"; setTimeout(() => { im.src = img(g.imgs[k]); im.style.opacity = "1"; }, 150); $("[data-lbn]", lb).textContent = k + 1; $$("[data-lbt]", lb).forEach((t, i) => t.classList.toggle("opacity-50", i !== k)); };
      $("[data-lbp]", lb).onclick = () => go(k - 1); $("[data-lbx]", lb).onclick = () => go(k + 1);
      $$("[data-lbt]", lb).forEach((t) => (t.onclick = () => go(+t.dataset.lbt)));
      lb.tabIndex = -1; lb.addEventListener("keydown", (ev) => { if (ev.key === "ArrowLeft") go(k - 1); if (ev.key === "ArrowRight") go(k + 1); });
    });
  }

  /* ================================================================== LOCATIONS */
  if (page === "locations") {
    const grid = $("[data-store-grid]"), more = $("[data-store-more]"), empty = $("[data-store-empty]");
    const fReg = $('[data-filter="region"]'), fSvc = $('[data-filter="svc"]');
    let shown = 6;
    const card = (s) => `<div class="space-y-[10px] reveal"><div class="h-44 w-full overflow-hidden border border-black"><img src="${img(s.img)}" alt="${esc(s.name)}" loading="lazy" class="h-full w-full object-cover"></div>
      <div class="divide-y divide-black border border-black">
        <div class="flex flex-col gap-[10px] px-[34px] pb-[13px] pt-[10px] text-center"><p class="font-hand text-xl uppercase">${esc(s.name)}</p><p class="text-xs">${esc(s.addr)}</p>
          <div class="mt-2 flex w-full flex-row justify-center gap-10 text-[10px]"><a class="dotted-link" target="_blank" rel="noopener" href="${s.map}">${esc(RK.lp.direction)}</a><span class="dotted-link">${esc(s.region)}</span></div></div>
        <div class="flex flex-col divide-y divide-black bg-rk-khaki"><div class="grid grid-cols-2 divide-x divide-black text-center text-[10px] uppercase"><div class="p-3">${esc(RK.lp.opens)}</div><div class="p-3">${esc(s.open)}</div></div>
          <div class="flex flex-row justify-center gap-[17px] py-1.5">${s.svc.map((v) => RK.svcIcons[v]).join("")}</div></div>
        <div class="flex flex-col gap-[19px] px-[34px] py-5 text-center"><button type="button" class="mx-auto font-hand text-sm uppercase underline decoration-dotted underline-offset-4 transition-colors hover:text-rk-rust" data-sinfo="${s.i}">${esc(RK.lp.more)}</button>
          <div class="flex w-full justify-center gap-[30px] text-[10px]"><a class="dotted-link" target="_blank" rel="noopener" href="https://gofood.co.id/">GoFood</a><a class="dotted-link" target="_blank" rel="noopener" href="https://food.grab.com/id/">GrabFood</a><a class="dotted-link" target="_blank" rel="noopener" href="https://shopee.co.id/">ShopeeFood</a></div></div>
      </div></div>`;
    const render = () => {
      const list = RK.storesFull.filter((s) => (!fReg.value || s.region === fReg.value) && (!fSvc.value || s.svc.includes(fSvc.value)));
      grid.innerHTML = list.slice(0, shown).map(card).join(""); observeReveal(grid);
      empty.classList.toggle("hidden", list.length > 0);
      more.parentElement.classList.toggle("hidden", list.length <= shown);
    };
    [fReg, fSvc].forEach((f) => f.addEventListener("change", () => { shown = 6; render(); }));
    more.addEventListener("click", () => { shown += 6; render(); });
    render();
    grid.addEventListener("click", (e) => {
      const b = e.target.closest("[data-sinfo]"); if (!b) return;
      const s = RK.storesFull[+b.dataset.sinfo];
      openModal("generic", `<div class="grid max-h-[85vh] grid-cols-1 overflow-y-auto lg:grid-cols-5"><div class="bg-rk-khaki p-5 lg:col-span-3"><div class="grid grid-cols-2 gap-3">${s.gal.map((g, i) => `<img src="${img(g)}" alt="" class="${i ? "" : "col-span-2"} aspect-[4/3] w-full border border-black object-cover">`).join("")}</div></div>
        <div class="flex flex-col gap-4 bg-white p-6 lg:col-span-2"><p class="font-hand text-2xl uppercase">${esc(s.name)}</p><p class="text-xs leading-5">${esc(s.addr)}</p>
        <div class="border border-black text-[10px] uppercase"><div class="grid grid-cols-2 divide-x divide-black bg-rk-khaki"><div class="p-3">${esc(RK.lp.opens)}</div><div class="p-3">${esc(s.open)}</div></div></div>
        <ul class="space-y-2 text-xs">${s.svc.map((v) => `<li class="flex items-center gap-2">${RK.svcIcons[v]}${esc(RK.services[v])}</li>`).join("")}</ul>
        <a class="mt-auto inline-block w-fit border border-black p-3 pb-1 font-hand text-sm uppercase transition-colors hover:bg-black hover:text-white" target="_blank" rel="noopener" href="${s.map}">${esc(RK.lp.direction)}</a></div></div>`);
    });
  }

  /* ================================================================== NEWSLETTER */
  if (page === "newsletter") {
    $$("[data-jump]").forEach((b) => b.addEventListener("click", () => document.getElementById(b.dataset.jump)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" })));
    const tabs = $$("[data-jump]");
    if (tabs.length) {
      const secs = tabs.map((b) => document.getElementById(b.dataset.jump));
      const onScroll = () => { let k = 0; secs.forEach((s, i) => { if (s.getBoundingClientRect().top < 160) k = i; }); tabs.forEach((b, i) => b.classList.toggle("underline", i === k && scrollY > 120)); };
      addEventListener("scroll", onScroll, { passive: true });
    }
    // article slider
    const sl = $("[data-slider]");
    if (sl) {
      const track = $("[data-track]", sl), slides = $$("[data-slide]", sl), prev = $("[data-prev]", sl), next = $("[data-next]", sl);
      let k = 0;
      const go = (n) => {
        k = Math.max(0, Math.min(slides.length - 1, n));
        const off = slides[k].offsetLeft - (track.parentElement.clientWidth - slides[k].clientWidth) / 2;
        const max = track.scrollWidth - track.parentElement.clientWidth;
        track.style.transform = `translateX(${-Math.max(0, Math.min(off, max))}px)`;
        prev.disabled = k === 0; next.disabled = k === slides.length - 1;
      };
      prev.onclick = () => go(k - 1); next.onclick = () => go(k + 1);
      let x0 = null;
      track.addEventListener("pointerdown", (e) => (x0 = e.clientX));
      addEventListener("pointerup", (e) => { if (x0 == null) return; const dx = e.clientX - x0; if (Math.abs(dx) > 40) go(k + (dx < 0 ? 1 : -1)); x0 = null; });
      addEventListener("resize", () => go(k));
      $$("img", track).forEach((im) => im.complete || im.addEventListener("load", () => go(k)));
      go(0);
    }
  }

  /* ================================================================== LINKS */
  const links = $("[data-links]");
  if (links) requestAnimationFrame(() => setTimeout(() => links.classList.add("is-open"), 60));
})();
