// ----- Звёзды -----
const stars = document.getElementById('stars');
function addStars(num = 34) {
  stars.innerHTML = '';
  for (let i = 0; i < num; i++) {
    let r = Math.random();
    let x = Math.random() * 420;
    let y = Math.random() * 240 + 10;
    let s = 0.7 + Math.random() * 1.3;
    let o = 0.27 + Math.random() * 0.65;
    let c = r > 0.9 ? "#f5ffcf" : r > 0.7 ? "#b9e3f9" : "#fff";
    let shape = Math.random() > 0.9
      ? `<polygon points="${x},${y} ${x+s},${y+s*2.2} ${x-s},${y+s*2.2}" fill="${c}" opacity="${o}"/>`
      : `<ellipse cx="${x}" cy="${y}" rx="${s}" ry="${s*0.83}" fill="${c}" opacity="${o}"/>`;
    stars.innerHTML += shape;
  }
}
addStars();

// ---- Анимация: метеорит ----
const comet = document.getElementById('comet');
const eggGroup = document.getElementById('eggGroup');
const eggMain = document.getElementById('eggMain');
const eggGlow = document.getElementById('eggGlow');
const crack1 = document.getElementById('crack1');
const crack2 = document.getElementById('crack2');
const chickGroup = document.getElementById('chickGroup');
const caption = document.getElementById('caption');
const choicePanel = document.getElementById('choicePanel');
const finalPanel = document.getElementById('finalPanel');
const restartBtn = document.getElementById('restartBtn');

function resetScene() {
  comet.setAttribute('transform', '');
  eggGroup.setAttribute('transform', '');
  eggGroup.style.opacity = '1';
  eggMain.setAttribute('fill', 'url(#egg-grad)');
  eggGlow.setAttribute('opacity', '0');
  crack1.setAttribute('opacity', '0');
  crack2.setAttribute('opacity', '0');
  chickGroup.setAttribute('opacity', '0');
  caption.textContent = "В одну волшебную ночь с неба падает космический метеорит...";
  choicePanel.classList.add('hide');
  finalPanel.classList.add('hide');
}

function playIntro() {
  resetScene();
  // Комета летит вниз
  comet.animate([
    { transform: "translate(0,0)" },
    { transform: "translate(90px,290px)" }
  ], { duration: 1150, fill: "forwards", easing: "ease-in" });
  setTimeout(()=>comet.setAttribute('transform', 'translate(90,290)'), 1150);

  setTimeout(() => {
    caption.textContent = "Это яйцо-метеорит! Оно светится и манит приключениями...";
    eggGlow.setAttribute('opacity', '0.31');
    eggGlow.animate([{ opacity: 0.06 }, { opacity: 0.43 }, { opacity: 0.12 }, { opacity: 0.32 }], {duration: 900, iterations: 3});
  }, 1200);

  setTimeout(() => {
    caption.textContent = "Яйцо начинает трещать и... из него кто-то появляется!";
    crack1.setAttribute('opacity', '1');
    eggGroup.animate([{transform: "rotate(-7 210 300)"},{transform: "rotate(7 210 300)"},{transform: "rotate(0 210 300)"}],{duration:900});
  }, 2250);

  setTimeout(() => {
    crack2.setAttribute('opacity', '1');
    eggGlow.setAttribute('opacity', '0.17');
    eggMain.setAttribute('fill', '#fffde6');
    eggGroup.animate([{transform: "translate(0,0)"},{transform: "translate(-8,6)"}],{duration:650});
  }, 3150);

  setTimeout(() => {
    // Появляется цыплёнок
    eggGlow.setAttribute('opacity', '0');
    chickGroup.setAttribute('opacity', '1');
    caption.textContent = "Кто же вылупился? Сейчас узнаем!";
    showChick("normal");
    chickGroup.animate([
      { opacity: 0, transform: "translateY(70px) scale(0.82)" },
      { opacity: 1, transform: "translateY(0px) scale(1.1)" },
      { opacity: 1, transform: "translateY(-7px) scale(1.04)" },
      { opacity: 1, transform: "translateY(0px) scale(1.00)" }
    ], { duration: 900, easing: "cubic-bezier(.57,1.35,.62,1)" });
    eggGroup.style.opacity = "0.18";
  }, 4100);

  setTimeout(() => {
    // Выбор стиля
    caption.textContent = "";
    choicePanel.classList.remove('hide');
  }, 5600);
}

function showChick(style) {
  // Элементы цыплёнка
  let head = document.getElementById('chickHead');
  let body = document.getElementById('chickBody');
  let beak = document.getElementById('chickBe
