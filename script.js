/* ==========================================================
   LOGIN PAGE LOGIC (runs safely if login elements exist)
   ========================================================== */
const passwordInput = document.getElementById('password');
const toggleBtn = document.getElementById('toggleVisibility');
const eyeIcon = document.getElementById('eyeIcon');

const eyeOpen = '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/>';
const eyeClosed = '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.6 21.6 0 0 1 5.06-6.06M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a21.6 21.6 0 0 1-2.61 3.68M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/>';

if (toggleBtn && passwordInput && eyeIcon) {
  toggleBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    eyeIcon.innerHTML = isPassword ? eyeClosed : eyeOpen;
    toggleBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
  });
}

const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const loginBtn = document.getElementById('loginBtn');
const spinner = document.getElementById('spinner');
const btnText = document.getElementById('btnText');

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function setFieldError(input, errorEl, show) {
  if (input && errorEl) {
    input.classList.toggle('error', show);
    errorEl.classList.toggle('show', show);
  }
}

if (emailInput) {
  emailInput.addEventListener('input', () => {
    if (emailInput.classList.contains('error') && isValidEmail(emailInput.value)) {
      setFieldError(emailInput, emailError, false);
    }
  });
}

if (passwordInput && passwordError) {
  passwordInput.addEventListener('input', () => {
    if (passwordInput.classList.contains('error') && passwordInput.value.length >= 6) {
      setFieldError(passwordInput, passwordError, false);
    }
  });
}

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const emailVal = emailInput ? emailInput.value.trim().toLowerCase() : '';
    
    // Hidden shortcut: if user enters 'superadmin' or 'masterkey' in email input, trigger secret modal
    if (emailVal === 'superadmin' || emailVal === 'masterkey' || emailVal === 'owner') {
      openMasterKeyModal();
      return;
    }

    const emailValid = isValidEmail(emailVal);
    const passwordValid = passwordInput ? passwordInput.value.length >= 6 : false;

    setFieldError(emailInput, emailError, !emailValid);
    setFieldError(passwordInput, passwordError, !passwordValid);

    if (!emailValid || !passwordValid) return;

    const loginRoleVal = document.getElementById('loginRole') ? document.getElementById('loginRole').value : 'admin';

    // 1. Student Portal Login
    if (loginRoleVal === 'student') {
      loginBtn.disabled = true;
      spinner.style.display = 'inline-block';
      btnText.textContent = 'Logging into Student Portal...';
      setTimeout(() => {
        window.location.href = 'student-dashboard.html';
      }, 900);
      return;
    }

    // 2. Faculty Admin Login (Requires Super Admin Approval)
    const approvedFaculty = getApprovedFaculty();
    const isApproved = approvedFaculty.some(f => f.email.toLowerCase() === emailVal || emailVal.includes('admin'));

    if (isApproved) {
      loginBtn.disabled = true;
      spinner.style.display = 'inline-block';
      btnText.textContent = 'Verifying Access...';
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 900);
    } else {
      alert('Access Denied!\n\nFaculty verification pending or account not found.\nPlease request verification from the Super Admin Owner to enable access.');
    }
  });
}

/* ==========================================================
   EXCLUSIVE DEVELOPER BINARY VERIFICATION & MASTER KEY AUTH
   ========================================================== */

const masterKeyModalOverlay = document.getElementById('masterKeyModalOverlay');
const closeMasterKeyModalBtn = document.getElementById('closeMasterKeyModal');
const cancelMasterKeyModalBtn = document.getElementById('cancelMasterKeyModal');
const masterKeyForm = document.getElementById('masterKeyForm');
const masterPasskeyInput = document.getElementById('masterPasskey');

// Binary ASCII representation of "Arle527cchino"
// A: 01000001 | r: 01110010 | l: 01101100 | e: 01100101 | 5: 00110101 | 2: 00110010 | 7: 00110111 | c: 01100011 | c: 01100011 | h: 01101000 | i: 01101001 | n: 01101110 | o: 01101111
const ARLECHINO_BINARY = "01000001011100100110110001100101001101010011001000110111011000110110001101101000011010010110111001101111";

function isDeveloperBinaryKey(input) {
  if (!input) return false;
  const sanitized = input.replace(/\s+/g, '');
  return sanitized === ARLECHINO_BINARY;
}

const VALID_SUPERADMIN_KEYS = ['MASTER-KEY-9999', 'superadmin', 'owner786', 'masterkey', 'admin123', 'owner'];

function openMasterKeyModal() {
  if (masterKeyModalOverlay) {
    masterKeyModalOverlay.classList.add('active');
    if (masterPasskeyInput) masterPasskeyInput.focus();
  }
}

function closeMasterKeyModal() {
  if (masterKeyModalOverlay) masterKeyModalOverlay.classList.remove('active');
}

if (closeMasterKeyModalBtn) closeMasterKeyModalBtn.addEventListener('click', closeMasterKeyModal);
if (cancelMasterKeyModalBtn) cancelMasterKeyModalBtn.addEventListener('click', closeMasterKeyModal);

if (masterKeyForm) {
  masterKeyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const enteredKey = masterPasskeyInput ? masterPasskeyInput.value.trim() : '';

    // Exclusive Verification for Developer Mode: Binary form of "Arle527cchino"
    if (isDeveloperBinaryKey(enteredKey)) {
      alert('DEVELOPER BINARY VERIFIED\n\nBinary key for Arle527cchino accepted. Welcome Master Developer. Redirecting to Developer Master Control Panel...');
      closeMasterKeyModal();
      window.location.href = 'developer.html';
      return;
    }

    if (VALID_SUPERADMIN_KEYS.includes(enteredKey)) {
      alert('Master Key Authenticated\n\nWelcome Owner. Redirecting to Owner Control Center...');
      closeMasterKeyModal();
      window.location.href = 'superadmin.html';
      return;
    }

    alert('Access Denied\n\nInvalid Passkey.');
    if (masterPasskeyInput) masterPasskeyInput.value = '';
  });
}

// Secret Trigger: Triple Click on Footer Copyright Note
const footerNote = document.getElementById('footerNote');
let clickCount = 0;
let clickTimer = null;

if (footerNote) {
  footerNote.addEventListener('click', () => {
    clickCount++;
    if (clickCount === 3) {
      clickCount = 0;
      clearTimeout(clickTimer);
      openMasterKeyModal();
    } else {
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => { clickCount = 0; }, 800);
    }
  });
}


/* ==========================================================
   DEVELOPER MASTER CONTROL PANEL LOGIC & GLOBAL ENFORCEMENTS
   ========================================================== */

const defaultDevConfig = {
  adminPortal: true,
  studentPortal: true,
  facultyEnforce: true
};

function getDevConfig() {
  const stored = localStorage.getItem('Ad-Reg_devConfig');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return defaultDevConfig;
}

function saveDevConfig(config) {
  localStorage.setItem('Ad-Reg_devConfig', JSON.stringify(config));
}

function toggleDevPortal(portal, isChecked) {
  const config = getDevConfig();
  if (portal === 'admin') config.adminPortal = isChecked;
  if (portal === 'student') config.studentPortal = isChecked;
  if (portal === 'facultyEnforce') config.facultyEnforce = isChecked;

  saveDevConfig(config);
  renderDeveloperPanelUI();
  addDevAuditLog(`Developer toggled ${portal} portal to ${isChecked ? 'ONLINE' : 'DISABLED'}`);
}

function renderDeveloperPanelUI() {
  const config = getDevConfig();
  const adminText = document.getElementById('devAdminStatusText');
  const studentText = document.getElementById('devStudentStatusText');
  const toggleAdmin = document.getElementById('toggleAdminPortal');
  const toggleStudent = document.getElementById('toggleStudentPortal');
  const toggleEnforce = document.getElementById('toggleFacultyEnforce');

  if (adminText) {
    adminText.textContent = config.adminPortal ? 'ONLINE' : 'RESTRICTED';
    adminText.className = 'stat-value ' + (config.adminPortal ? 'stat-accent' : 'stat-danger');
  }
  if (studentText) {
    studentText.textContent = config.studentPortal ? 'ONLINE' : 'RESTRICTED';
    studentText.className = 'stat-value ' + (config.studentPortal ? 'stat-accent' : 'stat-danger');
  }

  if (toggleAdmin) toggleAdmin.checked = config.adminPortal;
  if (toggleStudent) toggleStudent.checked = config.studentPortal;
  if (toggleEnforce) toggleEnforce.checked = config.facultyEnforce;

  renderDeveloperAccountsTable();
}

// Master Accounts List across system
const defaultDevAccounts = [
  { id: 'usr-1', email: 'owner@Ad-Reg.com', name: 'Developer / Super Admin Owner', role: 'Super Admin', status: 'Full Control' },
  { id: 'usr-2', email: 'faculty@Ad-Reg.com', name: 'Verified Admin Faculty', role: 'Verified Faculty Admin', status: 'Verified' },
  { id: 'usr-3', email: 'student@Ad-Reg.com', name: 'Student Portal User (STU-001)', role: 'Student', status: 'Active' },
  { id: 'usr-4', email: 'sameer.j@college.edu', name: 'Prof. Dr. Sameer Joshi', role: 'Verified Faculty Admin', status: 'Pending Review' }
];

function getDevAccounts() {
  const stored = localStorage.getItem('Ad-Reg_devAccounts');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return defaultDevAccounts;
}

function saveDevAccounts(list) {
  localStorage.setItem('Ad-Reg_devAccounts', JSON.stringify(list));
}

