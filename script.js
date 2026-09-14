const API_URL =
  "https://script.google.com/macros/s/AKfycbw75taqFAJhumaE9wDWD00meETuvVL-Eu_qV8LPE9gHDS-QgwIFjEbG8TKSBP_hmb-_qQ/exec";

const jobId = "job-001";

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function listItems(text) {
  return String(text || "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean)
    .map(item => `<li>${escapeHtml(item)}</li>`)
    .join("");
}

function showJob(job) {
  document.title = `${job.Title} - ${job.Company}`;

  document.getElementById("page").innerHTML = `
    <section class="job-header">
      <div class="company-logo">JOB</div>

      <h2>${escapeHtml(job.Company)}</h2>
      <h3>${escapeHtml(job.Title)}</h3>

      <div class="job-meta">
        <span>${escapeHtml(job.Company)}</span>
        <span>${escapeHtml(job.Location)}</span>
        <span>${escapeHtml(job["Date Posted"])}</span>
      </div>

      <div class="badges">
        <span class="urgent">${escapeHtml(job.Urgency)}</span>
        <span class="full-time">${escapeHtml(job["Job Type"])}</span>
        <span class="private">PRIVATE</span>
      </div>
    </section>

    <section class="content-grid">
      <article class="job-content">
        <h2>JOB DESCRIPTION</h2>
        <p>${escapeHtml(job["Job Description"])}</p>

        <h2>REQUIRED SKILL & EXPERIENCE</h2>
        <ul class="check-list">
          ${listItems(job["Required Skills"])}
        </ul>

        <h2>WHAT WE OFFER</h2>
        <ul class="check-list">
          ${listItems(job["What We Offer"])}
        </ul>

        <div class="share">
          <strong>Share this Job:</strong>
          <button onclick="shareJob()">Share</button>
        </div>
      </article>

      <aside>
        <section class="side-card">
          <h2>JOB OVERVIEW</h2>

          <p>
            <strong>Name Company</strong><br>
            ${escapeHtml(job.Company)}
          </p>

          <p>
            <strong>Job Title</strong><br>
            ${escapeHtml(job.Title)}
          </p>

          <p>
            <strong>Location</strong><br>
            ${escapeHtml(job.Location)}
          </p>

          <p>
            <strong>Date Posted</strong><br>
            ${escapeHtml(job["Date Posted"])}
          </p>

          <p>
            <strong>Expiration Date</strong><br>
            ${escapeHtml(job["Expiration Date"])}
          </p>

          <p>
            <strong>Salary</strong><br>
            ${escapeHtml(job.Salary)}
          </p>

          <a class="apply-button"
             href="${escapeHtml(job["Apply URL"])}"
             target="_blank"
             rel="noopener">
             APPLY NOW
          </a>
        </section>

        <section class="side-card">
          <h2>JOB LOCATION</h2>
          <div class="location-box">
            ${escapeHtml(job.Location)}
          </div>
        </section>

        <section class="side-card">
          <h2>DETAIL COMPANY</h2>

          <p><strong>${escapeHtml(job.Company)}</strong></p>
          <p>Founded: ${escapeHtml(job["Company Founded"])}</p>
          <p>Email: ${escapeHtml(job["Company Email"])}</p>
          <p>Location: ${escapeHtml(job["Company Address"])}</p>

          <p>
            <a href="${escapeHtml(job["Company Website"])}"
               target="_blank"
               rel="noopener">
               Company Website
            </a>
          </p>
        </section>
      </aside>
    </section>
  `;
}

function shareJob() {
  if (navigator.share) {
    navigator.share({
      title: document.title,
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert("Job link copied.");
  }
}

fetch(API_URL)
  .then(response => {
    if (!response.ok) {
      throw new Error("Could not load job data");
    }

    return response.json();
  })
  .then(jobs => {
    const job = jobs.find(item => String(item.ID) === jobId);

    if (!job) {
      document.getElementById("page").innerHTML =
        "<p class='error'>Job not found.</p>";
      return;
    }

    showJob(job);
  })
  .catch(error => {
    document.getElementById("page").innerHTML =
      "<p class='error'>Could not load job data.</p>";
  });
