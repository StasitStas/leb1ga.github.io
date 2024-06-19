document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('clickButton');
    const countDisplay = document.getElementById('count');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const clickEffectContainer = document.getElementById('clickEffectContainer');
    const settingsIcon = document.querySelector('.cog-icon');
    const settingsWindow = document.getElementById('settingsWindow');
    const closeIcon = document.querySelector('.close-icon');
    const telegramIcon = document.querySelector('.telegram-icon');
    const telegramWindow = document.getElementById('telegramWindow');
    const animationToggle = document.getElementById('animationToggle');
    const vibrationToggle = document.getElementById('vibrationToggle');
    const subscribeButton = document.getElementById('subscribeButton');
    const bonusButton = document.getElementById('bonusButton');
    const navButtons = document.querySelectorAll('.nav-button'); // Вибираємо всі навігаційні кнопки
    const exchangeButton = document.getElementById('exchangeButton');
    const mineButton = document.getElementById('mineButton');
    const friendsButton = document.getElementById('friendsButton');
    const earnButton = document.getElementById('earnButton');
    const airdropButton = document.getElementById('airdropButton');
    const rankDisplay = document.getElementById('rank'); // Елемент для відображення місця в рейтингу
    const levelMap = {
        "lvl-0": 0,
        "lvl-1": 100,
        "lvl-2": 1000,
        "lvl-3": 10000,
        "lvl-4": 25000,
        "lvl-5": 75000,
        "lvl-6": 250000,
        "lvl-7": 500000,
        "lvl-8": 1000000,
        "lvl-9": 2500000,
        "lvl-10": 5000000
    };

    let username = '';
    let firstName = '';
    let clickCount = 0;
    let enableAnimation = true;
    let enableVibration = true;
    let bonusClaimed = false;
    let linkMain = '';
    let linkAbout = '';
    let linkFriends = '';
    let linkEarn = '';
    let linkDrop = '';
    let settingsWindowOpen = false;
    let telegramWindowOpen = false;
    let lastClickTime = 0;

    let username = getUsernameFromUrl();
    let clickCount = 0;
    let currentLevel = "lvl-0"; // Встановлено початковий рівень
    let levelTextLeft = document.getElementById("levelTextLeft");
    let levelTextRight = document.getElementById("levelTextRight");
    const levelBar = document.getElementById("levelBar");

    settingsIcon.addEventListener('click', function(event) {
        event.stopPropagation();
        settingsWindow.style.display = settingsWindowOpen ? 'none' : 'block';
        settingsWindowOpen = !settingsWindowOpen;
    });

    closeIcon.addEventListener('click', function() {
        settingsWindow.style.display = 'none';
        settingsWindowOpen = false;
    });

    telegramIcon.addEventListener('click', function(event) {
        event.stopPropagation();
        telegramWindow.style.display = telegramWindowOpen ? 'none' : 'block';
        telegramWindowOpen = !telegramWindowOpen;
    });

    document.addEventListener('click', function() {
        if (settingsWindowOpen) {
            settingsWindow.style.display = 'none';
            settingsWindowOpen = false;
        }
        if (telegramWindowOpen) {
            telegramWindow.style.display = 'none';
            telegramWindowOpen = false;
        }
    });

    settingsWindow.addEventListener('click', function(event) {
        event.stopPropagation();
    });
    
    telegramWindow.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    animationToggle.addEventListener('change', function() {
        enableAnimation = animationToggle.checked;
        saveSettings();
    });

    vibrationToggle.addEventListener('change', function() {
        enableVibration = vibrationToggle.checked;
        saveSettings();
    });

    // Функція для визначення рівня на основі кількості кліків
    function getLevelForClicks(clicks) {
        for (let level in levelMap) {
            if (clicks < levelMap[level]) {
                return level;
            }
        }
        return "lvl-10"; // Найвищий рівень, який ви вказали
    }

    // Функція для оновлення відображення рівня
    function updateLevelBar(clicks) {
        const levels = Object.keys(levelMap);
        let newLevel = levels[0];
    
        for (let i = 0; i < levels.length; i++) {
            if (clicks >= levelMap[levels[i]]) {
                newLevel = levels[i];
            } else {
                break;
            }
        }
    
        if (newLevel !== currentLevel) {
            db.collection("clicks").doc(username).update({[currentLevel]: false});
            db.collection("clicks").doc(username).update({[newLevel]: true});
    
            currentLevel = newLevel;
            levelTextLeft.textContent = currentLevel;
            const nextLevelIndex = levels.indexOf(currentLevel) + 1;
            levelTextRight.textContent = levels[nextLevelIndex] ? levels[nextLevelIndex] : "lvl-10";
        }
    
        const currentLevelIndex = levels.indexOf(currentLevel);
        const nextLevelClicks = levelMap[levels[currentLevelIndex + 1]] || levelMap["lvl-10"];
        const previousLevelClicks = levelMap[currentLevel];
        const levelWidth = ((clicks - previousLevelClicks) / (nextLevelClicks - previousLevelClicks)) * 100;
        levelBar.style.width = `${levelWidth}%`;
    }

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
                linkMain = userData.link_main;
                linkAbout = userData.link_about;
                linkFriends = userData.link_friends;
                linkEarn = userData.link_earn;
                linkDrop = userData.link_drop;
                usernameDisplay.textContent = firstName;
                db.collection("clicks").doc(username).get().then(doc => {
                    if (doc.exists) {
                        const data = doc.data();
                        clickCount = data.clickCount || 0;
                        bonusClaimed = data.bonusClaimed || false;
                        enableAnimation = data.enableAnimation !== undefined ? data.enableAnimation : true;
                        enableVibration = data.enableVibration !== undefined ? data.enableVibration : true;
                        countDisplay.textContent = clickCount;
                        animationToggle.checked = enableAnimation;
                        vibrationToggle.checked = enableVibration;
                        if (bonusClaimed) {
                            bonusButton.disabled = true;
                        }
                        updateRank(); // Оновлюємо місце в рейтингу
                        updateLevelBar(clickCount); // Оновлюємо відображення рівня
                    } else {
                        db.collection("clicks").doc(username).set({ 
                            clickCount: 0, 
                            bonusClaimed: false, 
                            enableAnimation: true, 
                            enableVibration: true, 
                            "lvl-0": true,
                            "lvl-1": false,
                            "lvl-2": false,
                            "lvl-3": false,
                            "lvl-4": false,
                            "lvl-5": false,
                            "lvl-6": false,
                            "lvl-7": false,
                            "lvl-8": false,
                            "lvl-9": false,
                            "lvl-10": false
                        });
                    }
                    updateLeaderboard();
                }).catch(error => {
                    console.error("Error getting document:", error);
                });
            }).catch(error => {
                console.error("Error getting user data:", error);
                alert('Помилка: Не вдалося отримати дані користувача.');
            });
        } else {
            alert('Помилка: Ім\'я користувача не вказане.');
        }
    }


    function saveSettings() {
        db.collection("clicks").doc(username).set({
            clickCount,
            bonusClaimed,
            enableAnimation,
            enableVibration
        }).catch(error => {
            console.error("Помилка оновлення документа:", error);
        });
    }

    function vibrate() {
        if (enableVibration) {
            try {
                window.navigator.vibrate(50);
            } catch (error) {
                console.error("Помилка вібрації:", error);
            }
        }
    }

    function createClickEffect(x, y) {
        if (enableAnimation) {
            const clickEffect = document.createElement('div');
            clickEffect.className = 'click-effect';
            clickEffect.style.left = `${x}px`;
            clickEffect.style.top = `${y + 10}px`;
            clickEffect.textContent = '+1';
            clickEffectContainer.appendChild(clickEffect);

            setTimeout(() => {
                clickEffect.remove();
            }, 1000);
        }
    }

    function handleClick(event) {
        const currentTime = new Date().getTime();
        if (currentTime - lastClickTime < 300) {
            return;
        }
        lastClickTime = currentTime;

        if (username) {
            clickCount++;
            countDisplay.textContent = clickCount;
            db.collection("clicks").doc(username).set({ clickCount, bonusClaimed, enableAnimation, enableVibration })
                .then(() => {
                    updateLeaderboard();
                })
                .catch(error => {
                    console.error("Помилка оновлення документа:", error);
                });

            vibrate();

            const rect = button.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            createClickEffect(x, y);
        } else {
            alert('Помилка: Ім\'я користувача не вказане.');
        }
    }

    function handleTouch(event) {
        const currentTime = new Date().getTime();
        if (currentTime - lastClickTime < 50) {
            return;
        }
        lastClickTime = currentTime;
    
        // Check if more than one touch is detected
        if (event.touches.length > 1) {
            return;
        }
    
        if (username) {
            clickCount++;
            countDisplay.textContent = clickCount;
            db.collection("clicks").doc(username).set({ clickCount, bonusClaimed, enableAnimation, enableVibration })
                .then(() => {
                    updateLeaderboard();
                })
                .catch(error => {
                    console.error("Error updating document:", error);
                });
    
            vibrate();
    
            const rect = button.getBoundingClientRect();
            const touch = event.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            createClickEffect(x, y);
        } else {
            alert('Error: Username is not specified.');
        }
    }


    button.addEventListener('click', function(event) {
        handleClick(event);
        updateRank(); // Оновлюємо місце в рейтингу після кожного кліку
    });
    
    button.addEventListener('touchstart', function(event) {
        handleTouch(event);
        updateRank(); // Оновлюємо місце в рейтингу після кожного кліку
    });

    function updateRank() {
        const clicksRef = db.collection("clicks").orderBy("clickCount", "desc");
        clicksRef.get().then(querySnapshot => {
            let rank = 1;
            let userFound = false;
            querySnapshot.forEach(doc => {
                if (doc.id === username) {
                    rankDisplay.textContent = rank;
                    userFound = true;
                }
                if (!userFound) {
                    rank++;
                }
            });
            if (!userFound) {
                rankDisplay.textContent = 'N/A';
            }
        }).catch(error => {
            console.error("Помилка отримання документів:", error);
        });
    }

    function subscribeToChannel() {
        const telegramLink = "https://t.me/leb1gaa";
        window.open(telegramLink, "_blank");
    }

    function claimBonus() {
        if (!bonusClaimed) {
            db.collection("clicks").doc(username).get().then(doc => {
                if (doc.exists) {
                    clickCount += 10000;
                    bonusClaimed = true;
                    countDisplay.textContent = clickCount;
                    bonusButton.disabled = true;
                    db.collection("clicks").doc(username).set({ clickCount, bonusClaimed, enableAnimation, enableVibration })
                        .then(() => {
                            updateLeaderboard();
                            updateRank();
                        })
                        .catch(error => {
                            console.error("Помилка оновлення документа:", error);
                        });
                }
            }).catch(error => {
                console.error("Error getting document:", error);
            });
        }
    }

    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            navButtons.forEach(btn => btn.classList.remove('active')); // Видаляємо клас active з усіх кнопок
            button.classList.add('active'); // Додаємо клас active до натиснутої кнопки
        });
    });

    exchangeButton.addEventListener('click', function() {
        if (linkMain) {
            window.location.href = linkMain;
        } else {
            alert('Помилка: Посилання не знайдено.');
        }
    });

    mineButton.addEventListener('click', function() {
        if (linkAbout) {
            window.location.href = linkAbout;
        } else {
            alert('Помилка: Посилання не знайдено.');
        }
    });

    friendsButton.addEventListener('click', function() {
        if (linkFriends) {
            window.location.href = linkFriends;
        } else {
            alert('Помилка: Посилання не знайдено.');
        }
    });

    earnButton.addEventListener('click', function() {
        if (linkEarn) {
            window.location.href = linkEarn;
        } else {
            alert('Помилка: Посилання не знайдено.');
        }
    });

    airdropButton.addEventListener('click', function() {
        if (linkDrop) {
            window.location.href = linkDrop;
        } else {
            alert('Помилка: Посилання не знайдено.');
        }
    });

    subscribeButton.addEventListener('click', subscribeToChannel);
    bonusButton.addEventListener('click', claimBonus);

    initialize();
});
