document.addEventListener('DOMContentLoaded', () => {
    const db = firebase.firestore();

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
        const username = "USERNAME"; // Замініть на потрібний username
        const referralLink = await getReferralLink(username);
        if (referralLink) {
            const container = document.getElementById('container-friends');
            const linkElement = document.createElement('a');
            linkElement.href = referralLink;
            linkElement.textContent = "Ваше реферальне посилання";
            container.appendChild(linkElement);
        }
    }

    // Виклик функції при завантаженні сторінки
    displayReferralLink();
});
