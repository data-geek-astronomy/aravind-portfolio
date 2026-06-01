const canvas = document.getElementById("neural-canvas");
const ctx = canvas.getContext("2d");
const orbitShell = document.getElementById("orbitShell");
const cards = document.querySelectorAll(".tilt-card");

let width = 0;
let height = 0;
let pixelRatio = 1;
let scrollProgress = 0;
let pointer = { x: 0.5, y: 0.5 };
let nodes = [];

function resizeCanvas() {
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const count = Math.max(42, Math.min(92, Math.floor(width / 18)));
  nodes = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    z: 0.25 + Math.random() * 1.35,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.28,
    hue: index % 4
  }));
}

function updateScrollProgress() {
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  scrollProgress = window.scrollY / maxScroll;
  document.body.style.setProperty("--scroll", scrollProgress.toFixed(4));
}

function drawScene() {
  ctx.clearRect(0, 0, width, height);

  const colors = [
    "rgba(88,184,255,",
    "rgba(53,211,153,",
    "rgba(246,193,95,",
    "rgba(255,123,110,"
  ];

  nodes.forEach((node) => {
    const driftX = (pointer.x - 0.5) * node.z * 0.38;
    const driftY = (pointer.y - 0.5) * node.z * 0.38;
    node.x += node.vx + driftX;
    node.y += node.vy + driftY + scrollProgress * 0.05;

    if (node.x < -20) node.x = width + 20;
    if (node.x > width + 20) node.x = -20;
    if (node.y < -20) node.y = height + 20;
    if (node.y > height + 20) node.y = -20;
  });

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const threshold = 132;

      if (distance < threshold) {
        ctx.strokeStyle = `rgba(170, 218, 255, ${0.15 * (1 - distance / threshold)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  nodes.forEach((node) => {
    ctx.fillStyle = `${colors[node.hue]}${0.38 + node.z * 0.15})`;
    ctx.beginPath();
    ctx.arc(node.x, node.y, 1.7 + node.z * 1.4, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(drawScene);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
      }
    });
  },
  { threshold: 0.18 }
);

cards.forEach((card) => {
  revealObserver.observe(card);

  card.addEventListener("pointermove", (event) => {
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    card.style.setProperty("--tilt-x", `${x * 7}deg`);
  });
});

window.addEventListener("pointermove", (event) => {
  pointer = {
    x: event.clientX / Math.max(1, window.innerWidth),
    y: event.clientY / Math.max(1, window.innerHeight)
  };

  if (orbitShell) {
    const rotateY = (pointer.x - 0.5) * 18;
    const rotateX = 58 - (pointer.y - 0.5) * 12;
    orbitShell.style.transform = `rotateX(${rotateX}deg) rotateZ(-28deg) rotateY(${rotateY}deg)`;
  }
});

window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", resizeCanvas);

resizeCanvas();
updateScrollProgress();
drawScene();
