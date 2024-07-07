window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    const loadingProgress = document.querySelector('.loading-progress');
    
    // Показуємо вікно загрузки
    preloader.style.display = 'flex';

    // Заповнюємо прогрес-бар за 2 секунди
    setTimeout(function() {
        loadingProgress.style.width = '100%';
    }, 10); // Невелика затримка перед початком анімації

    // Приховуємо вікно загрузки через 2 секунди
    setTimeout(function() {
        preloader.style.display = 'none';
    }, 2000); // 2000 мілісекунд = 2 секунди
});
