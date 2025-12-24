
// Simple in-memory data model
const state = {
  resources: [],
  projects: [],
  tasks: [],
  assignments: [],
  shares: [],
  activity: [],
};

let idCounter = 1;
const nextId = () => String(idCounter++);

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
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
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

  const titles = {
    dashboard: "Dashboard",
    marketing: "Marketing",
    sales: "Sales",
    accounts: "Accounts",
    operations: "Operations",
    hr: "Human Resources",
    service: "Client Service",
  };

  const subtitles = {
    dashboard: "Overview of projects, departments, and performance.",
    marketing: "Marketing workspace and KPIs.",
    sales: "Sales performance and pipeline.",
    accounts: "Accounts & finance overview.",
    operations: "Operations — resources, projects, tasks, and dashboards.",
    hr: "Human Resources workspace.",
    service: "Client service & support workspace.",
  };

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.view;

      navButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      views.forEach((v) => v.classList.remove("view-active"));
      const viewEl = document.getElementById(`view-${target}`);
      if (viewEl) viewEl.classList.add("view-active");

      document.getElementById("view-title").textContent = titles[target] || "";
      document.getElementById("view-subtitle").textContent =
        subtitles[target] || "";
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
      : "";
    tr.innerHTML = `
      <td>${p.name}</td>
      <td>${p.type || "-"}</td>
      <td>${p.department}</td>
      <td>${priorityBadge || "-"}</td>
      <td>${duration}</td>
      <td>
        <button class="table-button" data-view-project="${p.id}">View</button>
        <button class="table-button table-button--danger" data-delete-project="${p.id}">Delete</button>
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
      <td><span class="status-pill ${statusClass}">${
      a.status === "completed" ? "Completed" : "In Progress"
    }</span></td>
      <td>
        <button class="table-button" data-view-assignment="${a.id}">View</button>
        <button class="table-button table-button--danger" data-delete-assignment="${a.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);

    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = `${resource ? resource.name : "Unknown"} - ${
      task ? task.title : "Task"
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
          ${formatDate(s.sharedAt)} · ${
        resource ? resource.email : "no-email"
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
            backgroundColor: ["#e5e7eb", "#3b82f6", "#22c55e"],
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
              "#f97316",
              "#22c55e",
              "#eab308",
              "#ec4899",
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
        <span class="status-pill ${
          isCompleted ? "status-pill--completed" : "status-pill--inprogress"
        }">
          ${isCompleted ? "Completed" : "In Progress"}
        </span>
      </td>
      <td>
        ${
          isCompleted
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
    renderProjects();
    renderDepartmentStats();
    addActivity(`Created project ${project.name}`, project.department);
    projectForm.reset();
    alert("Project created successfully!");
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
    }
    
    taskForm.reset();
  });

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
    renderShares();

    addActivity(
      `Shared task ${task ? task.title : ""} to ${
        resource ? resource.email : ""
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
          `Assignment details:\n\nProject: ${
            project ? project.name : "-"
          }\nTask: ${task ? task.title : "-"}\nIndividual: ${
            resource ? resource.name : "-"
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
        renderAssignments();
        renderShares();
        renderGlobalKPIs();
        renderDepartmentStats();
        renderAdminDashboard();
        addActivity("Deleted assignment", "Assignment removed");
      }
    });
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
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  };
  const proj2 = {
    id: nextId(),
    name: "CRM Rollout",
    type: "Internal",
    department: "Operations",
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
}

window.addEventListener("DOMContentLoaded", () => {
  setupMainNavigation();
  setupOperationsSubnav();
  setupForms();
  seedSampleData();
  initialRender();

   const logoutBtn = document.getElementById("btn-logout");
   if (logoutBtn) {
     logoutBtn.addEventListener("click", () => {
       if (confirm("Are you sure you want to logout?")) {
         window.location.reload();
       }
     });
   }
});


