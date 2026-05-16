/* ============================================
   MARLON LUTETE — PORTFOLIO
   script.js
   ============================================ */

// ── Clock ──────────────────────────────────────────────────────────────
const clockEl = document.getElementById("clock");

function updateClock() {
  const now = new Date();
  const month = now.toLocaleString("en-US", { month: "long" });
  const day = now.getDate();
  const hours = String(now.getHours()).padStart(2, "0");
  const mins = String(now.getMinutes()).padStart(2, "0");
  clockEl.textContent = `${month} ${day}, ${hours}:${mins}`;
}
updateClock();
setInterval(updateClock, 10000);

// ── Breadcrumb / Navigation ────────────────────────────────────────────
const breadcrumb = document.getElementById("breadcrumb");
let navStack = [{ label: "home", view: "home" }];

function renderBreadcrumb() {
  breadcrumb.innerHTML = "";
  navStack.forEach((item, i) => {
    const btn = document.createElement("button");
    btn.className = "tab" + (i === navStack.length - 1 ? " active" : "");
    btn.textContent = item.label;
    btn.dataset.view = item.view;
    btn.addEventListener("click", () => navigateTo(item.view, item.label, i));
    breadcrumb.appendChild(btn);
  });
}

function navigateTo(view, label, stackIndex = null) {
  if (view === "home") {
    stopAllMedia();
    closeAllPanels();
    navStack = [{ label: "home", view: "home" }];
    renderBreadcrumb();
    return;
  }
  if (stackIndex !== null && stackIndex < navStack.length - 1) {
    stopAllMedia();
    navStack = navStack.slice(0, stackIndex + 1);
    closeAllPanels();
    openPanelByView(view);
    renderBreadcrumb();
    return;
  }
  if (navStack[navStack.length - 1].view === view) return;
  const existing = navStack.findIndex((n) => n.view === view);
  if (existing !== -1) {
    stopAllMedia();
    navStack = navStack.slice(0, existing + 1);
    closeAllPanels();
    openPanelByView(view);
    renderBreadcrumb();
    return;
  }
  navStack.push({ label, view });
  openPanelByView(view);
  renderBreadcrumb();
}

renderBreadcrumb();

// ── Media helpers ──────────────────────────────────────────────────────
function stopAllMedia() {
  // Stop all <video> elements
  document.querySelectorAll(".project-content video").forEach((v) => {
    v.pause();
    v.currentTime = 0;
  });
}

// ── Panel system ───────────────────────────────────────────────────────
const backdrop = document.getElementById("backdrop");
const panelProjects = document.getElementById("panel-projects");
const panelAbout = document.getElementById("panel-about");
const panelProjectDetail = document.getElementById("panel-project-detail");
const panelDetailTitle = document.getElementById("project-detail-title");
const panelDetailBody = document.querySelector(
  "#panel-project-detail .panel-body",
);

function openPanelByView(view) {
  if (view === "projects") {
    closePanel(panelProjectDetail);
    openPanel(panelProjects);
  } else if (view === "about") {
    openPanel(panelAbout);
  } else if (view.startsWith("project-")) {
    panelProjects.classList.add("visible");
    openPanel(panelProjectDetail);
  }
}

function openPanel(panel) {
  backdrop.classList.add("visible");
  panel.classList.add("visible");
}

function closePanel(panel) {
  panel.classList.remove("visible");
}

function closeAllPanels() {
  [panelProjects, panelAbout, panelProjectDetail].forEach((p) =>
    p.classList.remove("visible"),
  );
  backdrop.classList.remove("visible");
}

// Folder buttons
document.querySelectorAll(".folder-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const view = btn.dataset.view;
    if (view === "projects") navigateTo("projects", "projects");
    if (view === "about") navigateTo("about", "about me");
  });
});

// Project items
document.querySelectorAll(".project-item").forEach((item) => {
  item.addEventListener("click", () => {
    stopAllMedia(); // stop any running video before switching
    const key = item.dataset.project;
    const name = item.querySelector(".project-name").textContent;
    panelDetailTitle.textContent = name;

    document.querySelectorAll(".project-content").forEach((block) => {
      block.style.display = block.id === "content-" + key ? "block" : "none";
    });

    // Reset scroll position
    if (panelDetailBody) panelDetailBody.scrollTop = 0;

    navigateTo("project-" + key, name);
    openPanel(panelProjectDetail);
  });
});

// Close buttons
document.querySelectorAll(".panel-close").forEach((btn) => {
  btn.addEventListener("click", () => {
    const t = btn.dataset.close;
    if (t === "project-detail") {
      stopAllMedia();
      closePanel(panelProjectDetail);
      const idx = navStack.findIndex((n) => n.view === "projects");
      if (idx !== -1) navStack = navStack.slice(0, idx + 1);
      renderBreadcrumb();
    } else if (t === "projects") {
      stopAllMedia();
      closePanel(panelProjects);
      closePanel(panelProjectDetail);
      navStack = [{ label: "home", view: "home" }];
      backdrop.classList.remove("visible");
      renderBreadcrumb();
    } else if (t === "about") {
      closePanel(panelAbout);
      navStack = [{ label: "home", view: "home" }];
      backdrop.classList.remove("visible");
      renderBreadcrumb();
    }
  });
});

