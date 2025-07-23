const petMessage = document.getElementById('pet-message');
const userInput = document.getElementById('user-input');
const askBtn = document.getElementById('ask-btn');
const chatLog = document.getElementById('chat-log');

let pipeline, ready = false;

async function initAI() {
  petMessage.textContent = "Курица размышляет...";
  logToConsole("Загружаем GPT-2 через transformers.js...");
  try {
    pipeline = await window.transformers.pipeline('text-generation', 'Xenova/gpt2');
    ready = true;
    petMessage.textContent = "Курица готова! Спроси что-нибудь!";
    logToConsole("GPT-2 успешно загружена.");
  } catch (err) {
    petMessage.textContent = "Ошибка загрузки AI 😢";
    logToConsole("Ошибка загрузки GPT-2: " + (err.message || err), true);
  }
}
initAI();

askBtn.onclick = async function() {
  const question = userInput.value.trim();
  if (!ready) {
    petMessage.textContent = "Подожди, курица думает...";
    logToConsole("AI ещё не загружен.");
    return;
  }
  if (!question) return;
  logToConsole("Вопрос курице: " + question);
  chatAdd("user", "Ты: " + question);
  petMessage.textContent = "Курица думает...";
  userInput.value = "";

  try {
    const output = await pipeline(question, { max_new_tokens: 40 });
    let answer = output[0]?.generated_text.replace(question, '').trim().split('\n')[0] || '';
    if (answer.length < 3) answer = "Я не знаю...";
    petMessage.textContent = answer;
    chatAdd("ai", "Курица: " + answer);
    logToConsole("Ответ курицы: " + answer);
  } catch (err) {
    petMessage.textContent = "Что-то пошло не так...";
    chatAdd("err", "Ошибка: " + (err.message || err));
    logToConsole("Ошибка ответа AI: " + (err.message || err), true);
  }
};
userInput.addEventListener('keydown', function(e){
  if(e.key === "Enter") askBtn.click();
});

function chatAdd(type, msg) {
  const d = document.createElement('div');
  d.className = type;
  d.textContent = msg;
  chatLog.appendChild(d);
  chatLog.scrollTop = chatLog.scrollHeight;
}
