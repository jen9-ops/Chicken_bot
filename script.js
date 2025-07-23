// ----- Звёзды -----
const stars = document.getElementById('stars');
function addStars(num = 28) {
  stars.innerHTML = '';
  for (let i = 0; i < num; i++) {
    let r = Math.random();
    let x = Math.random() * 420;
    let y = Math.random() * 240 + 10;
    let s = 1.0 + Math.random() * 1.4;
    let o = 0.33 + Math.random() * 0.55;
    let c = r > 0.8 ? "#f5ffcf" : r > 0.6 ? "#b9e3f9" : "#fff";
    let shape = Math.random() > 0.9
      ? `<polygon points="${x},${y} ${x+s},${y+s*2.2} ${x-s},${y+s*2.2}" fill="${c}" opacity="${o}"/>`
      : `<ellipse cx="${x}" cy="${y}" rx="${s}" ry="${s*0.83}" fill="${c}" opacity="${o}"/>`;
    stars.innerHTML += shape;
  }
}
addStars();

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
  caption.textContent = "С неба падает загадочный метеорит...";
  choicePanel.classList.add('hide');
  finalPanel.classList.add('hide');
}

function playIntro() {
  resetScene();
  // Быстрая анимация падения метеорита
  comet.animate([
    { transform: "translate(0,0)" },
    { transform: "translate(90px,320px)" }
  ], { duration: 650, fill: "forwards", easing: "ease-in" });
  setTimeout(()=>comet.setAttribute('transform', 'translate(90,320)'), 650);

  setTimeout(() => {
    caption.textContent = "Это оказалось необычное космическое яйцо!";
    eggGlow.setAttribute('opacity', '0.34');
    eggGlow.animate([{ opacity: 0.11 }, { opacity: 0.44 }, { opacity: 0.17 }], {duration: 700, iterations: 2});
  }, 680);

  setTimeout(() => {
    caption.textContent = "Яйцо трещит, кто там внутри?..";
    crack1.setAttribute('opacity', '1');
    eggGroup.animate([{transform: "rotate(-9 210 300)"},{transform: "rotate(10 210 300)"},{transform: "rotate(0 210 300)"}],{duration:500});
  }, 1180);

  setTimeout(() => {
    crack2.setAttribute('opacity', '1');
    eggGlow.setAttribute('opacity', '0.17');
    eggMain.setAttribute('fill', '#fffde6');
    eggGroup.animate([{transform: "translate(0,0)"},{transform: "translate(-10,6)"}],{duration:360});
  }, 1540);

  setTimeout(() => {
    // Появляется цыплёнок
    eggGlow.setAttribute('opacity', '0');
    chickGroup.setAttribute('opacity', '1');
    caption.textContent = "Кто вылупился из космического яйца?";
    showChick("alien");
    chickGroup.animate([
      { opacity: 0, transform: "translateY(70px) scale(0.82)" },
      { opacity: 1, transform: "translateY(0px) scale(1.1)" },
      { opacity: 1, transform: "translateY(-7px) scale(1.04)" },
      { opacity: 1, transform: "translateY(0px) scale(1.00)" }
    ], { duration: 700, easing: "cubic-bezier(.57,1.35,.62,1)" });
    eggGroup.style.opacity = "0.16";
  }, 1910);

  setTimeout(() => {
    caption.textContent = "";
    choicePanel.classList.remove('hide');
  }, 2710);
}

function showChick(style) {
  // Очистка старых декоров
  Array.from(chickGroup.querySelectorAll('.alienStar, .zombieScar, .zombieEye')).forEach(e=>e.remove());
  // Элементы цыплёнка
  let head = document.getElementById('chickHead');
  let body = document.getElementById('chickBody');
  let beak = document.getElementById('chickBeak');
  let eyeL = document.getElementById('chickEyeL');
  let eyeR = document.getElementById('chickEyeR');
  let pupilL = document.getElementById('chickPupilL');
  let pupilR = document.getElementById('chickPupilR');
  let wingL = document.getElementById('chickWingL');
  let wingR = document.getElementById('chickWingR');

  if (style === "alien") {
    head.setAttribute('fill', "url(#egg-grad)");
    head.setAttribute('stroke', "#43c6e4");
    body.setAttribute('fill', "#c6f7ff");
    body.setAttribute('stroke', "#43c6e4");
    wingL.setAttribute('fill', "#bbf3ff");
    wingR.setAttribute('fill', "#bbf3ff");
    beak.setAttribute('fill', "#8fd8ff");
    beak.setAttribute('stroke', "#0e87b9");
    eyeL.setAttribute('fill', "#fff");
    eyeR.setAttribute('fill', "#fff");
