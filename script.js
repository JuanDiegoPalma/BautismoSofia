const scene = document.querySelector("#invitation-scene");
const scrollScene = document.querySelector(".scroll-scene");
const scrollHint = document.querySelector("#scroll-hint");
const countdown = document.querySelector("#countdown");

if (!(scene instanceof HTMLElement) || !(scrollScene instanceof HTMLElement)) {
  throw new Error("No se encontró la escena de la invitación.");
}

let scrollUpdatePending = false;

function updateScene() {
  const scrollDistance = scrollScene.offsetHeight - window.innerHeight;
  const progress =
    scrollDistance > 0
      ? Math.min(1, Math.max(0, window.scrollY / scrollDistance))
      : 0;

  scene.style.setProperty("--progress", progress.toFixed(3));
  scene.style.setProperty("--card-offset", `${120 - progress * 145}px`);
  scene.style.setProperty("--card-scale", (0.76 + progress * 0.24).toFixed(3));
  scene.style.setProperty(
    "--card-opacity",
    Math.min(1, Math.max(0, (progress - 0.08) / 0.34)).toFixed(3),
  );
  scene.style.setProperty(
    "--envelope-opacity",
    Math.max(0, 1 - Math.max(0, progress - 0.48) / 0.3).toFixed(3),
  );
  scene.style.setProperty(
    "--front-opacity",
    Math.max(0, 1 - Math.max(0, progress - 0.24) / 0.32).toFixed(3),
  );
  scene.style.setProperty(
    "--flap-open",
    `${-180 * Math.min(1, progress / 0.35)}deg`,
  );
  scene.style.setProperty("--seal-opacity", String(Math.max(0, 1 - progress * 5)));

  if (scrollHint instanceof HTMLElement) {
    scrollHint.style.opacity = String(Math.max(0, 1 - progress * 5));
  }

  scrollUpdatePending = false;
}

function requestSceneUpdate() {
  if (scrollUpdatePending) {
    return;
  }

  scrollUpdatePending = true;
  window.requestAnimationFrame(updateScene);
}

window.addEventListener("scroll", requestSceneUpdate, { passive: true });
window.addEventListener("resize", requestSceneUpdate);
updateScene();

if (countdown instanceof HTMLElement) {
  const targetTime = Date.parse(countdown.dataset.date ?? "");
  const values = new Map(
    Array.from(countdown.querySelectorAll("[data-unit]")).map((element) => [
      element.dataset.unit,
      element,
    ]),
  );
  let countdownInterval = 0;

  if (!Number.isFinite(targetTime)) {
    countdown.textContent = "Configura la fecha y hora del evento.";
    throw new Error("La fecha de la cuenta regresiva no es válida.");
  }

  function updateCountdown() {
    const remaining = targetTime - Date.now();

    if (remaining <= 0) {
      countdown.textContent = "¡Hoy es el gran día!";
      window.clearInterval(countdownInterval);
      return;
    }

    const totalSeconds = Math.floor(remaining / 1000);
    const units = {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    };

    for (const [unit, value] of Object.entries(units)) {
      const element = values.get(unit);
      if (element) {
        element.textContent = String(value).padStart(2, "0");
      }
    }
  }

  updateCountdown();
  countdownInterval = window.setInterval(updateCountdown, 1000);
}
