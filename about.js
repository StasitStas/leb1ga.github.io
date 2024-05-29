document.addEventListener('DOMContentLoaded', function() {
    const exchangeButton = document.getElementById('exchangeButton');
    const mineButton = document.getElementById('mineButton');

    // Підключення до Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyApLBsJ9AOXu7i38Rm_t4cGuEgxpZRDaeE",
        authDomain: "leb1gabot.firebaseapp.com",
        projectId: "leb1gabot",
        storageBucket: "leb1gabot.appspot.com",
        messagingSenderId: "1096597237881",
        appId: "1:1096597237881:web:29b0383c26ed9acfcaa4a8",
        measurementId: "G-Z1KFE8C0ML"
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

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
});
