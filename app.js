

// Simple in-memory data model
const state = {
  resources: [],
  projects: [],
  tasks: [],
  assignments: [],
  shares: [],
  activity: [],
  customers: [],
  estimates: [],
  salesOrders: [],
  deliveryChallans: [],
  invoices: [],
  payments: [],
  recurringInvoices: [],
  creditNotes: [],
  // Accounts module
  vendors: [],
  expenses: [],
  bills: [],
  purchaseOrders: [],
  accountsDocuments: [],
};

let idCounter = 1;
const nextId = () => String(idCounter++);

// LocalStorage persistence
const STORAGE_KEY = 'crmm_app_data';

function saveToLocalStorage() {
  try {
    const dataToSave = {
      state: state,
      idCounter: idCounter,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    console.log('Data saved to localStorage');
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

function loadFromLocalStorage() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);

      // Restore state
      if (parsed.state) {
        state.resources = parsed.state.resources || [];
        state.projects = parsed.state.projects || [];
        state.tasks = parsed.state.tasks || [];
        state.assignments = parsed.state.assignments || [];
        state.shares = parsed.state.shares || [];
        state.activity = parsed.state.activity || [];
        state.customers = parsed.state.customers || [];
        state.estimates = parsed.state.estimates || [];
        state.salesOrders = parsed.state.salesOrders || [];
        state.deliveryChallans = parsed.state.deliveryChallans || [];
        state.invoices = parsed.state.invoices || [];
        state.payments = parsed.state.payments || [];
        state.recurringInvoices = parsed.state.recurringInvoices || [];
        state.creditNotes = parsed.state.creditNotes || [];
        // Accounts module
        state.vendors = parsed.state.vendors || [];
        state.expenses = parsed.state.expenses || [];
        state.bills = parsed.state.bills || [];
        state.purchaseOrders = parsed.state.purchaseOrders || [];
        state.accountsDocuments = parsed.state.accountsDocuments || [];
      }

      // Restore idCounter
      if (parsed.idCounter) {
        idCounter = parsed.idCounter;
      }

      console.log('Data loaded from localStorage');
      return true;
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  return false;
}

// Chart instances
let statusChart;
let departmentChart;


// Utils
function addActivity(message, meta) {
  const entry = {
    id: nextId(),
    message,
    meta,
    timestamp: new Date(),
  };
  state.activity.unshift(entry);
  renderActivity();
  saveToLocalStorage();
}

// Video Template Task Definitions
function getVideoTemplateTasks() {
  return [
    // Pre-Production Phase
    { phase: "Pre-Production", title: "Client Inputs", order: 1, estimate: 4, description: "Gather and document all client requirements, expectations, and deliverables." },
    { phase: "Pre-Production", title: "Project Analysis", order: 2, estimate: 6, description: "Analyze project scope, resources needed, and potential challenges." },
    { phase: "Pre-Production", title: "Project Planning", order: 3, estimate: 8, description: "Create detailed project plan with milestones and resource allocation." },
    { phase: "Pre-Production", title: "Project Schedule", order: 4, estimate: 4, description: "Develop comprehensive timeline with deadlines for all phases." },
    { phase: "Pre-Production", title: "Script", order: 5, estimate: 12, description: "Write and finalize video script with dialogue, narration, and scene descriptions." },
    { phase: "Pre-Production", title: "Storyboard", order: 6, estimate: 16, description: "Create visual storyboard showing key scenes, shots, and transitions." },

    // Production Phase
    { phase: "Production", title: "Voiceover", order: 7, estimate: 8, description: "Record professional voiceover narration for the video." },
    { phase: "Production", title: "Editing", order: 8, estimate: 24, description: "Edit video footage, add transitions, effects, and synchronize audio." },
    { phase: "Production", title: "Text Synchronization", order: 9, estimate: 6, description: "Sync on-screen text, captions, and graphics with video timeline." },
    { phase: "Production", title: "Output", order: 10, estimate: 4, description: "Generate initial video output for review." },

    // Post-Production Phase
    { phase: "Post-Production", title: "Final Video", order: 11, estimate: 8, description: "Create final video version with all refinements." },
    { phase: "Post-Production", title: "Output", order: 12, estimate: 4, description: "Export final video in required format." },
    { phase: "Post-Production", title: "Compressed", order: 13, estimate: 2, description: "Create compressed version for web/streaming delivery." },
    { phase: "Post-Production", title: "Final Output", order: 14, estimate: 2, description: "Prepare final deliverables package." },
    { phase: "Post-Production", title: "Feedback", order: 15, estimate: 4, description: "Collect internal team feedback and review." },
    { phase: "Post-Production", title: "Client Feedback", order: 16, estimate: 6, description: "Present to client and gather feedback for final adjustments." },
    { phase: "Post-Production", title: "Final Video", order: 17, estimate: 4, description: "Deliver approved final video to client." },
  ];
}

// Create tasks from template
function createTasksFromTemplate(projectId, templateName, startDate, endDate) {
  console.log("=== createTasksFromTemplate CALLED ===");
  console.log("Parameters:", { projectId, templateName, startDate, endDate });

  if (templateName !== "video") {
    console.log("Template name doesn't match 'video':", templateName);
    return 0;
  }

  if (!startDate || !endDate) {
    console.error("Missing dates for template creation:", { startDate, endDate });
    return 0;
  }

  const templateTasks = getVideoTemplateTasks();
  console.log("Template tasks loaded:", templateTasks.length);

  // Parse dates - handle both YYYY-MM-DD format and Date objects
  const start = startDate instanceof Date ? startDate : new Date(startDate + "T00:00:00");
  const end = endDate instanceof Date ? endDate : new Date(endDate + "T23:59:59");

  // Validate dates
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    console.error("Invalid dates:", startDate, endDate);
    return 0;
  }

  const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

  // Phase distribution: Pre-Production (35%), Production (40%), Post-Production (25%)
  const phaseDistribution = {
    "Pre-Production": { startPercent: 0, endPercent: 0.35, taskCount: 6 },
    "Production": { startPercent: 0.35, endPercent: 0.75, taskCount: 4 },
    "Post-Production": { startPercent: 0.75, endPercent: 1.0, taskCount: 7 }
  };

  templateTasks.forEach((templateTask) => {
    const phaseInfo = phaseDistribution[templateTask.phase];
    const phaseStartDays = Math.floor(totalDays * phaseInfo.startPercent);
    const phaseEndDays = Math.floor(totalDays * phaseInfo.endPercent);
    const phaseDuration = phaseEndDays - phaseStartDays;

    // Calculate task position within phase (0 to 1)
    // Find first task in this phase
    const phaseFirstOrder = templateTasks.find(t => t.phase === templateTask.phase)?.order || 1;
    const phaseOrder = templateTask.order - phaseFirstOrder;
    const taskPositionInPhase = phaseInfo.taskCount > 1 ? phaseOrder / (phaseInfo.taskCount - 1) : 0;

    // Calculate task dates
    const daysFromStart = phaseStartDays + Math.floor(phaseDuration * taskPositionInPhase);
    const taskStartDate = new Date(start);
    taskStartDate.setDate(start.getDate() + daysFromStart);

    // Task duration based on estimate (1 hour estimate = 0.5 days, minimum 1 day)
    const taskDuration = Math.max(1, Math.ceil((templateTask.estimate || 8) / 16));
    const taskDueDate = new Date(taskStartDate);
    taskDueDate.setDate(taskStartDate.getDate() + taskDuration);

    // Ensure dates don't exceed project boundaries
    if (taskStartDate < start) taskStartDate.setTime(start.getTime());
    if (taskDueDate > end) taskDueDate.setTime(end.getTime());
    if (taskStartDate >= taskDueDate) {
      taskDueDate.setTime(taskStartDate.getTime() + (24 * 60 * 60 * 1000)); // Add 1 day minimum
    }

    const task = {
      id: nextId(),
      projectId: projectId,
      title: templateTask.title,
      description: templateTask.description || "",
      estimate: templateTask.estimate || "",
      priority: "none",
      taskOwnerId: "",
      startDate: taskStartDate.toISOString().slice(0, 10),
      dueDate: taskDueDate.toISOString().slice(0, 10),
      time: "",
      notifyUsers: [],
      phase: templateTask.phase,
      order: templateTask.order,
    };

    state.tasks.push(task);
    console.log(`Task ${templateTask.order} created: ${templateTask.title} (ID: ${task.id})`);
  });

  console.log("=== ALL TASKS CREATED ===");
  console.log("Total tasks created:", templateTasks.length);
  console.log("Total tasks in state:", state.tasks.length);

  // Refresh all views
  renderTasks();
  renderDepartmentStats();
  renderAdminDashboard();
  addActivity(`Created ${templateTasks.length} tasks from Video template`, "Template");

  return templateTasks.length;
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}

function calculateOnTimePercentage(items) {
  if (!items.length) return 0;
  const completed = items.filter((a) => a.status === "completed");
  if (!completed.length) return 0;
  const now = new Date();
  const onTime = completed.filter((a) => {
    if (!a.dueDate) return true;
    const due = new Date(a.dueDate);
    return a.completedAt && new Date(a.completedAt) <= due && new Date(a.completedAt) <= now;
  });
  return Math.round((onTime.length / completed.length) * 100);
}

// Navigation
function setupMainNavigation() {
  const navButtons = document.querySelectorAll(".nav-item");
  const views = document.querySelectorAll(".view");

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.view;

      navButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      views.forEach((v) => v.classList.remove("view-active"));
      const viewEl = document.getElementById(`view-${target}`);
      if (viewEl) viewEl.classList.add("view-active");
    });
  });
}

function setupOperationsSubnav() {
  const subnavButtons = document.querySelectorAll(".subnav-item");
  const subviews = document.querySelectorAll(".subview");

  subnavButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.subview;

      subnavButtons.forEach((b) => b.classList.remove("subnav-active"));
      btn.classList.add("subnav-active");

      subviews.forEach((v) => v.classList.remove("subview-active"));
      const viewEl = document.getElementById(target);
      if (viewEl) viewEl.classList.add("subview-active");
    });
  });
}

// Sales sub navigation
function setupSalesSubnav() {
  const salesSubnav = document.querySelector(".sales-subnav");
  if (!salesSubnav) return;

  const buttons = salesSubnav.querySelectorAll(".subnav-item");
  const views = document.querySelectorAll(".sales-subview");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.salesSubview;

      buttons.forEach((b) => b.classList.remove("subnav-active"));
      btn.classList.add("subnav-active");

      views.forEach((v) => v.classList.remove("sales-subview-active"));
      const viewEl = document.getElementById(target);
      if (viewEl) viewEl.classList.add("sales-subview-active");
    });
  });
}

