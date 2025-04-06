const dataManager = new DataManager();
let departmentChart, statusChart;

async function checkSession() {
    const response = await fetch('http://localhost/project_tracker/api/check_session.php'); // Absolute path
    const result = await response.json();
    if (!result.success) {
        window.location.href = 'login.html';
    }
    return result;
}

async function initializeDashboard() {
    sessionData = await checkSession(); // Store session info
    await dataManager.loadProjects();
    console.log('Projects loaded in dashboard:', dataManager.getAllProjects().length, dataManager.getAllProjects());
    updateDashboard();
    setupEventListeners();
	displayUsername();
	toggleAdminLink();

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

function toggleAdminLink() {
            const adminLink = document.getElementById('adminLink');
            if (adminLink && sessionData.is_admin) {
                adminLink.style.display = 'list-item'; // Matches <li> display
            }
        }

function setupEventListeners() {
    const refreshBtn = document.getElementById('refreshBtn');
    const departmentFilter = document.getElementById('departmentFilter');
    const statusFilter = document.getElementById('statusFilter');

    refreshBtn.addEventListener('click', async () => {
        await dataManager.loadProjects();
        updateDashboard();
    });

    departmentFilter.addEventListener('change', updateDashboard);
    statusFilter.addEventListener('change', updateDashboard);
}

function updateDashboard() {
    const projects = getFilteredProjects();
    console.log('Filtered projects:', projects.length, projects);
    
    updateMetrics(projects);
    updateCharts(projects);
    updateDepartmentSummary(projects);
}

function getFilteredProjects() {
    const selectedDepartment = document.getElementById('departmentFilter').value;
    const selectedStatus = document.getElementById('statusFilter').value;

    return dataManager.getAllProjects().filter(project => {
        const matchesDepartment = !selectedDepartment || project['Department'] === selectedDepartment;
        const matchesStatus = !selectedStatus || project['Status'] === selectedStatus;
        return matchesDepartment && matchesStatus;
    });
}

function updateMetrics(projects) {
    const totalPOValue = projects.reduce((sum, p) => sum + (Number(p['PO Value']) || 0), 0);
    const totalYTD = projects.reduce((sum, p) => sum + (Number(p['YTD Utilization']) || 0), 0);
    const totalBalance = projects.reduce((sum, p) => sum + (Number(p['Balance']) || 0), 0);
    const totalYEP = projects.reduce((sum, p) => sum + (Number(p['Total YEP']) || 0), 0);

    document.getElementById('totalPOValue').textContent = formatCurrency(totalPOValue);
    document.getElementById('totalYTD').textContent = formatCurrency(totalYTD);
    document.getElementById('totalBalance').textContent = formatCurrency(totalBalance);
    document.getElementById('totalYEP').textContent = formatCurrency(totalYEP);
}

function updateCharts(projects) {
    const departmentCounts = {};
    const statusCounts = {};

    projects.forEach(project => {
        departmentCounts[project['Department']] = (departmentCounts[project['Department']] || 0) + 1;
        statusCounts[project['Status']] = (statusCounts[project['Status']] || 0) + 1;
    });

    // Destroy existing charts to prevent overlap
    if (departmentChart) departmentChart.destroy();
    if (statusChart) statusChart.destroy();

    // Professional Department Chart (Bar)
    departmentChart = new Chart(document.getElementById('departmentChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: Object.keys(departmentCounts),
            datasets: [{
                label: 'Projects by Department',
                data: Object.values(departmentCounts),
                backgroundColor: '#0288D1', // Professional blue
                borderColor: '#01579B',
                borderWidth: 1,
                hoverBackgroundColor: '#03A9F4',
                hoverBorderColor: '#0277BD'
            }]
        },plugins: [ChartDataLabels],
        options: {
			layout: {
				padding: {
				top: 30 // Add space at the top for labels
				}
			},
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { 
                        display: true, 
                        text: 'Number of Projects', 
                        font: { size: 14, family: 'Arial', weight: 'bold' },
                        color: '#333'
                    },
                    grid: { color: '#e0e0e0', lineWidth: 1 },
                    ticks: { 
                        font: { size: 12, family: 'Arial' }, 
                        color: '#666',
                        stepSize: 1 // Ensure whole numbers
                    }
                },
                x: {
                    title: { 
                        display: false, 
                        text: 'Department', 
                        font: { size: 14, family: 'Arial', weight: 'bold' },
                        color: '#333'
                    },
                    ticks: { 
                        font: { size: 12, family: 'Arial' }, 
                        color: '#666',
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: { display: false } // Cleaner look
                }
            },
            plugins: {
                legend: { 
                    display: false // Single dataset, no need for legend
                },
                tooltip: { 
                    enabled: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: { size: 14, family: 'Arial' },
                    bodyFont: { size: 12, family: 'Arial' },
                    padding: 10,
                    cornerRadius: 4
                },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
					offset: 5,
                    color: '#333',
                    font: { size: 12, family: 'Arial', weight: 'bold' },
                    formatter: value => value,
                    padding: 4
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });

    // Professional Status Chart (Pie)
    statusChart = new Chart(document.getElementById('statusChart').getContext('2d'), {
        type: 'pie',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                label: 'Projects by Status',
                data: Object.values(statusCounts),
                backgroundColor: [
					'#88B04B', // Muted Green 
					'#A0A4A8', // Muted Gray 
					'#7FBCD2', // Soft Blue 
					'#D4A373'  // Muted Amber 
                ],
                borderColor: '#fff',
                borderWidth: 2,
                hoverOffset: 15
            }]
        },plugins: [ChartDataLabels],
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    position: 'right',
                    labels: { 
                        font: { size: 12, family: 'Arial' }, 
                        color: '#333',
                        boxWidth: 20,
                        padding: 15
                    }
                },
                tooltip: { 
                    enabled: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: { size: 14, family: 'Arial' },
                    bodyFont: { size: 12, family: 'Arial' },
                    padding: 10,
                    cornerRadius: 4,
                    callbacks: {
                        label: context => {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${value} (${percentage}%)`;
                        }
                    }
                },
                datalabels: {
                    color: '#fff',
                    font: { size: 12, family: 'Arial', weight: 'bold' },
                    formatter: (value, context) => {
                        const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${value}\n(${percentage}%)`; // Value and % on new lines
                    },
                    textAlign: 'center',
                    padding: 4
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            cutout: '20%' // Slight donut effect for modern look
        }
    });
}

