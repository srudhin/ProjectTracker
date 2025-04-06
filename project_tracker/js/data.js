async function checkSession() {
    const response = await fetch('api/check_session.php');
    const result = await response.json();
    if (!result.success) {
        window.location.href = 'login.html';
    }
    return result;
}

document.addEventListener('DOMContentLoaded', () => {
    checkSession().then(() => {
        initializeDataView(); // or initializeDataView, initializeEntryForm	
    });
});

const dataManager = new DataManager();

async function initializeDataView() {
    sessionData = await checkSession(); // Store session info
	await dataManager.loadProjects(); // Ensure initial data is loaded from DB
    populateFilters();
    updateProjectTable();
    setupEventListeners();
	displayUsername();
	

    // Load data every 5 minutes (300,000 ms)
    setInterval(async () => {
        console.log('Fetching latest data from DB');
        await dataManager.loadProjects();
        updateProjectTable();
    }, 300000);
}


function displayUsername() {
    const userSpan = document.getElementById('loggedInUser');
    if (userSpan && sessionData.username) {
        userSpan.textContent = sessionData.username;
    } else {
        userSpan.textContent = 'Unknown User'; // Fallback
        console.error('Username not found in session data or DOM element missing.');
    }
}


function populateFilters() {
    const departmentFilter = document.getElementById('departmentFilter');
    const statusFilter = document.getElementById('statusFilter');

    // Clear existing options except the first one
    while (departmentFilter.options.length > 1) departmentFilter.remove(1);
    while (statusFilter.options.length > 1) statusFilter.remove(1);

    // Populate department filter
    dataManager.departmentList.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        departmentFilter.appendChild(option);
    });

    // Populate status filter
    dataManager.statusList.forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        statusFilter.appendChild(option);
    });
}

// Global variable to store the filtered projects
let filteredProjects = [];

