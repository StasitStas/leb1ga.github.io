document.addEventListener('DOMContentLoaded', function() {
    const airdropButton = document.getElementById('airdropButton');
    const exchangeButton = document.getElementById('exchangeButton');
    const mineButton = document.getElementById('mineButton');
    const friendsButton = document.getElementById('friendsButton');
    const earnButton = document.getElementById('earnButton');
    const airdropModal = document.getElementById('airdropModal');
    const mineModal = document.getElementById('mineModal');
    const friendsModal = document.getElementById('friendsModal');
    const earnModal = document.getElementById('earnModal');
    const button = document.getElementById('clickButton');
    const countDisplay = document.getElementById('count');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const clickEffectContainer = document.getElementById('clickEffectContainer');
    const settingsIcon = document.querySelector('.cog-icon');
    const settingsWindow = document.getElementById('settingsWindow');
    const closeIcon = document.querySelector('.close-icon');
    const animationToggle = document.getElementById('animationToggle');
    const vibrationToggle = document.getElementById('vibrationToggle');
    const navButtons = document.querySelectorAll('.nav-button'); // Вибираємо всі навігаційні кнопки
    const rankDisplay = document.getElementById('rank'); // Елемент для відображення місця в рейтингу
    const levelBar = document.getElementById('levelBar');
    const levelTextLeft = document.getElementById('levelTextLeft');
    const levelTextRight = document.getElementById('levelTextRight');
    const avatarWindow = document.getElementById('avatarWindow');
    const avatarCloseIcon = avatarWindow.querySelector('.close-icon');
    const avatarToggleLabel = document.getElementById('avatarToggleLabel');
    const avatarTOsettings = document.getElementById('avatarTOsettings');
    const avatars = document.querySelectorAll('.avatar');
    const applyButtons = document.querySelectorAll('.apply-button');
    const modalGifts = document.querySelector('.modal-gifts');
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

    const daysContainer = document.getElementById('days-container');
    const claimRewardButton = document.getElementById('claimRewardButton');
    const rewards = [
        { day: 1, prize: 500 },
        { day: 2, prize: 1000 },
        { day: 3, prize: 5000 },
        { day: 4, prize: 10000 },
        { day: 5, prize: 25000 },
        { day: 6, prize: 50000 },
        { day: 7, prize: 100000 },
        { day: 8, prize: 250000 },
        { day: 9, prize: 500000 },
        { day: 10, prize: 1000000 }
    ];

    let username = '';
    let firstName = '';
    let clickCount = 0;
    let clickCountMax = 0;
    let enableAnimation = true;
    let enableVibration = true;

    let settingsWindowOpen = false;
    let telegramWindowOpen = false;

    let lastClickTime = 0;
    let currentDay = 1;
    let nextClaimTime = new Date();

    modalGifts.classList.add('open');

    avatarToggleLabel.addEventListener('click', function(event) {
        event.stopPropagation();
        settingsWindow.style.display = 'none';
        settingsWindowOpen = false;
        avatarWindow.style.display = 'block';
    });

    avatarCloseIcon.addEventListener('click', function() {
        avatarWindow.style.display = 'none';
    });

    document.addEventListener('click', function() {
        if (avatarWindow.style.display === 'block') {
            avatarWindow.style.display = 'none';
        }
    });

    avatarWindow.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    avatarTOsettings.addEventListener('click', function(event) {
        event.stopPropagation();
        avatarWindow.style.display = 'none';
        settingsWindow.style.display = 'block';
    });

   // Initialize avatars
    function initializeAvatars(currentLevel) {
        avatars.forEach(avatar => {
            const avatarLevel = parseInt(avatar.getAttribute('data-avatar-level'));
            if (avatarLevel > currentLevel) {
                avatar.classList.add('locked');
                avatar.setAttribute('data-unlock-level', `lvl-${avatarLevel}`);
            } else {
                avatar.classList.remove('locked');
                avatar.removeAttribute('data-unlock-level');
            }
        });
    }

    // Apply avatar selection logic
    avatars.forEach(avatar => {
        avatar.addEventListener('click', function() {
            if (!avatar.classList.contains('locked')) {
                avatars.forEach(av => {
                    av.classList.remove('selected');
                    hideApplyButton(av);
                });
                avatar.classList.add('selected');
                showApplyButton(avatar);
            }
        });
    });

    applyButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.stopPropagation();
            const selectedAvatar = button.closest('.avatar');
            if (selectedAvatar) {
                const avatarIndex = Array.from(avatars).indexOf(selectedAvatar) + 1;
                applyAvatar(avatarIndex);
                button.style.display = 'none'; // Hide the button after applying the avatar
                selectedAvatar.classList.remove('selected');
            }
        });
    });

    function hideApplyButton(avatar) {
        const button = avatar.querySelector('.apply-button');
        if (button) {
            button.style.display = 'none';
        }
    }

    function showApplyButton(avatar) {
        const button = avatar.querySelector('.apply-button');
        if (button) {
            button.style.display = 'block';
        }
    }

    function updateAvatarDisplay(avatarIndex) {
        for (let i = 1; i <= 15; i++) {
            const avatarDisplay = document.getElementById(`avatarDisplay${i}`);
            if (i === avatarIndex) {
                avatarDisplay.style.display = 'block';
            } else {
                avatarDisplay.style.display = 'none';
            }
        }
    }

    function applyAvatar(avatarIndex) {
        const avatarData = {};
        avatars.forEach((avatar, index) => {
            avatarData[`ava${index + 1}`] = index + 1 === avatarIndex;
        });
    
        db.collection("users").doc(username).update(avatarData).then(() => {
            console.log('Avatar updated successfully');
        }).catch(error => {
            console.error('Error updating avatar:', error);
        });
    }
    
    // Ініціалізація аватарок користувача при завантаженні сторінки
    function initializeUserAvatars(userData) {
        console.log('Initializing user avatars with data:', userData);
        for (let i = 1; i <= 15; i++) {
            const avatarKey = `ava${i}`;
            if (userData[avatarKey]) {
                avatars.forEach(av => {
                    av.classList.remove('selected');
                    hideApplyButton(av);
                });
                const avatarElement = document.querySelector(`.avatar[data-avatar-level="${i - 1}"]`);
                if (avatarElement) {
                    console.log(`Avatar element found for level ${i - 1}`);
                    avatarElement.classList.add('selected');
                    showApplyButton(avatarElement);
                    updateAvatarDisplay(i);  // Оновлення відображення аватарки
                } else {
                    console.error(`Avatar element with data-avatar-level="${i - 1}" not found`);
                }
                break;
            }
        }
    }

    function updateAvatarFromDatabase(userData) {
        for (let i = 1; i <= 15; i++) {
            const avatarKey = `ava${i}`;
            if (userData[avatarKey]) {
                updateAvatarDisplay(i);  // Оновлення відображення аватарки
                break;
            }
        }
    }

    function getCurrentLevel(clickCount) {
        for (let i = LEVELS.length - 1; i >= 0; i--) {
            if (clickCount >= LEVELS[i].threshold) {
                return i;
            }
        }
        return 0;
    }

    function updateLevelBar(clickCount) {
        const currentLevelIndex = getCurrentLevel(clickCountMax);
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
        const levelData = {};
        LEVELS.forEach(level => {
            levelData[level.label] = level.label === currentLevel;
        });

        db.collection("clicks").doc(username).update(levelData).catch(error => {
            console.error("Error updating levels in database:", error);
        });
    }

    function initializeLevels(userData) {
        clickCountMax = userData.clickCountMax || 0;
        const currentLevelIndex = getCurrentLevel(clickCountMax);
        const currentLevel = LEVELS[currentLevelIndex].label;

        db.collection("clicks").doc(username).get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                if (!data[currentLevel]) {
                    updateLevelBar(clickCountMax);
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



    document.addEventListener('click', function() {
        if (settingsWindowOpen) {
            settingsWindow.style.display = 'none';
            settingsWindowOpen = false;
        }
    });

    settingsWindow.addEventListener('click', function(event) {
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
                usernameDisplay.textContent = firstName;
    
                // Завантаження кольору
                loadColorFromDB();
                
                // Слухач для оновлення даних про кліки
                db.collection("clicks").doc(username).onSnapshot(doc => {
                    if (doc.exists) {
                        const data = doc.data();
                        clickCount = data.clickCount || 0;
                        clickCountMax = data.clickCountMax || 0;
                        enableAnimation = data.enableAnimation !== undefined ? data.enableAnimation : true;
                        enableVibration = data.enableVibration !== undefined ? data.enableVibration : true;
                        lastClaimed = data.lastClaimed || {}; 
                        currentDay = data.currentDay || 1;
                        nextClaimTime = data.nextClaimTime ? data.nextClaimTime.toDate() : new Date();
                        
                        countDisplay.textContent = clickCount.toLocaleString();
                        animationToggle.checked = enableAnimation;
                        vibrationToggle.checked = enableVibration;
                        
                        updateRank();
                        updateLevelBar(clickCount);
                        initializeAvatars(getCurrentLevel(clickCountMax));
                        initializeUserAvatars(userData); 
                        renderDays();
                    } else {
                        db.collection("clicks").doc(username).set({
                            clickCount: 0,
                            clickCountMax: 0,
                            enableAnimation: true,
                            enableVibration: true
                        });
                    }
                    updateLeaderboard(); // Виправлено розміщення цієї функції
                }, error => {
                    console.error("Error getting document:", error);
                });
    
                // Прослуховувач змін в документі користувача
                db.collection("users").doc(username).onSnapshot(doc => {
                    if (doc.exists) {
                        const data = doc.data();
                        updateAvatarFromDatabase(data);
                    } else {
                        console.log('Document does not exist!');
                    }
                }, error => {
                    console.error("Error listening to document:", error);
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
            clickCountMax,
            enableAnimation,
            enableVibration,
            lastClaimed,
            currentDay,
            nextClaimTime: firebase.firestore.Timestamp.fromDate(nextClaimTime)
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
            countDisplay.textContent = clickCount.toLocaleString();
    
            if (clickCount > clickCountMax) {
                clickCountMax = clickCount;
            }
    
            updateLevelBar(clickCount);
    
            db.collection("clicks").doc(username).set({
                clickCount,
                clickCountMax,
                enableAnimation,
                enableVibration,
                lastClaimed,
                currentDay,
                nextClaimTime
            }).then(() => {
                const currentLevel = LEVELS[getCurrentLevel(clickCountMax)].label;
                saveLevelToDB(currentLevel);
                updateLeaderboard();
                initializeUserAvatars(userData); 
            }).catch(error => {
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
    
        if (event.touches.length > 1) {
            return;
        }
    
        if (username) {
            clickCount++;
            countDisplay.textContent = clickCount.toLocaleString();
    
            if (clickCount > clickCountMax) {
                clickCountMax = clickCount;
            }
    
            updateLevelBar(clickCount);
    
            db.collection("clicks").doc(username).set({
                clickCount,
                clickCountMax,
                enableAnimation,
                enableVibration,
                lastClaimed,
                currentDay,
                nextClaimTime
            }).then(() => {
                const currentLevel = LEVELS[getCurrentLevel(clickCountMax)].label;
                saveLevelToDB(currentLevel);
                updateLeaderboard();
                initializeUserAvatars(userData); 
            }).catch(error => {
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

    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            navButtons.forEach(btn => btn.classList.remove('active')); // Видаляємо клас active з усіх кнопок
            button.classList.add('active'); // Додаємо клас active до натиснутої кнопки
        });
    });

    function closeAllModals() {
        airdropModal.style.display = 'none';
        mineModal.style.display = 'none';
        friendsModal.style.display = 'none';
        earnModal.style.display = 'none';
    }

    airdropButton.addEventListener('click', function() {
        if (airdropModal.style.display === 'none' || airdropModal.style.display === '') {
            closeAllModals();
            airdropModal.style.display = 'flex';
        }
    });

    mineButton.addEventListener('click', function() {
        if (mineModal.style.display === 'none' || mineModal.style.display === '') {
            closeAllModals();
            mineModal.style.display = 'flex';
        }
    });

    friendsButton.addEventListener('click', function() {
        if (friendsModal.style.display === 'none' || friendsModal.style.display === '') {
            closeAllModals();
            friendsModal.style.display = 'flex';
        }
    });

    earnButton.addEventListener('click', function() {
        if (earnModal.style.display === 'none' || earnModal.style.display === '') {
            closeAllModals();
            earnModal.style.display = 'flex';
        }
    });

    exchangeButton.addEventListener('click', function() {
        closeAllModals();
    });

    document.getElementById('giftsIcon').addEventListener('click', function() {
        document.getElementById('modal-gifts').style.display = 'block';
    });
    
    // Функція для закриття модального вікна "Подарунки"
    document.getElementById('closeModal-gifts').addEventListener('click', function() {
        document.getElementById('modal-gifts').style.display = 'none';
    });
    
    function renderDays() {
        daysContainer.innerHTML = '';
        rewards.forEach(reward => {
            const dayElement = document.createElement('div');
            dayElement.className = 'day';
            if (reward.day === currentDay) {
                dayElement.classList.add('active');
            }
            dayElement.innerHTML = 
                `<div>День ${reward.day}</div>
                <img src="coin.png" alt="Coin">
                <div>${reward.prize} кліків</div>`;
            daysContainer.appendChild(dayElement);
        });
    }
    
    function updateGreenDot() {
        const greenDot = document.getElementById('greenDot');
        if (Date.now() >= nextClaimTime.getTime()) {
            greenDot.style.display = 'block';
        } else {
            greenDot.style.display = 'none';
        }
    }
    
    function claimReward() {
        const currentTime = Date.now();
        const nextClaimTimestamp = nextClaimTime.getTime();
    
        if (currentTime >= nextClaimTimestamp) {
            if (currentTime >= nextClaimTimestamp + 24 * 60 * 60 * 1000) {
                // Більше 24 годин пройшло
                showNotification('Ви пропустили більше одного дня. Почніть заново з Дня 1.');
    
                const userDocRef = db.collection('clicks').doc(username);
                nextClaimTime = new Date(currentTime + 24 * 60 * 60 * 1000);
                currentDay = 1;
    
                userDocRef.update({
                    currentDay,
                    nextClaimTime: firebase.firestore.Timestamp.fromDate(nextClaimTime),
                    clickCount: firebase.firestore.FieldValue.increment(rewards[0].prize), // Приз за День 1
                    lastClaimed: {
                        hour: new Date(currentTime).getHours(),
                        day: new Date(currentTime).getDate(),
                        month: new Date(currentTime).getMonth() + 1,
                        year: new Date(currentTime).getFullYear()
                    }
                }).then(() => {
                    renderDays();
                    updateGreenDot();
                }).catch((error) => {
                    console.error("Помилка при оновленні бази даних: ", error);
                });
            } else {
                // Менше 24 годин пройшло
                showNotification(`Ви отримали ${rewards[currentDay - 1].prize} кліків!`);
    
                const userDocRef = db.collection('clicks').doc(username);
                const newNextClaimTime = new Date(currentTime + 24 * 60 * 60 * 1000);
    
                currentDay = currentDay % 10 + 1; // Від 1 до 10, потім знову 1
    
                userDocRef.update({
                    currentDay,
                    nextClaimTime: firebase.firestore.Timestamp.fromDate(newNextClaimTime),
                    clickCount: firebase.firestore.FieldValue.increment(rewards[(currentDay - 2 + 10) % 10].prize), // Використання currentDay - 2 для збереження правильного призу
                    lastClaimed: {
                        hour: new Date(currentTime).getHours(),
                        day: new Date(currentTime).getDate(),
                        month: new Date(currentTime).getMonth() + 1,
                        year: new Date(currentTime).getFullYear()
                    }
                }).then(() => {
                    renderDays();
                    updateGreenDot();
                }).catch((error) => {
                    console.error("Помилка при оновленні бази даних: ", error);
                });
            }
        } else {
            showNotification('Ви ще не можете забрати нагороду. Спробуйте пізніше.');
        }
    }

    function showNotification(message) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.add('show');
    
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.style.display = 'none';
            }, 500); // Затримка для плавного зникнення
        }, 3000); // Час відображення повідомлення в мілісекундах
    }
    
    claimRewardButton.addEventListener('click', claimReward);
    
    function initializeRewards() {
        if (!username) {
            console.error("Помилка: username не визначено.");
            return;
        }
    
        const userDocRef = db.collection('clicks').doc(username);
        userDocRef.get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                currentDay = data.currentDay || 1;
                nextClaimTime = data.nextClaimTime ? data.nextClaimTime.toDate() : new Date();
                renderDays();
                updateGreenDot(); // Оновлення відображення кружечка при ініціалізації
            } else {
                userDocRef.set({
                    currentDay: 1,
                    nextClaimTime: firebase.firestore.Timestamp.fromDate(new Date())
                }).then(() => {
                    renderDays();
                    updateGreenDot(); // Оновлення відображення кружечка при першому встановленні
                });
            }
        }).catch(error => {
            console.error("Помилка отримання документа: ", error);
        });
    }
    
    // Викликаємо initializeRewards тільки після того, як визначили username
    initializeRewards();
    
    // Перевірка через певний інтервал часу
    setInterval(updateGreenDot, 10000); // Перевірка кожні 10 секунд

    // Функція для завантаження кольору з бази даних
    function loadColorFromDB() {
        db.collection("users").doc(username).get().then(doc => {
            if (doc.exists) {
                const color = doc.data().color;
                if (color) {
                    // Встановлюємо колір для вибраного фону
                    var styleElement = document.getElementById('dynamic-styles');
                    styleElement.textContent = `
                        body::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: radial-gradient(circle at center bottom, ${color}, black 70%);
                            z-index: -1;
                        }
                    `;
                    document.getElementById('colorDisplay').style.backgroundColor = color;
                }
            }
        }).catch(error => {
            console.error("Error loading color from database:", error);
        });
    }

    // Функція для збереження кольору в базі даних
    function saveColorToDB(color) {
        db.collection("users").doc(username).update({
            color: color
        }).catch(error => {
            console.error("Error updating color in database:", error);
        });
    }

    // Обробник для вибору кольору
    document.getElementById('colorPicker').addEventListener('input', function() {
        var hue = this.value;
        var hslColor = 'hsl(' + hue + ', 100%, 50%)';
        document.getElementById('colorDisplay').style.backgroundColor = hslColor;
    
        // Конвертуємо HSL у RGB для використання у стилі CSS
        var rgbColor = hslToRgb(hue / 360, 1, 0.5);
    
        // Оновлюємо стиль для body::before
        var styleElement = document.getElementById('dynamic-styles');
        styleElement.textContent = `
            body::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: radial-gradient(circle at center bottom, rgb(${rgbColor.join(', ')}), black 70%);
                z-index: -1;
            }
        `;
    
        // Зберігаємо вибраний колір у базі даних
        saveColorToDB(hslColor);
    });



    initialize();
});

// Функція для конвертації HSL у RGB
function hslToRgb(h, s, l) {
    var r, g, b;

    if (s == 0) {
        r = g = b = l; // ахроматичний
    } else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
