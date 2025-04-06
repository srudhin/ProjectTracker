async function checkSession() {
    const response = await fetch('http://localhost/project_tracker/api/check_session.php'); // Absolute path
    const result = await response.json();
    if (!result.success) {
        window.location.href = 'login.html';
    }
    return result;
}

let dataManager; // Will be initialized in initializeEntryForm
let editIndex = null; // Global variable for edit index
let sessionData; // Store session data globally

async function initializeEntryForm() {
    sessionData = await checkSession(); // Store session info
    dataManager = new DataManager();
    await dataManager.loadProjects(); // Wait for initial data load
    populateDropdowns();
    setupFormHandlers();
    setupCalculations();
    loadEditProject();
	displayUsername();
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

function populateDropdowns() {
    console.log('Populating dropdowns');
    console.log('Departments:', dataManager.departmentList);
    console.log('Statuses:', dataManager.statusList);

    const departmentSelect = document.getElementById('department');
    const statusSelect = document.getElementById('status');

    while (departmentSelect.options.length > 1) departmentSelect.remove(1);
    while (statusSelect.options.length > 1) statusSelect.remove(1);

    dataManager.departmentList.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        departmentSelect.appendChild(option);
    });

    dataManager.statusList.forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        statusSelect.appendChild(option);
    });
}

function setupFormHandlers() {
    const form = document.getElementById('projectForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            'Department': document.getElementById('department').value,
            'Project Title': document.getElementById('projectTitle').value,
            'Description': document.getElementById('description').value,
            'Focal In-Charge': document.getElementById('focalInCharge').value,
            'Vendor Name': document.getElementById('vendorName').value,
            'WO Issuance Date': document.getElementById('woIssuanceDate').value || null,
            'Status': document.getElementById('status').value,
            'Timeline': document.getElementById('timeline').value,
            'Revised Timeline': document.getElementById('revisedTimeline').value,
            'Dependencies/Risks': document.getElementById('dependencies').value,
            'Key Deliverables': document.getElementById('keyDeliverables').value,
            'Milestones Achieved': document.getElementById('milestonesAchieved').value,
            'Budget': parseFloat(document.getElementById('budget').value) || 0,
            'PO Value': parseFloat(document.getElementById('poValue').value) || 0,
            'Budget Utilization (%)': parseFloat(document.getElementById('budgetUtilization').value) || 0,
            'YTD Utilization': parseFloat(document.getElementById('ytdUtilization').value) || 0,
            'Projected Next Qtr Utilization': parseFloat(document.getElementById('projectedNextQtrUtilization').value) || 0,
            'Balance': parseFloat(document.getElementById('balance').value) || 0,
            'Total YEP': parseFloat(document.getElementById('totalYEP').value) || 0,
            'Remarks': document.getElementById('remarks').value
        };

        // Client-side permission check
        if (!sessionData.is_admin && !sessionData.departments.includes(formData['Department'])) {
            showMessage(`You do not have permission to add/edit projects in the "${formData['Department']}" department.`);
            return;
        }

        if (validateForm(formData)) {
            try {
                if (editIndex !== null) {
                    const success = await dataManager.updateProject(editIndex, formData);
                    if (success) {
                        showMessage('Project updated successfully!');
                        window.location.href = 'data.html';
                    } else {
                        const response = await fetch('http://localhost/project_tracker/api/save_project.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: dataManager.getAllProjects()[editIndex].id, ...formData })
                        });
                        const result = await response.json();
                        if (!result.success) {
                            showMessage(result.error || 'Failed to update project. Please check your permissions or try again.');
                        }
                    }
                } else {
                    const success = await dataManager.addProject(formData);
                    if (success) {
                        showMessage('Project added successfully!');
                        window.location.href = 'data.html';
                    } else {
                        const response = await fetch('http://localhost/project_tracker/api/save_project.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(formData)
                        });
                        const result = await response.json();
                        if (!result.success) {
                            showMessage(result.error || 'Failed to add project. Please check your permissions or try again.');
                        }
                    }
                }
            } catch (error) {
                console.error('Error saving project:', error);
                showMessage('An unexpected error occurred. Please try again.');
            }
        }
    });

    document.getElementById('cancelBtn').addEventListener('click', () => {
        window.location.href = 'data.html';
    });
}