// Backdrop click
backdrop.addEventListener("click", () => {
  stopAllMedia();
  closeAllPanels();
  navStack = [{ label: "home", view: "home" }];
  renderBreadcrumb();
});

// Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (panelProjectDetail.classList.contains("visible")) {
      stopAllMedia();
      closePanel(panelProjectDetail);
      navStack = navStack.filter((n) => !n.view.startsWith("project-"));
      renderBreadcrumb();
    } else if (
      panelProjects.classList.contains("visible") ||
      panelAbout.classList.contains("visible")
    ) {
      stopAllMedia();
      closeAllPanels();
      navStack = [{ label: "home", view: "home" }];
      renderBreadcrumb();
    }
  }
});

// ── Back to top ────────────────────────────────────────────────────────
document.querySelectorAll(".back-to-top").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (panelDetailBody) {
      panelDetailBody.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
});

// ── Eye tracking ───────────────────────────────────────────────────────
const eyePupil = document.getElementById("eye-pupil");
const MAX_MOVE_X = 22;
const MAX_MOVE_Y = 10;
let mouseX = 0,
  mouseY = 0;
let currentX = 0,
  currentY = 0;
let rafId = null;

// ── Custom cursor ─────────────────────────────────────────────────────
const cursor = document.getElementById("custom-cursor");
const pointerTargets =
  'a, button, [role="button"], .folder-btn, .project-item, .panel-close, .tab';

// Only activate on real pointer devices (not touch)
const hasPointer = window.matchMedia("(pointer: fine)").matches;
if (!hasPointer && cursor) cursor.style.display = "none";

if (hasPointer && cursor) {
  document.addEventListener("mousemove", (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
    mouseX = e.clientX;
    mouseY = e.clientY;

    const target = document.elementFromPoint(e.clientX, e.clientY);
    cursor.classList.toggle(
      "is-pointer",
      !!(target && target.closest(pointerTargets)),
    );

    if (!rafId) rafId = requestAnimationFrame(animateEye);
  });

  document.addEventListener("mousedown", () => {
    cursor.style.opacity = "0.6";
  });
  document.addEventListener("mouseup", () => {
    cursor.style.opacity = "1";
  });
}

function animateEye() {
  rafId = null;
  if (!eyePupil) return;

  const r = eyePupil.getBoundingClientRect();
  const dx = mouseX - (r.left + r.width / 2);
  const dy = mouseY - (r.top + r.height / 2);
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ang = Math.atan2(dy, dx);

  const moveX = Math.cos(ang) * Math.min(dist * 0.08, MAX_MOVE_X);
  const moveY = Math.sin(ang) * Math.min(dist * 0.08, MAX_MOVE_Y);

  currentX += (moveX - currentX) * 0.15;
  currentY += (moveY - currentY) * 0.15;

  eyePupil.style.transform = `translate(${currentX}px, ${currentY}px)`;

  if (Math.abs(moveX - currentX) > 0.1 || Math.abs(moveY - currentY) > 0.1) {
    rafId = requestAnimationFrame(animateEye);
  }
}

// ── Typewriter greeting ────────────────────────────────────────────────
const words = ["Hi!", "Hallo!", "Bonjour!", "Hola!", "Ciao!", "Hey!"];
let wordIndex = 0,
  charIndex = 0,
  isDeleting = false,
  greetingEl = null;

function typeGreeting() {
  if (!greetingEl) greetingEl = document.getElementById("greeting-word");
  if (!greetingEl) {
    setTimeout(typeGreeting, 100);
    return;
  }

  const word = words[wordIndex];
  greetingEl.textContent = isDeleting
    ? word.substring(0, charIndex - 1)
    : word.substring(0, charIndex + 1);

  isDeleting ? charIndex-- : charIndex++;

  let speed = isDeleting ? 60 : 120;
  if (!isDeleting && charIndex === word.length) {
    speed = 8000;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    wordIndex = (wordIndex + 1) % words.length;
    speed = 300;
  }

  setTimeout(typeGreeting, speed);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () =>
    setTimeout(typeGreeting, 500),
  );
} else {
  setTimeout(typeGreeting, 500);
}

// ── Carousel ───────────────────────────────────────────────────────────
document.querySelectorAll(".pd-carousel").forEach((carousel) => {
  const slides = carousel.querySelectorAll(".pd-slide");
  const dots = carousel.querySelectorAll(".pd-dot");
  const btnPrev = carousel.querySelector(".pd-prev");
  const btnNext = carousel.querySelector(".pd-next");
  let current = 0;

  function goTo(n) {
    slides[current].classList.remove("active");
    dots[current].classList.remove("active");
    current = (n + slides.length) % slides.length;
    slides[current].classList.add("active");
    dots[current].classList.add("active");
  }

  if (btnPrev) btnPrev.addEventListener("click", () => goTo(current - 1));
  if (btnNext) btnNext.addEventListener("click", () => goTo(current + 1));
  dots.forEach((dot, i) => dot.addEventListener("click", () => goTo(i)));
});