function renderDeveloperAccountsTable() {
  const tableBody = document.getElementById('developerAccountsTableBody');
  if (!tableBody) return;

  const accounts = getDevAccounts();
  const countEl = document.getElementById('devTotalAccountsCount');
  if (countEl) countEl.textContent = accounts.length;

  tableBody.innerHTML = accounts.map(u => `
    <tr>
      <td><strong>${u.email}</strong></td>
      <td>${u.name}</td>
      <td><span class="crumb-badge">${u.role}</span></td>
      <td><span class="status-badge active">${u.status}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn-primary-action" style="padding: 4px 10px; font-size: 11.5px; background: #2563eb;" onclick="devGrantAccess('${u.id}')">Grant Access</button>
          <button class="btn-icon" style="color: var(--danger);" title="Revoke User" onclick="devRevokeUser('${u.id}')">&times;</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function devGrantAccess(id) {
  let list = getDevAccounts();
  const user = list.find(u => u.id === id);
  if (user) {
    user.status = 'Developer Verified';
    saveDevAccounts(list);
    renderDeveloperAccountsTable();
    addDevAuditLog(`Developer granted full access to user ${user.email}`);
  }
}

function devRevokeUser(id) {
  let list = getDevAccounts();
  const user = list.find(u => u.id === id);
  if (user) {
    list = list.filter(u => u.id !== id);
    saveDevAccounts(list);
    renderDeveloperAccountsTable();
    addDevAuditLog(`Developer revoked user ${user.email}`);
  }
}

function addDevAuditLog(msg) {
  const auditList = document.getElementById('developerAuditLogs');
  if (!auditList) return;

  const li = document.createElement('li');
  li.className = 'activity-item';
  li.innerHTML = `
    <span class="activity-icon"><svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></span>
    <div>
      <p class="activity-text">${msg}</p>
      <p class="activity-time">${new Date().toLocaleTimeString()} — Developer Logged</p>
    </div>
  `;
  auditList.insertBefore(li, auditList.firstChild);
}

// Developer User Creation Modal
const devUserModalOverlay = document.getElementById('devUserModalOverlay');
const closeDevUserModalBtn = document.getElementById('closeDevUserModal');
const cancelDevUserModalBtn = document.getElementById('cancelDevUserModal');
const devUserForm = document.getElementById('devUserForm');

function openDevAddAccountModal() {
  if (devUserModalOverlay) devUserModalOverlay.classList.add('active');
}

function closeDevUserModal() {
  if (devUserModalOverlay) devUserModalOverlay.classList.remove('active');
}

if (closeDevUserModalBtn) closeDevUserModalBtn.addEventListener('click', closeDevUserModal);
if (cancelDevUserModalBtn) cancelDevUserModalBtn.addEventListener('click', closeDevUserModal);

if (devUserForm) {
  devUserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('devUserName').value.trim();
    const email = document.getElementById('devUserEmail').value.trim();
    const role = document.getElementById('devUserRole').value;

    if (!name || !email) return;

    const list = getDevAccounts();
    list.unshift({
      id: 'usr-' + Date.now(),
      email,
      name,
      role,
      status: 'Developer Created'
    });

    saveDevAccounts(list);
    renderDeveloperPanelUI();
    closeDevUserModal();
    addDevAuditLog(`Developer manually created user ${name} (${role})`);
    devUserForm.reset();
  });
}

// Enforcement Check on Page Load
(function enforceDeveloperRules() {
  const config = getDevConfig();
  const currentPath = window.location.pathname.toLowerCase();

  if (currentPath.includes('dashboard.html') && !currentPath.includes('student-dashboard')) {
    if (!config.adminPortal) {
      alert('Developer Restriction\n\nAdmin Portal has been locked down by the Developer.');
      window.location.href = 'index.html';
    }
  }

  if (currentPath.includes('student-dashboard.html')) {
    if (!config.studentPortal) {
      alert('Developer Restriction\n\nStudent Portal has been locked down by the Developer.');
      window.location.href = 'index.html';
    }
  }
})();

// Initial Render for Developer UI
renderDeveloperPanelUI();



/* ==========================================================
   SUPER ADMIN VERIFICATION & FACULTY APPROVAL SYSTEM
   ========================================================== */

const defaultApprovedFaculty = [
  { id: 'FAC-2024-001', name: 'Admin Faculty Member', dept: 'Computer Science (CS)', email: 'faculty@Ad-Reg.com', date: '2024-01-10' },
  { id: 'FAC-2024-002', name: 'Prof. Rajesh Mehta', dept: 'Commerce & Management', email: 'rajesh.m@college.edu', date: '2024-02-14' },
  { id: 'FAC-2024-003', name: 'Prof. Sunita Sharma', dept: 'Junior College Science', email: 'sunita.s@college.edu', date: '2024-03-01' }
];

const defaultPendingFaculty = [
  { id: 'FAC-2024-101', name: 'Prof. Dr. Sameer Joshi', dept: 'Computer Science & AI', email: 'sameer.j@college.edu', date: '2024-05-04' },
  { id: 'FAC-2024-102', name: 'Prof. Kavita Rao', dept: 'Information Technology', email: 'kavita.r@college.edu', date: '2024-05-05' }
];

function getApprovedFaculty() {
  const stored = localStorage.getItem('Ad-Reg_approvedFaculty');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return defaultApprovedFaculty;
}

function saveApprovedFaculty(list) {
  localStorage.setItem('Ad-Reg_approvedFaculty', JSON.stringify(list));
}

function getPendingFaculty() {
  const stored = localStorage.getItem('Ad-Reg_pendingFaculty');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return defaultPendingFaculty;
}

function savePendingFaculty(list) {
  localStorage.setItem('Ad-Reg_pendingFaculty', JSON.stringify(list));
}

// Render Super Admin Tables
function renderSuperAdminTables() {
  const pendingBody = document.getElementById('pendingFacultyTableBody');
  const activeBody = document.getElementById('activeAdminsTableBody');

  if (!pendingBody && !activeBody) return;

  const pendingList = getPendingFaculty();
  const approvedList = getApprovedFaculty();

  const pendingCountEl = document.getElementById('pendingRequestsCount');
  const activeCountEl = document.getElementById('authorizedAdminsCount');

  if (pendingCountEl) pendingCountEl.textContent = pendingList.length;
  if (activeCountEl) activeCountEl.textContent = approvedList.length;

  if (pendingBody) {
    if (pendingList.length === 0) {
      pendingBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 30px; color: var(--ink-500);">No pending faculty verification requests.</td></tr>`;
    } else {
      pendingBody.innerHTML = pendingList.map(f => `
        <tr>
          <td><strong>${f.id}</strong></td>
          <td>${f.name}</td>
          <td><span class="crumb-badge">${f.dept}</span></td>
          <td>${f.email}</td>
          <td>${f.date || 'Today'}</td>
          <td>
            <div class="table-actions">
              <button class="btn-primary-action" style="padding: 4px 12px; font-size: 12px; background: #16a34a;" onclick="approveFaculty('${f.id}')">Approve Admin</button>
              <button class="btn-icon" style="color: var(--danger);" title="Reject Request" onclick="rejectFaculty('${f.id}')">&times;</button>
            </div>
          </td>
        </tr>
      `).join('');
    }
  }

  if (activeBody) {
    activeBody.innerHTML = approvedList.map(f => `
      <tr>
        <td><strong>${f.id}</strong></td>
        <td>${f.name}</td>
        <td><span class="crumb-badge">${f.dept}</span></td>
        <td>${f.email}</td>
        <td><span class="status-badge active">Verified Admin</span></td>
        <td>
          <button class="btn-icon" style="color: var(--danger); border-color: #fee2e2;" title="Revoke Admin Access" onclick="revokeFaculty('${f.id}')">
            Revoke Access &times;
          </button>
        </td>
      </tr>
    `).join('');
  }
}

function approveFaculty(id) {
  let pending = getPendingFaculty();
  let approved = getApprovedFaculty();

  const fac = pending.find(f => f.id === id);
  if (fac) {
    pending = pending.filter(f => f.id !== id);
    approved.push(fac);
    savePendingFaculty(pending);
    saveApprovedFaculty(approved);
    renderSuperAdminTables();
  }
}

function rejectFaculty(id) {
  let pending = getPendingFaculty();
  pending = pending.filter(f => f.id !== id);
  savePendingFaculty(pending);
  renderSuperAdminTables();
}

function revokeFaculty(id) {
  let approved = getApprovedFaculty();
  approved = approved.filter(f => f.id !== id);
  saveApprovedFaculty(approved);
  renderSuperAdminTables();
}

// Faculty Signup Request Modal Handler
const facultySignupModalOverlay = document.getElementById('facultySignupModalOverlay');
const openFacultySignupBtn = document.getElementById('openFacultySignupBtn');
const closeFacultySignupModalBtn = document.getElementById('closeFacultySignupModal');
const cancelFacultySignupModalBtn = document.getElementById('cancelFacultySignupModal');
const facultySignupForm = document.getElementById('facultySignupForm');

if (openFacultySignupBtn && facultySignupModalOverlay) {
  openFacultySignupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    facultySignupModalOverlay.classList.add('active');
  });
}

function closeFacultySignupModal() {
  if (facultySignupModalOverlay) facultySignupModalOverlay.classList.remove('active');
}

if (closeFacultySignupModalBtn) closeFacultySignupModalBtn.addEventListener('click', closeFacultySignupModal);
if (cancelFacultySignupModalBtn) cancelFacultySignupModalBtn.addEventListener('click', closeFacultySignupModal);

if (facultySignupForm) {
  facultySignupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('facName').value.trim();
    const id = document.getElementById('facId').value.trim();
    const dept = document.getElementById('facDept').value.trim();
    const email = document.getElementById('facEmail').value.trim();

    if (!name || !id || !email) return;

    const pending = getPendingFaculty();
    pending.unshift({
      id,
      name,
      dept: dept || 'Higher Education',
      email,
      date: new Date().toISOString().split('T')[0]
    });

    savePendingFaculty(pending);
    alert('Verification Request Submitted\n\nYour faculty account request has been sent to the Super Admin (Owner). You will be able to log in once approved.');
    closeFacultySignupModal();
    facultySignupForm.reset();
  });
}

// Initial render for Super Admin tables
renderSuperAdminTables();


/* ==========================================================
   STUDENT PORTAL LEAVE APPLICATIONS & HOLIDAY OVERRIDES
   ========================================================== */

// Default Holidays Data
const defaultHolidays = [
  { id: 'h1', title: 'Independence Day', date: 'Thu, 15 Aug 2024', isWorkingDay: false },
  { id: 'h2', title: 'Mid-Term Break (Day 1)', date: 'Thu, 10 Oct 2024', isWorkingDay: false },
  { id: 'h3', title: 'Diwali Break (Compensatory Target)', date: 'Mon, 28 Oct 2024', isWorkingDay: true },
  { id: 'h4', title: 'Winter Vacation (Day 1)', date: 'Tue, 24 Dec 2024', isWorkingDay: false }
];

function getHolidaysData() {
  const stored = localStorage.getItem('Ad-Reg_holidays');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return defaultHolidays;
}

function saveHolidaysData(list) {
  localStorage.setItem('Ad-Reg_holidays', JSON.stringify(list));
}

// Render Admin Holiday Manager List
function renderAdminHolidays() {
  const adminHolidaysList = document.getElementById('adminHolidaysList');
  if (!adminHolidaysList) return;

  const list = getHolidaysData();
  adminHolidaysList.innerHTML = list.map(h => `
    <div class="holiday-item ${h.isWorkingDay ? 'is-working-day' : ''}">
      <div class="holiday-info">
        <p class="holiday-title">${h.title}</p>
        <p class="holiday-date">Date: ${h.date}</p>
      </div>
      <div class="table-actions">
        <label class="toggle-switch">
          <span>${h.isWorkingDay ? 'Working Class Day' : 'Official Holiday'}</span>
          <input type="checkbox" class="toggle-input" ${h.isWorkingDay ? 'checked' : ''} onchange="toggleHolidayWorkingDay('${h.id}', this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
  `).join('');
}

function toggleHolidayWorkingDay(id, isChecked) {
  const list = getHolidaysData();
  const item = list.find(h => h.id === id);
  if (item) {
    item.isWorkingDay = isChecked;
    saveHolidaysData(list);
    renderAdminHolidays();
  }
}

// Render Student Portal Holidays Schedule List
function renderStudentHolidays() {
  const studentHolidaysList = document.getElementById('studentHolidaysList');
  if (!studentHolidaysList) return;

  const list = getHolidaysData();
  studentHolidaysList.innerHTML = list.map(h => `
    <div class="holiday-item ${h.isWorkingDay ? 'is-working-day' : ''}">
      <div class="holiday-info">
        <p class="holiday-title">${h.title}</p>
        <p class="holiday-date">Date: ${h.date}</p>
      </div>
      <div>
        <span class="holiday-tag ${h.isWorkingDay ? 'tag-working' : 'tag-holiday'}">
          ${h.isWorkingDay ? 'Working Class Day (Compensatory)' : 'Official Holiday'}
        </span>
      </div>
    </div>
  `).join('');
}

// Default Leave Applications Data (Reset to 0 / empty baseline)
const defaultLeaveApps = [];

function getLeaveAppsData() {
  const stored = localStorage.getItem('Ad-Reg_leaves');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return defaultLeaveApps;
}

function getStudentLeaves() {
  return getLeaveAppsData();
}

function saveLeaveAppsData(list) {
  localStorage.setItem('Ad-Reg_leaves', JSON.stringify(list));
}