function setupCalculations() {
    const budget = document.getElementById('budget');
    const poValue = document.getElementById('poValue');
    const ytdUtilization = document.getElementById('ytdUtilization');
    const projectedNextQtrUtilization = document.getElementById('projectedNextQtrUtilization');
    const balance = document.getElementById('balance');
    const budgetUtilization = document.getElementById('budgetUtilization');
    const totalYEP = document.getElementById('totalYEP');

    [budget, ytdUtilization].forEach(input => {
        input.addEventListener('input', () => {
            const budgetVal = parseFloat(budget.value) || 0;
            const ytdVal = parseFloat(ytdUtilization.value) || 0;
            
            if (budgetVal > 0) {
                budgetUtilization.value = ((ytdVal / budgetVal) * 100).toFixed(2);
            } else {
                budgetUtilization.value = '0';
            }
        });
    });

    [poValue, ytdUtilization, projectedNextQtrUtilization].forEach(input => {
        input.addEventListener('input', () => {
            const poVal = parseFloat(poValue.value) || 0;
            const ytdVal = parseFloat(ytdUtilization.value) || 0;
            const projectedVal = parseFloat(projectedNextQtrUtilization.value) || 0;
            
            balance.value = (poVal - ytdVal).toFixed(2);
            totalYEP.value = (ytdVal + projectedVal).toFixed(2);
        });
    });
}

function loadEditProject() {
    const storedIndex = localStorage.getItem('editProjectIndex');
    if (storedIndex !== null) {
        editIndex = parseInt(storedIndex);
        const project = dataManager.getAllProjects()[editIndex];
        
        if (project) {
            // Check permission before loading edit form
            if (!sessionData.is_admin && !sessionData.departments.includes(project['Department'])) {
                showMessage(`You do not have permission to edit projects in the "${project['Department']}" department.`);
                window.location.href = 'data.html';
                return;
            }

            document.querySelector('header h2').textContent = 'Edit Project';
            
            const fieldMappings = {
                'Department': 'department',
                'Project Title': 'projectTitle',
                'Description': 'description',
                'Focal In-Charge': 'focalInCharge',
                'Vendor Name': 'vendorName',
                'WO Issuance Date': 'woIssuanceDate',
                'Status': 'status',
                'Timeline': 'timeline',
                'Revised Timeline': 'revisedTimeline',
                'Dependencies/Risks': 'dependencies',
                'Key Deliverables': 'keyDeliverables',
                'Milestones Achieved': 'milestonesAchieved',
                'Budget': 'budget',
                'PO Value': 'poValue',
                'Budget Utilization (%)': 'budgetUtilization',
                'YTD Utilization': 'ytdUtilization',
                'Projected Next Qtr Utilization': 'projectedNextQtrUtilization',
                'Balance': 'balance',
                'Total YEP': 'totalYEP',
                'Remarks': 'remarks'
            };
            
            Object.entries(fieldMappings).forEach(([projectKey, formId]) => {
                const input = document.getElementById(formId);
                if (input && project[projectKey] !== undefined) {
                    input.value = project[projectKey];
                }
            });
        }
        
        localStorage.removeItem('editProjectIndex');
    }
}

function validateForm(formData) {
    const requiredFields = ['Department', 'Project Title', 'Focal In-Charge', 'Status'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
        showMessage('Please fill in all required fields: ' + missingFields.join(', '));
        return false;
    }

    if (formData['Budget'] < 0 || formData['PO Value'] < 0 || formData['YTD Utilization'] < 0 || formData['Projected Next Qtr Utilization'] < 0) {
        showMessage('Financial values cannot be negative');
        return false;
    }

    return true;
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

// Single DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', () => {
    initializeEntryForm();
});