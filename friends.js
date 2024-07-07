document.addEventListener('DOMContentLoaded', function () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const username = urlParams.get('username');
    const refKey = urlParams.get('ref');

    const container = document.getElementById('container-friends');
    if (username && refKey) {
        const referralLink = document.createElement('div');
        referralLink.classList.add('referral-link');
        referralLink.textContent = `${window.location.origin}?ref=${refKey}`;
        referralLink.addEventListener('click', function () {
            navigator.clipboard.writeText(referralLink.textContent).then(() => {
                alert('Посилання скопійовано');
            });
        });
        container.appendChild(referralLink);
    }

    if (refKey) {
        // Перевірка чи користувач вже існує та оновлення бази даних
        checkAndAddReferral(refKey, username);
    }
});

function checkAndAddReferral(refKey, username) {
    fetch('https://<your-cloud-function-url>', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refKey, username })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Referral added successfully');
        } else {
            console.log('Referral already exists or error occurred');
        }
    })
    .catch(error => console.error('Error:', error));
}
