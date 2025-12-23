gsap.registerPlugin(ScrollTrigger);

// Accessibility: reduced motion
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (prefersReducedMotion) {
  gsap.globalTimeline.timeScale(0.01);
}

const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");
const status = document.getElementById("status");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let debounceTimer;
let currentPage = 1;
let lastQuery = "";
const perPage = 5;

/* =========================
   PAGE LOAD TIMELINE
========================= */
gsap.timeline({ defaults: { ease: "power2.out" } })
  .from("h1", { y: -30, opacity: 0, duration: 0.6 })
  .from("#searchInput", { y: 20, opacity: 0, duration: 0.4 }, "-=0.3")
  .from(".pagination button", { opacity: 0, stagger: 0.2 }, "-=0.2");

/* =========================
   FETCH USERS
========================= */
async function fetchUsers(query, page = 1) {
  if (!query) {
    results.textContent = "";
    status.textContent = "";
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    return;
  }

  status.textContent = "Loading...";
  results.textContent = "";

  try {
    const response = await fetch(
      `https://api.github.com/search/users?q=${encodeURIComponent(
        query
      )}&per_page=${perPage}&page=${page}`,
      { cache: "force-cache" }
    );

    if (!response.ok) throw new Error();

    const data = await response.json();
    status.textContent = `${data.total_count} users found`;

    const fragment = document.createDocumentFragment();

    data.items.forEach(user => {
      const div = document.createElement("div");
      div.className = "user";

      div.innerHTML = `
        <img 
          src="${user.avatar_url}"
          alt="${user.login}"
          loading="lazy"
          width="40"
          height="40"
        />
        <a href="${user.html_url}" target="_blank" rel="noopener">
          ${user.login}
        </a>
      `;

      fragment.appendChild(div);
    });

    results.appendChild(fragment);

    animateUsers();
    addHoverEffects();

    prevBtn.disabled = page === 1;
    nextBtn.disabled = page * perPage >= data.total_count;
  } catch {
    status.textContent = "Error fetching users";
    prevBtn.disabled = true;
    nextBtn.disabled = true;
  }
}

/* =========================
   SCROLL ANIMATIONS
========================= */
function animateUsers() {
  gsap.from(".user", {
    scrollTrigger: {
      trigger: ".user",
      start: "top 85%",
    },
    y: 20,
    opacity: 0,
    stagger: 0.1,
    duration: 0.4,
    ease: "power2.out"
  });
}

/* =========================
   HOVER MICRO-INTERACTIONS
========================= */
function addHoverEffects() {
  document.querySelectorAll(".user").forEach(card => {
    card.addEventListener("mouseenter", () => {
      gsap.to(card, {
        scale: 1.05,
        boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
        duration: 0.3
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        scale: 1,
        boxShadow: "none",
        duration: 0.3
      });
    });
  });
}

/* =========================
   SEARCH (DEBOUNCED)
========================= */
searchInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    currentPage = 1;
    lastQuery = searchInput.value.trim();
    fetchUsers(lastQuery, currentPage);
  }, 500);
});

/* =========================
   PAGINATION
========================= */
prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchUsers(lastQuery, currentPage);
  }
});

nextBtn.addEventListener("click", () => {
  currentPage++;
  fetchUsers(lastQuery, currentPage);
});
