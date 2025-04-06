# Project Tracking Dashboard

A standalone HTML-based dashboard for project tracking that uses Excel files as a data source. This dashboard allows you to manage projects, track their progress, and visualize project data through charts and tables.

## Features

- **Dashboard View**: Shows project statistics, status distribution charts, and recent projects
- **Data Entry**: Add or edit project information through a user-friendly form
- **Data View**: View all projects in a table format with filtering and search capabilities
- **Excel Integration**: Import and export project data using Excel files
- **No Server Required**: Works directly from your browser without any server setup

## How to Use

1. **Opening the Dashboard**
   - Extract all files to a folder on your computer
   - Double-click on `index.html` to open the dashboard in your default web browser

2. **Navigation**
   - **Dashboard**: View project statistics and charts
   - **New Entry**: Add new projects or edit existing ones
   - **View Data**: See all projects and perform data operations

3. **Managing Data**
   - **Import Data**: Click "Import Excel" to load project data from an Excel file
   - **Export Data**: Click "Export Excel" to save your project data to an Excel file
   - **Add Project**: Use the New Entry page to add projects
   - **Edit/Delete**: Use the Data View page to modify or remove projects

4. **Data Storage**
   - Project data is stored in your browser's local storage
   - Use the Export feature regularly to backup your data
   - Import previously exported Excel files to restore data

## File Structure

```
project-tracker-dashboard/
├── index.html          # Dashboard page
├── entry.html          # New entry/edit page
├── data.html          # Data view page
├── css/
│   └── styles.css     # Styling for all pages
├── js/
│   ├── dataManager.js # Data handling logic
│   ├── dashboard.js   # Dashboard page logic
│   ├── entry.js       # Entry page logic
│   └── data.js        # Data view page logic
└── README.md          # This documentation
```

## Browser Compatibility

This dashboard works best with modern browsers such as:
- Google Chrome (recommended)
- Mozilla Firefox
- Microsoft Edge
- Safari

## Notes

- The dashboard uses your browser's local storage to save data
- Regular data exports are recommended for backup purposes
- Excel files used for import should match the expected format
