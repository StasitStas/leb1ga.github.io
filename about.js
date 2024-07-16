
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

    const skinsButton = document.getElementById('skins-button');
    const skinsModal = document.getElementById('skins-modal');
    const skinsButtonModal = document.getElementById('skins-button-modal');
    const skinsContainer = document.getElementById('skins-container');
    
    let username = '';
    let firstName = '';
    let clickCount = 0;
    let currentCoffer = ''; // Track which coffer is opened

    skinsContainer.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
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

    function getUserClicks(username) {
        return db.collection("clicks").doc(username).get().then(doc => {
            if (doc.exists) {
                return doc.data();
            } else {
                throw new Error('Документ з кліками не знайдено');
            }
        });
    }

    function displayUserSkins(skins) {
        skinsContainer.innerHTML = ''; // Очистити контейнер перед додаванням нових елементів
        for (const skinId in skins) {
            if (skins[skinId].hasSkin) {
                const img = document.createElement('img');
                img.src = `skin/${skinId}.png`;
                skinsContainer.appendChild(img);
            }
        }
    }

    async function initialize() {
        username = getUsernameFromUrl();
        if (username) {
            try {
                const userData = await getUserData(username);
                const clickData = await getUserClicks(username);
                firstName = userData.first_name;
                clickCount = clickData.clickCount || 0;
                displayUserSkins(userData.skins || {});

                // Слухач змін для скинів користувача
                db.collection("users").doc(username).onSnapshot(doc => {
                    if (doc.exists) {
                        const userData = doc.data();
                        displayUserSkins(userData.skins || {});
                    }
                });

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
            currentCoffer = item.id; // Set the current coffer

            // Update the price in the modal based on the coffer
            if (currentCoffer === 'coffer1') {
                cofferPrice.textContent = '100';
            } else if (currentCoffer === 'coffer2') {
                cofferPrice.textContent = '800';
            }
        });
    });

    closeModalButton.addEventListener('click', function() {
        cofferModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    });

    openCofferButton.addEventListener('click', async function() {
        let cofferCost = 0;
        if (currentCoffer === 'coffer1') {
            cofferCost = 100;
        } else if (currentCoffer === 'coffer2') {
            cofferCost = 800;
        }

        if (clickCount >= cofferCost) {
            clickCount -= cofferCost;
            await db.collection("clicks").doc(username).update({ clickCount: clickCount });
            cofferModal.style.display = 'none';
            document.body.classList.remove('modal-open');
            generatePrize(currentCoffer);
        } else {
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
    });

    async function generatePrize(cofferType) {
        let prizeDescriptionText = '';
        let prizeImageSrc = '';

        if (cofferType === 'coffer1') {
            const clickPrizeProbability = 0.5;
            const skins = [
                { src: 'skin/skin_1.png', id: 'skin_1', probability: 0.7 },
                { src: 'skin/skin_2.png', id: 'skin_2', probability: 0.5 },
                { src: 'skin/skin_3.png', id: 'skin_3', probability: 0.25 }
            ];

            if (Math.random() < clickPrizeProbability) {
                const clicks = Math.floor(Math.random() * (150 - 30 + 1)) + 30;
                clickCount += clicks;
                await db.collection("clicks").doc(username).update({ clickCount: clickCount });
                prizeDescriptionText = `Ваш приз: ${clicks} кліків`;
                prizeImageSrc = 'coin.png';
            } else {
                const skin = skins.find(skin => Math.random() < skin.probability);
                if (skin) {
                    await updateSkin(skin.id);
                    prizeDescriptionText = 'Ваш приз: Скін';
                    prizeImageSrc = skin.src;
                } else {
                    const defaultSkin = skins[2];
                    await updateSkin(defaultSkin.id);
                    prizeDescriptionText = 'Ваш приз: Скін';
                    prizeImageSrc = defaultSkin.src;
                }
            }
        } else if (cofferType === 'coffer2') {
            const clickPrizeProbability = 0.6;
            const skins = [
                { src: 'skin/skin_4.png', id: 'skin_4', probability: 0.5 },
                { src: 'skin/skin_5.png', id: 'skin_5', probability: 0.3 },
                { src: 'skin/skin_6.png', id: 'skin_6', probability: 0.25 },
                { src: 'skin/skin_7.png', id: 'skin_7', probability: 0.1 }
            ];

            if (Math.random() < clickPrizeProbability) {
                const clicks = Math.floor(Math.random() * (1400 - 200 + 1)) + 200;
                clickCount += clicks;
                await db.collection("clicks").doc(username).update({ clickCount: clickCount });
                prizeDescriptionText = `Ваш приз: ${clicks} кліків`;
                prizeImageSrc = 'coin.png';
            } else {
                const skin = skins.find(skin => Math.random() < skin.probability);
                if (skin) {
                    await updateSkin(skin.id);
                    prizeDescriptionText = 'Ваш приз: Скін';
                    prizeImageSrc = skin.src;
                } else {
                    const defaultSkin = skins[3];
                    await updateSkin(defaultSkin.id);
                    prizeDescriptionText = 'Ваш приз: Скін';
                    prizeImageSrc = defaultSkin.src;
                }
            }
        }

        prizeDescription.textContent = prizeDescriptionText;
        prizeImage.src = prizeImageSrc;
        prizeModal.style.display = 'flex';
        document.body.classList.add('modal-open');
    }

    async function updateSkin(skinId) {
        const userRef = db.collection("users").doc(username);
        const userData = await userRef.get();
        const userSkins = userData.data().skins || {};

        if (!userSkins[skinId]) {
            userSkins[skinId] = {
                hasSkin: true,
                count: 1,
                applied: false
            };
        } else {
            userSkins[skinId].count += 1;
        }

        await userRef.update({ skins: userSkins });
    }

    async function applySkin(skinId) {
        const userRef = db.collection("users").doc(username);
        const userData = await userRef.get();
        const userSkins = userData.data().skins || {};

        // Set all skins' applied to false
        for (const skin in userSkins) {
            userSkins[skin].applied = false;
        }

        // Set the selected skin's applied to true
        if (userSkins[skinId]) {
            userSkins[skinId].applied = true;
        }

        await userRef.update({ skins: userSkins });
    }

    // Event listener for the Skins button to open the modal
    skinsButton.addEventListener('click', function() {
        skinsModal.style.display = 'flex';
        document.body.classList.add('modal-open');
    });

    // Event listener to close the Skins modal from the button inside the modal
    skinsButtonModal.addEventListener('click', function() {
        skinsModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    });

    initialize();
});