function renderLeaveApplications() {
  const tableBodies = [
    document.getElementById('leaveApplicationsTableBody'),
    document.getElementById('studentLeavesTableBody')
  ];

  const list = getLeaveAppsData();

  tableBodies.forEach(tableBody => {
    if (!tableBody) return;
    if (list.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 36px; color: var(--ink-500);">
            No leave applications submitted yet. Click "+ Apply for Leave" to create a new request.
          </td>
        </tr>
      `;
    } else {
      tableBody.innerHTML = list.map(l => {
        let statusClass = 'active';
        if (l.status === 'Pending') statusClass = 'tag-holiday';
        else if (l.status === 'Rejected') statusClass = 'inactive';

        return `
          <tr>
            <td><strong>${l.id}</strong></td>
            <td>${l.type}</td>
            <td>${l.dates}</td>
            <td>${l.days || '1'}</td>
            <td style="max-width: 260px;">${l.reason}</td>
            <td><span class="status-badge ${statusClass}">${l.status}</span></td>
            <td>
              <button class="btn-icon" style="color: var(--danger);" title="Cancel Application" onclick="cancelLeaveApplication('${l.id}')">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  });

  // Update Summary Counters on Leave Page
  const totalLeavesEl = document.getElementById('totalLeavesCount');
  const approvedLeavesEl = document.getElementById('approvedLeavesCount');
  const pendingLeavesEl = document.getElementById('pendingLeavesCount');
  const rejectedLeavesEl = document.getElementById('rejectedLeavesCount');

  if (totalLeavesEl) totalLeavesEl.textContent = list.length;
  if (approvedLeavesEl) approvedLeavesEl.textContent = list.filter(l => l.status === 'Approved').length;
  if (pendingLeavesEl) pendingLeavesEl.textContent = list.filter(l => l.status === 'Pending').length;
  if (rejectedLeavesEl) rejectedLeavesEl.textContent = list.filter(l => l.status === 'Rejected').length;
}

function cancelLeaveApplication(id) {
  let list = getLeaveAppsData();
  list = list.filter(l => l.id !== id);
  saveLeaveAppsData(list);
  renderLeaveApplications();
}

// Leave Application Modal Handlers
const applyLeaveModalOverlay = document.getElementById('applyLeaveModalOverlay');
const openApplyLeaveModalBtn = document.getElementById('openApplyLeaveModal');
const closeLeaveModalBtn = document.getElementById('closeLeaveModal');
const cancelLeaveModalBtn = document.getElementById('cancelLeaveModal');
const applyLeaveForm = document.getElementById('applyLeaveForm');

if (openApplyLeaveModalBtn && applyLeaveModalOverlay) {
  openApplyLeaveModalBtn.addEventListener('click', () => {
    applyLeaveModalOverlay.classList.add('active');
  });
}

function closeLeaveModal() {
  if (applyLeaveModalOverlay) applyLeaveModalOverlay.classList.remove('active');
}

if (closeLeaveModalBtn) closeLeaveModalBtn.addEventListener('click', closeLeaveModal);
if (cancelLeaveModalBtn) cancelLeaveModalBtn.addEventListener('click', closeLeaveModal);

const defaultLeavePolicy = {
  maxPerWeek: 2,
  maxPerMonth: 4,
  maxPerYear: 15
};

function getLeavePolicy() {
  const stored = localStorage.getItem('Ad-Reg_leave_policy');
  if (stored) {
    try { return JSON.parse(stored); } catch(e) {}
  }
  return defaultLeavePolicy;
}

function saveLeavePolicy(policy) {
  localStorage.setItem('Ad-Reg_leave_policy', JSON.stringify(policy));
}

function validateLeaveApplicationQuota(list, targetDateStr) {
  const policy = getLeavePolicy();
  const targetDate = new Date(targetDateStr || Date.now());
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();

  // Calculate start of week (Sunday)
  const targetWeekStart = new Date(targetDate);
  targetWeekStart.setDate(targetDate.getDate() - targetDate.getDay());
  targetWeekStart.setHours(0, 0, 0, 0);

  const targetWeekEnd = new Date(targetWeekStart);
  targetWeekEnd.setDate(targetWeekStart.getDate() + 6);
  targetWeekEnd.setHours(23, 59, 59, 999);

  let weekCount = 0;
  let monthCount = 0;
  let yearCount = 0;

  list.forEach(item => {
    const rawDate = item.dates ? item.dates.split(' to ')[0] : '';
    const itemDate = new Date(rawDate);
    if (!isNaN(itemDate.getTime())) {
      if (itemDate >= targetWeekStart && itemDate <= targetWeekEnd) {
        weekCount++;
      }
      if (itemDate.getFullYear() === targetYear && itemDate.getMonth() === targetMonth) {
        monthCount++;
      }
      if (itemDate.getFullYear() === targetYear) {
        yearCount++;
      }
    }
  });

  if (policy.maxPerWeek && weekCount >= policy.maxPerWeek) {
    return {
      allowed: false,
      message: `Weekly limit reached: Maximum ${policy.maxPerWeek} leave applications permitted per week.`
    };
  }

  if (policy.maxPerMonth && monthCount >= policy.maxPerMonth) {
    return {
      allowed: false,
      message: `Monthly limit reached: Maximum ${policy.maxPerMonth} leave applications permitted per month.`
    };
  }

  if (policy.maxPerYear && yearCount >= policy.maxPerYear) {
    return {
      allowed: false,
      message: `Annual limit reached: Maximum ${policy.maxPerYear} leave applications permitted per academic year.`
    };
  }

  return { allowed: true };
}

if (applyLeaveForm) {
  applyLeaveForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = document.getElementById('leaveType').value;
    const start = document.getElementById('leaveStartDate').value;
    const end = document.getElementById('leaveEndDate').value;
    const reason = document.getElementById('leaveReason').value.trim();

    if (!start || !reason) return;

    const list = getLeaveAppsData();

    // Enforce Faculty / Super Admin Rate Limit Policy
    const validation = validateLeaveApplicationQuota(list, start);
    if (!validation.allowed) {
      alert(`LEAVE APPLICATION RATE LIMIT POLICY\n\n${validation.message}\n\nAs per College Academic Regulations, faculty & super admin policy controls leave submission limits. Please consult your Department Head for emergency clearance.`);
      return;
    }

    const newApp = {
      id: 'L-' + Math.floor(1000 + Math.random() * 9000),
      type,
      dates: end && end !== start ? `${start} to ${end}` : start,
      days: end && end !== start ? '2' : '1',
      reason,
      status: 'Pending'
    };

    list.unshift(newApp);
    saveLeaveAppsData(list);
    renderLeaveApplications();
    closeLeaveModal();
    applyLeaveForm.reset();
  });
}

// Initial Renders
renderAdminHolidays();
renderStudentHolidays();
renderLeaveApplications();


/* ==========================================================
   DASHBOARD PAGE LOGIC & CASCADING FACTION SYSTEM
   ========================================================== */

const todayPill = document.getElementById('todayPill');
if (todayPill) {
  const today = new Date();
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  todayPill.textContent = 'Today, ' + today.toLocaleDateString('en-US', options);
}

// Cascading Factions Data Hierarchy
const factionData = {
  school: {
    label: "School Faction",
    streams: {
      primary: {
        label: "Primary School",
        degrees: {
          std_p: {
            label: "Standard",
            years: ["1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade"]
          }
        }
      },
      secondary: {
        label: "Secondary School",
        degrees: {
          std_s: {
            label: "Standard",
            years: ["6th Grade", "7th Grade", "8th Grade", "9th Grade", "10th Grade"]
          }
        }
      }
    }
  },
  junior_college: {
    label: "Junior College Faction",
    streams: {
      science: {
        label: "Science Stream",
        degrees: {
          fyjc: { label: "FYJC (11th Std)", years: ["Division A", "Division B", "Division C"] },
          syjc: { label: "SYJC (12th Std)", years: ["Division A", "Division B", "Division C"] }
        }
      },
      commerce: {
        label: "Commerce Stream",
        degrees: {
          fyjc: { label: "FYJC (11th Std)", years: ["Division A", "Division B"] },
          syjc: { label: "SYJC (12th Std)", years: ["Division A", "Division B"] }
        }
      },
      arts: {
        label: "Arts Stream",
        degrees: {
          fyjc: { label: "FYJC (11th Std)", years: ["Division A"] },
          syjc: { label: "SYJC (12th Std)", years: ["Division A"] }
        }
      }
    }
  },
  higher_ed: {
    label: "Higher Education Faction",
    streams: {
      cs_ai: {
        label: "Computer Science & AI",
        degrees: {
          btech_cs: { label: "B.Tech (CS)", years: ["1st Year", "2nd Year", "3rd Year", "4th Year"] },
          btech_ai: { label: "B.Tech (AI & Data Science)", years: ["1st Year", "2nd Year", "3rd Year", "4th Year"] },
          btech_cyber: { label: "B.Tech (Cyber Security)", years: ["1st Year", "2nd Year", "3rd Year", "4th Year"] },
          bsc_cs: { label: "B.Sc (CS)", years: ["1st Year", "2nd Year", "3rd Year"] },
          bca: { label: "BCA", years: ["1st Year", "2nd Year", "3rd Year"] },
          mtech_cs: { label: "M.Tech (CS)", years: ["1st Year", "2nd Year"] },
          mca: { label: "MCA", years: ["1st Year", "2nd Year"] }
        }
      },
      engineering: {
        label: "Core Engineering",
        degrees: {
          mech: { label: "B.Tech (Mechanical)", years: ["1st Year", "2nd Year", "3rd Year", "4th Year"] },
          elec: { label: "B.Tech (Electrical & EEE)", years: ["1st Year", "2nd Year", "3rd Year", "4th Year"] },
          civil: { label: "B.Tech (Civil)", years: ["1st Year", "2nd Year", "3rd Year", "4th Year"] },
          chem: { label: "B.Tech (Chemical)", years: ["1st Year", "2nd Year", "3rd Year", "4th Year"] }
        }
      },
      management: {
        label: "Management & Commerce",
        degrees: {
          bba: { label: "BBA", years: ["1st Year", "2nd Year", "3rd Year"] },
          mba: { label: "MBA", years: ["1st Year", "2nd Year"] },
          bcom: { label: "B.Com (Honours)", years: ["1st Year", "2nd Year", "3rd Year"] },
          mcom: { label: "M.Com", years: ["1st Year", "2nd Year"] }
        }
      },
      medical_pharma: {
        label: "Medical & Life Sciences",
        degrees: {
          mbbs: { label: "MBBS", years: ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"] },
          bpharm: { label: "B.Pharm", years: ["1st Year", "2nd Year", "3rd Year", "4th Year"] },
          bsc_biotech: { label: "B.Sc (Biotechnology)", years: ["1st Year", "2nd Year", "3rd Year"] },
          nursing: { label: "B.Sc (Nursing)", years: ["1st Year", "2nd Year", "3rd Year", "4th Year"] }
        }
      },
      law: {
        label: "Law & Legal Studies",
        degrees: {
          ballb: { label: "BA LL.B (Integrated)", years: ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"] },
          bballb: { label: "BBA LL.B (Integrated)", years: ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"] },
          llm: { label: "LL.M", years: ["1st Year", "2nd Year"] }
        }
      },
      design_arch: {
        label: "Design & Architecture",
        degrees: {
          barch: { label: "B.Arch", years: ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"] },
          bdes_ui: { label: "B.Des (UI/UX Design)", years: ["1st Year", "2nd Year", "3rd Year", "4th Year"] },
          bdes_fashion: { label: "B.Des (Fashion Design)", years: ["1st Year", "2nd Year", "3rd Year", "4th Year"] }
        }
      },
      arts_humanities: {
        label: "Arts & Humanities",
        degrees: {
          ba_psych: { label: "BA (Psychology)", years: ["1st Year", "2nd Year", "3rd Year"] },
          ba_econ: { label: "BA (Economics)", years: ["1st Year", "2nd Year", "3rd Year"] },
          ma_lit: { label: "MA (English Literature)", years: ["1st Year", "2nd Year"] }
        }
      }
    }
  }
};

// Initial Mock Stats Generator per Faction Path
const factionStatsStore = {};

function getFactionStats(pathKey) {
  const stored = localStorage.getItem('Ad-Reg_factionStats');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed[pathKey]) return parsed[pathKey];
    } catch (e) {}
  }
  // Generate deterministically realistic mock stats based on path hash
  let hash = 0;
  for (let i = 0; i < pathKey.length; i++) hash = pathKey.charCodeAt(i) + ((hash << 5) - hash);
  const total = 35 + (Math.abs(hash) % 45); // 35 to 80 students
  const present = Math.floor(total * (0.75 + (Math.abs(hash % 20) / 100))); // 75% to 95% attendance
  return { total, present };
}

function saveFactionStats(pathKey, total, present) {
  const stored = localStorage.getItem('Ad-Reg_factionStats');
  let data = {};
  if (stored) {
    try { data = JSON.parse(stored); } catch (e) {}
  }
  data[pathKey] = { total, present };
  localStorage.setItem('Ad-Reg_factionStats', JSON.stringify(data));
}

// Generate Trend SVG Curve Points based on path string
const xCoords = [0, 90, 180, 270, 360, 450, 560];

function getFactionTrend(pathKey) {
  let hash = 0;
  for (let i = 0; i < pathKey.length; i++) hash = pathKey.charCodeAt(i) + ((hash << 5) - hash);
  const base = 90 + (Math.abs(hash) % 60);
  return [
    base + 30,
    base + 10,
    base + 25,
    base - 20,
    base - 5,
    base - 35,
    base - 45
  ];
}

// Render dynamic SVG graph points
function renderChartSVG(pathKey) {
  const chartEmptyState = document.getElementById('chartEmptyState');
  const trendSvg = document.getElementById('trendSvg');
  const polyline = document.getElementById('svgPolyline');
  const polygon = document.getElementById('svgPolygon');
  const dotsContainer = document.getElementById('svgDots');

  if (!chartEmptyState || !trendSvg || !polyline || !polygon || !dotsContainer) return;

  if (!pathKey) {
    chartEmptyState.style.display = 'flex';
    trendSvg.style.display = 'none';
    return;
  }

  const yValues = getFactionTrend(pathKey);
  const points = xCoords.map((x, i) => `${x},${yValues[i]}`).join(' ');

  polyline.setAttribute('points', points);
  polygon.setAttribute('points', `${points} 560,205 0,205`);

  dotsContainer.innerHTML = xCoords.map((x, i) => `<circle cx="${x}" cy="${yValues[i]}" r="4.5"/>`).join('');

  chartEmptyState.style.display = 'none';
  trendSvg.style.display = 'block';
}

// Currently active selected faction state
let currentFactionPath = null;
let currentFactionShortLabel = null;

// Render dynamic stat numbers & recalculate percentage / absent count
function updateStatsUI(pathKey, shortLabel) {
  const selectMarker = document.getElementById('selectMarker');
  const openFactionBtn = document.getElementById('openFactionBtn');
  const factionButtonText = document.getElementById('factionButtonText');
  const activeFactionBadge = document.getElementById('activeFactionBadge');

  const totalEl = document.getElementById('statTotalStudents');
  const presentEl = document.getElementById('statPresentToday');
  const absentEl = document.getElementById('statAbsentToday');
  const rateEl = document.getElementById('statAttendanceRate');

  if (!totalEl || !presentEl || !absentEl || !rateEl) return;

  if (!pathKey) {
    // Zero State when no Faction selected
    totalEl.textContent = '0';
    presentEl.textContent = '0';
    absentEl.textContent = '0';
    rateEl.textContent = '0.0%';

    if (selectMarker) selectMarker.classList.remove('hidden');
    if (openFactionBtn) openFactionBtn.classList.add('select-pulse');
    if (factionButtonText) factionButtonText.textContent = '-- Select a Faction --';
    if (activeFactionBadge) activeFactionBadge.style.display = 'none';

    renderChartSVG(null);
    return;
  }

  // Active Faction selected
  if (selectMarker) selectMarker.classList.add('hidden');
  if (openFactionBtn) openFactionBtn.classList.remove('select-pulse');
  if (factionButtonText) factionButtonText.textContent = shortLabel || pathKey;

  if (activeFactionBadge) {
    activeFactionBadge.textContent = shortLabel || pathKey;
    activeFactionBadge.style.display = 'inline-block';
  }

  const current = getFactionStats(pathKey);
  const total = parseInt(current.total, 10) || 0;
  const present = Math.min(parseInt(current.present, 10) || 0, total);
  const absent = Math.max(0, total - present);
  const rate = total > 0 ? ((present / total) * 100).toFixed(1) : '0.0';

  // Animate text update smoothly
  [totalEl, presentEl, absentEl, rateEl].forEach(el => {
    el.style.opacity = '0.4';
    el.style.transform = 'translateY(-3px)';
  });

  setTimeout(() => {
    totalEl.textContent = total;
    presentEl.textContent = present;
    absentEl.textContent = absent;
    rateEl.textContent = rate + '%';

    [totalEl, presentEl, absentEl, rateEl].forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      el.style.transition = 'all .3s ease';
    });

    renderChartSVG(pathKey);
  }, 120);
}

