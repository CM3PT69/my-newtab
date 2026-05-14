// === ПОГОДА ===
async function fetchWeather() {
    const lat = 52.48766;
    const lon = 32.91671;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Сетевая ошибка');
        const data = await response.json();
        const weather = data.current_weather;
        document.getElementById('weather-temp').textContent = `${Math.round(weather.temperature)}°C`;
        const code = weather.weathercode;
        const descriptions = {
            0: 'Ясно', 1: 'Преимущественно ясно', 2: 'Переменная облачность', 3: 'Пасмурно',
            45: 'Туман', 48: 'Изморозь',
            51: 'Лёгкая морось', 53: 'Умеренная морось', 55: 'Сильная морось',
            61: 'Небольшой дождь', 63: 'Умеренный дождь', 65: 'Сильный дождь',
            71: 'Небольшой снег', 73: 'Умеренный снег', 75: 'Сильный снег',
            80: 'Ливень', 81: 'Умеренный ливень', 82: 'Сильный ливень',
            95: 'Гроза', 96: 'Гроза с мелким градом', 99: 'Гроза с крупным градом'
        };
        document.getElementById('weather-desc').textContent = descriptions[code] || 'Неизвестно';
        const emojiMap = {
            0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
            45: '🌫️', 48: '🌫️',
            51: '🌦️', 53: '🌦️', 55: '🌧️',
            61: '🌧️', 63: '🌧️', 65: '🌧️',
            71: '❄️', 73: '❄️', 75: '❄️',
            80: '🌦️', 81: '🌧️', 82: '🌧️',
            95: '⛈️', 96: '⛈️', 99: '⛈️'
        };
        document.getElementById('weather-icon').textContent = emojiMap[code] || '❓';
    } catch (e) {
        document.getElementById('weather-desc').textContent = 'Ошибка загрузки';
        document.getElementById('weather-temp').textContent = '--°';
        document.getElementById('weather-icon').textContent = '⚠️';
        console.error(e);
    }
}
fetchWeather();

// === ПОИСК (основной) ===
const searchInput = document.getElementById('search-input');
searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const query = encodeURIComponent(this.value.trim());
        if (query) {
            window.location.href = 'https://duckduckgo.com/?q=' + query;
        }
    }
});

// === ПЕРЕКЛЮЧАТЕЛЬ ПАНЕЛИ БЫСТРЫХ ПЕРЕХОДОВ ===
const urlToggleBtn = document.getElementById('url-toggle-btn');
const quickJumpBox = document.getElementById('quick-jump-box');
let urlMode = false;

urlToggleBtn.addEventListener('click', () => {
    urlMode = !urlMode;
    if (urlMode) {
        quickJumpBox.classList.add('expanded');
        urlToggleBtn.classList.add('active');
    } else {
        quickJumpBox.classList.remove('expanded');
        urlToggleBtn.classList.remove('active');
    }
});

// === БЫСТРЫЕ ПЕРЕХОДЫ ===
const quickJumpInput = document.getElementById('quick-jump-input');
const bangs = {
    'ds': (query) => query ? `https://chat.deepseek.com/?q=${encodeURIComponent(query)}` : 'https://www.deepseek.com',
    'fd': () => 'https://github.com/MrOtherGuy/fx-autoconfig',
    'yt': (query) => query ? `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}` : 'https://www.youtube.com',
    'gh': (query) => query ? `https://github.com/search?q=${encodeURIComponent(query)}` : 'https://github.com',
    'wiki': (query) => query ? `https://ru.wikipedia.org/wiki/${encodeURIComponent(query)}` : 'https://ru.wikipedia.org',
    'rdt': (query) => query ? `https://www.reddit.com/search/?q=${encodeURIComponent(query)}` : 'https://www.reddit.com',
};

quickJumpInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const raw = this.value.trim();
        if (!raw) return;
        if (/^(https?:\/\/|www\.|[a-zA-Z0-9-]+\.\w{2,})/.test(raw)) {
            let url = raw;
            if (!/^https?:\/\//.test(url)) url = 'https://' + url;
            window.location.href = url;
            return;
        }
        const parts = raw.split(/\s+/);
        const command = parts[0].toLowerCase();
        const query = parts.slice(1).join(' ');
        if (bangs[command]) {
            window.location.href = bangs[command](query);
            return;
        }
        window.location.href = 'https://duckduckgo.com/?q=' + encodeURIComponent(raw);
    }
});

// === ШЕСТЕРЁНКА И МЕНЮ ===
const settingsBtn = document.getElementById('settings-btn');
const settingsDropdown = document.getElementById('settings-dropdown');

settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsDropdown.classList.toggle('open');
    // Закрываем подпанель при переключении основного меню
    document.getElementById('dynamic-subpanel').classList.remove('show');
});

document.addEventListener('click', (e) => {
    if (!settingsBtn.contains(e.target) && !settingsDropdown.contains(e.target)) {
        settingsDropdown.classList.remove('open');
        document.getElementById('dynamic-subpanel').classList.remove('show');
    }
});

// === ДИНАМИЧЕСКАЯ ПАНЕЛЬ (подменю) ===
const dynamicPanelBtn = document.getElementById('dynamic-panel-btn');
const dynamicSubpanel = document.getElementById('dynamic-subpanel');
const toggleBtn = document.getElementById('dynamic-toggle');
const resetPanelBtn = document.getElementById('reset-panel');
const searchWrapper = document.querySelector('.unified-search-wrapper');

let dynamicMode = false;

// Показать/скрыть подпанель
dynamicPanelBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dynamicSubpanel.classList.toggle('show');
});

// Кнопка Включить/Выключить
toggleBtn.addEventListener('click', () => {
    dynamicMode = !dynamicMode;
    updateToggleButton();
    if (dynamicMode) {
        searchWrapper.classList.add('draggable');
    } else {
        searchWrapper.classList.remove('draggable');
    }
});

function updateToggleButton() {
    if (dynamicMode) {
        toggleBtn.textContent = 'Выключить';
        toggleBtn.classList.add('enabled');
    } else {
        toggleBtn.textContent = 'Включить';
        toggleBtn.classList.remove('enabled');
    }
}

// Сброс положения панели
resetPanelBtn.addEventListener('click', () => {
    searchWrapper.style.position = '';
    searchWrapper.style.left = '';
    searchWrapper.style.top = '';
    searchWrapper.style.margin = '';
});

// === ПЕРЕТАСКИВАНИЕ ПАНЕЛИ ===
let isDragging = false;
let startX, startY, initialX, initialY;

searchWrapper.addEventListener('mousedown', (e) => {
    if (!dynamicMode) return;
    if (e.target.closest('.search-input') || e.target.closest('.quick-jump-input') || e.target.closest('button')) return;
    e.preventDefault();
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = searchWrapper.getBoundingClientRect();
    initialX = rect.left;
    initialY = rect.top;
    searchWrapper.style.cursor = 'grabbing';
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    searchWrapper.style.position = 'fixed';
    searchWrapper.style.left = (initialX + dx) + 'px';
    searchWrapper.style.top = (initialY + dy) + 'px';
    searchWrapper.style.margin = '0';
});

window.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        searchWrapper.style.cursor = dynamicMode ? 'grab' : '';
    }
});

// === ПЕРСОНАЛИЗАЦИЯ (старая) ===
const personalizeBtn = document.getElementById('personalize-btn');
const customizeMenu = document.getElementById('customize-menu');
const overlay = document.getElementById('overlay');
const closeSettingsBtn = document.getElementById('close-settings-btn');

function openSettings() {
    customizeMenu.classList.add('open');
    overlay.classList.add('open');
}
function closeSettings() {
    customizeMenu.classList.remove('open');
    overlay.classList.remove('open');
}

personalizeBtn.addEventListener('click', openSettings);
overlay.addEventListener('click', closeSettings);
closeSettingsBtn.addEventListener('click', closeSettings);
