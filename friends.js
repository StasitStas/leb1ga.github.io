document.addEventListener('DOMContentLoaded', () => {
    const db = firebase.firestore();

    // Функція для отримання значення параметра з URL
    function getParameterByName(name) {
        const url = window.location.href;
        const nameRegex = name.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
        const results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    // Отримання username з URL параметрів
    const username = getParameterByName('username');
    if (!username) {
        console.error('Username не знайдено в URL параметрах');
        return;
    }

    // Функція для отримання referral_link з Firestore
    async function getReferralLink(username) {
        try {
            const docRef = db.collection("users").doc(username);
            const doc = await docRef.get();
            if (doc.exists) {
                return doc.data().referral_link;
            } else {
                console.log("Документ не знайдено!");
                return null;
            }
        } catch (error) {
            console.error("Помилка отримання документа: ", error);
            return null;
        }
    }

    // Приклад виклику функції для відображення referral_link
    async function displayReferralLink() {
        const referralLink = await getReferralLink(username);
        if (referralLink) {
            const container = document.getElementById('container-friends');
            const linkElement = document.createElement('a');
            linkElement.href = referralLink;
            linkElement.textContent = "Ваше реферальне посилання";
            linkElement.classList.add('referral-link'); // Додамо клас для стилізації
            container.appendChild(linkElement);
        }
    }

    // Виклик функції при завантаженні сторінки
    displayReferralLink();
});
