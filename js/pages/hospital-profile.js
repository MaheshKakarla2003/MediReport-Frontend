const API_BASE = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!user || user.role !== "HOSPITAL") {
    window.location.href = "login.html";
    return;
  }
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", handleLogout);

  await loadProfile(user.hospitalId);
});

async function loadProfile(hospitalId) {
  try {
    const res = await authenticatedFetch(
      `${API_BASE}/hospitals/hospitalRole/${hospitalId}`,
    );
    if (!res.ok) throw new Error("Failed to load profile");

    const data = await res.json();

    document.getElementById("hospitalId").value = data.id;
    document.getElementById("name").value = data.name;
    document.getElementById("email").value = JSON.parse(
      localStorage.getItem("loggedInUser"),
    ).username;
    document.getElementById("contact").value = data.contactNumber;
    document.getElementById("hospitalEmail").value = data.email || "";
    document.getElementById("address").value = data.address || "";
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
  ["name", "email", "contact", "hospitalEmail", "address"].forEach((id) => {
    document.getElementById(id).disabled = !enable;
  });

  document.getElementById("editBtn").classList.toggle("hidden", enable);
  document.getElementById("cancelBtn").classList.toggle("hidden", !enable);
  document.getElementById("saveBtn").classList.toggle("hidden", !enable);
}

function restoreOriginal(data) {
  document.getElementById("name").value = data.hospitalName;
  document.getElementById("email").value = JSON.parse(
    localStorage.getItem("loggedInUser"),
  ).username;
  document.getElementById("contact").value = data.contactNumber;
  document.getElementById("hospitalEmail").value = data.hospitalEmail || "";
  document.getElementById("address").value = data.address || "";
  clearErrors(document.getElementById("profileForm"));
}

async function saveProfile(originalData) {
  clearErrors(document.getElementById("profileForm"));

  const hospitalName = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("contact").value.trim();
  const hospitalEmail = document.getElementById("hospitalEmail").value.trim();
  const address = document.getElementById("address").value.trim();

  let valid = true;

  if (!hospitalName) {
    showFieldError("nameError", "Hospital Name is required");
    valid = false;
  }

  if (!email.includes("@")) {
    showFieldError("emailError", "Invalid email");
    valid = false;
  }

  if (!/^\d{10}$/.test(phone)) {
    showFieldError("contactError", "Contact must be 10 digits");
    valid = false;
  }

  if (!hospitalEmail.includes("@")) {
    showFieldError("hospitalEmailError", "Invalid hospital email");
    valid = false;
  }

  if (!address) {
    showFieldError("addressError", "Address is required");
    valid = false;
  }

  if (!valid) return;

  try {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    const res = await authenticatedFetch(
      `${API_BASE}/hospitalRole/update-hospital/${originalData.id}/${user.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospitalName,
          email,
          phone,
          hospitalEmail,
          address,
        }),
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
    const res = await authenticatedFetch(`${API_BASE}/${userId}`, {
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
