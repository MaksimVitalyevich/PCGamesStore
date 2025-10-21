document.addEventListener('DOMContentLoaded', () => {
    // Делает плавное появление/исчезновение модального окна
    const modal = document.querySelector('.modalOverlay');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('show');
        });
    }

    // Плавное появление поля истории покупок
    const purchasesField = document.querySelector('.purchasesField');
    if (purchasesField) {
        purchasesField.classList.add('fade-in');
    }

    // Простые анимации кнопок
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('mouseenter', () => btn.classList.add('hovered'));
        btn.addEventListener('mouseleave', () => btn.classList.remove('hovered'));
    });

    // Смена темы профиля (Темный <-> Светлый)
    const themeButtons = document.querySelectorAll('[data-theme]');
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            document.body.classList = theme;
        });
    });
});