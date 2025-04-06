// Enhanced Dropdown Functionality
const dropdowns = document.querySelectorAll('.dropdown');

dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    const menu = dropdown.querySelector('.dropdown-menu');
    let timeout;

    // Show menu on hover
    dropdown.addEventListener('mouseenter', () => {
        clearTimeout(timeout);
        menu.classList.add('show');
    });

    // Hide menu with delay
    dropdown.addEventListener('mouseleave', () => {
        timeout = setTimeout(() => {
            menu.classList.remove('show');
        }, 200); // 200ms delay
    });

    // Cancel hide if mouse enters menu
    menu.addEventListener('mouseenter', () => {
        clearTimeout(timeout);
    });

    // Maintain click functionality for touch devices
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
    });

    // Close menu when clicking outside
    document.addEventListener('click', () => {
        menu.classList.remove('show');
    });
});
