document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) {
    window.location.href = "login.html";
  }

  if (user.role !== "HOSPITAL") {
    window.location.href = "login.html";
  }

  // Auto-populate patient ID if coming from hospital dashboard
  const selectedPatientId = localStorage.getItem("selectedPatientId");
  if (selectedPatientId) {
    const patientIdField = document.querySelector('input[name="patientId"]');
    if (patientIdField) {
      patientIdField.value = selectedPatientId;
    }
    // Clear the stored ID so it doesn't persist for future visits
    localStorage.removeItem("selectedPatientId");
  }
});

const BASE_URL =
  "https://medireport-fullstack-sprinboot-project.onrender.com/api/visits";

const form = document.getElementById("visitUploadForm");

// Clear all field error texts
function clearFieldErrors() {
  const errorElements = document.querySelectorAll(".error");
  errorElements.forEach((el) => (el.textContent = ""));
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  clearFieldErrors();

  const data = new FormData(form);
  data.append(
    "hospitalId",
    JSON.parse(localStorage.getItem("loggedInUser")).hospitalId,
  );

  try {
    const response = await fetch(`${BASE_URL}`, {
      method: "POST",
      body: data,
    });

    if (!response.ok) {
      // Probably a validation or business error coming from our GlobalExceptionHandler
      const errorBody = await response.json().catch(() => null);

      if (errorBody && errorBody.success === false) {
        // Show main message
        showToast(errorBody.message || "Visit Upload failed", "error");

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
          "Visit Upload failed with status " + response.status,
          "error",
        );
      }

      return; // stop here, do not treat as success
    }

    showToast("Patient Visit data uploaded successfully", "success");

    form.reset();
  } catch (err) {
    console.error("Network or JS error:", err);
    showToast("Network error: " + err.message, "error");
  }
});
