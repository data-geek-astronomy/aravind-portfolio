const canvas = document.getElementById("neural-canvas");
const ctx = canvas.getContext("2d");
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const orbitShell = document.getElementById("orbitShell");
const cards = document.querySelectorAll(".tilt-card");
const repoRail = document.getElementById("repoRail");
const repoGrid = document.getElementById("repoGrid");

let width = 0;
let height = 0;
let pixelRatio = 1;
let scrollProgress = 0;
let pointer = { x: 0.5, y: 0.5 };
let cursorVisible = false;
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
  const isFinePointer = event.pointerType === "mouse" || event.pointerType === "pen";

  if (isFinePointer && cursorDot && cursorRing) {
    cursorVisible = true;
    document.body.classList.add("cursor-visible");
    cursorDot.style.left = `${event.clientX}px`;
    cursorDot.style.top = `${event.clientY}px`;
    cursorRing.style.left = `${event.clientX}px`;
    cursorRing.style.top = `${event.clientY}px`;
  }

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

const hoverSelector = "a, button, [role='button'], .project-card, .repo-card, .skill-panel, .timeline-card, .education-card";

window.addEventListener("pointerover", (event) => {
  if (event.target.closest(hoverSelector)) {
    document.body.classList.add("cursor-hover");
  }
});

window.addEventListener("pointerout", (event) => {
  if (event.target.closest(hoverSelector) && !event.relatedTarget?.closest?.(hoverSelector)) {
    document.body.classList.remove("cursor-hover");
  }
});

window.addEventListener("pointerleave", () => {
  document.body.classList.remove("cursor-hover");
  if (!cursorVisible) {
    document.body.classList.remove("cursor-visible");
  }
});

window.addEventListener("blur", () => {
  document.body.classList.remove("cursor-hover", "cursor-visible");
});

window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", resizeCanvas);

resizeCanvas();
updateScrollProgress();
drawScene();

const repoData = [
  {
    name: "multi-modal-vision-pipeline",
    description: "Python pipeline for multi-modal vision experiments.",
    language: "Python",
    updatedAt: "2026-04-14T19:49:14Z",
    url: "https://github.com/data-geek-astronomy/multi-modal-vision-pipeline"
  },
  {
    name: "ads-bid-health-monitor",
    description: "Monitoring framework for auction health and fraud signals.",
    language: "Python",
    updatedAt: "2026-04-13T07:52:01Z",
    url: "https://github.com/data-geek-astronomy/ads-bid-health-monitor"
  },
  {
    name: "ad-auction-simulator",
    description: "Auction simulation playground for ad decisioning experiments.",
    language: "Python",
    updatedAt: "2026-04-13T07:03:25Z",
    url: "https://github.com/data-geek-astronomy/ad-auction-simulator"
  },
  {
    name: "safety-query-system",
    description: "Safety-oriented query system for controlled responses and retrieval.",
    language: "Python",
    updatedAt: "2026-02-18T18:04:08Z",
    url: "https://github.com/data-geek-astronomy/safety-query-system"
  },
  {
    name: "chem-rag",
    description: "Retrieval-augmented chemistry assistant and notebook experiments.",
    language: "Python",
    updatedAt: "2026-02-18T03:24:19Z",
    url: "https://github.com/data-geek-astronomy/chem-rag"
  },
  {
    name: "gender-detection",
    description: "Notebook-based classification experiment for gender detection.",
    language: "Jupyter Notebook",
    updatedAt: "2026-05-14T05:30:14Z",
    url: "https://github.com/data-geek-astronomy/gender-detection"
  },
  {
    name: "netflix_eda",
    description: "Exploratory notebook for Netflix dataset analysis.",
    language: "Jupyter Notebook",
    updatedAt: "2026-05-14T00:24:45Z",
    url: "https://github.com/data-geek-astronomy/netflix_eda"
  },
  {
    name: "airbnb_eda",
    description: "Exploratory notebook for Airbnb dataset analysis.",
    language: "Jupyter Notebook",
    updatedAt: "2026-05-12T01:35:57Z",
    url: "https://github.com/data-geek-astronomy/airbnb_eda"
  },
  {
    name: "Diabetes-prediction",
    description: "Notebook-based diabetes prediction model.",
    language: "Jupyter Notebook",
    updatedAt: "2025-07-10T18:08:44Z",
    url: "https://github.com/data-geek-astronomy/Diabetes-prediction"
  },
  {
    name: "Iris-Flower-Classification",
    description: "Classic flower classification notebook project.",
    language: "Jupyter Notebook",
    updatedAt: "2025-06-27T18:58:37Z",
    url: "https://github.com/data-geek-astronomy/Iris-Flower-Classification"
  },
  {
    name: "Breast-Cancer-Classification",
    description: "Classification project focused on breast cancer prediction.",
    language: "Python",
    updatedAt: "2024-04-26T22:55:38Z",
    url: "https://github.com/data-geek-astronomy/Breast-Cancer-Classification"
  },
  {
    name: "Human-Emotion-Recognition-from-Text-and-Voice-Data",
    description: "Emotion recognition project using text and voice features.",
    language: "Python",
    updatedAt: "2024-01-19T08:54:01Z",
    url: "https://github.com/data-geek-astronomy/Human-Emotion-Recognition-from-Text-and-Voice-Data"
  },
  {
    name: "twitter-sentimental-analysis",
    description: "Twitter sentiment analysis project.",
    language: "Python",
    updatedAt: "2024-01-19T08:41:22Z",
    url: "https://github.com/data-geek-astronomy/twitter-sentimental-analysis"
  }
];

function formatUpdatedAt(value) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(date);
}

function accentForIndex(index) {
  const palette = ["#58b8ff", "#35d399", "#f6c15f", "#ff7b6e", "#a78bfa"];
  return palette[index % palette.length];
}

function renderRepos() {
  if (!repoGrid) return;

  repoGrid.innerHTML = repoData
    .map((repo, index) => {
      const accent = accentForIndex(index);
      return `
        <article class="repo-card tilt-card in-view" style="--accent:${accent}">
          <div class="repo-accent"></div>
          <div class="repo-top">
            <p class="project-kicker">${repo.language}</p>
            <h3 class="repo-name">${repo.name}</h3>
            <p class="repo-desc">${repo.description}</p>
          </div>
          <div>
            <div class="repo-meta">
              <span>Updated ${formatUpdatedAt(repo.updatedAt)}</span>
              <span>Public repo</span>
            </div>
            <div class="repo-footer">
              <span class="eyebrow" style="margin:0;color:${accent};">GitHub</span>
              <a class="repo-link" href="${repo.url}" aria-label="Open ${repo.name} on GitHub">View on GitHub</a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

renderRepos();

if (repoRail) {
  let isDragging = false;
  let dragStartX = 0;
  let scrollStartX = 0;

  repoRail.addEventListener("pointerdown", (event) => {
    if (event.target.closest("a")) {
      return;
    }
    isDragging = true;
    dragStartX = event.clientX;
    scrollStartX = repoRail.scrollLeft;
    repoRail.classList.add("is-dragging");
    repoRail.setPointerCapture(event.pointerId);
  });

  repoRail.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    const delta = event.clientX - dragStartX;
    repoRail.scrollLeft = scrollStartX - delta;
  });

  const stopDrag = () => {
    isDragging = false;
    repoRail.classList.remove("is-dragging");
  };

  repoRail.addEventListener("pointerup", stopDrag);
  repoRail.addEventListener("pointercancel", stopDrag);
  repoRail.addEventListener("pointerleave", stopDrag);
}
