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

    function displayUserSkins(skins) {
        skinsContainer.innerHTML = '';
    
        const sortedSkins = Object.keys(skins).sort((a, b) => {
            const numA = parseInt(a.split('_')[1], 20);
            const numB = parseInt(b.split('_')[1], 20);
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
                overlay.innerHTML = `
                    <div>Кількість: ${skins[skinId].count}</div>
                    <div>Клік: +${skins[skinId].click}</div>
                    <button class="${buttonClass}" data-skin-id="${skinId}" style="display: none;">${buttonText}</button>
                `;
    
                skinContainer.appendChild(img);
                skinContainer.appendChild(overlay);
                skinsContainer.appendChild(skinContainer);
    
                if (skins[skinId].applied) {
                    activeSkin = skinContainer;
                    skinContainer.classList.add('active');
                }
    
                const applySkinButton = overlay.querySelector('.apply-skin-btn');
                applySkinButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    applySkin(skinId);
                });
    
                skinContainer.addEventListener('click', (event) => {
                    event.stopPropagation();
                    const applySkinButton = overlay.querySelector('.apply-skin-btn');
                    const isButtonVisible = applySkinButton.style.display !== 'none';
                    
                    if (!isButtonVisible) {
                        if (activeSkin && activeSkin !== skinContainer) {
                            activeSkin.querySelector('.apply-skin-btn').style.display = 'none';
                            activeSkin.classList.remove('active');
                        }
                        applySkinButton.style.display = 'block';
                        skinContainer.classList.add('active');
                        activeSkin = skinContainer;
                    }
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
                displayUserSkins(userData.skins || {});

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
            currentCoffer = item.id;
    
            switch (currentCoffer) {
                case 'coffer1':
                    cofferPrice.textContent = '50';
                    break;
                case 'coffer2':
                    cofferPrice.textContent = '500';
                    break;
                case 'coffer3':
                    cofferPrice.textContent = '5000';
                    break;
                case 'coffer4':
                    cofferPrice.textContent = '10000';
                    break;
                case 'coffer5':
                    cofferPrice.textContent = '50000';
                    break;
                case 'coffer6':
                    cofferPrice.textContent = '300000';
                    break;
            }
        });
    });

    closeModalButton.addEventListener('click', function() {
        cofferModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    });

    openCofferButton.addEventListener('click', async function() {
        let cofferCost = 0;
        switch (currentCoffer) {
            case 'coffer1':
                cofferCost = 50;
                break;
            case 'coffer2':
                cofferCost = 500;
                break;
            case 'coffer3':
                cofferCost = 5000;
                break;
            case 'coffer4':
                cofferCost = 10000;
                break;
            case 'coffer5':
                cofferCost = 50000;
                break;
            case 'coffer6':
                cofferCost = 300000;
                break;
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
    
        switch (cofferType) {
            case 'coffer1':
                if (Math.random() < 0.5) {
                    const clicks = Math.floor(Math.random() * (100 - 10 + 1)) + 10;
                    clickCount += clicks;
                    await db.collection("clicks").doc(username).update({ clickCount: clickCount });
                    prizeDescriptionText = `Ваш приз: ${clicks} coin`;
                    prizeImageSrc = 'coffer-coin.png';
                } else {
                    const skins = [
                        { src: 'skin/skin_1.png', id: 'skin_1', probability: 0.5 },
                        { src: 'skin/skin_2.png', id: 'skin_2', probability: 0.4 },
                        { src: 'skin/skin_3.png', id: 'skin_3', probability: 0.3 },
                        { src: 'skin/skin_4.png', id: 'skin_4', probability: 0.25 }
                    ];
                    const skin = skins.find(s => Math.random() < s.probability);
                    await updateSkin(skin.id);
                    prizeDescriptionText = 'Ваш приз: Скін';
                    prizeImageSrc = skin.src;
                }
                break;
            case 'coffer2':
                if (Math.random() < 0.5) {
                    const clicks = Math.floor(Math.random() * (800 - 100 + 1)) + 100;
                    clickCount += clicks;
                    await db.collection("clicks").doc(username).update({ clickCount: clickCount });
                    prizeDescriptionText = `Ваш приз: ${clicks} coin`;
                    prizeImageSrc = 'coffer-coin.png';
                } else {
                    const skins = [
                        { src: 'skin/skin_5.png', id: 'skin_5', probability: 0.5 },
                        { src: 'skin/skin_6.png', id: 'skin_6', probability: 0.4 },
                        { src: 'skin/skin_7.png', id: 'skin_7', probability: 0.3 },
                        { src: 'skin/skin_8.png', id: 'skin_8', probability: 0.25 }
                    ];
                    const skin = skins.find(s => Math.random() < s.probability);
                    await updateSkin(skin.id);
                    prizeDescriptionText = 'Ваш приз: Скін';
                    prizeImageSrc = skin.src;
                }
                break;
            case 'coffer3':
                if (Math.random() < 0.4) {
                    const clicks = Math.floor(Math.random() * (8000 - 2000 + 1)) + 2000;
                    clickCount += clicks;
                    await db.collection("clicks").doc(username).update({ clickCount: clickCount });
                    prizeDescriptionText = `Ваш приз: ${clicks} coin`;
                    prizeImageSrc = 'coffer-coin.png';
                } else {
                    const skins = [
                        { src: 'skin/skin_9.png', id: 'skin_9', probability: 0.5 },
                        { src: 'skin/skin_10.png', id: 'skin_10', probability: 0.3 },
                        { src: 'skin/skin_11.png', id: 'skin_11', probability: 0.2 }
                    ];
                    const skin = skins.find(s => Math.random() < s.probability);
                    await updateSkin(skin.id);
                    prizeDescriptionText = 'Ваш приз: Скін';
                    prizeImageSrc = skin.src;
                }
                break;
            case 'coffer4':
                if (Math.random() < 0.6) {
                    const clicks = Math.floor(Math.random() * (15000 - 2000 + 1)) + 2000;
                    clickCount += clicks;
                    await db.collection("clicks").doc(username).update({ clickCount: clickCount });
                    prizeDescriptionText = `Ваш приз: ${clicks} coin`;
                    prizeImageSrc = 'coffer-coin.png';
                } else {
                    const skins = [
                        { src: 'skin/skin_12.png', id: 'skin_12', probability: 0.5 },
                        { src: 'skin/skin_13.png', id: 'skin_13', probability: 0.3 },
                        { src: 'skin/skin_14.png', id: 'skin_14', probability: 0.2 }
                    ];
                    const skin = skins.find(s => Math.random() < s.probability);
                    await updateSkin(skin.id);
                    prizeDescriptionText = 'Ваш приз: Скін';
                    prizeImageSrc = skin.src;
                }
                break;
            case 'coffer5':
                if (Math.random() < 0.4) {
                    const clicks = Math.floor(Math.random() * (70000 - 30000 + 1)) + 30000;
                    clickCount += clicks;
                    await db.collection("clicks").doc(username).update({ clickCount: clickCount });
                    prizeDescriptionText = `Ваш приз: ${clicks} coin`;
                    prizeImageSrc = 'coffer-coin.png';
                } else {
                    const skins = [
                        { src: 'skin/skin_15.png', id: 'skin_15', probability: 0.5 },
                        { src: 'skin/skin_16.png', id: 'skin_16', probability: 0.3 },
                        { src: 'skin/skin_17.png', id: 'skin_17', probability: 0.2 }
                    ];
                    const skin = skins.find(s => Math.random() < s.probability);
                    await updateSkin(skin.id);
                    prizeDescriptionText = 'Ваш приз: Скін';
                    prizeImageSrc = skin.src;
                }
                break;
            case 'coffer6':
                if (Math.random() < 0.4) {
                    const clicks = Math.floor(Math.random() * (500000 - 100000 + 1)) + 100000;
                    clickCount += clicks;
                    await db.collection("clicks").doc(username).update({ clickCount: clickCount });
                    prizeDescriptionText = `Ваш приз: ${clicks} coin`;
                    prizeImageSrc = 'coffer-coin.png';
                } else {
                    const skins = [
                        { src: 'skin/skin_18.png', id: 'skin_18', probability: 0.5 },
                        { src: 'skin/skin_19.png', id: 'skin_19', probability: 0.3 },
                        { src: 'skin/skin_20.png', id: 'skin_20', probability: 0.2 }
                    ];
                    const skin = skins.find(s => Math.random() < s.probability);
                    await updateSkin(skin.id);
                    prizeDescriptionText = 'Ваш приз: Скін';
                    prizeImageSrc = skin.src;
                }
                break;
        }
    
        document.getElementById('prize-image').src = prizeImageSrc;
        document.getElementById('prize-description').textContent = prizeDescriptionText;
    
        const prizeModal = document.getElementById('prize-modal');
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
            case 'skin_5': return 10;
            case 'skin_6': return 15;
            case 'skin_7': return 17;
            case 'skin_8': return 20;
            case 'skin_9': return 20;
            case 'skin_10': return 25;
            case 'skin_11': return 30;
            case 'skin_12': return 35;
            case 'skin_13': return 40;
            case 'skin_14': return 55;
            case 'skin_15': return 60;
            case 'skin_16': return 75;
            case 'skin_17': return 80;
            case 'skin_18': return 95;
            case 'skin_19': return 100;
            case 'skin_20': return 200;
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
