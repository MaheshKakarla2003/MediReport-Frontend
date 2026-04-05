const BASE_URL =
  "https://medireport-fullstack-sprinboot-project.onrender.com/api";

const form = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const usernameError = document.getElementById("usernameError");
const passwordError = document.getElementById("passwordError");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  clearErrors();

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  let isValid = true;

  if (!username) {
    usernameError.textContent = "Email is required";
    isValid = false;
  }

  if (!password) {
    passwordError.textContent = "Password is required";
    isValid = false;
  } else if (password.length < 8) {
    passwordError.textContent = "Password must be at least 8 characters";
    isValid = false;
  }

  if (!isValid) return;

  try {
    const response = await fetch(
      `${BASE_URL}/login?username=${encodeURIComponent(
        username,
      )}&password=${encodeURIComponent(password)}`,
      { method: "GET" },
    );

    const data = await response.json();

    if (!response.ok) {
      showToast(data.message || "Login failed", "error");
      return;
    }

    // Check if authentication failed (jwtToken is "failure")
    if (data.jwtToken === "failure") {
      showToast("Authentication failed", "error");
      return;
    }

    // Store logged-in user with JWT token
    localStorage.setItem("loggedInUser", JSON.stringify(data));
    localStorage.setItem("token", data.jwtToken);

    showToast("Login successful", "success");

    setTimeout(() => {
      if (data.role === "HOSPITAL") {
        window.location.href = "hospital-dashboard.html";
      } else if (data.role === "CUSTOMER") {
        window.location.href = "customer-dashboard.html";
      }
    }, 800);
  } catch (err) {
    showToast("Server unreachable", "error");
  }
});

function clearErrors() {
  usernameError.textContent = "";
  passwordError.textContent = "";
}
