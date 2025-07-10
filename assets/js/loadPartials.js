function loadPartials(selector, file, callback) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
            document.querySelector(selector).innerHTML = data;
            if (callback) callback();
        });
}

loadPartials('#header-include', '/pages/partials/header.html');
loadPartials('#sidebar-include', '/pages/partials/sidebar.html', () => {
    if (window.initSidebar) window.initSidebar();

    // Dropdown menus
    document.querySelectorAll('#sidebar .opener').forEach(opener => {
        opener.addEventListener('click', () => {
            opener.classList.toggle('active');

            const submenu = opener.nextElementSibling;
            if (submenu && submenu.tagName === 'UL') {
                submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
            }
        });
    });
});