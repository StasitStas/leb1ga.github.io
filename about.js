document.addEventListener('DOMContentLoaded', function () {
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
    const openCofferButton = document.getElementById('open-coffer');
    const prizeModal = document.getElementById('prize-modal');
    const closePrizeModalButton = document.querySelector('.close-prize-modal');
    const prizeDescription = document.getElementById('prize-description');
    const prizeImage = document.getElementById('prize-image');

    let username = '';
    let firstName = '';
    let linkMain = '';
    let linkAbout = '';
    let linkFriends = '';
    let linkEarn = '';
    let linkDrop = '';

    const db = firebase.firestore();

    async function getUsernameFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('username');
    }

    async function getUserData(username) {
        const doc = await db.collection("users").doc(username).get();
        if (doc.exists) {
            return doc.data();
        } else {
            throw new Error('Документ не знайдено');
        }
    }

    async function initialize() {
        username = await getUsernameFromUrl();
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

    navButtons.forEach(button => {
        button.addEventListener('click', function () {
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    exchangeButton.addEventListener('click', function () {
        if (linkMain) {
            window.location.href = linkMain;
        } else {
            alert('Помилка: Посилання не знайдено.');
        }
    });

    mineButton.addEventListener('click', function () {
        if (linkAbout) {
            window.location.href = linkAbout;
        } else {
            window.location.href = 'about.html';
        }
    });

    friendsButton.addEventListener('click', function () {
        if (linkFriends) {
            window.location.href = linkFriends;
        } else {
            alert('Помилка: Посилання не знайдено.');
        }
    });

    earnButton.addEventListener('click', function () {
        if (linkEarn) {
            window.location.href = linkEarn;
        } else {
            alert('Помилка: Посилання не знайдено.');
        }
    });

    airdropButton.addEventListener('click', function () {
        if (linkDrop) {
            window.location.href = linkDrop;
        } else {
            alert('Помилка: Посилання не знайдено.');
        }
    });

    shopItems.forEach(item => {
        item.addEventListener('click', function () {
            const cofferImageSrc = item.querySelector('img').src;
            cofferImage.src = cofferImageSrc;
            cofferModal.style.display = 'flex';
            document.body.classList.add('modal-open');
        });
    });

    closeModalButton.addEventListener('click', function () {
        cofferModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    });

    openCofferButton.addEventListener('click', async function () {
        try {
            const userRef = db.collection('users').doc(username);
            const userDoc = await userRef.get();
            const clickCount = userDoc.data().clickCount;

            if (clickCount < 100) {
                // Disable the button and make it red
                openCofferButton.style.backgroundColor = 'red';
                openCofferButton.disabled = true;
                alert("Недостатньо кліків для відкриття сундука");
                return;
            }

            // Update click count after opening coffer
            await userRef.update({
                clickCount: clickCount - 100
            });

            // Generate prize
            generatePrize();

        } catch (error) {
            console.error("Error updating user data:", error);
            alert("Failed to update user data.");
        }

    });

    closePrizeModalButton.addEventListener('click', function () {
        prizeModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    });

    function generatePrize() {
        const clickPrizeProbability = 0.5; // 50% chance for clicks
        const skinPrizeProbability = 0.5; // 50% chance for skin
        const skins = [
            { src: 'leb1ga-ment.png', probability: 0.7 },
            { src: 'skin_1.png', probability: 0.5 },
            { src: 'skin_2.png', probability: 0.25 }
        ];

        let prizeDescriptionText = '';
        let prizeImageSrc = '';

        if (Math.random() < clickPrizeProbability) {
            const clicks = Math.floor(Math.random() * (150 - 30 + 1)) + 30;
            prizeDescriptionText = `Ваш приз: ${clicks} кліків`;
            prizeImageSrc = 'coin.png';
            updateClickCount(clicks);
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

    async function updateClickCount(clicks) {
        try {
            const userRef = db.collection('users').doc(username);
            const userDoc = await userRef.get();
            const currentClickCount = userDoc.data().clickCount;
            await userRef.update({
                clickCount: currentClickCount + clicks
            });
        } catch (error) {
            console.error("Error updating click count:", error);
        }
    }

    initialize();
});
