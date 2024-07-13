window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    const progress = document.querySelector('.loading-progress');

    const scripts = document.querySelectorAll('script[defer]');
    const totalScripts = scripts.length;
    let loadedScripts = 0;

    function scriptLoaded() {
        loadedScripts++;
        progress.style.width = `${(loadedScripts / totalScripts) * 100}%`;
        if (loadedScripts === totalScripts) {
            setTimeout(() => {
                preloader.style.opacity = '0';
                preloader.style.visibility = 'hidden';
            }, 500); // Затримка перед приховуванням завантажувального екрану
        }
    }

    scripts.forEach(script => {
        if (script.readyState === 'complete' || script.readyState === 'loaded') {
            scriptLoaded();
        } else {
            script.addEventListener('load', scriptLoaded);
        }
    });

    // Якщо немає жодного скрипта з атрибутом defer, приховати preloader після завантаження
    if (totalScripts === 0) {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
    }
});
