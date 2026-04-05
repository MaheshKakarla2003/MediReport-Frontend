const BASE_URL = "http://localhost:8080/api";

const form = document.getElementById("hospitalRegisterForm");

const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const confirmPasswordError = document.getElementById("confirmPasswordError");
// Clear all field error texts
function clearFieldErrors() {
  const errorElements = document.querySelectorAll(".error");
  errorElements.forEach((el) => (el.textContent = ""));
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  clearFieldErrors();
  const password1 = password.value.trim();
  const password2 = confirmPassword.value.trim();

  // Client-side validations
  let hasError = false;

  if (password1 !== password2) {
    confirmPasswordError.textContent = "Passwords do not match";
    hasError = true;
  }

  if (hasError) return;

  const data = new FormData(form);

  try {
    const response = await fetch(`${BASE_URL}/register-hospital`, {
      method: "POST",
      body: data,
    });

    if (!response.ok) {
      // Probably a validation or business error coming from our GlobalExceptionHandler
      const errorBody = await response.json().catch(() => null);

      if (errorBody && errorBody.success === false) {
        // Show main message
        showToast(errorBody.message || "Registration failed", "error");

        // Show field-level validation errors if present
        if (Array.isArray(errorBody.errors)) {
          errorBody.errors.forEach((err) => {
            // err.field might be like
            const fieldErrorElement = document.getElementById(
              `${err.field}-error`,
            );
            if (fieldErrorElement) {
              fieldErrorElement.textContent = err.message;
            }
          });
        }
      } else {
        showToast(
          "Registration failed with status " + response.status,
          "error",
        );
      }

      return; // stop here, do not treat as success
    }

    showToast("Hospital registered successfully", "success");

    setTimeout(() => {
      window.location.href = "./login.html";
    }, 1500);
  } catch (err) {
    console.error("Network or JS error:", err);
    showToast("Network error: " + err.message, "error");
  }
});