// Rendering
function renderResources() {
  const tbody = document.querySelector("#table-resources tbody");
  const selectAssignResource = document.getElementById(
    "select-assign-resource"
  );
  const selectIndividualResource = document.getElementById(
    "select-individual-resource"
  );

  tbody.innerHTML = "";
  selectAssignResource.innerHTML =
    '<option value="">Select individual</option>';
  selectIndividualResource.innerHTML =
    '<option value="">Select individual</option>';

  state.resources.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.name}</td>
      <td>${r.role}</td>
      <td>${r.department}</td>
      <td>${r.email}</td>
      <td>
        <button class="table-button" data-view-resource="${r.id}">View</button>
        <button class="table-button table-button--danger" data-delete-resource="${r.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);

    const opt1 = document.createElement("option");
    opt1.value = r.id;
    opt1.textContent = `${r.name} (${r.role})`;
    selectAssignResource.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = r.id;
    opt2.textContent = `${r.name} (${r.department})`;
    selectIndividualResource.appendChild(opt2);
  });

  document.getElementById("kpi-resources").textContent =
    state.resources.length;
}

function renderProjects() {
  const tbody = document.querySelector("#table-projects tbody");
  const selectTaskProject = document.getElementById("select-task-project");
  const selectAssignProject = document.getElementById("select-assign-project");
  const selectProjectOwner = document.getElementById("select-project-owner");

  tbody.innerHTML = "";
  selectTaskProject.innerHTML = '<option value="">Select project</option>';
  selectAssignProject.innerHTML = '<option value="">Select project</option>';

  // Populate owner dropdown
  if (selectProjectOwner) {
    selectProjectOwner.innerHTML = '<option value="">Select owner</option>';
    state.resources.forEach((r) => {
      const opt = document.createElement("option");
      opt.value = r.id;
      opt.textContent = `${r.name} (${r.role})`;
      selectProjectOwner.appendChild(opt);
    });
  }

  state.projects.forEach((p) => {
    const tr = document.createElement("tr");
    const duration = `${formatDate(p.startDate)} → ${formatDate(p.endDate)}`;
    const priorityBadge = p.priority && p.priority !== "none"
      ? `<span class="status-pill status-pill--${p.priority}">${p.priority.toUpperCase()}</span>`
      : "-";
    tr.innerHTML = `
      <td>${p.name}</td>
      <td>${p.type || "-"}</td>
      <td>${p.department}</td>
      <td>${priorityBadge}</td>
      <td>${duration}</td>
      <td>
        <button class="table-action-btn table-action-btn--view" data-view-project="${p.id}" title="View">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3C4.5 3 1.73 5.11 0 8c1.73 2.89 4.5 5 8 5s6.27-2.11 8-5c-1.73-2.89-4.5-5-8-5zM8 11.5c-1.93 0-3.5-1.57-3.5-3.5S6.07 4.5 8 4.5s3.5 1.57 3.5 3.5S9.93 11.5 8 11.5zM8 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
          </svg>
        </button>
        <button class="table-action-btn table-action-btn--delete" data-delete-project="${p.id}" title="Delete">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4v9.33c0 .74-.6 1.34-1.33 1.34H5.33C4.6 14.67 4 14.07 4 13.33V4m1.33 0h5.34M6 4V2.67C6 1.93 6.6 1.33 7.33 1.33h1.34c.73 0 1.33.6 1.33 1.34V4M2 4h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);

    const opt1 = document.createElement("option");
    opt1.value = p.id;
    opt1.textContent = p.name;
    selectTaskProject.appendChild(opt1);

    const opt2 = opt1.cloneNode(true);
    selectAssignProject.appendChild(opt2);
  });

  document.getElementById("kpi-total-projects").textContent =
    state.projects.length;
  document.getElementById("admin-total-projects").textContent =
    state.projects.length;
}

function renderTasks() {
  const tbody = document.querySelector("#table-tasks tbody");
  const selectAssignTask = document.getElementById("select-assign-task");
  const selectTaskOwner = document.getElementById("select-task-owner");

  tbody.innerHTML = "";
  selectAssignTask.innerHTML = '<option value="">Select task</option>';

  // Populate task owner dropdown
  if (selectTaskOwner) {
    selectTaskOwner.innerHTML = '<option value="">Select owner</option>';
    state.resources.forEach((r) => {
      const opt = document.createElement("option");
      opt.value = r.id;
      opt.textContent = `${r.name} (${r.role})`;
      selectTaskOwner.appendChild(opt);
    });
  }

  state.tasks.forEach((t) => {
    const project = state.projects.find((p) => p.id === t.projectId);
    const priorityBadge = t.priority && t.priority !== "none"
      ? `<span class="status-pill status-pill--${t.priority}">${t.priority.toUpperCase()}</span>`
      : "";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${project ? project.name : "-"}</td>
      <td>${t.title}</td>
      <td>${priorityBadge || "-"}</td>
      <td><span class="status-pill status-pill--pending">Pending</span></td>
      <td>${t.estimate || "-"}</td>
      <td>
        <button class="table-button" data-view-task="${t.id}">View</button>
        <button class="table-button table-button--danger" data-delete-task="${t.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);

    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = `${project ? project.name + " - " : ""}${t.title}`;
    selectAssignTask.appendChild(opt);
  });
}

function renderAssignments() {
  const tbody = document.querySelector("#table-assignments tbody");
  const selectShareAssignment = document.getElementById(
    "select-share-assignment"
  );

  tbody.innerHTML = "";
  selectShareAssignment.innerHTML =
    '<option value="">Select assignment</option>';

  state.assignments.forEach((a) => {
    const project = state.projects.find((p) => p.id === a.projectId);
    const task = state.tasks.find((t) => t.id === a.taskId);
    const resource = state.resources.find((r) => r.id === a.resourceId);
    const statusClass =
      a.status === "completed"
        ? "status-pill--completed"
        : "status-pill--inprogress";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${project ? project.name : "-"}</td>
      <td>${task ? task.title : "-"}</td>
      <td>${resource ? resource.name : "-"}</td>
      <td>${formatDate(a.dueDate)}</td>
      <td><span class="status-pill ${statusClass}">${a.status === "completed" ? "Completed" : "In Progress"
      }</span></td>
      <td>
        <button class="table-button" data-view-assignment="${a.id}">View</button>
        <button class="table-button table-button--danger" data-delete-assignment="${a.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);

    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = `${resource ? resource.name : "Unknown"} - ${task ? task.title : "Task"
      }`;
    selectShareAssignment.appendChild(opt);
  });
}

function renderShares() {
  const list = document.getElementById("share-log");
  list.innerHTML = "";
  state.shares
    .slice()
    .reverse()
    .forEach((s) => {
      const resource = state.resources.find((r) => r.id === s.resourceId);
      const task = state.tasks.find((t) => t.id === s.taskId);
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="activity-main">
          Shared <strong>${task ? task.title : "task"}</strong> with
          <strong>${resource ? resource.name : "resource"}</strong>
        </div>
        <div class="activity-meta">
          ${formatDate(s.sharedAt)} · ${resource ? resource.email : "no-email"
        }
        </div>
      `;
      list.appendChild(li);
    });
}

function renderActivity() {
  const list = document.getElementById("activity-log");
  list.innerHTML = "";
  state.activity.slice(0, 8).forEach((a) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="activity-main">${a.message}</div>
      <div class="activity-meta">${a.meta}</div>
    `;
    list.appendChild(li);
  });
}

function renderDepartmentStats() {
  const tbody = document.querySelector("#table-departments tbody");
  tbody.innerHTML = "";
  const departments = [
    "Marketing",
    "Sales",
    "Accounts",
    "Operations",
    "Human Resources",
    "Client Service",
  ];

  departments.forEach((dep) => {
    const depProjects = state.projects.filter((p) => p.department === dep);
    const depTasks = state.tasks.filter((t) =>
      depProjects.some((p) => p.id === t.projectId)
    );
    const depAssignments = state.assignments.filter((a) =>
      depTasks.some((t) => t.id === a.taskId)
    );
    const openTasks = depAssignments.filter((a) => a.status !== "completed")
      .length;
    const completedTasks = depAssignments.filter(
      (a) => a.status === "completed"
    ).length;
    const onTime = calculateOnTimePercentage(depAssignments);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${dep}</td>
      <td>${openTasks}</td>
      <td>${completedTasks}</td>
      <td>${onTime}%</td>
    `;
    tbody.appendChild(tr);
  });

  renderCharts();
  renderDepartmentViews();
}

function getDepartmentProjectSummary(department) {
  const result = [];
  const depProjects = state.projects.filter((p) => p.department === department);
  depProjects.forEach((p) => {
    const projectTasks = state.tasks.filter((t) => t.projectId === p.id);
    const projectAssignments = state.assignments.filter(
      (a) => a.projectId === p.id
    );
    const open = projectAssignments.filter((a) => a.status !== "completed")
      .length;
    const completed = projectAssignments.filter(
      (a) => a.status === "completed"
    ).length;
    result.push({
      name: p.name,
      type: p.type,
      totalTasks: projectTasks.length,
      open,
      completed,
    });
  });
  return result;
}

