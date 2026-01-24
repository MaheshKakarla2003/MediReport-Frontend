// Delete functions
async function deletePatient(patientId, patientName) {
  if (
    !confirm(
      `Are you sure you want to delete patient "${patientName}"? This action cannot be undone.`
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
      `Are you sure you want to delete the visit for "${diseaseName}"? This action cannot be undone.`
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
        "selectedPatientName"
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
      `Are you sure you want to delete the "${docType}" document? This action cannot be undone.`
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
