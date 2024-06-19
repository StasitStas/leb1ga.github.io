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
    const levelBar = document.getElementById('levelBar');
    const levelTextLeft = document.getElementById('levelTextLeft');
    const levelTextRight = document.getElementById('levelTextRight');
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


    function getCurrentLevel(clickCount) {
        for (let i = LEVELS.length - 1; i >= 0; i--) {
            if (clickCount >= LEVELS[i].threshold) {
                return i;
            }
        }
        return 0;
    }

    function updateLevelBar(clickCount) {
        const currentLevelIndex = getCurrentLevel(clickCount);
        const currentLevel = LEVELS[currentLevelIndex];
        const nextLevel = LEVELS[currentLevelIndex + 1] || currentLevel;
    
        levelTextLeft.textContent = currentLevel.label;
        levelTextRight.textContent = nextLevel.label;
    
        const levelRange = nextLevel.threshold - currentLevel.threshold;
        const progressWithinLevel = clickCount - currentLevel.threshold;
        const levelProgressPercentage = (progressWithinLevel / levelRange) * 100;
    
        levelBar.style.width = `${levelProgressPercentage}%`;
    
        saveLevelToDB(currentLevel.label);
    }
    
    function saveLevelToDB(currentLevel) {
        const levelData = { currentLevel: currentLevel };
        LEVELS.forEach(level => {
            levelData[level.label] = level.label === currentLevel;
        });
    
        db.collection("clicks").doc(username).update(levelData).catch(error => {
            console.error("Error updating levels in database:", error);
        });
    }
    
    function initializeLevels(userData) {
        const clickCount = userData.clickCount || 0;
        const currentLevelIndex = getCurrentLevel(clickCount);
        const currentLevel = LEVELS[currentLevelIndex].label;
    
        db.collection("clicks").doc(username).get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                if (!data[currentLevel]) {
                    updateLevelBar(clickCount);
                }
            } else {
                saveLevelToDB(currentLevel);
            }
        }).catch(error => {
            console.error("Error initializing levels:", error);
        });
    }

    
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
                        updateRank();
                        updateLevelBar(clickCount);
                    } else {
                        db.collection("clicks").doc(username).set({ clickCount: 0, bonusClaimed: false, enableAnimation: true, enableVibration: true });
                    }
                    updateLeaderboard();
                }).catch(error => {
                    console.error("Error getting document:", error);
                });
                initializeLevels(userData);
            }).catch(error => {
                console.error("Error getting user data:", error);
                alert('Error: Failed to retrieve user data.');
            });
        } else {
            alert('Error: Username not specified.');
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
                    updateLevelBar(clickCount);  // Оновлення рівня та зеленої смужки
                })
                .catch(error => {
                    console.error("Error updating document:", error);
                });
    
            vibrate();
    
            const rect = button.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            createClickEffect(x, y);
        } else {
            alert('Error: Username is not specified.');
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
                    updateLevelBar(clickCount);  // Оновлення рівня та зеленої смужки
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
        updateRank();
    });
    
    button.addEventListener('touchstart', function(event) {
        handleTouch(event);
        updateRank();
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
