document.addEventListener('DOMContentLoaded', function () {
    const containerFriends = document.querySelector('.container-friends');
    const db = firebase.firestore();

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            const username = user.displayName;
            const userRef = db.collection('users').doc(username);

            userRef.get().then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    if (data.referral_link) {
                        const referralLink = document.createElement('div');
                        referralLink.innerHTML = `
                            <p>Ваше реферальне посилання:</p>
                            <input type="text" value="${data.referral_link}" id="referralLink" readonly>
                            <button onclick="copyReferralLink()">Копіювати посилання</button>
                        `;
                        containerFriends.appendChild(referralLink);
                    }
                }
            });

            const referralsRef = db.collection('Ref').doc(username).collection('referrals');
            referralsRef.get().then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    const referralData = doc.data();
                    const referralDiv = document.createElement('div');
                    referralDiv.innerText = `Реферал: ${referralData.username}`;
                    containerFriends.appendChild(referralDiv);
                });
            });
        }
    });
});

function copyReferralLink() {
    const referralLink = document.getElementById('referralLink');
    referralLink.select();
    document.execCommand('copy');
    alert('Посилання скопійовано');
}
