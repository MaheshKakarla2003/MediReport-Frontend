document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    showToast("Logged out successfully", "success");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 800);
  });

  document.getElementById("home").addEventListener("click", () => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (user.role === "HOSPITAL") {
      window.location.href = "hospital-dashboard.html";
    } else if (user.role === "CUSTOMER") {
      window.location.href = "customer-dashboard.html";
    } else {
      window.location.href = "login.html";
    }
  });

  document.getElementById("profile").addEventListener("click", () => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (user.role === "HOSPITAL") {
      window.location.href = "hospital-profile.html";
    } else if (user.role === "CUSTOMER") {
      window.location.href = "customer-profile.html";
    } else {
      window.location.href = "login.html";
    }
  });
});
