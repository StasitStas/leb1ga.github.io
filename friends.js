document.addEventListener('DOMContentLoaded', function() {
    const referralsContainer = document.getElementById('referrals-container');
    const linkContainer = document.getElementById('link-container');
    const copyIcon = document.querySelector('.copy-icon');
    const shareButton = document.getElementById('shareButton');
    let username = '';
    let referralLink = '';

    function getUsernameFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('username');
    }

    function getUserData(username) {
        return db.collection("users").doc(username).get().then(doc => {
            if (doc.exists) {
                return doc.data();
            } else {
                throw new Error('Документ не знайдено');
            }
        });
    }

    function initialize() {
        username = getUsernameFromUrl();
        if (username) {
            getUserData(username).then(userData => {
                referralLink = userData.referal_link;
                displayReferrals(userData.referrals);
                displayCopyIcon();
            }).catch(error => {
                console.error("Error getting user data:", error);
                alert('Помилка: Не вдалося отримати дані користувача.');
            });
        } else {
            alert('Помилка: Ім\'я користувача не вказане.');
        }
    }

    function displayReferrals(referrals) {
        if (referrals && referrals.length > 0) {
            referrals.forEach(referral => {
                const referralItem = document.createElement('div');
                referralItem.className = 'referral-item';
                referralItem.textContent = referral;
                referralsContainer.appendChild(referralItem);
            });
        } else {
            referralsContainer.textContent = 'У вас поки відсутні реферали';
        }
    }

    function displayCopyIcon() {
        copyIcon.addEventListener('click', () => {
            copyToClipboard(referralLink);
        });

        shareButton.addEventListener('click', () => {
            shareLink();
        });
    }

    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Посилання скопійовано');
    }

    function shareLink() {
        const message = `🔥 +2000 монет, якщо ти зареєструєшся по моєму посиланню!\n${referralLink}`;
        const url = `https://t.me/share/url?url=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }

    initialize();
});
