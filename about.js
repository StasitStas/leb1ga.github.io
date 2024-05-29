document.addEventListener('DOMContentLoaded', function() {
    const settingsIcon = document.getElementById('settingsIcon');
    const settingsWindow = document.getElementById('settingsWindow');
    const animationToggle = document.getElementById('animationToggle');
    const vibrationToggle = document.getElementById('vibrationToggle');
    const exchangeButton = document.getElementById('exchangeButton');
    const mineButton = document.getElementById('mineButton');
    const friendsButton = document.getElementById('friendsButton');
    const earnButton = document.getElementById('earnButton');
    const airdropButton = document.getElementById('airdropButton');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const navButtons = document.querySelectorAll('.nav-button');

    let username = '';
    let firstName = '';
    let enableAnimation = true;
    let enableVibration = true;
    let linkMain = '';
    let linkAbout = '';

    let settingsWindowOpen = false;

    settingsIcon.addEventListener('click', function(event) {
        event.stopPropagation();
        settingsWindow.style.display = settingsWindowOpen ? 'none' : 'block';
        settingsWindowOpen = !settingsWindowOpen;
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
                linkMain = userData.link_main;
                linkAbout = userData.link_about;
                usernameDisplay.textContent = firstName;
                db.collection("clicks").doc(username).get().then(doc => {
                    if (doc.exists) {
                        const data = doc.data();
                        enableAnimation = data.enableAnimation !== undefined ? data.enableAnimation : true;
                        enableVibration = data.enableVibration !== undefined ? data.enableVibration : true;
                        animationToggle.checked = enableAnimation;
                        vibrationToggle.checked = enableVibration;
                    } else {
                        db.collection("clicks").doc(username).set({ enableAnimation: true, enableVibration: true });
                    }
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
            enableAnimation,
            enableVibration
        }).catch(error => {
            console.error("Помилка оновлення документа:", error);
        });
    }

    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
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
            window.location.href = 'about.html';
        }
    });

    friendsButton.addEventListener('click', function() {
        alert('Функція ще не реалізована.');
    });

    earnButton.addEventListener('click', function() {
        alert('Функція ще не реалізована.');
    });

    airdropButton.addEventListener('click', function() {
        alert('Функція ще не реалізована.');
    });

    initialize();
});
