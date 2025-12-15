// The RestAPI helps the application/browser to send an HTTP/HTTPS GET Request from Github(server). The server then responds by sending back HTTP response to the application or browser

// This means:

// Browser → HTTP GET request → GitHub server

// GitHub server → HTTP response (JSON) → Browser

const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");
const status = document.getElementById("status");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let debounceTimer;
let currentPage = 1;
let lastQuery = "";
const perPage = 10; // number of users per page

// Fetch GitHub users
async function fetchUsers(query, page = 1) {
  if (!query) {
    results.innerHTML = "";
    status.textContent = "";
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    return;
  }

  status.textContent = "Loading...";
  results.innerHTML = "";

  try {
    const response = await fetch(
      `https://api.github.com/search/users?q=${query}&per_page=${perPage}&page=${page}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();

    status.textContent = `${data.total_count} users found`;

    // Display users
    data.items.slice(0, 5).forEach((user) => {
      const div = document.createElement("div");
      div.className = "user";
      div.innerHTML = `
        <img src="${user.avatar_url}" />
        <a href="${user.html_url}" target="_blank">${user.login}</a>
      `;
      results.appendChild(div);
    });

    // Handle pagination buttons
    prevBtn.disabled = page === 1;
    nextBtn.disabled = page * perPage >= data.total_count;
  } catch (error) {
    status.textContent = "Error fetching users";
    prevBtn.disabled = true;
    nextBtn.disabled = true;
  }
}

// Debounced search
searchInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    currentPage = 1; // reset to first page on new search
    lastQuery = searchInput.value.trim();
    fetchUsers(lastQuery, currentPage);
  }, 500);
});

// Pagination button events
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
