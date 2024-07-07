window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    preloader.style.display = 'flex'; // показуємо вікно загрузки

    // Через 3 секунди приховуємо вікно загрузки
    setTimeout(function() {
        preloader.style.display = 'none';
    }, 3000); // 3000 мілісекунд = 3 секунди
});
