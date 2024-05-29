document.addEventListener('DOMContentLoaded', function() {
    const exchangeButton = document.getElementById('exchangeButton');
    const mineButton = document.getElementById('mineButton');

    exchangeButton.addEventListener('click', function() {
        // Отримання посилання на обмін з бази даних Firebase
        db.collection("users").doc("user_id").get().then(doc => {
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
        db.collection("users").doc("user_id").get().then(doc => {
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
