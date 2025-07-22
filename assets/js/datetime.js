document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('time[datetime]').forEach(timeElem => {
    const date = new Date(timeElem.getAttribute('datetime'));
    if (!isNaN(date)) {
      timeElem.textContent = date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  });
});
