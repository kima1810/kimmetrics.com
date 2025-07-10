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
});