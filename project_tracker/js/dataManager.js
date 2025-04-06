class DataManager {
    constructor() {
        this.baseUrl = 'http://localhost/project_tracker/api/'; // Relative path
        this.departmentList = [
            'Marketing & Operations - HO', 'Terminal - Haldia', 'Terminal - Ennore',
            'Retail/ALDS - HO', 'IT', 'Finance', 'HR', 'Others'
        ];
        this.statusList = ['Planned', 'In Progress', 'Completed', 'On Hold'];
        this.projects = [];
    }

    async checkSession() {
        try {
            const response = await fetch(`${this.baseUrl}check_session.php`);
            if (!response.ok) {
                const text = await response.text();
                console.error('Check session failed:', response.status, text);
                throw new Error(`Session check failed: ${response.status}`);
            }
            const result = await response.json();
            if (!result.success) {
                window.location.href = 'login.html';
                throw new Error('Not logged in');
            }
            return result;
        } catch (error) {
            console.error('Error in checkSession:', error);
            throw error;
        }
    }
	

    async loadProjects() {
        await this.checkSession();
        try {
            const response = await fetch(`${this.baseUrl}get_projects.php`);
            if (!response.ok) {
                const text = await response.text();
                console.error('Load projects failed:', response.status, text);
                throw new Error(`Failed to fetch projects: ${response.status}`);
            }
            this.projects = await response.json();
            console.log('Loaded projects from DB:', this.projects.length, this.projects);
            return this.projects;
        } catch (error) {
            console.error('Error loading projects:', error);
            return [];
        }
    }


    async addProject(projectData) {
        const response = await fetch(`${this.baseUrl}save_project.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        });
        const result = await response.json();
        if (result.success) {
            projectData.id = result.id;
            this.projects.push(projectData);
            console.log('Added project ID:', result.id);
        } else {
            console.error('Failed to add project:', projectData['Project Title'], 'Server response:', result);
        }
        return result.success;
    }

    async updateProject(index, projectData) {
        projectData.id = this.projects[index].id;
        const response = await fetch(`${this.baseUrl}save_project.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        });
        const result = await response.json();
        if (result.success) {
            this.projects[index] = projectData;
        }
        return result.success;
    }

    async deleteProject(index) {
        const id = this.projects[index].id;
        const response = await fetch(`${this.baseUrl}delete_project.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const result = await response.json();
        if (result.success) {
            this.projects.splice(index, 1);
        }
        return result.success;
    }

    getAllProjects() {
        return this.projects;
    }

    getFilteredProjects() {
        const departmentFilter = document.getElementById('departmentFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        console.log('Filtering projects:', { departmentFilter, statusFilter });
        return this.projects.filter(project => {
            const matchesDepartment = !departmentFilter || project['Department'] === departmentFilter;
            const matchesStatus = !statusFilter || project['Status'] === statusFilter;
            return matchesDepartment && matchesStatus;
        });
    }

    getProjectsByDepartment() {
        const counts = {};
        const filteredProjects = this.getFilteredProjects();
        this.departmentList.forEach(dept => {
            counts[dept] = 0;
        });
        filteredProjects.forEach(project => {
            if (project['Department'] && counts.hasOwnProperty(project['Department'])) {
                counts[project['Department']]++;
            }
        });
        console.log('Department counts:', counts);
        return counts;
    }

    getProjectsByStatus() {
        const counts = {};
        const filteredProjects = this.getFilteredProjects();
        this.statusList.forEach(status => {
            counts[status] = 0;
        });
        filteredProjects.forEach(project => {
            if (project['Status'] && counts.hasOwnProperty(project['Status'])) {
                counts[project['Status']]++;
            }
        });
        console.log('Status counts:', counts);
        return counts;
    }

    getDepartmentSummary() {
        const summary = {};
        const filteredProjects = this.getFilteredProjects();
        this.departmentList.forEach(dept => {
            summary[dept] = {
                totalPOValue: 0,
                ytdUtilization: 0,
                balance: 0,
                yep: 0,
                activeProjects: 0
            };
        });
        filteredProjects.forEach(project => {
            const dept = project['Department'];
            if (dept && summary.hasOwnProperty(dept)) {
                summary[dept].totalPOValue += Number(project['PO Value']) || 0;
                summary[dept].ytdUtilization += Number(project['YTD Utilization']) || 0;
                summary[dept].yep += Number(project['Total YEP']) || 0;
                if (project['Status'] === 'In Progress') {
                    summary[dept].activeProjects++;
                }
            }
        });
        Object.keys(summary).forEach(dept => {
            summary[dept].balance = summary[dept].totalPOValue - summary[dept].ytdUtilization;
        });
        console.log('Department summary:', summary);
        return summary;
    }

    getFinancialStats() {
        const stats = {
            totalPOValue: 0,
            totalYTD: 0,
            totalBalance: 0,
            totalYEP: 0
        };
        const filteredProjects = this.getFilteredProjects();
        filteredProjects.forEach(project => {
            stats.totalPOValue += Number(project['PO Value']) || 0;
            stats.totalYTD += Number(project['YTD Utilization']) || 0;
            stats.totalYEP += Number(project['Total YEP']) || 0;
        });
        stats.totalBalance = stats.totalPOValue - stats.totalYTD;
        console.log('Financial stats:', stats);
        return stats;
    }

    clearAllData() {
        this.projects = [];
        console.log('All data cleared (local only; DB not affected)');
    }

    downloadTemplate() {
        const template = [{
            'Department': '',
            'Project Title': '',
            'Description': '',
            'Focal In-Charge': '',
            'Vendor Name': '',
            'WO Issuance Date': '',
            'Status': '',
            'Timeline': '',
            'Revised Timeline': '',
            'Dependencies/Risks': '',
            'Key Deliverables': '',
            'Milestones Achieved': '',
            'Budget': '',
            'PO Value': '',
            'Budget Utilization (%)': '',
            'YTD Utilization': '',
            'Projected Next Qtr Utilization': '',
            'Balance': '',
            'Total YEP': '',
            'Remarks': ''
        }];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, 'project_template.xlsx');
    }

    async importFromExcel(file) {
        return new Promise(async (resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
                    console.log('Parsed rows from Excel:', jsonData.length, jsonData);

                    let successCount = 0;
                    for (const row of jsonData) {
                        let woDate = row['WO Issuance Date'] || '';
                        if (woDate && typeof woDate === 'string') {
                            const parts = woDate.split('/');
                            if (parts.length === 3) {
                                const [month, day, year] = parts;
                                const fullYear = year.length === 2 ? `20${year}` : year;
                                woDate = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                            } else {
                                woDate = null;
                            }
                        } else if (!woDate) {
                            woDate = null;
                        }

                        const projectData = {
                            'Department': row['Department'] || '',
                            'Project Title': row['Project Title'] || '',
                            'Description': row['Description'] || '',
                            'Focal In-Charge': row['Focal In-Charge'] || '',
                            'Vendor Name': row['Vendor Name'] || '',
                            'WO Issuance Date': woDate,
                            'Status': row['Status'] || '',
                            'Timeline': row['Timeline'] || '',
                            'Revised Timeline': row['Revised Timeline'] || '',
                            'Dependencies/Risks': row['Dependencies/Risks'] || '',
                            'Key Deliverables': row['Key Deliverables'] || '',
                            'Milestones Achieved': row['Milestones Achieved'] || '',
                            'Budget': Number(row['Budget']) || 0,
                            'PO Value': Number(row['PO Value']) || 0,
                            'Budget Utilization (%)': Number(row['Budget Utilization (%)']) || 0,
                            'YTD Utilization': Number(row['YTD Utilization']) || 0,
                            'Projected Next Qtr Utilization': Number(row['Projected Next Qtr Utilization']) || 0,
                            'Balance': Number(row['Balance']) || 0,
                            'Total YEP': Number(row['Total YEP']) || 0,
                            'Remarks': row['Remarks'] || ''
                        };
                        console.log('Attempting to add project:', projectData['Project Title'], 'WO Date:', projectData['WO Issuance Date']);
                        const success = await this.addProject(projectData);
                        if (success) {
                            successCount++;
                        } else {
                            console.warn('Skipped project due to failure:', projectData['Project Title']);
                        }
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                    await this.loadProjects();
                    console.log(`Successfully imported ${successCount} out of ${jsonData.length} projects`);
                    console.log('Current projects:', this.projects);
                    resolve(true);
                } catch (error) {
                    console.error('Error importing Excel:', error);
                    reject(error);
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });
    }

    exportToExcel() {
        const ws = XLSX.utils.json_to_sheet(this.projects);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Projects');
        XLSX.writeFile(wb, `projects_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`);
    }

    getProjectById(id) {
        console.group('Looking for project with ID:', id);
        console.log('All projects:', this.projects);
        const foundProject = this.projects.find(project => {
            if (project.id === id || project['Project ID'] === id) {
                return true;
            }
            if (typeof id === 'string' && id.startsWith('project-')) {
                const numericId = id.replace('project-', '');
                return project.id === numericId || project['Project ID'] === numericId;
            }
            return false;
        });
        console.log('Found project:', foundProject);
        console.groupEnd();
        return foundProject;
    }


}

// Global logout listener
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    const baseUrl = 'http://localhost/project_tracker/api/'; // Define baseUrl outside class
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault(); // Prevent default <a> behavior
            await fetch(`${baseUrl}logout.php`);
            window.location.href = 'login.html';
        });
    } else {
        console.warn('Logout button not found in the DOM');
    }
});