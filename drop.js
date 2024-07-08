document.addEventListener('DOMContentLoaded', function() {
    const leaderboardList = document.getElementById('leaderboardList');
    const navButtons = document.querySelectorAll('.nav-button');

    const LEVELS = [
        { threshold: 0, label: 'lvl-0' },
        { threshold: 100, label: 'lvl-1' },
        { threshold: 1000, label: 'lvl-2' },
        { threshold: 10000, label: 'lvl-3' },
        { threshold: 25000, label: 'lvl-4' },
        { threshold: 75000, label: 'lvl-5' },
        { threshold: 250000, label: 'lvl-6' },
        { threshold: 500000, label: 'lvl-7' },
        { threshold: 1000000, label: 'lvl-8' },
        { threshold: 2500000, label: 'lvl-9' },
        { threshold: 5000000, label: 'lvl-10' }
    ];

    function getLevel(clickCountMax) {
        for (let i = LEVELS.length - 1; i >= 0; i--) {
            if (clickCountMax >= LEVELS[i].threshold) {
                return LEVELS[i].label;
            }
        }
        return LEVELS[0].label;
    }

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
                const clickCountMax = doc.data().clickCountMax; // отримуємо значення clickCountMax
                const level = getLevel(clickCountMax); // визначаємо рівень на основі clickCountMax
                return db.collection("users").doc(userId).get().then(userDoc => {
                    if (userDoc.exists) {
                        return { userId, clickCount, firstName: userDoc.data().first_name, level };
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
                    
                    const userDetails = document.createElement('div');
                    userDetails.className = 'user-details';

                    const usernameSpan = document.createElement('span');
                    usernameSpan.className = 'username';
                    usernameSpan.textContent = `${index + 1}. ${user.firstName}`;

                    const clicksSpan = document.createElement('span');
                    clicksSpan.className = 'clicks';
                    clicksSpan.textContent = `${user.clickCount}`;

                    const levelSpan = document.createElement('span');
                    levelSpan.className = 'level';
                    levelSpan.textContent = `${user.level}`;

                    userDetails.appendChild(usernameSpan);
                    userDetails.appendChild(clicksSpan);
                    userDetails.appendChild(levelSpan);

                    listItem.appendChild(userDetails);
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
