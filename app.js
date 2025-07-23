/* ===================================================================
   Hyper-Bot single-file patch:
   - Инжектит CSS + нижнюю тянущуюся консоль (без правки HTML)
   - Загружает GPT-2 (distilgpt2) через transformers.js динамически
   - Сохраняет твой дизайн (glass, цвета и т.д.)
   =================================================================== */
"use strict";

/* ---------- tiny helpers ---------- */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function appendMsg(who, txt, cls="ai"){
  const el = document.createElement("div");
  el.className = `msg ${cls}`;
  el.textContent = `${who}: ${txt}`;
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
  return el;
}

/* ---------- inject CSS once ---------- */
(function injectCSS(){
  if (document.getElementById("hb-console-css")) return;
  const css = `
:root{
  --console-h: 220px;
  --console-h-min: 120px;
}
.console-panel{
  position: fixed; left:0; right:0; bottom:0;
  height: var(--console-h); max-height: 100vh;
  display:flex; flex-direction:column;
  z-index: 9999; overflow:hidden;
}
.console-handle{
  height:12px; cursor:ns-resize; touch-action:none;
  display:flex;align-items:center;justify-content:center;
}
.console-handle::before{
  content:""; width:48px; height:4px; border-radius:2px;
  background: rgba(255,255,255,.35);
}
.console-panel .chat{
  flex:1 1 auto; overflow-y:auto; padding:8px 12px;
}
.chat::-webkit-scrollbar{width:6px;}
.chat::-webkit-scrollbar-thumb{background:rgba(255,255,255,.3);border-radius:3px;}
/* fallback glass if нет в стилях */
.glass{
  background: rgba(255,255,255,.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,.2);
  border-radius: 12px;
}
  `;
  const st = document.createElement("style");
  st.id = "hb-console-css";
  st.textContent = css;
  document.head.appendChild(st);
})();

/* ---------- move/construct UI ---------- */
let chat, progressEl, inputEl, askBtn, aiBadge;

(function ensureConsole(){
  // Ищем существующие элементы
  chat       = $("#chat")        || document.createElement("div");
  progressEl = $("#progress")    || document.createElement("span");
  inputEl    = $("#userInput")   || document.createElement("textarea");
  askBtn     = $("#btnAsk")      || document.createElement("button");
  aiBadge    = $("#aiIndicator") || document.createElement("span");

  // Если панели нет — строим
  if (!document.getElementById("consolePanel")){
    const panel  = document.createElement("div");
    panel.id     = "consolePanel";
    panel.className = "console-panel glass";

    const handle = document.createElement("div");
    handle.id    = "consoleHandle";
    handle.className = "console-handle";
    panel.appendChild(handle);

    // Переносим/добавляем chat
    if (!chat.id){ chat.id = "chat"; chat.className="chat"; }
    panel.appendChild(chat);

    // Ввод и кнопка
    const row = document.createElement("div");
    row.className = "d-flex gap-2 p-2";
    if (!inputEl.id){ inputEl.id="userInput"; inputEl.rows=2; inputEl.className="form-control soft"; }
    if (!askBtn.id){ askBtn.id="btnAsk"; askBtn.textContent="➤"; askBtn.className="btn btn-primary"; }
    row.appendChild(inputEl);
    row.appendChild(askBtn);
    panel.appendChild(row);

    document.body.appendChild(panel);
  }

  // Если прогресс/бейджей нет в шапке — создаём маленький блок сверху
  if (!progressEl.id){ progressEl.id="progress"; progressEl.className="badge bg-warning text-dark ms-1"; progressEl.textContent="0 %"; }
  if (!aiBadge.id){ aiBadge.id="aiIndicator"; aiBadge.className="badge bg-info text-dark ms-1 d-none"; aiBadge.textContent="GPT-2"; }
  if (!document.querySelector("header.navbar")){
    const header = document.createElement("header");
    header.className = "navbar glass shadow-sm px-3";
    const brand = document.createElement("a"); brand.className="navbar-brand fw-bold"; brand.textContent = "Hyper-Bot ";
    brand.appendChild(progressEl); brand.appendChild(aiBadge);
    header.appendChild(brand);
    document.body.prepend(header);
  }else{
    // если navbar есть, вставим бейджи в него
    const nb = document.querySelector("header.navbar .navbar-brand") || document.querySelector("header.navbar");
    if (nb && !nb.contains(progressEl)) nb.appendChild(progressEl);
    if (nb && !nb.contains(aiBadge))    nb.appendChild(aiBadge);
  }
})();

