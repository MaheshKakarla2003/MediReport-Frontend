const API_BASE = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!user || user.role !== "CUSTOMER") {
    window.location.href = "login.html";
    return;
  }

  // Load customer
  const customerRes = await authenticatedFetch(
    `${API_BASE}/customers/customerRole/${user.customerId}`,
  );
  if (!customerRes.ok) {
    showToast("Failed to load customer data", "error");
    return;
  }

  const customer = await customerRes.json();
  document.getElementById("welcomeText").innerText =
    `Welcome back, ${customer.customerName}!`;

  // Auto-fetch records on page load
  await fetchPatients(customer.contactNumber);

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

/* ===================== FETCH FLOW ===================== */

async function fetchPatients(phone) {
  resetSections("patients");

  const res = await authenticatedFetch(
    `${API_BASE}/patients/customerRole/by-phone?phone=${encodeURIComponent(phone)}`,
  );

  const patients = await res.json();

  if (patients.length === 0) {
    // Show no records message
    document.getElementById("noRecordsSection").classList.remove("hidden");
    return;
  }

  // Hide no records message and show patients section
  document.getElementById("noRecordsSection").classList.add("hidden");

  const tbody = document.querySelector("#patientsTable tbody");
  tbody.innerHTML = "";

  patients.forEach((p, i) => {
    tbody.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${p.fullName}</td>
                <td>${p.aadhaar}</td>
                <td>${p.age}</td>
                <td>${p.gender}</td>
                <td>
                    <button class="table-btn view"
                        onclick="fetchHospitals(${p.aadhaar}, ${
                          p.phoneNumber
                        },'${p.fullName} ', ${p.id})">
                        View Hospitals
                    </button>
                </td>
            </tr>`;
  });

  showSection("patientsSection");
}

//////////////////////////////////////////////
async function fetchHospitals(aadhaar, phoneNumber, patientName, patientId) {
  resetSections("hospitals");
  clearFieldErrors();
  document.getElementById("selectedPatientName").innerText = patientName;

  const res = await authenticatedFetch(
    `${API_BASE}/patients/customerRole/hospitalList/${aadhaar}/${phoneNumber}`,
  );
  if (!res.ok) {
    const error = document.getElementById("no-hospitals");
    error.textContent = `No hospital Records found for ${patientName}`;
    return;
  }
  const hospitals = await res.json();
  console.log(hospitals);
  if (hospitals.length === 0) {
    const error = document.getElementById("no-hospitals");
    error.textContent = `No hospital Records found for ${patientName}`;
    return;
  }

  const tbody = document.querySelector("#hospitalsTable tbody");
  tbody.innerHTML = "";

  hospitals.forEach((h, i) => {
    tbody.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${h.name}</td>
                <td>${h.contactNumber}  |  ${h.email}</td>
                <td>${h.address}</td>
                <td>
                    <button class="table-btn view"
                        onclick="fetchVisits(${patientId}, ${h.id} , '${
                          h.name
                        }')">
                        View Visits
                    </button>
                </td>
            </tr>`;
  });

  showSection("hospitalsSection");
}

async function fetchVisits(patientId, hospitalId, hospitalName) {
  resetSections("visits");
  document.getElementById("selectedHospitalName").innerText = hospitalName;

  const res = await authenticatedFetch(
    `${API_BASE}/visits/patient/${patientId}/hospital/${hospitalId}`,
  );
  if (!res.ok) {
    const error = document.getElementById("no-visits");
    error.textContent = `No visit records found for ${hospitalName}`;
    return;
  }

  const visits = await res.json();
  if (visits.length === 0) {
    const error = document.getElementById("no-visits");
    error.textContent = `No visit records found for ${hospitalName}`;
    return;
  }

  const error = document.getElementById("no-visits");
  error.textContent = "";
  const tbody = document.querySelector("#visitsTable tbody");
  tbody.innerHTML = "";

  visits.forEach((v, i) => {
    tbody.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${v.diseaseName}</td>
                <td>Dr.${v.doctorName}</td>
                <td>${v.visitDate}</td>
                <td class="error">${v.reportCount || 0} reports</td>
                <td>
                    <button class="table-btn view"
                        onclick="fetchDocuments(${v.id}, '${v.diseaseName}')">
                        View Reports
                    </button>
                </td>
            </tr>`;
  });

  showSection("visitsSection");
}

async function fetchDocuments(visitId, visitName) {
  resetSections("documents");
  document.getElementById("selectedVisitName").innerText = visitName;

  const res = await authenticatedFetch(
    `${API_BASE}/documents/visit/${visitId}`,
  );
  if (!res.ok) {
    const error = document.getElementById("no-documents");
    error.textContent = `No documents found for ${visitName}`;
    return;
  }
  const docs = await res.json();
  if (docs.length === 0) {
    const error = document.getElementById("no-documents");
    error.textContent = `No documents found for ${visitName}`;
    return;
  }

  const tbody = document.querySelector("#documentsTable tbody");
  tbody.innerHTML = "";

  docs.forEach((d, i) => {
    tbody.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${d.docType}</td>
                <td>${d.description || "-"}</td>
                <td >${d.reportDate}</td>
                <td>
                    <div class="table-actions">
                        <button class="table-btn view"
                            onclick="viewDocument(${d.id})">
                            <i class="fa-solid fa-eye"></i> Open
                        </button>
                        <button class="table-btn download"
                                  onclick="downloadDocument(${d.id})">
                            <i class="fa-solid fa-download"></i> Download
                        </button>
                    </div>
                </td>
            </tr>`;
  });

  showSection("documentsSection");
}
async function viewDocument(docId) {
  const response = await authenticatedFetch(
    `${API_BASE}/documents/${docId}/file`,
  );

  const blob = await response.blob();

  const url = window.URL.createObjectURL(blob);
  window.open(url);
}

async function downloadDocument(docId) {
  const token = localStorage.getItem("token");

  const response = await authenticatedFetch(
    `${API_BASE}/documents/${docId}/download`,
  );

  if (!response.ok) {
    alert("Download failed");
    return;
  }

  const blob = await response.blob();

  // Create download link
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  // optional filename
  a.download = `document_${docId}`;

  document.body.appendChild(a);
  a.click();

  a.remove();
  window.URL.revokeObjectURL(url);
}

/* ===================== HELPERS ===================== */

function resetSections(level) {
  const sections = ["patients", "hospitals", "visits", "documents"];
  const index = sections.indexOf(level);

  sections
    .slice(index)
    .forEach((s) =>
      document.getElementById(`${s}Section`)?.classList.add("hidden"),
    );
}

function showSection(id) {
  document.getElementById(id).classList.remove("hidden");
}

// Clear all field error texts
function clearFieldErrors() {
  const errorElements = document.querySelectorAll(".error");
  errorElements.forEach((el) => (el.textContent = ""));
}
