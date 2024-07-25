document.addEventListener('DOMContentLoaded', function() {
    const referralsContainer = document.getElementById('referrals-container');
    const linkContainer = document.getElementById('link-container');
    let username = '';

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
                displayReferrals(userData.referrals);
                displayShareButton(userData.referal_link);
                displayCopyIcon(userData.referal_link);
            }).catch(error => {
                console.error("Error getting user data:", error);
                alert('Помилка: Не вдалося отримати дані користувача.');
            });
        } else {
            alert('Помилка: Ім\'я користувача не вказане.');
        }
    }

    function displayReferrals(referrals) {
        referralsContainer.innerHTML = '';
        if (referrals && referrals.length > 0) {
            referrals.forEach(referral => {
                const referralItem = document.createElement('div');
                referralItem.className = 'referral-item';
                
                // Припускаємо, що referral є об'єктом з полями name та coins
                const referralName = document.createElement('span');
                referralName.textContent = referral.name; // Виводимо ім'я реферала
                
                const coins = document.createElement('span');
                coins.className = 'coins';
                coins.textContent = `+15 000 💸`; // Виводимо кількість монет
                
                referralItem.appendChild(referralName);
                referralItem.appendChild(coins);

                referralsContainer.appendChild(referralItem);
            });
        } else {
            referralsContainer.textContent = 'У вас поки відсутні реферали';
        }
    }

    function displayCopyIcon(referralLink) {
        const copyIcon = document.createElement('i');
        copyIcon.className = 'la la-copy copy-icon'; // Line Awesome copy icon class
        copyIcon.addEventListener('click', () => {
            copyToClipboard(referralLink);
        });

        linkContainer.appendChild(copyIcon);
    }

    function displayShareButton(referralLink) {
        const shareButton = document.createElement('button');
        shareButton.className = 'share-button';
        shareButton.textContent = 'Поділитись з другом!';
        shareButton.addEventListener('click', () => {
            shareReferral(referralLink);
        });

        // Додаємо кнопку на початок контейнера
        linkContainer.insertBefore(shareButton, linkContainer.firstChild);
    }

    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        // Не виводимо повідомлення про успішне копіювання
    }

    function shareReferral(referralLink) {
        const shareText = `🔥 +2000 монет, якщо ти зареєструєшся по моєму посиланню!\n${referralLink}`;
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareText)}`;
        window.open(shareUrl, '_blank');
    }

    initialize();
});
