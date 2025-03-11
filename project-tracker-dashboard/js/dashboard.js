// Register Chart.js plugin
Chart.register(ChartDataLabels);

// Modern color palette for charts
const chartColors = {
    department: [
        '#647C90', // muted blue
        '#8E9D7D', // sage green
        '#977E6C', // warm taupe
        '#A68A7B', // dusty rose
        '#7C7F9A', // dusty purple
        '#6C8C9C', // steel blue
        '#8B8778', // warm gray
        '#9A8A7B'  // soft brown
    ],
    status: {
        'Planned': '#8E9D7D',    // sage green
        'In Progress': '#647C90', // muted blue
        'Completed': '#7C7F9A',   // dusty purple
        'On Hold': '#977E6C'      // warm taupe
    }
};

// Default chart options
const defaultChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
        padding: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
        }
    },
    plugins: {
        legend: {
            position: 'bottom',
            display: true // Disable the legend
        },
        datalabels: {
            color: '#fff',
            font: {
                weight: 'bold',
                size: 14
            },
            formatter: (value, context) => {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                if (total === 0) return '0%';
                const percentage = ((value / total) * 100).toFixed(1);
                return `${percentage}%`;
            },
            display: true, // Always show callouts
            callout: {
                display: true,
                font: {
                    weight: 'bold',
                    size: 14
                },
                padding: 5,
                borderRadius: 3,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: '#fff'
            }
        }
    }
};

let departmentChart = null;
let statusChart = null;

// Initialize the dashboard
function initializeDashboard() {
    console.log('Dashboard initializing...');
    
    // Initialize DataManager
    if (!window.dataManager) {
        window.dataManager = new DataManager();
    }
    console.log('DataManager created:', window.dataManager);
    console.log('Projects loaded:', window.dataManager.getAllProjects());

    // Initial update
    console.log('Updating charts and metrics...');
    updateDepartmentChart();
    updateStatusChart();
    updateDepartmentTable();
    updateFinancialMetrics();
    console.log('Initial update complete');

    // Set up refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            console.log('Refresh clicked, updating dashboard...');
            updateDepartmentChart();
            updateStatusChart();
            updateDepartmentTable();
            updateFinancialMetrics();
        });
    }

    // Set up filters
    const departmentFilter = document.getElementById('departmentFilter');
    if (departmentFilter) {
        departmentFilter.addEventListener('change', () => {
            console.log('Department filter changed:', departmentFilter.value);
            updateDepartmentChart();
            updateStatusChart();
            updateDepartmentTable();
            updateFinancialMetrics();
        });
    }

    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            console.log('Status filter changed:', statusFilter.value);
            updateDepartmentChart();
            updateStatusChart();
            updateDepartmentTable();
            updateFinancialMetrics();
        });
    }
}

function updateDepartmentChart() {
    console.log('Updating department chart...');
    const departmentData = window.dataManager.getProjectsByDepartment();
    
    // Filter out departments with zero projects
    const filteredDepartments = Object.keys(departmentData).filter(dept => departmentData[dept] > 0);
    const filteredCounts = filteredDepartments.map(dept => departmentData[dept]);
    
    const ctx = document.getElementById('departmentChart');
    
    if (!ctx) {
        console.error('Department chart canvas not found');
        return;
    }

    if (departmentChart instanceof Chart) {
        departmentChart.destroy();
    }

    departmentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: filteredDepartments,
            datasets: [{
                label: 'Projects by Department',
                data: filteredCounts,
                backgroundColor: [
                    '#4e79a7', '#f28e2b', '#e15759', '#76b7b2',
                    '#59a14f', '#edc948', '#b07aa1', '#ff9da7'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            cutout: '60%',
            layout: {
                padding: 10
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.raw + ' (' + ((context.raw / context.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1) + '%)';
                            return label;
                        }
                    }
                },
                datalabels: {
                    color: '#000',
                    font: {
                        weight: 'bold',
                        size: 12
                    },
                    formatter: (value, ctx) => {
                        const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        return value + ' (' + ((value / total) * 100).toFixed(1) + '%)';
                    }
                }
            }
        }
    });
}

function updateStatusChart() {
    console.log('Updating status chart...');
    const statusData = window.dataManager.getProjectsByStatus();
    
    // Filter out statuses with zero projects
    const filteredStatuses = Object.keys(statusData).filter(status => statusData[status] > 0);
    const filteredCounts = filteredStatuses.map(status => statusData[status]);
    
    const ctx = document.getElementById('statusChart');
    
    if (!ctx) {
        console.error('Status chart canvas not found');
        return;
    }

    if (statusChart instanceof Chart) {
        statusChart.destroy();
    }

    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: filteredStatuses,
            datasets: [{
                label: 'Projects by Status',
                data: filteredCounts,
                backgroundColor: [
                    '#4e79a7', '#f28e2b', '#59a14f', '#e15759'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            cutout: '60%',
            layout: {
                padding: 10
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.raw + ' (' + ((context.raw / context.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1) + '%)';
                            return label;
                        }
                    }
                },
                datalabels: {
                    color: '#000',
                    font: {
                        weight: 'bold',
                        size: 12
                    },
                    formatter: (value, ctx) => {
                        const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        return value + ' (' + ((value / total) * 100).toFixed(1) + '%)';
                    }
                }
            }
        }
    });
}

function updateDepartmentTable() {
    console.log('Updating department table...');
    const departmentSummary = window.dataManager.getDepartmentSummary();
    console.log('Department summary:', departmentSummary);
    
    const tbody = document.querySelector('#departmentSummaryTable tbody');
    if (!tbody) {
        console.error('Department table tbody not found');
        return;
    }

    tbody.innerHTML = '';

    // Sort departments in the same order as departmentList
    const sortedDepartments = window.dataManager.departmentList;
    
    sortedDepartments.forEach(department => {
        const data = departmentSummary[department] || {
            totalPOValue: 0,
            ytdUtilization: 0,
            balance: 0,
            yep: 0,
            activeProjects: 0
        };
        
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${department}</td>
            <td>${formatCurrency(data.totalPOValue)}</td>
            <td>${formatCurrency(data.ytdUtilization)}</td>
            <td>${formatCurrency(data.balance)}</td>
            <td>${formatCurrency(data.yep)}</td>
            <td>${data.activeProjects}</td>
        `;
    });
}

function updateFinancialMetrics() {
    console.log('Updating financial metrics...');
    const stats = window.dataManager.getFinancialStats();
    console.log('Financial stats:', stats);
    
    // Update the metrics with proper formatting
    const elements = {
        totalPOValue: document.getElementById('totalPOValue'),
        totalYTD: document.getElementById('totalYTD'),
        totalBalance: document.getElementById('totalBalance'),
        totalYEP: document.getElementById('totalYEP')
    };

    // Check if elements exist before updating
    if (elements.totalPOValue) elements.totalPOValue.textContent = formatCurrency(stats.totalPOValue);
    if (elements.totalYTD) elements.totalYTD.textContent = formatCurrency(stats.totalYTD);
    if (elements.totalBalance) elements.totalBalance.textContent = formatCurrency(stats.totalBalance);
    if (elements.totalYEP) elements.totalYEP.textContent = formatCurrency(stats.totalYEP);
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

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDashboard);
