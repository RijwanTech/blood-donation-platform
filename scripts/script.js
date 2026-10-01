document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const menu = document.getElementById("menu");

  if (hamburger && menu) {
    hamburger.addEventListener("click", () => {
      const isExpanded = menu.classList.toggle("show");
      hamburger.setAttribute("aria-expanded", String(isExpanded));
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.remove("show");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }

  const form = document.getElementById("donorForm");
  const successMessage = document.getElementById("successMessage");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitButton = form.querySelector("button[type='submit']");
      const originalButtonText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";

      const data = {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        city: document.getElementById("city").value,
        bloodGroup: document.getElementById("bloodGroup").value
      };

      try {
        const res = await fetch("http://localhost:5000/api/donors/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.message || "Donor registration failed.");
        }
        successMessage.textContent = result.message || "Donor registered!";
        form.reset();
      } catch (error) {
        console.error("Submission error:", error);
        successMessage.textContent = error.message || "Error registering donor.";
        successMessage.style.color = "#b42318";
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    });
  }

  const totalDonors = document.getElementById("totalDonors");
  const groupStats = document.getElementById("groupStats");

  if (totalDonors && groupStats) {
    fetch("http://localhost:5000/api/donors")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Donor statistics request failed (${res.status}).`);
        }
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("Donor statistics returned an invalid response.");
        }
        const donors = data;
        const groupCount = new Map();
        const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
        donors.forEach((donor) => {
          const bloodGroup = donor.blood_group || donor.bloodGroup;
          if (bloodGroup) {
            groupCount.set(bloodGroup, (groupCount.get(bloodGroup) || 0) + 1);
          }
        });

        totalDonors.textContent = donors.length.toLocaleString();
        const groupsRepresented = document.getElementById("groupsRepresented");
        if (groupsRepresented) {
          groupsRepresented.textContent = `${groupCount.size} of ${bloodGroups.length}`;
        }

        groupStats.replaceChildren();
        bloodGroups.forEach((group) => {
          const count = groupCount.get(group) || 0;
          const card = document.createElement("article");
          card.className = "blood-group-card";

          const label = document.createElement("span");
          label.className = "blood-group-card__type";
          label.textContent = group;

          const total = document.createElement("strong");
          total.textContent = count.toLocaleString();

          const caption = document.createElement("span");
          caption.className = "blood-group-card__caption";
          caption.textContent = count === 1 ? "registered donor" : "registered donors";

          card.append(label, total, caption);
          groupStats.appendChild(card);
        });
        groupStats.setAttribute("aria-busy", "false");
      })
      .catch((err) => {
        console.error("Dashboard load error:", err);
        totalDonors.textContent = "—";
        const groupsRepresented = document.getElementById("groupsRepresented");
        if (groupsRepresented) {
          groupsRepresented.textContent = "—";
        }
        groupStats.replaceChildren();
        const status = document.getElementById("dashboardStatus");
        if (status) {
          status.textContent = "Donor statistics could not be loaded. Please try again later.";
        }
        groupStats.setAttribute("aria-busy", "false");
      });
  }

  const donorSearchForm = document.getElementById("donorSearchForm");
  if (donorSearchForm) {
    donorSearchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      searchDonors();
    });
  }

  const eligibilityForm = document.getElementById("eligibilityCheckForm");
  const eligibilityResult = document.getElementById("eligibilityResult");
  const popupOverlay = document.getElementById("popupOverlay");
  const closePopup = document.getElementById("closePopup");

  if (closePopup && popupOverlay) {
    closePopup.addEventListener("click", () => {
      popupOverlay.classList.remove("show");
    });

    popupOverlay.addEventListener("click", (event) => {
      if (event.target === popupOverlay) {
        popupOverlay.classList.remove("show");
      }
    });
  }

  if (eligibilityForm && eligibilityResult) {
    eligibilityForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const age = parseInt(document.getElementById("age").value, 10);
      const weight = parseInt(document.getElementById("weight").value, 10);
      const health = document.getElementById("health").value;
      const alcohol = document.getElementById("alcohol").value;

      const eligible = age >= 18 && age <= 60 && weight >= 45 && health === "yes" && alcohol === "no";

      if (eligible) {
        eligibilityResult.textContent = "✅ You are eligible to donate blood!";
        eligibilityResult.style.color = "#1b7f45";
        eligibilityResult.style.background = "rgba(40, 167, 69, 0.12)";
        if (popupOverlay) {
          popupOverlay.classList.add("show");
        }
      } else {
        eligibilityResult.textContent = "❌ Sorry, you are currently not eligible to donate blood.";
        eligibilityResult.style.color = "#b42318";
        eligibilityResult.style.background = "rgba(220, 53, 69, 0.08)";
        if (popupOverlay) {
          popupOverlay.classList.remove("show");
        }
      }
    });
  }
});

console.log("✅ script.js is loaded");

function searchDonors() {
  const selectedGroup = document.getElementById("bloodGroup").value;
  const resultsContainer = document.getElementById("results");
  resultsContainer.setAttribute("aria-busy", "true");
  resultsContainer.replaceChildren();

  const loadingMessage = document.createElement("p");
  loadingMessage.className = "directory-message";
  loadingMessage.textContent = "Searching registered donors...";
  resultsContainer.appendChild(loadingMessage);

  fetch(`http://localhost:5000/api/donors?bloodGroup=${encodeURIComponent(selectedGroup)}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Donor search failed (${res.status}).`);
      }
      return res.json();
    })
    .then((donors) => {
      if (!Array.isArray(donors)) {
        throw new Error("The donor search returned an invalid response.");
      }
      resultsContainer.replaceChildren();

      if (donors.length === 0) {
        const message = document.createElement("p");
        message.className = "directory-message directory-message--empty";
        message.textContent = `No registered donors were found for ${selectedGroup}. Try another blood group or register as a donor.`;
        resultsContainer.appendChild(message);
        return;
      }

      const heading = document.createElement("div");
      heading.className = "results-heading";
      const resultCount = document.createElement("h2");
      resultCount.textContent = `${donors.length} ${donors.length === 1 ? "donor" : "donors"} found`;
      const groupCaption = document.createElement("span");
      groupCaption.className = "blood-group-card__type";
      groupCaption.textContent = selectedGroup;
      heading.append(resultCount, groupCaption);
      resultsContainer.appendChild(heading);

      const donorGrid = document.createElement("div");
      donorGrid.className = "directory-results-grid";
      resultsContainer.appendChild(donorGrid);

      donors.forEach((d) => {
        const card = document.createElement("article");
        card.className = "directory-donor-card";

        const bloodBadge = document.createElement("span");
        bloodBadge.className = "directory-donor-card__blood";
        bloodBadge.textContent = d.blood_group || d.bloodGroup || selectedGroup;

        const name = document.createElement("h3");
        name.textContent = d.name || "Registered donor";

        const city = document.createElement("p");
        city.className = "directory-donor-card__city";
        city.textContent = d.city || "City not provided";

        const phone = document.createElement("p");
        phone.className = "directory-donor-card__phone";
        phone.textContent = d.phone ? `Phone: ${d.phone}` : "Phone number not provided";

        card.append(bloodBadge, name, city, phone);
        donorGrid.appendChild(card);
      });
    })
    .catch((error) => {
      console.error("Error fetching donors:", error);
      resultsContainer.replaceChildren();
      const message = document.createElement("p");
      message.className = "directory-message directory-message--error";
      message.textContent = "Donor search is temporarily unavailable. Please try again later.";
      resultsContainer.appendChild(message);
    })
    .finally(() => {
      resultsContainer.setAttribute("aria-busy", "false");
    });
}
