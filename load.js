window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    const loadingBar = document.querySelector('.loading-bar');
    
    // Показуємо вікно загрузки
    preloader.style.display = 'flex';

    // Заповнюємо прогрес-бар за 3 секунди
    setTimeout(function() {
        loadingBar.style.width = '100%';
    }, 10); // Невелика затримка перед початком анімації

    // Приховуємо вікно загрузки через 3 секунди
    setTimeout(function() {
        preloader.style.display = 'none';
    }, 3000); // 3000 мілісекунд = 3 секунди
});
