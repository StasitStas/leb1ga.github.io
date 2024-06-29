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
    const telegramIcon = document.querySelector('.telegram-icon');
    const telegramWindow = document.getElementById('telegramWindow');
    const animationToggle = document.getElementById('animationToggle');
    const vibrationToggle = document.getElementById('vibrationToggle');
    const subscribeButton = document.getElementById('subscribeButton');
    const bonusButton = document.getElementById('bonusButton');
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
    const avatarDisplay = document.querySelector('.avatar-display');
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
    let clickCountMax = 0;
    let enableAnimation = true;
    let enableVibration = true;
    let bonusClaimed = false;

    let settingsWindowOpen = false;
    let telegramWindowOpen = false;

    let lastClickTime = 0;

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
    
    avatars.forEach(avatar => {
        avatar.addEventListener('click', function() {
            if (!avatar.classList.contains('locked')) {
                if (avatar.classList.contains('selected')) {
                    avatar.classList.remove('selected');
                } else {
                    avatars.forEach(av => av.classList.remove('selected'));
                    avatar.classList.add('selected');
                }
                toggleApplyButton(avatar);
            }
        });
    });
    
    document.querySelectorAll('.apply-button').forEach(button => {
        button.addEventListener('click', function(event) {
            event.stopPropagation();
            const selectedAvatar = button.closest('.avatar');
            if (selectedAvatar) {
                const avatarIndex = Array.from(avatars).indexOf(selectedAvatar) + 1;
                applyAvatar(avatarIndex);
                button.style.display = 'none';
            }
        });
    });
    
    function applyAvatar(avatarIndex) {
        const avatarData = {};
        avatars.forEach((avatar, index) => {
            avatarData[`ava${index + 1}`] = index + 1 === avatarIndex;
        });
    
        db.collection("users").doc(username).update(avatarData).then(() => {
            console.log('Avatar updated successfully');
            updateAvatarDisplay(avatarIndex);
        }).catch(error => {
            console.error('Error updating avatar:', error);
        });
    }
    
    function initializeUserAvatars(userData) {
        let selectedAvatarIndex = 1; // Default to avatar 1 if none is selected
    
        for (let i = 1; i <= 8; i++) {
            const avatarKey = `ava${i}`;
            const avatarElement = document.querySelector(`.avatar[data-avatar-level="${i - 1}"]`);
            if (userData[avatarKey]) {
                avatars.forEach(av => av.classList.remove('selected'));
                avatarElement.classList.add('selected');
                selectedAvatarIndex = i; // Update the selected avatar index
            }
        }
    
        updateAvatarDisplay(selectedAvatarIndex); // Set the avatar display on load
    }
    
    function updateAvatarDisplay(avatarIndex) {
        const avatarDisplay = document.getElementById('avatarDisplay');
        if (avatarDisplay) {
            avatarDisplay.src = `ava-img/ava${avatarIndex}.jpg`;
            console.log(`Avatar display updated to ava${avatarIndex}.jpg`); // Debugging log
        } else {
            console.error('Avatar display element not found');
        }
    }

    
    function toggleApplyButton(avatar) {
        const applyButton = avatar.querySelector('.apply-button');
        if (applyButton) {
            const isSelected = avatar.classList.contains('selected');
            applyButton.style.display = isSelected ? 'block' : 'none';
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
                usernameDisplay.textContent = firstName;
    
                db.collection("clicks").doc(username).onSnapshot(doc => {
                    if (doc.exists) {
                        const data = doc.data();
                        clickCount = data.clickCount || 0;
                        clickCountMax = data.clickCountMax || 0;
                        bonusClaimed = data.bonusClaimed || false;
                        enableAnimation = data.enableAnimation !== undefined ? data.enableAnimation : true;
                        enableVibration = data.enableVibration !== undefined ? data.enableVibration : true;
                        countDisplay.textContent = clickCount.toLocaleString();
                        animationToggle.checked = enableAnimation;
                        vibrationToggle.checked = enableVibration;
                        if (bonusClaimed) {
                            bonusButton.disabled = true;
                        }
                        updateRank();
                        updateLevelBar(clickCount);
                        initializeAvatars(getCurrentLevel(clickCountMax));
                        initializeUserAvatars(userData); // Initialize avatars based on user data
                    } else {
                        db.collection("clicks").doc(username).set({
                            clickCount: 0,
                            clickCountMax: 0,
                            bonusClaimed: false,
                            enableAnimation: true,
                            enableVibration: true
                        });
                    }
                    updateLeaderboard();
                }, error => {
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
            countDisplay.textContent = clickCount.toLocaleString();
    
            // Оновлюємо максимальну кількість кліків, якщо потрібно
            if (clickCount > clickCountMax) {
                clickCountMax = clickCount;
            }
    
            updateLevelBar(clickCount);  // Оновлення рівня та зеленої смужки
    
            db.collection("clicks").doc(username).set({
                clickCount,
                clickCountMax,  // Збереження максимальної кількості кліків
                bonusClaimed,
                enableAnimation,
                enableVibration
            }).then(() => {
                const currentLevel = LEVELS[getCurrentLevel(clickCountMax)].label;  // Використовуємо clickCountMax для рівня
                saveLevelToDB(currentLevel);
                updateLeaderboard();
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
    
        // Check if more than one touch is detected
        if (event.touches.length > 1) {
            return;
        }
    
        if (username) {
            clickCount++;
            countDisplay.textContent = clickCount.toLocaleString();
    
            // Оновлюємо максимальну кількість кліків, якщо потрібно
            if (clickCount > clickCountMax) {
                clickCountMax = clickCount;
            }
    
            updateLevelBar(clickCount);  // Оновлення рівня та зеленої смужки
    
            db.collection("clicks").doc(username).set({
                clickCount,
                clickCountMax,  // Збереження максимальної кількості кліків
                bonusClaimed,
                enableAnimation,
                enableVibration
            }).then(() => {
                const currentLevel = LEVELS[getCurrentLevel(clickCountMax)].label;  // Використовуємо clickCountMax для рівня
                saveLevelToDB(currentLevel);
                updateLeaderboard();
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

    subscribeButton.addEventListener('click', subscribeToChannel);
    bonusButton.addEventListener('click', claimBonus);

    initialize();
});
