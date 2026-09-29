document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("donorForm");
  const successMessage = document.getElementById("successMessage");

  // Donor registration form handling
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

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
        successMessage.textContent = result.message || "Donor registered!";
        form.reset();
      } catch (error) {
        console.error("Submission error:", error);
        successMessage.textContent = "Error registering donor.";
      }
    });
  }

  // Dashboard stats
  const totalDonors = document.getElementById("totalDonors");
  const groupStats = document.getElementById("groupStats");

  if (totalDonors && groupStats) {
    fetch("http://localhost:5000/api/donors")
      .then((res) => res.json())
      .then((data) => {
        totalDonors.textContent = `${data.length} Registered Donors`;

        const groupCount = {};
        data.forEach((donor) => {
          groupCount[donor.blood_group] = (groupCount[donor.blood_group] || 0) + 1;
        });

        groupStats.textContent = Object.entries(groupCount)
          .map(([group, count]) => `${group}: ${count}`)
          .join(", ");
      })
      .catch((err) => {
        console.error("Dashboard load error:", err);
        totalDonors.textContent = "Error loading data";
        groupStats.textContent = "";
      });
  }

  // ✅ Eligibility form logic
  const eligibilityForm = document.getElementById("eligibilityCheckForm");
  const eligibilityResult = document.getElementById("eligibilityResult");

  if (eligibilityForm && eligibilityResult) {
    eligibilityForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const age = parseInt(document.getElementById("age").value);
      const weight = parseInt(document.getElementById("weight").value);
      const health = document.getElementById("health").value;
      const alcohol = document.getElementById("alcohol").value;

      if (age >= 18 && age <= 60 && weight >= 45 && health === "yes" && alcohol === "no") {
        eligibilityResult.textContent = "✅ You are eligible to donate blood!";
        eligibilityResult.style.color = "green";
      } else {
        eligibilityResult.textContent = "❌ Sorry, you are currently not eligible to donate blood.";
        eligibilityResult.style.color = "red";
      }
    });
  }
});


// ✅ Confirm script.js is loaded
console.log("✅ script.js is loaded");

// Donor search
function searchDonors() {
  console.log("🔍 searchDonors() called");

  const selectedGroup = document.getElementById("bloodGroup").value;
  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = "";

  // 🔍 Debug: log the actual URL being requested
  console.log(`Fetching from: http://localhost:5000/api/donors?bloodGroup=${encodeURIComponent(selectedGroup)}`);

  fetch(`http://localhost:5000/api/donors?bloodGroup=${encodeURIComponent(selectedGroup)}`)
    .then(res => res.json())
    .then(donors => {
      if (donors.length === 0) {
        const message = document.createElement("div");
        message.className = "no-result";
        message.innerHTML = `
          <img src="blood-drop.png" alt="Blood drop">
          <p>No donors found for this blood group <span style='font-size: 20px;'>😞 &#128148;</span></p>
        `;
        resultsContainer.appendChild(message);
        return;
      }

      const banner = document.createElement("div");
      banner.className = "donor-found";
      banner.innerHTML = `
        <img src="blood-drop.png" alt="Blood Drop" class="blood-drop-glow">
        <p>✅ Donors available for this blood group!</p>
      `;
      resultsContainer.appendChild(banner);

      donors.forEach((d) => {
        const card = document.createElement("div");
        card.className = "donor-card animated-card";
        card.innerHTML = `
          <h3>${d.name}</h3>
          <p><strong>Blood Group:</strong> ${d.blood_group || d.bloodGroup}</p>
          <p><strong>Phone:</strong> ${d.phone || 'Not Provided'}</p>
          <p><strong>City:</strong> ${d.city}</p>
        `;
        resultsContainer.appendChild(card);
      });
    })
    .catch((error) => {
      console.error("Error fetching donors:", error);
      resultsContainer.innerHTML = "<p>Error loading donor data.</p>";
    });
}