function renderDepartmentViews() {
  const marketingBody = document.getElementById("marketing-body");
  const salesBody = document.getElementById("sales-body");
  const accountsBody = document.getElementById("accounts-body");
  const hrBody = document.getElementById("hr-body");
  const serviceBody = document.getElementById("service-body");

  if (marketingBody) {
    marketingBody.innerHTML = "";
    getDepartmentProjectSummary("Marketing").forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.name}</td>
        <td>${row.type}</td>
        <td>${row.totalTasks}</td>
        <td>${row.open}</td>
        <td>${row.completed}</td>
      `;
      marketingBody.appendChild(tr);
    });
  }

  if (salesBody) {
    salesBody.innerHTML = "";
    getDepartmentProjectSummary("Sales").forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.name}</td>
        <td>${row.type}</td>
        <td>${row.totalTasks}</td>
        <td>${row.open}</td>
        <td>${row.completed}</td>
      `;
      salesBody.appendChild(tr);
    });
  }

  if (accountsBody) {
    accountsBody.innerHTML = "";
    getDepartmentProjectSummary("Accounts").forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.name}</td>
        <td>${row.type}</td>
        <td>${row.totalTasks}</td>
        <td>${row.open}</td>
        <td>${row.completed}</td>
      `;
      accountsBody.appendChild(tr);
    });
  }

  if (hrBody) {
    hrBody.innerHTML = "";
    const totalEmployees = state.resources.length;
    const hrEmployees = state.resources.filter(
      (r) => r.department === "Human Resources"
    ).length;
    const totalAssignments = state.assignments.length;
    const completedAssignments = state.assignments.filter(
      (a) => a.status === "completed"
    ).length;

    const rows = [
      ["Total Employees", totalEmployees],
      ["HR Department Employees", hrEmployees],
      ["Assignments (All Departments)", totalAssignments],
      ["Completed Assignments", completedAssignments],
    ];

    rows.forEach(([metric, value]) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${metric}</td>
        <td>${value}</td>
      `;
      hrBody.appendChild(tr);
    });
  }

  if (serviceBody) {
    serviceBody.innerHTML = "";
    getDepartmentProjectSummary("Client Service").forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.name}</td>
        <td>${row.totalTasks}</td>
        <td>${row.open}</td>
        <td>${row.completed}</td>
      `;
      serviceBody.appendChild(tr);
    });
  }
}

function renderAdminDashboard() {
  const totalTasks = state.assignments.length;
  const completed = state.assignments.filter(
    (a) => a.status === "completed"
  ).length;
  const onTime = calculateOnTimePercentage(state.assignments);

  document.getElementById("admin-total-tasks").textContent = totalTasks;
  document.getElementById("admin-completed-tasks").textContent = completed;
  document.getElementById("admin-on-time").textContent = `${onTime}%`;

  const tableBody = document.querySelector("#table-admin-projects tbody");
  const timelineList = document.getElementById("admin-timeline");
  tableBody.innerHTML = "";
  timelineList.innerHTML = "";

  state.projects.forEach((p) => {
    const projectAssignments = state.assignments.filter(
      (a) => a.projectId === p.id
    );
    const completedCount = projectAssignments.filter(
      (a) => a.status === "completed"
    ).length;
    const onTimeProject = calculateOnTimePercentage(projectAssignments);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.name}</td>
      <td>${p.department}</td>
      <td>${projectAssignments.length}</td>
      <td>${completedCount}</td>
      <td>${onTimeProject}%</td>
    `;
    tableBody.appendChild(tr);
  });

  const buckets = {};
  state.assignments.forEach((a) => {
    const due = a.dueDate ? new Date(a.dueDate) : new Date();
    const label = `${due.getFullYear()}-W${getWeekNumber(due)}`;
    if (!buckets[label]) buckets[label] = 0;
    buckets[label] += 1;
  });

  Object.entries(buckets)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .forEach(([label, count]) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="activity-main">${label}</div>
        <div class="activity-meta">${count} task(s) due</div>
      `;
      timelineList.appendChild(li);
    });
}

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
}

function renderGlobalKPIs() {
  const activeTasks = state.assignments.filter(
    (a) => a.status !== "completed"
  ).length;
  const onTime = calculateOnTimePercentage(state.assignments);
  document.getElementById("kpi-active-tasks").textContent = activeTasks;
  document.getElementById("kpi-on-time").textContent = `${onTime}%`;
}

// Sales – Customers & Estimates
function renderSalesCustomers() {
  const table = document.querySelector("#table-sales-customers tbody");
  const selectEstimateCustomer = document.getElementById(
    "select-estimate-customer"
  );
  const selectOrderCustomer = document.getElementById("select-order-customer");
  const selectChallanCustomer = document.getElementById("select-challan-customer");
  const selectInvoiceCustomer = document.getElementById("select-invoice-customer");
  const selectPaymentCustomer = document.getElementById("select-payment-customer");
  const selectRecurringCustomer = document.getElementById("select-recurring-customer");
  const selectCreditNoteCustomer = document.getElementById("select-credit-note-customer");

  if (!table) return;

  table.innerHTML = "";

  // Reset all dropdowns
  if (selectEstimateCustomer) {
    selectEstimateCustomer.innerHTML =
      '<option value="">Select customer</option>';
  }
  if (selectOrderCustomer) {
    selectOrderCustomer.innerHTML = '<option value="">Select customer</option>';
  }
  if (selectChallanCustomer) {
    selectChallanCustomer.innerHTML = '<option value="">Select customer</option>';
  }
  if (selectInvoiceCustomer) {
    selectInvoiceCustomer.innerHTML = '<option value="">Select customer</option>';
  }
  if (selectPaymentCustomer) {
    selectPaymentCustomer.innerHTML = '<option value="">Select customer</option>';
  }
  if (selectRecurringCustomer) {
    selectRecurringCustomer.innerHTML = '<option value="">Select customer</option>';
  }
  if (selectCreditNoteCustomer) {
    selectCreditNoteCustomer.innerHTML = '<option value="">Select customer</option>';
  }

  state.customers.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.name}</td>
      <td>${c.company || "-"}</td>
      <td>${c.email || "-"}</td>
      <td>${c.phone || "-"}</td>
      <td>₹${(c.receivables || 0).toFixed(2)}</td>
      <td>₹${(c.credits || 0).toFixed(2)}</td>
    `;
    table.appendChild(tr);

    // Populate all customer dropdowns
    if (selectEstimateCustomer) {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      selectEstimateCustomer.appendChild(opt);
    }
    if (selectOrderCustomer) {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      selectOrderCustomer.appendChild(opt);
    }
    if (selectChallanCustomer) {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      selectChallanCustomer.appendChild(opt);
    }
    if (selectInvoiceCustomer) {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      selectInvoiceCustomer.appendChild(opt);
    }
    if (selectPaymentCustomer) {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      selectPaymentCustomer.appendChild(opt);
    }
    if (selectRecurringCustomer) {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      selectRecurringCustomer.appendChild(opt);
    }
    if (selectCreditNoteCustomer) {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      selectCreditNoteCustomer.appendChild(opt);
    }
  });
}

function renderSalesEstimates() {
  const table = document.querySelector("#table-sales-estimates tbody");
  if (!table) return;

  table.innerHTML = "";
  state.estimates.forEach((e) => {
    const customer = state.customers.find((c) => c.id === e.customerId);
    const statusLabel = e.status || "Draft";
    const amount = e.amount || 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatDate(e.estimateDate)}</td>
      <td>${e.estimateNumber || "-"}</td>
      <td>${customer ? customer.name : "-"}</td>
      <td>${statusLabel}</td>
      <td>₹${amount.toFixed(2)}</td>
    `;
    table.appendChild(tr);
  });
}

// Sales - Sales Orders
function renderSalesOrders() {
  const table = document.querySelector("#table-sales-orders tbody");
  if (!table) return;

  table.innerHTML = "";
  state.salesOrders.forEach((order) => {
    const customer = state.customers.find((c) => c.id === order.customerId);
    const statusLabel = order.status || "Draft";
    const amount = order.amount || 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatDate(order.orderDate)}</td>
      <td>${order.orderNumber || "-"}</td>
      <td>${customer ? customer.name : "-"}</td>
      <td><span class="status-pill status-pill--pending">${statusLabel}</span></td>
      <td>₹${amount.toFixed(2)}</td>
    `;
    table.appendChild(tr);
  });
}

// Sales - Delivery Challans
function renderDeliveryChallans() {
  const table = document.querySelector("#table-delivery-challans tbody");
  if (!table) return;

  table.innerHTML = "";
  state.deliveryChallans.forEach((challan) => {
    const customer = state.customers.find((c) => c.id === challan.customerId);
    const statusLabel = challan.status || "Pending";
    const items = challan.items || 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatDate(challan.challanDate)}</td>
      <td>${challan.challanNumber || "-"}</td>
      <td>${customer ? customer.name : "-"}</td>
      <td><span class="status-pill status-pill--pending">${statusLabel}</span></td>
      <td>${items}</td>
    `;
    table.appendChild(tr);
  });
}

// Sales - Invoices
function renderInvoices() {
  const table = document.querySelector("#table-invoices tbody");
  const selectPaymentInvoice = document.getElementById("select-payment-invoice");
  if (!table) return;

  table.innerHTML = "";
  if (selectPaymentInvoice) {
    selectPaymentInvoice.innerHTML = '<option value="">Select invoice</option>';
  }

  state.invoices.forEach((invoice) => {
    const customer = state.customers.find((c) => c.id === invoice.customerId);
    const statusLabel = invoice.status || "Draft";
    const amount = invoice.amount || 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatDate(invoice.invoiceDate)}</td>
      <td>${invoice.invoiceNumber || "-"}</td>
      <td>${customer ? customer.name : "-"}</td>
      <td><span class="status-pill status-pill--pending">${statusLabel}</span></td>
      <td>₹${amount.toFixed(2)}</td>
    `;
    table.appendChild(tr);

    if (selectPaymentInvoice) {
      const opt = document.createElement("option");
      opt.value = invoice.id;
      opt.textContent = `${invoice.invoiceNumber || invoice.id} - ${customer ? customer.name : "Unknown"}`;
      selectPaymentInvoice.appendChild(opt);
    }
  });
}

// Sales - Payments Received
function renderPayments() {
  const table = document.querySelector("#table-payments tbody");
  if (!table) return;

  table.innerHTML = "";
  state.payments.forEach((payment) => {
    const customer = state.customers.find((c) => c.id === payment.customerId);
    const invoice = state.invoices.find((i) => i.id === payment.invoiceId);
    const amount = payment.amount || 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatDate(payment.paymentDate)}</td>
      <td>${payment.paymentNumber || "-"}</td>
      <td>${customer ? customer.name : "-"}</td>
      <td>${invoice ? invoice.invoiceNumber : "-"}</td>
      <td>₹${amount.toFixed(2)}</td>
    `;
    table.appendChild(tr);
  });
}

// Sales - Recurring Invoices
function renderRecurringInvoices() {
  const table = document.querySelector("#table-recurring-invoices tbody");
  if (!table) return;

  table.innerHTML = "";
  state.recurringInvoices.forEach((recurring) => {
    const customer = state.customers.find((c) => c.id === recurring.customerId);
    const statusLabel = recurring.status || "Active";
    const amount = recurring.amount || 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${recurring.profileName || "-"}</td>
      <td>${customer ? customer.name : "-"}</td>
      <td>${recurring.frequency || "Monthly"}</td>
      <td><span class="status-pill status-pill--pending">${statusLabel}</span></td>
      <td>₹${amount.toFixed(2)}</td>
    `;
    table.appendChild(tr);
  });
}

