let username = '';
let firstName = '';
let clickCount = 0;
// Функція для отримання та відображення рефералів
function displayReferrals() {
    const container = document.getElementById('container-friends');
    db.collection('users').doc(currentUser).get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            if (data.referrals && data.referrals.length > 0) {
                data.referrals.forEach((referral) => {
                    const referralElement = document.createElement('div');
                    referralElement.classList.add('referral');
                    referralElement.textContent = referral;
                    container.appendChild(referralElement);
                });
            } else {
                container.textContent = 'Немає рефералів.';
            }
        } else {
            container.textContent = 'Користувача не знайдено.';
        }
    }).catch((error) => {
        console.error("Помилка отримання рефералів: ", error);
    });
}

// Виклик функції для відображення рефералів
displayReferrals();
