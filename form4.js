/*
  form4.js
  Author: Mohammed Lawal
  Date: 06/16/2026
  Description: HW4 - Adds Fetch API, Cookies, Local Storage to HW3 validation.
*/

/* ══════════════════════════════════════════════════
   COOKIE FUNCTIONS
══════════════════════════════════════════════════ */
function setCookie(name, value, hours) {
  const expires = new Date();
  expires.setTime(expires.getTime() + hours * 60 * 60 * 1000);
  document.cookie = name + "=" + encodeURIComponent(value) + ";expires=" + expires.toUTCString() + ";path=/";
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function deleteCookie(name) {
  document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
}

/* ══════════════════════════════════════════════════
   LOCAL STORAGE FUNCTIONS
══════════════════════════════════════════════════ */
function saveToLocalStorage() {
  const fields = ["fname", "mi", "lname", "dob", "phone", "email",
                  "addr1", "addr2", "city", "state", "zip",
                  "health", "symptoms", "userid"];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) localStorage.setItem("opal_" + id, el.value);
  });

  // Radio buttons
  const gender = document.querySelector('input[name="gender"]:checked');
  if (gender) localStorage.setItem("opal_gender", gender.value);
  const vaccinated = document.querySelector('input[name="vaccinated"]:checked');
  if (vaccinated) localStorage.setItem("opal_vaccinated", vaccinated.value);
  const insurance = document.querySelector('input[name="insurance"]:checked');
  if (insurance) localStorage.setItem("opal_insurance", insurance.value);

  // Checkboxes
  const checked = [...document.querySelectorAll('input[name="conditions"]:checked')].map(c => c.value);
  localStorage.setItem("opal_conditions", JSON.stringify(checked));

  // Remember me
  const rememberMe = document.getElementById("remember-me")?.checked;
  localStorage.setItem("opal_rememberme", rememberMe ? "yes" : "no");
}

function loadFromLocalStorage() {
  const fields = ["fname", "mi", "lname", "dob", "phone", "email",
                  "addr1", "addr2", "city", "state", "zip",
                  "health", "symptoms", "userid"];
  fields.forEach(id => {
    const val = localStorage.getItem("opal_" + id);
    const el = document.getElementById(id);
    if (val && el) el.value = val;
  });

  // Radio buttons
  const gender = localStorage.getItem("opal_gender");
  if (gender) {
    const el = document.querySelector(`input[name="gender"][value="${gender}"]`);
    if (el) el.checked = true;
  }
  const vaccinated = localStorage.getItem("opal_vaccinated");
  if (vaccinated) {
    const el = document.querySelector(`input[name="vaccinated"][value="${vaccinated}"]`);
    if (el) el.checked = true;
  }
  const insurance = localStorage.getItem("opal_insurance");
  if (insurance) {
    const el = document.querySelector(`input[name="insurance"][value="${insurance}"]`);
    if (el) el.checked = true;
  }

  // Checkboxes
  const conditions = JSON.parse(localStorage.getItem("opal_conditions") || "[]");
  conditions.forEach(val => {
    const el = document.querySelector(`input[name="conditions"][value="${val}"]`);
    if (el) el.checked = true;
  });

  // Slider display
  const health = document.getElementById("health");
  if (health) document.getElementById("health-val").innerText = health.value;
}

function clearLocalStorage() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith("opal_"));
  keys.forEach(k => localStorage.removeItem(k));
}

/* ══════════════════════════════════════════════════
   COOKIE WELCOME MESSAGE
══════════════════════════════════════════════════ */
function handleCookieWelcome() {
  const firstName = getCookie("opal_firstname");
  const welcomeEl = document.getElementById("welcome-msg");
  const notMeEl = document.getElementById("not-me-section");

  if (firstName) {
    if (welcomeEl) welcomeEl.textContent = "Welcome back, " + firstName + "!";
    if (notMeEl) {
      notMeEl.style.display = "block";
      document.getElementById("not-me-label").textContent = "Not " + firstName + "? Click here to start as a new user.";
    }
    // Pre-fill first name
    const fnameField = document.getElementById("fname");
    if (fnameField && !fnameField.value) fnameField.value = firstName;
    // Load rest from local storage
    loadFromLocalStorage();
  } else {
    if (welcomeEl) welcomeEl.textContent = "Welcome, New User!";
    if (notMeEl) notMeEl.style.display = "none";
  }
}

