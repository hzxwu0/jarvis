<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>JARVIS — AI 비서</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Noto+Sans+KR:wght@300;400;500&display=swap" rel="stylesheet">
<style>
:root{--hud:#00d4ff;--hud2:#0090cc;--hud-dim:rgba(0,212,255,0.12);--hud-glow:rgba(0,212,255,0.35);--bg:#020c14;--bg2:#041624;--text:#c8eaf5;--text-dim:rgba(200,234,245,0.45);--red:#ff4466;--green:#00ffaa}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--text);font-family:'Noto Sans KR',sans-serif;height:100vh;overflow:hidden;display:flex;flex-direction:column}
body::before{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(0,212,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.04) 1px,transparent 1px);background-size:40px 40px;pointer-events:none;z-index:0}
header{position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:16px 32px;border-bottom:1px solid rgba(0,212,255,0.2);background:rgba(2,12,20,0.9);flex-shrink:0}
.logo{font-family:'Orbitron',monospace;font-weight:900;font-size:20px;color:var(--hud);letter-spacing:6px;text-shadow:0 0 20px var(--hud-glow)}
.logo span{font-size:10px;font-weight:400;color:var(--text-dim);letter-spacing:3px;display:block;margin-top:2px}
.status-bar{display:flex;align-items:center;gap:16px;font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--text-dim)}
.status-dot{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
#chat-area{flex:1;overflow-y:auto;padding:20px 32px;position:relative;z-index:5;display:flex;flex-direction:column;gap:14px;scrollbar-width:thin;scrollbar-color:var(--hud2) transparent}
.msg{display:flex;gap:12px;animation:fadeIn 0.3s ease;max-width:860px}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.msg.user{align-self:flex-end;flex-direction:row-reverse}
.msg-avatar{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Orbitron',monospace;font-size:10px;font-weight:700;flex-shrink:0}
.jarvis .msg-avatar{background:var(--hud-dim);border:1px solid var(--hud);color:var(--hud);box-shadow:0 0 10px var(--hud-glow)}
.user .msg-avatar{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);color:var(--text-dim)}
.msg-bubble{padding:10px 15px;border-radius:2px;font-size:14px;line-height:1.75;max-width:700px}
.jarvis .msg-bubble{background:var(--bg2);border:1px solid rgba(0,212,255,0.18);border-left:3px solid var(--hud);color:var(--text)}
.user .msg-bubble{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-right:3px solid rgba(255,255,255,0.25);color:var(--text);text-align:right}
.msg-label{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:2px;margin-bottom:4px}
.jarvis .msg-label{color:var(--hud)}
.user .msg-label{color:var(--text-dim);text-align:right}
.typing-dots span{display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--hud);margin:0 2px;animation:bounce 1.2s infinite}
.typing-dots span:nth-child(2){animation-delay:0.2s}
.typing-dots span:nth-child(3){animation-delay:0.4s}
@keyframes bounce{0%,60%,100%{transform:translateY(0);opacity:0.4}30%{transform:translateY(-6px);opacity:1}}
footer{position:relative;z-index:10;padding:14px 32px 18px;border-top:1px solid rgba(0,212,255,0.15);background:rgba(2,12,20,0.92);flex-shrink:0}
.input-row{display:flex;gap:10px;align-items:center}
#text-input{flex:1;background:rgba(0,212,255,0.05);border:1px solid rgba(0,212,255,0.22);border-radius:2px;padding:11px 16px;color:var(--text);font-family:'Noto Sans KR',sans-serif;font-size:14px;outline:none;transition:border-color 0.2s}
#text-input::placeholder{color:var(--text-dim)}
#text-input:focus{border-color:var(--hud);box-shadow:0 0 10px var(--hud-glow)}
.btn-send,.btn-mic{width:44px;height:44px;border-radius:2px;border:1px solid rgba(0,212,255,0.28);background:var(--hud-dim);color:var(--hud);font-size:17px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0}
.btn-send:hover,.btn-mic:hover{background:rgba(0,212,255,0.2);box-shadow:0 0 10px var(--hud-glow)}
.btn-mic.recording{background:rgba(255,68,102,0.18);border-color:var(--red);color:var(--red);animation:recPulse 1s infinite}
@keyframes recPulse{0%,100%{box-shadow:0 0 6px rgba(255,68,102,0.4)}50%{box-shadow:0 0 18px rgba(255,68,102,0.8)}}
.hint{font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--text-dim);margin-top:7px;letter-spacing:1px}
.corner{position:fixed;width:36px;height:36px;border-color:rgba(0,212,255,0.25);border-style:solid;z-index:1}
.corner.tl{top:58px;left:8px;border-width:2px 0 0 2px}
.corner.tr{top:58px;right:8px;border-width:2px 2px 0 0}
.corner.bl{bottom:82px;left:8px;border-width:0 0 2px 2px}
.corner.br{bottom:82px;right:8px;border-width:0 2px 2px 0}
</style>
</head>
<body>
<div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
<header>
  <div class="logo">JARVIS<span>JUST A RATHER VERY INTELLIGENT SYSTEM</span></div>
  <div class="status-bar">
    <div class="status-dot"></div>
    <span>온라인</span>
    <span>|</span>
    <span id="clock">--:--:--</span>
  </div>