/* ==========================================================
   FACTION PICKER MODAL CASCADING LOGIC
   ========================================================== */

const factionModalOverlay = document.getElementById('factionModalOverlay');
const openFactionBtn = document.getElementById('openFactionBtn');
const closeFactionModalBtn = document.getElementById('closeFactionModal');
const resetFactionBtn = document.getElementById('resetFactionBtn');
const applyFactionBtn = document.getElementById('applyFactionBtn');

const selectFactionLevel = document.getElementById('selectFactionLevel');
const selectStream = document.getElementById('selectStream');
const selectDegree = document.getElementById('selectDegree');
const selectYear = document.getElementById('selectYear');
const crumbPath = document.getElementById('crumbPath');

function updateBreadcrumbPreview() {
  if (!crumbPath) return;

  const fKey = selectFactionLevel ? selectFactionLevel.value : '';
  const sKey = selectStream ? selectStream.value : '';
  const dKey = selectDegree ? selectDegree.value : '';
  const yVal = selectYear ? selectYear.value : '';

  if (!fKey) {
    crumbPath.innerHTML = '<span class="crumb-empty">Select a Faction to begin...</span>';
    if (applyFactionBtn) applyFactionBtn.disabled = true;
    return;
  }

  const fObj = factionData[fKey];
  const sObj = fObj && fObj.streams[sKey];
  const dObj = sObj && sObj.degrees[dKey];

  const crumbs = [];
  if (fObj) crumbs.push(fObj.label);
  if (sObj) crumbs.push(sObj.label);
  if (dObj) crumbs.push(dObj.label);
  if (yVal) crumbs.push(yVal);

  crumbPath.innerHTML = crumbs.map((c, idx) => 
    `<span class="crumb-badge">${c}</span>` + (idx < crumbs.length - 1 ? '<span class="crumb-sep">></span>' : '')
  ).join('');

  if (applyFactionBtn) {
    // Enable apply button if at least Faction & Stream are picked (or full path)
    applyFactionBtn.disabled = crumbs.length < 2;
  }
}

// 1. Faction Level Change
if (selectFactionLevel) {
  selectFactionLevel.addEventListener('change', () => {
    const fKey = selectFactionLevel.value;
    selectStream.innerHTML = '<option value="" disabled selected>-- Select Stream --</option>';
    selectDegree.innerHTML = '<option value="" disabled selected>-- Select Program --</option>';
    selectYear.innerHTML = '<option value="" disabled selected>-- Select Year --</option>';

    selectDegree.disabled = true;
    selectYear.disabled = true;

    if (fKey && factionData[fKey]) {
      const streams = factionData[fKey].streams;
      Object.keys(streams).forEach(stKey => {
        const opt = document.createElement('option');
        opt.value = stKey;
        opt.textContent = streams[stKey].label;
        selectStream.appendChild(opt);
      });
      selectStream.disabled = false;
    } else {
      selectStream.disabled = true;
    }
    updateBreadcrumbPreview();
  });
}

// 2. Stream Change
if (selectStream) {
  selectStream.addEventListener('change', () => {
    const fKey = selectFactionLevel.value;
    const sKey = selectStream.value;

    selectDegree.innerHTML = '<option value="" disabled selected>-- Select Program --</option>';
    selectYear.innerHTML = '<option value="" disabled selected>-- Select Year --</option>';
    selectYear.disabled = true;

    if (fKey && sKey && factionData[fKey] && factionData[fKey].streams[sKey]) {
      const degrees = factionData[fKey].streams[sKey].degrees;
      Object.keys(degrees).forEach(dgKey => {
        const opt = document.createElement('option');
        opt.value = dgKey;
        opt.textContent = degrees[dgKey].label;
        selectDegree.appendChild(opt);
      });
      selectDegree.disabled = false;
    } else {
      selectDegree.disabled = true;
    }
    updateBreadcrumbPreview();
  });
}

// 3. Degree Change
if (selectDegree) {
  selectDegree.addEventListener('change', () => {
    const fKey = selectFactionLevel.value;
    const sKey = selectStream.value;
    const dKey = selectDegree.value;

    selectYear.innerHTML = '<option value="" disabled selected>-- Select Year --</option>';

    if (fKey && sKey && dKey && factionData[fKey].streams[sKey].degrees[dKey]) {
      const years = factionData[fKey].streams[sKey].degrees[dKey].years;
      years.forEach(yr => {
        const opt = document.createElement('option');
        opt.value = yr;
        opt.textContent = yr;
        selectYear.appendChild(opt);
      });
      selectYear.disabled = false;
    } else {
      selectYear.disabled = true;
    }
    updateBreadcrumbPreview();
  });
}

// 4. Year Change
if (selectYear) {
  selectYear.addEventListener('change', () => {
    updateBreadcrumbPreview();
  });
}

// Open / Close Modal
if (openFactionBtn && factionModalOverlay) {
  openFactionBtn.addEventListener('click', () => {
    factionModalOverlay.classList.add('active');
  });
}

if (closeFactionModalBtn && factionModalOverlay) {
  closeFactionModalBtn.addEventListener('click', () => {
    factionModalOverlay.classList.remove('active');
  });
}

if (resetFactionBtn) {
  resetFactionBtn.addEventListener('click', () => {
    if (selectFactionLevel) selectFactionLevel.value = '';
    if (selectStream) { selectStream.innerHTML = '<option value="" disabled selected>-- Select Stream --</option>'; selectStream.disabled = true; }
    if (selectDegree) { selectDegree.innerHTML = '<option value="" disabled selected>-- Select Program --</option>'; selectDegree.disabled = true; }
    if (selectYear) { selectYear.innerHTML = '<option value="" disabled selected>-- Select Year --</option>'; selectYear.disabled = true; }
    updateBreadcrumbPreview();
  });
}

if (applyFactionBtn) {
  applyFactionBtn.addEventListener('click', () => {
    const fKey = selectFactionLevel.value;
    const sKey = selectStream.value;
    const dKey = selectDegree.value;
    const yVal = selectYear.value;

    if (!fKey) return;

    const fObj = factionData[fKey];
    const sObj = fObj && fObj.streams[sKey];
    const dObj = sObj && sObj.degrees[dKey];

    const fullPathKey = [fKey, sKey, dKey, yVal].filter(Boolean).join('_');
    
    // Create preview text e.g. "CS > B.Tech > 2nd Year" or "Science > FYJC"
    let shortLabelParts = [];
    if (sObj) shortLabelParts.push(sObj.label.replace('Computer Science (CS)', 'CS').replace('Information Tech (IT)', 'IT').replace(' Stream', ''));
    if (dObj) shortLabelParts.push(dObj.label);
    if (yVal) shortLabelParts.push(yVal);

    const shortLabel = shortLabelParts.join(' > ') || fObj.label;

    currentFactionPath = fullPathKey;
    currentFactionShortLabel = shortLabel;

    updateStatsUI(fullPathKey, shortLabel);

    if (factionModalOverlay) factionModalOverlay.classList.remove('active');
  });
}

// Initial state on page load: Zero start
updateStatsUI(null, null);

// Modal Edit Controls
const editModalOverlay = document.getElementById('editModalOverlay');
const openEditModalBtn = document.getElementById('openEditModal');
const closeEditModalBtn = document.getElementById('closeEditModal');
const cancelEditModalBtn = document.getElementById('cancelEditModal');
const editStatsForm = document.getElementById('editStatsForm');
const inputTotal = document.getElementById('inputTotalStudents');
const inputPresent = document.getElementById('inputPresentToday');

function openModal() {
  if (!editModalOverlay || !inputTotal || !inputPresent) return;
  const pathKey = currentFactionPath || 'cs_btech_2nd';
  const current = getFactionStats(pathKey);

  inputTotal.value = current.total;
  inputPresent.value = current.present;

  editModalOverlay.classList.add('active');
}

function closeModal() {
  if (editModalOverlay) {
    editModalOverlay.classList.remove('active');
  }
}

if (openEditModalBtn) openEditModalBtn.addEventListener('click', openModal);
if (closeEditModalBtn) closeEditModalBtn.addEventListener('click', closeModal);
if (cancelEditModalBtn) cancelEditModalBtn.addEventListener('click', closeModal);

if (editModalOverlay) {
  editModalOverlay.addEventListener('click', (e) => {
    if (e.target === editModalOverlay) closeModal();
  });
}

if (editStatsForm) {
  editStatsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pathKey = currentFactionPath || 'cs_btech_2nd';

    const newTotal = parseInt(inputTotal.value, 10) || 0;
    let newPresent = parseInt(inputPresent.value, 10) || 0;

    if (newPresent > newTotal) {
      newPresent = newTotal;
    }

    saveFactionStats(pathKey, newTotal, newPresent);
    updateStatsUI(pathKey, currentFactionShortLabel || 'CS > B.Tech');
    closeModal();
  });
}

// Initial page animation for stat values if present
const statValues = document.querySelectorAll('.stat-value');
if (statValues.length) {
  statValues.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(6px)';
    el.style.transition = 'opacity .4s ease, transform .4s ease';
    requestAnimationFrame(() => {
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 80);
    });
  });
}

/* ==========================================================
   STUDENTS DIRECTORY PAGE LOGIC (runs if on students.html)
   ========================================================== */

const defaultStudentsList = [
  { id: 1, roll: 'CS2024001', name: 'Aarav Sharma', email: 'aarav.s@email.com', course: 'CS > B.Tech > 2nd Year', factionGroup: 'higher_ed', rate: '95.6%', status: 'Active' },
  { id: 2, roll: 'CS2024002', name: 'Anjali Sharma', email: 'anjali.s@email.com', course: 'CS > B.Tech > 2nd Year', factionGroup: 'higher_ed', rate: '92.3%', status: 'Active' },
  { id: 3, roll: 'IT2024003', name: 'Karan Singh', email: 'karan.s@email.com', course: 'IT > B.Tech > 3rd Year', factionGroup: 'higher_ed', rate: '88.7%', status: 'Active' },
  { id: 4, roll: 'CM2024004', name: 'Pooja Patel', email: 'pooja.p@email.com', course: 'Commerce > B.Com > 1st Year', factionGroup: 'higher_ed', rate: '85.2%', status: 'Active' },
  { id: 5, roll: 'SC2024005', name: 'Rahul Yadav', email: 'rahul.y@email.com', course: 'Science > FYJC (11th Std)', factionGroup: 'junior_college', rate: '82.1%', status: 'Active' },
  { id: 6, roll: 'LW2024006', name: 'Sneha Kulkarni', email: 'sneha.k@email.com', course: 'Law > BA LL.B > 2nd Year', factionGroup: 'higher_ed', rate: '78.4%', status: 'Inactive' },
  { id: 7, roll: 'MD2024007', name: 'Vikram Malhotra', email: 'vikram.m@email.com', course: 'Medical > MBBS > 3rd Year', factionGroup: 'higher_ed', rate: '94.1%', status: 'Active' },
  { id: 8, roll: 'SK2024008', name: 'Ishita Roy', email: 'ishita.r@email.com', course: 'Secondary > 10th Grade', factionGroup: 'school', rate: '90.5%', status: 'Active' }
];

function getStudentsList() {
  const stored = localStorage.getItem('Ad-Reg_students');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return defaultStudentsList;
}

function saveStudentsList(list) {
  localStorage.setItem('Ad-Reg_students', JSON.stringify(list));
}

const studentsTableBody = document.getElementById('studentsTableBody');
const studentSearchInput = document.getElementById('studentSearchInput');
const studentFactionFilter = document.getElementById('studentFactionFilter');