function updateProjectTable() {
    const tbody = document.querySelector('#projectTable tbody');
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const selectedDepartment = document.getElementById('departmentFilter').value;
    const selectedStatus = document.getElementById('statusFilter').value;

    // Get and filter projects
    filteredProjects = dataManager.getAllProjects().filter(project => {
        const matchesSearch = !searchQuery || 
            project['Project Title']?.toLowerCase().includes(searchQuery) ||
            project['Department']?.toLowerCase().includes(searchQuery) ||
            project['Focal In-Charge']?.toLowerCase().includes(searchQuery);
        
        const matchesDepartment = !selectedDepartment || project['Department'] === selectedDepartment;
        const matchesStatus = !selectedStatus || project['Status'] === selectedStatus;

        return matchesSearch && matchesDepartment && matchesStatus;
    });

    // Clear existing rows
    tbody.innerHTML = '';

    // Add project rows with project ID
    filteredProjects.forEach((project, index) => {
        const row = tbody.insertRow();
        
        row.innerHTML = `
            <td class="department-cell">${project['Department'] || ''}</td>
            <td class="title-cell">${project['Project Title'] || ''}</td>
            <td>${project['Focal In-Charge'] || ''}</td>
            <td class="status">
                <span class="status-badge ${(project['Status'] || '').toLowerCase().replace(' ', '-')}">
                    ${project['Status'] || 'N/A'}
                </span>
            </td>
            <td class="timeline-cell">${project['Timeline'] || ''}</td>
            <td class="budget-cell">${formatCurrency(project['Budget'])}</td>
            <td class="po-value-cell">${formatCurrency(project['PO Value'])}</td>
            <td class="ytd-cell">${formatCurrency(project['YTD Utilization'])}</td>
            <td class="balance-cell">${formatCurrency(project['Balance'])}</td>
            <td class="actions">
                <button class="edit" onclick="editProject(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete" onclick="deleteProject(${index})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        row.dataset.projectIndex = index; // Use index from filtered list
        row.style.cursor = 'pointer';
    });
}

function setupEventListeners() {
    const downloadBtn = document.getElementById('downloadTemplateBtn');
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');
    const clearDataBtn = document.getElementById('clearDataBtn');
    const searchInput = document.getElementById('searchInput');
    const departmentFilter = document.getElementById('departmentFilter');
    const statusFilter = document.getElementById('statusFilter');

    if (downloadBtn && !downloadBtn.dataset.listenerAdded) {
        downloadBtn.addEventListener('click', () => {
            console.log('Download Template clicked');
            dataManager.downloadTemplate();
            showNotification('Template downloaded successfully', 'success');
        });
        downloadBtn.dataset.listenerAdded = 'true';
    }

    if (exportBtn && !exportBtn.dataset.listenerAdded) {
        exportBtn.addEventListener('click', () => {
            console.log('Export clicked');
            dataManager.exportToExcel();
        });
        exportBtn.dataset.listenerAdded = 'true';
    }

    if (importBtn && !importBtn.dataset.listenerAdded) {
        importBtn.addEventListener('click', () => {
            console.log('Import clicked');
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.xlsx';
            input.onchange = async (e) => {
                try {
                    const file = e.target.files[0];
                    if (!file) return;
                    console.log('Importing file:', file.name);
                    await dataManager.importFromExcel(file);
                    updateProjectTable();
                    showNotification('Data imported successfully', 'success');
                } catch (error) {
                    console.error('Import error:', error);
                    showNotification('Error importing data. Please check the file format.', 'error');
                }
            };
            input.click();
        });
        importBtn.dataset.listenerAdded = 'true';
    }

    if (saveBtn && !saveBtn.dataset.listenerAdded) {
        saveBtn.addEventListener('click', async () => {
            console.log('Save clicked');
            try {
                await dataManager.saveToFile();
                showNotification('Data saved successfully', 'success');
            } catch (error) {
                console.error('Error saving data:', error);
                showNotification('Error saving data. Please try again.', 'error');
            }
        });
        saveBtn.dataset.listenerAdded = 'true';
    }

    if (loadBtn && !loadBtn.dataset.listenerAdded) {
        loadBtn.addEventListener('click', async () => {
            console.log('Load clicked');
            try {
                const success = await dataManager.loadFromFile();
                if (success) {
                    updateProjectTable();
                    showNotification('Data loaded successfully', 'success');
                }
            } catch (error) {
                console.error('Error loading data:', error);
                showNotification('Error loading data. Please check the file format.', 'error');
            }
        });
        loadBtn.dataset.listenerAdded = 'true';
    }

    if (clearDataBtn && !clearDataBtn.dataset.listenerAdded) {
        clearDataBtn.addEventListener('click', () => {
            console.log('Clear Data clicked');
            showConfirmationDialog(
                'Clear All Data',
                'Are you sure you want to clear all project data?',
                'This action cannot be undone. All project data will be permanently deleted.',
                () => {
                    showSecondConfirmationDialog();
                }
            );
        });
        clearDataBtn.dataset.listenerAdded = 'true';
    }
	
	document.getElementById('logoutBtn').addEventListener('click', async () => {
        await fetch('api/logout.php');
        window.location.href = 'login.html';
    });

    // Existing filter and search listeners
    searchInput?.addEventListener('input', debounce(updateProjectTable, 300));
    departmentFilter?.addEventListener('change', updateProjectTable);
    statusFilter?.addEventListener('change', updateProjectTable);
}

async function editProject(index) {

	const session = await fetch('api/check_session.php').then(res => res.json());
		const project = filteredProjects[index];
		if (!session.is_admin && !session.departments.includes(project['Department'])) {
			showMessage('You do not have permission to edit this project.');
			return;
		}


    // Store the project index in localStorage and redirect to entry page
    localStorage.setItem('editProjectIndex', index);
    window.location.href = 'entry.html';
}

async function deleteProject(index) {
	const session = await fetch('api/check_session.php').then(res => res.json());
    const project = filteredProjects[index];
    if (!session.is_admin && !session.departments.includes(project['Department'])) {
        showMessage('You do not have permission to delete this project.');
        return;
    }
    const confirmed = await showConfirm('Are you sure you want to delete this project?');
    if (confirmed) {
        await dataManager.deleteProject(index);
        updateProjectTable();
    }
}

function formatCurrency(value) {
    if (value === undefined || value === null) value = 0;
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
    }).format(value);
}

function showConfirmationDialog(title, message, warning, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';
    document.body.appendChild(overlay);

    const dialog = document.createElement('div');
    dialog.className = 'confirmation-dialog';
    dialog.innerHTML = `
        <h2>${title}</h2>
        <p>${message}</p>
        <p class="warning-text">${warning}</p>
        <div class="dialog-actions">
            <button class="btn-cancel">Cancel</button>
            <button class="btn-confirm">Confirm</button>
        </div>
    `;
    document.body.appendChild(dialog);

    const cancelBtn = dialog.querySelector('.btn-cancel');
    const confirmBtn = dialog.querySelector('.btn-confirm');

    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
        document.body.removeChild(dialog);
    });

    confirmBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
        document.body.removeChild(dialog);
        if (onConfirm) onConfirm();
    });
}

function showSecondConfirmationDialog() {
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';
    document.body.appendChild(overlay);

    const dialog = document.createElement('div');
    dialog.className = 'confirmation-dialog';
    dialog.innerHTML = `
        <h2>Final Confirmation</h2>
        <p>Type "DELETE" to confirm clearing all data:</p>
        <input type="text" id="deleteConfirmInput" class="delete-confirm-input" placeholder="Type DELETE">
        <div class="dialog-actions">
            <button class="btn-cancel">Cancel</button>
            <button class="btn-confirm" disabled>Confirm Delete</button>
        </div>
    `;
    document.body.appendChild(dialog);

    const input = dialog.querySelector('#deleteConfirmInput');
    const confirmBtn = dialog.querySelector('.btn-confirm');
    const cancelBtn = dialog.querySelector('.btn-cancel');

    input.addEventListener('input', (e) => {
        confirmBtn.disabled = e.target.value !== 'DELETE';
    });

    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
        document.body.removeChild(dialog);
    });

    confirmBtn.addEventListener('click', () => {
        dataManager.clearAllData();
        updateProjectTable();
        document.body.removeChild(overlay);
        document.body.removeChild(dialog);
        showNotification('All data has been cleared', 'success');
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification BOTH${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    notification.offsetHeight; // Trigger reflow
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const projectDetailPopup = document.getElementById('projectDetailPopup');
const closePopupBtn = projectDetailPopup.querySelector('.close-btn');
const projectInfoContainer = projectDetailPopup.querySelector('.project-info');

function showProjectDetails(project) {
    console.group('Showing project details');
    console.log('Project data:', project);
    if (!project) {
        console.error('Project is undefined or null');
        console.groupEnd();
        return;
    }
    
    projectInfoContainer.innerHTML = `
        <dl class="project-details-list">
            <div class="detail-row">
                <dt>Department</dt>
                <dd>${project['Department'] || 'N/A'}</dd>
            </div>
            <div class="detail-row">
                <dt>Project Title</dt>
                <dd>${project['Project Title'] || 'N/A'}</dd>
            </div>
            <div class="detail-row">
                <dt>Description</dt>
                <dd>${escapeHtml(project['Description'])}</dd>
            </div>
            <div class="detail-row">
                <dt>Focal In-Charge</dt>
                <dd>${project['Focal In-Charge'] || 'N/A'}</dd>
            </div>
            <div class="detail-row">
                <dt>Vendor Name</dt>
                <dd>${project['Vendor Name'] || 'N/A'}</dd>
            </div>
            <div class="detail-row">
                <dt>WO Issuance Date</dt>
                <dd>${project['WO Issuance Date'] || 'N/A'}</dd>
            </div>
            <div class="detail-row">
                <dt>Status</dt>
                <dd><span class="status-badge ${(project['Status'] || '').toLowerCase().replace(' ', '-')}">${project['Status'] || 'N/A'}</span></dd>
            </div>
            <div class="detail-row">
                <dt>Timeline</dt>
                <dd>${project['Timeline'] || 'N/A'}</dd>
            </div>
            <div class="detail-row">
                <dt>Revised Timeline</dt>
                <dd>${project['Revised Timeline'] || 'N/A'}</dd>
            </div>
            <div class="detail-row">
                <dt>Dependencies/Risks</dt>
                <dd>${escapeHtml(project['Dependencies/Risks'])}</dd>
            </div>
            <div class="detail-row">
                <dt>Key Deliverables</dt>
                <dd>${escapeHtml(project['Key Deliverables'])}</dd>
            </div>
            <div class="detail-row">
                <dt>Milestones Achieved</dt>
                <dd>${escapeHtml(project['Milestones Achieved'])}</dd>
            </div>
            <div class="detail-row">
                <dt>Budget</dt>
                <dd>${formatCurrency(project['Budget'])}</dd>
            </div>
            <div class="detail-row">
                <dt>PO Value</dt>
                <dd>${formatCurrency(project['PO Value'])}</dd>
            </div>
            <div class="detail-row">
                <dt>Budget Utilization</dt>
                <dd>
                    <span class="percentage">${project['Budget Utilization (%)'] || 0}%</span>
                    <div class="progress-bar">
                        <div class="progress ${(project['Budget Utilization (%)'] || 0) > 100 ? 'over-budget' : ''}" style="width: ${Math.min(project['Budget Utilization (%)'] || 0, 100)}%"></div>
                    </div>
                </dd>
            </div>
            <div class="detail-row">
                <dt>YTD Utilization</dt>
                <dd>${formatCurrency(project['YTD Utilization'])}</dd>
            </div>
            <div class="detail-row">
                <dt>Projected Next Qtr Utilization</dt>
                <dd>${formatCurrency(project['Projected Next Qtr Utilization'])}</dd>
            </div>
            <div class="detail-row">
                <dt>Balance</dt>
                <dd>${formatCurrency(project['Balance'])}</dd>
            </div>
            <div class="detail-row">
                <dt>Total YEP</dt>
                <dd>${formatCurrency(project['Total YEP'])}</dd>
            </div>
            <div class="detail-row">
                <dt>Remarks</dt>
                <dd>${escapeHtml(project['Remarks'])}</dd>
            </div>
        </dl>
    `;
    projectDetailPopup.style.display = 'flex';
    console.groupEnd();
}

function escapeHtml(text) {
    if (!text) return 'N/A';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, match => map[match]);
}

// Close popup functionality
closePopupBtn.addEventListener('click', () => {
    projectDetailPopup.style.display = 'none';
});

// Add click handlers to project rows via event delegation
document.addEventListener('DOMContentLoaded', () => {
    initializeDataView();

    const tbody = document.querySelector('#projectTable tbody');
    tbody.addEventListener('click', (event) => {
        const row = event.target.closest('tr');
        if (!row || event.target.closest('.actions')) return;

        const projectIndex = parseInt(row.dataset.projectIndex, 10);
        const project = filteredProjects[projectIndex];
        
        if (project) {
            showProjectDetails(project);
        } else {
            console.error('Project not found at index:', projectIndex);
        }
    });
});

// Note: setupProjectRowClickHandlers is redundant due to event delegation above
// You can remove this function if it’s not referenced elsewhere
function setupProjectRowClickHandlers() {
    const projectRows = document.querySelectorAll('#projectTable tbody tr');
    projectRows.forEach(row => {
        row.addEventListener('click', () => {
            const projectIndex = Array.from(row.parentNode.children).indexOf(row);
            const project = dataManager.getAllProjects()[projectIndex];
            if (project) {
                showProjectDetails(project);
            } else {
                console.error('Project not found at index:', projectIndex);
            }
        });
    });
}