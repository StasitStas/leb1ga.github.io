document.addEventListener('DOMContentLoaded', function() {
    const leaderboardList = document.getElementById('leaderboardList');
    const navButtons = document.querySelectorAll('.nav-button');

    let username = '';
    let firstName = '';

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
                firstName = userData.first_name;
                updateLeaderboard(); // Оновити рейтинг при завантаженні
            }).catch(error => {
                console.error("Error getting user data:", error);
                alert('Помилка: Не вдалося отримати дані користувача.');
            });
        } else {
            alert('Помилка: Ім\'я користувача не вказане.');
        }
    }

    function updateLeaderboard() {
        db.collection("clicks").orderBy("clickCount", "desc").limit(5).get().then(querySnapshot => {
            leaderboardList.innerHTML = '';
            let index = 0;
            querySnapshot.forEach(doc => {
                const userId = doc.id;
                const clickCount = doc.data().clickCount;
                db.collection("users").doc(userId).get().then(userDoc => {
                    if (userDoc.exists) {
                        const userFirstName = userDoc.data().first_name;
                        index++;
                        const listItem = document.createElement('li');
                        listItem.textContent = `${index}. ${userFirstName}: ${clickCount}`;
                        leaderboardList.appendChild(listItem);
                    } else {
                        console.error("Error getting user document for leaderboard: User document not found");
                    }
                }).catch(error => {
                    console.error("Error getting user document for leaderboard:", error);
                });
            });
        }).catch(error => {
            console.error("Помилка отримання документів: ", error);
        });
    }

    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    initialize();
});
