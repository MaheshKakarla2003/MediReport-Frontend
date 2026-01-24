const API_BASE =
  "https://medireport-fullstack-sprinboot-project.onrender.com/api";

document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!user || user.role !== "HOSPITAL") {
    window.location.href = "login.html";
  }

  const response = await fetch(`${API_BASE}/hospitals/${user.hospitalId}`, {
    method: "GET",
  });

  if (!response.ok) {
    showToast("Failed to load hospital data", "error");
    return;
  }

  const data = await response.json();
  console.log("Hospital Data:", data);

  // Welcome text
  document.getElementById("welcomeText").innerText =
    `Welcome back, ${data.name} !`;

  // Load patients
  await loadPatients(user.hospitalId);

  // Navigation buttons
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

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });

  document.getElementById("addPatientBtn").addEventListener("click", () => {
    window.location.href = "../patient-upload.html";
  });

  document
    .getElementById("addFirstPatientBtn")
    .addEventListener("click", () => {
      window.location.href = "../patient-upload.html";
    });

  document.getElementById("createVisitBtn").addEventListener("click", () => {
    localStorage.setItem("selectedPatientId", window.currentPatientId);
    window.location.href = "../visit-upload.html";
  });

  document.getElementById("addDocumentBtn").addEventListener("click", () => {
    localStorage.setItem("selectedVisitId", window.currentVisitId);
    window.location.href = "../document-upload.html";
  });

  document.getElementById("searchBtn").addEventListener("click", async () => {
    const phone = document.getElementById("searchInput").value.trim();
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (phone) {
      await searchPatientsByPhone(phone, user.hospitalId);
    } else {
      await loadPatients(user.hospitalId);
    }
  });
});

