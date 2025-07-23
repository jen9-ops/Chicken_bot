const consoleToggle = document.getElementById('console-toggle');
const consolePanel = document.getElementById('console-panel');
const consoleLog = document.getElementById('console-log');
const consoleHeader = document.getElementById('console-header');
const consoleMove = document.getElementById('console-move');
const consoleMin = document.getElementById('console-min');
const consoleClose = document.getElementById('console-close');

consoleToggle.onclick = function() {
  consolePanel.style.display = '';
  consoleToggle.style.display = 'none';
};
consoleClose.onclick = function() {
  consolePanel.style.display = 'none';
  consoleToggle.style.display = '';
};
consoleMin.onclick = function() {
  if (!consolePanel.classList.contains('minimized')) {
    consolePanel.style.height = '36px';
    consolePanel.classList.add('minimized');
    consoleMin.textContent = '⮟';
  } else {
    consolePanel.style.height = '';
    consolePanel.classList.remove('minimized');
    consoleMin.textContent = '⮝';
  }
};
consoleMove.onclick = function() {
  if (!consolePanel.classList.contains('fullscreen')) {
    consolePanel.classList.add('fullscreen');
    consoleMove.textContent = '⤡';
  } else {
    consolePanel.classList.remove('fullscreen');
    consoleMove.textContent = '⤢';
  }
};

window.logToConsole = function(msg, isError) {
  const date = new Date().toLocaleTimeString();
  const pre = isError ? '[Ошибка]' : '[Лог]';
  const html = `<div style="color:${isError?'#ff9999':'#d4ffad'}">${pre} ${date}: ${msg}</div>`;
  consoleLog.innerHTML += html;
  consoleLog.scrollTop = consoleLog.scrollHeight;
};
window.onerror = function(msg, url, line, col, err) {
  logToConsole(`${msg} (строка: ${line}, колонка: ${col})`, true);
  return false;
};
window.addEventListener('unhandledrejection', function(event) {
  logToConsole("Unhandled promise rejection: " + (event.reason?.message || event.reason), true);
});
