document.addEventListener('DOMContentLoaded', async function() {
    const referralsContainer = document.getElementById('referrals-container');

    let username = '';
    let firstName = '';
    let clickCount = 0;
    
    function displayReferrals(referrals) {
        referralsContainer.innerHTML = '';
    
        referrals.forEach(referral => {
            const referralItem = document.createElement('div');
            referralItem.classList.add('referral-item');
            referralItem.textContent = referral.username;
            referralsContainer.appendChild(referralItem);
        });
    }
    
    async function getReferrals(username) {
        try {
            const referralsSnapshot = await db.collection("referrals")
                .where("referrer", "==", username)
                .get();
    
            const referrals = [];
            referralsSnapshot.forEach(doc => {
                referrals.push(doc.data());
            });

            console.log('Referrals:', referrals); // Додано логування
            return referrals;
        } catch (error) {
            console.error("Error getting referrals:", error);
            return [];
        }
    }
    
    async function initialize() {
        username = getUsernameFromUrl();
        if (username) {
            try {
                const userData = await getUserData(username);
                console.log('User Data:', userData); // Додано логування
                const clickData = await getUserClicks(username);
                console.log('Click Data:', clickData); // Додано логування
                const referrals = await getReferrals(username);
    
                firstName = userData.first_name;
                clickCount = clickData.clickCount || 0;
                displayUserSkins(userData.skins || {});
                displayReferrals(referrals);
    
                db.collection("users").doc(username).onSnapshot(doc => {
                    if (doc.exists) {
                        const userData = doc.data();
                        displayUserSkins(userData.skins || {});
                    }
                });
    
            } catch (error) {
                console.error("Error getting user data:", error);
                alert('Помилка: Не вдалося отримати дані користувача.');
            }
        } else {
            alert('Помилка: Ім\'я користувача не вказане.');
        }
    }

    await initialize(); // Додано очікування ініціалізації
});