// Sales - Credit Notes
function renderCreditNotes() {
  const table = document.querySelector("#table-credit-notes tbody");
  if (!table) return;

  table.innerHTML = "";
  state.creditNotes.forEach((note) => {
    const customer = state.customers.find((c) => c.id === note.customerId);
    const statusLabel = note.status || "Open";
    const amount = note.amount || 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatDate(note.creditNoteDate)}</td>
      <td>${note.creditNoteNumber || "-"}</td>
      <td>${customer ? customer.name : "-"}</td>
      <td><span class="status-pill status-pill--pending">${statusLabel}</span></td>
      <td>₹${amount.toFixed(2)}</td>
    `;
    table.appendChild(tr);
  });
}

// Accounts - Vendors
function renderAccountsVendors() {
  const table = document.querySelector("#table-accounts-vendors tbody");
  const selectExpenseVendor = document.getElementById("select-expense-vendor");
  const selectBillVendor = document.getElementById("select-bill-vendor");
  const selectPOVendor = document.getElementById("select-po-vendor");

  if (!table) return;

  table.innerHTML = "";

  // Reset all dropdowns
  if (selectExpenseVendor) {
    selectExpenseVendor.innerHTML = '<option value="">Select vendor</option>';
  }
  if (selectBillVendor) {
    selectBillVendor.innerHTML = '<option value="">Select vendor</option>';
  }
  if (selectPOVendor) {
    selectPOVendor.innerHTML = '<option value="">Select vendor</option>';
  }

  state.vendors.forEach((v) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${v.name}</td>
      <td>${v.company || "-"}</td>
      <td>${v.email || "-"}</td>
      <td>${v.phone || "-"}</td>
      <td>${v.paymentTerms || "-"}</td>
      <td>₹${(v.totalPayable || 0).toFixed(2)}</td>
    `;
    table.appendChild(tr);

    // Populate all vendor dropdowns
    if (selectExpenseVendor) {
      const opt = document.createElement("option");
      opt.value = v.id;
      opt.textContent = v.name;
      selectExpenseVendor.appendChild(opt);
    }
    if (selectBillVendor) {
      const opt = document.createElement("option");
      opt.value = v.id;
      opt.textContent = v.name;
      selectBillVendor.appendChild(opt);
    }
    if (selectPOVendor) {
      const opt = document.createElement("option");
      opt.value = v.id;
      opt.textContent = v.name;
      selectPOVendor.appendChild(opt);
    }
  });
}

// Accounts - Expenses
function renderAccountsExpenses() {
  const table = document.querySelector("#table-accounts-expenses tbody");
  if (!table) return;

  table.innerHTML = "";
  let totalExpenses = 0;

  state.expenses.forEach((e) => {
    const vendor = state.vendors.find((v) => v.id === e.vendorId);
    const amount = e.amount || 0;
    totalExpenses += amount;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatDate(e.expenseDate)}</td>
      <td>${vendor ? vendor.name : "-"}</td>
      <td>${e.category || "-"}</td>
      <td>${e.paymentMethod || "-"}</td>
      <td>₹${amount.toFixed(2)}</td>
      <td>${e.reference || "-"}</td>
    `;
    table.appendChild(tr);
  });

  // Update total if element exists
  const totalElement = document.getElementById("total-expenses");
  if (totalElement) {
    totalElement.textContent = `₹${totalExpenses.toFixed(2)}`;
  }
}

// Accounts - Bills
function renderAccountsBills() {
  const table = document.querySelector("#table-accounts-bills tbody");
  if (!table) return;

  table.innerHTML = "";
  state.bills.forEach((bill) => {
    const vendor = state.vendors.find((v) => v.id === bill.vendorId);
    const statusLabel = bill.status || "Unpaid";
    const amount = bill.amount || 0;

    // Determine status pill color
    let statusClass = "status-pill--pending";
    if (statusLabel === "Paid") statusClass = "status-pill--completed";
    else if (statusLabel === "Overdue") statusClass = "status-pill--high";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatDate(bill.billDate)}</td>
      <td>${bill.billNumber || "-"}</td>
      <td>${vendor ? vendor.name : "-"}</td>
      <td>${formatDate(bill.dueDate)}</td>
      <td><span class="status-pill ${statusClass}">${statusLabel}</span></td>
      <td>₹${amount.toFixed(2)}</td>
    `;
    table.appendChild(tr);
  });
}

