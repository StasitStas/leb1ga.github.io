document.addEventListener('DOMContentLoaded', function() {
    const avatarContainer = document.getElementById('avatarsContent');
    const avatars = avatarContainer.querySelectorAll('.avatar');
    let userLevel = 0;

    function getUserLevel() {
        // Assuming you have a function to get user data
        return db.collection("users").doc(username).get().then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                userLevel = userData.level || 0;
                updateAvatars();
            }
        }).catch(error => {
            console.error("Error getting user level:", error);
        });
    }

    function updateAvatars() {
        avatars.forEach(avatar => {
            const avatarLevel = parseInt(avatar.getAttribute('data-level'), 10);
            if (avatarLevel > userLevel) {
                avatar.classList.add('locked');
                avatar.querySelector('.lock-text').style.display = 'block';
            } else {
                avatar.classList.remove('locked');
                avatar.querySelector('.lock-text').style.display = 'none';
            }
        });
    }

    function saveAvatarToDB(avatarIndex) {
        const updateData = {};
        updateData[`ava${avatarIndex}`] = true;

        db.collection("users").doc(username).update(updateData).catch(error => {
            console.error("Error updating avatar in database:", error);
        });
    }

    avatarContainer.addEventListener('click', function(event) {
        const avatar = event.target.closest('.avatar');
        if (!avatar || avatar.classList.contains('locked')) return;

        const applyButton = avatar.querySelector('.apply-button');
        applyButton.style.display = 'block';

        applyButton.addEventListener('click', function() {
            const avatarIndex = Array.from(avatars).indexOf(avatar) + 1;
            saveAvatarToDB(avatarIndex);
        });
    });

    getUserLevel();
});
