if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./assets/js/sw.js', { scope: '/' }).catch(err => console.log('SW error', err));
  }, { once: true });
}

const tg = window.Telegram?.WebApp?.initData ? window.Telegram.WebApp : null;

function applyTelegramSafeAreaInsets() {
  if (!tg) return;
  const safeTop = (tg.safeAreaInset && tg.safeAreaInset.top) || 0;
  const contentTop = (tg.contentSafeAreaInset && tg.contentSafeAreaInset.top) || 0;
  document.documentElement.style.setProperty('--tg-safe-area-top', safeTop + 'px');
  document.documentElement.style.setProperty('--tg-content-safe-area-top', contentTop + 'px');
}

if (tg) {
  tg.ready();
  tg.expand();
  if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();
  tg.onEvent('themeChanged', syncAppearanceFromSystem);
  tg.onEvent('viewportChanged', () => tg.expand());

  applyTelegramSafeAreaInsets();
  tg.onEvent('safeAreaChanged', applyTelegramSafeAreaInsets);
  tg.onEvent('contentSafeAreaChanged', applyTelegramSafeAreaInsets);
}

function haptic(style) {
  if (tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred) {
    try { tg.HapticFeedback.impactOccurred(style || 'light'); } catch (e) { /* ignore */ }
  }
}

function lsSafe(fn, fallback) {
  try { return fn(); } catch (e) { return fallback; }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
}

// ==================================================================
// ============ РАСПИСАНИЕ ЗВОНКОВ И ПАР (ШИ-9-23 · 4 КУРС) ============
// ==================================================================

const STUDENT_GROUP_LABEL = 'ШИ-9-23 · 4 курс';
const MAX_TERM_WEEKS = 15;

// Звонки: ПН–ЧТ и ПТ
const BELL_TIMES_MON_THU = {
  '1': { start: '08:00', end: '09:20', label: '1 пара' },
  '2': { start: '09:30', end: '10:50', label: '2 пара' },
  '3': { start: '11:05', end: '12:25', label: '3 пара' },
  '4': { start: '12:35', end: '13:55', label: '4 пара' },
  '5': { start: '14:05', end: '15:25', label: '5 пара' }
};

const BELL_TIMES_FRIDAY = {
  '1': { start: '08:00', end: '08:40', label: '0 пара' },
  '2': { start: '08:50', end: '10:10', label: '1 пара' },
  '3': { start: '10:20', end: '11:40', label: '2 пара' },
  '4': { start: '11:55', end: '13:15', label: '3 пара' },
  '5': { start: '13:25', end: '14:45', label: '4 пара' }
};

function getLessonTimesForDay(dayName) {
  return dayName === 'Пятница' ? BELL_TIMES_FRIDAY : BELL_TIMES_MON_THU;
}

// Формирует расписание для выбранной недели (1..15).
// Нечётные недели (1, 3, 5...) — числитель; чётные (2, 4, 6...) — знаменатель.
function buildScheduleForWeek(weekNum) {
  const isOdd = Number(weekNum) % 2 === 1;

  return {
    'Понедельник': [
      {
        пара: '1',
        sub: 'ИПТ',
        subjectTitle: 'ИПТ',
        lessonType: '1 пара',
        teacher: 'Мазур-Соцкая Т.В.',
        room: 'ШИ-9-23'
      },
      {
        пара: '2',
        sub: 'Основы пед. мастерства',
        subjectTitle: 'Основы пед. мастерства',
        lessonType: '2 пара',
        teacher: 'Мазур-Соцкая Т.В.',
        room: 'ШИ-9-23'
      },
      {
        пара: '3',
        sub: 'Грамматика',
        subjectTitle: 'Грамматика',
        lessonType: '3 пара',
        teacher: 'Базылевская А.С., Клявинш О.О.',
        room: 'ШИ-9-23'
      },
      {
        пара: '4',
        sub: 'Физическая культура',
        subjectTitle: 'Физическая культура',
        lessonType: '4 пара',
        teacher: 'Якунина С.Б.',
        room: 'ШИ-9-23'
      }
    ],
    'Вторник': [
      {
        пара: '1',
        sub: 'Методика',
        subjectTitle: 'Методика',
        lessonType: '1 пара',
        teacher: 'Базылевская А.С.',
        room: 'ШИ-9-23'
      },
      {
        пара: '2',
        sub: 'Педагогика',
        subjectTitle: 'Педагогика',
        lessonType: '2 пара',
        teacher: 'Шаповалова Н.П.',
        room: 'ШИ-9-23'
      },
      {
        пара: '3',
        sub: 'Ф. Спортивные секции',
        subjectTitle: 'Ф. Спортивные секции',
        lessonType: '3 пара',
        teacher: 'Якунина С.Б.',
        room: 'ШИ-9-23'
      },
      {
        пара: '4',
        sub: 'История и лексикология',
        subjectTitle: 'История и лексикология',
        lessonType: '4 пара',
        teacher: 'Карпекин О.Н.',
        room: 'ШИ-9-23'
      }
    ],
    'Среда': [
      {
        пара: '1',
        sub: 'Методика',
        subjectTitle: 'Методика',
        lessonType: '1 пара',
        teacher: 'Базылевская А.С.',
        room: 'ШИ-9-23'
      },
      {
        пара: '2',
        sub: 'Практикум',
        subjectTitle: 'Практикум',
        lessonType: '2 пара',
        teacher: 'Базылевская А.С., Клявинш О.О.',
        room: 'ШИ-9-23'
      },
      isOdd
        ? {
            пара: '3',
            sub: 'Пед. рефлексия',
            subjectTitle: 'Пед. рефлексия',
            lessonType: '3 пара · числитель',
            teacher: 'Мазур-Соцкая Т.В.',
            room: 'ШИ-9-23'
          }
        : {
            пара: '3',
            sub: 'Педагогика',
            subjectTitle: 'Педагогика',
            lessonType: '3 пара · знаменатель',
            teacher: 'Шаповалова Н.П.',
            room: 'ШИ-9-23'
          },
      {
        пара: '4',
        sub: 'История и лексикология',
        subjectTitle: 'История и лексикология',
        lessonType: '4 пара',
        teacher: 'Карпекин О.Н.',
        room: 'ШИ-9-23'
      }
    ],
    'Четверг': [
      {
        пара: '1',
        sub: 'Фонетика',
        subjectTitle: 'Фонетика',
        lessonType: '1 пара',
        teacher: 'Чернышева А.А., Клявинш О.О.',
        room: 'ШИ-9-23'
      },
      isOdd
        ? {
            пара: '2',
            sub: 'Ф. Латинский язык',
            subjectTitle: 'Ф. Латинский язык',
            lessonType: '2 пара · числитель',
            teacher: 'Клявинш О.О.',
            room: 'ШИ-9-23'
          }
        : {
            пара: '2',
            sub: 'Ф. Деловой англ.',
            subjectTitle: 'Ф. Деловой англ.',
            lessonType: '2 пара · знаменатель',
            teacher: 'Искакова О.Г., Корчагина Е.И.',
            room: 'ШИ-9-23'
          },
      {
        пара: '3',
        sub: 'Экономика',
        subjectTitle: 'Экономика',
        lessonType: '3 пара',
        teacher: 'Леглер О.Н.',
        room: 'ШИ-9-23'
      },
      {
        пара: '4',
        sub: 'Домашнее чтение',
        subjectTitle: 'Домашнее чтение',
        lessonType: '4 пара',
        teacher: 'Базылевская А.С., Клявинш О.О.',
        room: 'ШИ-9-23'
      },
      {
        пара: '5',
        sub: 'История и лексикология',
        subjectTitle: 'История и лексикология',
        lessonType: '5 пара',
        teacher: 'Карпекин О.Н.',
        room: 'ШИ-9-23'
      }
    ],
    'Пятница': [
      {
        пара: '1',
        sub: 'Основы права',
        subjectTitle: 'Основы права',
        lessonType: '0 пара (08:00–08:40)',
        teacher: 'Сулейменова А.Ж.',
        room: 'ШИ-9-23'
      },
      isOdd
        ? {
            пара: '2',
            sub: 'МПИ',
            subjectTitle: 'МПИ',
            lessonType: '1 пара · числитель',
            teacher: 'Пеннер А.В.',
            room: 'ШИ-9-23'
          }
        : {
            пара: '2',
            sub: 'Пед. менедж.',
            subjectTitle: 'Пед. менедж.',
            lessonType: '1 пара · знаменатель',
            teacher: 'Пеннер А.В.',
            room: 'ШИ-9-23'
          },
      {
        пара: '3',
        sub: 'Практикум',
        subjectTitle: 'Практикум',
        lessonType: '2 пара',
        teacher: 'Базылевская А.С., Клявинш О.О.',
        room: 'ШИ-9-23'
      },
      {
        пара: '4',
        sub: 'Пед. рефлексия',
        subjectTitle: 'Пед. рефлексия',
        lessonType: '3 пара',
        teacher: 'Мазур-Соцкая Т.В.',
        room: 'ШИ-9-23'
      },
      isOdd
        ? {
            пара: '5',
            sub: 'История',
            subjectTitle: 'История',
            lessonType: '4 пара · числитель',
            teacher: 'Карпекин О.Н.',
            room: 'ШИ-9-23'
          }
        : {
            пара: '5',
            sub: 'Основы права',
            subjectTitle: 'Основы права',
            lessonType: '4 пара · знаменатель',
            teacher: 'Сулейменова А.Ж.',
            room: 'ШИ-9-23'
          }
    ],
    'Суббота': []
  };
}

