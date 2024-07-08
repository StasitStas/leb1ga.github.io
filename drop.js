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
        db.collection("clicks").orderBy("clickCount", "desc").limit(20)
        .onSnapshot(async (snapshot) => {
            const userPromises = snapshot.docs.map(doc => {
                const userId = doc.id;
                const clickCount = doc.data().clickCount;
                return db.collection("users").doc(userId).get().then(userDoc => {
                    if (userDoc.exists) {
                        return { userId, clickCount, firstName: userDoc.data().first_name, level: userDoc.data().level };
                    } else {
                        throw new Error('User document not found');
                    }
                });
            });

            try {
                const users = await Promise.all(userPromises);
                leaderboardList.innerHTML = '';
                users.forEach((user, index) => {
                    const listItem = document.createElement('li');
                    
                    const usernameSpan = document.createElement('span');
                    usernameSpan.className = 'username';
                    usernameSpan.textContent = `${index + 1}. ${user.firstName}`;
                    
                    const clicksSpan = document.createElement('span');
                    clicksSpan.className = 'clicks';
                    clicksSpan.textContent = `${user.clickCount}`;

                    const levelSpan = document.createElement('span');
                    levelSpan.className = 'level';
                    levelSpan.textContent = ` | lvl-${user.level}`;

                    listItem.appendChild(usernameSpan);
                    listItem.appendChild(clicksSpan);
                    listItem.appendChild(levelSpan);

                    leaderboardList.appendChild(listItem);
                });
            } catch (error) {
                console.error("Error updating leaderboard:", error);
            }
        }, error => {
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
