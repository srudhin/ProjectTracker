// File Manager for handling local file operations

function saveToFile() {
  const data = localStorage.getItem('projectData');
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'project_data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function loadFromFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => { 
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem('projectData', reader.result);
      window.location.reload();
    };
    reader.readAsText(file);
  };
  input.click();
}
