document.addEventListener("DOMContentLoaded", function() {
    // Отримання реферального посилання з Firebase
    fetchReferralLink();

    // Функція для копіювання реферального посилання
    window.copyReferralLink = function() {
        const referralLink = document.getElementById('referralLink').innerText;
        navigator.clipboard.writeText(referralLink).then(function() {
            alert('Referral link copied to clipboard!');
        }, function(err) {
            console.error('Could not copy text: ', err);
        });
    };
});

function fetchReferralLink() {
    // Отримання username з URL
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');

    if (username) {
        // Запит до Firebase для отримання реферального посилання
        fetch(`https://firestore.googleapis.com/v1/projects/YOUR_PROJECT_ID/databases/(default)/documents/users/${username}`)
            .then(response => response.json())
            .then(data => {
                const referralLink = data.fields.referral_link.stringValue;
                document.getElementById('referralLink').innerText = referralLink;
            })
            .catch(error => console.error('Error fetching referral link:', error));
    }
}