function updateDepartmentSummary(projects) {
    const tbody = document.querySelector('#departmentSummaryTable tbody');
    const departmentSummary = {};

    projects.forEach(project => {
        const dept = project['Department'] || 'Unknown';
        if (!departmentSummary[dept]) {
            departmentSummary[dept] = {
                po_value: 0,
                ytd_utilization: 0,
                balance: 0,
                total_yep: 0,
                active: 0
            };
        }
        departmentSummary[dept].po_value += Number(project['PO Value']) || 0;
        departmentSummary[dept].ytd_utilization += Number(project['YTD Utilization']) || 0;
        departmentSummary[dept].balance += Number(project['Balance']) || 0;
        departmentSummary[dept].total_yep += Number(project['Total YEP']) || 0;
        if (project['Status'] !== 'Completed') {
            departmentSummary[dept].active += 1;
        }
    });

    tbody.innerHTML = '';
    Object.entries(departmentSummary).forEach(([dept, stats]) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${dept}</td>
            <td>${formatCurrency(stats.po_value)}</td>
            <td>${formatCurrency(stats.ytd_utilization)}</td>
            <td>${formatCurrency(stats.balance)}</td>
            <td>${formatCurrency(stats.total_yep)}</td>
            <td>${stats.active}</td>
        `;
    });
    console.log('Department summary rows added:', tbody.children.length);
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

document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
});