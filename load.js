window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    const progress = document.querySelector('.loading-progress');

    const scripts = document.querySelectorAll('script');
    const totalScripts = scripts.length;
    let loadedScripts = 0;

    scripts.forEach(script => {
        script.addEventListener('load', () => {
            loadedScripts++;
            progress.style.width = `${(loadedScripts / totalScripts) * 100}%`;
            if (loadedScripts === totalScripts) {
                setTimeout(() => {
                    preloader.style.opacity = '0';
                    preloader.style.visibility = 'hidden';
                }, 500); // Затримка перед приховуванням завантажувального екрану
            }
        });
    });
});
