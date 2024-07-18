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
    const cofferPrice = document.getElementById('coffer-price');

    const skinsButton = document.getElementById('skins-button');
    const skinsModal = document.getElementById('skins-modal');
    const skinsButtonModal = document.getElementById('skins-button-modal');
    const skinsContainer = document.getElementById('skins-container');

    let username = '';
    let firstName = '';
    let clickCount = 0;
    let currentCoffer = '';
    let activeSkin = null;

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

    async function getTotalSkinCount(skinId) {
        const usersSnapshot = await db.collection("users").get();
        let totalCount = 0;
    
        usersSnapshot.forEach(doc => {
            const userSkins = doc.data().skins || {};
            if (userSkins[skinId]) {
                totalCount += userSkins[skinId].count;
            }
        });
    
        return totalCount;
    }
    
    async function displayUserSkins(skins) {
        skinsContainer.innerHTML = '';
    
        const sortedSkins = Object.keys(skins).sort((a, b) => {
            const numA = parseInt(a.split('_')[1], 10);
            const numB = parseInt(b.split('_')[1], 10);
            return numA - numB;
        });
    
        for (const skinId of sortedSkins) {
            if (skins[skinId].hasSkin) {
                const skinContainer = document.createElement('div');
                skinContainer.classList.add('skin-container');
                
                const img = document.createElement('img');
                img.src = `skin/${skinId}.png`;
                
                const overlay = document.createElement('div');
                overlay.classList.add('skin-overlay');
                const buttonText = skins[skinId].applied ? 'Застосовано' : 'Застосувати';
                const buttonClass = skins[skinId].applied ? 'apply-skin-btn applied' : 'apply-skin-btn';
                const totalSkinCount = await getTotalSkinCount(skinId);
                overlay.innerHTML = `
                    <div>Кількість: ${skins[skinId].count}</div>
                    <div>Клік: +${skins[skinId].click}</div>
                    <div>Вся кількість: ${totalSkinCount}</div>
                    <button class="${buttonClass}" data-skin-id="${skinId}">${buttonText}</button>
                `;
                
                skinContainer.appendChild(img);
                skinContainer.appendChild(overlay);
                skinsContainer.appendChild(skinContainer);
    
                if (skins[skinId].applied) {
                    activeSkin = skinContainer;
                    skinContainer.classList.add('active');
                }
    
                const applySkinButton = overlay.querySelector('.apply-skin-btn');
                applySkinButton.addEventListener('click', () => {
                    applySkin(skinId);
                });
    
                skinContainer.addEventListener('click', () => {
                    if (activeSkin) {
                        activeSkin.classList.remove('active');
                    }
                    skinContainer.classList.add('active');
                    activeSkin = skinContainer;
                });
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
                await displayUserSkins(userData.skins || {});

                db.collection("users").doc(username).onSnapshot(doc => {
                    if (doc.exists) {
                        const userData = doc.data();
                        await displayUserSkins(userData.skins || {});
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
            currentCoffer = item.id;

            if (currentCoffer === 'coffer1') {
                cofferPrice.textContent = '100';
            } else if (currentCoffer === 'coffer2') {
                cofferPrice.textContent = '800';
            } else if (currentCoffer === 'coffer3') {
                cofferPrice.textContent = '5000';
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
        } else if (currentCoffer === 'coffer3') {
            cofferCost = 5000;
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
        } else if (cofferType === 'coffer3') {
            const clickPrizeProbability = 0.5;
            const skins = [
                { src: 'skin/skin_8.png', id: 'skin_8', probability: 0.5 },
                { src: 'skin/skin_9.png', id: 'skin_9', probability: 0.3 },
                { src: 'skin/skin_10.png', id: 'skin_10', probability: 0.1 }
            ];

            if (Math.random() < clickPrizeProbability) {
                const clicks = Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000;
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
                applied: false,
                click: getSkinClickValue(skinId)
            };
        } else {
            userSkins[skinId].count += 1;
        }

        await userRef.update({ skins: userSkins });
    }

    function getSkinClickValue(skinId) {
        switch (skinId) {
            case 'skin_1': return 1;
            case 'skin_2': return 2;
            case 'skin_3': return 3;
            case 'skin_4': return 5;
            case 'skin_5': return 5;
            case 'skin_6': return 6;
            case 'skin_7': return 8;
            case 'skin_8': return 10;
            case 'skin_9': return 15;
            case 'skin_10': return 20;
            default: return 0;
        }
    }

    async function applySkin(skinId) {
        const userRef = db.collection("users").doc(username);
        const userData = await userRef.get();
        const userSkins = userData.data().skins || {};
    
        for (const skin in userSkins) {
            userSkins[skin].applied = false;
        }
    
        if (userSkins[skinId]) {
            userSkins[skinId].applied = true;
        }
    
        await userRef.update({ skins: userSkins });
        displayUserSkins(userSkins);
    
        const applyButtons = document.querySelectorAll('.apply-skin-btn');
        applyButtons.forEach(button => {
            if (button.dataset.skinId === skinId) {
                button.classList.add('applied');
                button.textContent = 'Застосовано';
            } else {
                button.classList.remove('applied');
                button.textContent = 'Застосувати';
            }
        });
    }

    skinsButton.addEventListener('click', function() {
        skinsModal.style.display = 'flex';
        document.body.classList.add('modal-open');
    });

    skinsButtonModal.addEventListener('click', function() {
        skinsModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    });

    initialize();
});
