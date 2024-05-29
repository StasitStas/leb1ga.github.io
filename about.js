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

    exchangeButton.addEventListener('click', function() {
        // Отримання посилання на обмін з бази даних Firebase
        db.collection("users").doc("YOUR_USER_ID").get().then(doc => {
            if (doc.exists) {
                const linkMain = doc.data().link_main;
                window.location.href = linkMain; // Перенаправлення на посилання linkMain
            } else {
                console.error("Document not found");
                alert('Посилання на обмін не знайдено.');
            }
        }).catch(error => {
            console.error("Error getting document:", error);
            alert('Сталася помилка під час отримання посилання на обмін.');
        });
    });

    mineButton.addEventListener('click', function() {
        // Отримання посилання на майнінг з бази даних Firebase
        db.collection("users").doc("YOUR_USER_ID").get().then(doc => {
            if (doc.exists) {
                const linkAbout = doc.data().link_about;
                window.location.href = linkAbout; // Перенаправлення на посилання linkAbout
            } else {
                console.error("Document not found");
                alert('Посилання на майнінг не знайдено.');
            }
        }).catch(error => {
            console.error("Error getting document:", error);
            alert('Сталася помилка під час отримання посилання на майнінг.');
        });
    });
});