function startAsNewUser() {
  deleteCookie("opal_firstname");
  clearLocalStorage();
  document.getElementById("reg-form").reset();
  document.getElementById("welcome-msg").textContent = "Welcome, New User!";
  document.getElementById("not-me-section").style.display = "none";
  document.getElementById("btn-submit").style.display = "none";
  // Clear all error messages
  document.querySelectorAll(".err-msg").forEach(e => e.textContent = "");
}

/* ══════════════════════════════════════════════════
   REMEMBER ME HANDLER
══════════════════════════════════════════════════ */
function handleRememberMe() {
  const checked = document.getElementById("remember-me")?.checked;
  if (!checked) {
    deleteCookie("opal_firstname");
    clearLocalStorage();
  }
}

/* ══════════════════════════════════════════════════
   FETCH API - Load States & Conditions
══════════════════════════════════════════════════ */
async function loadStates() {
  try {
    const response = await fetch("states.html");
    if (!response.ok) throw new Error("Failed to load states");
    const html = await response.text();
    document.getElementById("state").innerHTML = html;
    // Restore saved state if any
    const saved = localStorage.getItem("opal_state");
    if (saved) document.getElementById("state").value = saved;
  } catch (err) {
    console.error("Error loading states:", err);
  }
}

async function loadConditions() {
  try {
    const response = await fetch("conditions.html");
    if (!response.ok) throw new Error("Failed to load conditions");
    const html = await response.text();
    document.getElementById("conditions-group").innerHTML = html;
    // Restore saved checkboxes
    const conditions = JSON.parse(localStorage.getItem("opal_conditions") || "[]");
    conditions.forEach(val => {
      const el = document.querySelector(`input[name="conditions"][value="${val}"]`);
      if (el) el.checked = true;
    });
  } catch (err) {
    console.error("Error loading conditions:", err);
  }
}

/* ══════════════════════════════════════════════════
   ERROR HANDLING
══════════════════════════════════════════════════ */
function setError(fieldId, message) {
  const span = document.getElementById(fieldId + "-err");
  if (span) { span.textContent = message; span.style.color = "red"; }
}
function clearError(fieldId) {
  const span = document.getElementById(fieldId + "-err");
  if (span) span.textContent = "";
}
function updateSubmitButton() {
  const errors = document.querySelectorAll(".err-msg");
  let hasErrors = false;
  errors.forEach(e => { if (e.textContent.trim() !== "") hasErrors = true; });
  document.getElementById("btn-submit").style.display = hasErrors ? "none" : "inline-block";
}

