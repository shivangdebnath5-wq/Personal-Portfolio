(() => {
  const S = window.SITE, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  const animate = hasGsap && !reduce;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  if (animate) { document.documentElement.classList.add("js"); gsap.registerPlugin(ScrollTrigger); }

  /* ---------- render from data ---------- */
  const sections = [["home", "Home"], ["about", "About"], ["journey", "Journey"], ["projects", "Projects"], ["hobbies", "Hobbies"], ["contact", "Contact"]];
  const links = sections.map(([id, l]) => `<li><a href="#${id}" data-sec="${id}">${l}</a></li>`).join("");
  $("#navLinks").innerHTML = links; $("#menuLinks").innerHTML = links;

  $("#heroIntro").textContent = S.intro;
  $("#heroTitle").innerHTML = ["Shivang", "Debnath."].map(w => `<span class="w" aria-hidden="true"><span>${w}</span></span>`).join("");
  $("#aboutBig").textContent = S.about.big;
  $("#aboutCols").innerHTML = S.about.cols.map(([h, p]) => `<div><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join("");

  $("#timeline").innerHTML = '<span class="tl-line"></span>' + S.journey.map((m, i) => `
    <li class="tl rv">
      <button aria-expanded="false" aria-controls="tl${i}"><span class="ph">${esc(m.phase)}</span><span class="tt">${esc(m.title)}</span><span class="pm" aria-hidden="true">+</span></button>
      <div class="body" id="tl${i}"><div><div class="inner">
        <div><p class="date">${esc(m.date)}</p><p class="story">${esc(m.story)}</p></div>
        <div class="ph-img">${m.img ? `<img src="${esc(m.img)}" alt="${esc(m.title)}" loading="lazy">` : "Add an image in js/data.js"}</div>
      </div></div></div>
    </li>`).join("");

  const cats = ["All", ...new Set(S.projects.map(p => p.category))];
  $("#filters").innerHTML = cats.map((c, i) => `<button data-cat="${esc(c)}" aria-pressed="${i === 0}">${esc(c)}</button>`).join("");
  $("#projectGrid").innerHTML = S.projects.map(p => `
    <button class="card rv" data-id="${p.id}" data-cat="${esc(p.category)}" aria-haspopup="dialog" aria-label="Open case study: ${esc(p.name)}">
      <span class="thumb">${p.shots[0] ? `<img src="${esc(p.shots[0])}" alt="" loading="lazy">` : esc(p.name.charAt(0))}</span>
      <span class="meta"><span class="cat">${esc(p.category)}</span><h3>${esc(p.name)}</h3><p>${esc(p.tagline)}</p></span>
    </button>`).join("");

  $("#hobbyList").innerHTML = S.hobbies.map(h => `<li class="rv">${esc(h)}</li>`).join("");

  const fr = S.favoriteRead;
  if (fr && fr.title) {
    $("#read").innerHTML = `<p class="rl">${esc(fr.label)}</p><h3 id="readTitle">${esc(fr.title)}</h3><p class="ra">${esc(fr.author)}</p><p class="rn">${esc(fr.note)}</p>${fr.link ? `<a class="btn ghost small" href="${esc(fr.link)}" target="_blank" rel="noopener noreferrer">Read more</a>` : ""}`;
  } else $("#read").remove();

  const saved = JSON.parse(store.get("sd-modules") || "{}");
  $("#mods").innerHTML = S.exploring.map(m => `<article class="mod rv"><h3>${esc(m.title)}</h3><p data-key="${m.key}">${esc(saved[m.key] ?? m.text)}</p></article>`).join("");

  $("#contactText").textContent = S.contact.text;
  const mail = $("#mailLink"); mail.href = "mailto:" + S.contact.email; mail.textContent = S.contact.email;
  $("#socials").innerHTML = S.contact.socials.filter(s => s.url).map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a></li>`).join("");
  $("#year").textContent = "© " + new Date().getFullYear();

  /* ---------- theme ---------- */
  const root = document.documentElement;
  const setTheme = t => { root.dataset.theme = t; $('meta[name="theme-color"]').content = t === "ivory" ? "#F6F2FB" : "#08080D"; store.set("sd-theme", t); };
  setTheme(store.get("sd-theme") || "obsidian");
  $("#themeBtn").addEventListener("click", () => setTheme(root.dataset.theme === "ivory" ? "obsidian" : "ivory"));

  /* ---------- nav ---------- */
  const nav = $("#nav"), burger = $("#burger"), menu = $("#menu");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 40);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const toggleMenu = open => {
    burger.setAttribute("aria-expanded", open); menu.classList.toggle("open", open); menu.setAttribute("aria-hidden", !open);
    document.body.style.overflow = open ? "hidden" : "";
    $$("a", menu).forEach(a => a.tabIndex = open ? 0 : -1);
  };
  toggleMenu(false);
  burger.addEventListener("click", () => toggleMenu(burger.getAttribute("aria-expanded") !== "true"));
  $$("#menu a").forEach(a => a.addEventListener("click", () => toggleMenu(false)));
  addEventListener("keydown", e => { if (e.key === "Escape") toggleMenu(false); });
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) $$("[data-sec]").forEach(a => a.classList.toggle("active", a.dataset.sec === e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach(([id]) => io.observe($("#" + id)));
  $("#exploring") && io.observe($("#exploring"));

  /* ---------- timeline ---------- */
  $$(".tl button").forEach(b => b.addEventListener("click", () => {
    const li = b.parentElement, open = !li.classList.contains("open");
    li.classList.toggle("open", open); b.setAttribute("aria-expanded", open);
    if (open && animate) gsap.fromTo($(".ph-img", li), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1, ease: "power3.out", delay: .15 });
    if (animate) setTimeout(() => ScrollTrigger.refresh(), 700);
  }));

  /* ---------- projects ---------- */
  $("#filters").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    $$("#filters button").forEach(x => x.setAttribute("aria-pressed", x === b));
    $$(".card").forEach(c => {
      const show = b.dataset.cat === "All" || c.dataset.cat === b.dataset.cat;
      if (!animate) return c.hidden = !show;
      if (show && c.hidden) { c.hidden = false; gsap.fromTo(c, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .5, clearProps: "transform" }); }
      else if (!show && !c.hidden) gsap.to(c, { opacity: 0, duration: .2, onComplete: () => { c.hidden = true; } });
    });
    if (animate) setTimeout(() => ScrollTrigger.refresh(), 400);
  });

  const dlg = $("#case");
  const list = (a, ph) => a.length ? a.map(x => `<li>${esc(x)}</li>`).join("") : `<li>${ph}</li>`;
  $("#projectGrid").addEventListener("click", e => {
    const c = e.target.closest(".card"); if (!c) return;
    const p = S.projects.find(x => x.id === c.dataset.id), L = p.links || {};
    $(".case-in", dlg).innerHTML = `
      <button class="btn ghost small close" aria-label="Close case study">Close</button>
      <div><p class="cat" style="color:var(--soft)">${esc(p.category)}</p><h3 id="caseTitle">${esc(p.name)}</h3></div>
      <p class="lede">${esc(p.description)}</p>
      <div><h4>Features</h4><ul>${list(p.features, "Add features in js/data.js")}</ul></div>
      <div><h4>Technologies</h4><div class="tags">${(p.tech.length ? p.tech : ["Add technologies"]).map(t => `<span>${esc(t)}</span>`).join("")}</div></div>
      <div><h4>Screenshots</h4><div class="shots">${p.shots.length ? p.shots.map(s => `<div class="ph-img"><img src="${esc(s)}" alt="${esc(p.name)} screenshot" loading="lazy"></div>`).join("") : '<div class="ph-img">Add screenshots in js/data.js</div>'}</div></div>
      <div class="row" style="margin:0">
        ${L.live ? `<a class="btn" href="${esc(L.live)}" target="_blank" rel="noopener noreferrer">Live site</a>` : ""}
        ${L.code ? `<a class="btn ghost" href="${esc(L.code)}" target="_blank" rel="noopener noreferrer">Source code</a>` : ""}
        ${!L.live && !L.code ? '<span class="hint">Add links in js/data.js</span>' : ""}
      </div>`;
    dlg.showModal();
    if (animate) gsap.fromTo(".case-in > *", { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: .06, duration: .5, ease: "power3.out" });
  });
  dlg.addEventListener("click", e => { if (e.target === dlg || e.target.closest(".close")) dlg.close(); });

  /* ---------- editable modules ---------- */
  const mods = $("#mods"), eb = $("#editToggle");
  eb.addEventListener("click", () => {
    const on = eb.getAttribute("aria-pressed") !== "true";
    eb.setAttribute("aria-pressed", on); eb.textContent = on ? "Done editing" : "Edit modules";
    mods.classList.toggle("editing", on); $("#editHint").hidden = !on;
    $$("p[data-key]", mods).forEach(p => p.contentEditable = on);
    if (!on) { const o = {}; $$("p[data-key]", mods).forEach(p => o[p.dataset.key] = p.textContent.trim()); store.set("sd-modules", JSON.stringify(o)); }
  });

  /* ---------- hero glow follows pointer ---------- */
  const hero = $("#home");
  hero.addEventListener("pointermove", e => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
    hero.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
  });

  /* ---------- pointer effects (desktop only) ---------- */
  if (matchMedia("(hover:hover) and (pointer:fine)").matches && !reduce) {
    document.body.classList.add("has-cursor");
    const cur = $("#cursor"), dot = $("b", cur), ring = $("u", cur);
    let x = 0, y = 0, rx = 0, ry = 0;
    addEventListener("pointermove", e => { x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px,${y}px)`; });
    (function loop() { rx += (x - rx) * .16; ry += (y - ry) * .16; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); })();
    document.addEventListener("pointerover", e => cur.classList.toggle("big", !!e.target.closest("a,button,.card")));

    $$("[data-magnetic]").forEach(el => {
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
    $$(".card").forEach(c => {
      c.addEventListener("pointermove", e => {
        const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        c.style.transform = `rotateY(${px * 10}deg) rotateX(${-py * 10}deg) translateZ(8px)`;
      });
      c.addEventListener("pointerleave", () => { c.style.transform = ""; });
    });
  }

  /* ---------- loader + entrance ---------- */
  const loader = $("#loader"), num = $("#loadNum"), bar = $("i", loader);
  const intro = () => {
    loader.remove();
    if (!animate) return;
    gsap.from("#heroTitle .w span", { yPercent: 110, duration: 1.2, stagger: .12, ease: "expo.out" });
    gsap.from([".hero-sub", ".hero .lede", ".hero .row"], { opacity: 0, y: 20, duration: 1, stagger: .15, delay: .5, ease: "power3.out" });
    gsap.from("#nav", { y: -80, opacity: 0, duration: 1, delay: .3, ease: "power3.out" });
  };
  if (!animate) { loader.remove(); }
  else {
    const o = { v: 0 };
    gsap.to(o, { v: 100, duration: 1.4, ease: "power2.inOut", onUpdate: () => { num.textContent = Math.round(o.v); bar.style.transform = `scaleX(${o.v / 100})`; },
      onComplete: () => gsap.to(loader, { yPercent: -100, duration: .9, ease: "power4.inOut", onComplete: intro }) });
  }

  /* ---------- scroll animations ---------- */
  if (animate) {
    $$(".rv").forEach(el => gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }));
    gsap.to(".glow", { yPercent: 25, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    gsap.to("#heroTitle", { yPercent: -12, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".tl-line", { scaleY: 1, ease: "none", scrollTrigger: { trigger: "#timeline", start: "top 70%", end: "bottom 70%", scrub: true } });
    $$(".card .thumb").forEach(t => gsap.from(t, { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: t, start: "top 90%", once: true } }));
  }
})();
