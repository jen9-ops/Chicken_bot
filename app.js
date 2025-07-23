/* ═════  HELPERS & UI  ═════ */
function toggleTheme(){ document.body.classList.toggle('dark'); }

const chat    = document.getElementById('chat');
const aiBadge = document.getElementById('aiIndicator');
const progressEl = document.getElementById('progress');

const append = (who,txt,cls='ai') => {
  const el = document.createElement('div');
  el.className = `msg ${cls}`; el.textContent = `${who}: ${txt}`;
  chat.appendChild(el); chat.scrollTop = chat.scrollHeight;
  return el;
};
const clearChat = () => { chat.innerHTML = ''; };

/* ═════  KNOWLEDGE / MARKOV  ═════ */
let knowledge = [];   // [{request, answer}]
let corpus    = [];   // предложения (для анализа/маркова)
let markov    = new Map();
const TARGET  = 10000; // символов на 100%

function updateBar(text){
  if(typeof text === 'string'){ progressEl.textContent = text; return; }
  const chars = corpus.join(' ').length;
  progressEl.textContent = Math.min(100, Math.round(chars / TARGET * 100)) + ' %';
}
function saveLocal(){
  localStorage.setItem('hb.knowledge', JSON.stringify(knowledge));
  localStorage.setItem('hb.corpus',    JSON.stringify(corpus));
}
function loadLocal(){
  try{
    knowledge = JSON.parse(localStorage.getItem('hb.knowledge')||'[]') || [];
    corpus    = JSON.parse(localStorage.getItem('hb.corpus')   ||'[]') || [];
  }catch(e){}
  rebuildMarkov(); updateBar();
}
loadLocal();

/* utils */
const splitSent = t => t.split(/[.!?\r?\n]+/).map(s=>s.trim()).filter(Boolean);
const splitWords = s => s.toLowerCase().split(/[^\p{L}0-9]+/u).filter(Boolean);

/* markov */
function rebuildMarkov(){
  markov.clear();
  corpus.forEach(s=>{
    const words = splitWords(s);
    for(let i=0;i<words.length-1;i++){
      const w=words[i], n=words[i+1];
      if(!markov.has(w)) markov.set(w, []);
      markov.get(w).push(n);
    }
  });
}
function randomKey(map){ const k=[...map.keys()]; return k.length? k[Math.floor(Math.random()*k.length)]:null; }
function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }
function genMarkov(seed, max=60){
  const out=[]; let w = seed || randomKey(markov);
  if(!w) return '';
  for(let i=0;i<max;i++){
    out.push(w);
    const arr = markov.get(w);
    if(!arr || !arr.length) break;
    w = arr[Math.floor(Math.random()*arr.length)];
  }
  return cap(out.join(' ')) + '.';
}

/* ═════  TRAINING  ═════ */
function trainFromText(){
  const txt = document.getElementById('textInput').value.trim();
  if(!txt) return;
  const parts = splitSent(txt);
  if(parts.length){
    corpus.push(...parts);
    rebuildMarkov(); updateBar(); saveLocal();
    append('Система', `Обучено: ${parts.length} предложений`, 'sys');
  }
}
async function trainFromURL(){
  const url = document.getElementById('urlInput').value.trim();
  if(!url) return;
  try{
    append('Система','Качаю текст…','sys');
    const res = await fetch(url);
    const text = await res.text();
    const parts = splitSent(text);
    corpus.push(...parts);
    rebuildMarkov(); updateBar(); saveLocal();
    append('Система', `Обучено: ${parts.length} предложений`, 'sys');
  }catch(e){
    append('Система','Не удалось скачать текст','err');
  }
}
function showAnalysis(){
  const freq = new Map();
  corpus.forEach(s=>splitWords(s).forEach(w=>{
    freq.set(w,(freq.get(w)||0)+1);
  }));
  const top = [...freq.entries()].sort((a,b)=>b[1]-a[1]).slice(0,50);
  let out = `Всего предложений: ${corpus.length}\nТоп слов:\n` +
            top.map(([w,c])=>`${w} — ${c}`).join('\n');
  alert(out);
}

/* ═════  IMPORT/EXPORT  ═════ */
function exportData(){
  const blob = new Blob([JSON.stringify({knowledge, corpus})],{type:'application/json'});
  const a = Object.assign(document.createElement('a'),{
    href: URL.createObjectURL(blob), download:'bot-memory.json'
  });
  a.click();
  URL.revokeObjectURL(a.href);
}
function importData(e){
  const f = e.target.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = ev=>{
    try{
      const d = JSON.parse(ev.target.result);
      if(Array.isArray(d.knowledge) && Array.isArray(d.corpus)){
        knowledge = d.knowledge;
        corpus    = d.corpus;
        rebuildMarkov(); updateBar(); saveLocal();
        append('Система','Память загружена','sys');
      }else alert('Неверный формат файла');
    }catch(err){ alert('Ошибка чтения файла'); }
  };
  r.readAsText(f);
}
function clearMemory(){
  if(!confirm('Удалить все знания?')) return;
  knowledge=[]; corpus=[]; markov.clear();
  localStorage.removeItem('hb.knowledge');
  localStorage.removeItem('hb.corpus');
  updateBar(); clearChat();
  append('ИИ','Память очищена полностью','sys');
}