/* ══════════════════════════════════════════════════
   FIELD VALIDATORS (same as HW3 + save to localStorage)
══════════════════════════════════════════════════ */
function validateFname() {
  const val = document.getElementById("fname").value.trim();
  if (val === "") { setError("fname", "⚠ First name is required."); }
  else if (!/^[A-Za-z'\-]{1,30}$/.test(val)) { setError("fname", "⚠ Letters, apostrophes, and dashes only (1–30 chars)."); }
  else {
    clearError("fname");
    // Set cookie on first name entry
    const rememberMe = document.getElementById("remember-me")?.checked;
    if (rememberMe) setCookie("opal_firstname", val, 48);
    saveToLocalStorage();
  }
  updateSubmitButton();
}

function validateMI() {
  const val = document.getElementById("mi").value.trim();
  if (val === "") { clearError("mi"); }
  else if (!/^[A-Za-z]$/.test(val)) { setError("mi", "⚠ One letter only."); }
  else { clearError("mi"); saveToLocalStorage(); }
  updateSubmitButton();
}

function validateLname() {
  const val = document.getElementById("lname").value.trim();
  if (val === "") { setError("lname", "⚠ Last name is required."); }
  else if (!/^[A-Za-z'\-]{1,30}$/.test(val)) { setError("lname", "⚠ Letters, apostrophes, and dashes only (1–30 chars)."); }
  else { clearError("lname"); saveToLocalStorage(); }
  updateSubmitButton();
}

function validateDOB() {
  const val = document.getElementById("dob").value;
  if (!val) { setError("dob", "⚠ Date of birth is required."); updateSubmitButton(); return; }
  const dob = new Date(val);
  const today = new Date();
  const minDate = new Date(); minDate.setFullYear(today.getFullYear() - 120);
  if (dob > today) { setError("dob", "⚠ Cannot be in the future."); }
  else if (dob < minDate) { setError("dob", "⚠ Cannot be more than 120 years ago."); }
  else { clearError("dob"); saveToLocalStorage(); }
  updateSubmitButton();
}

function formatSSN() {
  const field = document.getElementById("ssn");
  let val = field.value.replace(/\D/g, "");
  if (val.length > 9) val = val.substring(0, 9);
  if (val.length > 5) val = val.substring(0,3) + "-" + val.substring(3,5) + "-" + val.substring(5);
  else if (val.length > 3) val = val.substring(0,3) + "-" + val.substring(3);
  field.value = val;
  validateSSN();
}

function validateSSN() {
  const val = document.getElementById("ssn").value.trim();
  if (val === "") { clearError("ssn"); updateSubmitButton(); return; }
  if (!/^\d{3}-\d{2}-\d{4}$/.test(val)) { setError("ssn", "⚠ Must be XXX-XX-XXXX format."); }
  else { clearError("ssn"); }
  updateSubmitButton();
}

function validatePhone() {
  const val = document.getElementById("phone").value.trim();
  if (val === "") { clearError("phone"); updateSubmitButton(); return; }
  if (!/^\d{3}-\d{3}-\d{4}$/.test(val)) { setError("phone", "⚠ Format must be 000-000-0000."); }
  else { clearError("phone"); saveToLocalStorage(); }
  updateSubmitButton();
}

function validateEmail() {
  const field = document.getElementById("email");
  field.value = field.value.toLowerCase();
  const val = field.value.trim();
  if (val === "") { setError("email", "⚠ Email is required."); }
  else if (!/^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/.test(val)) { setError("email", "⚠ Must be name@domain.tld format."); }
  else { clearError("email"); saveToLocalStorage(); }
  updateSubmitButton();
}

function validateAddr1() {
  const val = document.getElementById("addr1").value.trim();
  if (val.length < 2 || val.length > 30) { setError("addr1", "⚠ Required. Must be 2–30 characters."); }
  else { clearError("addr1"); saveToLocalStorage(); }
  updateSubmitButton();
}

function validateAddr2() {
  const val = document.getElementById("addr2").value.trim();
  if (val === "") { clearError("addr2"); updateSubmitButton(); return; }
  if (val.length < 2 || val.length > 30) { setError("addr2", "⚠ If entered, must be 2–30 characters."); }
  else { clearError("addr2"); saveToLocalStorage(); }
  updateSubmitButton();
}

function validateCity() {
  const val = document.getElementById("city").value.trim();
  if (val.length < 2 || val.length > 30) { setError("city", "⚠ Required. Must be 2–30 characters."); }
  else { clearError("city"); saveToLocalStorage(); }
  updateSubmitButton();
}

function validateState() {
  const val = document.getElementById("state").value;
  if (!val) { setError("state", "⚠ Please select a state."); }
  else { clearError("state"); saveToLocalStorage(); }
  updateSubmitButton();
}

function validateZip() {
  const field = document.getElementById("zip");
  field.value = field.value.replace(/\D/g, "").substring(0, 5);
  if (!/^\d{5}$/.test(field.value)) { setError("zip", "⚠ Zip code must be exactly 5 digits."); }
  else { clearError("zip"); saveToLocalStorage(); }
  updateSubmitButton();
}

function validateUserID() {
  const field = document.getElementById("userid");
  field.value = field.value.toLowerCase();
  const val = field.value.trim();
  if (val === "") { setError("userid", "⚠ User ID is required."); }
  else if (/^[0-9]/.test(val)) { setError("userid", "⚠ Cannot start with a number."); }
  else if (val.length < 5 || val.length > 20) { setError("userid", "⚠ Must be 5–20 characters."); }
  else if (/[^a-z0-9_\-]/.test(val)) { setError("userid", "⚠ Letters, numbers, dashes, underscores only. No spaces."); }
  else { clearError("userid"); saveToLocalStorage(); }
  updateSubmitButton();
}

function validatePassword() {
  const pwd = document.getElementById("password").value;
  const uid = document.getElementById("userid").value.toLowerCase();
  const fname = document.getElementById("fname").value.toLowerCase();
  const lname = document.getElementById("lname").value.toLowerCase();
  let errors = [];
  if (pwd.length < 8 || pwd.length > 30) errors.push("8–30 characters");
  if (!/[A-Z]/.test(pwd)) errors.push("1 uppercase letter");
  if (!/[a-z]/.test(pwd)) errors.push("1 lowercase letter");
  if (!/[0-9]/.test(pwd)) errors.push("1 number");
  if (!/[!@#%^&*()\-_+=\\\/><.,`~]/.test(pwd)) errors.push("1 special character");
  if (/"/.test(pwd)) errors.push("no double quotes");
  if (uid && pwd.toLowerCase().includes(uid)) errors.push("cannot contain User ID");
  if (fname && pwd.toLowerCase().includes(fname)) errors.push("cannot contain your name");
  if (errors.length > 0) { setError("password", "⚠ Needs: " + errors.join(", ")); }
  else { clearError("password"); }
  validateConfirmPwd();
  updateSubmitButton();
}

function validateConfirmPwd() {
  const pwd = document.getElementById("password").value;
  const confirm = document.getElementById("confirm-pwd").value;
  if (confirm === "") { setError("confirm-pwd", "⚠ Please re-enter your password."); }
  else if (pwd !== confirm) { setError("confirm-pwd", "⚠ Passwords do not match."); }
  else { clearError("confirm-pwd"); }
  updateSubmitButton();
}

function updateSlider(val) {
  document.getElementById("health-val").innerText = val;
  saveToLocalStorage();
}

function setupDateLimits() {
  const today = new Date();
  const maxDOB = today.toISOString().split("T")[0];
  const minDOBDate = new Date(); minDOBDate.setFullYear(today.getFullYear() - 120);
  const minDOB = minDOBDate.toISOString().split("T")[0];
  const dobField = document.getElementById("dob");
  if (dobField) { dobField.setAttribute("max", maxDOB); dobField.setAttribute("min", minDOB); }
}

/* ══════════════════════════════════════════════════
   VALIDATE ALL
══════════════════════════════════════════════════ */
function validateAll() {
  validateFname(); validateMI(); validateLname(); validateDOB();
  validateSSN(); validatePhone(); validateEmail();
  validateAddr1(); validateAddr2(); validateCity();
  validateState(); validateZip(); validateUserID();
  validatePassword(); validateConfirmPwd();
  updateSubmitButton();
  const btn = document.getElementById("btn-submit");
  if (btn.style.display === "none" || btn.style.display === "") {
    alert("⚠ Please fix all errors before submitting.");
  } else {
    btn.scrollIntoView({ behavior: "smooth" });
  }
}

/* ══════════════════════════════════════════════════
   REVIEW PANEL
══════════════════════════════════════════════════ */
function showReview() {
  validateAll();
  const fname  = document.getElementById("fname").value || "—";
  const mi     = document.getElementById("mi").value || "";
  const lname  = document.getElementById("lname").value || "—";
  const dob    = document.getElementById("dob").value || "—";
  const phone  = document.getElementById("phone").value || "—";
  const email  = document.getElementById("email").value || "—";
  const addr1  = document.getElementById("addr1").value || "—";
  const addr2  = document.getElementById("addr2").value || "";
  const city   = document.getElementById("city").value || "—";
  const stateEl = document.getElementById("state");
  const state  = stateEl.options[stateEl.selectedIndex]?.text || "—";
  const zip    = document.getElementById("zip").value || "—";
  const gender = document.querySelector('input[name="gender"]:checked')?.value || "—";
  const vaccinated = document.querySelector('input[name="vaccinated"]:checked')?.value || "—";
  const insurance = document.querySelector('input[name="insurance"]:checked')?.value || "—";
  const conditions = [...document.querySelectorAll('input[name="conditions"]:checked')].map(c => c.value).join(", ") || "None";
  const health = document.getElementById("health").value;
  const symptoms = document.getElementById("symptoms").value || "None";
  const userid = document.getElementById("userid").value || "—";

  const html = `
    <h3>📋 Please Review Your Information</h3>
    <table class="review-table">
      <tr><th colspan="2">Personal</th></tr>
      <tr><td>Name</td><td>${fname} ${mi ? mi+"." : ""} ${lname}</td></tr>
      <tr><td>DOB</td><td>${dob}</td></tr>
      <tr><th colspan="2">Contact</th></tr>
      <tr><td>Phone</td><td>${phone}</td></tr>
      <tr><td>Email</td><td>${email}</td></tr>
      <tr><th colspan="2">Address</th></tr>
      <tr><td>Address</td><td>${addr1}${addr2 ? "<br>"+addr2 : ""}<br>${city}, ${state} ${zip}</td></tr>
      <tr><th colspan="2">Medical</th></tr>
      <tr><td>Gender</td><td>${gender}</td></tr>
      <tr><td>Vaccinated</td><td>${vaccinated}</td></tr>
      <tr><td>Insurance</td><td>${insurance}</td></tr>
      <tr><td>Conditions</td><td>${conditions}</td></tr>
      <tr><td>Health Score</td><td>${health}/10</td></tr>
      <tr><td>Symptoms</td><td>${symptoms}</td></tr>
      <tr><th colspan="2">Account</th></tr>
      <tr><td>User ID</td><td>${userid}</td></tr>
      <tr><td>Password</td><td>••••••••</td></tr>
    </table>
  `;
  const panel = document.getElementById("review-panel");
  panel.innerHTML = html;
  panel.style.display = "block";
  panel.scrollIntoView({ behavior: "smooth" });
}

/* ══════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════ */
window.addEventListener("DOMContentLoaded", async function () {
  setupDateLimits();
  document.getElementById("btn-submit").style.display = "none";

  // Fetch states and conditions
  await loadStates();
  await loadConditions();

  // Handle cookie welcome
  handleCookieWelcome();

  // Attach validators
  document.getElementById("fname")?.addEventListener("blur", validateFname);
  document.getElementById("mi")?.addEventListener("blur", validateMI);
  document.getElementById("lname")?.addEventListener("blur", validateLname);
  document.getElementById("dob")?.addEventListener("change", validateDOB);
  document.getElementById("ssn")?.addEventListener("input", formatSSN);
  document.getElementById("ssn")?.addEventListener("blur", validateSSN);
  document.getElementById("phone")?.addEventListener("blur", validatePhone);
  document.getElementById("email")?.addEventListener("blur", validateEmail);
  document.getElementById("addr1")?.addEventListener("blur", validateAddr1);
  document.getElementById("addr2")?.addEventListener("blur", validateAddr2);
  document.getElementById("city")?.addEventListener("blur", validateCity);
  document.getElementById("state")?.addEventListener("change", validateState);
  document.getElementById("zip")?.addEventListener("blur", validateZip);
  document.getElementById("userid")?.addEventListener("blur", validateUserID);
  document.getElementById("password")?.addEventListener("input", validatePassword);
  document.getElementById("confirm-pwd")?.addEventListener("input", validateConfirmPwd);
  document.getElementById("remember-me")?.addEventListener("change", handleRememberMe);
});
