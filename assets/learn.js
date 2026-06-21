(function () {
  "use strict";

  const app = document.getElementById("app");
  const levels = [
    { name: "Beginner", text: "Core vocabulary, first mental models, and safe first moves." },
    { name: "Intermediate", text: "Practical judgment, edge cases, and tradeoffs in real work." },
    { name: "Advanced", text: "System design, evaluation design, and source-level reasoning." },
    { name: "Expert", text: "Research frontier, contested claims, and operational discipline." }
  ];

  const state = {
    tracks: [],
    links: [],
    prereqs: [],
    lessons: [],
    lessonsById: new Map(),
    lessonsByTrack: new Map(),
    ready: false
  };

  let lastSearch = "";

  // Inline SVG diagrams (bronze-on-ink, currentColor-aware). Keyed by lesson.diagram.
  const BR = "#2a95ea";  // hub house accent (research-notes.css --accent)
  const diagrams = {
    agent_loop: `
      <svg viewBox="0 0 460 150" role="img" aria-label="The agent loop: think, act, observe, decide, repeating until a stop condition.">
        <g fill="none" stroke="${BR}" stroke-width="1.5">
          ${["Think", "Act (tool)", "Observe", "Decide"].map((t, i) => `<rect x="${10 + i * 112}" y="50" width="96" height="46" rx="8"/>`).join("")}
          ${[0, 1, 2].map((i) => `<path d="M${106 + i * 112} 73 h16" marker-end="url(#ah)"/>`).join("")}
          <path d="M444 96 v18 a6 6 0 0 1 -6 6 H22 a6 6 0 0 1 -6 -6 v-18" marker-end="url(#ah)"/>
        </g>
        <defs><marker id="ah" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 z" fill="${BR}"/></marker></defs>
        <g fill="currentColor" font-size="13" text-anchor="middle" font-family="Inter, system-ui, sans-serif">
          ${["Think", "Act (tool)", "Observe", "Decide"].map((t, i) => `<text x="${58 + i * 112}" y="78">${t}</text>`).join("")}
          <text x="230" y="140" fill="${BR}" font-size="12">loop until a stop condition</text>
        </g>
      </svg>`,
    rag: `
      <svg viewBox="0 0 460 140" role="img" aria-label="RAG pipeline: a query retrieves passages from a knowledge base, which augment the prompt before generation.">
        <defs><marker id="rh" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 z" fill="${BR}"/></marker></defs>
        <g fill="none" stroke="${BR}" stroke-width="1.5">
          <rect x="8" y="52" width="80" height="40" rx="8"/>
          <rect x="138" y="52" width="92" height="40" rx="8"/>
          <rect x="280" y="52" width="92" height="40" rx="8"/>
          <rect x="138" y="8" width="92" height="30" rx="8" stroke-dasharray="4 3"/>
          <path d="M88 72 h48" marker-end="url(#rh)"/>
          <path d="M230 72 h48" marker-end="url(#rh)"/>
          <path d="M184 38 v12" marker-end="url(#rh)"/>
        </g>
        <g fill="currentColor" font-size="12.5" text-anchor="middle" font-family="Inter, system-ui, sans-serif">
          <text x="48" y="76">Query</text>
          <text x="184" y="76">Retrieve</text>
          <text x="326" y="76">Generate</text>
          <text x="184" y="27" fill="${BR}">Knowledge base</text>
        </g>
      </svg>`,
    attention: `
      <svg viewBox="0 0 460 160" role="img" aria-label="Self-attention: a token's query is compared with every token's key to weight how much each token's value contributes.">
        <defs><marker id="th" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 z" fill="${BR}"/></marker></defs>
        <g fill="currentColor" font-size="12.5" text-anchor="middle" font-family="Inter, system-ui, sans-serif">
          ${["the", "cat", "sat"].map((t, i) => `<text x="${70 + i * 130}" y="28">${t}</text>`).join("")}
          <text x="200" y="150" fill="${BR}">query of "sat" weighs the keys of all earlier tokens</text>
        </g>
        <g fill="none" stroke="${BR}" stroke-width="1.5">
          ${[0, 1, 2].map((i) => `<circle cx="${70 + i * 130}" cy="60" r="14"/>`).join("")}
          <circle cx="330" cy="60" r="18" stroke-width="2"/>
          <path d="M316 72 C 240 110, 150 110, 80 74" stroke-dasharray="3 3" marker-end="url(#th)"/>
          <path d="M324 70 C 280 100, 230 100, 196 74" stroke-dasharray="3 3" marker-end="url(#th)"/>
        </g>
      </svg>`,
    context_window: `
      <svg viewBox="0 0 460 120" role="img" aria-label="The context window: a fixed-size budget of tokens; input plus output must fit, and tokens outside it are unavailable.">
        <g fill="none" stroke="${BR}" stroke-width="1.5"><rect x="120" y="34" width="230" height="44" rx="8"/></g>
        <g fill="${BR}" opacity="0.25">${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${126 + i * 37}" y="40" width="32" height="32" rx="4"/>`).join("")}</g>
        <g fill="currentColor" font-size="12.5" font-family="Inter, system-ui, sans-serif">
          <text x="8" y="60">older</text>
          <text x="372" y="60">newer</text>
          <text x="120" y="98" fill="${BR}" font-size="12">fixed token budget (input + output); anything outside is gone</text>
        </g>
      </svg>`,
    confusion_matrix: `
      <svg viewBox="0 0 320 200" role="img" aria-label="Confusion matrix: true and false positives on the predicted-positive row, false and true negatives on the predicted-negative row.">
        <g fill="none" stroke="${BR}" stroke-width="1.5">
          <rect x="90" y="40" width="100" height="60"/><rect x="190" y="40" width="100" height="60"/>
          <rect x="90" y="100" width="100" height="60"/><rect x="190" y="100" width="100" height="60"/>
        </g>
        <g fill="currentColor" font-size="13" text-anchor="middle" font-family="Inter, system-ui, sans-serif">
          <text x="140" y="74" fill="${BR}">TP</text><text x="240" y="74">FP</text>
          <text x="140" y="134">FN</text><text x="240" y="134" fill="${BR}">TN</text>
          <text x="140" y="30" font-size="11">actual +</text><text x="240" y="30" font-size="11">actual -</text>
        </g>
        <g fill="currentColor" font-size="11" text-anchor="end" font-family="Inter, system-ui, sans-serif">
          <text x="84" y="74">pred +</text><text x="84" y="134">pred -</text>
        </g>
      </svg>`,
    tokens_embeddings: `
      <svg viewBox="0 0 460 120" role="img" aria-label="Text is split into tokens, then each token is mapped to an embedding vector of numbers.">
        <defs><marker id="eh" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 z" fill="${BR}"/></marker></defs>
        <g fill="none" stroke="${BR}" stroke-width="1.5">
          ${["learn", "ing"].map((t, i) => `<rect x="${20 + i * 70}" y="46" width="60" height="34" rx="6"/>`).join("")}
          <path d="M160 63 h30" marker-end="url(#eh)"/>
          <rect x="200" y="40" width="240" height="46" rx="8"/>
        </g>
        <g fill="currentColor" font-size="12.5" text-anchor="middle" font-family="Inter, system-ui, sans-serif">
          <text x="50" y="67">learn</text><text x="120" y="67">ing</text>
          <text x="320" y="60" font-family="ui-monospace, monospace" font-size="12">[0.12, -0.4, 0.9, ...]</text>
          <text x="320" y="104" fill="${BR}" font-size="12">embedding vector</text>
        </g>
      </svg>`
  };

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function levelSlug(level) {
    return String(level || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }

  function levelBadge(level) {
    const safe = escapeHtml(level || "Unleveled");
    return `<span class="level-badge level-${levelSlug(level)}">${safe}</span>`;
  }

  function trackHref(id) {
    return `#/track/${encodeURIComponent(id)}`;
  }

  function lessonHref(id) {
    return `#/lesson/${encodeURIComponent(id)}`;
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function storageName(name) {
    return `learn:${name}`;
  }

  function getStorage(name) {
    try {
      return window.localStorage.getItem(storageName(name));
    } catch (error) {
      return null;
    }
  }

  function setStorage(name, value) {
    try {
      window.localStorage.setItem(storageName(name), value);
    } catch (error) {
      // Progress is optional on locked-down browsers.
    }
  }

  function removeStorage(name) {
    try {
      window.localStorage.removeItem(storageName(name));
    } catch (error) {
      // Progress is optional on locked-down browsers.
    }
  }

  function getJsonStorage(name, fallback) {
    const raw = getStorage(name);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function setJsonStorage(name, value) {
    setStorage(name, JSON.stringify(value));
  }

  // ---- Optional Google sign-in (Firebase Auth) + cloud progress sync ----
  // The web config below is PUBLIC and safe to commit; access is gated by
  // Firestore security rules + authorized domains, not by hiding these keys.
  // Paste the config from the Firebase console (Project settings > Your apps).
  // Until then FIREBASE_ENABLED is false and no sign-in UI is shown -- the
  // section works exactly as before, storing progress in this browser only.
  const firebaseConfig = {
    apiKey: "AIzaSyCTCfcSPXE4t0MU7wpVKkENKtqP5dNm4-4",
    authDomain: "blog-and-research.firebaseapp.com",
    projectId: "blog-and-research",
    appId: "1:26234259394:web:e777d0437866819a60b85b"
  };
  const FIREBASE_ENABLED = !!firebaseConfig.apiKey && firebaseConfig.apiKey.indexOf("PASTE") === -1;
  const SYNC_PREFIXES = ["lesson:", "quiz:", "deck:"];
  const SYNC_KEYS = ["last-lesson"];
  let fbAuth = null, fbDb = null, fbUser = null, fbApi = null, cloudTimer = null;

  // Gather the progress-related localStorage entries into a plain object.
  function progressSnapshot() {
    const out = {};
    try {
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const k = window.localStorage.key(i);
        if (!k || k.indexOf("learn:") !== 0) continue;
        const bare = k.slice("learn:".length);
        if (SYNC_PREFIXES.some((p) => bare.indexOf(p) === 0) || SYNC_KEYS.indexOf(bare) !== -1) {
          out[bare] = window.localStorage.getItem(k);
        }
      }
    } catch (error) { /* private mode */ }
    return out;
  }

  // Merge a cloud snapshot into local storage without losing anything:
  // completion is kept if set on either side; quiz keeps the higher score;
  // decks union their seen/got/review; last-lesson stays local (this device).
  function mergeSnapshotIntoLocal(remote) {
    if (!remote) return;
    Object.keys(remote).forEach((bare) => {
      const rval = remote[bare];
      const lkey = "learn:" + bare;
      let lval = null;
      try { lval = window.localStorage.getItem(lkey); } catch (e) { return; }
      if (lval == null) { try { window.localStorage.setItem(lkey, rval); } catch (e) {} return; }
      try {
        if (bare.indexOf("quiz:") === 0) {
          const r = JSON.parse(rval), l = JSON.parse(lval);
          if ((r.percent || 0) > (l.percent || 0)) window.localStorage.setItem(lkey, rval);
        } else if (bare.indexOf("deck:") === 0) {
          const r = JSON.parse(rval), l = JSON.parse(lval);
          window.localStorage.setItem(lkey, JSON.stringify({
            seen: Object.assign({}, r.seen, l.seen),
            got: Object.assign({}, r.got, l.got),
            review: Object.assign({}, r.review, l.review),
            updatedAt: new Date().toISOString()
          }));
        }
        // lesson:*:complete -> presence means done; local already present, keep it.
        // last-lesson -> keep local.
      } catch (e) { /* leave local as-is on parse trouble */ }
    });
  }

  function scheduleCloudSync() {
    if (!fbUser || !fbDb || !fbApi) return;
    if (cloudTimer) clearTimeout(cloudTimer);
    cloudTimer = setTimeout(pushCloud, 1500);
  }

  async function pushCloud() {
    if (!fbUser || !fbDb || !fbApi) return;
    try {
      await fbApi.setDoc(
        fbApi.doc(fbDb, "study_progress", fbUser.uid),
        { progress: progressSnapshot(), updatedAt: fbApi.serverTimestamp() },
        { merge: true }
      );
    } catch (error) { /* offline or rules; local copy is still intact */ }
  }

  async function pullMergePush() {
    if (!fbUser || !fbDb || !fbApi) return;
    try {
      const snap = await fbApi.getDoc(fbApi.doc(fbDb, "study_progress", fbUser.uid));
      if (snap.exists()) mergeSnapshotIntoLocal((snap.data() || {}).progress || {});
    } catch (error) { /* offline; keep local */ }
    await pushCloud();
    renderRoute();
  }

  function renderAuthUI() {
    const slot = document.getElementById("nav-auth");
    if (!slot) return;
    if (!FIREBASE_ENABLED) { slot.innerHTML = ""; return; }
    if (!fbUser) {
      slot.innerHTML = `<button class="nav-signin" type="button" data-auth="in">Sign in</button>`;
    } else {
      const full = (fbUser.displayName || fbUser.email || "Account").trim();
      const name = escapeHtml(full.split(" ")[0]);
      const initial = escapeHtml(full.charAt(0).toUpperCase() || "?");
      slot.innerHTML = `<span class="nav-account">`
        + `<span class="nav-avatar" aria-hidden="true">${initial}</span>`
        + `<span class="nav-account-name" title="${escapeHtml(fbUser.email || "")}">${name}</span>`
        + `<button class="nav-signout" type="button" data-auth="out">Sign out</button>`
        + `</span>`;
    }
  }

  async function initAuth() {
    renderAuthUI();
    if (!FIREBASE_ENABLED) return;
    try {
      const V = "10.12.2";
      const [appMod, authMod, dbMod] = await Promise.all([
        import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
        import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`),
        import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`)
      ]);
      const app = appMod.initializeApp(firebaseConfig);
      fbAuth = authMod.getAuth(app);
      fbDb = dbMod.getFirestore(app);
      fbApi = {
        doc: dbMod.doc, getDoc: dbMod.getDoc, setDoc: dbMod.setDoc, serverTimestamp: dbMod.serverTimestamp,
        signIn: () => authMod.signInWithPopup(fbAuth, new authMod.GoogleAuthProvider()),
        signOut: () => authMod.signOut(fbAuth)
      };
      authMod.onAuthStateChanged(fbAuth, function (user) {
        fbUser = user || null;
        renderAuthUI();
        if (fbUser) pullMergePush();
      });
    } catch (error) {
      console.warn("Sign-in unavailable:", error);
      const slot = document.getElementById("nav-auth");
      if (slot) slot.innerHTML = "";
    }
  }

  document.addEventListener("click", function (event) {
    const btn = event.target.closest("[data-auth]");
    if (!btn || !fbApi) return;
    if (btn.dataset.auth === "in") fbApi.signIn().catch((e) => console.warn("sign-in:", e));
    else fbApi.signOut().catch(() => {});
  });

  function isLessonComplete(id) {
    return getStorage(`lesson:${id}:complete`) !== null;
  }

  function setLessonComplete(id, complete) {
    if (complete) {
      setStorage(`lesson:${id}:complete`, new Date().toISOString());
    } else {
      removeStorage(`lesson:${id}:complete`);
    }
    scheduleCloudSync();
  }

  function getQuizBest(id) {
    return getJsonStorage(`quiz:${id}:best`, null);
  }

  function saveQuizBest(id, correct, total) {
    const next = {
      correct,
      total,
      percent: total ? Math.round((correct / total) * 100) : 0,
      updatedAt: new Date().toISOString()
    };
    const previous = getQuizBest(id);
    if (!previous || next.percent >= previous.percent) {
      setJsonStorage(`quiz:${id}:best`, next);
      scheduleCloudSync();
    }
  }

  function getDeckProgress(id) {
    const stored = getJsonStorage(`deck:${id}:progress`, {});
    return {
      seen: stored.seen || {},
      got: stored.got || {},
      review: stored.review || {},
      updatedAt: stored.updatedAt || null
    };
  }

  function saveDeckProgress(id, progress) {
    setJsonStorage(`deck:${id}:progress`, {
      seen: progress.seen || {},
      got: progress.got || {},
      review: progress.review || {},
      updatedAt: new Date().toISOString()
    });
    scheduleCloudSync();
  }

  async function fetchJson(path) {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Could not load ${path}: ${response.status}`);
    }
    return response.json();
  }

  async function loadData() {
    const tracks = await fetchJson("./data/tracks.json");
    tracks.sort((left, right) => left.order - right.order);

    const [links, prereqs, lessonGroups] = await Promise.all([
      fetchJson("./data/links.json"),
      fetchJson("./data/prereqs.json"),
      Promise.all(tracks.map(async function (track) {
        const lessons = await fetchJson(`./data/lessons/${encodeURIComponent(track.id)}.json`);
        const order = new Map(track.lessons.map((id, index) => [id, index]));
        lessons.sort((left, right) => (order.get(left.id) ?? 999) - (order.get(right.id) ?? 999));
        return { trackId: track.id, lessons };
      }))
    ]);

    state.tracks = tracks;
    state.prereqs = prereqs;
    state.lessons = lessonGroups.flatMap((group) => group.lessons);
    state.lessonsById = new Map(state.lessons.map((lesson) => [lesson.id, lesson]));
    state.lessonsByTrack = new Map(lessonGroups.map((group) => [group.trackId, group.lessons]));
    state.links = mergeLinks(links, state.lessons);
    state.labs = await fetchJson("./data/labs.json").catch(function () { return { categories: [], labs: [] }; });
    state.ready = true;
  }

  function mergeLinks(curated, lessons) {
    const merged = curated.map((link) => Object.assign({}, link));
    const seen = new Set(merged.map((link) => link.url));
    lessons.forEach(function (lesson) {
      (lesson.links || []).forEach(function (link) {
        if (link.url && !seen.has(link.url)) {
          seen.add(link.url);
          merged.push(Object.assign({}, link, { track: lesson.track, start_here: false }));
        }
      });
    });
    return merged;
  }

  function getTrack(id) {
    return state.tracks.find((track) => track.id === id) || null;
  }

  function getLesson(id) {
    return state.lessonsById.get(id) || null;
  }

  function getLessonsForTrack(trackId) {
    return state.lessonsByTrack.get(trackId) || [];
  }

  function routeParts() {
    const raw = location.hash.startsWith("#") ? location.hash.slice(1) : "/";
    return (raw || "/")
      .replace(/^\/+|\/+$/g, "")
      .split("/")
      .filter(Boolean)
      .map(decodeURIComponent);
  }

  function replaceApp(markup, title) {
    app.innerHTML = markup;
    document.title = title ? `${title} · Arbiter Machinae` : "Study · Arbiter Machinae";
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    app.focus({ preventScroll: true });
  }

  function renderRoute() {
    if (!state.ready) return;

    const parts = routeParts();
    const section = parts[0] || "";
    const id = parts[1] || "";

    if (!section) {
      renderLanding();
      return;
    }

    if (section === "research") {
      renderResearch();
      return;
    }

    if (section === "labs") {
      renderLabs(id);
      return;
    }

    if (section === "track" && id) {
      renderTrack(id);
      return;
    }

    if (section === "lesson" && id) {
      renderLesson(id);
      return;
    }

    if (section === "resources") {
      renderResources();
      return;
    }

    if (section === "search") {
      renderSearch(id);
      return;
    }

    if (section === "index") {
      renderIndex();
      return;
    }

    if (section === "flashcards") {
      renderFlashcards(id || "mixed");
      return;
    }

    if (section === "quiz") {
      renderQuiz(id || "mixed");
      return;
    }

    renderNotFound();
  }

  function firstLessonHref() {
    const first = state.lessons[0];
    return first ? lessonHref(first.id) : "#/resources";
  }

  function continueTarget() {
    const lastId = getStorage("last-lesson");
    const last = lastId ? getLesson(lastId) : null;
    const firstIncomplete = state.lessons.find((lesson) => !isLessonComplete(lesson.id)) || null;
    if (last && !isLessonComplete(last.id)) return { lesson: last, label: "Continue where you left off" };
    if (last && last.next && getLesson(last.next) && !isLessonComplete(last.next)) return { lesson: getLesson(last.next), label: "Up next" };
    if (firstIncomplete) return { lesson: firstIncomplete, label: last ? "Keep going" : "Start here" };
    return null;
  }

  function renderContinueCard() {
    const target = continueTarget();
    if (!target) return "";
    const track = getTrack(target.lesson.track);
    return `
      <a class="continue-card" href="${lessonHref(target.lesson.id)}">
        <span class="continue-label">${escapeHtml(target.label)}</span>
        <span class="continue-title">${escapeHtml(target.lesson.title)}</span>
        <span class="continue-meta">${levelBadge(target.lesson.level)}<span>${escapeHtml(track ? track.title : target.lesson.track)}</span></span>
      </a>`;
  }

  function renderLanding() {
    const trackCards = state.tracks.map(renderTrackCard).join("");
    const legend = levels.map(function (item) {
      return `
        <li class="legend-item">
          ${levelBadge(item.name)}
          <span>${escapeHtml(item.text)}</span>
        </li>
      `;
    }).join("");

    replaceApp(`
      <section class="learn-hero" aria-labelledby="learn-title">
        <p class="eyebrow">Interactive paths through AI work</p>
        <h1 id="learn-title">Study</h1>
        <p class="lead">A compact, level-labeled path through machine learning, agents, vibe coding, honest evaluation, and frontier LLM research, built around short lessons, active checks, and curated source links.</p>
        <form class="hero-search" role="search" aria-label="Search lessons and resources">
          <input type="search" name="q" id="home-search" placeholder="Search lessons and resources" autocomplete="off" aria-label="Search">
          <button class="button" type="submit">Search</button>
        </form>
        <div class="hero-actions">
          <a class="button primary" href="${firstLessonHref()}">Start here</a>
          <a class="button" href="#/index">All lessons</a>
          <a class="button" href="#/resources">Resources</a>
          <a class="button" href="#/flashcards">Flashcards</a>
          <a class="button" href="#/quiz">Quiz</a>
        </div>
      </section>
      ${renderContinueCard()}
      <section class="learn-section" aria-labelledby="level-title">
        <h2 id="level-title">Levels</h2>
        <ul class="level-legend">${legend}</ul>
      </section>
      <section class="learn-section" aria-labelledby="tracks-title">
        <h2 id="tracks-title">Tracks</h2>
        <div class="track-grid">${trackCards}</div>
      </section>
    `, null);

    const searchForm = app.querySelector(".hero-search");
    if (searchForm) {
      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        lastSearch = app.querySelector("#home-search").value.trim();
        location.hash = lastSearch ? `#/search/${encodeURIComponent(lastSearch)}` : "#/search";
      });
    }
  }

  function trackProgress(track) {
    const total = track.lessons.length;
    const complete = track.lessons.filter(isLessonComplete).length;
    return {
      total,
      complete,
      percent: total ? Math.round((complete / total) * 100) : 0
    };
  }

  function renderProgress(progress, label) {
    return `
      <div class="progress-block" aria-label="${escapeHtml(label)}">
        <div class="progress-row">
          <span>${escapeHtml(label)}</span>
          <strong>${progress.complete}/${progress.total}</strong>
        </div>
        <div class="progress-track" aria-hidden="true">
          <span style="width: ${progress.percent}%"></span>
        </div>
      </div>
    `;
  }

  function trackPrereqTitles(trackId) {
    const entry = state.prereqs.find((item) => item.id === trackId);
    if (!entry || !entry.needs || !entry.needs.length) return [];
    return entry.needs.map(function (needId) {
      const track = getTrack(needId);
      return track ? track.title : needId;
    });
  }

  function renderTrackCard(track) {
    const progress = trackProgress(track);
    const pct = progress.percent;
    const lessonWord = track.lessons.length === 1 ? "lesson" : "lessons";
    const prereqTitles = trackPrereqTitles(track.id);
    const prereq = prereqTitles.length
      ? `<p class="tc-prereq">Best after: ${escapeHtml(prereqTitles.join(", "))}</p>`
      : `<p class="tc-prereq tc-prereq--start">A good place to start</p>`;
    const dataState = pct === 0 ? "new" : pct === 100 ? "done" : "partial";
    const cta = pct === 0 ? "Start track" : pct === 100 ? "Review track" : "Continue";
    const verb = pct === 0 ? "Start track" : pct === 100 ? "Review track" : "Continue track";
    const pctText = pct === 100 ? "Complete" : `${pct}%`;
    const aria = `${verb}: ${track.title}. ${track.level_range}. ${track.lessons.length} ${lessonWord}, ${pct} percent complete.`;
    return `
      <a class="track-card" href="${trackHref(track.id)}" data-state="${dataState}" style="--pct:${pct}%;" aria-label="${escapeHtml(aria)}">
        <span class="tc-kicker">${escapeHtml(track.level_range)}</span>
        <h3 class="tc-title">${escapeHtml(track.title)}</h3>
        <p class="tc-blurb">${escapeHtml(track.blurb)}</p>
        ${prereq}
        <span class="tc-foot">
          <span class="tc-progress" aria-hidden="true">
            <span class="tc-progress-meta">
              <span class="tc-lessons">${track.lessons.length} ${lessonWord}</span>
              <span class="tc-pct">${pctText}</span>
            </span>
            <span class="tc-bar"><span class="tc-bar-fill"></span></span>
          </span>
          <span class="tc-cta">${cta}</span>
        </span>
      </a>
    `;
  }

  function renderTrack(id) {
    const track = getTrack(id);
    if (!track) {
      renderNotFound(`No track found for ${id}.`);
      return;
    }

    const lessons = getLessonsForTrack(track.id);
    const progress = trackProgress(track);
    const mastery = trackMastery(track);
    const lessonItems = lessons.map(function (lesson, index) {
      const complete = isLessonComplete(lesson.id);
      return `
        <li class="lesson-row">
          <a href="${lessonHref(lesson.id)}">
            <span class="lesson-index">${String(index + 1).padStart(2, "0")}</span>
            <span>
              <strong>${escapeHtml(lesson.title)}</strong>
              <span class="lesson-summary">${escapeHtml(lesson.summary || "")}</span>
            </span>
          </a>
          <div class="lesson-row-meta">
            ${levelBadge(lesson.level)}
            <span class="completion-pill ${complete ? "is-complete" : ""}">${complete ? "Complete" : "Open"}</span>
          </div>
        </li>
      `;
    }).join("");

    replaceApp(`
      <section class="track-header" aria-labelledby="track-title">
        <p class="eyebrow">${escapeHtml(track.level_range)}</p>
        <h1 id="track-title">${escapeHtml(track.title)}</h1>
        <p class="lead">${escapeHtml(track.blurb)}</p>
        ${renderProgress(progress, "Track progress")}
        <div class="mastery-row" aria-label="Track mastery">
          <span class="mastery-chip"><strong>${mastery.complete}/${mastery.total}</strong> lessons complete</span>
          <span class="mastery-chip"><strong>${mastery.quizzed}/${mastery.quizTotal}</strong> quizzes passed</span>
          <span class="mastery-chip ${mastery.complete === mastery.total && mastery.total ? "is-mastered" : ""}">${mastery.complete === mastery.total && mastery.total ? "Track mastered" : "In progress"}</span>
        </div>
      </section>
      <section class="learn-section" aria-labelledby="track-lessons">
        <h2 id="track-lessons">Lessons</h2>
        <ol class="lesson-list">${lessonItems}</ol>
      </section>
    `, track.title);
  }

  function renderLesson(id) {
    const lesson = getLesson(id);
    if (!lesson) {
      renderNotFound(`No lesson found for ${id}.`);
      return;
    }

    setStorage("last-lesson", lesson.id);
    scheduleCloudSync();

    const track = getTrack(lesson.track);
    const keyPoints = Array.isArray(lesson.key_points) && lesson.key_points.length
      ? `
        <section class="learn-section tight" aria-labelledby="key-points-title">
          <h2 id="key-points-title">Key Points</h2>
          <ul class="key-points">
            ${lesson.key_points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
          </ul>
        </section>
      `
      : "";

    const lessonLinks = Array.isArray(lesson.links) && lesson.links.length
      ? `
        <section class="learn-section tight" aria-labelledby="lesson-links-title">
          <h2 id="lesson-links-title">Links</h2>
          ${renderLinkList(lesson.links)}
        </section>
      `
      : "";

    const sourcesSection = Array.isArray(lesson.sources) && lesson.sources.length
      ? `
        <section class="learn-section tight" aria-labelledby="lesson-sources-title">
          <h2 id="lesson-sources-title">Sources</h2>
          <ul class="source-list">
            ${lesson.sources.map(function (src) {
              const link = src.url
                ? `<a href="${escapeHtml(src.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(src.title || src.url)}</a>`
                : escapeHtml(src.title || "");
              return `
                <li class="source-row">
                  <span class="source-claim">${escapeHtml(src.claim || "")}</span>
                  <span class="source-cite">${link}${src.last_verified ? ` <span class="source-date">verified ${escapeHtml(src.last_verified)}</span>` : ""}</span>
                </li>`;
            }).join("")}
          </ul>
        </section>
      `
      : "";

    const prereqLinks = (lesson.prereqs || []).map(getLesson).filter(Boolean);
    const nextLesson = lesson.next ? getLesson(lesson.next) : null;
    const complete = isLessonComplete(lesson.id);

    replaceApp(`
      <article class="lesson-view">
        <header class="lesson-header">
          <a class="back-link" href="${trackHref(lesson.track)}">Back to ${escapeHtml(track ? track.title : "track")}</a>
          <div class="lesson-meta">
            ${levelBadge(lesson.level)}
            <span>${escapeHtml(String(lesson.minutes || 1))} min</span>
          </div>
          <h1>${escapeHtml(lesson.title)}</h1>
          <p class="summary">${escapeHtml(lesson.summary || "")}</p>
          ${lesson.source ? `<p class="source-meta">Source: ${escapeHtml(lesson.source.type)}, ${escapeHtml(lesson.source.date)}, confidence ${escapeHtml(lesson.source.confidence)}${lesson.source.contested ? ", contested" : ""}, last verified ${escapeHtml(lesson.source.last_verified)}</p>` : ""}
        </header>
        <div class="lesson-body">
          ${lesson.body_html || ""}
        </div>
        ${lesson.diagram && diagrams[lesson.diagram] ? `<figure class="lesson-diagram">${diagrams[lesson.diagram]}</figure>` : ""}
        ${keyPoints}
        ${lesson.exercise ? `
          <section class="learn-section tight" aria-labelledby="exercise-title">
            <h2 id="exercise-title">Exercise</h2>
            <div data-exercise></div>
          </section>
        ` : ""}
        ${Array.isArray(lesson.flashcards) && lesson.flashcards.length ? `
          <section class="learn-section tight" aria-labelledby="mini-deck-title">
            <h2 id="mini-deck-title">Flashcards</h2>
            <div data-flashcard-player></div>
          </section>
        ` : ""}
        ${Array.isArray(lesson.quiz) && lesson.quiz.length ? `
          <section class="learn-section tight" aria-labelledby="lesson-quiz-title">
            <h2 id="lesson-quiz-title">Quiz</h2>
            <div data-quiz-player></div>
          </section>
        ` : ""}
        ${lessonLinks}
        ${sourcesSection}
        <section class="lesson-nav learn-section tight" aria-labelledby="lesson-nav-title">
          <h2 id="lesson-nav-title">Path</h2>
          <div class="path-grid">
            <div>
              <h3>Prerequisites</h3>
              ${prereqLinks.length
                ? `<ul>${prereqLinks.map((item) => `<li><a href="${lessonHref(item.id)}">${escapeHtml(item.title)}</a></li>`).join("")}</ul>`
                : "<p>No listed prerequisite.</p>"}
            </div>
            <div>
              <h3>Next</h3>
              ${nextLesson
                ? `<p><a href="${lessonHref(nextLesson.id)}">${escapeHtml(nextLesson.title)}</a></p>`
                : "<p>No next lesson yet.</p>"}
            </div>
          </div>
        </section>
        <section class="completion-panel" aria-labelledby="complete-title">
          <div>
            <h2 id="complete-title">Completion</h2>
            <p>${complete ? "This lesson is marked complete." : "Mark this lesson complete when you have checked the exercise and quiz."}</p>
          </div>
          <button class="button primary" id="complete-toggle" type="button" aria-pressed="${complete ? "true" : "false"}">
            ${complete ? "Marked complete" : "Mark complete"}
          </button>
        </section>
      </article>
    `, lesson.title);

    if (lesson.exercise) {
      mountExercise(app.querySelector("[data-exercise]"), lesson.exercise);
    }
    if (Array.isArray(lesson.flashcards) && lesson.flashcards.length) {
      mountFlashcardPlayer(app.querySelector("[data-flashcard-player]"), `lesson:${lesson.id}`, makeLessonDeck(lesson));
    }
    if (Array.isArray(lesson.quiz) && lesson.quiz.length) {
      mountQuizPlayer(app.querySelector("[data-quiz-player]"), `lesson:${lesson.id}`, makeLessonQuiz(lesson));
    }

    app.querySelector("#complete-toggle").addEventListener("click", function () {
      setLessonComplete(lesson.id, !isLessonComplete(lesson.id));
      renderLesson(lesson.id);
    });
  }

  function makeLessonDeck(lesson) {
    return (lesson.flashcards || []).map(function (card, index) {
      return {
        id: `${lesson.id}:card:${index}`,
        front: card.front,
        back: card.back,
        lessonTitle: lesson.title,
        track: lesson.track,
        level: lesson.level
      };
    });
  }

  function makeLessonQuiz(lesson) {
    return (lesson.quiz || []).map(function (question, index) {
      return {
        ...question,
        id: `${lesson.id}:quiz:${index}`,
        lessonTitle: lesson.title,
        track: lesson.track
      };
    });
  }

  function sampleSpread(items, count) {
    if (items.length <= count) return items;
    const stride = items.length / count;
    const out = [];
    for (let i = 0; i < count; i += 1) {
      out.push(items[Math.floor(i * stride)]);
    }
    return out;
  }

  function getDeck(trackId) {
    const lessons = trackId === "mixed"
      ? state.lessons
      : getLessonsForTrack(trackId);
    const all = lessons.flatMap(makeLessonDeck);
    return trackId === "mixed" ? sampleSpread(all, 24) : all;
  }

  function getQuiz(trackId) {
    const lessons = trackId === "mixed"
      ? state.lessons
      : getLessonsForTrack(trackId);
    const all = lessons.flatMap(makeLessonQuiz);
    return trackId === "mixed" ? sampleSpread(all, 20) : all;
  }

  function renderLinkList(links) {
    return `
      <ul class="resource-list">
        ${links.map(function (link) {
          return `
            <li class="resource-item">
              <div>
                <div class="resource-title">
                  <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.title)}</a>
                </div>
                <p>${escapeHtml(link.note || "")}</p>
              </div>
              <div class="resource-meta">
                <span>${escapeHtml(link.kind || "link")}</span>
                ${levelBadge(link.level)}
              </div>
            </li>
          `;
        }).join("")}
      </ul>
    `;
  }

  let notesCache = null;

  function renderResearch() {
    replaceApp(`
      <section class="track-header" aria-labelledby="research-title">
        <p class="eyebrow">Research notes</p>
        <h1 id="research-title">Research notes</h1>
        <p class="lead">I build software with AI agents, programs that write and change code largely on their own, using several different AI models. These are working notes on doing that without flying blind: telling whether the AI's work is any good, checking it without spending a fortune, and keeping a system honest when it can change its own rules.</p>
        <p class="research-byline">by <a href="https://github.com/KiwiMaddog2020">Kevin Madson</a></p>
      </section>
      <div id="research-list"><p class="learn-loading">Loading notes...</p></div>
    `, "Research notes");

    const host = app.querySelector("#research-list");
    if (!host) return;
    const fill = function (notes) {
      if (!notes || !notes.length) {
        host.innerHTML = `<p class="empty-state">No notes yet.</p>`;
        return;
      }
      const items = notes.map(function (note) {
        const title = escapeHtml(note.title || "");
        return `<li><a class="note-title" href="${escapeHtml(note.url || "#")}">${title}</a>`
          + `<a class="note-code" href="${escapeHtml(note.code || "#")}" aria-label="Code repository: ${title}">code</a></li>`;
      }).join("");
      host.innerHTML = `<div class="notes-list"><ul role="list">${items}</ul></div>`
        + `<p class="research-foot">Each note is published from the project it describes, so the write-up and the code you can run sit at the same address. The list rebuilds from public repositories tagged <code>research-note</code>; the <a href="/feed.xml">Atom feed</a> carries the same entries.</p>`;
    };
    if (notesCache) {
      fill(notesCache);
    } else {
      fetchJson("./data/notes.json").then(function (notes) {
        notesCache = notes;
        fill(notes);
      }).catch(function () {
        host.innerHTML = `<p class="empty-state">Couldn't load the notes list right now.</p>`;
      });
    }
  }

  function renderResources() {
    const trackOptions = state.tracks.map((track) => `<option value="${escapeHtml(track.id)}">${escapeHtml(track.title)}</option>`).join("");
    const levelOptions = levels.map((item) => `<option value="${escapeHtml(item.name)}">${escapeHtml(item.name)}</option>`).join("");

    replaceApp(`
      <section class="track-header" aria-labelledby="resources-title">
        <p class="eyebrow">Curated library</p>
        <h1 id="resources-title">Resources</h1>
        <p class="lead">The shortest useful shelf: source links that extend the lessons without turning the center into an encyclopedia.</p>
      </section>
      <form class="filter-bar" aria-label="Resource filters">
        <label>
          <span>Track</span>
          <select id="resource-track">
            <option value="all">All tracks</option>
            ${trackOptions}
          </select>
        </label>
        <label>
          <span>Level</span>
          <select id="resource-level">
            <option value="all">All levels</option>
            ${levelOptions}
          </select>
        </label>
      </form>
      <section class="learn-section tight" aria-labelledby="start-here-title">
        <h2 id="start-here-title">Start Here</h2>
        <div id="start-here-list"></div>
      </section>
      <section class="learn-section tight" aria-labelledby="library-title">
        <h2 id="library-title">Library</h2>
        <div id="resource-results"></div>
      </section>
    `, "Resources");

    const trackSelect = app.querySelector("#resource-track");
    const levelSelect = app.querySelector("#resource-level");
    const update = function () {
      updateResources(trackSelect.value, levelSelect.value);
    };
    trackSelect.addEventListener("change", update);
    levelSelect.addEventListener("change", update);
    update();
  }

  function updateResources(trackId, level) {
    const filtered = state.links.filter(function (link) {
      const trackMatch = trackId === "all" || link.track === trackId;
      const levelMatch = level === "all" || link.level === level;
      return trackMatch && levelMatch;
    });
    const startHere = filtered.filter((link) => link.start_here);
    app.querySelector("#start-here-list").innerHTML = startHere.length
      ? renderLinkList(startHere)
      : `<p class="empty-state">No start-here links for this filter yet.</p>`;
    app.querySelector("#resource-results").innerHTML = filtered.length
      ? renderLinkList(filtered)
      : `<p class="empty-state">No resources match this filter yet.</p>`;
  }

  function stripHtml(html) {
    return String(html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }

  function lessonSearchText(lesson) {
    return [
      lesson.title,
      lesson.summary,
      (lesson.key_points || []).join(" "),
      stripHtml(lesson.body_html),
      lesson.outcome
    ].join(" ").toLowerCase();
  }

  function renderSearch(initialQuery) {
    const startValue = (initialQuery || lastSearch || "").trim();
    replaceApp(`
      <section class="track-header" aria-labelledby="search-title">
        <p class="eyebrow">Find anything</p>
        <h1 id="search-title">Search</h1>
        <p class="lead">Search every lesson and resource by title, idea, or keyword. Try a term like attention, RAG, eval, or temperature.</p>
      </section>
      <form class="filter-bar" role="search" aria-label="Search Study">
        <label class="search-field">
          <span>Search</span>
          <input type="search" id="search-input" autocomplete="off" placeholder="Search lessons and resources">
        </label>
      </form>
      <div id="search-results" aria-live="polite"></div>
    `, "Search");

    const input = app.querySelector("#search-input");
    const results = app.querySelector("#search-results");

    function update() {
      const raw = input.value.trim();
      const query = raw.toLowerCase();
      lastSearch = raw;
      try {
        const hash = raw ? `#/search/${encodeURIComponent(raw)}` : "#/search";
        history.replaceState(null, "", hash);
      } catch (error) {
        // bookmarkable URL is optional
      }
      if (query.length < 2) {
        results.innerHTML = `<p class="empty-state">Type at least two characters to search.</p>`;
        return;
      }
      const lessonHits = state.lessons.filter((lesson) => lessonSearchText(lesson).includes(query));
      const linkHits = state.links.filter(function (link) {
        return `${link.title} ${link.note || ""}`.toLowerCase().includes(query);
      });

      const lessonMarkup = lessonHits.length
        ? `<ul class="search-list">${lessonHits.map(function (lesson) {
            const track = getTrack(lesson.track);
            return `
              <li class="search-row">
                <a href="${lessonHref(lesson.id)}">
                  <span class="search-text">
                    <strong>${escapeHtml(lesson.title)}</strong>
                    <span class="lesson-summary">${escapeHtml(lesson.summary || "")}</span>
                  </span>
                  <span class="search-meta">${levelBadge(lesson.level)}<span>${escapeHtml(track ? track.title : lesson.track)}</span></span>
                </a>
              </li>`;
          }).join("")}</ul>`
        : `<p class="empty-state">No lessons match that search.</p>`;

      const linkMarkup = linkHits.length ? renderLinkList(linkHits) : `<p class="empty-state">No resources match that search.</p>`;

      results.innerHTML = `
        <section class="learn-section tight" aria-labelledby="search-lessons">
          <h2 id="search-lessons">Lessons <span class="count-chip">${lessonHits.length}</span></h2>
          ${lessonMarkup}
        </section>
        <section class="learn-section tight" aria-labelledby="search-links">
          <h2 id="search-links">Resources <span class="count-chip">${linkHits.length}</span></h2>
          ${linkMarkup}
        </section>
      `;
    }

    input.addEventListener("input", update);
    input.value = startValue;
    input.focus();
    update();
  }

  function quizPassed(lessonId) {
    const best = getQuizBest(`lesson:${lessonId}`);
    return !!(best && best.percent >= 80);
  }

  function trackMastery(track) {
    const ids = track.lessons;
    const complete = ids.filter(isLessonComplete).length;
    const quizzed = ids.filter(quizPassed).length;
    const quizTotal = ids.filter(function (id) {
      const lesson = getLesson(id);
      return lesson && Array.isArray(lesson.quiz) && lesson.quiz.length;
    }).length;
    return { complete, total: ids.length, quizzed, quizTotal };
  }

  function renderIndex() {
    const trackOptions = state.tracks.map((track) => `<option value="${escapeHtml(track.id)}">${escapeHtml(track.title)}</option>`).join("");
    const levelOptions = levels.map((item) => `<option value="${escapeHtml(item.name)}">${escapeHtml(item.name)}</option>`).join("");
    replaceApp(`
      <section class="track-header" aria-labelledby="index-title">
        <p class="eyebrow">Every lesson, one page</p>
        <h1 id="index-title">Lesson Index</h1>
        <p class="lead">All ${state.lessons.length} lessons across ${state.tracks.length} tracks, filterable by track and level. Use this to jump straight to a topic.</p>
      </section>
      <form class="filter-bar" aria-label="Index filters">
        <label><span>Track</span>
          <select id="index-track"><option value="all">All tracks</option>${trackOptions}</select></label>
        <label><span>Level</span>
          <select id="index-level"><option value="all">All levels</option>${levelOptions}</select></label>
        <label class="search-field"><span>Filter</span>
          <input type="search" id="index-filter" autocomplete="off" placeholder="Filter by title"></label>
      </form>
      <div id="index-results" aria-live="polite"></div>
    `, "Lesson Index");

    const trackSelect = app.querySelector("#index-track");
    const levelSelect = app.querySelector("#index-level");
    const filterInput = app.querySelector("#index-filter");

    function update() {
      const trackId = trackSelect.value;
      const level = levelSelect.value;
      const needle = filterInput.value.trim().toLowerCase();
      const groups = state.tracks
        .filter((track) => trackId === "all" || track.id === trackId)
        .map(function (track) {
          const rows = getLessonsForTrack(track.id).filter(function (lesson) {
            const levelMatch = level === "all" || lesson.level === level;
            const textMatch = !needle || `${lesson.title} ${lesson.summary || ""}`.toLowerCase().includes(needle);
            return levelMatch && textMatch;
          });
          return { track, rows };
        })
        .filter((group) => group.rows.length);

      const total = groups.reduce((a, g) => a + g.rows.length, 0);
      app.querySelector("#index-results").innerHTML = total
        ? groups.map(function (group) {
            const items = group.rows.map(function (lesson) {
              const complete = isLessonComplete(lesson.id);
              return `
                <li class="index-row">
                  <a href="${lessonHref(lesson.id)}">
                    <span class="index-text"><strong>${escapeHtml(lesson.title)}</strong>
                      <span class="lesson-summary">${escapeHtml(lesson.summary || "")}</span></span>
                    <span class="index-meta">${levelBadge(lesson.level)}<span class="completion-pill ${complete ? "is-complete" : ""}">${complete ? "Complete" : "Open"}</span></span>
                  </a>
                </li>`;
            }).join("");
            return `
              <section class="learn-section tight" aria-label="${escapeHtml(group.track.title)} lessons">
                <h2><a href="${trackHref(group.track.id)}">${escapeHtml(group.track.title)}</a> <span class="count-chip">${group.rows.length}</span></h2>
                <ol class="index-list">${items}</ol>
              </section>`;
          }).join("")
        : `<p class="empty-state">No lessons match this filter.</p>`;
    }

    trackSelect.addEventListener("change", update);
    levelSelect.addEventListener("change", update);
    filterInput.addEventListener("input", update);
    update();
  }

  function renderFlashcards(trackId) {
    if (trackId !== "mixed" && !getTrack(trackId)) {
      renderNotFound(`No flashcard deck found for ${trackId}.`);
      return;
    }
    const title = trackId === "mixed" ? "Mixed Flashcards" : `${getTrack(trackId).title} Flashcards`;
    const deck = getDeck(trackId);
    replaceApp(`
      <section class="track-header" aria-labelledby="flashcards-title">
        <p class="eyebrow">Recall practice</p>
        <h1 id="flashcards-title">${escapeHtml(title)}</h1>
        <p class="lead">Flip each card, then mark it for review or as known. Progress stays in this browser.</p>
      </section>
      ${renderModeTabs("flashcards", trackId)}
      <section class="learn-section tight" aria-labelledby="deck-title">
        <h2 id="deck-title">Deck</h2>
        <div data-flashcard-player></div>
      </section>
    `, title);
    mountFlashcardPlayer(app.querySelector("[data-flashcard-player]"), `track:${trackId}`, deck);
  }

  function renderQuiz(trackId) {
    if (trackId !== "mixed" && !getTrack(trackId)) {
      renderNotFound(`No quiz found for ${trackId}.`);
      return;
    }
    const title = trackId === "mixed" ? "Mixed Quiz" : `${getTrack(trackId).title} Quiz`;
    const questions = getQuiz(trackId);
    replaceApp(`
      <section class="track-header" aria-labelledby="quiz-title">
        <p class="eyebrow">Check practice</p>
        <h1 id="quiz-title">${escapeHtml(title)}</h1>
        <p class="lead">Answer once for instant feedback, then retry if you want a clean pass.</p>
      </section>
      ${renderModeTabs("quiz", trackId)}
      <section class="learn-section tight" aria-labelledby="quiz-player-title">
        <h2 id="quiz-player-title">Questions</h2>
        <div data-quiz-player></div>
      </section>
    `, title);
    mountQuizPlayer(app.querySelector("[data-quiz-player]"), `track:${trackId}`, questions);
  }

  function renderModeTabs(kind, activeTrackId) {
    const mixedHref = `#/${kind}/mixed`;
    const tabs = [
      `<a href="${mixedHref}" class="${activeTrackId === "mixed" ? "is-active" : ""}">Mixed <span>${kind === "quiz" ? getQuiz("mixed").length : getDeck("mixed").length}</span></a>`
    ].concat(state.tracks.map(function (track) {
      const count = kind === "quiz" ? getQuiz(track.id).length : getDeck(track.id).length;
      return `<a href="#/${kind}/${encodeURIComponent(track.id)}" class="${activeTrackId === track.id ? "is-active" : ""}">${escapeHtml(track.title)} <span>${count}</span></a>`;
    }));
    return `<nav class="mode-tabs" aria-label="${kind === "quiz" ? "Quiz decks" : "Flashcard decks"}">${tabs.join("")}</nav>`;
  }

  function mountFlashcardPlayer(container, deckId, cards) {
    const progress = getDeckProgress(deckId);
    function buildQueue() {
      return cards.map((_, index) => index).filter((index) => !progress.got[cards[index].id]);
    }
    let queue = shuffle(buildQueue());
    let pos = 0;
    let flipped = false;
    let message = "";

    function knownCount() {
      return cards.filter((card) => progress.got[card.id]).length;
    }

    function render() {
      if (!cards.length) {
        container.innerHTML = `<p class="empty-state">No flashcards in this deck yet.</p>`;
        return;
      }
      if (!queue.length || pos >= queue.length) {
        const known = knownCount();
        container.innerHTML = `
          <div class="deck-status">
            <span>Deck complete</span>
            <span>${known}/${cards.length} known</span>
          </div>
          <div class="deck-complete">
            <p class="feedback-line good">You have cleared every card in this deck. Nice work.</p>
            <div class="card-actions">
              <button class="button" type="button" data-card-action="restart">Review all again</button>
              ${known ? `<button class="button" type="button" data-card-action="reset">Reset progress</button>` : ""}
            </div>
          </div>
        `;
        return;
      }

      const card = cards[queue[pos]];
      const side = flipped ? card.back : card.front;
      container.innerHTML = `
        <div class="deck-status">
          <span>Card ${pos + 1} of ${queue.length}</span>
          <span>${knownCount()}/${cards.length} known</span>
        </div>
        <button class="flashcard ${flipped ? "is-flipped" : ""}" type="button" aria-pressed="${flipped ? "true" : "false"}">
          <span class="flashcard-label">${flipped ? "Back" : "Front"}</span>
          <span class="flashcard-face">${escapeHtml(side)}</span>
          <span class="flashcard-source">${escapeHtml(card.lessonTitle || "")}</span>
        </button>
        <div class="card-actions">
          <button class="button" type="button" data-card-action="flip">${flipped ? "Show front" : "Show back"}</button>
          <button class="button" type="button" data-card-action="review" ${flipped ? "" : "disabled"}>Review again</button>
          <button class="button primary" type="button" data-card-action="got" ${flipped ? "" : "disabled"}>Got it</button>
          <button class="button" type="button" data-card-action="shuffle">Shuffle</button>
        </div>
        <p class="feedback-line" role="status">${escapeHtml(message)}</p>
      `;
    }

    container.addEventListener("click", function (event) {
      const cardButton = event.target.closest(".flashcard");
      const actionButton = event.target.closest("[data-card-action]");
      if (cardButton && !actionButton) {
        flipped = !flipped;
        message = "";
        render();
        return;
      }
      if (!actionButton) return;

      const action = actionButton.dataset.cardAction;
      if (action === "restart") {
        queue = cards.map((_, index) => index);
        pos = 0;
        flipped = false;
        message = "Reviewing the full deck.";
      }
      if (action === "reset") {
        cards.forEach(function (card) {
          delete progress.got[card.id];
          delete progress.review[card.id];
          delete progress.seen[card.id];
        });
        saveDeckProgress(deckId, progress);
        queue = buildQueue();
        pos = 0;
        flipped = false;
        message = "Progress reset.";
      }
      if (action === "flip") {
        flipped = !flipped;
        message = "";
      }
      if (action === "shuffle") {
        queue = shuffle(queue);
        pos = 0;
        flipped = false;
        message = "Deck shuffled.";
      }
      if ((action === "got" || action === "review") && flipped) {
        const card = cards[queue[pos]];
        progress.seen[card.id] = true;
        if (action === "got") {
          progress.got[card.id] = true;
          delete progress.review[card.id];
          message = "Marked as known.";
          queue.splice(pos, 1);
        } else {
          progress.review[card.id] = (progress.review[card.id] || 0) + 1;
          delete progress.got[card.id];
          message = "Queued for review.";
          const moved = queue.splice(pos, 1)[0];
          queue.push(moved);
        }
        saveDeckProgress(deckId, progress);
        flipped = false;
        if (pos >= queue.length) pos = 0;
      }
      render();
    });

    render();
  }

  function shuffle(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const pick = Math.floor(Math.random() * (index + 1));
      const temp = copy[index];
      copy[index] = copy[pick];
      copy[pick] = temp;
    }
    return copy;
  }

  function mountQuizPlayer(container, quizId, questions) {
    let selected = new Map();
    let answered = new Map();

    function score() {
      return Array.from(answered.values()).filter(Boolean).length;
    }

    function render() {
      if (!questions.length) {
        container.innerHTML = `<p class="empty-state">No quiz questions in this set yet.</p>`;
        return;
      }

      const best = getQuizBest(quizId);
      const questionMarkup = questions.map(function (question, qIndex) {
        const hasAnswer = answered.has(qIndex);
        const selectedChoice = selected.get(qIndex);
        const options = question.choices.map(function (choice, cIndex) {
          const isSelected = selectedChoice === cIndex;
          const isCorrect = question.answer === cIndex;
          const resultClass = hasAnswer && isSelected
            ? (isCorrect ? "is-correct" : "is-incorrect")
            : (hasAnswer && isCorrect ? "is-answer" : "");
          return `
            <button class="option-button ${resultClass}" type="button" data-question="${qIndex}" data-choice="${cIndex}" ${hasAnswer ? "disabled" : ""}>
              ${escapeHtml(choice)}
            </button>
          `;
        }).join("");

        return `
          <article class="quiz-question">
            <div class="question-meta">
              ${levelBadge(question.level)}
              <span>${escapeHtml(question.lessonTitle || "")}</span>
            </div>
            <h3>${escapeHtml(question.q)}</h3>
            <div class="option-grid">${options}</div>
            ${hasAnswer ? `<p class="feedback-line ${answered.get(qIndex) ? "good" : "bad"}">${answered.get(qIndex) ? "Correct." : "Not quite."} ${escapeHtml(question.explain || "")}</p>` : ""}
            ${hasAnswer && !answered.get(qIndex) ? `<button class="button" type="button" data-q-retry="${qIndex}">Try this again</button>` : ""}
          </article>
        `;
      }).join("");

      container.innerHTML = `
        <div class="quiz-status">
          <span>Score ${score()}/${questions.length}</span>
          <span>${best ? `Best ${best.correct}/${best.total} (${best.percent}%)` : "No best score yet"}</span>
          <button class="button" type="button" data-quiz-retry>Reset all</button>
        </div>
        <div class="quiz-list">${questionMarkup}</div>
      `;
    }

    container.addEventListener("click", function (event) {
      const qRetry = event.target.closest("[data-q-retry]");
      if (qRetry) {
        const qi = Number(qRetry.dataset.qRetry);
        selected.delete(qi);
        answered.delete(qi);
        render();
        return;
      }
      const retry = event.target.closest("[data-quiz-retry]");
      if (retry) {
        selected = new Map();
        answered = new Map();
        render();
        return;
      }

      const option = event.target.closest("[data-question]");
      if (!option) return;

      const qIndex = Number(option.dataset.question);
      const cIndex = Number(option.dataset.choice);
      if (answered.has(qIndex)) return;

      selected.set(qIndex, cIndex);
      answered.set(qIndex, questions[qIndex].answer === cIndex);
      if (answered.size === questions.length) {
        saveQuizBest(quizId, score(), questions.length);
        if (score() === questions.length && quizId.indexOf("lesson:") === 0) {
          setLessonComplete(quizId.slice("lesson:".length), true);
        }
      }
      render();
    });

    render();
  }

  function mountExercise(container, exercise) {
    if (!container || !exercise) return;
    if (exercise.type === "spot_the_bug") {
      mountSpotTheBug(container, exercise);
      return;
    }
    if (exercise.type === "agent_trace") {
      mountAgentTrace(container, exercise);
      return;
    }
    if (exercise.type === "predict_output" || exercise.type === "prompt_repair") {
      mountChoiceExercise(container, exercise);
      return;
    }
    if (exercise.type === "metric_lab") {
      mountMetricLab(container, exercise);
      return;
    }
    if (exercise.type === "sampling_lab") {
      mountSamplingLab(container, exercise);
      return;
    }
    if (exercise.type === "ordering") {
      mountOrdering(container, exercise);
      return;
    }
    if (exercise.type === "bootstrap_lab") {
      mountBootstrapLab(container, exercise);
      return;
    }
    if (exercise.type === "roc_lab") {
      mountRocLab(container, exercise);
      return;
    }
    if (exercise.type === "rag_sandbox") {
      mountRagSandbox(container, exercise);
      return;
    }
    if (exercise.type === "context_budget") {
      mountContextBudget(container, exercise);
      return;
    }
    if (exercise.type === "capstone") {
      mountCapstone(container, exercise);
      return;
    }
    if (exercise.type === "tokenizer_lab") {
      mountTokenizerLab(container, exercise);
      return;
    }
    if (exercise.type === "attention_lab") {
      mountAttentionLab(container, exercise);
      return;
    }
    if (exercise.type === "injection_lab") {
      mountInjectionLab(container, exercise);
      return;
    }
    if (exercise.type === "embedding_lab") {
      mountEmbeddingLab(container, exercise);
      return;
    }
    if (exercise.type === "gradient_descent_lab") {
      mountGradientDescentLab(container, exercise);
      return;
    }
    if (exercise.type === "neural_net_lab") {
      mountNeuralNetLab(container, exercise);
      return;
    }
    container.innerHTML = `<p class="empty-state">Unknown exercise type: ${escapeHtml(exercise.type)}</p>`;
  }

  function mountMetricLab(container, exercise) {
    const fields = exercise.fields.map((f) => Object.assign({}, f));
    let checked = false;

    function vals() {
      const m = {};
      fields.forEach((f) => { m[f.key] = Math.max(0, Number(f.value) || 0); });
      return m;
    }
    function metrics() {
      const v = vals();
      const recall = (v.tp + v.fn) ? v.tp / (v.tp + v.fn) : 0;
      const far = (v.fp + v.tn) ? v.fp / (v.fp + v.tn) : 0;
      const precision = (v.tp + v.fp) ? v.tp / (v.tp + v.fp) : 0;
      return { recall, far, precision, discrimination: recall - far };
    }
    function fmt(x) { return (Math.round(x * 100) / 100).toFixed(2); }

    function render() {
      const m = metrics();
      const target = exercise.target || {};
      const hit = target.metric ? (m[target.metric] >= (target.min != null ? target.min : -Infinity) && m[target.metric] <= (target.max != null ? target.max : Infinity)) : false;
      container.innerHTML = `
        <div class="exercise-card metric-lab">
          <p>${escapeHtml(exercise.prompt)}</p>
          <div class="metric-inputs">
            ${fields.map(function (f) {
              return `
                <label>
                  <span>${escapeHtml(f.label)}</span>
                  <input type="number" min="0" step="1" data-key="${escapeHtml(f.key)}" value="${Number(f.value) || 0}">
                </label>`;
            }).join("")}
          </div>
          <dl class="metric-readout">
            <div><dt>Catch rate (recall)</dt><dd>${fmt(m.recall)}</dd></div>
            <div><dt>False alarm rate</dt><dd>${fmt(m.far)}</dd></div>
            <div><dt>Precision</dt><dd>${fmt(m.precision)}</dd></div>
            <div class="metric-headline"><dt>Discrimination</dt><dd>${fmt(m.discrimination)}</dd></div>
          </dl>
          ${exercise.question ? `<p class="metric-task">${escapeHtml(exercise.question)}</p>` : ""}
          ${exercise.target ? `<button class="button primary" type="button" data-metric-check>Check</button>` : ""}
          ${checked ? `<p class="feedback-line ${hit ? "good" : "bad"}">${hit ? "Target met." : "Not yet."} ${escapeHtml(exercise.explain || "")}</p>` : ""}
        </div>`;
    }

    container.addEventListener("input", function (event) {
      const input = event.target.closest("[data-key]");
      if (!input) return;
      const f = fields.find((x) => x.key === input.dataset.key);
      if (f) { f.value = input.value; }
      if (checked) {
        checked = false;
        const stale = container.querySelector(".feedback-line");
        if (stale) stale.remove();
      }
      // live update readout without losing focus: update only the readout + headline
      const m = metrics();
      const ro = container.querySelector(".metric-readout");
      if (ro) {
        const dds = ro.querySelectorAll("dd");
        if (dds.length === 4) {
          dds[0].textContent = fmt(m.recall);
          dds[1].textContent = fmt(m.far);
          dds[2].textContent = fmt(m.precision);
          dds[3].textContent = fmt(m.discrimination);
        }
      }
    });
    container.addEventListener("click", function (event) {
      if (!event.target.closest("[data-metric-check]")) return;
      checked = true;
      render();
    });

    render();
  }

  function mountSamplingLab(container, exercise) {
    let temp = exercise.start != null ? exercise.start : 1.0;
    const tokens = exercise.tokens || [];

    function softmax(t) {
      const scaled = tokens.map((tk) => (Number(tk.logit) || 0) / Math.max(0.05, t));
      const max = Math.max.apply(null, scaled);
      const exps = scaled.map((s) => Math.exp(s - max));
      const sum = exps.reduce((a, b) => a + b, 0) || 1;
      return exps.map((e) => e / sum);
    }

    function renderBars() {
      const probs = softmax(temp);
      const barsHost = container.querySelector(".sampling-bars");
      if (!barsHost) return;
      barsHost.innerHTML = tokens.map(function (tk, i) {
        const pct = Math.round(probs[i] * 100);
        return `
          <div class="sampling-row">
            <span class="sampling-label">${escapeHtml(tk.label)}</span>
            <span class="sampling-bar"><span style="width:${Math.max(1, pct)}%"></span></span>
            <span class="sampling-pct">${pct}%</span>
          </div>`;
      }).join("");
      const out = container.querySelector(".sampling-temp-val");
      if (out) out.textContent = temp.toFixed(2);
    }

    container.innerHTML = `
      <div class="exercise-card sampling-lab">
        <p>${escapeHtml(exercise.prompt)}</p>
        <label class="sampling-control">
          <span>Temperature <strong class="sampling-temp-val">${temp.toFixed(2)}</strong></span>
          <input type="range" min="0.1" max="2" step="0.05" value="${temp}" data-sampling-temp aria-label="Temperature">
        </label>
        <div class="sampling-bars" aria-live="polite"></div>
        ${exercise.question ? `<p class="metric-task">${escapeHtml(exercise.question)}</p>` : ""}
        ${exercise.explain ? `<p class="feedback-line">${escapeHtml(exercise.explain)}</p>` : ""}
      </div>`;

    container.addEventListener("input", function (event) {
      const slider = event.target.closest("[data-sampling-temp]");
      if (!slider) return;
      temp = Number(slider.value);
      renderBars();
    });
    renderBars();
  }

  function mountOrdering(container, exercise) {
    const correct = exercise.items.slice();
    let order = shuffle(correct.map((_, i) => i));
    // avoid starting already-correct
    if (order.every((v, i) => v === i) && order.length > 1) {
      order.push(order.shift());
    }
    let checked = false;
    let allRight = false;

    function render() {
      allRight = order.every((v, i) => v === i);
      container.innerHTML = `
        <div class="exercise-card ordering">
          <p>${escapeHtml(exercise.prompt)}</p>
          <ol class="ordering-list">
            ${order.map(function (itemIndex, pos) {
              const rowClass = checked ? (itemIndex === pos ? "is-answer" : "is-incorrect") : "";
              return `
                <li class="ordering-row ${rowClass}">
                  <span class="ordering-controls">
                    <button class="button ordering-move" type="button" data-move="up" data-pos="${pos}" ${pos === 0 ? "disabled" : ""} aria-label="Move up">^</button>
                    <button class="button ordering-move" type="button" data-move="down" data-pos="${pos}" ${pos === order.length - 1 ? "disabled" : ""} aria-label="Move down">v</button>
                  </span>
                  <span class="ordering-text">${escapeHtml(exercise.items[itemIndex])}</span>
                </li>`;
            }).join("")}
          </ol>
          <button class="button primary" type="button" data-ordering-check>Check order</button>
          ${checked ? `<p class="feedback-line ${allRight ? "good" : "bad"}">${allRight ? "Correct order." : "Not quite, keep adjusting."} ${escapeHtml(exercise.explain || "")}</p>` : ""}
        </div>`;
    }

    container.addEventListener("click", function (event) {
      const move = event.target.closest("[data-move]");
      if (move) {
        const pos = Number(move.dataset.pos);
        const dir = move.dataset.move === "up" ? -1 : 1;
        const swap = pos + dir;
        if (swap < 0 || swap >= order.length) return;
        const tmp = order[pos]; order[pos] = order[swap]; order[swap] = tmp;
        checked = false;
        render();
        return;
      }
      if (event.target.closest("[data-ordering-check]")) {
        checked = true;
        render();
      }
    });

    render();
  }

  function mean(xs) {
    return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
  }

  function drawWithReplacement(pool, n) {
    const out = [];
    for (let i = 0; i < n; i += 1) {
      out.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return out;
  }

  function mountBootstrapLab(container, exercise) {
    const pool = (exercise.scores || []).map(Number).filter((x) => !Number.isNaN(x));
    let n = exercise.start_n || Math.min(20, pool.length || 20);
    let resamples = exercise.start_resamples || 1000;
    let result = null;

    function run() {
      if (!pool.length) { result = null; return; }
      const sample = drawWithReplacement(pool, n);
      const observed = mean(sample);
      const means = [];
      for (let b = 0; b < resamples; b += 1) {
        means.push(mean(drawWithReplacement(sample, n)));
      }
      means.sort((a, b) => a - b);
      const lo = means[Math.max(0, Math.floor(0.025 * resamples))];
      const hi = means[Math.min(resamples - 1, Math.floor(0.975 * resamples))];
      // histogram over 18 bins between min and max of means
      const min = means[0];
      const max = means[means.length - 1];
      const span = max - min || 1;
      const binCount = 18;
      const bins = new Array(binCount).fill(0);
      means.forEach(function (m) {
        const idx = Math.min(binCount - 1, Math.floor(((m - min) / span) * binCount));
        bins[idx] += 1;
      });
      result = { observed, lo, hi, bins, min, max, width: hi - lo };
    }

    function fmt(x) { return (Math.round(x * 1000) / 1000).toFixed(3); }

    function render() {
      const peak = result ? Math.max.apply(null, result.bins) || 1 : 1;
      const histo = result ? result.bins.map(function (count) {
        const h = Math.round((count / peak) * 100);
        return `<span class="histo-bar" style="height:${Math.max(2, h)}%" title="${count}"></span>`;
      }).join("") : "";
      container.innerHTML = `
        <div class="exercise-card bootstrap-lab">
          <p>${escapeHtml(exercise.prompt)}</p>
          <div class="lab-controls">
            <label>
              <span>Eval items sampled (n) <strong>${n}</strong></span>
              <input type="range" min="5" max="120" step="1" value="${n}" data-boot-n aria-label="Sample size n">
            </label>
            <div class="boot-resamples" role="group" aria-label="Number of resamples">
              <span>Resamples</span>
              ${[200, 1000, 5000].map((r) => `<button class="button ${r === resamples ? "is-active" : ""}" type="button" data-boot-resamples="${r}">${r}</button>`).join("")}
            </div>
            <button class="button primary" type="button" data-boot-run>Resample</button>
          </div>
          ${result ? `
            <div class="boot-readout">
              <div><dt>Observed mean</dt><dd>${fmt(result.observed)}</dd></div>
              <div class="metric-headline"><dt>95% interval</dt><dd>${fmt(result.lo)} to ${fmt(result.hi)}</dd></div>
              <div><dt>Interval width</dt><dd>${fmt(result.width)}</dd></div>
            </div>
            <div class="histo" aria-hidden="true">${histo}</div>
            <p class="histo-axis"><span>${fmt(result.min)}</span><span>distribution of the resampled mean</span><span>${fmt(result.max)}</span></p>
          ` : `<p class="empty-state">Press Resample to bootstrap the mean.</p>`}
          ${exercise.question ? `<p class="metric-task">${escapeHtml(exercise.question)}</p>` : ""}
          ${exercise.explain ? `<p class="feedback-line">${escapeHtml(exercise.explain)}</p>` : ""}
        </div>`;
    }

    container.addEventListener("input", function (event) {
      const slider = event.target.closest("[data-boot-n]");
      if (!slider) return;
      n = Number(slider.value);
      const span = container.querySelector(".lab-controls label span strong");
      if (span) span.textContent = n;
    });
    container.addEventListener("click", function (event) {
      const pick = event.target.closest("[data-boot-resamples]");
      if (pick) {
        resamples = Number(pick.dataset.bootResamples);
        run();
        render();
        return;
      }
      if (event.target.closest("[data-boot-run]")) {
        run();
        render();
      }
    });

    run();
    render();
  }

  function mountRocLab(container, exercise) {
    const examples = (exercise.examples || []).map((e) => ({ score: Number(e.score), label: Number(e.label) ? 1 : 0 }));
    let threshold = exercise.start != null ? exercise.start : 0.5;

    function confusion(t) {
      let tp = 0, fp = 0, fn = 0, tn = 0;
      examples.forEach(function (e) {
        const pred = e.score >= t ? 1 : 0;
        if (pred === 1 && e.label === 1) tp += 1;
        else if (pred === 1 && e.label === 0) fp += 1;
        else if (pred === 0 && e.label === 1) fn += 1;
        else tn += 1;
      });
      const tpr = (tp + fn) ? tp / (tp + fn) : 0;
      const fpr = (fp + tn) ? fp / (fp + tn) : 0;
      const precision = (tp + fp) ? tp / (tp + fp) : 0;
      return { tp, fp, fn, tn, tpr, fpr, precision, recall: tpr };
    }

    // Static ROC curve: sweep thresholds from above-max down to 0.
    const sweep = Array.from(new Set(examples.map((e) => e.score))).sort((a, b) => b - a);
    const rocPoints = [{ fpr: 0, tpr: 0 }];
    sweep.forEach(function (s) {
      const c = confusion(s);
      rocPoints.push({ fpr: c.fpr, tpr: c.tpr });
    });
    rocPoints.push({ fpr: 1, tpr: 1 });
    const PAD = 30, SIZE = 180;
    function px(fpr) { return PAD + fpr * SIZE; }
    function py(tpr) { return PAD + (1 - tpr) * SIZE; }
    const poly = rocPoints.map((p) => `${px(p.fpr).toFixed(1)},${py(p.tpr).toFixed(1)}`).join(" ");

    function fmt(x) { return (Math.round(x * 100) / 100).toFixed(2); }

    function render() {
      const c = confusion(threshold);
      container.innerHTML = `
        <div class="exercise-card roc-lab">
          <p>${escapeHtml(exercise.prompt)}</p>
          <div class="roc-grid">
            <svg class="roc-plot" viewBox="0 0 ${SIZE + PAD * 2} ${SIZE + PAD * 2}" role="img" aria-label="ROC curve with the current operating point.">
              <g stroke="currentColor" stroke-width="1" opacity="0.5" fill="none">
                <line x1="${PAD}" y1="${PAD}" x2="${PAD}" y2="${PAD + SIZE}"/>
                <line x1="${PAD}" y1="${PAD + SIZE}" x2="${PAD + SIZE}" y2="${PAD + SIZE}"/>
                <line x1="${PAD}" y1="${PAD + SIZE}" x2="${PAD + SIZE}" y2="${PAD}" stroke-dasharray="3 3"/>
              </g>
              <polyline points="${poly}" fill="none" stroke="${BR}" stroke-width="2"/>
              <circle cx="${px(c.fpr).toFixed(1)}" cy="${py(c.tpr).toFixed(1)}" r="5" fill="${BR}"/>
              <text x="${PAD}" y="${PAD + SIZE + 18}" font-size="10" fill="currentColor">FPR 0</text>
              <text x="${PAD + SIZE - 18}" y="${PAD + SIZE + 18}" font-size="10" fill="currentColor">1</text>
              <text x="2" y="${PAD + 6}" font-size="10" fill="currentColor">TPR 1</text>
            </svg>
            <dl class="roc-readout">
              <div class="metric-headline"><dt>Threshold</dt><dd class="roc-thr-val">${fmt(threshold)}</dd></div>
              <div><dt>TPR (recall)</dt><dd>${fmt(c.tpr)}</dd></div>
              <div><dt>FPR</dt><dd>${fmt(c.fpr)}</dd></div>
              <div><dt>Precision</dt><dd>${fmt(c.precision)}</dd></div>
              <div><dt>TP / FP / FN / TN</dt><dd>${c.tp} / ${c.fp} / ${c.fn} / ${c.tn}</dd></div>
            </dl>
          </div>
          <label class="sampling-control">
            <span>Decision threshold <strong class="roc-thr-strong">${fmt(threshold)}</strong></span>
            <input type="range" min="0" max="1" step="0.01" value="${threshold}" data-roc-threshold aria-label="Decision threshold">
          </label>
          ${exercise.question ? `<p class="metric-task">${escapeHtml(exercise.question)}</p>` : ""}
          ${exercise.explain ? `<p class="feedback-line">${escapeHtml(exercise.explain)}</p>` : ""}
        </div>`;
    }

    container.addEventListener("input", function (event) {
      const slider = event.target.closest("[data-roc-threshold]");
      if (!slider) return;
      threshold = Number(slider.value);
      render();
      // keep slider focus + value after re-render
      const fresh = container.querySelector("[data-roc-threshold]");
      if (fresh) { fresh.value = threshold; fresh.focus(); }
    });
    render();
  }

  function tokenize(text) {
    return String(text || "").toLowerCase().match(/[a-z0-9]+/g) || [];
  }

  function mountRagSandbox(container, exercise) {
    const corpus = exercise.corpus || [];
    let chunkSize = exercise.start_chunk || 16;
    let topK = exercise.start_k || 2;
    let query = exercise.query || "";
    const stop = new Set(["the", "a", "an", "of", "to", "and", "is", "in", "on", "for", "with", "how", "what", "does", "do", "it", "that", "this"]);

    function buildChunks() {
      const chunks = [];
      corpus.forEach(function (doc) {
        const words = tokenizeKeep(doc.text);
        for (let i = 0; i < words.length; i += chunkSize) {
          chunks.push({ doc: doc.title, text: words.slice(i, i + chunkSize).join(" ") });
        }
      });
      return chunks;
    }
    function tokenizeKeep(text) {
      return String(text || "").trim().split(/\s+/).filter(Boolean);
    }
    function score(chunk) {
      const qTerms = new Set(tokenize(query).filter((t) => !stop.has(t)));
      if (!qTerms.size) return 0;
      const chunkTerms = new Set(tokenize(chunk.text));
      let hits = 0;
      qTerms.forEach((t) => { if (chunkTerms.has(t)) hits += 1; });
      return hits / qTerms.size;
    }

    function render() {
      const chunks = buildChunks().map((c) => Object.assign(c, { s: score(c) }));
      const ranked = chunks.slice().sort((a, b) => b.s - a.s);
      const retrieved = ranked.slice(0, topK);
      const retrievedSet = new Set(retrieved);
      const wordsUsed = retrieved.reduce((a, c) => a + c.text.split(/\s+/).length, 0);
      container.innerHTML = `
        <div class="exercise-card rag-sandbox">
          <p>${escapeHtml(exercise.prompt)}</p>
          <label class="rag-query">
            <span>Query</span>
            <input type="text" value="${escapeHtml(query)}" data-rag-query aria-label="Retrieval query">
          </label>
          <div class="lab-controls">
            <label><span>Chunk size (words) <strong>${chunkSize}</strong></span>
              <input type="range" min="6" max="40" step="2" value="${chunkSize}" data-rag-chunk aria-label="Chunk size"></label>
            <label><span>Top-k retrieved <strong>${topK}</strong></span>
              <input type="range" min="1" max="5" step="1" value="${topK}" data-rag-k aria-label="Top k"></label>
          </div>
          <p class="rag-stat">${chunks.length} chunks total. Retrieving top ${topK}; about ${wordsUsed} words land in the prompt.</p>
          <ul class="rag-chunks">
            ${ranked.map(function (c) {
              const on = retrievedSet.has(c);
              return `<li class="rag-chunk ${on ? "is-retrieved" : ""}">
                <span class="rag-chunk-meta">${escapeHtml(c.doc)} <span class="rag-score">overlap ${(Math.round(c.s * 100) / 100).toFixed(2)}</span>${on ? ' <span class="rag-tag">in prompt</span>' : ""}</span>
                <span class="rag-chunk-text">${escapeHtml(c.text)}</span>
              </li>`;
            }).join("")}
          </ul>
          ${exercise.question ? `<p class="metric-task">${escapeHtml(exercise.question)}</p>` : ""}
          ${exercise.explain ? `<p class="feedback-line">${escapeHtml(exercise.explain)}</p>` : ""}
        </div>`;
    }

    container.addEventListener("input", function (event) {
      if (event.target.closest("[data-rag-chunk]")) { chunkSize = Number(event.target.value); render(); }
      else if (event.target.closest("[data-rag-k]")) { topK = Number(event.target.value); render(); }
      else if (event.target.closest("[data-rag-query]")) {
        query = event.target.value;
        render();
        const fresh = container.querySelector("[data-rag-query]");
        if (fresh) { fresh.value = query; fresh.focus(); fresh.setSelectionRange(query.length, query.length); }
      }
    });
    render();
  }

  function mountContextBudget(container, exercise) {
    const window = exercise.window || 8000;
    const parts = (exercise.parts || []).map((p) => Object.assign({}, p, { value: Number(p.value) || 0 }));
    // priority high->low kept; truncation hits the last entries first
    const priority = exercise.priority || ["output", "system", "retrieved", "history"];

    function allocate() {
      let remaining = window;
      const order = parts.slice().sort((a, b) => priority.indexOf(a.key) - priority.indexOf(b.key));
      const kept = new Map();
      order.forEach(function (p) {
        const give = Math.max(0, Math.min(p.value, remaining));
        kept.set(p.key, give);
        remaining -= give;
      });
      const requested = parts.reduce((a, p) => a + p.value, 0);
      return { kept, remaining, requested, overflow: Math.max(0, requested - window) };
    }

    function render() {
      const a = allocate();
      const segs = parts.map(function (p) {
        const give = a.kept.get(p.key) || 0;
        const pct = (give / window) * 100;
        const truncated = p.value - give;
        return { p, give, pct, truncated };
      });
      const headroomPct = (a.remaining / window) * 100;
      container.innerHTML = `
        <div class="exercise-card context-budget">
          <p>${escapeHtml(exercise.prompt)}</p>
          <div class="lab-controls">
            ${parts.map(function (p) {
              return `<label><span>${escapeHtml(p.label)} <strong>${p.value}</strong></span>
                <input type="range" min="0" max="${p.max || window}" step="${p.step || 100}" value="${p.value}" data-budget-key="${escapeHtml(p.key)}" aria-label="${escapeHtml(p.label)} tokens"></label>`;
            }).join("")}
          </div>
          <div class="budget-bar" aria-hidden="true" title="${window} token window">
            ${segs.map((s) => `<span class="budget-seg budget-${escapeHtml(s.p.key)}" style="width:${s.pct}%" title="${escapeHtml(s.p.label)}: ${s.give}"></span>`).join("")}
            ${a.remaining > 0 ? `<span class="budget-headroom" style="width:${headroomPct}%" title="Headroom: ${a.remaining}"></span>` : ""}
          </div>
          <div class="budget-legend">
            ${segs.map((s) => `<span class="budget-key"><i class="budget-${escapeHtml(s.p.key)}"></i>${escapeHtml(s.p.label)} ${s.give}${s.truncated > 0 ? ` <em>(${s.truncated} truncated)</em>` : ""}</span>`).join("")}
            ${a.remaining > 0 ? `<span class="budget-key"><i class="budget-headroom"></i>Headroom ${a.remaining}</span>` : ""}
          </div>
          <p class="budget-status ${a.overflow > 0 ? "bad" : "good"}">
            ${a.overflow > 0
              ? `Over budget by ${a.overflow} tokens. Lowest-priority context is truncated first to fit the ${window}-token window.`
              : `Fits the ${window}-token window with ${a.remaining} tokens to spare.`}
          </p>
          ${exercise.question ? `<p class="metric-task">${escapeHtml(exercise.question)}</p>` : ""}
          ${exercise.explain ? `<p class="feedback-line">${escapeHtml(exercise.explain)}</p>` : ""}
        </div>`;
    }

    container.addEventListener("input", function (event) {
      const slider = event.target.closest("[data-budget-key]");
      if (!slider) return;
      const p = parts.find((x) => x.key === slider.dataset.budgetKey);
      if (p) p.value = Number(slider.value);
      render();
      const fresh = container.querySelector(`[data-budget-key="${p.key}"]`);
      if (fresh) { fresh.value = p.value; fresh.focus(); }
    });
    render();
  }

  function mountCapstone(container, exercise) {
    const steps = exercise.steps || [];
    let stepIndex = 0;
    let picked = null;
    let answered = false;
    let done = false;

    function render() {
      if (done || !steps.length) {
        container.innerHTML = `
          <div class="exercise-card capstone">
            ${exercise.scenario_html ? `<div class="capstone-scenario">${exercise.scenario_html}</div>` : ""}
            <div class="capstone-done">
              <p class="feedback-line good">Capstone complete. You worked every step.</p>
              ${exercise.outcome ? `<p class="capstone-outcome">${escapeHtml(exercise.outcome)}</p>` : ""}
              <button class="button" type="button" data-capstone-restart>Run it again</button>
            </div>
          </div>`;
        return;
      }
      const step = steps[stepIndex];
      const correct = picked === step.answer;
      const isLast = stepIndex === steps.length - 1;
      container.innerHTML = `
        <div class="exercise-card capstone">
          ${exercise.scenario_html ? `<div class="capstone-scenario">${exercise.scenario_html}</div>` : ""}
          <div class="capstone-progress" aria-label="Capstone progress">
            ${steps.map((_, i) => `<span class="capstone-dot ${i < stepIndex ? "is-done" : ""} ${i === stepIndex ? "is-current" : ""}"></span>`).join("")}
            <span class="capstone-count">Step ${stepIndex + 1} of ${steps.length}</span>
          </div>
          <h3 class="capstone-q">${escapeHtml(step.q)}</h3>
          <div class="option-grid">
            ${step.choices.map(function (choice, index) {
              const selectedClass = answered && picked === index ? (correct ? "is-correct" : "is-incorrect") : "";
              const answerClass = answered && index === step.answer ? "is-answer" : "";
              return `<button class="option-button ${selectedClass} ${answerClass}" type="button" data-capstone-choice="${index}" ${answered && correct ? "disabled" : ""}>${escapeHtml(choice)}</button>`;
            }).join("")}
          </div>
          ${answered ? `<p class="feedback-line ${correct ? "good" : "bad"}">${correct ? "Correct." : "Not quite, try again."} ${escapeHtml(step.explain || "")}</p>` : ""}
          ${answered && correct ? `<button class="button primary" type="button" data-capstone-next>${isLast ? "Finish capstone" : "Next step"}</button>` : ""}
        </div>`;
    }

    container.addEventListener("click", function (event) {
      if (event.target.closest("[data-capstone-restart]")) {
        stepIndex = 0; picked = null; answered = false; done = false; render(); return;
      }
      if (event.target.closest("[data-capstone-next]")) {
        if (stepIndex === steps.length - 1) { done = true; }
        else { stepIndex += 1; picked = null; answered = false; }
        render();
        return;
      }
      const choice = event.target.closest("[data-capstone-choice]");
      if (!choice) return;
      if (answered && picked === steps[stepIndex].answer) return;
      picked = Number(choice.dataset.capstoneChoice);
      answered = true;
      render();
    });

    render();
  }

  function mountSpotTheBug(container, exercise) {
    let answered = false;
    let correct = false;
    let picked = null;

    function render() {
      container.innerHTML = `
        <div class="exercise-card">
          <p>${escapeHtml(exercise.prompt)}</p>
          <div class="code-pick" role="list">
            ${exercise.lines.map(function (line, index) {
              const pickedClass = answered && picked === index
                ? (correct ? "is-correct" : "is-incorrect")
                : "";
              const answerClass = answered && index === exercise.bug_line ? "is-answer" : "";
              return `
                <button class="code-line ${pickedClass} ${answerClass}" type="button" role="listitem" data-line="${index}" ${answered ? "disabled" : ""}>
                  <span class="line-number">${index + 1}</span>
                  <code>${escapeHtml(line || " ")}</code>
                </button>
              `;
            }).join("")}
          </div>
          ${answered ? `<p class="feedback-line ${correct ? "good" : "bad"}">${correct ? "Correct." : "Not quite."} ${escapeHtml(exercise.explain)}</p>` : ""}
        </div>
      `;
    }

    container.addEventListener("click", function (event) {
      const line = event.target.closest("[data-line]");
      if (!line || answered) return;
      picked = Number(line.dataset.line);
      answered = true;
      correct = picked === exercise.bug_line;
      render();
    });

    render();
  }

  function mountChoiceExercise(container, exercise) {
    let answered = false;
    let picked = null;

    function renderIntro() {
      if (exercise.type === "prompt_repair") {
        return `
          <dl class="prompt-repair">
            <div>
              <dt>Weak prompt</dt>
              <dd>${escapeHtml(exercise.weak_prompt)}</dd>
            </div>
            <div>
              <dt>Goal</dt>
              <dd>${escapeHtml(exercise.goal)}</dd>
            </div>
          </dl>
        `;
      }
      return `<p>${escapeHtml(exercise.prompt)}</p>`;
    }

    function render() {
      const correct = picked === exercise.answer;
      container.innerHTML = `
        <div class="exercise-card">
          ${renderIntro()}
          <div class="option-grid">
            ${exercise.choices.map(function (choice, index) {
              const selectedClass = answered && picked === index
                ? (correct ? "is-correct" : "is-incorrect")
                : "";
              const answerClass = answered && index === exercise.answer ? "is-answer" : "";
              return `
                <button class="option-button ${selectedClass} ${answerClass}" type="button" data-choice="${index}" ${answered ? "disabled" : ""}>
                  ${escapeHtml(choice)}
                </button>
              `;
            }).join("")}
          </div>
          ${answered ? `<p class="feedback-line ${correct ? "good" : "bad"}">${correct ? "Correct." : "Not quite."} ${escapeHtml(exercise.explain)}</p>` : ""}
          ${answered && !correct ? `<button class="button" type="button" data-choice-retry>Try again</button>` : ""}
        </div>
      `;
    }

    container.addEventListener("click", function (event) {
      if (event.target.closest("[data-choice-retry]")) {
        answered = false;
        picked = null;
        render();
        return;
      }
      const choice = event.target.closest("[data-choice]");
      if (!choice || answered) return;
      picked = Number(choice.dataset.choice);
      answered = true;
      render();
    });

    render();
  }

  function mountAgentTrace(container, exercise) {
    let checked = false;
    let correct = false;
    let pickedStep = null;
    let pickedChoice = null;
    let validation = "";

    function stepClass(index) {
      if (!checked) return "";
      if (index === exercise.fault_step) return "is-answer";
      if (index === pickedStep) return "is-incorrect";
      return "";
    }
    function choiceClass(index) {
      if (!checked) return "";
      if (index === exercise.answer) return "is-answer";
      if (index === pickedChoice) return "is-incorrect";
      return "";
    }

    function render() {
      container.innerHTML = `
        <form class="exercise-card agent-form">
          <div class="trace-list">
            ${exercise.steps.map(function (step, index) {
              const faultTag = checked && index === exercise.fault_step ? " (fault)" : "";
              return `
                <label class="trace-card ${stepClass(index)}">
                  <input type="radio" name="fault-step" value="${index}" ${checked ? "disabled" : ""} ${pickedStep === index ? "checked" : ""}>
                  <span class="trace-step">Step ${index + 1}${faultTag}</span>
                  <strong>Thought</strong>
                  <span>${escapeHtml(step.thought)}</span>
                  <strong>Tool</strong>
                  <code>${escapeHtml(step.tool)}</code>
                  <strong>Observation</strong>
                  <span>${escapeHtml(step.observation)}</span>
                </label>
              `;
            }).join("")}
          </div>
          <fieldset class="choice-field">
            <legend>Fault label</legend>
            ${exercise.choices.map(function (choice, index) {
              return `
                <label class="${choiceClass(index)}">
                  <input type="radio" name="fault-choice" value="${index}" ${checked ? "disabled" : ""} ${pickedChoice === index ? "checked" : ""}>
                  <span>${escapeHtml(choice)}</span>
                </label>
              `;
            }).join("")}
          </fieldset>
          ${!checked && validation ? `<p class="feedback-line bad" role="alert">${escapeHtml(validation)}</p>` : ""}
          <button class="button primary" type="submit" ${checked ? "disabled" : ""}>Check answer</button>
          ${checked ? `<p class="feedback-line ${correct ? "good" : "bad"}">${correct ? "Correct." : "Not quite."} ${escapeHtml(exercise.explain)}</p>` : ""}
        </form>
      `;
    }

    container.addEventListener("submit", function (event) {
      event.preventDefault();
      if (checked) return;
      const form = event.target;
      const step = form.elements["fault-step"].value;
      const choice = form.elements["fault-choice"].value;
      if (step === "" || choice === "") {
        validation = "Pick the faulty step and a fault label, then check your answer.";
        render();
        return;
      }
      pickedStep = Number(step);
      pickedChoice = Number(choice);
      checked = true;
      correct = pickedStep === exercise.fault_step && pickedChoice === exercise.answer;
      render();
    });

    render();
  }

  function mountTokenizerLab(container, exercise) {
    const SUFFIXES = ["tion", "ing", "edly", "ment", "ness", "able", "ed", "ly", "es", "er", "s"];
    const win = Number(exercise.window) || 8192;
    let mode = "subword";

    function subwordSplit(word) {
      let w = word, suf = "";
      for (let i = 0; i < SUFFIXES.length; i++) {
        const s = SUFFIXES[i];
        if (w.length > s.length + 2 && w.toLowerCase().slice(-s.length) === s) {
          suf = w.slice(w.length - s.length); w = w.slice(0, w.length - s.length); break;
        }
      }
      const out = [];
      for (let i = 0; i < w.length; i += 4) out.push(w.slice(i, i + 4));
      if (suf) out.push(suf);
      return out.length ? out : [word];
    }
    function tokenize(text) {
      const clean = String(text || "");
      if (mode === "char") return clean.split("").filter(function (c) { return c.trim() !== ""; });
      const words = clean.trim().split(/\s+/).filter(Boolean);
      if (mode === "word") return words;
      let toks = [];
      words.forEach(function (raw) {
        const m = raw.match(/^([^0-9A-Za-z]*)([0-9A-Za-z][0-9A-Za-z'-]*)?([^0-9A-Za-z]*)$/);
        if (m) {
          if (m[1]) toks.push(m[1]);
          if (m[2]) toks = toks.concat(subwordSplit(m[2]));
          if (m[3]) toks.push(m[3]);
        } else { toks.push(raw); }
      });
      return toks;
    }
    function render() {
      const input = container.querySelector("[data-tok-input]");
      const text = input ? input.value : (exercise.text || "");
      const toks = tokenize(text);
      const n = toks.length;
      const chars = text.replace(/\s/g, "").length;
      const ratio = n ? Math.round((chars / n) * 10) / 10 : 0;
      const fill = Math.min(100, Math.round((n / win) * 1000) / 10);
      const chips = toks.map(function (t, i) {
        return '<span class="tok-chip tc' + (i % 6) + '">' + escapeHtml(t) + "</span>";
      }).join("");
      const out = container.querySelector("[data-tok-out]");
      if (out) {
        out.innerHTML =
          '<div class="tok-chips">' + (chips || '<span class="tok-empty">type something above</span>') + "</div>" +
          '<dl class="tok-stats">' +
          "<div><dt>tokens</dt><dd>" + n + "</dd></div>" +
          "<div><dt>chars / token</dt><dd>" + ratio + "</dd></div>" +
          "<div><dt>context fill</dt><dd>" + fill + "% of " + win.toLocaleString() + "</dd></div>" +
          "</dl>" +
          '<div class="tok-bar" aria-hidden="true"><span style="width:' + fill + '%"></span></div>';
      }
    }
    container.innerHTML =
      '<div class="exercise-card tokenizer-lab">' +
      "<p>" + escapeHtml(exercise.prompt || "Type text and watch how it splits into tokens.") + "</p>" +
      '<textarea class="tok-input" data-tok-input rows="2" aria-label="text to tokenize">' + escapeHtml(exercise.text || "Tokenization isn't always intuitive.") + "</textarea>" +
      '<div class="lab-controls tok-modes" role="group" aria-label="token granularity">' +
      ["subword", "word", "char"].map(function (m) {
        return '<button type="button" class="tok-mode' + (m === mode ? " active" : "") + '" data-mode="' + m + '">' + m + "</button>";
      }).join("") +
      "</div>" +
      "<div data-tok-out></div>" +
      '<p class="lab-caveat">Illustrative subword tokenization. Real tokenizers (BPE) learn their merges from data, so exact counts differ; what holds is the idea, tokens are not words, and punctuation, casing, and rare words cost extra.</p>' +
      "</div>";
    container.addEventListener("input", function (e) {
      if (e.target.closest("[data-tok-input]")) render();
    });
    container.addEventListener("click", function (e) {
      const b = e.target.closest("[data-mode]");
      if (!b) return;
      mode = b.dataset.mode;
      container.querySelectorAll(".tok-mode").forEach(function (x) { x.classList.toggle("active", x.dataset.mode === mode); });
      render();
    });
    render();
  }

  function mountAttentionLab(container, exercise) {
    const examples = exercise.examples || [];
    let ei = 0, qi = 0;
    const EPS = 0.04;
    function rowFor(ex, q) {
      const focus = (ex.focus && ex.focus[String(q)]) || {};
      const raw = ex.tokens.map(function (_, k) { return (Number(focus[String(k)]) || 0) + EPS; });
      const sum = raw.reduce(function (a, b) { return a + b; }, 0) || 1;
      return raw.map(function (x) { return x / sum; });
    }
    function render() {
      const ex = examples[ei];
      if (!ex) { container.innerHTML = '<p class="empty-state">No attention examples.</p>'; return; }
      const row = rowFor(ex, qi);
      const max = Math.max.apply(null, row) || 1;
      const picker = examples.length > 1
        ? '<div class="lab-controls attn-examples" role="group" aria-label="example sentence">' +
          examples.map(function (e, i) { return '<button type="button" class="attn-ex' + (i === ei ? " active" : "") + '" data-ex="' + i + '">' + escapeHtml(e.label || ("Example " + (i + 1))) + "</button>"; }).join("") + "</div>"
        : "";
      const toks = ex.tokens.map(function (t, k) {
        const w = row[k], isQ = k === qi, op = 0.08 + 0.92 * (w / max);
        return '<button type="button" class="attn-tok' + (isQ ? " query" : "") + '" data-q="' + k + '" style="background: rgba(42,149,234,' + (isQ ? "0" : op.toFixed(3)) + ');" title="attention ' + Math.round(w * 100) + '%">' + escapeHtml(t) + "</button>";
      }).join(" ");
      const bars = ex.tokens.map(function (t, k) {
        return '<div class="attn-bar-row"><span class="attn-bar-lab">' + escapeHtml(t) + '</span><span class="attn-bar"><span style="width:' + Math.round(row[k] * 100) + '%"></span></span><span class="attn-bar-val">' + Math.round(row[k] * 100) + "%</span></div>";
      }).join("");
      container.innerHTML =
        '<div class="exercise-card attention-lab">' +
        "<p>" + escapeHtml(exercise.prompt || "Pick a query word. The highlight shows how strongly it attends to each other word.") + "</p>" +
        picker +
        '<div class="attn-sentence">' + toks + "</div>" +
        '<p class="attn-hint">Query: <strong>' + escapeHtml(ex.tokens[qi]) + "</strong>. Click any word to make it the query.</p>" +
        '<div class="attn-bars">' + bars + "</div>" +
        '<p class="lab-caveat">Illustrative attention, hand-built to show typical patterns (a pronoun attending to its noun, a word to the context that fixes its sense). Not extracted from a live model, which has many heads across many layers.</p>' +
        "</div>";
    }
    container.addEventListener("click", function (e) {
      const exBtn = e.target.closest("[data-ex]");
      if (exBtn) { ei = Number(exBtn.dataset.ex); qi = 0; render(); return; }
      const qBtn = e.target.closest("[data-q]");
      if (qBtn) { qi = Number(qBtn.dataset.q); render(); }
    });
    render();
  }

  function mountInjectionLab(container, exercise) {
    const injections = exercise.injections || [];
    let pick = 0, guardrail = true, ran = false;
    function render() {
      const inj = injections[pick] || { label: "", text: "" };
      container.innerHTML =
        '<div class="exercise-card injection-lab">' +
        "<p>" + escapeHtml(exercise.prompt || "An agent reads an untrusted web page to summarize it. Someone hid an instruction in the page. Toggle the guardrail and run it.") + "</p>" +
        '<div class="inj-task"><strong>Agent task:</strong> ' + escapeHtml(exercise.task || "Summarize the web page for the user.") + "</div>" +
        '<div class="inj-field"><span class="inj-label">Instruction hidden in the page content</span>' +
        '<div class="lab-controls">' + injections.map(function (x, i) { return '<button type="button" class="inj-pick' + (i === pick ? " active" : "") + '" data-pick="' + i + '">' + escapeHtml(x.label) + "</button>"; }).join("") + "</div>" +
        '<pre class="inj-content">' + escapeHtml(inj.text) + "</pre></div>" +
        '<label class="inj-guard"><input type="checkbox" data-guard ' + (guardrail ? "checked" : "") + "> Guardrail on: treat page content as data, not commands (the instruction-source boundary)</label>" +
        '<button type="button" class="button primary" data-run>Run agent</button>' +
        (ran
          ? '<div class="inj-out ' + (guardrail ? "safe" : "breach") + '">' +
            (guardrail
              ? "<strong>Blocked.</strong> The agent summarized the page and flagged it: “this page contains an instruction directed at me; I am not acting on it.” The hidden command never ran."
              : "<strong>Breach.</strong> With no source boundary the agent obeyed the page text and tried to exfiltrate data to the attacker. Untrusted content rewrote the agent's goal.") +
            "</div>"
          : "") +
        '<p class="lab-caveat">A simulation of the instruction-source boundary, not a live model. The rule it shows: text an agent reads is data; only the user gives instructions.</p>' +
        "</div>";
    }
    container.addEventListener("click", function (e) {
      const p = e.target.closest("[data-pick]");
      if (p) { pick = Number(p.dataset.pick); ran = false; render(); return; }
      if (e.target.closest("[data-run]")) { ran = true; render(); }
    });
    container.addEventListener("change", function (e) {
      if (e.target.closest("[data-guard]")) { guardrail = e.target.checked; ran = false; render(); }
    });
    render();
  }

  function mountEmbeddingLab(container, exercise) {
    const pts = exercise.points || [];
    let sel = -1;
    const W = 340, H = 250, PAD = 26;
    const xs = pts.map(function (p) { return p.x; }), ys = pts.map(function (p) { return p.y; });
    const minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
    const minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
    const COLORS = { 0: "#2a95ea", 1: "#7a9a6a", 2: "#b5803a", 3: "#a06ab5" };
    function sx(x) { return PAD + (x - minX) / ((maxX - minX) || 1) * (W - 2 * PAD); }
    function sy(y) { return H - PAD - (y - minY) / ((maxY - minY) || 1) * (H - 2 * PAD); }
    function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
    function render() {
      let neighbors = [];
      if (sel >= 0) {
        neighbors = pts.map(function (p, i) { return { i: i, d: dist(pts[sel], p) }; })
          .filter(function (n) { return n.i !== sel; }).sort(function (a, b) { return a.d - b.d; }).slice(0, 3);
      }
      const near = {}; neighbors.forEach(function (n) { near[n.i] = true; });
      const dots = pts.map(function (p, i) {
        const isSel = i === sel, isNear = near[i];
        const col = COLORS[p.group] || "#888";
        const r = isSel ? 6 : (isNear ? 5 : 4);
        const op = (sel < 0 || isSel || isNear) ? 1 : 0.3;
        return '<g class="emb-pt" data-pt="' + i + '" tabindex="0" role="button" aria-label="' + escapeHtml(p.w) + (isSel ? ", selected" : "") + '">' +
          '<circle cx="' + sx(p.x).toFixed(1) + '" cy="' + sy(p.y).toFixed(1) + '" r="' + r + '" fill="' + col + '" opacity="' + op + '"/>' +
          '<text class="emb-label" x="' + (sx(p.x) + 7).toFixed(1) + '" y="' + (sy(p.y) + 3).toFixed(1) + '" opacity="' + op + '">' + escapeHtml(p.w) + "</text></g>";
      }).join("");
      const list = sel >= 0
        ? '<p class="emb-near">Nearest to <strong>' + escapeHtml(pts[sel].w) + "</strong>: " + neighbors.map(function (n) { return escapeHtml(pts[n.i].w) + " (" + n.d.toFixed(2) + ")"; }).join(", ") + "</p>"
        : '<p class="emb-near">Click a word to see its three nearest neighbors.</p>';
      container.innerHTML =
        '<div class="exercise-card embedding-lab">' +
        "<p>" + escapeHtml(exercise.prompt || "Each dot is a word, placed by meaning. Click one to see its nearest neighbors.") + "</p>" +
        '<svg viewBox="0 0 ' + W + " " + H + '" class="emb-svg" role="img" aria-label="2D map of word embeddings">' + dots + "</svg>" +
        list +
        (exercise.note ? '<p class="emb-note">' + escapeHtml(exercise.note) + "</p>" : "") +
        '<p class="lab-caveat">A hand-placed 2D map illustrating well-known embedding relationships (semantic clusters, the king/queen analogy). It is not extracted from a real model, and real embeddings live in hundreds of dimensions; these 2D distances are for intuition only.</p>' +
        "</div>";
    }
    container.addEventListener("click", function (e) {
      const g = e.target.closest("[data-pt]");
      if (g) { sel = Number(g.dataset.pt); render(); }
    });
    container.addEventListener("keydown", function (e) {
      const g = e.target.closest("[data-pt]");
      if (g && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault(); sel = Number(g.dataset.pt); render();
        const el = container.querySelector('[data-pt="' + sel + '"]'); if (el) el.focus();
      }
    });
    render();
  }

  function mountNeuralNetLab(container, exercise) {
    // tiny fixed net: 2 inputs -> 3 tanh hidden -> 1 sigmoid output. Slide inputs, watch it flow.
    const W1 = [[1.8, -1.6], [-1.5, 1.7], [1.2, 1.3]];
    const B1 = [0.2, 0.1, -0.8];
    const W2 = [2.2, 2.0, -1.9];
    const B2 = -0.3;
    let x1 = exercise.x1 != null ? exercise.x1 : 0.6;
    let x2 = exercise.x2 != null ? exercise.x2 : -0.4;
    function tanh(v) { return Math.tanh(v); }
    function sig(v) { return 1 / (1 + Math.exp(-v)); }
    function fwd() {
      const h = W1.map(function (w, j) { return tanh(w[0] * x1 + w[1] * x2 + B1[j]); });
      const o = sig(W2[0] * h[0] + W2[1] * h[1] + W2[2] * h[2] + B2);
      return { h: h, o: o };
    }
    function col(a, lo) { // activation -> blue intensity (a in [-1,1] or [0,1])
      const t = lo ? a : (a + 1) / 2;
      return "rgba(42,149,234," + (0.12 + 0.85 * Math.max(0, Math.min(1, t))).toFixed(3) + ")";
    }
    function render() {
      const r = fwd();
      const W = 360, H = 220;
      const inX = 50, hX = 180, oX = 310;
      const inY = [80, 150], hY = [50, 110, 170], oY = [110];
      let edges = "";
      W1.forEach(function (w, j) {
        [0, 1].forEach(function (i) {
          const sw = Math.min(4, Math.abs(w[i]) * 1.4);
          const c = w[i] >= 0 ? "rgba(42,149,234,0.4)" : "rgba(217,119,119,0.4)";
          edges += '<line x1="' + inX + '" y1="' + inY[i] + '" x2="' + hX + '" y2="' + hY[j] + '" stroke="' + c + '" stroke-width="' + sw.toFixed(1) + '"/>';
        });
      });
      W2.forEach(function (w, j) {
        const sw = Math.min(4, Math.abs(w) * 1.4);
        const c = w >= 0 ? "rgba(42,149,234,0.4)" : "rgba(217,119,119,0.4)";
        edges += '<line x1="' + hX + '" y1="' + hY[j] + '" x2="' + oX + '" y2="' + oY[0] + '" stroke="' + c + '" stroke-width="' + sw.toFixed(1) + '"/>';
      });
      function node(cx, cy, fill, label) {
        return '<circle cx="' + cx + '" cy="' + cy + '" r="16" fill="' + fill + '" stroke="var(--border-accent)"/>' +
          '<text class="nn-val" x="' + cx + '" y="' + (cy + 4) + '" text-anchor="middle">' + label + "</text>";
      }
      let nodes = "";
      nodes += node(inX, inY[0], col(x1), x1.toFixed(1)) + node(inX, inY[1], col(x2), x2.toFixed(1));
      r.h.forEach(function (hv, j) { nodes += node(hX, hY[j], col(hv), hv.toFixed(2)); });
      nodes += node(oX, oY[0], col(r.o, true), r.o.toFixed(2));
      container.innerHTML =
        '<div class="exercise-card nn-lab">' +
        "<p>" + escapeHtml(exercise.prompt || "A tiny network: two inputs, three hidden units, one output. Slide the inputs and watch the signal flow through and the output respond.") + "</p>" +
        '<svg viewBox="0 0 ' + W + " " + H + '" class="nn-svg" role="img" aria-label="a small neural network with current activations">' + edges + nodes + "</svg>" +
        '<div class="nn-controls">' +
        '<label>input 1 <strong>' + x1.toFixed(2) + '</strong><input type="range" min="-1" max="1" step="0.05" value="' + x1 + '" data-nn="1"></label>' +
        '<label>input 2 <strong>' + x2.toFixed(2) + '</strong><input type="range" min="-1" max="1" step="0.05" value="' + x2 + '" data-nn="2"></label>' +
        "</div>" +
        '<p class="nn-out">output: <strong>' + r.o.toFixed(3) + "</strong></p>" +
        '<p class="lab-caveat">A real forward pass with fixed weights: each hidden unit is tanh of a weighted sum, the output is a sigmoid. Blue edges are positive weights, red negative. Training is just choosing those weights; here they are frozen so you can watch the arithmetic.</p>' +
        "</div>";
    }
    container.addEventListener("input", function (e) {
      const s = e.target.closest("[data-nn]");
      if (!s) return;
      if (s.dataset.nn === "1") x1 = Number(s.value); else x2 = Number(s.value);
      render();
    });
    render();
  }

  function mountGradientDescentLab(container, exercise) {
    const A = exercise.a || 0.5;
    const XMIN = -5, XMAX = 5;
    let lr = exercise.lr != null ? exercise.lr : 0.30;
    let x = exercise.start != null ? exercise.start : -4.2;
    let steps = 0, timer = null;
    const W = 360, H = 220, PAD = 28;
    function f(v) { return A * v * v; }
    function grad(v) { return 2 * A * v; }
    const fmax = f(XMIN) || 1;
    function sx(v) { return PAD + (v - XMIN) / (XMAX - XMIN) * (W - 2 * PAD); }
    function sy(val) { return H - PAD - (val / fmax) * (H - 2 * PAD); }
    function curve() { let d = ""; for (let i = 0; i <= 60; i++) { const v = XMIN + (XMAX - XMIN) * i / 60; d += (i ? "L" : "M") + sx(v).toFixed(1) + " " + sy(f(v)).toFixed(1) + " "; } return d; }
    function step() { x = x - lr * grad(x); x = Math.max(XMIN, Math.min(XMAX, x)); steps++; }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function render() {
      const cx = sx(x), cy = sy(f(x));
      const state = Math.abs(x) < 0.05 ? "converged" : (Math.abs(x) >= 4.99 ? "diverged" : "descending");
      container.innerHTML =
        '<div class="exercise-card gd-lab">' +
        "<p>" + escapeHtml(exercise.prompt || "Gradient descent rolls downhill. Set the learning rate, then step. Too small crawls; too big overshoots and flies off.") + "</p>" +
        '<svg viewBox="0 0 ' + W + " " + H + '" class="gd-svg" role="img" aria-label="loss curve with the current point">' +
        '<line x1="' + sx(0).toFixed(1) + '" y1="' + (H - PAD) + '" x2="' + sx(0).toFixed(1) + '" y2="' + PAD + '" stroke="var(--border)" stroke-dasharray="3 3"/>' +
        '<path d="' + curve() + '" fill="none" stroke="var(--border-accent)" stroke-width="2"/>' +
        '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="6" fill="var(--accent)"/>' +
        "</svg>" +
        '<div class="gd-controls"><label class="gd-lr">learning rate <strong>' + lr.toFixed(2) + "</strong>" +
        '<input type="range" min="0.02" max="3" step="0.02" value="' + lr + '" data-gd-lr></label>' +
        '<div class="gd-buttons"><button type="button" class="button" data-gd-step>Step</button>' +
        '<button type="button" class="button" data-gd-run>' + (timer ? "Pause" : "Run") + "</button>" +
        '<button type="button" class="button ghost" data-gd-reset>Reset</button></div></div>' +
        '<dl class="gd-stats"><div><dt>step</dt><dd>' + steps + "</dd></div><div><dt>x</dt><dd>" + x.toFixed(2) + "</dd></div><div><dt>loss</dt><dd>" + f(x).toFixed(2) + '</dd></div><div><dt>state</dt><dd class="gd-' + state + '">' + state + "</dd></div></dl>" +
        '<p class="lab-caveat">A clean convex bowl: gradient descent in one dimension. Real loss surfaces are high-dimensional and bumpy with local minima, but the lever is the same one you are sliding.</p>' +
        "</div>";
    }
    container.addEventListener("input", function (e) {
      if (e.target.closest("[data-gd-lr]")) { lr = Number(e.target.value); const s = container.querySelector(".gd-lr strong"); if (s) s.textContent = lr.toFixed(2); }
    });
    container.addEventListener("click", function (e) {
      if (e.target.closest("[data-gd-step]")) { stop(); step(); render(); }
      else if (e.target.closest("[data-gd-run]")) {
        if (timer) { stop(); render(); }
        else { timer = setInterval(function () { if (!container.isConnected) { stop(); return; } step(); render(); if (Math.abs(x) < 0.02 || Math.abs(x) >= 5) { stop(); render(); } }, 240); render(); }
      } else if (e.target.closest("[data-gd-reset]")) { stop(); x = exercise.start != null ? exercise.start : -4.2; steps = 0; render(); }
    });
    render();
  }

  function renderLabs(id) {
    const data = state.labs || { categories: [], labs: [] };
    const labs = data.labs || [];
    if (id) {
      const lab = labs.find(function (l) { return l.id === id; });
      if (!lab) { renderNotFound("That lab does not exist."); return; }
      const markup =
        '<article class="lab-detail">' +
        '<a class="back-icon" href="#/labs" aria-label="Back to labs">←</a>' +
        "<h1>" + escapeHtml(lab.title) + "</h1>" +
        (lab.blurb ? '<p class="dek">' + escapeHtml(lab.blurb) + "</p>" : "") +
        (lab.concept_html ? '<div class="lab-concept">' + lab.concept_html + "</div>" : "") +
        '<div class="lab-mount" data-lab-mount></div>' +
        (lab.source_lesson ? '<p class="lab-source">Background: the lesson <a href="#/lesson/' + encodeURIComponent(lab.source_lesson) + '">' + escapeHtml(lab.source_title || lab.source_lesson) + "</a>.</p>" : "") +
        "</article>";
      replaceApp(markup, lab.title);
      const mount = app.querySelector("[data-lab-mount]");
      if (mount && lab.exercise) mountExercise(mount, lab.exercise);
      return;
    }
    const cats = (data.categories && data.categories.length) ? data.categories : [{ id: "all", title: "All labs" }];
    const byCat = {};
    labs.forEach(function (l) { (byCat[l.category] = byCat[l.category] || []).push(l); });
    const sections = cats.map(function (c) {
      const items = byCat[c.id] || [];
      if (!items.length) return "";
      const cards = items.map(function (l) {
        return '<a class="track-card" href="#/labs/' + encodeURIComponent(l.id) + '" data-state="new">' +
          '<span class="tc-kicker">' + escapeHtml(l.kind || "Interactive") + "</span>" +
          '<h3 class="tc-title">' + escapeHtml(l.title) + "</h3>" +
          '<p class="tc-blurb">' + escapeHtml(l.blurb || "") + "</p>" +
          '<span class="tc-foot"><span class="tc-cta">Open lab</span></span>' +
          "</a>";
      }).join("");
      return '<section class="lab-cat"><h2>' + escapeHtml(c.title) + '</h2><div class="track-grid">' + cards + "</div></section>";
    }).join("");
    const markup =
      '<div class="labs-index">' +
      '<header class="labs-hero"><h1>Labs</h1><p class="dek">Small interactive playgrounds for the ideas behind modern AI. Drag, type, and toggle, and watch what changes. Each one is honest about exactly what it shows.</p></header>' +
      (labs.length ? sections : '<p class="empty-state">No labs yet.</p>') +
      "</div>";
    replaceApp(markup, "Labs");
  }

  function renderNotFound(message) {
    replaceApp(`
      <section class="track-header" aria-labelledby="missing-title">
        <p class="eyebrow">Not found</p>
        <h1 id="missing-title">No page here</h1>
        <p class="lead">${escapeHtml(message || "That route does not match a track, lesson, resource page, flashcard deck, or quiz.")}</p>
        <p><a class="button primary" href="#/">Return home</a></p>
      </section>
    `, "Not found");
  }

  function initNavSearch() {
    const toggle = document.getElementById("nav-search-toggle");
    const panel = document.getElementById("nav-search-panel");
    const input = document.getElementById("nav-search-input");
    const results = document.getElementById("nav-search-results");
    if (!toggle || !panel || !input || !results) return;
    const navToggle = document.getElementById("nav-toggle");

    function renderResults(value) {
      const raw = (value || "").trim();
      const query = raw.toLowerCase();
      if (query.length < 2) {
        results.innerHTML = `<p class="nav-search-hint">Type to search lessons and resources.</p>`;
        return;
      }
      const lessons = state.lessons.filter(function (lesson) { return lessonSearchText(lesson).includes(query); }).slice(0, 6);
      const links = state.links.filter(function (link) { return `${link.title} ${link.note || ""}`.toLowerCase().includes(query); }).slice(0, 4);
      if (!lessons.length && !links.length) {
        results.innerHTML = `<p class="nav-search-hint">No matches. Press Enter for the full search.</p>`;
        return;
      }
      const rows = [];
      lessons.forEach(function (lesson) {
        const track = getTrack(lesson.track);
        rows.push(`<a class="nav-search-row" href="${lessonHref(lesson.id)}"><span class="nav-search-row-title">${escapeHtml(lesson.title)}</span><span class="nav-search-row-meta">${escapeHtml(track ? track.title : lesson.track)}</span></a>`);
      });
      links.forEach(function (link) {
        rows.push(`<a class="nav-search-row" href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer"><span class="nav-search-row-title">${escapeHtml(link.title)}</span><span class="nav-search-row-meta">resource</span></a>`);
      });
      results.innerHTML = rows.join("") + `<a class="nav-search-all" href="#/search/${encodeURIComponent(raw)}">See all results</a>`;
    }

    function openPanel() {
      panel.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      if (navToggle) navToggle.checked = false;
      renderResults(input.value);
      input.focus();
    }
    function closePanel() {
      if (panel.hidden) return;
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function (event) {
      event.preventDefault();
      if (panel.hidden) { openPanel(); } else { closePanel(); }
    });
    input.addEventListener("input", function () { renderResults(input.value); });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        const raw = input.value.trim();
        closePanel();
        location.hash = raw ? `#/search/${encodeURIComponent(raw)}` : "#/search";
      } else if (event.key === "Escape") {
        closePanel();
        toggle.focus();
      }
    });
    results.addEventListener("click", function (event) {
      if (event.target.closest("a")) closePanel();
    });
    document.addEventListener("click", function (event) {
      if (panel.hidden) return;
      if (!panel.contains(event.target) && !toggle.contains(event.target)) closePanel();
    });
    window.addEventListener("hashchange", closePanel);
  }

  loadData()
    .then(function () {
      window.addEventListener("hashchange", function () {
        const toggle = document.getElementById("nav-toggle");
        if (toggle) toggle.checked = false;  // close the mobile menu after navigating
        renderRoute();
      });
      renderRoute();
      initAuth();
      initNavSearch();
    })
    .catch(function (error) {
      replaceApp(`
        <section class="track-header" aria-labelledby="error-title">
          <p class="eyebrow">Load error</p>
          <h1 id="error-title">Study could not load</h1>
          <p class="lead">${escapeHtml(error.message)}</p>
        </section>
      `, "Load error");
      console.error(error);
    });
})();
