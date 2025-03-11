const dataManager = new DataManager();
let editIndex = null;

function initializeEntryForm() {
    populateDropdowns();
    setupFormHandlers();
    setupCalculations();
    loadEditProject();
}

function populateDropdowns() {
    const departmentSelect = document.getElementById('department');
    const statusSelect = document.getElementById('status');

    // Clear existing options except the first one
    while (departmentSelect.options.length > 1) departmentSelect.remove(1);
    while (statusSelect.options.length > 1) statusSelect.remove(1);

    // Populate departments from DataManager
    dataManager.departmentList.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        departmentSelect.appendChild(option);
    });

    // Populate status options from DataManager
    dataManager.statusList.forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        statusSelect.appendChild(option);
    });
}

function setupFormHandlers() {
    const form = document.getElementById('projectForm');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            'Department': document.getElementById('department').value,
            'Project Title': document.getElementById('projectTitle').value,
            'Description': document.getElementById('description').value,
            'Focal In-Charge': document.getElementById('focalInCharge').value,
            'Vendor Name': document.getElementById('vendorName').value,
            'WO Issuance Date': document.getElementById('woIssuanceDate').value,
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
            'Balance': parseFloat(document.getElementById('balance').value) || 0,
            'Total YEP': parseFloat(document.getElementById('totalYEP').value) || 0,
            'Remarks': document.getElementById('remarks').value
        };

        if (validateForm(formData)) {
            if (editIndex !== null) {
                dataManager.updateProject(editIndex, formData);
            } else {
                dataManager.addProject(formData);
            }
            window.location.href = 'data.html';
        }
    });

    // Cancel button
    document.getElementById('cancelBtn').addEventListener('click', () => {
        window.location.href = 'data.html';
    });
}

function setupCalculations() {
    const budget = document.getElementById('budget');
    const poValue = document.getElementById('poValue');
    const ytdUtilization = document.getElementById('ytdUtilization');
    const balance = document.getElementById('balance');
    const budgetUtilization = document.getElementById('budgetUtilization');
    const totalYEP = document.getElementById('totalYEP');

    // Calculate Budget Utilization
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

    // Calculate Balance
    [poValue, ytdUtilization].forEach(input => {
        input.addEventListener('input', () => {
            const poVal = parseFloat(poValue.value) || 0;
            const ytdVal = parseFloat(ytdUtilization.value) || 0;
            
            balance.value = (poVal - ytdVal).toFixed(2);
            
            // Update Total YEP
            const balanceVal = parseFloat(balance.value) || 0;
            totalYEP.value = (ytdVal + balanceVal).toFixed(2);
        });
    });
}

function loadEditProject() {
    const storedIndex = localStorage.getItem('editProjectIndex');
    if (storedIndex !== null) {
        editIndex = parseInt(storedIndex);
        const project = dataManager.getAllProjects()[editIndex];
        
        if (project) {
            // Set form title
            document.querySelector('header h2').textContent = 'Edit Project';
            
            // Map project fields to form fields
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
                'Balance': 'balance',
                'Total YEP': 'totalYEP',
                'Remarks': 'remarks'
            };
            
            // Populate form fields
            Object.entries(fieldMappings).forEach(([projectKey, formId]) => {
                const input = document.getElementById(formId);
                if (input && project[projectKey] !== undefined) {
                    input.value = project[projectKey];
                }
            });
        }
        
        // Clear the stored index
        localStorage.removeItem('editProjectIndex');
    }
}

function validateForm(formData) {
    // Required fields
    const requiredFields = ['Department', 'Project Title', 'Focal In-Charge', 'Status'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
        alert('Please fill in all required fields: ' + missingFields.join(', '));
        return false;
    }

    // Validate financial fields
    if (formData['Budget'] < 0 || formData['PO Value'] < 0 || formData['YTD Utilization'] < 0) {
        alert('Financial values cannot be negative');
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

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initializeEntryForm);
