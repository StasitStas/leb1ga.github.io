document.addEventListener('DOMContentLoaded', function() {
    // Всі елементи
    const exchangeButton = document.getElementById('exchangeButton');
    const mineButton = document.getElementById('mineButton');
    const friendsButton = document.getElementById('friendsButton');
    const earnButton = document.getElementById('earnButton');
    const airdropButton = document.getElementById('airdropButton');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const navButtons = document.querySelectorAll('.nav-button');
    const shopItems = document.querySelectorAll('.shop-item');
    const cofferModal = document.getElementById('coffer-modal');
    const closeModalButton = document.querySelector('.close-modal');
    const cofferImage = document.getElementById('coffer-image');
    const cofferPrice = document.getElementById('coffer-price');
    const openCofferButton = document.getElementById('open-coffer');

    let username = '';
    let firstName = '';
    let linkMain = '';
    let linkAbout = '';
    let linkFriends = '';
    let linkEarn = '';
    let linkDrop = '';

    // Отримання ім'я користувача з URL
    function getUsernameFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('username');
    }

    // Отримання даних користувача з бази даних
    function getUserData(username) {
        return db.collection("users").doc(username).get().then(doc => {
            if (doc.exists) {
                return doc.data();
            } else {
                throw new Error('Документ не знайдено');
            }
        });
    }

    // Ініціалізація даних користувача та посилань
    async function initialize() {
        username = getUsernameFromUrl();
        if (username) {
            try {
                const userData = await getUserData(username);
                firstName = userData.first_name;
                linkMain = userData.link_main;
                linkAbout = userData.link_about;
                linkFriends = userData.link_friends;
                linkEarn = userData.link_earn;
                linkDrop = userData.link_drop;
                usernameDisplay.textContent = firstName;
            } catch (error) {
                console.error("Error getting user data:", error);
                alert('Помилка: Не вдалося отримати дані користувача.');
            }
        } else {
            alert('Помилка: Ім\'я користувача не вказане.');
        }
    }

    // Обробка активності кнопок навігації
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

    // Обробка кліку по товару в магазині
    shopItems.forEach(item => {
        item.addEventListener('click', function() {
            const cofferImageSrc = item.querySelector('img').src;
            cofferImage.src = cofferImageSrc;
            cofferPrice.textContent = "100";
            cofferModal.style.display = 'flex';
            document.body.classList.add('modal-open');
        });
    });

    // Закриття модального вікна при кліку на закриття
    closeModalButton.addEventListener('click', function() {
        cofferModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    });

    // Закриття модального вікна при натисканні на кнопку "Відкрити сундук"
    openCofferButton.addEventListener('click', function() {
        cofferModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    });

    // Ініціалізація даних користувача
    initialize();
});
