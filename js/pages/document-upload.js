document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) {
    window.location.href = "login.html";
  }

  if (user.role !== "HOSPITAL") {
    window.location.href = "login.html";
  }

  // Auto-populate visit ID if coming from hospital dashboard
  const selectedVisitId = localStorage.getItem("selectedVisitId");
  if (selectedVisitId) {
    const visitIdField = document.getElementById("visitId");
    if (visitIdField) {
      visitIdField.value = selectedVisitId;
    }
    // Clear the stored ID so it doesn't persist for future documents
    localStorage.removeItem("selectedVisitId");
  }
});

const BASE_URL =
  "https://medireport-fullstack-sprinboot-project.onrender.com/api/documents/upload";

const form = document.getElementById("document-uploadForm");

// Clear all field error texts
function clearFieldErrors() {
  const errorElements = document.querySelectorAll(".error");
  errorElements.forEach((el) => (el.textContent = ""));
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  clearFieldErrors();

  const data = new FormData(form);

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
        showToast(errorBody.message || "Document Upload failed", "error");

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
          "Document Upload failed with status " + response.status,
          "error",
        );
      }

      return; // stop here, do not treat as success
    }

    showToast("Document uploaded successfully", "success");

    form.reset();
  } catch (err) {
    console.error("Network or JS error:", err);
    showToast("Network error: " + err.message, "error");
  }
});
