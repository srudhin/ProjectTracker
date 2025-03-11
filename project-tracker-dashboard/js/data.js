const dataManager = new DataManager();

function initializeDataView() {
    populateFilters();
    updateProjectTable();
    setupEventListeners();
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

function updateProjectTable() {
    const tbody = document.querySelector('#projectTable tbody');
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const selectedDepartment = document.getElementById('departmentFilter').value;
    const selectedStatus = document.getElementById('statusFilter').value;

    // Get and filter projects
    let projects = dataManager.getAllProjects().filter(project => {
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

    // Add project rows
    projects.forEach((project, index) => {
        const row = tbody.insertRow();
        
        // Add cells with appropriate classes for styling
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
        row.dataset.projectId = project.id || `project-${index}`;
        row.style.cursor = 'pointer';
    });
}

function setupEventListeners() {
    // Search input
    document.getElementById('searchInput')?.addEventListener('input', debounce(updateProjectTable, 300));

    // Filters
    document.getElementById('departmentFilter')?.addEventListener('change', updateProjectTable);
    document.getElementById('statusFilter')?.addEventListener('change', updateProjectTable);

    // Download Template button
    document.getElementById('downloadTemplateBtn')?.addEventListener('click', () => {
        dataManager.downloadTemplate();
        showNotification('Template downloaded successfully', 'success');
    });

    // Import button
    document.getElementById('importBtn')?.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx';
        
        input.onchange = async (e) => {
            try {
                const file = e.target.files[0];
                if (!file) return;
                
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

    // Export button
    document.getElementById('exportBtn')?.addEventListener('click', () => {
        dataManager.exportToExcel();
    });

    // Save button
    document.getElementById('saveBtn')?.addEventListener('click', async () => {
        try {
            await dataManager.saveToFile();
            showNotification('Data saved successfully', 'success');
        } catch (error) {
            console.error('Error saving data:', error);
            showNotification('Error saving data. Please try again.', 'error');
        }
    });

    // Load button
    document.getElementById('loadBtn')?.addEventListener('click', async () => {
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

    // Clear Data functionality
    document.getElementById('clearDataBtn')?.addEventListener('click', () => {
        showConfirmationDialog(
            'Clear All Data',
            'Are you sure you want to clear all project data?',
            'This action cannot be undone. All project data will be permanently deleted.',
            () => {
                showSecondConfirmationDialog();
            }
        );
    });
}

function editProject(index) {
    // Store the project index in localStorage and redirect to entry page
    localStorage.setItem('editProjectIndex', index);
    window.location.href = 'entry.html';
}

function deleteProject(index) {
    if (confirm('Are you sure you want to delete this project?')) {
        dataManager.deleteProject(index);
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
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';
    document.body.appendChild(overlay);

    // Create dialog
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

    // Add event listeners
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
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Trigger reflow to enable transition
    notification.offsetHeight;
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

// Project Detail Popup Functionality
const projectDetailPopup = document.getElementById('projectDetailPopup');
const closePopupBtn = projectDetailPopup.querySelector('.close-btn');
const projectInfoContainer = projectDetailPopup.querySelector('.project-info');

// Function to show project details
function showProjectDetails(project) {
    console.group('Showing project details');
    console.log('Project data:', project);
    if (!project) {
        console.error('Project is undefined or null');
        console.groupEnd();
        return;
    }
    projectInfoContainer.innerHTML = `
        <div class='project-details-grid'>
            <p><strong>Department:</strong> ${project['Department'] || 'N/A'}</p>
            <p><strong>Project Title:</strong> ${project['Project Title'] || 'N/A'}</p>
            <p><strong>Description:</strong> ${project['Description'] || 'N/A'}</p>
            <p><strong>Focal In-Charge:</strong> ${project['Focal In-Charge'] || 'N/A'}</p>
            <p><strong>Vendor Name:</strong> ${project['Vendor Name'] || 'N/A'}</p>
            <p><strong>WO Issuance Date:</strong> ${project['WO Issuance Date'] || 'N/A'}</p>
            <p><strong>Status:</strong> <span class='status-badge ${(project['Status'] || '').toLowerCase().replace(' ', '-')}'>${project['Status'] || 'N/A'}</span></p>
            <p><strong>Timeline:</strong> ${project['Timeline'] || 'N/A'}</p>
            <p><strong>Revised Timeline:</strong> ${project['Revised Timeline'] || 'N/A'}</p>
            <p><strong>Dependencies/Risks:</strong> ${project['Dependencies/Risks'] || 'N/A'}</p>
            <p><strong>Key Deliverables:</strong> ${project['Key Deliverables'] || 'N/A'}</p>
            <p><strong>Milestones Achieved:</strong> ${project['Milestones Achieved'] || 'N/A'}</p>
            <p><strong>Budget:</strong> ${project['Budget'] || 'N/A'}</p>
            <p><strong>PO Value:</strong> ${project['PO Value'] || 'N/A'}</p>
            <p><strong>Budget Utilization:</strong> ${project['Budget Utilization (%)'] || 'N/A'}</p>
            <p><strong>YTD Utilization:</strong> ${project['YTD Utilization'] || 'N/A'}</p>
            <p><strong>Balance:</strong> ${project['Balance'] || 'N/A'}</p>
            <p><strong>Total YEP:</strong> ${project['Total YEP'] || 'N/A'}</p>
            <p><strong>Remarks:</strong> ${project['Remarks'] || 'N/A'}</p>
        </div>
    `;
    projectDetailPopup.style.display = 'flex';
    console.groupEnd();
}

// Close popup functionality
closePopupBtn.addEventListener('click', () => {
    projectDetailPopup.style.display = 'none';
});

// Add click handlers to project rows
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

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeDataView();
    setupProjectRowClickHandlers();
});