/* ---------- draggable console ---------- */
(function dragConsole(){
  const panel  = document.getElementById("consolePanel");
  const handle = document.getElementById("consoleHandle");
  if(!panel || !handle) return;
  let startY=0,startH=0,isDrag=false,lastTap=0;
  const setH = h=>{
    const max = window.innerHeight;
    const min = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--console-h-min'))||120;
    h=Math.min(max,Math.max(min,h));
    document.documentElement.style.setProperty('--console-h', h+'px');
  };
  handle.addEventListener('pointerdown',e=>{
    isDrag=true; startY=e.clientY; startH=panel.offsetHeight;
    handle.setPointerCapture(e.pointerId);
  });
  handle.addEventListener('pointermove',e=>{
    if(!isDrag) return;
    const dy = startY - e.clientY;
    setH(startH + dy);
  });
  handle.addEventListener('pointerup',e=>{
    isDrag=false; handle.releasePointerCapture(e.pointerId);
  });
  handle.addEventListener('click',()=>{
    const now=Date.now();
    if(now-lastTap<300){
      const curH=panel.offsetHeight;
      if(curH<window.innerHeight*0.9) setH(window.innerHeight);
      else setH(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--console-h-min'))||120);
    }
    lastTap=now;
  });
  window.addEventListener('resize',()=>{
    const curH=panel.offsetHeight;
    if(curH>window.innerHeight) setH(window.innerHeight);
  });
})();

/* ---------- storage / markov ---------- */
let sentences = [];
let markov = new Map();
const TARGET = 10000;

function updateBar(txt){
  if(typeof txt==="string"){ progressEl.textContent = txt; return; }
  const chars = sentences.join(" ").length;
  progressEl.textContent = Math.min(100, Math.round(chars/TARGET*100)) + " %";
}
function saveLocal(){ localStorage.setItem("hb.sentences", JSON.stringify(sentences)); }
function loadLocal(){
  try{
    const s = JSON.parse(localStorage.getItem("hb.sentences")||"[]");
    if(Array.isArray(s)) sentences = s;
  }catch(e){}
  rebuildMarkov(); updateBar();
}
loadLocal();

const splitSent = t => t.split(/[.!?\r?\n]+/).map(s=>s.trim()).filter(Boolean);
const splitWords= s => s.toLowerCase().split(/[^\p{L}0-9]+/u).filter(Boolean);

function trainFromText(txt){
  const parts = splitSent(txt);
  if(!parts.length) return 0;
  sentences.push(...parts);
  rebuildMarkov(); updateBar(); saveLocal();
  appendMsg("Система",`Обучено: ${parts.length} предложений`,"sys");
  return parts.length;
}
async function trainFromURL(url){
  try{
    appendMsg("Система","Качаю текст...","sys");
    const r = await fetch(url); const t = await r.text();
    trainFromText(t);
  }catch(e){ appendMsg("Система","Не удалось скачать","err"); }
}
function rebuildMarkov(){
  markov.clear();
  for(const s of sentences){
    const w = splitWords(s);
    for(let i=0;i<w.length-1;i++){
      if(!markov.has(w[i])) markov.set(w[i],[]);
      markov.get(w[i]).push(w[i+1]);
    }
  }
}
function genMarkov(seed,max=60){
  const out=[]; let w = seed || ([...markov.keys()][Math.floor(Math.random()*markov.size)]||"");
  if(!w) return "";
  for(let i=0;i<max;i++){
    out.push(w);
    const arr = markov.get(w);
    if(!arr||!arr.length) break;
    w = arr[Math.floor(Math.random()*arr.length)];
  }
  return out[0].charAt(0).toUpperCase()+out.join(" ").slice(1)+".";
}

/* ---------- templates ---------- */
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

/* ---------- GPT-2 ---------- */
let gpt2Pipe = null;
async function ensureGPT2(){
  if(gpt2Pipe) return gpt2Pipe;

  // грузим библиотеку, если её нет
  if(!window.transformers){
    await new Promise((res,rej)=>{
      const s=document.createElement("script");
      s.src="https://cdn.jsdelivr.net/npm/@xenova/transformers/dist/transformers.min.js";
      s.onload=res; s.onerror=rej; document.head.appendChild(s);
    });
  }

  aiBadge.classList.remove("d-none");
  aiBadge.textContent = "GPT-2: loading…";

  window.transformers = window.transformers || {};
  window.transformers.env = window.transformers.env || {};
  window.transformers.env.allowLocalModels = false;

  const { pipeline } = window.transformers;
  gpt2Pipe = await pipeline("text-generation","Xenova/distilgpt2",{
    progress_callback:d=>{
      if(d.status==="progress" && d.total){
        updateBar("Модель: "+Math.round(d.loaded/d.total*100)+" %");
      }
    }
  });
  aiBadge.textContent = "GPT-2";
  updateBar();
  return gpt2Pipe;
}

/* ---------- ask ---------- */
async function ask(){
  const q = inputEl.value.trim();
  if(!q) return;
  inputEl.value="";
  appendMsg("Ты",q,"you");

  // шаблоны
  for(const t of templates){
    const m=q.match(t.p);
    if(m){
      aiBadge.classList.remove("d-none"); aiBadge.textContent="TEMPLATE";
      return appendMsg("ИИ", t.f(m.groups||{}), "ai");
    }
  }

  // GPT-2
  try{
    const pipe = await ensureGPT2();
    aiBadge.classList.remove("d-none"); aiBadge.textContent="GPT-2";
    const out = await pipe(q,{
      max_new_tokens:160,
      temperature:0.9,
      top_p:0.95,
      repetition_penalty:1.15
    });
    let txt = out[0].generated_text;
    if(txt.startsWith(q)) txt = txt.slice(q.length).trimStart();
    return appendMsg("ИИ", txt || "(пусто)", "ai");
  }catch(e){
    console.error(e);
    appendMsg("Система","GPT-2 не доступна, fallback → Markov","sys");
  }

  // fallback
  aiBadge.classList.remove("d-none"); aiBadge.textContent="MARKOV";
  const seed = splitWords(q)[0];
  appendMsg("ИИ", genMarkov(seed) || "Обучи меня текстом.", "ai");
}

/* ---------- analysis / export ---------- */
function showAnalysis(){
  const freq = new Map();
  sentences.forEach(s=>splitWords(s).forEach(w=>freq.set(w,(freq.get(w)||0)+1)));
  const top=[...freq.entries()].sort((a,b)=>b[1]-a[1]).slice(0,50)
            .map(([w,c])=>`${w} — ${c}`).join("\n");
  alert(`Всего предложений: ${sentences.length}\nТоп слов:\n${top}`);
}
function exportData(){
  const blob = new Blob([JSON.stringify(sentences)], {type:"application/json"});
  const a = document.createElement("a");
  a.href=URL.createObjectURL(blob); a.download="hyper-bot-data.json"; a.click();
  URL.revokeObjectURL(a.href);
}
function importData(ev){
  const f = ev.target.files?.[0]; if(!f) return;
  f.text().then(t=>{
    try{
      const arr = JSON.parse(t);
      if(Array.isArray(arr)){
        sentences = arr; rebuildMarkov(); updateBar(); saveLocal();
        appendMsg("Система","База загружена","sys");
      }else alert("Неверный формат");
    }catch(e){ alert("Ошибка файла"); }
  });
}
function clearMemory(){
  if(confirm("Точно очистить память?")){
    sentences=[]; markov.clear(); saveLocal(); updateBar(); appendMsg("Система","Память очищена","sys");
  }
}
function clearChat(){ chat.innerHTML=""; }
function toggleTheme(){ document.body.classList.toggle("dark"); }

/* ---------- bindings ---------- */
askBtn.addEventListener("click", ask);
inputEl.addEventListener("keydown", e=>{
  if(e.key==="Enter" && e.ctrlKey){ e.preventDefault(); ask(); }
});

/* Если на странице есть кнопки с id, которые ты уже делал — подцепим их */
const bind = (id,fn)=>{ const el=document.getElementById(id); if(el) el.onclick=fn; };
bind("btnTrainText", ()=>{ const t=prompt("Текст для обучения:"); if(t) trainFromText(t); });
bind("btnTrainURL",  ()=>{ const u=prompt("URL:"); if(u) trainFromURL(u); });
bind("btnAnalysis",  showAnalysis);
bind("btnExport",    exportData);
bind("btnImport",    ()=>{ let i=document.createElement("input"); i.type="file"; i.accept="application/json"; i.onchange=importData; i.click(); });
bind("btnClearMem",  clearMemory);
bind("btnClearChat", clearChat);
bind("btnTheme",     toggleTheme);

/* expose for menu links */
Object.assign(window,{ask, trainFromText, trainFromURL, showAnalysis,
  exportData, importData, clearMemory, clearChat, toggleTheme});

/* first draw */
updateBar();
