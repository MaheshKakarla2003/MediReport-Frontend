const API_BASE =
  "https://medireport-fullstack-sprinboot-project.onrender.com/api";

document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!user || user.role !== "CUSTOMER") {
    window.location.href = "login.html";
    return;
  }
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", handleLogout);

  await loadProfile(user.customerId);
});

async function loadProfile(customerId) {
  try {
    const res = await fetch(`${API_BASE}/customers/${customerId}`);
    if (!res.ok) throw new Error("Failed to load profile");

    const data = await res.json();

    document.getElementById("userId").value = data.id;
    document.getElementById("name").value = data.customerName;
    document.getElementById("email").value = JSON.parse(
      localStorage.getItem("loggedInUser"),
    ).username;
    document.getElementById("mobile").value = data.contactNumber;

    setupEditActions(data);
  } catch (err) {
    showToast(err.message, "error");
  }
}

function setupEditActions(originalData) {
  const editBtn = document.getElementById("editBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const deleteBtn = document.getElementById("deleteBtn");

  editBtn.addEventListener("click", () => toggleEditMode(true));
  cancelBtn.addEventListener("click", () => {
    restoreOriginal(originalData);
    toggleEditMode(false);
  });
  deleteBtn.addEventListener("click", () =>
    deleteAccount(JSON.parse(localStorage.getItem("loggedInUser")).id),
  );

  document
    .getElementById("profileForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await saveProfile(originalData);
    });
}

function toggleEditMode(enable) {
  ["name", "email", "mobile"].forEach((id) => {
    document.getElementById(id).disabled = !enable;
  });

  document.getElementById("editBtn").classList.toggle("hidden", enable);
  document.getElementById("cancelBtn").classList.toggle("hidden", !enable);
  document.getElementById("saveBtn").classList.toggle("hidden", !enable);
}

function restoreOriginal(data) {
  document.getElementById("name").value = data.customerName;
  document.getElementById("email").value = JSON.parse(
    localStorage.getItem("loggedInUser"),
  ).username;
  document.getElementById("mobile").value = data.contactNumber;
  clearErrors(document.getElementById("profileForm"));
}

async function saveProfile(originalData) {
  clearErrors(document.getElementById("profileForm"));

  const customerName = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("mobile").value.trim();

  let valid = true;

  if (!customerName) {
    showFieldError("nameError", "Name is required");
    valid = false;
  }

  if (!email.includes("@")) {
    showFieldError("emailError", "Invalid email");
    valid = false;
  }

  if (!/^\d{10}$/.test(phone)) {
    showFieldError("mobileError", "Mobile must be 10 digits");
    valid = false;
  }

  if (!valid) return;

  try {
    const res = await fetch(
      `${API_BASE}/update-customer/${originalData.id}/${
        JSON.parse(localStorage.getItem("loggedInUser")).id
      }`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName, email, phone }),
      },
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Update failed");
    }

    showToast("Profile updated successfully. Please login again.", "success");

    // FORCE LOGOUT
    setTimeout(() => {
      localStorage.clear();
      window.location.href = "login.html";
    }, 1800);
  } catch (err) {
    showToast(err.message, "error");
  }
}

function handleLogout() {
  localStorage.clear();
  window.location.href = "login.html";
}

async function deleteAccount(userId) {
  if (
    !confirm(
      "Are you sure you want to delete your account? This action cannot be undone.",
    )
  ) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/${userId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to delete account");
    }

    showToast("Account deleted successfully", "success");

    // Clear local storage and redirect to login
    setTimeout(() => {
      localStorage.clear();
      window.location.href = "login.html";
    }, 1500);
  } catch (err) {
    showToast(err.message, "error");
  }
}
