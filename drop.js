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

    async function getUserLevel(userId) {
        const levelDoc = await db.collection("clicks").doc(userId).collection("level").doc("currentLevel").get();
        if (levelDoc.exists) {
            return levelDoc.data().level;
        } else {
            return 0; // Якщо рівень не знайдено, повернути 0 або інше значення за замовчуванням
        }
    }

    function updateLeaderboard() {
        db.collection("clicks").orderBy("clickCount", "desc").limit(20)
        .onSnapshot(async (snapshot) => {
            const userPromises = snapshot.docs.map(async (doc) => {
                const userId = doc.id;
                const clickCount = doc.data().clickCount;
                const userDoc = await db.collection("users").doc(userId).get();
                if (userDoc.exists) {
                    const level = await getUserLevel(userId);
                    return { userId, clickCount, firstName: userDoc.data().first_name, level };
                } else {
                    throw new Error('User document not found');
                }
            });

            try {
                const users = await Promise.all(userPromises);
                leaderboardList.innerHTML = '';
                users.forEach((user, index) => {
                    const listItem = document.createElement('li');
                    
                    const userSpan = document.createElement('span');
                    userSpan.className = 'user-details';
                    userSpan.textContent = `${index + 1}. ${user.firstName} - ${user.clickCount} | lvl-${user.level}`;

                    listItem.appendChild(userSpan);

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