</header>
<div id="chat-area"></div>
<footer>
  <div class="input-row">
    <input type="text" id="text-input" placeholder="자비스에게 말하세요... (날씨, 일정, 질문 등)"/>
    <button class="btn-send" onclick="sendText()">➤</button>
    <button class="btn-mic" id="mic-btn" onclick="toggleMic()">🎙</button>
  </div>
  <div class="hint">ENTER 키로 전송 | 🎙 버튼으로 음성 입력</div>
</footer>
<script>
let history=[];
let isRecording=false,recognition=null;
function updateClock(){document.getElementById('clock').textContent=new Date().toLocaleTimeString('ko-KR',{hour12:false})}
setInterval(updateClock,1000);updateClock();

function addMessage(role,text){
  const area=document.getElementById('chat-area');
  const div=document.createElement('div');
  div.className=`msg ${role}`;
  div.innerHTML=`<div class="msg-avatar">${role==='jarvis'?'J':'YOU'}</div><div><div class="msg-label">${role==='jarvis'?'JARVIS':'USER'}</div><div class="msg-bubble">${text.replace(/\n/g,'<br>')}</div></div>`;
  area.appendChild(div);
  area.scrollTop=area.scrollHeight;
}

function addTyping(){
  const area=document.getElementById('chat-area');
  const div=document.createElement('div');
  div.className='msg jarvis';div.id='typing';
  div.innerHTML=`<div class="msg-avatar">J</div><div><div class="msg-label">JARVIS</div><div class="msg-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div></div>`;
  area.appendChild(div);area.scrollTop=area.scrollHeight;
}
function removeTyping(){const el=document.getElementById('typing');if(el)el.remove()}

async function processCommand(command){
  addMessage('user',command);
  addTyping();
  try{
    const res=await fetch('/api/chat',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({message:command,history:history})
    });
    const data=await res.json();
    removeTyping();
    history.push({role:'user',content:command});
    history.push({role:'assistant',content:data.reply});
    if(history.length>20){history.splice(0,2)}
    addMessage('jarvis',data.reply);
  }catch(e){
    removeTyping();
    addMessage('jarvis','오류가 발생했어요. 잠시 후 다시 시도해주세요.');
  }
}

function sendText(){
  const input=document.getElementById('text-input');
  const text=input.value.trim();
  if(!text)return;
  input.value='';
  processCommand(text);
}

document.getElementById('text-input').addEventListener('keydown',e=>{
  if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendText()}
});

function toggleMic(){
  if(!('webkitSpeechRecognition'in window)&&!('SpeechRecognition'in window)){
    addMessage('jarvis','Chrome 브라우저에서만 음성 인식이 가능해요.');return;
  }
  const btn=document.getElementById('mic-btn');
  if(isRecording){recognition&&recognition.stop();isRecording=false;btn.classList.remove('recording');btn.textContent='🎙';return}
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  recognition=new SR();recognition.lang='ko-KR';recognition.continuous=false;recognition.interimResults=false;
  recognition.onstart=()=>{isRecording=true;btn.classList.add('recording');btn.textContent='⏹'};
  recognition.onresult=e=>{processCommand(e.results[0][0].transcript)};
  recognition.onend=()=>{isRecording=false;btn.classList.remove('recording');btn.textContent='🎙'};
  recognition.onerror=()=>{isRecording=false;btn.classList.remove('recording');btn.textContent='🎙'};
  recognition.start();
}

addMessage('jarvis','안녕하세요! 자비스입니다. 무엇을 도와드릴까요?\n날씨, 일정, 자유로운 질문 모두 가능합니다.');
</script>
</body>
</html>
