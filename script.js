const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");
const status = document.getElementById("status");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let debounceTimer;
let currentPage = 1;
let lastQuery = "";
const perPage = 5;

// Fetch GitHub users
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

    prevBtn.disabled = page === 1;
    nextBtn.disabled = page * perPage >= data.total_count;
  } catch {
    status.textContent = "Error fetching users";
    prevBtn.disabled = true;
    nextBtn.disabled = true;
  }
}

// Debounced search
searchInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    currentPage = 1;
    lastQuery = searchInput.value.trim();
    fetchUsers(lastQuery, currentPage);
  }, 500);
});

// Pagination
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
