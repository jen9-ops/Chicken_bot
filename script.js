const egg = document.querySelector('.egg');
const crack1 = document.getElementById('crack1');
const crack2 = document.getElementById('crack2');
const eggContainer = document.getElementById('egg-container');
const chicken = document.getElementById('chicken');
const caption = document.getElementById('caption');
const soundBtn = document.getElementById('sound-btn');
const bgMusic = document.getElementById('bg-music');

const captions = [
  "В одном уютном гнезде лежит яйцо...",
  "Яйцо покачивается сильнее — внутри кто-то есть!",
  "Оно почти затихло... Но вдруг начинает подпрыгивать!",
  "Появляется первая трещинка!",
  "Скорлупа трещит всё больше...",
  "Ещё чуть-чуть...",
  "Смотри, цыплёнок вылупился! Поздравляем!"
];

caption.textContent = captions[0];

// --- Мелодия: по кнопке ---
let musicStarted = false;
soundBtn.addEventListener('click', function() {
  bgMusic.currentTime = 0;
  bgMusic.volume = 0.32;
  bgMusic.play();
  soundBtn.style.display = 'none';
  musicStarted = true;
});
// Автоматически убрать кнопку, если пользователь сам запустил звук
bgMusic.addEventListener('play', ()=> soundBtn.style.display='none');

// Сцена 1 — просто яйцо качается
setTimeout(() => { caption.textContent = captions[1]; }, 1400);
// Сцена 2 — подпрыгивания
setTimeout(() => { caption.textContent = captions[2]; }, 3400);
// Сцена 3 — трещина
setTimeout(() => {
  crack1.style.opacity = 1;
  eggContainer.classList.add('cracking');
  caption.textContent = captions[3];
}, 5200);
// Сцена 4 — вторая трещина
setTimeout(() => {
  crack2.style.opacity = 1;
  caption.textContent = captions[4];
}, 6400);
// Сцена 5 — яйцо "открывается"
setTimeout(() => {
  eggContainer.classList.remove('cracking');
  eggContainer.classList.add('open');
  caption.textContent = captions[5];
}, 7400);
// Сцена 6 — появляется цыплёнок
setTimeout(() => {
  chicken.classList.remove('hide');
  caption.textContent = captions[6];
  eggContainer.style.opacity = 0.35;
}, 9000);

// --- Мелодия автозапуск, если можно ---
window.addEventListener('touchstart', autoPlayOnce, {passive:true});
window.addEventListener('mousedown', autoPlayOnce, {passive:true});
function autoPlayOnce() {
  if (!musicStarted) {
    bgMusic.volume = 0.32;
    bgMusic.play().catch(()=>{});
    soundBtn.style.display = 'none';
    musicStarted = true;
  }
  window.removeEventListener('touchstart', autoPlayOnce);
  window.removeEventListener('mousedown', autoPlayOnce);
}
