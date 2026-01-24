const API_BASE =
  "https://medireport-fullstack-sprinboot-project.onrender.com/api";

document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!user || user.role !== "HOSPITAL") {
    window.location.href = "login.html";
    return;
  }

  // Load hospital
  const response = await fetch(`${API_BASE}/hospitals/${user.hospitalId}`, {
    method: "GET",
  });

  if (!response.ok) {
    showToast("Failed to load hospital data", "error");
    return;
  }

  const data = await response.json();
  document.getElementById("welcomeText").innerText =
    `Welcome back, ${data.name} !`;

  // Load patients
  await loadPatients(user.hospitalId);

  // Navigation buttons
  document.getElementById("home").addEventListener("click", () => {
    window.location.href = "hospital-dashboard.html";
  });

  document.getElementById("profile").addEventListener("click", () => {
    window.location.href = "hospital-profile.html";
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });

  document.getElementById("addPatientBtn").addEventListener("click", () => {
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
});

async function loadPatients(hospitalId) {
  try {
    const res = await fetch(`${API_BASE}/patients/by-hospitalId/${hospitalId}`);
    if (!res.ok) throw new Error("Failed to load patients");

    const patients = await res.json();
    const tbody = document.querySelector("#patientsTable tbody");
    tbody.innerHTML = "";

    if (patients.length === 0) {
      document.getElementById("no-patients").innerText = "No patients found.";
      return;
    }

    patients.forEach((patient, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${patient.fullName}</td>
        <td>${patient.phoneNumber}</td>
        <td>${patient.age}</td>
        <td>${patient.gender}</td>
        <td>
          <button class="table-btn view" onclick="viewVisits(${patient.id}, '${
            patient.fullName
          }')">
            <i class="fa-solid fa-eye"></i> View Visits
          </button>
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
  document.getElementById("visitsSection").classList.remove("hidden");
  document.getElementById("documentsSection").classList.add("hidden");

  try {
    const res = await fetch(
      `${API_BASE}/visits/patient/${patientId}/hospital/${
        JSON.parse(localStorage.getItem("loggedInUser")).hospitalId
      }`,
    );
    if (!res.ok) throw new Error("Failed to load visits");

    const visits = await res.json();
    const tbody = document.querySelector("#visitsTable tbody");
    tbody.innerHTML = "";

    if (visits.length === 0) {
      document.getElementById("no-visits").innerText = "No visits found.";
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
          <button class="table-btn view" onclick="viewDocuments(${visit.id}, '${
            visit.diseaseName
          }')">
            <i class="fa-solid fa-eye"></i> View Documents
          </button>
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
  document.getElementById("documentsSection").classList.remove("hidden");

  try {
    const res = await fetch(`${API_BASE}/documents?visitId=${visitId}`);
    if (!res.ok) throw new Error("Failed to load documents");

    const documents = await res.json();
    const tbody = document.querySelector("#documentsTable tbody");
    tbody.innerHTML = "";

    if (documents.length === 0) {
      document.getElementById("no-documents").innerText = "No documents found.";
      return;
    }

    documents.forEach((doc, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${doc.fileType}</td>
        <td>${doc.description}</td>
        <td>${doc.uploadDate}</td>
        <td>
          <button class="table-btn view" onclick="viewDocument(${doc.id})">
            <i class="fa-solid fa-eye"></i> Open
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function viewDocument(documentId) {
  try {
    // Call the view endpoint to get the document
    const response = await fetch(`${API_BASE}/documents/view/${documentId}`);
    if (!response.ok) {
      throw new Error("Failed to view document");
    }

    // Get the document blob and create a URL to open it
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");

    // Clean up the object URL after a delay
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
  } catch (error) {
    showToast("Failed to open document: " + error.message, "error");
  }
}
