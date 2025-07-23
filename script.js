// === Переменные состояния ===
let pipeline, ready = false;
let childScore = 0, chickenScore = 0, round = 1, phase = 1;
const petMessage = document.getElementById('pet-message');
const scoreElem = document.getElementById('score');
const roundPhase = document.getElementById('round-phase');
const chickenQuestionElem = document.getElementById('chicken-question');
const childAnswerElem = document.getElementById('child-answer');
const chickenAnswerElem = document.getElementById('chicken-answer');
const childQuestionElem = document.getElementById('child-question');
const answerBtn = document.getElementById('answer-btn');
const askChickenBtn = document.getElementById('ask-chicken-btn');
const nextRoundBtn = document.getElementById('next-round-btn');
const chickenQBlock = document.getElementById('chicken-question-block');
const childQBlock = document.getElementById('child-question-block');
const rateBtn = document.getElementById('rate-btn');

let currentQuestion = "";
let chickenLastAnswer = "";

// === Запуск AI ===
async function initAI() {
  petMessage.textContent = "Курица размышляет...";
  pipeline = await window.transformers.pipeline('text-generation', 'Xenova/gpt2');
  ready = true;
  petMessage.textContent = "Курица готова к интеллектуальной дуэли!";
  startRound();
}
initAI();

// === Игровой цикл ===
function startRound() {
  roundPhase.textContent = `Раунд ${round}: Курица задаёт вопрос!`;
  chickenQBlock.style.display = '';
  childQBlock.style.display = 'none';
  nextRoundBtn.style.display = 'none';
  chickenQuestionElem.textContent = 'Курица думает...';
  childAnswerElem.value = '';
  chickenGenerateQuestion();
}

async function chickenGenerateQuestion() {
  if (!ready) {
    chickenQuestionElem.textContent = 'Подожди...';
    return;
  }
  // Просим модель сгенерировать вопрос для ребёнка
  const prompt = "Задай интересный детский вопрос:";
  const output = await pipeline(prompt, { max_new_tokens: 32 });
  // Выделяем только первую фразу с вопросом (с '?')
  let q = (output[0]?.generated_text.split('?')[0] || '').replace(prompt, '').trim();
  currentQuestion = q + '?';
  chickenQuestionElem.textContent = currentQuestion;
}

// === Проверка ответа ребёнка ===
answerBtn.onclick = function() {
  let userAnswer = childAnswerElem.value.trim();
  if (userAnswer === "") return;
  // Простая логика: любой ответ засчитывается (или сравнение с ключом)
  petMessage.textContent = "Я оцениваю твой ответ...";
  // Можно усложнить: модель оценивает ответ, но для детей — всегда поддержка!
  setTimeout(() => {
    petMessage.textContent = getRandomPraise();
    childScore++;
    showScore();
    nextToChildQuestion();
  }, 700);
};

// === Переход к вопросу ребёнка ===
function nextToChildQuestion() {
  roundPhase.textContent = `Раунд ${round}: Твоя очередь — задай вопрос курице!`;
  chickenQBlock.style.display = 'none';
  childQBlock.style.display = '';
  askChickenBtn.style.display = '';
  chickenAnswerElem.textContent = '';
  childQuestionElem.value = '';
  rateBtn.style.display = 'none';
}

// === Вопрос ребёнка курице ===
askChickenBtn.onclick = async function() {
  let userQ = childQuestionElem.value.trim();
  if (!userQ) return;
  chickenAnswerElem.textContent = "Курица думает...";
  askChickenBtn.style.display = 'none';
  // Генерируем ответ GPT-2
  const output = await pipeline(userQ, { max_new_tokens: 40 });
  let answer = output[0]?.generated_text.replace(userQ, '').trim().split('\n')[0] || '';
  chickenLastAnswer = answer;
  // Если ответ бессмысленный или короткий — победа ребёнка!
  if (isBadAnswer(answer)) {
    chickenAnswerElem.textContent = "Курица: Я не знаю ответа!";
    rateBtn.style.display = 'none';
    petMessage.textContent = "Ура! Ты обыграл курицу этим вопросом!";
    childScore++;
    showScore();
    nextRoundBtn.style.display = '';
  } else {
    chickenAnswerElem.textContent = "Курица: " + answer;
    rateBtn.style.display = '';
    petMessage.textContent = "Курица попыталась ответить!";
  }
};

// === Оценка ответа курицы ребёнком ===
rateBtn.onclick = function() {
  rateBtn.style.display = 'none';
  petMessage.textContent = "Поздравляем! Твой вопрос оказался слишком сложным!";
  childScore++;
  showScore();
  nextRoundBtn.style.display = '';
};

// === Новый раунд ===
nextRoundBtn.onclick = function() {
  round++;
  startRound();
};

// === Помощники ===
function showScore() {
  scoreElem.textContent = `Ты: ${childScore} | Курица: ${chickenScore}`;
}

// Ответ не засчитывается, если слишком короткий, нет инфы, пустая строка, или явно "не знаю"
function isBadAnswer(text) {
  if (!text) return true;
  const badWords = [
    "не знаю", "затрудняюсь", "не могу ответить", "нет информации", "это сложный вопрос",
    "я не знаю", "не могу", "не уверен", "без понятия", "не могу сказать"
  ];
  if (text.length < 6) return true;
  for (let word of badWords) {
    if (text.toLowerCase().includes(word)) return true;
  }
  return false;
}

function getRandomPraise() {
  const arr = [
    "Отлично, молодец!",
    "Ты справился с вопросом!",
    "Супер! Засчитываю ответ!",
    "Молодец, продолжаем!",
    "Блестяще!"
  ];
  return arr[Math.floor(Math.random() * arr.length)];
}
