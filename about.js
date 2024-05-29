document.addEventListener('DOMContentLoaded', function() {
    const exchangeButton = document.getElementById('exchangeButton');
    const mineButton = document.getElementById('mineButton');
    const friendsButton = document.getElementById('friendsButton');
    const earnButton = document.getElementById('earnButton');
    const airdropButton = document.getElementById('airdropButton');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const navButtons = document.querySelectorAll('.nav-button');

    let linkMain = '';
    let linkAbout = '';
    let linkFriends = '';
    let linkEarn = '';
    let linkDrop = '';


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

    initialize();
});
