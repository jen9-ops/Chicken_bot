window.onload = function () {
  // Яйцо падает быстро
  setTimeout(() => {
    const egg = document.getElementById('egg');
    egg.style.transition = "transform 0.32s cubic-bezier(.7,1.7,.3,1)";
    egg.style.transform = "translateY(115px) scale(.92)";
    setTimeout(() => {
      document.getElementById('eggGlow').setAttribute('opacity', '0.32');
      document.getElementById('eggCrack').setAttribute('opacity', '1');
    }, 120); // трещина почти сразу
    setTimeout(() => {
      egg.style.opacity = 0;
      setTimeout(() => {
        document.getElementById('choose').style.display = '';
      }, 90); // выбор появляется сразу
    }, 370); // вся сцена — 0.32+0.05=~0.37сек
  }, 200);
};

window.showChick = function (type) {
  document.getElementById('choose').style.display = 'none';
  document.getElementById('result').style.display = '';
  let out = "";
  let msg = "";
  if (type === 'alien') {
    out = `
      <svg viewBox="0 0 140 180" class="chick-svg" style="margin:0 auto;">
        <ellipse cx="70" cy="92" rx="52" ry="56" fill="#a2e1fe" stroke="#59b0e8" stroke-width="6"/>
        <ellipse cx="70" cy="138" rx="38" ry="32" fill="#63f0fa" stroke="#2ea9b8" stroke-width="4"/>
        <ellipse cx="45" cy="92" rx="12" ry="16" fill="#fff"/>
        <ellipse cx="95" cy="92" rx="12" ry="16" fill="#fff"/>
        <ellipse cx="45" cy="98" rx="5" ry="8" fill="#5a64c9"/>
        <ellipse cx="95" cy="98" rx="5" ry="8" fill="#5a64c9"/>
        <ellipse cx="70" cy="108" rx="10" ry="5" fill="#7ad1fd"/>
        <polygon points="70,116 64,124 76,124" fill="#fffacc"/>
        <!-- Ушки-антенки -->
        <ellipse cx="35" cy="60" rx="7" ry="13" fill="#cdf7fd" transform="rotate(-20 35 60)"/>
        <ellipse cx="105" cy="60" rx="7" ry="13" fill="#cdf7fd" transform="rotate(20 105 60)"/>
        <circle cx="70" cy="60" r="4" fill="#fffad8"/>
        <circle cx="50" cy="47" r="3" fill="#e1fffd"/>
        <circle cx="90" cy="47" r="3" fill="#e1fffd"/>
      </svg>
    `;
    msg = `<b>Поздравляем!</b><br>Ты выбрал <span style="color:#43c6e4;">инопланетного цыплёнка</span> 🚀`;
  } else if (type === 'zombie') {
    out = `
      <svg viewBox="0 0 140 180" class="chick-svg" style="margin:0 auto;">
        <ellipse cx="70" cy="92" rx="52" ry="56" fill="#b1ffb3" stroke="#3a8540" stroke-width="6"/>
        <ellipse cx="70" cy="138" rx="38" ry="32" fill="#84e884" stroke="#397442" stroke-width="4"/>
        <ellipse cx="50" cy="95" rx="12" ry="15" fill="#fff"/>
        <ellipse cx="95" cy="93" rx="8" ry="12" fill="#34451c"/>
        <ellipse cx="52" cy="99" rx="5" ry="8" fill="#38bb68"/>
        <rect x="86" y="93" width="8" height="9" rx="3" fill="#fff"/>
        <!-- Рот-шрам -->
        <rect x="60" y="120" width="19" height="4" rx="2" fill="#2a4f2a"/>
        <rect x="61" y="121" width="2" height="2" rx="1" fill="#fff"/>
        <rect x="68" y="121" width="2" height="2" rx="1" fill="#fff"/>
        <rect x="75" y="121" width="2" height="2" rx="1" fill="#fff"/>
        <rect x="79" y="121" width="2" height="2" rx="1" fill="#fff"/>
        <!-- Бинтик -->
        <rect x="40" y="77" width="18" height="5" rx="2" fill="#dadada"/>
        <rect x="43" y="79" width="6" height="2.2" rx="1.1" fill="#a5a5a5"/>
        <rect x="49" y="78" width="6" height="2.2" rx="1.1" fill="#a5a5a5"/>
        <!-- Шрамик -->
        <rect x="95" y="120" width="14" height="3" rx="1.2" fill="#5aad62" transform="rotate(-14 102 122)"/>
      </svg>
    `;
    msg = `<b>Класс!</b><br>Ты выбрал <span style="color:#1ab141;">зомби-цыплёнка</span> 🧟‍♂️`;
  }
  document.getElementById('chosen').innerHTML = out;
  document.getElementById('msg').innerHTML = msg;
};

window.restart = function () {
  // Сбросить всё
  document.getElementById('result').style.display = 'none';
  const egg = document.getElementById('egg');
  egg.style.transition = "none";
  egg.style.transform = "";
  egg.style.opacity = 1;
  document.getElementById('eggGlow').setAttribute('opacity', '0.18');
  document.getElementById('eggCrack').setAttribute('opacity', '0');
  setTimeout(() => {
    egg.style.transition = "transform 0.32s cubic-bezier(.7,1.7,.3,1)";
    egg.style.transform = "translateY(115px) scale(.92)";
    setTimeout(() => {
      document.getElementById('eggGlow').setAttribute('opacity', '0.32');
      document.getElementById('eggCrack').setAttribute('opacity', '1');
    }, 120);
    setTimeout(() => {
      egg.style.opacity = 0;
      setTimeout(() => {
        document.getElementById('choose').style.display = '';
      }, 90);
    }, 370);
  }, 200);
};