function detectCurrentStudyPeriod() {
  const now = new Date();
  const month = now.getMonth(); // 0..11
  const year = now.getFullYear();
  const studyYear = month >= 8 ? year : year - 1;
  const term = month >= 8 ? 1 : 2;
  const termStart = month >= 8
    ? new Date(year, 8, 1)
    : new Date(year, 0, 12);
  const diffDays = Math.max(0, Math.floor((now - termStart) / (1000 * 60 * 60 * 24)));
  const week = Math.min(MAX_TERM_WEEKS, Math.max(1, Math.floor(diffDays / 7) + 1));
  return { studyYear, term, week };
}

let trueCurrentWeekInfo = detectCurrentStudyPeriod();
let browsedWeekInfo = { ...trueCurrentWeekInfo };
let trueCurrentSchedule = buildScheduleForWeek(trueCurrentWeekInfo.week);
let SCHEDULE = buildScheduleForWeek(browsedWeekInfo.week);

// ==================================================================
// ============ ПОГОДА И ГОРОДА ============
// ==================================================================

const CITY_COORDS = {
  'Актау':            { lat: 43.6481, lon: 51.1801 },
  'Актобе':           { lat: 50.2839, lon: 57.2094 },
  'Алматы':           { lat: 43.2220, lon: 76.8512 },
  'Астана':           { lat: 51.1605, lon: 71.4704 },
  'Атырау':           { lat: 47.1164, lon: 51.8792 },
  'Жезказган':        { lat: 47.7838, lon: 67.7128 },
  'Караганда':        { lat: 49.8047, lon: 73.1094 },
  'Кокшетау':         { lat: 53.2833, lon: 69.4167 },
  'Костанай':         { lat: 53.2144, lon: 63.6246 },
  'Конаев':           { lat: 43.8567, lon: 77.0667 },
  'Кызылорда':        { lat: 44.8479, lon: 65.4999 },
  'Павлодар':         { lat: 52.2873, lon: 76.9674 },
  'Петропавловск':    { lat: 54.8667, lon: 69.1500 },
  'Семей':            { lat: 50.4111, lon: 80.2275 },
  'Талдыкорган':      { lat: 45.0167, lon: 78.3667 },
  'Тараз':            { lat: 42.9000, lon: 71.3667 },
  'Туркестан':        { lat: 43.3000, lon: 68.2667 },
  'Уральск':          { lat: 51.2333, lon: 51.3667 },
  'Усть-Каменогорск': { lat: 49.9483, lon: 82.6275 },
  'Шымкент':          { lat: 42.3000, lon: 69.6000 },
  'Ұлытау':           { lat: 48.5667, lon: 67.0333 }
};

