class DataManager {
    constructor() {
        this.projects = [];
        this.departmentList = [
            'Marketing & Operations - HO',
            'Terminal - Haldia',
            'Terminal - Ennore',
            'Retail/ALDS - HO',
            'HR',
            'IT',
            'Finance',
            'Others'
        ];
        this.statusList = ['Planned', 'In Progress', 'Completed', 'On Hold'];
        
        // Load saved data from localStorage first
        this.loadFromLocalStorage();
    }

    loadFromLocalStorage() {
        try {
            const savedProjects = localStorage.getItem('projects');
            if (savedProjects) {
                this.projects = JSON.parse(savedProjects);
                console.log('Loaded projects from localStorage:', this.projects);
            } else {
                console.log('No saved projects found in localStorage');
            }
        } catch (error) {
            console.error('Error loading projects from localStorage:', error);
            this.projects = [];
        }
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('projects', JSON.stringify(this.projects));
            console.log('Saved projects to localStorage:', this.projects);
        } catch (error) {
            console.error('Error saving projects to localStorage:', error);
        }
    }

    saveToFile() {
        try {
            const data = JSON.stringify({ projects: this.projects }, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // Add timestamp to filename
            const now = new Date();
            const timestamp = now.toISOString().replace(/[:.]/g, '-');
            const filename = `projects_${timestamp}.json`;
            
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('Data saved successfully');
            return true;
        } catch (error) {
            console.error('Error saving to file:', error);
            return false;
        }
    }

    addProject(project) {
        // Generate unique ID if not provided
        if (!project.id) {
            project.id = `project-${this.projects.length + 1}`;
        }
        this.projects.push(project);
        this.saveToLocalStorage();
    }

    updateProject(index, project) {
        if (index >= 0 && index < this.projects.length) {
            this.projects[index] = project;
            this.saveToLocalStorage();
        }
    }

    deleteProject(index) {
        if (index >= 0 && index < this.projects.length) {
            this.projects.splice(index, 1);
            this.saveToLocalStorage();
        }
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
        
        // Initialize counts for all departments
        this.departmentList.forEach(dept => {
            counts[dept] = 0;
        });

        // Count projects for each department
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
        
        // Initialize counts for all statuses
        this.statusList.forEach(status => {
            counts[status] = 0;
        });

        // Count projects for each status
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

        // Initialize summary for all departments
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

        // Calculate balance for each department
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

        // Calculate total balance
        stats.totalBalance = stats.totalPOValue - stats.totalYTD;

        console.log('Financial stats:', stats);
        return stats;
    }

    clearAllData() {
        this.projects = [];
        localStorage.removeItem('projects');
        console.log('All data cleared');
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
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    
                    // Validate and process the data
                    this.projects = jsonData.map(row => {
                        // Ensure all required fields exist
                        return {
                            'Department': row['Department'] || '',
                            'Project Title': row['Project Title'] || '',
                            'Description': row['Description'] || '',
                            'Focal In-Charge': row['Focal In-Charge'] || '',
                            'Vendor Name': row['Vendor Name'] || '',
                            'WO Issuance Date': row['WO Issuance Date'] || '',
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
                            'Balance': Number(row['Balance']) || 0,
                            'Total YEP': Number(row['Total YEP']) || 0,
                            'Remarks': row['Remarks'] || ''
                        };
                    });
                    
                    this.saveToLocalStorage();
                    console.log('Imported projects:', this.projects);
                    resolve();
                } catch (error) {
                    console.error('Error importing Excel:', error);
                    reject(error);
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });
    }

    async loadFromFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        document.body.appendChild(input);
        
        return new Promise((resolve, reject) => {
            input.onchange = async (e) => {
                const file = e.target.files[0];
                document.body.removeChild(input);
                
                if (!file) {
                    reject('No file selected');
                    return;
                }
                
                try {
                    const fileData = await file.text();
                    const parsedData = JSON.parse(fileData);
                    
                    if (parsedData && parsedData.projects) {
                        this.projects = parsedData.projects;
                        this.saveToLocalStorage();
                        resolve(true);
                    } else {
                        reject('Invalid file format');
                    }
                } catch (error) {
                    console.error('Error loading file:', error);
                    reject('Error loading file');
                }
            };
            
            input.click();
        });
    }

    exportToExcel() {
        const ws = XLSX.utils.json_to_sheet(this.projects);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Projects');
        XLSX.writeFile(wb, 'projects.xlsx');
    }

    // Get project by ID
    getProjectById(id) {
        console.group('Looking for project with ID:', id);
        console.log('All projects:', this.projects);
        const foundProject = this.projects.find(project => {
            if (project.id === id || project['Project ID'] === id) {
                return true;
            }
            if (id.startsWith('project-')) {
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