// Accounts - Purchase Orders
function renderAccountsPurchaseOrders() {
  const table = document.querySelector("#table-accounts-purchase-orders tbody");
  if (!table) return;

  table.innerHTML = "";
  state.purchaseOrders.forEach((po) => {
    const vendor = state.vendors.find((v) => v.id === po.vendorId);
    const statusLabel = po.status || "Draft";
    const amount = po.amount || 0;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatDate(po.orderDate)}</td>
      <td>${po.poNumber || "-"}</td>
      <td>${vendor ? vendor.name : "-"}</td>
      <td>${formatDate(po.deliveryDate)}</td>
      <td><span class="status-pill status-pill--pending">${statusLabel}</span></td>
      <td>₹${amount.toFixed(2)}</td>
    `;
    table.appendChild(tr);
  });
}

// Accounts - Activity History
function renderAccountsActivity() {
  const list = document.getElementById("accounts-activity-log");
  if (!list) return;

  list.innerHTML = "";

  // Get all accounts-related activities from main activity log
  const accountsActivities = state.activity.filter(a =>
    a.meta && (
      a.meta.includes("Accounts") ||
      a.meta.includes("Vendor") ||
      a.meta.includes("Expense") ||
      a.meta.includes("Bill") ||
      a.meta.includes("Purchase Order")
    )
  );

  accountsActivities.slice(0, 20).forEach((a) => {
    const li = document.createElement("li");
    const timestamp = a.timestamp ? new Date(a.timestamp).toLocaleString() : "-";
    li.innerHTML = `
      <div class="activity-main">${a.message}</div>
      <div class="activity-meta">${timestamp} · ${a.meta}</div>
    `;
    list.appendChild(li);
  });

  if (accountsActivities.length === 0) {
    list.innerHTML = '<li><div class="activity-main muted">No activity recorded yet.</div></li>';
  }
}

function renderCharts() {
  const statusCanvas = document.getElementById("chart-status");
  const deptCanvas = document.getElementById("chart-departments");
  if (!statusCanvas || !deptCanvas || typeof Chart === "undefined") return;

  const unassignedTasks = state.tasks.filter(
    (t) => !state.assignments.some((a) => a.taskId === t.id)
  ).length;
  const inProgress = state.assignments.filter(
    (a) => a.status !== "completed"
  ).length;
  const completed = state.assignments.filter(
    (a) => a.status === "completed"
  ).length;

  const statusData = [unassignedTasks, inProgress, completed];

  if (!statusChart) {
    statusChart = new Chart(statusCanvas, {
      type: "doughnut",
      data: {
        labels: ["Unassigned", "In Progress", "Completed"],
        datasets: [
          {
            data: statusData,
            backgroundColor: ["#e5e7eb", "#3b82f6", "#4b3c86ff"],
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            labels: { color: "#0f172a" },
          },
        },
      },
    });
  } else {
    statusChart.data.datasets[0].data = statusData;
    statusChart.update();
  }

  const departments = [
    "Marketing",
    "Sales",
    "Accounts",
    "Operations",
    "Human Resources",
    "Client Service",
  ];
  const deptOpenTasks = departments.map((dep) => {
    const depProjects = state.projects.filter((p) => p.department === dep);
    const depTasks = state.tasks.filter((t) =>
      depProjects.some((p) => p.id === t.projectId)
    );
    const depAssignments = state.assignments.filter((a) =>
      depTasks.some((t) => t.id === a.taskId)
    );
    const openTasks = depAssignments.filter((a) => a.status !== "completed")
      .length;
    return openTasks;
  });

  if (!departmentChart) {
    departmentChart = new Chart(deptCanvas, {
      type: "pie",
      data: {
        labels: departments,
        datasets: [
          {
            data: deptOpenTasks,
            backgroundColor: [
              "#6366f1",
              "#5f51b9ff",
              "#101aa5ff",
              "#665f72ff",
              "#253f4eff",
              "#06b6d4",
            ],
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            labels: { color: "#0f172a" },
          },
        },
      },
    });
  } else {
    departmentChart.data.datasets[0].data = deptOpenTasks;
    departmentChart.update();
  }
}

function renderIndividualDashboard(resourceId) {
  const assignments = state.assignments.filter(
    (a) => a.resourceId === resourceId
  );
  const totalAssigned = assignments.length;
  const completed = assignments.filter((a) => a.status === "completed").length;
  const onTime = calculateOnTimePercentage(assignments);

  document.getElementById("individual-total-assigned").textContent =
    totalAssigned;
  document.getElementById("individual-total-completed").textContent =
    completed;
  document.getElementById("individual-on-time").textContent = `${onTime}%`;

  const tbody = document.querySelector("#table-individual-tasks tbody");
  const summaryList = document.getElementById("individual-summary");
  tbody.innerHTML = "";
  summaryList.innerHTML = "";

  assignments.forEach((a) => {
    const project = state.projects.find((p) => p.id === a.projectId);
    const task = state.tasks.find((t) => t.id === a.taskId);
    const tr = document.createElement("tr");
    const isCompleted = a.status === "completed";
    tr.innerHTML = `
      <td>${project ? project.name : "-"}</td>
      <td>${task ? task.title : "-"}</td>
      <td>${formatDate(a.dueDate)}</td>
      <td>
        <span class="status-pill ${isCompleted ? "status-pill--completed" : "status-pill--inprogress"
      }">
          ${isCompleted ? "Completed" : "In Progress"}
        </span>
      </td>
      <td>
        ${isCompleted
        ? "-"
        : `<button class="table-button" data-complete="${a.id}">Mark Complete</button>`
      }
      </td>
    `;
    tbody.appendChild(tr);
  });

  const byProject = {};
  assignments.forEach((a) => {
    const project = state.projects.find((p) => p.id === a.projectId);
    const key = project ? project.name : "Unknown project";
    if (!byProject[key]) byProject[key] = { total: 0, completed: 0 };
    byProject[key].total += 1;
    if (a.status === "completed") byProject[key].completed += 1;
  });

  Object.entries(byProject).forEach(([projectName, stats]) => {
    const li = document.createElement("li");
    const percent = stats.total
      ? Math.round((stats.completed / stats.total) * 100)
      : 0;
    li.innerHTML = `
      <div class="activity-main">${projectName}</div>
      <div class="activity-meta">
        ${stats.completed}/${stats.total} tasks completed (${percent}%)
      </div>
    `;
    summaryList.appendChild(li);
  });
}

// Form handlers
function setupForms() {
  const resourceForm = document.getElementById("form-resource");
  resourceForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(resourceForm);
    const resource = {
      id: nextId(),
      name: data.get("name").trim(),
      role: data.get("role").trim(),
      department: data.get("department"),
      email: data.get("email").trim(),
    };
    state.resources.push(resource);
    saveToLocalStorage();
    renderResources();
    renderDepartmentStats();
    addActivity(`Added resource ${resource.name}`, resource.department);
    resourceForm.reset();
  });

  const projectForm = document.getElementById("form-project");
  projectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(projectForm);
    const project = {
      id: nextId(),
      name: data.get("name").trim(),
      type: data.get("type")?.trim() || "",
      department: data.get("department"),
      startDate: data.get("startDate"),
      endDate: data.get("endDate"),
      ownerId: data.get("ownerId") || "",
      template: data.get("template") || "",
      priority: data.get("priority") || "none",
      businessHours: data.get("businessHours") || "standard",
      taskLayout: data.get("taskLayout") || "standard",
      projectGroup: data.get("projectGroup") || "",
      tags: data.get("tags")?.split(",").map(t => t.trim()).filter(t => t) || [],
      description: data.get("description")?.trim() || "",
      strictProject: data.get("strictProject") === "on",
      rollup: data.get("rollup") === "on",
    };
    state.projects.push(project);
    saveToLocalStorage();
    renderProjects();
    renderDepartmentStats();
    addActivity(`Created project ${project.name}`, project.department);

    // Create tasks from template if template is selected
    console.log("Project created:", project);
    console.log("Template value:", project.template);

    if (project.template === "video") {
      console.log("Video template detected! Creating tasks...");
      const taskCount = createTasksFromTemplate(project.id, project.template, project.startDate, project.endDate);
      console.log("Tasks created:", taskCount);
      console.log("Total tasks in state:", state.tasks.length);
      console.log("Tasks for this project:", state.tasks.filter(t => t.projectId === project.id).length);

      if (taskCount > 0) {
        alert(`Project "${project.name}" created successfully!\n\n✅ ${taskCount} tasks created from Video template.\n\n📋 Go to the "Tasks" tab to view all tasks.`);
      } else {
        alert(`Project "${project.name}" created successfully!\n\n⚠️ Template selected but no tasks were created. Check console for errors.`);
      }
    } else {
      console.log("No template selected or template is:", project.template);
      alert("Project created successfully!");
    }

    projectForm.reset();
  });

  const taskForm = document.getElementById("form-task");
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(taskForm);
    const notifyUsers = data.getAll("notifyUsers");
    const task = {
      id: nextId(),
      projectId: data.get("projectId"),
      title: data.get("title").trim(),
      description: data.get("description")?.trim() || "",
      estimate: data.get("estimate") || "",
      priority: data.get("priority") || "none",
      taskOwnerId: data.get("taskOwnerId") || "",
      startDate: data.get("startDate") || "",
      dueDate: data.get("dueDate") || "",
      time: data.get("time") || "",
      notifyUsers: notifyUsers,
    };
    if (!task.projectId) return;
    state.tasks.push(task);
    saveToLocalStorage();
    renderTasks();
    renderDepartmentStats();
    addActivity(`Added task ${task.title}`, "Task creation");

    // Show notification message
    if (notifyUsers.length > 0) {
      const notifyLabels = {
        po: "Project Owner",
        to: "Task Owner",
        tc: "Task Created By",
        tf: "Task Followers"
      };
      const notified = notifyUsers.map(u => notifyLabels[u] || u).join(", ");
      alert(`Task created! Notifying: ${notified}`);
    } else {
      alert("Task created successfully!");
    }

    taskForm.reset();
  });

  // Scroll down button functionality
  const scrollDownTaskBtn = document.getElementById("scroll-down-task");
  if (scrollDownTaskBtn) {
    scrollDownTaskBtn.addEventListener("click", () => {
      const formCard = scrollDownTaskBtn.closest(".task-form-card");
      if (formCard) {
        const formActions = formCard.querySelector(".task-form-actions");
        if (formActions) {
          formActions.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      }
    });
  }

  const scrollDownProjectBtn = document.getElementById("scroll-down-project");
  if (scrollDownProjectBtn) {
    scrollDownProjectBtn.addEventListener("click", () => {
      const formCard = scrollDownProjectBtn.closest(".task-form-card");
      if (formCard) {
        const formActions = formCard.querySelector(".task-form-actions");
        if (formActions) {
          formActions.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      }
    });
  }

  const assignmentForm = document.getElementById("form-assignment");
  assignmentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(assignmentForm);
    const assignment = {
      id: nextId(),
      projectId: data.get("projectId"),
      taskId: data.get("taskId"),
      resourceId: data.get("resourceId"),
      dueDate: data.get("dueDate"),
      status: "in-progress",
    };
    if (!assignment.projectId || !assignment.taskId || !assignment.resourceId)
      return;
    state.assignments.push(assignment);
    saveToLocalStorage();
    renderAssignments();
    renderGlobalKPIs();
    renderDepartmentStats();
    renderAdminDashboard();
    addActivity("Assigned task to individual", "Task assignment");
    assignmentForm.reset();
  });

  const shareForm = document.getElementById("form-share");
  shareForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(shareForm);
    const assignmentId = data.get("assignmentId");
    if (!assignmentId) return;
    const assignment = state.assignments.find((a) => a.id === assignmentId);
    if (!assignment) return;
    const task = state.tasks.find((t) => t.id === assignment.taskId);
    const resource = state.resources.find((r) => r.id === assignment.resourceId);

    const share = {
      id: nextId(),
      assignmentId,
      taskId: assignment.taskId,
      resourceId: assignment.resourceId,
      message: data.get("message").trim(),
      sharedAt: new Date().toISOString(),
    };
    state.shares.push(share);
    saveToLocalStorage();
    renderShares();

    addActivity(
      `Shared task ${task ? task.title : ""} to ${resource ? resource.email : ""
      }`,
      "Email & dashboard share"
    );
    if (resource && resource.email) {
      const subject = `Task assigned: ${task ? task.title : "Task"}`;
      const bodyLines = [
        `Hi ${resource.name},`,
        "",
        `You have been assigned the task: ${task ? task.title : "Task"}.`,
        `Project: ${project ? project.name : "-"}`,
        `Due Date: ${formatDate(assignment.dueDate)}`,
        "",
        share.message ? `Note from admin: ${share.message}` : "",
        "",
        "This link came from the CRMM dashboard.",
      ];
      const body = encodeURIComponent(bodyLines.join("\n"));
      const mailto = `mailto:${encodeURIComponent(
        resource.email
      )}?subject=${encodeURIComponent(subject)}&body=${body}`;
      window.location.href = mailto;
    }

    shareForm.reset();
  });

  const individualFilterForm = document.getElementById(
    "form-individual-filter"
  );
  individualFilterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(individualFilterForm);
    const resourceId = data.get("resourceId");
    if (!resourceId) return;
    renderIndividualDashboard(resourceId);
  });

  const individualTasksTable = document.getElementById("table-individual-tasks");
  individualTasksTable.addEventListener("click", (e) => {
    const target = e.target;
    if (target.matches("button[data-complete]")) {
      const assignmentId = target.getAttribute("data-complete");
      const assignment = state.assignments.find((a) => a.id === assignmentId);
      if (!assignment) return;
      assignment.status = "completed";
      assignment.completedAt = new Date().toISOString();
      saveToLocalStorage();
      renderAssignments();
      renderGlobalKPIs();
      renderAdminDashboard();
      const select = document.getElementById("select-individual-resource");
      if (select.value) {
        renderIndividualDashboard(select.value);
      }
      renderDepartmentStats();
      addActivity("Marked task as completed", "Individual dashboard");
    }
  });

  // Row actions: view & delete
  document
    .getElementById("table-resources")
    .addEventListener("click", (e) => {
      const target = e.target;
      if (target.matches("button[data-view-resource]")) {
        const id = target.getAttribute("data-view-resource");
        const res = state.resources.find((r) => r.id === id);
        if (!res) return;
        alert(
          `Resource details:\n\nName: ${res.name}\nRole: ${res.role}\nDepartment: ${res.department}\nEmail: ${res.email}`
        );
      } else if (target.matches("button[data-delete-resource]")) {
        const id = target.getAttribute("data-delete-resource");
        const res = state.resources.find((r) => r.id === id);
        if (!res) return;
        if (
          !confirm(
            `Delete resource "${res.name}" and all their task assignments?`
          )
        )
          return;
        state.resources = state.resources.filter((r) => r.id !== id);
        state.assignments = state.assignments.filter(
          (a) => a.resourceId !== id
        );
        state.shares = state.shares.filter((s) => s.resourceId !== id);
        saveToLocalStorage();
        renderResources();
        renderAssignments();
        renderShares();
        renderGlobalKPIs();
        renderDepartmentStats();
        renderAdminDashboard();
        addActivity(`Deleted resource ${res.name}`, "Resource removed");
      }
    });

  document.getElementById("table-projects").addEventListener("click", (e) => {
    const target = e.target;
    if (target.matches("button[data-view-project]")) {
      const id = target.getAttribute("data-view-project");
      const proj = state.projects.find((p) => p.id === id);
      if (!proj) return;
      const owner = proj.ownerId ? state.resources.find(r => r.id === proj.ownerId) : null;
      const details = [
        `Project: ${proj.name}`,
        `Type: ${proj.type || "-"}`,
        `Department: ${proj.department}`,
        `Owner: ${owner ? owner.name : "Not assigned"}`,
        `Priority: ${proj.priority || "None"}`,
        `Template: ${proj.template || "-"}`,
        `Business Hours: ${proj.businessHours || "Standard"}`,
        `Task Layout: ${proj.taskLayout || "Standard"}`,
        `Project Group: ${proj.projectGroup || "-"}`,
        `Tags: ${proj.tags && proj.tags.length > 0 ? proj.tags.join(", ") : "None"}`,
        `Start: ${formatDate(proj.startDate)}`,
        `End: ${formatDate(proj.endDate)}`,
        `Strict Project: ${proj.strictProject ? "Yes" : "No"}`,
        `Roll-up Enabled: ${proj.rollup ? "Yes" : "No"}`,
        `Description: ${proj.description || "None"}`,
      ].join("\n");
      alert(details);
    } else if (target.matches("button[data-delete-project]")) {
      const id = target.getAttribute("data-delete-project");
      const proj = state.projects.find((p) => p.id === id);
      if (!proj) return;
      if (
        !confirm(
          `Delete project "${proj.name}" including all its tasks and assignments?`
        )
      )
        return;
      const projectTasks = state.tasks.filter((t) => t.projectId === id);
      const taskIds = projectTasks.map((t) => t.id);
      state.projects = state.projects.filter((p) => p.id !== id);
      state.tasks = state.tasks.filter((t) => t.projectId !== id);
      state.assignments = state.assignments.filter(
        (a) => a.projectId !== id && !taskIds.includes(a.taskId)
      );
      state.shares = state.shares.filter(
        (s) => !taskIds.includes(s.taskId)
      );
      saveToLocalStorage();
      renderProjects();
      renderTasks();
      renderAssignments();
      renderShares();
      renderGlobalKPIs();
      renderDepartmentStats();
      renderAdminDashboard();
      addActivity(`Deleted project ${proj.name}`, "Project removed");
    }
  });

  document.getElementById("table-tasks").addEventListener("click", (e) => {
    const target = e.target;
    if (target.matches("button[data-view-task]")) {
      const id = target.getAttribute("data-view-task");
      const task = state.tasks.find((t) => t.id === id);
      if (!task) return;
      const project = state.projects.find((p) => p.id === task.projectId);
      const owner = task.taskOwnerId ? state.resources.find(r => r.id === task.taskOwnerId) : null;
      const notifyLabels = {
        po: "Project Owner",
        to: "Task Owner",
        tc: "Task Created By",
        tf: "Task Followers"
      };
      const notified = task.notifyUsers && task.notifyUsers.length > 0
        ? task.notifyUsers.map(u => notifyLabels[u] || u).join(", ")
        : "None";
      const details = [
        `Task: ${task.title}`,
        `Project: ${project ? project.name : "-"}`,
        `Priority: ${task.priority || "None"}`,
        `Owner: ${owner ? owner.name : "Not assigned"}`,
        `Start Date: ${formatDate(task.startDate) || "-"}`,
        `Due Date: ${formatDate(task.dueDate) || "-"}`,
        `Time: ${task.time || "-"}`,
        `Estimated Hours: ${task.estimate || "-"}`,
        `Notify Users: ${notified}`,
        `Description: ${task.description || "-"}`,
      ].join("\n");
      alert(details);
    } else if (target.matches("button[data-delete-task]")) {
      const id = target.getAttribute("data-delete-task");
      const task = state.tasks.find((t) => t.id === id);
      if (!task) return;
      if (
        !confirm(`Delete task "${task.title}" and all its assignments?`)
      )
        return;
      state.tasks = state.tasks.filter((t) => t.id !== id);
      state.assignments = state.assignments.filter(
        (a) => a.taskId !== id
      );
      state.shares = state.shares.filter((s) => s.taskId !== id);
      saveToLocalStorage();
      renderTasks();
      renderAssignments();
      renderShares();
      renderGlobalKPIs();
      renderDepartmentStats();
      renderAdminDashboard();
      addActivity(`Deleted task ${task.title}`, "Task removed");
    }
  });

  document
    .getElementById("table-assignments")
    .addEventListener("click", (e) => {
      const target = e.target;
      if (target.matches("button[data-view-assignment]")) {
        const id = target.getAttribute("data-view-assignment");
        const a = state.assignments.find((x) => x.id === id);
        if (!a) return;
        const project = state.projects.find((p) => p.id === a.projectId);
        const task = state.tasks.find((t) => t.id === a.taskId);
        const resource = state.resources.find((r) => r.id === a.resourceId);
        alert(
          `Assignment details:\n\nProject: ${project ? project.name : "-"
          }\nTask: ${task ? task.title : "-"}\nIndividual: ${resource ? resource.name : "-"
          }\nDue: ${formatDate(a.dueDate)}\nStatus: ${a.status}`
        );
      } else if (target.matches("button[data-delete-assignment]")) {
        const id = target.getAttribute("data-delete-assignment");
        const a = state.assignments.find((x) => x.id === id);
        if (!a) return;
        if (!confirm("Delete this assignment?")) return;
        state.assignments = state.assignments.filter((x) => x.id !== id);
        state.shares = state.shares.filter(
          (s) => s.assignmentId !== id
        );
        saveToLocalStorage();
        renderAssignments();
        renderShares();
        renderGlobalKPIs();
        renderDepartmentStats();
        renderAdminDashboard();
        addActivity("Deleted assignment", "Assignment removed");
      }
    });

  // Sales - Customers
  const salesCustomerForm = document.getElementById("form-sales-customer");
  if (salesCustomerForm) {
    salesCustomerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(salesCustomerForm);
      const customer = {
        id: nextId(),
        name: data.get("name").trim(),
        company: data.get("company")?.trim() || "",
        email: data.get("email")?.trim() || "",
        phone: data.get("phone")?.trim() || "",
        receivables: parseFloat(data.get("receivables") || "0"),
        credits: parseFloat(data.get("credits") || "0"),
      };
      state.customers.push(customer);
      saveToLocalStorage();
      renderSalesCustomers();
      addActivity(`Added customer ${customer.name}`, "Sales - Customers");
      salesCustomerForm.reset();
    });
  }

  // Sales - Estimates
  const salesEstimateForm = document.getElementById("form-sales-estimate");
  if (salesEstimateForm) {
    salesEstimateForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(salesEstimateForm);
      const customerId = data.get("customerId");
      if (!customerId) return;

      const quantity = parseFloat(data.get("quantity") || "1");
      const rate = parseFloat(data.get("rate") || "0");
      const discount = parseFloat(data.get("discount") || "0");
      const tax = parseFloat(data.get("tax") || "0");

      const subtotal = quantity * rate;
      const discountAmount = (subtotal * discount) / 100;
      const taxable = subtotal - discountAmount;
      const taxAmount = (taxable * tax) / 100;
      const total = taxable + taxAmount;

      const estimate = {
        id: nextId(),
        customerId,
        estimateNumber: data.get("estimateNumber") || "",
        referenceNumber: data.get("referenceNumber") || "",
        estimateDate: data.get("estimateDate"),
        expiryDate: data.get("expiryDate") || "",
        currency: data.get("currency") || "INR",
        status: "Draft",
        items: [
          {
            description: data.get("itemDescription") || "",
            quantity,
            rate,
            discount,
            tax,
            subtotal,
            total,
          },
        ],
        amount: total,
        customerNotes: data.get("customerNotes") || "",
        terms: data.get("terms") || "",
      };

      state.estimates.push(estimate);
      saveToLocalStorage();
      renderSalesEstimates();
      addActivity(
        `Created estimate ${estimate.estimateNumber || estimate.id}`,
        "Sales - Estimates"
      );

      const subtotalDisplay = document.getElementById(
        "estimate-subtotal-display"
      );
      if (subtotalDisplay) {
        subtotalDisplay.textContent = total.toFixed(2);
      }

      salesEstimateForm.reset();
      alert("Estimate created successfully!");
    });
  }

  // Sales - Sales Orders
  const salesOrderForm = document.getElementById("form-sales-order");
  if (salesOrderForm) {
    salesOrderForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(salesOrderForm);
      const customerId = data.get("customerId");
      if (!customerId) return;

      const order = {
        id: nextId(),
        customerId,
        orderNumber: data.get("orderNumber") || "",
        referenceNumber: data.get("referenceNumber") || "",
        orderDate: data.get("orderDate"),
        deliveryDate: data.get("deliveryDate") || "",
        status: data.get("status") || "Draft",
        amount: parseFloat(data.get("amount") || "0"),
        notes: data.get("notes") || "",
      };

      state.salesOrders.push(order);
      saveToLocalStorage();
      renderSalesOrders();
      addActivity(
        `Created sales order ${order.orderNumber || order.id}`,
        "Sales - Orders"
      );
      salesOrderForm.reset();
      alert("Sales Order created successfully!");
    });
  }

  // Sales - Delivery Challans
  const deliveryChallanForm = document.getElementById("form-delivery-challan");
  if (deliveryChallanForm) {
    deliveryChallanForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(deliveryChallanForm);
      const customerId = data.get("customerId");
      if (!customerId) return;

      const challan = {
        id: nextId(),
        customerId,
        challanNumber: data.get("challanNumber") || "",
        challanDate: data.get("challanDate"),
        deliveryDate: data.get("deliveryDate") || "",
        status: data.get("status") || "Pending",
        items: parseInt(data.get("items") || "0"),
        notes: data.get("notes") || "",
      };

      state.deliveryChallans.push(challan);
      saveToLocalStorage();
      renderDeliveryChallans();
      addActivity(
        `Created delivery challan ${challan.challanNumber || challan.id}`,
        "Sales - Delivery Challans"
      );
      deliveryChallanForm.reset();
      alert("Delivery Challan created successfully!");
    });
  }

  // Sales - Invoices
  const invoiceForm = document.getElementById("form-invoice");
  if (invoiceForm) {
    invoiceForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(invoiceForm);
      const customerId = data.get("customerId");
      if (!customerId) return;

      const invoice = {
        id: nextId(),
        customerId,
        invoiceNumber: data.get("invoiceNumber") || "",
        referenceNumber: data.get("referenceNumber") || "",
        invoiceDate: data.get("invoiceDate"),
        dueDate: data.get("dueDate") || "",
        status: data.get("status") || "Draft",
        amount: parseFloat(data.get("amount") || "0"),
        notes: data.get("notes") || "",
      };

      state.invoices.push(invoice);
      saveToLocalStorage();
      renderInvoices();
      addActivity(
        `Created invoice ${invoice.invoiceNumber || invoice.id}`,
        "Sales - Invoices"
      );
      invoiceForm.reset();
      alert("Invoice created successfully!");
    });
  }

  // Sales - Payments Received
  const paymentForm = document.getElementById("form-payment");
  if (paymentForm) {
    paymentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(paymentForm);
      const customerId = data.get("customerId");
      const invoiceId = data.get("invoiceId");
      if (!customerId) return;

      const payment = {
        id: nextId(),
        customerId,
        invoiceId: invoiceId || "",
        paymentNumber: data.get("paymentNumber") || "",
        paymentDate: data.get("paymentDate"),
        amount: parseFloat(data.get("amount") || "0"),
        paymentMode: data.get("paymentMode") || "Cash",
        notes: data.get("notes") || "",
      };

      state.payments.push(payment);
      saveToLocalStorage();
      renderPayments();
      addActivity(
        `Received payment ${payment.paymentNumber || payment.id}`,
        "Sales - Payments"
      );
      paymentForm.reset();
      alert("Payment recorded successfully!");
    });
  }

  // Sales - Recurring Invoices
  const recurringInvoiceForm = document.getElementById("form-recurring-invoice");
  if (recurringInvoiceForm) {
    recurringInvoiceForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(recurringInvoiceForm);
      const customerId = data.get("customerId");
      if (!customerId) return;

      const recurring = {
        id: nextId(),
        customerId,
        profileName: data.get("profileName") || "",
        frequency: data.get("frequency") || "Monthly",
        startDate: data.get("startDate"),
        endDate: data.get("endDate") || "",
        status: data.get("status") || "Active",
        amount: parseFloat(data.get("amount") || "0"),
        notes: data.get("notes") || "",
      };

      state.recurringInvoices.push(recurring);
      saveToLocalStorage();
      renderRecurringInvoices();
      addActivity(
        `Created recurring invoice ${recurring.profileName || recurring.id}`,
        "Sales - Recurring Invoices"
      );
      recurringInvoiceForm.reset();
      alert("Recurring Invoice created successfully!");
    });
  }

  // Sales - Credit Notes
  const creditNoteForm = document.getElementById("form-credit-note");
  if (creditNoteForm) {
    creditNoteForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(creditNoteForm);
      const customerId = data.get("customerId");
      if (!customerId) return;

      const creditNote = {
        id: nextId(),
        customerId,
        creditNoteNumber: data.get("creditNoteNumber") || "",
        referenceNumber: data.get("referenceNumber") || "",
        creditNoteDate: data.get("creditNoteDate"),
        status: data.get("status") || "Open",
        amount: parseFloat(data.get("amount") || "0"),
        reason: data.get("reason") || "",
        notes: data.get("notes") || "",
      };

      state.creditNotes.push(creditNote);
      saveToLocalStorage();
      renderCreditNotes();
      addActivity(
        `Created credit note ${creditNote.creditNoteNumber || creditNote.id}`,
        "Sales - Credit Notes"
      );
      creditNoteForm.reset();
      alert("Credit Note created successfully!");
    });
  }

  // Accounts subnav navigation
  const accountsSubnav = document.querySelector(".accounts-subnav");
  if (accountsSubnav) {
    const buttons = accountsSubnav.querySelectorAll(".subnav-item");
    const views = document.querySelectorAll(".accounts-subview");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.accountsSubview;

        buttons.forEach((b) => b.classList.remove("subnav-active"));
        btn.classList.add("subnav-active");

        views.forEach((v) => v.classList.remove("accounts-subview-active"));
        const viewEl = document.getElementById(target);
        if (viewEl) viewEl.classList.add("accounts-subview-active");
      });
    });
  }

  // Accounts - Vendors
  const vendorForm = document.getElementById("form-accounts-vendor");
  if (vendorForm) {
    vendorForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(vendorForm);
      const vendor = {
        id: nextId(),
        name: data.get("name").trim(),
        company: data.get("company")?.trim() || "",
        email: data.get("email")?.trim() || "",
        phone: data.get("phone")?.trim() || "",
        paymentTerms: data.get("paymentTerms") || "Net 30",
        taxId: data.get("taxId")?.trim() || "",
        address: data.get("address")?.trim() || "",
        totalPayable: 0,
      };
      state.vendors.push(vendor);
      saveToLocalStorage();
      renderAccountsVendors();
      addActivity(`Added vendor ${vendor.company || vendor.name}`, "Accounts - Vendors");
      vendorForm.reset();
      alert("Vendor created successfully!");
    });
  }

  // Accounts - Expenses
  const expenseForm = document.getElementById("form-accounts-expense");
  if (expenseForm) {
    expenseForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(expenseForm);
      const expense = {
        id: nextId(),
        expenseDate: data.get("expenseDate"),
        vendorId: data.get("vendorId") || "",
        category: data.get("category") || "",
        amount: parseFloat(data.get("amount") || "0"),
        paymentMethod: data.get("paymentMethod") || "Cash",
        reference: data.get("reference")?.trim() || "",
        notes: data.get("notes   ")?.trim() || "",
      };
      state.expenses.push(expense);
      saveToLocalStorage();
      renderAccountsExpenses();
      const vendor = state.vendors.find(v => v.id === expense.vendorId);
      addActivity(
        `Recorded expense: ${expense.category} - ₹${expense.amount.toFixed(2)}`,
        "Accounts - Expenses"
      );
      expenseForm.reset();
      alert("Expense recorded successfully!");
    });
  }

  // Accounts - Bills
  const billForm = document.getElementById("form-accounts-bill");
  if (billForm) {
    billForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(billForm);
      const vendorId = data.get("vendorId");
      if (!vendorId) return;

      const bill = {
        id: nextId(),
        vendorId,
        billNumber: data.get("billNumber")?.trim() || "",
        billDate: data.get("billDate"),
        dueDate: data.get("dueDate"),
        amount: parseFloat(data.get("amount") || "0"),
        status: data.get("status") || "Unpaid",
        notes: data.get("notes")?.trim() || "",
      };
      state.bills.push(bill);

      // Update vendor's total payable
      const vendor = state.vendors.find(v => v.id === vendorId);
      if (vendor && bill.status !== "Paid") {
        vendor.totalPayable = (vendor.totalPayable || 0) + bill.amount;
      }

      saveToLocalStorage();
      renderAccountsBills();
      renderAccountsVendors();
      addActivity(
        `Created bill ${bill.billNumber || bill.id} - ₹${bill.amount.toFixed(2)}`,
        "Accounts - Bills"
      );
      billForm.reset();
      alert("Bill created successfully!");
    });
  }

  // Accounts - Purchase Orders
  const poForm = document.getElementById("form-accounts-purchase-order");
  if (poForm) {
    poForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(poForm);
      const vendorId = data.get("vendorId");
      if (!vendorId) return;

      const po = {
        id: nextId(),
        vendorId,
        poNumber: data.get("poNumber")?.trim() || "",
        orderDate: data.get("orderDate"),
        deliveryDate: data.get("deliveryDate") || "",
        amount: parseFloat(data.get("amount") || "0"),
        status: data.get("status") || "Draft",
        notes: data.get("notes")?.trim() || "",
      };
      state.purchaseOrders.push(po);
      saveToLocalStorage();
      renderAccountsPurchaseOrders();
      addActivity(
        `Created purchase order ${po.poNumber || po.id} - ₹${po.amount.toFixed(2)}`,
        "Accounts - Purchase Orders"
      );
      poForm.reset();
      alert("Purchase Order created successfully!");
    });
  }
}

function seedSampleData() {
  const alice = {
    id: nextId(),
    name: "Alice Johnson",
    role: "Project Manager",
    department: "Operations",
    email: "alice@example.com",
  };
  const bob = {
    id: nextId(),
    name: "Bob Kumar",
    role: "Designer",
    department: "Marketing",
    email: "bob@example.com",
  };
  const carol = {
    id: nextId(),
    name: "Carol Singh",
    role: "Developer",
    department: "Client Service",
    email: "carol@example.com",
  };
  state.resources.push(alice, bob, carol);

  const proj1 = {
    id: nextId(),
    name: "Website Revamp 2025",
    type: "Client",
    department: "Marketing",
    priority: "high",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  };
  const proj2 = {
    id: nextId(),
    name: "CRM Rollout",
    type: "Internal",
    department: "Operations",
    priority: "medium",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  };
  state.projects.push(proj1, proj2);

  const t1 = {
    id: nextId(),
    projectId: proj1.id,
    title: "Homepage redesign",
    description: "",
    estimate: 16,
  };
  const t2 = {
    id: nextId(),
    projectId: proj2.id,
    title: "User training",
    description: "",
    estimate: 24,
  };
  state.tasks.push(t1, t2);

  // Sample customers
  const cust1 = {
    id: nextId(),
    name: "John Smith Customer",
    company: "Summarize Labs",
    email: "john.smith@example.com",
    phone: "+1 202 555 0101",
    receivables: 504.0,
    credits: 0,
  };
  const cust2 = {
    id: nextId(),
    name: "Anya Enterprises",
    company: "Anya Enterprises",
    email: "accounts@anya.example",
    phone: "+1 202 555 0133",
    receivables: 487.0,
    credits: 0,
  };
  state.customers.push(cust1, cust2);

  const est1 = {
    id: nextId(),
    customerId: cust1.id,
    estimateNumber: "EST-62803",
    referenceNumber: "46096",
    estimateDate: new Date().toISOString().slice(0, 10),
    expiryDate: "",
    currency: "INR",
    status: "Draft",
    items: [],
    amount: 504.0,
    customerNotes: "",
    terms: "",
  };
  const est2 = {
    id: nextId(),
    customerId: cust2.id,
    estimateNumber: "EST-26350",
    referenceNumber: "24171",
    estimateDate: new Date().toISOString().slice(0, 10),
    expiryDate: "",
    currency: "INR",
    status: "Invoiced",
    items: [],
    amount: 487.0,
    customerNotes: "",
    terms: "",
  };
  state.estimates.push(est1, est2);

  const a1 = {
    id: nextId(),
    projectId: proj1.id,
    taskId: t1.id,
    resourceId: bob.id,
    dueDate: proj1.endDate,
    status: "in-progress",
  };
  const a2 = {
    id: nextId(),
    projectId: proj2.id,
    taskId: t2.id,
    resourceId: alice.id,
    dueDate: proj2.endDate,
    status: "completed",
    completedAt: new Date().toISOString(),
  };
  state.assignments.push(a1, a2);

  const share = {
    id: nextId(),
    assignmentId: a2.id,
    taskId: t2.id,
    resourceId: alice.id,
    message: "Initial CRM rollout schedule",
    sharedAt: new Date().toISOString(),
  };
  state.shares.push(share);

  // Accounts Module Sample Data
  // Vendors
  const vendor1 = { id: nextId(), name: "Sarah Miller", company: "Office Supplies Inc", email: "sales@officesuppliesinc.com", phone: "+1-555-0101", paymentTerms: "Net 30", taxId: "TAX12345678", address: "123 Business Park, Mumbai", totalPayable: 0 };
  const vendor2 = { id: nextId(), name: "Michael Chen", company: "Tech Solutions Ltd", email: "billing@techsolutions.com", phone: "+1-555-0102", paymentTerms: "Net 15", taxId: "TAX87654321", address: "456 Tech Plaza, Bangalore", totalPayable: 0 };
  const vendor3 = { id: nextId(), name: "Priya Sharma", company: "Cloud Services Pro", email: "accounts@cloudservices.pro", phone: "+1-555-0103", paymentTerms: "Net 30", taxId: "TAX11223344", address: "789 Cloud Tower, Hyderabad", totalPayable: 0 };
  const vendor4 = { id: nextId(), name: "David Wilson", company: "Marketing Masters", email: "invoices@marketingmasters.com", phone: "+1-555-0104", paymentTerms: "Net 45", taxId: "TAX44332211", address: "321 Creative Ave, Pune", totalPayable: 0 };
  const vendor5 = { id: nextId(), name: "Amit Patel", company: "Print & Design Co", email: "billing@printdesign.co", phone: "+1-555-0105", paymentTerms: "Due on receipt", taxId: "TAX55667788", address: "654 Art District, Delhi", totalPayable: 0 };
  const vendor6 = { id: nextId(), name: "Lisa Anderson", company: "Professional Consulting", email: "admin@profconsult.com", phone: "+1-555-0106", paymentTerms: "Net 30", taxId: "TAX99887766", address: "987 Consult Plaza, Chennai", totalPayable: 0 };
  const vendor7 = { id: nextId(), name: "Raj Kumar", company: "QuickTransport Services", email: "accounts@quicktransport.in", phone: "+1-555-0107", paymentTerms: "Net 15", taxId: "TAX33445566", address: "147 Logistics Hub, Kolkata", totalPayable: 0 };
  const vendor8 = { id: nextId(), name: "Emma Thompson", company: "Legal Advisory Group", email: "billing@legaladvisory.com", phone: "+1-555-0108", paymentTerms: "Net 60", taxId: "TAX77889900", address: "258 Law Towers, Mumbai", totalPayable: 0 };
  state.vendors.push(vendor1, vendor2, vendor3, vendor4, vendor5, vendor6, vendor7, vendor8);

  // Expenses (spanning last 3 months)
  const today = new Date();
  const exp1 = { id: nextId(), expenseDate: new Date(today.getFullYear(), today.getMonth(), 15).toISOString().slice(0, 10), vendorId: vendor1.id, category: "Office Supplies", amount: 4500.00, paymentMethod: "Credit Card", reference: "INV-OS-2024-001", notes: "Printer paper and stationery" };
  const exp2 = { id: nextId(), expenseDate: new Date(today.getFullYear(), today.getMonth(), 10).toISOString().slice(0, 10), vendorId: vendor2.id, category: "Software & Subscriptions", amount: 12000.00, paymentMethod: "Bank Transfer", reference: "SUB-2024-Q1", notes: "Annual software licenses" };
  const exp3 = { id: nextId(), expenseDate: new Date(today.getFullYear(), today.getMonth(), 5).toISOString().slice(0, 10), vendorId: vendor3.id, category: "Software & Subscriptions", amount: 8500.00, paymentMethod: "Credit Card", reference: "CLOUD-JAN-2024", notes: "Cloud hosting monthly fee" };
  const exp4 = { id: nextId(), expenseDate: new Date(today.getFullYear(), today.getMonth() - 1, 28).toISOString().slice(0, 10), vendorId: vendor4.id, category: "Marketing", amount: 25000.00, paymentMethod: "Bank Transfer", reference: "CAMPAIGN-2024-001", notes: "Q1 digital marketing campaign" };
  const exp5 = { id: nextId(), expenseDate: new Date(today.getFullYear(), today.getMonth() - 1, 20).toISOString().slice(0, 10), vendorId: vendor5.id, category: "Marketing", amount: 3200.00, paymentMethod: "UPI", reference: "PRINT-2024-002", notes: "Business cards and brochures" };
  const exp6 = { id: nextId(), expenseDate: new Date(today.getFullYear(), today.getMonth() - 1, 12).toISOString().slice(0, 10), vendorId: vendor1.id, category: "Office Supplies", amount: 2100.00, paymentMethod: "Credit Card", reference: "INV-OS-2024-002", notes: "Office furniture accessories" };
  const exp7 = { id: nextId(), expenseDate: new Date(today.getFullYear(), today.getMonth() - 2, 25).toISOString().slice(0, 10), vendorId: vendor6.id, category: "Professional Services", amount: 45000.00, paymentMethod: "Bank Transfer", reference: "CONSULT-2024-001", notes: "Business strategy consultation" };
  const exp8 = { id: nextId(), expenseDate: new Date(today.getFullYear(), today.getMonth() - 2, 18).toISOString().slice(0, 10), vendorId: vendor7.id, category: "Travel", amount: 7800.00, paymentMethod: "Credit Card", reference: "TRANSPORT-2024-005", notes: "Client meeting transportation" };
  const exp9 = { id: nextId(), expenseDate: new Date(today.getFullYear(), today.getMonth(), 22).toISOString().slice(0, 10), vendorId: vendor3.id, category: "Software & Subscriptions", amount: 8500.00, paymentMethod: "Credit Card", reference: "CLOUD-FEB-2024", notes: "Cloud hosting monthly fee" };
  const exp10 = { id: nextId(), expenseDate: new Date(today.getFullYear(), today.getMonth() - 1, 8).toISOString().slice(0, 10), vendorId: "", category: "Utilities", amount: 3500.00, paymentMethod: "Bank Transfer", reference: "ELECT-JAN-2024", notes: "Office electricity bill" };
  const exp11 = { id: nextId(), expenseDate: new Date(today.getFullYear(), today.getMonth() - 2, 15).toISOString().slice(0, 10), vendorId: "", category: "Utilities", amount: 3200.00, paymentMethod: "Bank Transfer", reference: "ELECT-DEC-2023", notes: "Office electricity bill" };
  const exp12 = { id: nextId(), expenseDate: new Date(today.getFullYear(), today.getMonth(), 3).toISOString().slice(0, 10), vendorId: vendor8.id, category: "Professional Services", amount: 18000.00, paymentMethod: "Bank Transfer", reference: "LEGAL-2024-001", notes: "Legal compliance review" };
  const exp13 = { id: nextId(), expenseDate: new Date(today.getFullYear(), today.getMonth() - 1, 15).toISOString().slice(0, 10), vendorId: "", category: "Meals & Entertainment", amount: 5200.00, paymentMethod: "Credit Card", reference: "TEAM-LUNCH-2024", notes: "Team lunch and client dinner" };
  const exp14 = { id: nextId(), expenseDate: new Date(today.getFullYear(), today.getMonth(), 18).toISOString().slice(0, 10), vendorId: vendor2.id, category: "Software & Subscriptions", amount: 6500.00, paymentMethod: "Credit Card", reference: "SOFTWARE-2024-003", notes: "Project management tools" };
  const exp15 = { id: nextId(), expenseDate: new Date(today.getFullYear(), today.getMonth() - 2, 5).toISOString().slice(0, 10), vendorId: vendor1.id, category: "Office Supplies", amount: 1800.00, paymentMethod: "Cash", reference: "MISC-2023-12", notes: "Miscellaneous supplies" };
  state.expenses.push(exp1, exp2, exp3, exp4, exp5, exp6, exp7, exp8, exp9, exp10, exp11, exp12, exp13, exp14, exp15);

  // Bills
  const bill1 = { id: nextId(), vendorId: vendor2.id, billNumber: "BILL-2024-001", billDate: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10), dueDate: new Date(today.getFullYear(), today.getMonth(), 16).toISOString().slice(0, 10), amount: 12000.00, status: "Paid", notes: "Software licenses - Paid on time" };
  const bill2 = { id: nextId(), vendorId: vendor3.id, billNumber: "BILL-2024-002", billDate: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10), dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString().slice(0, 10), amount: 8500.00, status: "Unpaid", notes: "Monthly hosting - February" };
  const bill3 = { id: nextId(), vendorId: vendor4.id, billNumber: "BILL-2024-003", billDate: new Date(today.getFullYear(), today.getMonth() - 1, 20).toISOString().slice(0, 10), dueDate: new Date(today.getFullYear(), today.getMonth(), 20).toISOString().slice(0, 10), amount: 25000.00, status: "Partially Paid", notes: "Marketing campaign - 50% paid" };
  const bill4 = { id: nextId(), vendorId: vendor6.id, billNumber: "BILL-2024-004", billDate: new Date(today.getFullYear(), today.getMonth() - 2, 15).toISOString().slice(0, 10), dueDate: new Date(today.getFullYear(), today.getMonth() - 1, 15).toISOString().slice(0, 10), amount: 45000.00, status: "Paid", notes: "Consultation services - Completed" };
  const bill5 = { id: nextId(), vendorId: vendor8.id, billNumber: "BILL-2024-005", billDate: new Date(today.getFullYear(), today.getMonth() - 1, 10).toISOString().slice(0, 10), dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 10).toISOString().slice(0, 10), amount: 18000.00, status: "Unpaid", notes: "Legal services - Due in 60 days" };
  const bill6 = { id: nextId(), vendorId: vendor1.id, billNumber: "BILL-2024-006", billDate: new Date(today.getFullYear(), today.getMonth() - 3, 28).toISOString().slice(0, 10), dueDate: new Date(today.getFullYear(), today.getMonth() - 2, 28).toISOString().slice(0, 10), amount: 4500.00, status: "Overdue", notes: "Office supplies - Payment pending" };
  state.bills.push(bill1, bill2, bill3, bill4, bill5, bill6);

  // Update vendor payables based on unpaid bills
  vendor3.totalPayable += bill2.amount;
  vendor4.totalPayable += bill3.amount * 0.5; // Partially paid
  vendor8.totalPayable += bill5.amount;
  vendor1.totalPayable += bill6.amount;

  // Purchase Orders
  const po1 = { id: nextId(), vendorId: vendor1.id, poNumber: "PO-2024-001", orderDate: new Date(today.getFullYear(), today.getMonth(), 5).toISOString().slice(0, 10), deliveryDate: new Date(today.getFullYear(), today.getMonth(), 25).toISOString().slice(0, 10), amount: 8500.00, status: "Sent", notes: "Office furniture order" };
  const po2 = { id: nextId(), vendorId: vendor2.id, poNumber: "PO-2024-002", orderDate: new Date(today.getFullYear(), today.getMonth(), 12).toISOString().slice(0, 10), deliveryDate: new Date(today.getFullYear(), today.getMonth() + 1, 15).toISOString().slice(0, 10), amount: 35000.00, status: "Draft", notes: "Hardware upgrade - Pending approval" };
  const po3 = { id: nextId(), vendorId: vendor5.id, poNumber: "PO-2024-003", orderDate: new Date(today.getFullYear(), today.getMonth() - 1, 8).toISOString().slice(0, 10), deliveryDate: new Date(today.getFullYear(), today.getMonth() - 1, 20).toISOString().slice(0, 10), amount: 6200.00, status: "Received", notes: "Marketing materials - Delivered" };
  const po4 = { id: nextId(), vendorId: vendor3.id, poNumber: "PO-2024-004", orderDate: new Date(today.getFullYear(), today.getMonth(), 18).toISOString().slice(0, 10), deliveryDate: "", amount: 15000.00, status: "Draft", notes: "Cloud infrastructure expansion" };
  const po5 = { id: nextId(), vendorId: vendor7.id, poNumber: "PO-2024-005", orderDate: new Date(today.getFullYear(), today.getMonth() - 2, 10).toISOString().slice(0, 10), deliveryDate: new Date(today.getFullYear(), today.getMonth() - 2, 12).toISOString().slice(0, 10), amount: 4200.00, status: "Cancelled", notes: "Transportation services - Cancelled due to schedule change" };
  state.purchaseOrders.push(po1, po2, po3, po4, po5);

  addActivity(
    "Sample data loaded (resources, projects, tasks, assignments).",
    "System seed"
  );
}

function initialRender() {
  renderResources();
  renderProjects();
  renderTasks();
  renderAssignments();
  renderShares();
  renderDepartmentStats();
  renderAdminDashboard();
  renderGlobalKPIs();
  renderSalesCustomers();
  renderSalesEstimates();
  renderSalesOrders();
  renderDeliveryChallans();
  renderInvoices();
  renderPayments();
  renderRecurringInvoices();
  renderCreditNotes();
  // Accounts renders
  renderAccountsVendors();
  renderAccountsExpenses();
  renderAccountsBills();
  renderAccountsPurchaseOrders();
  renderAccountsActivity();
}

window.addEventListener("DOMContentLoaded", () => {
  setupMainNavigation();
  setupOperationsSubnav();
  setupSalesSubnav();
  setupForms();

  // Load data from localStorage, or seed sample data if no saved data exists
  const hasData = loadFromLocalStorage();
  if (!hasData) {
    seedSampleData();
    saveToLocalStorage(); // Save the sample data
  }

  initialRender();

  // Set Operations view and Projects subview as active by default
  const operationsView = document.getElementById("view-operations");
  const operationsBtn = document.querySelector('[data-view="operations"]');
  if (operationsView && operationsBtn) {
    document.querySelectorAll(".view").forEach(v => v.classList.remove("view-active"));
    operationsView.classList.add("view-active");
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    operationsBtn.classList.add("active");
  }

  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to logout?")) {
        window.location.reload();
      }
    });
  }
});