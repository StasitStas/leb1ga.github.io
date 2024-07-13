// Функція для відкриття модального вікна "Подарунки"
    document.getElementById('giftsIcon').addEventListener('click', function() {
        document.getElementById('modal-gifts').style.display = 'block';
    });
    
    // Функція для закриття модального вікна "Подарунки"
    document.getElementById('closeModal-gifts').addEventListener('click', function() {
        document.getElementById('modal-gifts').style.display = 'none';
    });
    
    // Останній код з попереднього відповіді
    const daysContainer = document.getElementById('days-container');
    const claimRewardButton = document.getElementById('claimRewardButton');
    
    // Ініціалізація днів з призами
    const rewards = [
        { day: 1, prize: 500 },
        { day: 2, prize: 1000 },
        { day: 3, prize: 1500 },
        { day: 4, prize: 2000 },
        { day: 5, prize: 2500 },
        { day: 6, prize: 3000 },
        { day: 7, prize: 3500 },
        { day: 8, prize: 4000 },
        { day: 9, prize: 4500 },
        { day: 10, prize: 5000 }
    ];
    
    // Припустимо, що username, currentDay та nextClaimTime завантажуються з вашої бази даних при запуску
    let currentDay = 1; // замініть на поточний день з бази даних
    let nextClaimTime = Date.now(); // замініть на nextClaimTime з бази даних
    
    function renderDays() {
        daysContainer.innerHTML = '';
        rewards.forEach(reward => {
            const dayElement = document.createElement('div');
            dayElement.className = 'day';
            if (reward.day === currentDay) {
                dayElement.classList.add('active');
            }
            dayElement.innerHTML = `
                <div>День ${reward.day}</div>
                <img src="coin.png" alt="Coin">
                <div>${reward.prize} кліків</div>
            `;
            daysContainer.appendChild(dayElement);
        });
    }
    
    claimRewardButton.addEventListener('click', function() {
        if (Date.now() >= nextClaimTime) {
            alert(`Ви отримали ${rewards[currentDay - 1].prize} кліків!`);
            
            // Оновлення даних у Firestore
            const userDocRef = db.collection('clicks').doc(username);
            userDocRef.update({
                currentDay: (currentDay % 10) + 1,
                nextClaimTime: Date.now() + 24 * 60 * 60 * 1000, // Відлік 24 години
                clickCount: firebase.firestore.FieldValue.increment(rewards[currentDay - 1].prize)
            }).then(() => {
                // Оновлення локальних змінних після успішного оновлення в Firestore
                currentDay = (currentDay % 10) + 1;
                nextClaimTime = Date.now() + 24 * 60 * 60 * 1000;
                renderDays();
            }).catch((error) => {
                console.error("Помилка при оновленні бази даних: ", error);
            });
        } else {
            alert('Ви ще не можете забрати нагороду. Спробуйте пізніше.');
        }
    });
    
    // Виклик функції для первісного рендерингу днів
    renderDays();
