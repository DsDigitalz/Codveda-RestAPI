const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");
const status = document.getElementById("status");

let debounceTimer;

// Fetch GitHub users
async function fetchUsers(query) {
  if (!query) {
    results.innerHTML = "";
    status.textContent = "";
    return;
  }

  status.textContent = "Loading...";
  results.innerHTML = "";

  try {
    const response = await fetch(
      `https://api.github.com/search/users?q=${query}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();

    status.textContent = `${data.items.length} users found`;

    data.items.slice(0, 5).forEach((user) => {
      const div = document.createElement("div");
      div.className = "user";

      div.innerHTML = `
        <img src="${user.avatar_url}" />
        <a href="${user.html_url}" target="_blank">${user.login}</a>
      `;

      results.appendChild(div);
    });
  } catch (error) {
    status.textContent = "Error fetching users";
  }
}

// Debounced search
searchInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    fetchUsers(searchInput.value.trim());
  }, 500); // 500ms debounce
});
