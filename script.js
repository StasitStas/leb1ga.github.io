document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('clickButton');
    const countDisplay = document.getElementById('count');
    const leaderboardList = document.getElementById('leaderboardList');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const clickEffectContainer = document.getElementById('clickEffectContainer');
    const settingsIcon = document.querySelector('.cog-icon');
    const settingsWindow = document.getElementById('settingsWindow');
    const telegramIcon = document.querySelector('.telegram-icon');
    const telegramWindow = document.getElementById('telegramWindow');
    const animationToggle = document.getElementById('animationToggle');
    const vibrationToggle = document.getElementById('vibrationToggle');
    const subscribeButton = document.getElementById('subscribeButton');
    const bonusButton = document.getElementById('bonusButton');

    let username = '';
    let firstName = '';
    let clickCount = 0;
    let enableAnimation = true;
    let enableVibration = true;
    let bonusClaimed = false;

    let settingsWindowOpen = false;
    let telegramWindowOpen = false;

    let lastClickTime = 0;

    settingsIcon.addEventListener('click', function(event) {
        event.stopPropagation();
        settingsWindow.style.display = settingsWindowOpen ? 'none' : 'block';
        settingsWindowOpen = !settingsWindowOpen;
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

    function getUserFirstName(username) {
        return db.collection("users").doc(username).get().then(doc => {
            if (doc.exists) {
                return doc.data().first_name;
            } else {
                throw new Error('Документ не знайдено');
            }
        });
    }

    function initialize() {
        username = getUsernameFromUrl();
        if (username) {
            getUserFirstName(username).then(firstNameFromDb => {
                firstName = firstNameFromDb;
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
                    } else {
                        db.collection("clicks").doc(username).set({ clickCount: 0, bonusClaimed: false, enableAnimation: true, enableVibration: true });
                    }
                    updateLeaderboard();
                }).catch(error => {
                    console.error("Error getting document:", error);
                });
            }).catch(error => {
                console.error("Error getting first name:", error);
                alert('Помилка: Не вдалося отримати ім\'я користувача.');
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

        if (username) {
            clickCount += event.touches.length;
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
            for (let i = 0; i < event.touches.length; i++) {
                const touch = event.touches[i];
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                createClickEffect(x, y);
            }
        } else {
            alert('Помилка: Ім\'я користувача не вказане.');
        }
    }

    button.addEventListener('click', handleClick);
    button.addEventListener('touchstart', handleTouch);

    function updateLeaderboard() {
        db.collection("clicks").orderBy("clickCount", "desc").limit(5).get().then(querySnapshot => {
            leaderboardList.innerHTML = '';
            let index = 0;
            querySnapshot.forEach(doc => {
                index++;
                const listItem = document.createElement('li');
                listItem.textContent = `${index}. ${doc.id}: ${doc.data().clickCount}`;
                leaderboardList.appendChild(listItem);
            });
        }).catch(error => {
            console.error("Помилка отримання документів: ", error);
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

    subscribeButton.addEventListener('click', subscribeToChannel);
    bonusButton.addEventListener('click', claimBonus);

    initialize();
});
