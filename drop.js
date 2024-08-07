document.addEventListener('DOMContentLoaded', function() {
    const leaderboardList = document.getElementById('leaderboardList');
    const navButtons = document.querySelectorAll('.nav-button');
    const infoIcon = document.getElementById('info-circleIcon');
    const modalInfo = document.getElementById('modalInfo');
    const closeInfo = document.querySelector('.close-info');

    const LEVELS = [
        { threshold: 0, label: 'lvl-0' },
        { threshold: 1000, label: 'lvl-1' },
        { threshold: 5000, label: 'lvl-2' },
        { threshold: 25000, label: 'lvl-3' },
        { threshold: 100000, label: 'lvl-4' },
        { threshold: 250000, label: 'lvl-5' },
        { threshold: 500000, label: 'lvl-6' },
        { threshold: 1000000, label: 'lvl-7' },
        { threshold: 5000000, label: 'lvl-8' },
        { threshold: 25000000, label: 'lvl-9' },
        { threshold: 125000000, label: 'lvl-10' }
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
        db.collection("clicks").orderBy("clickCount", "desc").limit(1000)
        .onSnapshot(async (snapshot) => {
            const userPromises = snapshot.docs.map(doc => {
                const userId = doc.id;
                const clickCount = doc.data().clickCount;
                const clickCountMax = doc.data().clickCountMax; // отримуємо значення clickCountMax
                const level = getLevel(clickCountMax); // визначаємо рівень на основі clickCountMax
                return db.collection("users").doc(userId).get().then(userDoc => {
                    if (userDoc.exists) {
                        return { userId, clickCount, firstName: userDoc.data().first_name, level, avatar: userDoc.data() }; // додаємо поле для аватарки
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
                    listItem.className = 'leaderboard-item';
                    
                    const userDetails = document.createElement('div');
                    userDetails.className = 'user-details';

                    // Визначення аватарки, яка позначена як true, або аватарки за замовчуванням
                    let avatarPath = 'ava-img/ava1.jpg'; // аватарка за замовчуванням
                    for (let i = 1; i <= 15; i++) {
                        if (user.avatar[`ava${i}`] === true) {
                            avatarPath = `ava-img/ava${i}.jpg`;
                            break;
                        }
                    }
    
                    // Додаємо аватарку
                    const avatarImg = document.createElement('img');
                    avatarImg.className = 'avatar-leaderboard'; // застосовуємо новий CSS клас
                    avatarImg.src = avatarPath;
                    avatarImg.alt = 'Avatar';
                    userDetails.appendChild(avatarImg);

                    const userInfo = document.createElement('div');
                    userInfo.className = 'user-info';

                    const usernameSpan = document.createElement('div');
                    usernameSpan.className = 'username';
                    usernameSpan.textContent = `${user.firstName}`;
                    userInfo.appendChild(usernameSpan);
    
                    const clicksAndLevel = document.createElement('div');
                    clicksAndLevel.className = 'clicks-level';
                    clicksAndLevel.textContent = `${user.clickCount.toLocaleString()} кліків, ${user.level}`;
                    userInfo.appendChild(clicksAndLevel);

                    userDetails.appendChild(userInfo);

                    // Додаємо місце
                    const placeSpan = document.createElement('span');
                    placeSpan.className = 'place';
                    placeSpan.textContent = `${index + 1}`;
                    listItem.appendChild(userDetails);
                    listItem.appendChild(placeSpan);

                    // Виділення поточного користувача
                    if (user.userId === username) {
                        listItem.classList.add('highlight');
                    }

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

    infoIcon.addEventListener('click', function() {
        modalInfo.style.display = 'block';
    });

    closeInfo.addEventListener('click', function() {
        modalInfo.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == modalInfo) {
            modalInfo.style.display = 'none';
        }
    });

    initialize();
});
