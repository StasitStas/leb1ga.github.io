
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
    
    // Ініціалізація днів з призами
    const rewards = [
        { day: 1, prize: 500 },
        { day: 2, prize: 1000 },
        { day: 3, prize: 1500 },
        { day: 4, prize: 2000 },
        { day: 5, prize: 2500 },
        { day: 6, prize: 3000 },
        { day: 7, prize: 3500 },
        { day: 8, prize: 4000 },
        { day: 9, prize: 4500 },
        { day: 10, prize: 5000 }
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
    let currentDay = 1; // замініть на поточний день з бази даних
    let nextClaimTime = Date.now(); // замініть на nextClaimTime з бази даних
    
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
    
                
                // Слухач для оновлення даних про кліки
                db.collection("clicks").doc(username).onSnapshot(doc => {
                    if (doc.exists) {
                        const data = doc.data();
                        clickCount = data.clickCount || 0;
                        clickCountMax = data.clickCountMax || 0;
                        enableAnimation = data.enableAnimation !== undefined ? data.enableAnimation : true;
                        enableVibration = data.enableVibration !== undefined ? data.enableVibration : true;
                        
                        countDisplay.textContent = clickCount.toLocaleString();
                        animationToggle.checked = enableAnimation;
                        vibrationToggle.checked = enableVibration;
                        
                        updateRank();

                    } else {
                        db.collection("clicks").doc(username).set({
                            clickCount: 0,
                            clickCountMax: 0,
                            enableAnimation: true,
                            enableVibration: true
                        });
                    }
                    updateLeaderboard();
                }, error => {
                    console.error("Error getting document:", error);
                });
    
                // Прослуховувач змін в документі користувача
                db.collection("users").doc(username).onSnapshot(doc => {
                    if (doc.exists) {
                        const data = doc.data();
                    } else {
                        console.log('Document does not exist!');
                    }
                }, error => {
                    console.error("Error listening to document:", error);
                });
    
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
    
    
            db.collection("clicks").doc(username).set({
                clickCount,
                clickCountMax,  // Збереження максимальної кількості кліків
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
    
    
            db.collection("clicks").doc(username).set({
                clickCount,
                clickCountMax,  // Збереження максимальної кількості кліків
                enableAnimation,
                enableVibration
            }).then(() => {
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

    // Функція для відкриття модального вікна "Подарунки"
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
            dayElement.innerHTML = `
                <div>День ${reward.day}</div>
                <img src="coin.png" alt="Coin">
                <div>${reward.prize} кліків</div>
            `;
            daysContainer.appendChild(dayElement);
        });
    }
    
    claimRewardButton.addEventListener('click', function() {
        if (Date.now() >= nextClaimTime) {
            alert(`Ви отримали ${rewards[currentDay - 1].prize} кліків!`);
            
            // Оновлення даних у Firestore
            const userDocRef = db.collection('clicks').doc(username);
            userDocRef.update({
                currentDay: (currentDay % 10) + 1,
                nextClaimTime: Date.now() + 24 * 60 * 60 * 1000, // Відлік 24 години
                clickCount: firebase.firestore.FieldValue.increment(rewards[currentDay - 1].prize)
            }).then(() => {
                // Оновлення локальних змінних після успішного оновлення в Firestore
                currentDay = (currentDay % 10) + 1;
                nextClaimTime = Date.now() + 24 * 60 * 60 * 1000;
                renderDays();
            }).catch((error) => {
                console.error("Помилка при оновленні бази даних: ", error);
            });
        } else {
            alert('Ви ще не можете забрати нагороду. Спробуйте пізніше.');
        }
    });
    
    // Виклик функції для первісного рендерингу днів
    renderDays();

    initialize();
});