async function loadPatients(hospitalId) {
  try {
    const res = await fetch(`${API_BASE}/patients/by-hospitalId/${hospitalId}`);
    if (!res.ok) throw new Error("Failed to load patients");

    const patients = await res.json();
    const tbody = document.querySelector("#patientsTable tbody");
    tbody.innerHTML = "";

    // Clear any previous messages
    document.getElementById("no-visits-for-patient").innerText = "";
    document.getElementById("mobile-search-error").innerText = "";

    if (patients.length === 0) {
      // Hide patients section and show no patients section
      document.getElementById("patientsSection").classList.add("hidden");
      document.getElementById("noPatientsSection").classList.remove("hidden");
      return;
    }

    // Show patients section and hide no patients section
    document.getElementById("patientsSection").classList.remove("hidden");
    document.getElementById("noPatientsSection").classList.add("hidden");

    patients.forEach((patient, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${patient.fullName}</td>
        <td>${patient.phoneNumber}</td>
        <td>${patient.age}</td>
        <td>${patient.gender}</td>
        <td>
          <div class="table-actions">
            <button class="table-btn view" onclick="viewVisits(${
              patient.id
            }, '${patient.fullName}')">
              <i class="fa-solid fa-eye"></i> View Visits
            </button>
            <button class="table-btn delete" onclick="deletePatient(${
              patient.id
            }, '${patient.fullName}')">
              <i class="fa-solid fa-trash"></i> Delete
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function viewVisits(patientId, patientName) {
  window.currentPatientId = patientId;
  document.getElementById("selectedPatientName").innerText = patientName;

  try {
    const res = await fetch(
      `${API_BASE}/visits/patient/${patientId}/hospital/${
        JSON.parse(localStorage.getItem("loggedInUser")).hospitalId
      }`,
    );
    if (!res.ok) throw new Error("Failed to load visits");

    const visits = await res.json();

    // document.getElementById("documentsSection").classList.add("hidden");
    const tbody = document.querySelector("#visitsTable tbody");
    tbody.innerHTML = "";

    // Clear any previous messages
    document.getElementById("no-visits-for-patient").innerText = "";
    document.getElementById("visitsSection").classList.remove("hidden");
    if (visits.length === 0) {
      document.getElementById("no-visits-for-patient").innerText =
        "No visits found.Add a visit now.";
      document.getElementById("documentsSection").classList.add("hidden");
      return;
    }

    visits.forEach((visit, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${visit.visitDate}</td>
        <td>Dr. ${visit.doctorName}</td>
        <td> ${visit.diseaseName}</td>
        <td>
          <div class="table-actions">
            <button class="table-btn view" onclick="viewDocuments(${
              visit.id
            }, '${visit.diseaseName}')">
              <i class="fa-solid fa-eye"></i> View Documents
            </button>
            <button class="table-btn delete" onclick="deleteVisit(${
              visit.id
            }, '${visit.diseaseName}')">
              <i class="fa-solid fa-trash"></i> Delete
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function viewDocuments(visitId, visitName) {
  window.currentVisitId = visitId;
  document.getElementById("selectedVisitName").innerText = visitName;

  try {
    const res = await fetch(`${API_BASE}/documents/visit/${visitId}`);
    if (!res.ok) throw new Error("Failed to load documents");

    const documents = await res.json();

    // Clear any previous messages
    document.getElementById("no-documents-for-visit").innerText = "";
    const tbody = document.querySelector("#documentsTable tbody");
    tbody.innerHTML = "";

    document.getElementById("documentsSection").classList.remove("hidden");
    if (documents.length === 0) {
      document.getElementById("no-documents-for-visit").innerText =
        "No documents found. Add the documents now.";
      return;
    }

    documents.forEach((doc, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${doc.docType}</td>
        <td>${doc.description}</td>
        <td>${doc.reportDate}</td>
        <td>
          <div class="table-actions">
            <button class="table-btn view" onclick="window.open('${API_BASE}/documents/${
              doc.id
            }/file')">
              <i class="fa-solid fa-eye"></i> Open
            </button>
            <button class="table-btn delete" onclick="deleteDocument(${
              doc.id
            }, '${doc.docType}')">
              <i class="fa-solid fa-trash"></i> Delete
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function searchPatientsByPhone(input, hospitalId) {
  // Clear previous error
  document.getElementById("mobile-search-error").innerText = "";

  const inputLength = input.trim().length;
  let apiUrl;
  let searchType;

  // Validate input and determine search type
  if (inputLength === 10) {
    // Search by mobile number
    if (!/^\d{10}$/.test(input)) {
      document.getElementById("mobile-search-error").innerText =
        "Mobile number must contain only 10 digits";
      return;
    }
    apiUrl = `${API_BASE}/patients/by-hospitalId&mobile/${hospitalId}/${input}`;
    searchType = "mobile";
  } else if (inputLength === 12) {
    // Search by Aadhaar number
    if (!/^\d{12}$/.test(input)) {
      document.getElementById("mobile-search-error").innerText =
        "Aadhaar number must contain only 12 digits";
      return;
    }
    apiUrl = `${API_BASE}/patients/${input}/${hospitalId}`;
    searchType = "aadhaar";
  } else {
    // Invalid input length
    document.getElementById("mobile-search-error").innerText =
      "Please enter a valid mobile number (10 digits) or Aadhaar number (12 digits)";
    return;
  }

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("Failed to search patients");

    const patients = await res.json();

    // Clear any previous messages
    document.getElementById("no-visits-for-patient").innerText = "";

    if (patients.length === 0) {
      // Hide patients section and show no patients section
      document.getElementById("patientsSection").classList.add("hidden");
      document.getElementById("noPatientsSection").classList.remove("hidden");
      return;
    }

    // Show patients section and hide no patients section
    document.getElementById("patientsSection").classList.remove("hidden");
    document.getElementById("noPatientsSection").classList.add("hidden");
    const tbody = document.querySelector("#patientsTable tbody");
    tbody.innerHTML = "";

    patients.forEach((patient, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${patient.fullName}</td>
        <td>${patient.phoneNumber}</td>
        <td>${patient.age}</td>
        <td>${patient.gender}</td>
        <td>
          <div class="table-actions">
            <button class="table-btn view" onclick="viewVisits(${
              patient.id
            }, '${patient.fullName}')">
              <i class="fa-solid fa-eye"></i> View Visits
            </button>
            <button class="table-btn delete" onclick="deletePatient(${
              patient.id
            }, '${patient.fullName}')">
              <i class="fa-solid fa-trash"></i> Delete
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    showToast(err.message, "error");
  }
}

// Delete functions
async function deletePatient(patientId, patientName) {
  if (
    !confirm(
      `Are you sure you want to delete patient "${patientName}"? This action cannot be undone.`,
    )
  ) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/patients/${patientId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete patient");
    }

    showToast(`Patient "${patientName}" deleted successfully`, "success");
    // Reload patients list
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    await loadPatients(user.hospitalId);
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function deleteVisit(visitId, diseaseName) {
  if (
    !confirm(
      `Are you sure you want to delete the visit for "${diseaseName}"? This action cannot be undone.`,
    )
  ) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/visits/${visitId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete visit");
    }

    showToast(`Visit for "${diseaseName}" deleted successfully`, "success");
    // Reload visits for current patient
    if (window.currentPatientId) {
      const patientName = document.getElementById(
        "selectedPatientName",
      ).innerText;
      await viewVisits(window.currentPatientId, patientName);
    }
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function deleteDocument(documentId, docType) {
  if (
    !confirm(
      `Are you sure you want to delete the "${docType}" document? This action cannot be undone.`,
    )
  ) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/documents/${documentId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete document");
    }

    showToast(`"${docType}" document deleted successfully`, "success");
    // Reload documents for current visit
    if (window.currentVisitId) {
      const visitName = document.getElementById("selectedVisitName").innerText;
      await viewDocuments(window.currentVisitId, visitName);
    }
  } catch (err) {
    showToast(err.message, "error");
  }
}
