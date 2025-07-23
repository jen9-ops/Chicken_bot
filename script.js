const egg = document.querySelector('.egg');
const crack1 = document.getElementById('crack1');
const crack2 = document.getElementById('crack2');
const eggContainer = document.getElementById('egg-container');
const chicken = document.getElementById('chicken');
const caption = document.getElementById('caption');

// Начальные подписи
const captions = [
  "В одном уютном гнезде лежит яйцо.",
  "Оно ждёт своего часа и немного качается...",
  "Слушай, кажется внутри что-то шевелится!",
  "Вдруг на скорлупе появились трещинки...",
  "Ещё чуть-чуть...",
  "Из яйца появляется цыплёнок! Ура!"
];

// Тайминги для сцен (секунды)
const timings = [0, 1.7, 3.5, 5, 6, 7.2];

caption.textContent = captions[0];

// Сцена 1 — просто яйцо качается
setTimeout(() => { caption.textContent = captions[1]; }, 1100);
// Сцена 2 — шевеление
setTimeout(() => { caption.textContent = captions[2]; }, 1800);
// Сцена 3 — появляются трещины
setTimeout(() => {
  crack1.style.opacity = 1;
  eggContainer.classList.add('cracking');
  caption.textContent = captions[3];
}, 3500);
// Сцена 4 — вторая трещина
setTimeout(() => {
  crack2.style.opacity = 1;
  caption.textContent = captions[4];
}, 5000);
// Сцена 5 — яйцо "открывается"
setTimeout(() => {
  eggContainer.classList.remove('cracking');
  eggContainer.classList.add('open');
}, 6000);
// Сцена 6 — появляется цыплёнок
setTimeout(() => {
  chicken.classList.remove('hide');
  caption.textContent = captions[5];
  eggContainer.style.opacity = 0.3;
}, 7200);
