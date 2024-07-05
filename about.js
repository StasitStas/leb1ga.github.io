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

    const skinButton = document.getElementById('skin-button');
    const skinsModal = document.getElementById('skins-modal');
    const closeSkinsModalButton = document.querySelector('.close-skins-modal');
    const skinsList = document.getElementById('skins-list');
    const skinDetails = document.getElementById('skin-details');
    const selectedSkinImage = document.getElementById('selected-skin-image');
    const selectedSkinInfo = document.getElementById('selected-skin-info');
    const applySkinButton = document.getElementById('apply-skin');

    let username = '';
    let firstName = '';
    let clickCount = 0;
    let currentCoffer = ''; // Track which coffer is opened
    let userSkins = {}; // Track user skins

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
                userSkins = userData.skins || {};
                displaySkins();
            } catch (error) {
                console.error("Error getting user data:", error);
                alert('Помилка: Не вдалося отримати дані користувача.');
            }
        } else {
            alert('Помилка: Ім\'я користувача не вказане.');
        }
    }

    function displaySkins() {
        skinsList.innerHTML = '';
        for (const [skinId, skinData] of Object.entries(userSkins)) {
            if (skinData.hasSkin) {
                const skinItem = document.createElement('div');
                skinItem.classList.add('skin-item');
                skinItem.innerHTML = `<img src="${skinId}.png" alt="${skinId}">`;
                skinItem.addEventListener('click', () => {
                    showSkinDetails(skinId, skinData);
                });
                skinsList.appendChild(skinItem);
            }
        }
    }

    function showSkinDetails(skinId, skinData) {
        selectedSkinImage.src = `${skinId}.png`;
        selectedSkinInfo.innerHTML = `
            <p>Кількість: ${skinData.count}</p>
            <p>Загальна кількість: ${skinData.totalCount || 0}</p>
            <p>За натискання: +2</p>
        `;
        skinDetails.style.display = 'block';
        applySkinButton.onclick = () => applySkin(skinId);
    }

    async function applySkin(skinId) {
        for (const key in userSkins) {
            if (userSkins.hasOwnProperty(key)) {
                userSkins[key].applied = false;
            }
        }
        userSkins[skinId].applied = true;
        await db.collection("users").doc(username).update({ skins: userSkins });
        alert('Скін застосовано');
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
        // Implement prize claiming logic here if needed
    });

    async function generatePrize(cofferType) {
        let clickPrizeProbability, minClicks, maxClicks, skins;

        if (cofferType === 'coffer1') {
            clickPrizeProbability = 0.5;
            minClicks = 30;
            maxClicks = 150;
            skins = [
                { src: 'skin/skin_1.png', probability: 0.7 },
                { src: 'skin/skin_2.png', probability: 0.5 },
                { src: 'skin/skin_3.png', probability: 0.25 }
            ];
        } else if (cofferType === 'coffer2') {
            clickPrizeProbability = 0.6;
            minClicks = 200;
            maxClicks = 1400;
            skins = [
                { src: 'skin/skin_4.png', probability: 0.5 },
                { src: 'skin/skin_5.png', probability: 0.3 },
                { src: 'skin/skin_6.png', probability: 0.25 },
                { src: 'skin/skin_7.png', probability: 0.1 }
            ];
        }

        let prizeDescriptionText = '';
        let prizeImageSrc = '';

        if (Math.random() < clickPrizeProbability) {
            const clicks = Math.floor(Math.random() * (maxClicks - minClicks + 1)) + minClicks;
            clickCount += clicks;
            await db.collection("clicks").doc(username).update({ clickCount: clickCount });
            prizeDescriptionText = `Ваш приз: ${clicks} кліків`;
            prizeImageSrc = 'coin.png';
        } else {
            const skin = skins.find(skin => Math.random() < skin.probability);
            if (skin) {
                await updateSkin(skin.src);
                prizeDescriptionText = 'Ваш приз: Скін';
                prizeImageSrc = skin.src;
            }
        }

        prizeDescription.textContent = prizeDescriptionText;
        prizeImage.src = prizeImageSrc;
        prizeModal.style.display = 'flex';
        document.body.classList.add('modal-open');
    }

    async function updateSkin(skinId) {
        const userRef = db.collection("users").doc(username);
        const userDoc = await userRef.get();
        const userData = userDoc.data();

        if (!userData.skins[skinId]) {
            userData.skins[skinId] = { hasSkin: true, count: 1, applied: false };
        } else {
            userData.skins[skinId].count += 1;
        }

        await userRef.update({ skins: userData.skins });
        userSkins = userData.skins;
    }

    skinButton.addEventListener('click', function() {
        skinsModal.style.display = 'flex';
        document.body.classList.add('modal-open');
    });

    closeSkinsModalButton.addEventListener('click', function() {
        skinsModal.style.display = 'none';
        document.body.classList.remove('modal-open');
        skinDetails.style.display = 'none';
    });

    initialize();
});
