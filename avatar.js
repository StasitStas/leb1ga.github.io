document.addEventListener('DOMContentLoaded', function() {
    const avatars = document.querySelectorAll('.avatar');
    const LEVELS = [
        { threshold: 0, label: 'lvl-0' },
        { threshold: 100, label: 'lvl-1' },
        { threshold: 1000, label: 'lvl-2' },
        { threshold: 10000, label: 'lvl-3' },
        { threshold: 25000, label: 'lvl-4' },
        { threshold: 75000, label: 'lvl-5' },
        { threshold: 250000, label: 'lvl-6' },
        { threshold: 500000, label: 'lvl-7' },
        { threshold: 1000000, label: 'lvl-8' },
        { threshold: 2500000, label: 'lvl-9' },
        { threshold: 5000000, label: 'lvl-10' }
    ];

    function updateAvatars(level) {
        avatars.forEach(avatar => {
            const requiredLevel = parseInt(avatar.getAttribute('data-level'));
            if (level >= requiredLevel) {
                avatar.classList.remove('disabled');
            } else {
                avatar.classList.add('disabled');
            }
        });
    }

    avatars.forEach(avatar => {
        const button = avatar.querySelector('.apply-button');
        button.addEventListener('click', function() {
            avatars.forEach(av => av.classList.remove('selected'));
            avatar.classList.add('selected');
            saveAvatarSelection(avatar.querySelector('img').getAttribute('alt'));
        });
    });

    function saveAvatarSelection(selectedAvatar) {
        const avatarData = {
            ava1: selectedAvatar === 'Avatar 1',
            ava2: selectedAvatar === 'Avatar 2',
            ava3: selectedAvatar === 'Avatar 3',
            ava4: selectedAvatar === 'Avatar 4',
            ava5: selectedAvatar === 'Avatar 5',
            ava6: selectedAvatar === 'Avatar 6',
            ava7: selectedAvatar === 'Avatar 7',
            ava8: selectedAvatar === 'Avatar 8'
        };

        db.collection("users").doc(username).update(avatarData).catch(error => {
            console.error("Error updating avatar selection:", error);
        });
    }

    function initializeAvatars(userData) {
        const userLevel = getCurrentLevel(userData.clickCountMax);
        updateAvatars(userLevel);
        Object.keys(userData).forEach(key => {
            if (key.startsWith('ava') && userData[key]) {
                avatars.forEach(avatar => {
                    if (avatar.querySelector('img').getAttribute('alt') === key.replace('ava', 'Avatar ')) {
                        avatar.classList.add('selected');
                    }
                });
            }
        });
    }

    function initialize() {
        username = getUsernameFromUrl();
        if (username) {
            getUserData(username).then(userData => {
                initializeAvatars(userData);
            }).catch(error => {
                console.error("Error getting user data:", error);
                alert('Error: Failed to retrieve user data.');
            });
        } else {
            alert('Error: Username not specified.');
        }
    }

    initialize();
});
