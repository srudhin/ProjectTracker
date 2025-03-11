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

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initializeDataView);