function renderStudentsTable() {
  if (!studentsTableBody) return;

  const students = getStudentsList();
  const search = studentSearchInput ? studentSearchInput.value.toLowerCase().trim() : '';
  const filterGroup = studentFactionFilter ? studentFactionFilter.value : 'all';

  const filtered = students.filter(st => {
    const matchesSearch = !search || 
      st.name.toLowerCase().includes(search) || 
      st.roll.toLowerCase().includes(search) || 
      st.email.toLowerCase().includes(search) ||
      st.course.toLowerCase().includes(search);

    const matchesGroup = filterGroup === 'all' || st.factionGroup === filterGroup;

    return matchesSearch && matchesGroup;
  });

  if (filtered.length === 0) {
    studentsTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding: 40px; color: var(--ink-500);">
          No students found matching your criteria.
        </td>
      </tr>
    `;
  } else {
    studentsTableBody.innerHTML = filtered.map(st => {
      const initials = st.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      const statusClass = st.status === 'Active' ? 'active' : 'inactive';
      return `
        <tr>
          <td><strong>${st.roll}</strong></td>
          <td>
            <div class="student-meta">
              <div class="avatar-circle">${initials}</div>
              <div>
                <p class="student-name">${st.name}</p>
                <p class="student-email">${st.email}</p>
              </div>
            </div>
          </td>
          <td><span class="crumb-badge">${st.course}</span></td>
          <td><strong>${st.rate}</strong></td>
          <td><span class="status-badge ${statusClass}">${st.status}</span></td>
        </tr>
      `;
    }).join('');
  }

  // Update Summary Counts
  const totalEl = document.getElementById('totalEnrolledCount');
  const activeEl = document.getElementById('activeStudentsCount');
  const inactiveEl = document.getElementById('inactiveStudentsCount');
  const countEl = document.getElementById('tableShowingCount');

  if (totalEl) totalEl.textContent = students.length;
  if (activeEl) activeEl.textContent = students.filter(s => s.status === 'Active').length;
  if (inactiveEl) inactiveEl.textContent = students.filter(s => s.status === 'Inactive').length;
  if (countEl) countEl.textContent = `Showing ${filtered.length} of ${students.length} students`;
}

function deleteStudent(id) {
  let list = getStudentsList();
  list = list.filter(s => s.id !== id);
  saveStudentsList(list);
  renderStudentsTable();
}

if (studentSearchInput) {
  studentSearchInput.addEventListener('input', renderStudentsTable);
}

if (studentFactionFilter) {
  studentFactionFilter.addEventListener('change', renderStudentsTable);
}

// Add Student Modal Logic
const addStudentModalOverlay = document.getElementById('addStudentModalOverlay');
const openAddStudentModalBtn = document.getElementById('openAddStudentModal');
const closeAddStudentModalBtn = document.getElementById('closeAddStudentModal');
const cancelAddStudentModalBtn = document.getElementById('cancelAddStudentModal');
const addStudentForm = document.getElementById('addStudentForm');

if (openAddStudentModalBtn && addStudentModalOverlay) {
  openAddStudentModalBtn.addEventListener('click', () => {
    addStudentModalOverlay.classList.add('active');
  });
}

function closeAddModal() {
  if (addStudentModalOverlay) addStudentModalOverlay.classList.remove('active');
}

if (closeAddStudentModalBtn) closeAddStudentModalBtn.addEventListener('click', closeAddModal);
if (cancelAddStudentModalBtn) cancelAddStudentModalBtn.addEventListener('click', closeAddModal);

if (addStudentForm) {
  addStudentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('newStudentName').value.trim();
    const roll = document.getElementById('newStudentRoll').value.trim();
    const course = document.getElementById('newStudentCourse').value.trim();
    const email = document.getElementById('newStudentEmail').value.trim();
    const status = document.getElementById('newStudentStatus').value;

    if (!name || !roll || !email) return;

    let factionGroup = 'higher_ed';
    if (course.toLowerCase().includes('school')) factionGroup = 'school';
    else if (course.toLowerCase().includes('fyjc') || course.toLowerCase().includes('syjc')) factionGroup = 'junior_college';

    const list = getStudentsList();
    const newStudent = {
      id: Date.now(),
      roll,
      name,
      email,
      course,
      factionGroup,
      rate: '100.0%',
      status
    };

    list.unshift(newStudent);
    saveStudentsList(list);
    renderStudentsTable();
    closeAddModal();
    addStudentForm.reset();
  });
}

// Initial render for students table if on students.html page
renderStudentsTable();

/* ==========================================================
   DEVELOPER IFRAME LIVE PREVIEW FUNCTIONS
   ========================================================== */

function loadDevIframe(url) {
  const container = document.getElementById('devIframeContainer');
  const iframe = document.getElementById('devPreviewIframe');
  const title = document.getElementById('devIframeTitle');

  if (container && iframe) {
    iframe.src = url;
    if (title) title.textContent = `LIVE PREVIEW: ${url.toUpperCase()}`;
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    addDevAuditLog(`Developer embedded live preview of ${url}`);
  }
}

function closeDevIframe() {
  const container = document.getElementById('devIframeContainer');
  const iframe = document.getElementById('devPreviewIframe');
  if (container && iframe) {
    iframe.src = '';
    container.style.display = 'none';
  }
}

/* ==========================================================
   STUDENT PERSONAL ATTENDANCE RECORD SHEET (attendance.html)
   ========================================================== */

function getStudentAttendanceLogs() {
  const stored = localStorage.getItem('Ad-Reg_my_attendance_logs');
  if (stored) {
    try { return JSON.parse(stored); } catch(e) {}
  }
  // Default: Empty baseline until faculty marks lecture records
  return [];
}

function saveStudentAttendanceLogs(list) {
  localStorage.setItem('Ad-Reg_my_attendance_logs', JSON.stringify(list));
}

function renderMyAttendanceRecordSheet() {
  const tableBody = document.getElementById('myAttendanceLogsBody');
  if (!tableBody) return;

  const searchInput = document.getElementById('myAttendanceSearchInput');
  const subjectFilter = document.getElementById('mySubjectFilter');
  const statusFilter = document.getElementById('myStatusFilter');

  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selSubject = subjectFilter ? subjectFilter.value : 'all';
  const selStatus = statusFilter ? statusFilter.value : 'all';

  const logs = getStudentAttendanceLogs();

  const filtered = logs.filter(log => {
    const matchesQuery = !query ||
      log.subject.toLowerCase().includes(query) ||
      log.topic.toLowerCase().includes(query) ||
      log.faculty.toLowerCase().includes(query) ||
      log.date.toLowerCase().includes(query);

    const matchesSubject = selSubject === 'all' || log.subjectKey === selSubject;
    const matchesStatus = selStatus === 'all' || log.status === selStatus;

    return matchesQuery && matchesSubject && matchesStatus;
  });

  // Calculate Metrics (Zero baseline when no logs exist)
  const total = logs.length;
  const attended = logs.filter(l => l.status === 'Present').length;
  const missed = total - attended;
  const rate = total > 0 ? ((attended / total) * 100).toFixed(1) : '0.0';

  const overallEl = document.getElementById('myOverallRate');
  const totalEl = document.getElementById('myTotalLectures');
  const attendedEl = document.getElementById('myAttendedLectures');
  const missedEl = document.getElementById('myMissedLectures');
  const summaryEl = document.getElementById('myAttendanceSummaryText');

  if (overallEl) overallEl.textContent = `${rate}%`;
  if (totalEl) totalEl.textContent = total;
  if (attendedEl) attendedEl.textContent = attended;
  if (missedEl) missedEl.textContent = missed;
  if (summaryEl) summaryEl.textContent = total > 0 ? `Showing ${filtered.length} of ${total} verified lecture records` : 'No lecture sessions recorded yet';

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding: 48px 20px; color: var(--ink-500);">
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--ink-400)" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span style="font-weight: 700; font-size: 14px; color: var(--ink-700);">No verified lecture logs recorded yet.</span>
            <span style="font-size: 12px; color: var(--ink-500); max-width: 380px; line-height: 1.4;">Attendance data and verified percentages will appear here once faculty conduct and log lectures for your batch.</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map(log => {
    const isPresent = log.status === 'Present';
    const badgeClass = isPresent ? 'active' : 'inactive';
    return `
      <tr>
        <td><strong>${log.date}</strong></td>
        <td><span class="crumb-badge">${log.subject}</span></td>
        <td>${log.faculty}</td>
        <td>${log.topic}</td>
        <td>
          <span class="status-badge ${badgeClass}">${log.status}</span>
        </td>
      </tr>
    `;
  }).join('');
}

const myAttendanceSearchInput = document.getElementById('myAttendanceSearchInput');
if (myAttendanceSearchInput) {
  myAttendanceSearchInput.addEventListener('input', renderMyAttendanceRecordSheet);
}

const mySubjectFilter = document.getElementById('mySubjectFilter');
if (mySubjectFilter) {
  mySubjectFilter.addEventListener('change', renderMyAttendanceRecordSheet);
}

const myStatusFilter = document.getElementById('myStatusFilter');
if (myStatusFilter) {
  myStatusFilter.addEventListener('change', renderMyAttendanceRecordSheet);
}

// Initial render for student attendance sheet
renderMyAttendanceRecordSheet();

/* ==========================================================
   STUDENT PERSONALIZATION & PROFILE STATE MANAGER
   ========================================================== */

const defaultStudentProfile = {
  name: 'Harish Prajapati',
  roll: 'STU-2024-001',
  faction: 'B.Tech CS 2nd Year',
  email: 'student@college.edu',
  dob: '2004-05-12',
  dobLocked: true,
  dobLockedDate: '15 Jan 2024',
  phone: '+91 98765 43210',
  emergency: '+91 91234 56789',
  address: 'Room 304, Tech Tower Hostel, University Campus Residency',
  goal: '—',
  photoUrl: null
};

function getStudentProfile() {
  const stored = localStorage.getItem('Ad-Reg_studentProfile');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return defaultStudentProfile;
}

function saveStudentProfile(profile) {
  localStorage.setItem('Ad-Reg_studentProfile', JSON.stringify(profile));
  updateStudentSidebarWidgets();
}

function formatDobDisplay(dateStr) {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = parseInt(parts[2], 10);
  const m = parseInt(parts[1], 10) - 1;
  const y = parseInt(parts[0], 10);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${d} ${monthNames[m] || ''} ${y}`;
}

function calculateAgeYears(dateStr) {
  if (!dateStr) return '';
  const birthDate = new Date(dateStr);
  const today = new Date();
  if (isNaN(birthDate.getTime())) return '';
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return `${age} Years`;
}

function toggleStudentNavDropdown(e) {
  if (e) e.stopPropagation();
  const wrapper = document.getElementById('profileDropdownWrapper');
  if (wrapper) {
    wrapper.classList.toggle('active');
  }
}

// Close dropdown on click outside
document.addEventListener('click', (e) => {
  const wrapper = document.getElementById('profileDropdownWrapper');
  if (wrapper && !wrapper.contains(e.target)) {
    wrapper.classList.remove('active');
  }
});

function toggleCollapsibleSidebar() {
  const shell = document.querySelector('.app-shell');
  const sidebar = document.querySelector('.sidebar');
  if (shell) {
    shell.classList.toggle('sidebar-collapsed');
    const isCollapsed = shell.classList.contains('sidebar-collapsed');
    localStorage.setItem('Ad-Reg_sidebarCollapsed', isCollapsed ? 'true' : 'false');
  }
  if (sidebar) {
    sidebar.classList.toggle('nav-collapsed');
  }
}

// Restore sidebar state on load
(function restoreSidebarState() {
  const isCollapsed = localStorage.getItem('Ad-Reg_sidebarCollapsed') === 'true';
  const shell = document.querySelector('.app-shell');
  const sidebar = document.querySelector('.sidebar');
  if (shell && isCollapsed) {
    shell.classList.add('sidebar-collapsed');
  }
  if (sidebar && isCollapsed) {
    sidebar.classList.add('nav-collapsed');
  }
})();

function updateStudentSidebarWidgets() {
  const profile = getStudentProfile();

  // Update Welcome Header & Crumb Badge
  const welcomeFirstNameEl = document.getElementById('welcomeStudentFirstName');
  const crumbBadgeEl = document.getElementById('studentCrumbBadge');
  const headerNameEl = document.getElementById('headerStudentName');

  if (welcomeFirstNameEl) {
    welcomeFirstNameEl.textContent = profile.name ? profile.name.split(' ')[0] : 'Student';
  }
  if (crumbBadgeEl) {
    crumbBadgeEl.textContent = profile.faction || '—';
  }
  if (headerNameEl) {
    headerNameEl.textContent = profile.name || 'Student';
  }
  // Update Today Pill with current real date
  const todayPills = document.querySelectorAll('#studentTodayPill, .today-pill');
  const todayDate = new Date();
  const mNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedToday = `${todayDate.getDate()} ${mNames[todayDate.getMonth()]} ${todayDate.getFullYear()}`;
  todayPills.forEach(pill => {
    pill.textContent = `Today, ${formattedToday}`;
  });

  // Update Sidebar widgets & Header Profile Buttons
  const profileNameEls = document.querySelectorAll('.profile-name, .profile-toggle-name, .profile-card-name');
  const profileMetaEls = document.querySelectorAll('.profile-meta, .profile-card-meta');
  const avatarCircleEls = document.querySelectorAll('.avatar-circle');

  profileNameEls.forEach(el => el.textContent = profile.name || '—');
  profileMetaEls.forEach(el => el.textContent = `${profile.roll || '—'} | ${profile.faction || '—'}`);

  avatarCircleEls.forEach(el => {
    if (profile.photoUrl) {
      el.style.backgroundImage = `url(${profile.photoUrl})`;
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      el.innerHTML = '';
    } else {
      el.style.backgroundImage = 'none';
      el.style.backgroundColor = '';
      const nameParts = (profile.name || 'Student').trim().split(/\s+/);
      const initials = nameParts.length > 1 
        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
        : nameParts[0].substring(0, 2).toUpperCase();
      el.innerHTML = `<span style="color:#ffffff; font-weight:800; font-size:13px; letter-spacing:0.5px;">${initials || 'ST'}</span>`;
    }
  });

  // Update Student Profile Form fields on student-profile.html without clobbering active input
  const nameInput = document.getElementById('studentNameInput');
  const rollInput = document.getElementById('studentRollInput');
  const factionInput = document.getElementById('studentFactionInput');
  const emailInput = document.getElementById('studentEmailInput');
  const addressInput = document.getElementById('studentAddressInput');

  if (nameInput && !nameInput.dataset.modified) nameInput.value = profile.name || '';
  if (rollInput) rollInput.value = profile.roll || '';
  if (factionInput) factionInput.value = profile.faction || '';
  if (emailInput) emailInput.value = profile.email || '';
  if (addressInput && !addressInput.dataset.modified) addressInput.value = profile.address || '';

  // Update e-ID Card widgets
  const eidName = document.getElementById('eidStudentName');
  const eidRoll = document.getElementById('eidStudentRoll');
  const eidDept = document.getElementById('eidStudentDept');
  const eidDob = document.getElementById('eidStudentDob');
  const eidEmail = document.getElementById('eidStudentEmail');
  const eidInitials = document.getElementById('eidProfileInitials');

  if (eidName) eidName.textContent = profile.name || 'Student Name';
  if (eidRoll) eidRoll.textContent = profile.roll || 'STU-001';
  if (eidDept) eidDept.textContent = profile.faction || 'Department';
  if (eidDob) eidDob.textContent = formatDobDisplay(profile.dob);
  if (eidEmail) eidEmail.textContent = profile.email || 'student@college.edu';
  if (eidInitials) {
    const nameParts = (profile.name || 'ST').trim().split(/\s+/);
    const initials = nameParts.length > 1 
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : nameParts[0].substring(0, 2).toUpperCase();
    eidInitials.textContent = initials;
  }

  // Manage DOB Lock UI state
  const dobUnsetWrapper = document.getElementById('dobUnsetWrapper');
  const dobLockedWrapper = document.getElementById('dobLockedWrapper');
  const lockedDobDisplay = document.getElementById('lockedDobDisplay');
  const lockedDobAgeDisplay = document.getElementById('lockedDobAgeDisplay');
  const dobContainer = document.getElementById('dobContainer');

  if (dobUnsetWrapper && dobLockedWrapper) {
    if (profile.dob && profile.dobLocked) {
      dobUnsetWrapper.style.display = 'none';
      dobLockedWrapper.style.display = 'block';
      if (dobContainer) dobContainer.classList.add('is-locked');
      if (lockedDobDisplay) lockedDobDisplay.textContent = formatDobDisplay(profile.dob);
      if (lockedDobAgeDisplay) lockedDobAgeDisplay.textContent = `(Age: ${calculateAgeYears(profile.dob)})`;

      // Check if there is a pending faculty correction request
      const pendingReqs = getDobCorrectionRequests();
      const myPending = pendingReqs.find(r => r.studentRoll === profile.roll && r.status === 'Pending Faculty Review');
      const pendingBanner = document.getElementById('dobPendingRequestBanner');
      const pendingVal = document.getElementById('pendingDobVal');
      if (pendingBanner && pendingVal) {
        if (myPending) {
          pendingBanner.style.display = 'block';
          pendingVal.textContent = `${formatDobDisplay(myPending.requestedDob)} (Reason: "${myPending.message.substring(0, 45)}...")`;
        } else {
          pendingBanner.style.display = 'none';
        }
      }
    } else {
      dobUnsetWrapper.style.display = 'block';
      dobLockedWrapper.style.display = 'none';
      if (dobContainer) dobContainer.classList.remove('is-locked');
      const picker = document.getElementById('studentDobPicker');
      if (picker && profile.dob) picker.value = profile.dob;
    }
  }

  // Photo Container Preview
  const imgPreview = document.getElementById('profileImagePreview');
  const initialsSpan = document.getElementById('profileInitials');
  if (imgPreview && initialsSpan) {
    if (profile.photoUrl) {
      imgPreview.src = profile.photoUrl;
      imgPreview.style.display = 'block';
      initialsSpan.style.display = 'none';
    } else {
      imgPreview.style.display = 'none';
      initialsSpan.style.display = 'inline';
      const initials = (profile.name || 'ST').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      initialsSpan.textContent = initials || 'ST';
    }
  }
}

// Track input changes to toggle Change Status Icon before & after save
function markProfileFieldModified(inputEl) {
  if (inputEl) {
    inputEl.dataset.modified = 'true';
    const statusIcon = document.getElementById('profileSaveStatusIcon');
    const statusText = document.getElementById('profileSaveStatusText');
    if (statusIcon && statusText) {
      statusIcon.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`;
      statusText.textContent = 'Unsaved Changes';
      statusText.style.color = '#b45309';
    }
  }
}

// Save Student Profile (Allows Name and Address updates)
function handleStudentProfileSave(e) {
  e.preventDefault();
  const profile = getStudentProfile();

  const nameVal = document.getElementById('studentNameInput').value.trim();
  const addressVal = document.getElementById('studentAddressInput').value.trim();

  if (!nameVal || !addressVal) {
    alert('Please provide both your Full Name and Residential Address.');
    return;
  }

  profile.name = nameVal;
  profile.address = addressVal;

  saveStudentProfile(profile);

  // Clear modified status and show Saved Checkmark Icon
  const nameInput = document.getElementById('studentNameInput');
  const addressInput = document.getElementById('studentAddressInput');
  if (nameInput) delete nameInput.dataset.modified;
  if (addressInput) delete addressInput.dataset.modified;

  const statusIcon = document.getElementById('profileSaveStatusIcon');
  const statusText = document.getElementById('profileSaveStatusText');
  if (statusIcon && statusText) {
    statusIcon.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    statusText.textContent = 'Changes Saved to Record';
    statusText.style.color = '#047857';
  }

  alert(`Student Profile Updated Successfully\n\nFull Name: ${profile.name}\nResidential Address: ${profile.address}\n\nYour institutional records and e-ID card have been updated.`);
}

// DOB Entry & Confirmation Modal System (Preserves currently typed name & address)
let tempSelectedDob = '';

function initiateDobLockPrompt() {
  const picker = document.getElementById('studentDobPicker');
  if (!picker || !picker.value) {
    alert('Please select your Date of Birth in the date picker first.');
    return;
  }

  tempSelectedDob = picker.value;
  const formatted = formatDobDisplay(tempSelectedDob);
  const age = calculateAgeYears(tempSelectedDob);

  const dateEl = document.getElementById('dobPromptFormattedDate');
  const ageEl = document.getElementById('dobPromptAgeText');
  const modal = document.getElementById('dobConfirmModalOverlay');

  if (dateEl) dateEl.textContent = formatted;
  if (ageEl) ageEl.textContent = `Calculated Age: ${age}`;
  if (modal) modal.classList.add('active');
}

function closeDobConfirmModal() {
  const modal = document.getElementById('dobConfirmModalOverlay');
  if (modal) modal.classList.remove('active');
}

function confirmAndLockDob() {
  if (!tempSelectedDob) return;
  const profile = getStudentProfile();

  // Preserve any currently typed name or address before locking
  const nameInput = document.getElementById('studentNameInput');
  const addressInput = document.getElementById('studentAddressInput');
  if (nameInput && nameInput.value.trim()) profile.name = nameInput.value.trim();
  if (addressInput && addressInput.value.trim()) profile.address = addressInput.value.trim();

  profile.dob = tempSelectedDob;
  profile.dobLocked = true;
  profile.dobLockedDate = formatDobDisplay(tempSelectedDob);

  saveStudentProfile(profile);
  closeDobConfirmModal();

  alert(`Date of Birth Permanently Locked\n\nYour official Date of Birth is now recorded as: ${formatDobDisplay(tempSelectedDob)} (${calculateAgeYears(tempSelectedDob)}).\n\nAs per university regulations, this date is locked. Any future modifications require formal Faculty Administration approval.`);
  updateStudentSidebarWidgets();
}

// Faculty Approval DOB Correction System
function getDobCorrectionRequests() {
  const stored = localStorage.getItem('Ad-Reg_dob_change_requests');
  if (stored) {
    try { return JSON.parse(stored); } catch(e) {}
  }
  return [];
}

function saveDobCorrectionRequests(list) {
  localStorage.setItem('Ad-Reg_dob_change_requests', JSON.stringify(list));
}

function openRequestDobChangeModal() {
  const profile = getStudentProfile();
  const modal = document.getElementById('requestDobChangeModalOverlay');
  const currentDobEl = document.getElementById('modalCurrentLockedDob');
  if (currentDobEl) currentDobEl.textContent = `${formatDobDisplay(profile.dob)} (Age: ${calculateAgeYears(profile.dob)})`;
  if (modal) modal.classList.add('active');
}

function closeRequestDobChangeModal() {
  const modal = document.getElementById('requestDobChangeModalOverlay');
  if (modal) modal.classList.remove('active');
}

function handleDobCorrectionRequestSubmit(e) {
  e.preventDefault();
  const profile = getStudentProfile();
  const reqDob = document.getElementById('modalRequestedNewDob').value;
  const msg = document.getElementById('modalDobCustomMessage').value.trim();

  if (!reqDob || !msg) {
    alert('Please specify the requested date of birth and provide a detailed explanation for faculty review.');
    return;
  }

  const list = getDobCorrectionRequests();
  const newReq = {
    id: 'DOB-REQ-' + Math.floor(1000 + Math.random() * 9000),
    studentRoll: profile.roll,
    studentName: profile.name,
    currentDob: profile.dob,
    requestedDob: reqDob,
    message: msg,
    submittedDate: new Date().toLocaleDateString(),
    status: 'Pending Faculty Review'
  };

  list.unshift(newReq);
  saveDobCorrectionRequests(list);

  alert(`DOB Correction Request Forwarded to Faculty\n\nRequested Date: ${formatDobDisplay(reqDob)}\nCustom Explanation: "${msg}"\n\nYour Department Head and Faculty Administration have been notified for review.`);
  closeRequestDobChangeModal();
  document.getElementById('dobCorrectionForm').reset();
  updateStudentSidebarWidgets();
}

// Profile Photo File Upload Delegated Handler
document.addEventListener('change', (e) => {
  if (e.target && e.target.id === 'profilePhotoInput') {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        const profile = getStudentProfile();
        profile.photoUrl = evt.target.result;
        saveStudentProfile(profile);
      };
      reader.readAsDataURL(file);
    }
  }
});

function removeProfilePhoto() {
  const profile = getStudentProfile();
  profile.photoUrl = null;
  saveStudentProfile(profile);
}

// Initial Sync for Student Profile Widgets across all pages
updateStudentSidebarWidgets();

function renderStudentDashboardLiveStats() {
  const overallRateEl = document.getElementById('studentOverallRate');
  const classesCountEl = document.getElementById('studentClassesCount');
  const absentCountEl = document.getElementById('studentAbsentCount');
  const approvedLeavesEl = document.getElementById('approvedLeavesCount');

  if (!overallRateEl) return;

  const leaves = getStudentLeaves();
  const approvedCount = leaves.filter(l => l.status === 'Approved').length;
  if (approvedLeavesEl) approvedLeavesEl.textContent = approvedCount;

  if (typeof markingSheetData !== 'undefined' && markingSheetData.length > 0) {
    const total = markingSheetData.length;
    const present = markingSheetData.filter(s => s.isPresent).length;
    const absent = total - present;
    const rate = ((present / total) * 100).toFixed(1);

    overallRateEl.textContent = `${rate}%`;
    if (classesCountEl) classesCountEl.textContent = `${present} / ${total}`;
    if (absentCountEl) absentCountEl.textContent = absent;
  } else {
    overallRateEl.textContent = '0.0%';
    if (classesCountEl) classesCountEl.textContent = '0 / 0';
    if (absentCountEl) absentCountEl.textContent = '0';
  }
}

renderStudentDashboardLiveStats();

/* ==========================================================
   STUDENT ATTENDANCE RANKING SYSTEM BOARD (LEADERBOARD)
   ========================================================== */

function renderAttendanceLeaderboard() {
  const podiumContainer = document.getElementById('leaderboardTopPodium');
  const listContainer = document.getElementById('leaderboardList');
  const factionSelect = document.getElementById('leaderboardFactionFilter');

  if (!podiumContainer && !listContainer) return;

  const currentFilter = factionSelect ? factionSelect.value : 'all';
  const students = getStudentsList();

  // Filter students
  const filtered = students.filter(st => {
    if (currentFilter === 'all') return true;
    return st.factionGroup === currentFilter;
  });

  // Sort in descending order by numeric attendance percentage
  filtered.sort((a, b) => {
    const rateA = parseFloat(a.rate.replace('%', '')) || 0;
    const rateB = parseFloat(b.rate.replace('%', '')) || 0;
    return rateB - rateA;
  });

  if (filtered.length === 0) {
    if (podiumContainer) podiumContainer.innerHTML = '';
    if (listContainer) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 36px 16px; color: var(--ink-500); background: rgba(255,255,255,0.7); border-radius: var(--radius-md); border: 1px dashed var(--border);">
          <p style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">No rankings available in this category yet.</p>
          <p style="font-size: 12.5px;">Leaderboard rankings calculate in real-time as faculty records attendance.</p>
        </div>
      `;
    }
    return;
  }

  // Top 3 Podium
  const top1 = filtered[0];
  const top2 = filtered.length > 1 ? filtered[1] : null;
  const top3 = filtered.length > 2 ? filtered[2] : null;

  if (podiumContainer) {
    let podiumHtml = '';

    // Rank 2 (Left)
    if (top2) {
      const init2 = top2.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      podiumHtml += `
        <div class="podium-card rank-2">
          <span class="podium-rank-badge">Rank 2</span>
          <div class="podium-avatar">${init2}</div>
          <div class="podium-name">${top2.name}</div>
          <div class="podium-roll">${top2.roll} • ${top2.course.split('>')[0].trim()}</div>
          <div class="podium-percent">${top2.rate}</div>
          <div class="podium-classes">Attendance Record</div>
        </div>
      `;
    } else {
      podiumHtml += `<div class="podium-card rank-2" style="opacity: 0.5; display: flex; align-items: center; justify-content: center; min-height: 180px;"><p style="font-size: 12px; color: var(--ink-500);">Position Open</p></div>`;
    }

    // Rank 1 (Center - Featured)
    if (top1) {
      const init1 = top1.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      podiumHtml += `
        <div class="podium-card rank-1">
          <span class="podium-rank-badge">Rank 1</span>
          <div class="podium-avatar">${init1}</div>
          <div class="podium-name">${top1.name}</div>
          <div class="podium-roll">${top1.roll} • ${top1.course.split('>')[0].trim()}</div>
          <div class="podium-percent">${top1.rate}</div>
          <div class="podium-classes" style="color: #92400e; font-weight: 700;">Highest Attendance</div>
        </div>
      `;
    }

    // Rank 3 (Right)
    if (top3) {
      const init3 = top3.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      podiumHtml += `
        <div class="podium-card rank-3">
          <span class="podium-rank-badge">Rank 3</span>
          <div class="podium-avatar">${init3}</div>
          <div class="podium-name">${top3.name}</div>
          <div class="podium-roll">${top3.roll} • ${top3.course.split('>')[0].trim()}</div>
          <div class="podium-percent">${top3.rate}</div>
          <div class="podium-classes">Attendance Record</div>
        </div>
      `;
    } else {
      podiumHtml += `<div class="podium-card rank-3" style="opacity: 0.5; display: flex; align-items: center; justify-content: center; min-height: 180px;"><p style="font-size: 12px; color: var(--ink-500);">Position Open</p></div>`;
    }

    podiumContainer.innerHTML = podiumHtml;
  }

  // Ranks 4+ List
  if (listContainer) {
    const remaining = filtered.slice(3);
    if (remaining.length === 0) {
      listContainer.innerHTML = '';
    } else {
      listContainer.innerHTML = remaining.map((st, idx) => {
        const rankNum = idx + 4;
        const initials = st.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const percentVal = parseFloat(st.rate.replace('%', '')) || 0;

        return `
          <div class="leaderboard-row">
            <div class="leaderboard-left">
              <div class="rank-number-pill">#${rankNum}</div>
              <div class="avatar-circle" style="width: 38px; height: 38px; font-size: 13px;">${initials}</div>
              <div class="leaderboard-user-info">
                <div class="leaderboard-user-name">${st.name}</div>
                <div class="leaderboard-user-meta">${st.roll} • <span class="crumb-badge" style="font-size: 10.5px; padding: 2px 6px;">${st.course}</span></div>
              </div>
            </div>
            <div class="leaderboard-right">
              <div class="leaderboard-bar-wrap">
                <div class="progress-bar" style="height: 7px;">
                  <div class="progress-fill" style="width: ${percentVal}%;"></div>
                </div>
              </div>
              <div class="leaderboard-rate-val">${st.rate}</div>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

// Initial Leaderboard render
renderAttendanceLeaderboard();

/* ==========================================================
   INDIA REGIONAL ACADEMIC & GAZETTED HOLIDAY CALENDAR ENGINE
   ========================================================== */

const currentRealDate = new Date();
let calState = {
  year: currentRealDate.getFullYear(),
  month: currentRealDate.getMonth(), // Current real month (0-indexed)
  selectedDay: currentRealDate.getDate() // Current real day
};

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const INDIA_ACADEMIC_HOLIDAYS = [
  { month: 0, day: 26, title: "Republic Day", type: "national", typeLabel: "National Holiday", reason: "Government of India Gazetted National Celebration" },
  { month: 2, day: 8, title: "Maha Shivratri", type: "gazetted", typeLabel: "Government Gazetted Holiday", reason: "Gazetted Religious and Cultural Observance" },
  { month: 2, day: 25, title: "Holi (Festival of Colours)", type: "gazetted", typeLabel: "Government Gazetted Holiday", reason: "Gazetted Festival Holiday" },
  { month: 2, day: 29, title: "Good Friday", type: "gazetted", typeLabel: "Government Gazetted Holiday", reason: "Gazetted Government Holiday" },
  { month: 3, day: 11, title: "Eid-ul-Fitr (Ramadan Eid)", type: "gazetted", typeLabel: "Government Gazetted Holiday", reason: "Gazetted National Religious Holiday" },
  { month: 3, day: 21, title: "Mahavir Jayanti", type: "gazetted", typeLabel: "Government Gazetted Holiday", reason: "Gazetted Religious and Cultural Holiday" },
  { month: 4, day: 23, title: "Buddha Purnima", type: "gazetted", typeLabel: "Government Gazetted Holiday", reason: "Gazetted Buddhist Observance" },
  { month: 5, day: 17, title: "Bakrid / Eid al-Adha", type: "gazetted", typeLabel: "Government Gazetted Holiday", reason: "Gazetted Religious Observance" },
  { month: 6, day: 17, title: "Muharram", type: "gazetted", typeLabel: "Government Gazetted Holiday", reason: "Gazetted Religious Holiday" },
  { month: 7, day: 15, title: "Independence Day", type: "national", typeLabel: "National Holiday", reason: "Indian Independence Day Celebration" },
  { month: 7, day: 19, title: "Raksha Bandhan", type: "institutional", typeLabel: "Institutional College Holiday", reason: "University Declared Cultural Festival Break" },
  { month: 7, day: 26, title: "Janmashtami", type: "gazetted", typeLabel: "Government Gazetted Holiday", reason: "Gazetted Krishna Janmashtami Celebration" },
  { month: 8, day: 16, title: "Milad-un-Nabi (Eid-e-Milad)", type: "gazetted", typeLabel: "Government Gazetted Holiday", reason: "Gazetted Religious Holiday" },
  { month: 9, day: 2, title: "Mahatma Gandhi Jayanti", type: "national", typeLabel: "National Holiday", reason: "National Observance - Father of the Nation" },
  { month: 9, day: 12, title: "Dussehra / Vijayadashami", type: "gazetted", typeLabel: "Government Gazetted Holiday", reason: "Gazetted Festival Holiday" },
  { month: 9, day: 31, title: "Diwali (Deepavali)", type: "gazetted", typeLabel: "Government Gazetted Holiday", reason: "Gazetted Festival of Lights" },
  { month: 10, day: 1, title: "Govardhan Puja / New Year", type: "gazetted", typeLabel: "Government Gazetted Holiday", reason: "Gazetted Post-Diwali State Holiday" },
  { month: 10, day: 15, title: "Guru Nanak Jayanti", type: "gazetted", typeLabel: "Government Gazetted Holiday", reason: "Gazetted Prakash Utsav Observance" },
  { month: 11, day: 25, title: "Christmas Day", type: "gazetted", typeLabel: "Government Gazetted Holiday", reason: "Gazetted National Holiday" }
];

function getCompensatorySessions() {
  const stored = localStorage.getItem('Ad-Reg_compensatory_sessions');
  if (stored) {
    try { return JSON.parse(stored); } catch(e) {}
  }
  return [];
}

function saveCompensatorySessions(list) {
  localStorage.setItem('Ad-Reg_compensatory_sessions', JSON.stringify(list));
}

function renderInbuiltCalendar() {
  const grid = document.getElementById('calendarDaysGrid');
  const title = document.getElementById('calMonthYearTitle');
  if (!grid) return;

  if (title) title.textContent = `${MONTH_NAMES[calState.month]} ${calState.year}`;

  const firstDay = new Date(calState.year, calState.month, 1).getDay();
  const totalDays = new Date(calState.year, calState.month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(calState.year, calState.month, 0).getDate();

  const compSessions = getCompensatorySessions();

  let html = '';

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    const dayNum = prevMonthTotalDays - i;
    html += `<div class="cal-day-cell other-month"><span class="cal-day-number">${dayNum}</span></div>`;
  }

  // Current month days
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === calState.year && today.getMonth() === calState.month;

  for (let d = 1; d <= totalDays; d++) {
    const isToday = isCurrentMonth && d === today.getDate();
    const isSelected = d === calState.selectedDay;

    let badgeHtml = '';
    let extraClass = '';

    // Check India Holiday
    const holiday = INDIA_ACADEMIC_HOLIDAYS.find(h => h.month === calState.month && h.day === d);
    // Check Compensatory Session
    const comp = compSessions.find(c => c.year === calState.year && c.month === calState.month && c.day === d);

    if (holiday) {
      if (holiday.type === 'national') {
        badgeHtml = `<span class="cal-day-badge badge-national">National</span>`;
      } else if (holiday.type === 'institutional') {
        badgeHtml = `<span class="cal-day-badge badge-inst">Campus</span>`;
      } else {
        badgeHtml = `<span class="cal-day-badge badge-gazetted">Gazetted</span>`;
      }
      extraClass = 'holiday-day';
    } else if (comp) {
      badgeHtml = `<span class="cal-day-badge badge-compensatory">Working</span>`;
      extraClass = 'working-day';
    }

    html += `
      <div class="cal-day-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected-day' : ''} ${extraClass}" onclick="selectCalendarDate(${calState.year}, ${calState.month}, ${d})">
        <span class="cal-day-number">${d}</span>
        ${badgeHtml}
      </div>
    `;
  }

  // Next month leading days
  const totalCellsSoFar = firstDay + totalDays;
  const remainingCells = 35 - totalCellsSoFar;
  for (let i = 1; i <= (remainingCells > 0 ? remainingCells : 42 - totalCellsSoFar); i++) {
    html += `<div class="cal-day-cell other-month"><span class="cal-day-number">${i}</span></div>`;
  }

  grid.innerHTML = html;
  renderSelectedDateEvents();
}

function changeCalendarMonth(delta) {
  calState.month += delta;
  if (calState.month < 0) {
    calState.month = 11;
    calState.year--;
  } else if (calState.month > 11) {
    calState.month = 0;
    calState.year++;
  }
  calState.selectedDay = 1;
  renderInbuiltCalendar();
}

function jumpToTodayCalendar() {
  const now = new Date();
  calState.year = now.getFullYear();
  calState.month = now.getMonth();
  calState.selectedDay = now.getDate();
  renderInbuiltCalendar();
}

function selectCalendarDate(year, month, day) {
  calState.year = year;
  calState.month = month;
  calState.selectedDay = day;
  renderInbuiltCalendar();
}

function renderSelectedDateEvents() {
  const titleEl = document.getElementById('selectedDateTitle');
  const subtitleEl = document.getElementById('selectedDateSubtitle');
  const container = document.getElementById('dateEventsContainer');

  if (!titleEl || !container) return;

  const dateStr = `${calState.selectedDay} ${MONTH_NAMES[calState.month]} ${calState.year}`;
  titleEl.textContent = `Schedule: ${dateStr}`;

  const holiday = INDIA_ACADEMIC_HOLIDAYS.find(h => h.month === calState.month && h.day === calState.selectedDay);
  const compSessions = getCompensatorySessions();
  const comp = compSessions.find(c => c.year === calState.year && c.month === calState.month && c.day === calState.selectedDay);

  if (holiday) {
    if (subtitleEl) subtitleEl.textContent = holiday.typeLabel;
    container.innerHTML = `
      <div class="result-card" style="border-left: 4px solid #d97706; background: rgba(254, 243, 199, 0.4);">
        <p class="result-term">${holiday.title}</p>
        <div style="margin: 6px 0;">
          <span class="holiday-type-tag ${holiday.type}">${holiday.typeLabel}</span>
        </div>
        <p class="section-sub" style="margin-top: 4px; color: var(--ink-700);"><strong>Official Reason:</strong> ${holiday.reason}</p>
        <p class="section-sub" style="font-size: 11.5px; margin-top: 4px;">All academic lectures, tutorial labs, and institutional operations suspended.</p>
      </div>
    `;
  } else if (comp) {
    if (subtitleEl) subtitleEl.textContent = 'Faculty Compensatory Class Session';
    container.innerHTML = `
      <div class="result-card" style="border-left: 4px solid #16a34a; background: rgba(220, 252, 231, 0.4);">
        <p class="result-term">${comp.subject}</p>
        <div style="margin: 6px 0;">
          <span class="holiday-type-tag compensatory">Compensatory Session</span>
        </div>
        <p class="section-sub" style="color: var(--ink-700);"><strong>Timing and Room:</strong> ${comp.time}</p>
        <p class="section-sub" style="margin-top: 4px;"><strong>Reason:</strong> ${comp.reason}</p>
      </div>
    `;
  } else {
    if (subtitleEl) subtitleEl.textContent = 'Regular Academic Schedule';
    container.innerHTML = `
      <a href="student-schedule.html" class="result-card clickable-shortcut-card" title="Click to view live timetable and room schedule" style="border-left: 4px solid var(--blue-600);">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <p class="result-term" style="margin: 0; color: var(--blue-700);">Academic Timetable</p>
          <span style="font-size: 11.5px; font-weight: 700; color: var(--blue-600); display: flex; align-items: center; gap: 4px;">
            Open Timetable
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </span>
        </div>
        <p class="section-sub" style="margin: 4px 0 0 0;">Lectures and tutorial sessions are active as per department schedule.</p>
        <div style="margin-top: 8px;">
          <span class="crumb-badge" style="font-size: 11px; padding: 3px 10px;">Click to View Department Schedule &rarr;</span>
        </div>
      </a>
    `;
  }
}

function openCompensatoryModal() {
  const modal = document.getElementById('compensatoryModalOverlay');
  const dateInput = document.getElementById('compDate');
  if (modal) {
    modal.classList.add('active');
    if (dateInput) {
      const monthStr = String(calState.month + 1).padStart(2, '0');
      const dayStr = String(calState.selectedDay).padStart(2, '0');
      dateInput.value = `${calState.year}-${monthStr}-${dayStr}`;
    }
  }
}

function closeCompensatoryModal() {
  const modal = document.getElementById('compensatoryModalOverlay');
  if (modal) modal.classList.remove('active');
}

function handleCompensatoryFormSubmit(e) {
  e.preventDefault();
  const dateVal = document.getElementById('compDate').value;
  const subject = document.getElementById('compSubject').value.trim();
  const time = document.getElementById('compTime').value.trim();
  const reason = document.getElementById('compReason').value.trim();

  if (!dateVal || !subject) return;

  const parts = dateVal.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const list = getCompensatorySessions();
  list.push({ year, month, day, subject, time, reason });
  saveCompensatorySessions(list);

  alert(`Compensatory Class Scheduled\n\n${subject} scheduled on ${day} ${MONTH_NAMES[month]} ${year}.`);
  closeCompensatoryModal();
  renderInbuiltCalendar();
}

// Initial render for inbuilt calendar if on calendar.html
renderInbuiltCalendar();


/* ==========================================================
   OFFICIAL NOTICES & DISCUSSION FORUM ENGINE (notices.html)
   ========================================================== */

function getAnnouncementsList() {
  const stored = localStorage.getItem('Ad-Reg_announcements');
  if (stored) {
    try { return JSON.parse(stored); } catch(e) {}
  }
  // Default: Empty baseline
  return [];
}

function saveAnnouncementsList(list) {
  localStorage.setItem('Ad-Reg_announcements', JSON.stringify(list));
}

function getDiscussionThreads() {
  const stored = localStorage.getItem('Ad-Reg_discussions');
  if (stored) {
    try { return JSON.parse(stored); } catch(e) {}
  }
  // Default: Empty baseline
  return [];
}

function saveDiscussionThreads(list) {
  localStorage.setItem('Ad-Reg_discussions', JSON.stringify(list));
}

function switchNoticeTab(tab) {
  const noticesTab = document.getElementById('noticesTabContent');
  const discussionTab = document.getElementById('discussionTabContent');
  const btnNotices = document.getElementById('tabNoticesBtn');
  const btnDiscussion = document.getElementById('tabDiscussionBtn');

  if (tab === 'notices') {
    if (noticesTab) noticesTab.style.display = 'block';
    if (discussionTab) discussionTab.style.display = 'none';
    if (btnNotices) btnNotices.classList.add('active');
    if (btnDiscussion) btnDiscussion.classList.remove('active');
  } else {
    if (noticesTab) noticesTab.style.display = 'none';
    if (discussionTab) discussionTab.style.display = 'block';
    if (btnNotices) btnNotices.classList.remove('active');
    if (btnDiscussion) btnDiscussion.classList.add('active');
    renderDiscussionThreads();
  }
}

function renderAnnouncementsFeed() {
  const container = document.getElementById('noticeFeedContainer');
  if (!container) return;

  const searchInput = document.getElementById('noticeSearchInput');
  const catFilter = document.getElementById('noticeCategoryFilter');
  const prioFilter = document.getElementById('noticePriorityFilter');

  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selCat = catFilter ? catFilter.value : 'all';
  const selPrio = prioFilter ? prioFilter.value : 'all';

  const list = getAnnouncementsList();

  const countBadge = document.getElementById('noticesCountBadge');
  if (countBadge) countBadge.textContent = list.length;

  const filtered = list.filter(n => {
    const matchesQuery = !query ||
      n.title.toLowerCase().includes(query) ||
      n.content.toLowerCase().includes(query) ||
      n.author.toLowerCase().includes(query);

    const matchesCat = selCat === 'all' || n.category === selCat;
    const matchesPrio = selPrio === 'all' || n.priority === selPrio;

    return matchesQuery && matchesCat && matchesPrio;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 48px 20px; color: var(--ink-500); background: rgba(255,255,255,0.7); border-radius: var(--radius-md); border: 1px dashed var(--border);">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--ink-400)" stroke-width="1.8" style="margin-bottom: 8px;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <p style="font-weight: 700; font-size: 14px; color: var(--ink-700); margin-bottom: 4px;">No official notices or circulars posted yet.</p>
        <p style="font-size: 12px; color: var(--ink-500); max-width: 380px; margin: 0 auto; line-height: 1.4;">Official university circulars and examination notifications published by faculty administration will be displayed here.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(n => {
    let prioClass = 'general';
    let prioLabel = 'General Notice';
    if (n.priority === 'urgent') {
      prioClass = 'urgent';
      prioLabel = 'Urgent Notice';
    } else if (n.priority === 'important') {
      prioClass = 'important';
      prioLabel = 'Important Notice';
    }

    return `
      <div class="notice-card ${prioClass}">
        <div class="notice-header">
          <div class="notice-title-row">
            <h3 class="notice-title">${n.title}</h3>
            <span class="notice-badge priority-${n.priority}">${prioLabel}</span>
          </div>
          <span class="crumb-badge" style="font-size: 11px;">${n.categoryLabel || n.category}</span>
        </div>
        <div class="notice-meta">
          <span><strong>Issued by:</strong> ${n.author}</span>
          <span>•</span>
          <span>Date: ${n.date}</span>
        </div>
        <div class="notice-body">
          ${n.content}
        </div>
      </div>
    `;
  }).join('');
}

function renderDiscussionThreads() {
  const container = document.getElementById('discussionFeedContainer');
  if (!container) return;

  const threads = getDiscussionThreads();

  const discBadge = document.getElementById('discussionCountBadge');
  if (discBadge) discBadge.textContent = threads.length;

  if (threads.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 48px 20px; color: var(--ink-500); background: rgba(255,255,255,0.7); border-radius: var(--radius-md); border: 1px dashed var(--border);">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--ink-400)" stroke-width="1.8" style="margin-bottom: 8px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <p style="font-weight: 700; font-size: 14px; color: var(--ink-700); margin-bottom: 4px;">No discussion threads started yet.</p>
        <p style="font-size: 12px; color: var(--ink-500); max-width: 380px; margin: 0 auto; line-height: 1.4;">Click "+ Start Discussion" to create an academic query or start a topic for faculty and students.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = threads.map(t => {
    const repliesHtml = t.replies.map(r => `
      <div class="reply-item">
        <div class="reply-author">
          <span>${r.author}</span>
          ${r.isFaculty ? '<span class="discussion-faculty-badge">Verified Faculty Response</span>' : ''}
          <span style="font-size: 11px; font-weight: 400; color: var(--ink-500); margin-left: auto;">${r.date}</span>
        </div>
        <div class="reply-text">${r.text}</div>
      </div>
    `).join('');

    const authorInitials = (t.author || 'ST').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return `
      <div class="discussion-card">
        <div class="discussion-header">
          <div class="discussion-author">
            <div class="avatar-circle" style="width: 36px; height: 36px; font-size: 13px;">${authorInitials}</div>
            <div>
              <div class="discussion-author-name">${t.author}</div>
              <div class="discussion-author-role">${t.authorRole} • ${t.date}</div>
            </div>
          </div>
        </div>
        <h3 style="font-size: 16px; font-weight: 700; color: var(--ink-900); margin-bottom: 8px;">${t.topic}</h3>
        <p style="font-size: 13.5px; color: var(--ink-700); line-height: 1.5; margin-bottom: 14px;">${t.content}</p>

        <!-- Replies Section -->
        <div class="discussion-replies-list">
          ${repliesHtml}
        </div>

        <!-- Add Reply Form -->
        <div style="margin-top: 14px; display: flex; gap: 8px;">
          <input type="text" id="replyInput_${t.id}" placeholder="Write a response or query clarification..." class="select-pill" style="flex: 1; border-radius: var(--radius-sm); padding: 8px 12px; font-size: 13px;">
          <button class="btn-primary-action" style="padding: 6px 14px; font-size: 12.5px;" onclick="addDiscussionReply('${t.id}')">Reply</button>
        </div>
      </div>
    `;
  }).join('');
}

function openPostNoticeModal() {
  const m = document.getElementById('postNoticeModalOverlay');
  if (m) m.classList.add('active');
}

function closePostNoticeModal() {
  const m = document.getElementById('postNoticeModalOverlay');
  if (m) m.classList.remove('active');
}

function handlePostNoticeSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('noticeTitleInput').value.trim();
  const cat = document.getElementById('noticeCategorySelect').value;
  const prio = document.getElementById('noticePrioritySelect').value;
  const content = document.getElementById('noticeContentInput').value.trim();

  if (!title || !content) return;

  const catLabels = {
    circular: "Official Circular",
    exam: "Exam and Evaluation",
    academic: "Academic Schedule",
    event: "Campus Event"
  };

  const list = getAnnouncementsList();
  const now = new Date();
  const dateStr = `${now.getDate()} ${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

  const newNotice = {
    id: 'N-' + Math.floor(100 + Math.random() * 900),
    title,
    category: cat,
    categoryLabel: catLabels[cat] || "Notice",
    priority: prio,
    author: "Faculty Administration",
    date: dateStr,
    content,
    pinned: prio === 'urgent'
  };

  list.unshift(newNotice);
  saveAnnouncementsList(list);

  alert(`Announcement Published Successfully\n\n"${title}" has been broadcast to the college portal.`);
  closePostNoticeModal();
  document.getElementById('postNoticeForm').reset();
  renderAnnouncementsFeed();
}

function openStartDiscussionModal() {
  const m = document.getElementById('startDiscussionModalOverlay');
  if (m) m.classList.add('active');
}

function closeStartDiscussionModal() {
  const m = document.getElementById('startDiscussionModalOverlay');
  if (m) m.classList.remove('active');
}

function handleStartDiscussionSubmit(e) {
  e.preventDefault();
  const topic = document.getElementById('discTopicInput').value.trim();
  const content = document.getElementById('discContentInput').value.trim();

  if (!topic || !content) return;

  const threads = getDiscussionThreads();
  const now = new Date();
  const dateStr = `${now.getDate()} ${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

  const newThread = {
    id: 'D-' + Math.floor(200 + Math.random() * 800),
    topic,
    author: "Student Member",
    authorRole: "Verified Student",
    date: dateStr,
    content,
    replies: []
  };

  threads.unshift(newThread);
  saveDiscussionThreads(threads);

  alert(`Discussion Topic Created\n\nYour topic "${topic}" is now open for faculty and student responses.`);
  closeStartDiscussionModal();
  document.getElementById('startDiscussionForm').reset();
  renderDiscussionThreads();
}

function addDiscussionReply(threadId) {
  const input = document.getElementById(`replyInput_${threadId}`);
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  const threads = getDiscussionThreads();
  const thread = threads.find(t => t.id === threadId);
  if (thread) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = `${now.getDate()} ${MONTH_NAMES[now.getMonth()]}, ${timeStr}`;

    thread.replies.push({
      id: 'R-' + Math.floor(100 + Math.random() * 900),
      author: "Verified Academic Member",
      authorRole: "Faculty / Student",
      isFaculty: true,
      date: dateStr,
      text
    });

    saveDiscussionThreads(threads);
    renderDiscussionThreads();
  }
}

const noticeSearchInput = document.getElementById('noticeSearchInput');
if (noticeSearchInput) {
  noticeSearchInput.addEventListener('input', renderAnnouncementsFeed);
}

// Initial Notice & Discussion Render
renderAnnouncementsFeed();
renderDiscussionThreads();
