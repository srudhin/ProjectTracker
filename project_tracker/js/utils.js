// js/utils.js
function showMessage(message) {
    const modal = document.getElementById('customModal');
    const modalMessage = document.getElementById('modalMessage');
    const closeBtn = document.getElementById('modalCloseBtn');
    const yesBtn = document.getElementById('modalYesBtn');
    const noBtn = document.getElementById('modalNoBtn');

    modalMessage.textContent = message;
    closeBtn.style.display = 'inline-block';
    yesBtn.style.display = 'none';
    noBtn.style.display = 'none';
    modal.style.display = 'flex';

    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
}

function showConfirm(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('customModal');
        const modalMessage = document.getElementById('modalMessage');
        const closeBtn = document.getElementById('modalCloseBtn');
        const yesBtn = document.getElementById('modalYesBtn');
        const noBtn = document.getElementById('modalNoBtn');

        modalMessage.textContent = message;
        closeBtn.style.display = 'none';
        yesBtn.style.display = 'inline-block';
        noBtn.style.display = 'inline-block';
        modal.style.display = 'flex';

        yesBtn.onclick = () => {
            modal.style.display = 'none';
            resolve(true);
        };

        noBtn.onclick = () => {
            modal.style.display = 'none';
            resolve(false);
        };

        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                resolve(false); // Treat outside click as "No"
            }
        };
    });
}