async function fetchWeather(location, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,weather_code`,
      { signal: controller.signal }
    );
    if (!response.ok) throw new Error('bad status ' + response.status);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function weatherDescription(code) {
  const map = {
    0: 'Ясно', 1: 'Малооблачно', 2: 'Облачно с прояснениями', 3: 'Пасмурно',
    45: 'Туман', 48: 'Изморозь',
    51: 'Морось', 53: 'Морось', 55: 'Морось',
    61: 'Дождь', 63: 'Дождь', 65: 'Сильный дождь',
    71: 'Снег', 73: 'Снег', 75: 'Сильный снегопад',
    80: 'Ливень', 81: 'Ливень', 82: 'Сильный ливень',
    95: 'Гроза'
  };
  return map[code] || 'Погода';
}

async function fetchDayWeatherDetails(location, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,cloud_cover,is_day&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&timeformat=unixtime`;
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error('bad status ' + response.status);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

let dayOffWeatherCache = { city: null, data: null, timestamp: 0 };

function renderDayOffWeatherHtml(data) {
  const target = document.getElementById('dayOffWeatherDetail');
  if (!target) return;
  let city = lsSafe(() => localStorage.getItem('user_city'), null);
  if (!city || !CITY_COORDS[city]) city = 'Караганда';
  target.innerHTML = smartWeatherHtml(city, data);
}

let dayWeatherRequest = 0;
async function fillDayOffWeather() {
  const request = ++dayWeatherRequest;
  const el = document.getElementById('dayOffWeatherDetail');
  if (!el) return;
  let savedCity = lsSafe(() => localStorage.getItem('user_city'), null);
  if (!savedCity || !CITY_COORDS[savedCity]) savedCity = 'Караганда';

  const cacheFresh = dayOffWeatherCache.city === savedCity
    && (Date.now() - dayOffWeatherCache.timestamp) < 5 * 60 * 1000;
  if (cacheFresh) {
    renderDayOffWeatherHtml(dayOffWeatherCache.data);
    return;
  }

  el.innerHTML = weatherSkeletonHtml();
  try {
    const location = CITY_COORDS[savedCity];
    const [weather, air] = await Promise.allSettled([
      fetchDayWeatherDetails(location), fetchAirQuality(location)
    ]);
    if (weather.status !== 'fulfilled') throw weather.reason;
    const data = { ...weather.value, airQuality: air.status === 'fulfilled' ? air.value.current?.us_aqi : null };
    if (request !== dayWeatherRequest || document.getElementById('dayOffWeatherDetail') !== el || (lsSafe(() => localStorage.getItem('user_city'), null) || 'Караганда') !== savedCity) return;
    dayOffWeatherCache = { city: savedCity, data, timestamp: Date.now() };
    renderDayOffWeatherHtml(data);
  } catch (e) {
    const stillThere = document.getElementById('dayOffWeatherDetail');
    if (request === dayWeatherRequest && stillThere === el) stillThere.innerHTML = 'не удалось загрузить погоду';
  }
}

let weatherRequest = 0;
async function fetchAirQuality(location) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.lat}&longitude=${location.lon}&current=us_aqi`, { signal: controller.signal });
    if (!response.ok) throw new Error('Air quality unavailable');
    return await response.json();
  } finally { clearTimeout(timer); }
}

function smartWeatherHtml(city, data) {
  const cur = data.current || {};
  const night = cur.is_day === 0;
  const rise = data.daily?.sunrise?.[0], set = data.daily?.sunset?.[0];
  const now = cur.time;
  const validArc = Number.isFinite(rise) && Number.isFinite(set) && set > rise && Number.isFinite(now);
  const progress = validArc ? Math.max(0, Math.min(1, (now - rise) / (set - rise))) : 0;
  const arcPath = Array.from({ length: 201 }, (_, i) => `${i ? 'L' : 'M'}${(72 + 228 * i / 200).toFixed(2)} ${(148 - 120 * Math.pow(Math.sin(Math.PI * i / 200), 2.3)).toFixed(2)}`).join(' ');
  const x = 72 + 228 * progress;
  const y = 148 - 120 * Math.pow(Math.sin(Math.PI * progress), 2.3);
  const clock = value => Number.isFinite(value) ? new Date((value + (data.utc_offset_seconds || 0)) * 1000).toISOString().slice(11, 16) : '—';
  const metric = value => Number.isFinite(value) ? Math.round(value) : '—';
  const aqi = data.airQuality;
  const hasAqi = Number.isFinite(aqi);
  const quality = !hasAqi ? 'Нет данных' : aqi <= 50 ? 'Хороший' : aqi <= 100 ? 'Умеренный' : aqi <= 150 ? 'Для чувствительных групп' : aqi <= 200 ? 'Нездоровый' : aqi <= 300 ? 'Очень плохой' : 'Опасный';
  return `<section class="smart-weather ${night ? 'weather-night' : 'weather-day'}" aria-label="Погода в городе ${escapeHtml(city)}">
    <div class="weather-sky-symbol ${night ? 'weather-moon' : 'weather-sun'}" aria-hidden="true"></div>
    <div class="weather-card-avatar" aria-hidden="true">ШИ</div>
    <div class="weather-location"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg><span>${escapeHtml(city)}</span></div>
    <div class="weather-scene">
      <div class="weather-solar-track" aria-hidden="true">
      <svg class="weather-solar-path" viewBox="0 0 320 165" preserveAspectRatio="none" aria-hidden="true"><path d="${arcPath}" vector-effect="non-scaling-stroke"/></svg>
      ${validArc && !night ? `<svg class="weather-solar-sun" style="left:${(x / 320 * 100).toFixed(2)}%;top:${(y / 165 * 100).toFixed(2)}%" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/></svg>` : ''}
      </div>
      <div class="weather-temperature">${metric(cur.temperature_2m)}°</div>
      <div class="weather-caption">${weatherDescription(cur.weather_code)}</div>
      <div class="weather-solar-times"><span>Восход ${clock(rise)}</span><span>Закат ${clock(set)}</span></div>
    </div>
    <div class="weather-data-panels">
      <div class="weather-data-panel"><span class="weather-panel-heading">Качество воздуха <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/></svg></span><strong>${metric(aqi)}</strong><div class="weather-quality-row"><small>${quality}</small><div class="weather-aqi-scale">${hasAqi ? '<i style="left:' + Math.min(100, Math.max(0, aqi / 300 * 100)) + '%"></i>' : ''}</div></div></div>
      <div class="weather-data-panel"><span class="weather-panel-heading">Облачность <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 19a5 5 0 1 1 1-10 6 6 0 1 1 10 10Z"/></svg></span><strong>${metric(cur.cloud_cover)}%</strong><div class="weather-quality-row"><small>${Number.isFinite(cur.cloud_cover) ? cur.cloud_cover <= 20 ? 'Ясное небо' : cur.cloud_cover <= 70 ? 'Переменная' : 'Облачно' : 'Нет данных'}</small><div class="weather-cloud-scale"><i style="width:${Number.isFinite(cur.cloud_cover) ? Math.min(100, Math.max(0, cur.cloud_cover)) : 0}%"></i></div></div></div>
    </div>
    <a class="weather-source" href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo · CAMS</a>
  </section>`;
}

async function loadWeather(isRetry) {
  const request = ++weatherRequest;
  const weatherEl = document.getElementById('weatherWidget');
  let savedCity = lsSafe(() => localStorage.getItem('user_city'), null);
  if (!savedCity || !CITY_COORDS[savedCity]) {
    savedCity = 'Караганда';
    lsSafe(() => localStorage.setItem('user_city', savedCity));
  }

  if (!isRetry) weatherEl.textContent = savedCity + ' · …';
  const location = CITY_COORDS[savedCity];

  try {
    const data = await fetchWeather(location);
    if (request !== weatherRequest) return;
    const temp = Math.round(data.current.temperature_2m);
    weatherEl.textContent = `${savedCity} · ${temp > 0 ? '+' + temp : temp}°`;
  } catch (e) {
    if (request !== weatherRequest) return;
    if (!isRetry) {
      setTimeout(() => { if (request === weatherRequest) loadWeather(true); }, 4000);
      weatherEl.textContent = savedCity + ' · —°';
    } else {
      weatherEl.textContent = savedCity + ' · —°';
    }
  }
}

let pendingCity = 'Караганда';

function renderCityList(filterText = '') {
  const list = document.getElementById('cityList');
  if (!list) return;
  const query = filterText.trim().toLowerCase();
  const names = Object.keys(CITY_COORDS).filter(name =>
    !query || name.toLowerCase().includes(query)
  );

  if (names.length === 0) {
    list.innerHTML = '<div class="city-list-empty">город не найден</div>';
    return;
  }

  list.innerHTML = names.map(name => `
    <div class="city-list-item${name === pendingCity ? ' selected' : ''}" data-action="selectCityListItem('${name.replace(/'/g, "\\'")}')">
      ${name}
    </div>
  `).join('');
}

function filterCityList(value) { renderCityList(value); }

function selectCityListItem(name) {
  haptic('light');
  pendingCity = name;
  renderCityList(document.getElementById('citySearchInput').value);
}

let bodyScrollLockY = 0;
function appScroller() {
  return document.querySelector('.app-wrapper') || document.scrollingElement;
}
function scrollAppTo(options) {
  const scroller = appScroller();
  if (scroller?.scrollTo) scroller.scrollTo(options);
}
function lockBodyScroll() {
  const scroller = appScroller();
  bodyScrollLockY = scroller?.scrollTop || 0;
  scroller?.classList.add('app-scroll-locked');
}
function unlockBodyScroll() {
  const scroller = appScroller();
  scroller?.classList.remove('app-scroll-locked');
  if (scroller) scroller.scrollTop = bodyScrollLockY;
}

function openCityModal() {
  haptic('light');
  const modal = document.getElementById('cityModal');
  const searchInput = document.getElementById('citySearchInput');
  pendingCity = lsSafe(() => localStorage.getItem('user_city'), null) || 'Караганда';
  searchInput.value = '';
  renderCityList('');
  modal.classList.add('active');
  lockBodyScroll();
}

function closeCityModal() {
  haptic('light');
  document.getElementById('cityModal').classList.remove('active');
  unlockBodyScroll();
}

function saveCityAndLoad() {
  if (pendingCity && CITY_COORDS[pendingCity]) {
    haptic('medium');
    lsSafe(() => localStorage.setItem('user_city', pendingCity));
    closeCityModal();
    loadWeather();
    dayOffWeatherCache = { city: null, data: null, timestamp: 0 };
    fillDayOffWeather();
  }
}

function openBellsModal() {
  haptic('light');
  document.getElementById('bellsModal').classList.add('active');
  lockBodyScroll();
}

function closeBellsModal() {
  haptic('light');
  document.getElementById('bellsModal').classList.remove('active');
  unlockBodyScroll();
}

// ==================================================================
// ============ АКЦЕНТНЫЕ ТЕМЫ ============
// ==================================================================

const ACCENT_THEMES = [
  { id: 'default', name: 'Стандартный', hex: '#9EBAC4', text: '#20353C' },
  { id: 'lime', name: 'Лайм', hex: '#A3E635', text: '#1F2937' },
  { id: 'emerald', name: 'Изумруд', hex: '#065F46', text: '#FFFFFF' },
  { id: 'burgundy', name: 'Бургунди', hex: '#7F1D1D', text: '#FFFFFF' },
  { id: 'coral', name: 'Коралл', hex: '#FF7F50', text: '#FFFFFF' },
  { id: 'plum', name: 'Слива', hex: '#6D28D9', text: '#FFFFFF' },
  { id: 'terracotta', name: 'Терракота', hex: '#C2410C', text: '#FFFFFF' }
];
const ACCENT_CSS_PROPS = ['--accent', '--accent-text', '--accent-rgb', '--highlight-border', '--highlight-bg', '--progress-bg', '--accent-tint-strong', '--accent-tint-soft', '--accent-day', '--accent-night', '--background-tint-rgb', '--flame-start', '--flame-end', '--flame-ink'];
let currentAccentId = 'default';
let pendingAccentId = 'default';
let accentBeforePreview = 'default';

function accentGradientText(r, g, b) {
  const luminance = channels => channels.map(value => {
    const srgb = value / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
  const start = luminance([r, g, b]);
  const end = luminance([r, g, b].map(value => Math.round(value + (255 - value) * 0.08)));
  const dark = luminance([23, 32, 39]);
  const darkContrast = (Math.min(start, end) + 0.05) / (dark + 0.05);
  const lightContrast = 1.05 / (Math.max(start, end) + 0.05);
  return darkContrast >= lightContrast ? '#172027' : '#FFFFFF';
}

function hexToRgbTriple(hex) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function applyAccentTheme(id, persist = true) {
  const root = document.documentElement.style;
  if (id === 'default') {
    ACCENT_CSS_PROPS.forEach(prop => root.removeProperty(prop));
  } else {
    const theme = ACCENT_THEMES.find(t => t.id === id);
    if (!theme) return;
    const { r, g, b } = hexToRgbTriple(theme.hex);
    const rgbStr = `${r}, ${g}, ${b}`;
    const mix = (amount, target) => `rgb(${[r, g, b].map(value => Math.round(value + (target - value) * amount)).join(', ')})`;
    root.setProperty('--accent-day', mix(0.45, 0));
    root.setProperty('--accent-night', mix(0.55, 255));
    root.setProperty('--accent', 'var(--selected-accent)');
    root.setProperty('--accent-text', 'var(--selected-accent-text)');
    root.setProperty('--accent-rgb', rgbStr);
    root.setProperty('--background-tint-rgb', rgbStr);
    root.setProperty('--flame-start', theme.hex);
    root.setProperty('--flame-end', mix(0.08, 255));
    root.setProperty('--flame-ink', accentGradientText(r, g, b));
    root.setProperty('--highlight-border', 'var(--accent)');
    root.setProperty('--highlight-bg', `rgba(${rgbStr}, 0.08)`);
    root.setProperty('--progress-bg', `var(--line)`);
    root.setProperty('--accent-tint-strong', `rgba(${rgbStr}, 0.16)`);
    root.setProperty('--accent-tint-soft', `rgba(${rgbStr}, 0.06)`);
  }
  currentAccentId = id;
  if (persist) lsSafe(() => localStorage.setItem('user_accent', id));
}

function renderAccentSwatches() {
  const grid = document.getElementById('accentSwatchGrid');
  if (!grid) return;
  const colorThemes = ACCENT_THEMES.filter(t => t.id !== 'default');
  grid.innerHTML = colorThemes.map(t => `
    <button class="accent-swatch${t.id === pendingAccentId ? ' selected' : ''}" style="background:${t.hex}; color:${t.text};" data-action="selectAccentSwatch('${t.id}')">
      <span class="accent-swatch-check">✓</span>
      <span class="accent-swatch-label">${t.name}</span>
      <span class="accent-swatch-hex">${t.hex}</span>
    </button>
  `).join('');

  const defaultBtn = document.getElementById('accentDefaultBtn');
  if (defaultBtn) defaultBtn.classList.toggle('selected', pendingAccentId === 'default');
}

function selectAccentSwatch(id) {
  haptic('light');
  pendingAccentId = id;
  applyAccentTheme(id, false);
  renderAccentSwatches();
}

function saveAccentTheme() {
  haptic('medium');
  applyAccentTheme(pendingAccentId);
  accentBeforePreview = pendingAccentId;
  closeAccentModal();
}

function openAccentModal() {
  haptic('light');
  accentBeforePreview = currentAccentId;
  pendingAccentId = currentAccentId;
  renderAccentSwatches();
  document.getElementById('accentModal').classList.add('active');
  lockBodyScroll();
}

function closeAccentModal() {
  haptic('light');
  applyAccentTheme(accentBeforePreview, false);
  document.getElementById('accentModal').classList.remove('active');
  unlockBodyScroll();
}

// ==================================================================
// ============ ОТРИСОВКА И ИНДИКАТОРЫ ============
// ==================================================================

const contentAnimations = new WeakMap();
function swapContent(container, html, animate = true, onInserted) {
  contentAnimations.get(container)?.cancel();
  contentAnimations.delete(container);
  container.classList.remove('content-hidden');
  container.innerHTML = html;
  if (onInserted) onInserted();
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (animate && !document.hidden && !reduced && container.animate) {
    const transition = container.animate([
      { opacity: 0, transform: 'translateY(6px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ], { duration: 240, easing: 'cubic-bezier(.16,1,.3,1)' });
    contentAnimations.set(container, transition);
  }
}

function updateDayIndicator() {
  const activeBtn = document.querySelector('.day-btn.active');
  const indicator = document.getElementById('dayIndicator');
  const daysGrid = document.getElementById('daysGrid');
  if (activeBtn && indicator && daysGrid.style.display !== 'none') {
    indicator.style.width = activeBtn.offsetWidth + 'px';
    indicator.style.height = activeBtn.offsetHeight + 'px';
    indicator.style.transform = `translateX(${activeBtn.offsetLeft - 3}px)`;
    indicator.style.opacity = '1';
  } else if (indicator) {
    indicator.style.opacity = '0';
  }
}

function initIndicatorsNoAnim() {
  const dayIndicator = document.getElementById('dayIndicator');
  dayIndicator.style.transition = 'none';
  updateDayIndicator();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      dayIndicator.style.transition = '';
    });
  });
}

function updateTabIndicator() {
  const active = document.querySelector('.bottom-tab-btn.active');
  const ind = document.getElementById('tabIndicator');
  if (!active || !ind) return;
  ind.style.width = active.offsetWidth + 'px';
  ind.style.height = active.offsetHeight + 'px';
  ind.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
  ind.style.opacity = '1';
}

function initTabIndicatorNoAnim() {
  const ind = document.getElementById('tabIndicator');
  if (!ind) return;
  ind.style.transition = 'none';
  updateTabIndicator();
  requestAnimationFrame(() => requestAnimationFrame(() => { ind.style.transition = ''; }));
}

window.addEventListener('resize', () => {
  updateDayIndicator();
  updateTabIndicator();
});

function timeToMins(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function dayHasClasses(dayName) {
  return Array.isArray(SCHEDULE[dayName]) && SCHEDULE[dayName].length > 0;
}

const WEEKDAY_ORDER = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

function formatRoomLabel(item) {
  if (!item) return '';
  return item.room || '';
}

function getUpcomingHintInLoadedWeek(afterDayName) {
  const startIdx = WEEKDAY_ORDER.indexOf(afterDayName);
  for (let idx = startIdx + 1; idx < WEEKDAY_ORDER.length; idx++) {
    const dayName = WEEKDAY_ORDER[idx];
    const times = getLessonTimesForDay(dayName);
    const lessons = (SCHEDULE[dayName] || [])
      .slice()
      .sort((a, b) => parseInt(a.пара, 10) - parseInt(b.пара, 10));
    if (lessons.length > 0) {
      const first = lessons[0];
      const t = times[first.пара];
      const timeStr = t ? t.start : '?';
      const shortDay = getShortDayName(dayName) || dayName;
      return `<strong>${escapeHtml(first.sub)}</strong> — ${escapeHtml(shortDay)}, ${escapeHtml(timeStr)}, ${escapeHtml(formatRoomLabel(first))}`;
    }
  }
  return 'на этой неделе пар больше нет — глянь следующую неделю стрелкой сверху';
}

function weatherSkeletonHtml() {
  return `
    <div class="weather-skeleton">
      <div class="weather-skeleton-row">
        <div class="weather-skeleton-block" style="width:60px; height:24px;"></div>
        <div class="weather-skeleton-block" style="width:90px; height:18px;"></div>
      </div>
      <div class="weather-skeleton-row">
        <div class="weather-skeleton-block" style="width:100px; height:12px;"></div>
        <div class="weather-skeleton-block" style="width:60px; height:12px;"></div>
      </div>
    </div>
  `;
}

function buildDayOffScreen(dayName) {
  const hint = getUpcomingHintInLoadedWeek(dayName);
  const isActuallyToday = dayName === realTodayName && isViewingTrueCurrentWeek();
  const title = isActuallyToday ? 'Сегодня без пар' : `${dayName}: пар нет`;
  return `
    <div class="notice-panel">
      <span class="notice-eyebrow">выходной</span>
      <div class="notice-title">${title}</div>
      <div class="day-off-weather" id="dayOffWeatherDetail">${weatherSkeletonHtml()}</div>
      <div class="notice-divider"></div>
      <div class="notice-hint">
        <span class="notice-hint-label">ближайшая пара</span>
        ${hint}
      </div>
    </div>
  `;
}

function buildDayFinishedScreen(dayName) {
  const hint = getUpcomingHintInLoadedWeek(dayName);
  return `
    <div class="notice-panel">
      <span class="notice-eyebrow">на сегодня всё</span>
      <div class="notice-title">${dayName}: пары закончились</div>
      <div class="day-off-weather" id="dayOffWeatherDetail">${weatherSkeletonHtml()}</div>
      <div class="notice-divider"></div>
      <div class="notice-hint">
        <span class="notice-hint-label">ближайшая пара</span>
        ${hint}
      </div>
    </div>
  `;
}

function getDayLastLessonEndMins(dayName) {
  const lessons = SCHEDULE[dayName] || [];
  const times = getLessonTimesForDay(dayName);
  let maxEnd = null;
  lessons.forEach(l => {
    const t = times[l.пара];
    if (t) {
      const endMins = timeToMins(t.end);
      if (maxEnd === null || endMins > maxEnd) maxEnd = endMins;
    }
  });
  return maxEnd;
}

let currentSection = 'schedule';
let selectedDay = 'Понедельник';
let realTodayName = 'Понедельник';

function isViewingTrueCurrentWeek() {
  return !!(browsedWeekInfo && trueCurrentWeekInfo &&
    browsedWeekInfo.studyYear === trueCurrentWeekInfo.studyYear &&
    browsedWeekInfo.term === trueCurrentWeekInfo.term &&
    browsedWeekInfo.week === trueCurrentWeekInfo.week);
}

const DAY_NAMES_BY_INDEX = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

function detectToday(resetSelected = false) {
  realTodayName = DAY_NAMES_BY_INDEX[new Date().getDay()];
  if (resetSelected) {
    selectedDay = realTodayName === 'Воскресенье' ? 'Понедельник' : realTodayName;
  }

  document.querySelectorAll('.day-btn').forEach(btn => btn.classList.remove('is-today'));
  const shortName = getShortDayName(realTodayName);
  if (shortName) {
    const todayBtnEl = document.getElementById(`btn-${shortName}`);
    if (todayBtnEl) todayBtnEl.classList.add('is-today');
  }
  updateWeekendBadge();
}

let weekendBadgeHideTimer = null;

function updateWeekendBadge() {
  const badge = document.getElementById('weekendBadge');
  if (!badge) return;
  const hasOwnButton = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'].includes(realTodayName);
  const shouldShow = !hasOwnButton;

  if (weekendBadgeHideTimer) {
    clearTimeout(weekendBadgeHideTimer);
    weekendBadgeHideTimer = null;
  }

  if (shouldShow) {
    if (badge.style.display !== 'block') {
      badge.style.display = 'block';
      void badge.offsetWidth;
    }
    badge.classList.add('active');
    requestAnimationFrame(updateDayIndicator);
  } else {
    badge.classList.remove('active');
    weekendBadgeHideTimer = setTimeout(() => {
      badge.style.display = 'none';
      weekendBadgeHideTimer = null;
      updateDayIndicator();
    }, 220);
  }
}

function getShortDayName(fullDay) {
  const shortNames = {
    'Понедельник': 'ПН', 'Вторник': 'ВТ', 'Среда': 'СР', 'Четверг': 'ЧТ',
    'Пятница': 'ПТ', 'Суббота': 'СБ', 'Воскресенье': 'ВС'
  };
  return shortNames[fullDay] || null;
}

function updateWeekStepperUI() {
  const label = document.getElementById('weekStepLabel');
  const prevBtn = document.getElementById('weekPrevBtn');
  const nextBtn = document.getElementById('weekNextBtn');
  if (!label) return;

  const displayWeek = browsedWeekInfo.week;
  const parityLabel = displayWeek % 2 === 1 ? 'Числитель' : 'Знаменатель';
  label.textContent = `Неделя ${displayWeek} · ${parityLabel}`;
  label.classList.toggle('is-current', isViewingTrueCurrentWeek());
  if (prevBtn) prevBtn.disabled = displayWeek <= 1;
  if (nextBtn) nextBtn.disabled = displayWeek >= MAX_TERM_WEEKS;
}

function toggleWeekParity() {
  const current = Number(browsedWeekInfo.week);
  const nextWeek = current < MAX_TERM_WEEKS ? current + 1 : current - 1;
  stepWeek(nextWeek - current);
}

function stepWeek(delta) {
  const nextWeek = Number(browsedWeekInfo.week) + delta;
  if (nextWeek < 1 || nextWeek > MAX_TERM_WEEKS) return;

  haptic('light');
  browsedWeekInfo = { ...browsedWeekInfo, week: nextWeek };
  SCHEDULE = buildScheduleForWeek(nextWeek);
  detectToday();
  updateStatusBarAndLive();
  updateWeekStepperUI();
  renderSchedule();
}

function updateStatusBarAndLive() {
  const statusText = document.getElementById('weekStatusText');
  const badgeEl = document.getElementById('liveLessonBadge');
  const todayBtn = document.getElementById('todayBtn');

  const viewingTrueCurrent = isViewingTrueCurrentWeek();
  const effectiveTodayDay = realTodayName === 'Воскресенье' ? 'Понедельник' : realTodayName;
  const isTodaySelected = selectedDay === effectiveTodayDay && viewingTrueCurrent;
  todayBtn.style.display = isTodaySelected ? 'none' : 'flex';

  const eyebrowLabel = (selectedDay === realTodayName && viewingTrueCurrent)
    ? 'Сегодня · ШИ-9-23'
    : 'Расписание · ШИ-9-23';
  statusText.innerHTML = `<span class="masthead-eyebrow">${eyebrowLabel}</span><span class="masthead-headline">${selectedDay}</span>`;

  const liveSchedule = viewingTrueCurrent ? SCHEDULE : trueCurrentSchedule;
  const todayTimes = getLessonTimesForDay(realTodayName);
  const todayLessons = liveSchedule[realTodayName] || [];

  if (todayLessons.length === 0) {
    badgeEl.innerHTML = `<span class="live-dot"></span><span>сегодня без пар</span>`;
    badgeEl.classList.remove('pulse-live');
    return;
  }

  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();

  let currentParaNum = null;
  let currentParaLabel = null;
  let nextParaInfo = null;

  for (const item of todayLessons) {
    const t = todayTimes[item.пара];
    if (!t) continue;
    const startMins = timeToMins(t.start);
    const endMins = timeToMins(t.end);

    if (currentMins >= startMins && currentMins <= endMins) {
      currentParaNum = item.пара;
      currentParaLabel = t.label || `пара №${item.пара}`;
      break;
    } else if (currentMins < startMins) {
      if (!nextParaInfo) nextParaInfo = { label: t.label || `пара №${item.пара}`, start: t.start };
    }
  }

  if (currentParaNum) {
    const t = todayTimes[currentParaNum];
    const endMins = timeToMins(t.end);
    const leftMins = endMins - currentMins;
    badgeEl.innerHTML = `<span class="live-dot"></span><span>идёт ${currentParaLabel} — ещё ${leftMins} мин</span>`;
  } else if (nextParaInfo) {
    badgeEl.innerHTML = `<span class="live-dot"></span><span>далее — ${nextParaInfo.label} в ${nextParaInfo.start}</span>`;
  } else {
    badgeEl.innerHTML = `<span class="live-dot"></span><span>пары на сегодня закончены</span>`;
  }
  badgeEl.classList.toggle('pulse-live', !!currentParaNum);
}

function jumpToToday() {
  haptic('light');
  trueCurrentWeekInfo = detectCurrentStudyPeriod();
  trueCurrentSchedule = buildScheduleForWeek(trueCurrentWeekInfo.week);
  browsedWeekInfo = { ...trueCurrentWeekInfo };
  SCHEDULE = buildScheduleForWeek(browsedWeekInfo.week);
  updateWeekStepperUI();
  const targetDay = realTodayName === 'Воскресенье' ? 'Понедельник' : realTodayName;
  selectDay(targetDay, null, true);
}

const refreshingTabs = new Set();
const tabTurns = new Map();
function animateTabRefresh(section) {
  if (tabTurns.has(section)) return tabTurns.get(section);
  const button = document.getElementById('section-' + section);
  if (!button) return Promise.resolve();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced) button.classList.add('tab-refreshing');
  const turn = new Promise(resolve => setTimeout(() => {
    if (tabTurns.get(section) === turn) {
      button.classList.remove('tab-refreshing');
      tabTurns.delete(section);
    }
    resolve();
  }, reduced ? 0 : 800));
  tabTurns.set(section, turn);
  return turn;
}

async function tapTab(section) {
  if (refreshingTabs.has(section)) return;
  refreshingTabs.add(section);
  const button = document.getElementById('section-' + section);
  if (button) button.setAttribute('aria-busy', 'true');
  haptic('light');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const turn = animateTabRefresh(section);
  scrollAppTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  try {
    detectToday();
    updateStatusBarAndLive();
    renderSchedule(false);
    await turn;
  } finally {
    refreshingTabs.delete(section);
    if (button) button.removeAttribute('aria-busy');
  }
}

function selectDay(dayName, btnElement, force = false) {
  if (!force && dayName === selectedDay) return;
  if (!force) haptic('light');
  const previousDay = selectedDay;
  selectedDay = dayName;
  document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
  if (btnElement) {
    btnElement.classList.add('active');
  } else {
    const shortName = getShortDayName(dayName);
    const targetBtn = shortName ? document.getElementById(`btn-${shortName}`) : null;
    if (targetBtn) targetBtn.classList.add('active');
  }
  updateDayIndicator();
  renderSchedule(false);
  if (!force) window.unilinkMotion?.day(document.getElementById('scheduleContainer'), previousDay, dayName);
  updateStatusBarAndLive();
}

let lastRenderedScreenKey = '';

function lessonParts(item) {
  const title = String(item.sub || '');
  const name = item.subjectTitle || title;
  const type = item.lessonType || '';
  return { name, type };
}

function getScheduleShareSnapshot() {
  if (!browsedWeekInfo) return null;
  const dayTimes = getLessonTimesForDay(selectedDay);
  return {
    day: selectedDay,
    week: browsedWeekInfo.week,
    year: browsedWeekInfo.studyYear,
    term: browsedWeekInfo.term,
    group: STUDENT_GROUP_LABEL,
    lessons: (SCHEDULE[selectedDay] || []).slice()
      .sort((a, b) => parseInt(a.пара, 10) - parseInt(b.пара, 10))
      .map(item => ({
        ...lessonParts(item),
        teacher: item.teacher || '',
        room: formatRoomLabel(item),
        start: dayTimes[item.пара]?.start || '—',
        end: dayTimes[item.пара]?.end || '—'
      }))
  };
}

function lessonTitleHtml(item) {
  return '<span class="lesson-subject-wrap">' + escapeHtml(lessonParts(item).name) + '</span>';
}

function lessonTypeHtml(item) {
  const type = lessonParts(item).type;
  return type ? '<span class="lesson-type-name">' + escapeHtml(type) + '</span>' : '';
}

function renderSchedule(animate = true) {
  const container = document.getElementById('scheduleContainer');
  const dayTimes = getLessonTimesForDay(selectedDay);
  const lessons = (SCHEDULE[selectedDay] || [])
    .slice()
    .sort((a, b) => parseInt(a.пара, 10) - parseInt(b.пара, 10));

  const weekKey = `${browsedWeekInfo.studyYear}-${browsedWeekInfo.term}-${browsedWeekInfo.week}`;
  const isViewingLiveToday = isViewingTrueCurrentWeek() && selectedDay === realTodayName;

  if (isViewingLiveToday && lessons.length > 0) {
    const lastEndMins = getDayLastLessonEndMins(selectedDay);
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    if (lastEndMins !== null && nowMins > lastEndMins + 30) {
      const screenKey = `${selectedDay}|${weekKey}|finished`;
      lastRenderedScreenKey = screenKey;
      const html = buildDayFinishedScreen(selectedDay);
      swapContent(container, html, animate, fillDayOffWeather);
      return;
    }
  }

  if (lessons.length === 0) {
    const screenKey = `${selectedDay}|${weekKey}|off`;
    lastRenderedScreenKey = screenKey;
    const html = buildDayOffScreen(selectedDay);
    swapContent(container, html, animate, fillDayOffWeather);
    return;
  }

  const screenKey = `${selectedDay}|${weekKey}|schedule`;
  const animateCardsEntrance = screenKey !== lastRenderedScreenKey;
  lastRenderedScreenKey = screenKey;

  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  let activeParaNow = null;
  let progressPercent = 0;

  if (isViewingLiveToday) {
    for (const item of lessons) {
      const t = dayTimes[item.пара];
      if (t) {
        const startMins = timeToMins(t.start);
        const endMins = timeToMins(t.end);
        if (currentMins >= startMins && currentMins <= endMins) {
          activeParaNow = item.пара;
          const totalDuration = endMins - startMins;
          const elapsed = currentMins - startMins;
          progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
          break;
        }
      }
    }
  }

  let rowsHtml = '';
  lessons.forEach((item, index) => {
    const isActive = (item.пара === activeParaNow);
    let rowClass = isActive ? 'list-row is-live' : 'list-row';
    let rowStyle = '';
    if (animateCardsEntrance) {
      rowClass += ' row-enter';
      rowStyle = ` style="animation-delay: ${Math.min(index, 6) * 0.05}s;"`;
    }

    let progressBarHtml = '';
    if (isActive) {
      progressBarHtml = `
        <div class="lesson-progress-container">
          <div class="lesson-progress-bar" style="width: ${progressPercent}%"></div>
        </div>
      `;
    }

    const t = dayTimes[item.пара];
    const startTime = t ? t.start : '?';
    const endTime = t ? t.end : '?';

    rowsHtml += `
      <div class="lesson-event${isActive ? ' is-current' : ''}">
        <div class="row-index" aria-label="${escapeHtml(startTime)} — ${escapeHtml(endTime)}">
          <span class="row-index-main">${escapeHtml(startTime)}</span>
          <span class="row-index-sub">${escapeHtml(endTime)}</span>
        </div>
        <div class="${rowClass}"${rowStyle}>
          ${isActive ? '<span class="lesson-live-aura" aria-hidden="true"></span><span class="lesson-live-orbit" aria-hidden="true"></span>' : ''}
          <div class="row-body">
            <div class="row-top">
              <span class="row-title" title="${escapeHtml(item.sub)}">${lessonTitleHtml(item)}</span>
            </div>
            <div class="lesson-kind-row">
              ${lessonTypeHtml(item)}
              ${isActive ? '<span class="live-tag"><span class="live-dot pulse-live-tag"></span>сейчас</span>' : ''}
            </div>
            <div class="row-meta">${escapeHtml(item.teacher || '')}</div>
            <div class="row-meta row-meta-room">${escapeHtml(formatRoomLabel(item))}</div>
            ${progressBarHtml}
          </div>
        </div>
      </div>
    `;
  });

  const html = `<div class="list-card">${rowsHtml}</div>`;
  swapContent(container, html, animate);
}

document.addEventListener('DOMContentLoaded', () => {
  const savedAccent = lsSafe(() => localStorage.getItem('user_accent'), null) || 'default';
  applyAccentTheme(savedAccent, false);
  detectToday(true);
  updateStatusBarAndLive();
  updateWeekStepperUI();
  selectDay(selectedDay, null, true);
  setTimeout(loadWeather, 400);
  initIndicatorsNoAnim();
  initTabIndicatorNoAnim();

  if (document.fonts && document.fonts.ready) {
    const alignIndicators = () => {
      updateDayIndicator();
      updateTabIndicator();
    };
    document.fonts.ready.then(alignIndicators);
    document.fonts.addEventListener('loadingdone', alignIndicators);
  }

  const refreshLiveUI = () => {
    if (document.hidden) return;
    detectToday();
    updateStatusBarAndLive();
    if (isViewingTrueCurrentWeek() && selectedDay === realTodayName && dayHasClasses(realTodayName)) {
      renderSchedule(false);
    }
  };
  setInterval(refreshLiveUI, 15000);
  document.addEventListener('visibilitychange', refreshLiveUI);
  window.dispatchEvent(new Event('univer-ready'));
});
