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

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  showToast("Logged out successfully", "success");
  setTimeout(() => (window.location.href = "login.html"), 1000);
});

