function clearErrors(form) {
  form.querySelectorAll(".error-text").forEach((e) => e.remove());
  form
    .querySelectorAll(".input-error")
    .forEach((e) => e.classList.remove("input-error"));
}

function showFieldError(input, message) {
  input.classList.add("input-error");

  const error = document.createElement("div");
  error.className = "error-text";
  error.innerText = message;

  input.parentElement.appendChild(error);
}

//pagination

async function fetchPaginatedData(url, page, size) {
  const res = await authenticatedFetch(
    `${url}?pageNo=${page}&pageSize=${size}`,
  );
  if (!res.ok) throw new Error("Failed to fetch data");
  return await res.json();
}

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  showToast("Logged out successfully", "success");
  setTimeout(() => (window.location.href = "login.html"), 1000);
});

/**
 * Make an authenticated API request with JWT token
 * Automatically handles 401 responses by clearing storage and redirecting to login
 * @param {string} url - The API endpoint URL
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise<Response>}
 */
async function authenticatedFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  // Initialize headers if not present
  if (!options.headers) {
    options.headers = {};
  }

  // Add authorization header if token exists
  if (token) {
    options.headers["Authorization"] = "Bearer " + token;
  }

  try {
    const response = await fetch(url, options);

    // Handle token expiration (401 Unauthorized)
    if (response.status === 401) {
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("token");
      showToast("Session expired. Please login again.", "error");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
      return response;
    }

    return response;
  } catch (err) {
    console.error("Request error:", err);
    throw err;
  }
}
