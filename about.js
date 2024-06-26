document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-button');
    const shopItems = document.querySelectorAll('.shop-item');
    const cofferModal = document.getElementById('coffer-modal');
    const closeModalButton = document.querySelector('.close-modal-mine');
    const cofferImage = document.getElementById('coffer-image');
    const openCofferButton = document.getElementById('open-coffer');
    const prizeModal = document.getElementById('prize-modal');
    const closePrizeModalButton = document.querySelector('.close-prize-modal');
    const prizeDescription = document.getElementById('prize-description');
    const prizeImage = document.getElementById('prize-image');
    const claimPrizeButton = document.getElementById('claim-prize');
    const cofferPrice = document.getElementById('coffer-price'); // Додано для роботи з ціною скарбнички

    let username = '';
    let firstName = '';
    let clickCount = 0;

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

    function getUserClicks(username) {
        return db.collection("clicks").doc(username).get().then(doc => {
            if (doc.exists) {
                return doc.data();
            } else {
                throw new Error('Документ з кліками не знайдено');
            }
        });
    }

    async function initialize() {
        username = getUsernameFromUrl();
        if (username) {
            try {
                const userData = await getUserData(username);
                const clickData = await getUserClicks(username);
                firstName = userData.first_name;
                clickCount = clickData.clickCount || 0;
            } catch (error) {
                console.error("Error getting user data:", error);
                alert('Помилка: Не вдалося отримати дані користувача.');
            }
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

    shopItems.forEach(item => {
        item.addEventListener('click', function() {
            const cofferImageSrc = item.querySelector('img').src;
            cofferImage.src = cofferImageSrc;
            cofferModal.style.display = 'flex';
            document.body.classList.add('modal-open');
        });
    });

    closeModalButton.addEventListener('click', function() {
        cofferModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    });

    openCofferButton.addEventListener('click', async function() {
        if (clickCount >= 100) {
            clickCount -= 100;
            await db.collection("clicks").doc(username).update({ clickCount: clickCount });
            cofferModal.style.display = 'none';
            document.body.classList.remove('modal-open');
            generatePrize();
        } else {
            // Анімація для недостатньої кількості кліків
            cofferPrice.style.animation = 'shake 0.5s';
            setTimeout(() => {
                cofferPrice.style.animation = '';
            }, 1000);
        }
    });

    closePrizeModalButton.addEventListener('click', function() {
        prizeModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    });

    claimPrizeButton.addEventListener('click', function() {
        prizeModal.style.display = 'none';
        document.body.classList.remove('modal-open');
        // Implement prize claiming logic here if needed
    });

    async function generatePrize() {
        const clickPrizeProbability = 0.5;
        const skins = [
            { src: 'leb1ga-ment.png', probability: 0.7 },
            { src: 'skin_1.png', probability: 0.5 },
            { src: 'skin_2.png', probability: 0.25 }
        ];

        let prizeDescriptionText = '';
        let prizeImageSrc = '';
        
        if (Math.random() < clickPrizeProbability) {
            const clicks = Math.floor(Math.random() * (150 - 30 + 1)) + 30;
            clickCount += clicks;
            await db.collection("clicks").doc(username).update({ clickCount: clickCount });
            prizeDescriptionText = `Ваш приз: ${clicks} кліків`;
            prizeImageSrc = 'coin.png';
        } else {
            const skin = skins.find(skin => Math.random() < skin.probability);
            if (skin) {
                prizeDescriptionText = 'Ваш приз: Скін';
                prizeImageSrc = skin.src;
            } else {
                prizeDescriptionText = 'Ваш приз: Скін';
                prizeImageSrc = skins[2].src; // Default skin if none matched
            }
        }

        // Update the prize modal with the generated prize
        prizeDescription.textContent = prizeDescriptionText;
        prizeImage.src = prizeImageSrc;
        prizeModal.style.display = 'flex';
        document.body.classList.add('modal-open');
    }

    initialize();
});