/* ═════  KB templates  ═════ */
const templates = [
  {
    p:/создать vhdx (?<size>\d+(?:gb|mb)) в (?<path>.+)/i,
    f:({size,path})=>`# VHDX
$vhd = "${path.replace(/\\$/,'')}\\VirtualFleshDrive.vhdx"
New-VHD -Path $vhd -SizeBytes ${size.toUpperCase()} -Dynamic
Mount-VHD -Path $vhd`
  },
  {
    p:/зашифровать диск (?<letter>[a-z]):?\s*с ключом в (?<keyPath>.+)/i,
    f:({letter,keyPath})=>`Enable-BitLocker -MountPoint "${letter.toUpperCase()}:\" -RecoveryKeyPath "${keyPath}" -EncryptionMethod XtsAes256`
  },
  { p:/показать процессы/i, f:()=>'Get-Process | Sort-Object CPU -Descending | Select -First 20' }
];

/* простой подбор в knowledge */
function sim(a,b){
  const w1=a.split(/\s+/), w2=b.split(/\s+/);
  return w1.filter(x=>w2.includes(x)).length / Math.max(w1.length,w2.length);
}
function kbMatch(q){
  let best=null,score=0;
  knowledge.forEach(e=>{
    const s=sim(q,e.request); if(s>score){score=s;best=e;}
  });
  return score>0.35 ? best.answer : null;
}

/* ═════  GPT-2  ═════ */
let gpt = null;
async function loadModel(){
  if(gpt) return;
  aiBadge.classList.remove('d-none');
  aiBadge.textContent = 'GPT-2: loading…';
  window.transformers = window.transformers || {};
  window.transformers.env = window.transformers.env || {};
  window.transformers.env.allowLocalModels = false;

  const { pipeline } = window.transformers;
  gpt = await pipeline('text-generation','Xenova/distilgpt2',{
    progress_callback:d=>{
      if(d.status==='progress' && d.total){
        const pct = Math.round(d.loaded/d.total*100);
        updateBar(`Модель: ${pct} %`);
      }
    }
  });
  aiBadge.textContent = 'GPT-2';
  updateBar();
}

/* Генерация PS скрипта (пример) */
async function genPS(prompt){
  await loadModel();
  const o = await gpt(prompt+'\n```powershell\n',{
    max_new_tokens:120, temperature:.3, stop:['```']
  });
  return o[0].generated_text.split('```powershell')[1]?.replace('```','')?.trim();
}

/* ═════  ASK  ═════ */
async function ask(){
  const inp = document.getElementById('userInput');
  const q = inp.value.trim();
  if(!q) return;
  inp.value = '';
  append('Ты', q, 'you');

  /* 1) шаблоны */
  for(const t of templates){
    const m = q.match(t.p);
    if(m){
      aiBadge.classList.remove('d-none');
      aiBadge.textContent = 'TEMPLATE';
      const ans = t.f(m.groups||{});
      append('ИИ', ans, 'ai');
      return;
    }
  }

  /* 2) из базы knowledge */
  const kb = kbMatch(q);
  if(kb){
    aiBadge.classList.remove('d-none');
    aiBadge.textContent = 'KB';
    append('ИИ', kb, 'ai');
    return;
  }

  /* 3) GPT-2 */
  try{
    await loadModel();
    aiBadge.classList.remove('d-none');
    aiBadge.textContent = 'GPT-2';
    const out = await gpt(q,{
      max_new_tokens: 160,
      temperature: 0.9,
      top_p: 0.95,
      repetition_penalty: 1.15
    });
    let txt = out[0].generated_text;
    if(txt.startsWith(q)) txt = txt.slice(q.length).trimStart();
    append('ИИ', txt || '(пусто)', 'ai');
    return;
  }catch(e){
    console.error(e);
    append('Система','GPT-2 не доступна, fallback → Markov','sys');
  }

  /* 4) Markov fallback */
  aiBadge.classList.remove('d-none');
  aiBadge.textContent = 'MARKOV';
  const seed = splitWords(q)[0];
  const ans  = genMarkov(seed);
  append('ИИ', ans || 'Мне нечем ответить — обучи меня текстом.', 'ai');
}

/* Ctrl+Enter = send */
document.getElementById('userInput')
  .addEventListener('keydown', e=>{
    if(e.key==='Enter' && e.ctrlKey){
      e.preventDefault(); ask();
    }
});

/* ═════  DRAGGABLE CONSOLE  ═════ */
(function(){
  const panel  = document.getElementById('consolePanel');
  const handle = document.getElementById('consoleHandle');
  if(!panel || !handle) return;

  let startY = 0, startH = 0, isDrag = false, lastTap = 0;

  const setH = h=>{
    const max = window.innerHeight;
    const min = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--console-h-min')) || 120;
    h = Math.min(max, Math.max(min, h));
    document.documentElement.style.setProperty('--console-h', h + 'px');
  };

  handle.addEventListener('pointerdown', e=>{
    isDrag = true;
    startY = e.clientY;
    startH = panel.offsetHeight;
    handle.setPointerCapture(e.pointerId);
  });

  handle.addEventListener('pointermove', e=>{
    if(!isDrag) return;
    const dy = startY - e.clientY;
    setH(startH + dy);
  });

  handle.addEventListener('pointerup', e=>{
    isDrag = false;
    handle.releasePointerCapture(e.pointerId);
  });

  // Двойной тап/клик = развернуть/свернуть
  handle.addEventListener('click', ()=>{
    const now = Date.now();
    if(now - lastTap < 300){
      const curH = panel.offsetHeight;
      if(curH < window.innerHeight * 0.9){
        setH(window.innerHeight);
      }else{
        setH(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--console-h-min')) || 120);
      }
    }
    lastTap = now;
  });

  window.addEventListener('resize', ()=>{
    const curH = panel.offsetHeight;
    if(curH > window.innerHeight) setH(window.innerHeight);
  });
})();

/* ═════  EXPORT TO WINDOW  ═════ */
Object.assign(window,{
  trainFromText, trainFromURL, showAnalysis,
  exportData, importData, clearMemory,
  clearChat, ask, toggleTheme
});
