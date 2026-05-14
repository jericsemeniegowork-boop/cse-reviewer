
const {topics:TOPICS, lessons:LESSONS, formulas:FORMULAS, questions:QUESTIONS, edq:EDQ, blueprints:BLUEPRINTS} = window.CSE_DATA;
const DEDICATION_FOOTER = "Dedicated to <b>Tunet</b> \u2014 Of all the trials this world may place before you, I would have you know this: you shall not face them alone. My heart is with you, steadfast and unshaken, in peace, in sorrow, and in every storm that dares to come.\n<br><br>Practice-only reviewer. All questions are original practice items based on CSE coverage areas, not copied actual exam questions. Full mock distributions are practice distributions, not official item allocations.";

const TABS = [
  ["dashboard","Home","🏠"],
  ["library","Library","📚"],
  ["practice","Practice","🎯"],
  ["activities","Mocks","📝"],
  ["progress","Progress","📈"],
  ["settings","Settings","⚙️"]
];

const DEFAULT_PROFILE = {
  name:"",
  examType:"professional",
  examDate:"",
  targetScore:85,
  dailyGoal:30,
  studyMinutes:45,
  coachStyle:"direct",
  explanationDepth:"balanced",
  defaultMode:"practice",
  weakestTopics:["numerical","verbal"],
  preferredPace:"balanced",
  reminderText:"",
  themeAccent:"blue"
};

let state = {
  tab:"dashboard", activeTopic:"numerical", selectedTopics:TOPICS.map(t=>t.id),
  topicQuery:"", formulaQuery:"", difficulty:"", sectionTopic:"general",
  quizStarted:false, quizMode:"practice", quizPool:[], quizIndex:0,
  score:0, answered:0, chosen:null, responses:[], flashIndex:0, flashSide:"front",
  timerEnd:null, timerLabel:""
};

let timerInterval = null;

const app=document.getElementById("app"), desktopTabs=document.getElementById("desktopTabs"), mobileTabs=document.getElementById("mobileTabs");

function enterFocusMode(){
  document.body.classList.add("activityFocus");
}
function exitFocusMode(){
  document.body.classList.remove("activityFocus");
}
function quitActivity(){
  if(confirm("Exit this activity? Your current activity progress will be cleared.")){
    resetQuizState(true);
    setTab("dashboard");
  }
}

function save(k,v){localStorage.setItem(k,JSON.stringify(v))}
function load(k,f){try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}}
function todayKey(){return new Date().toISOString().slice(0,10)}
function profile(){return {...DEFAULT_PROFILE,...load("profile",{})}}
function saveProfile(p){save("profile",{...profile(),...p})}
function stats(){return load("stats",{answered:0,correct:0,byTopic:{},history:{},lastMock:null})}
function saveStats(s){save("stats",s)}
function weakIds(){return load("weakIds",[])}
function setWeakIds(ids){save("weakIds",[...new Set(ids)])}
function h(s){return String(s ?? "").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
function renderVisual(q){return q && q.visual ? `<div class="questionVisual">${q.visual}</div>` : ""}
function shuffle(a){return [...a].sort(()=>Math.random()-0.5)}

function hashSeed(str){
  let h=2166136261;
  for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h+= (h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24);}
  return Math.abs(h>>>0);
}
function seededShuffle(arr, seed){
  let a=[...arr], s=seed || Date.now();
  function rnd(){s=(s*1664525+1013904223)>>>0;return s/4294967296;}
  for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
function recentQuestionIds(){
  return load("recentQuestionIds",[]);
}
function rememberQuestionIds(ids){
  const recent=[...ids,...recentQuestionIds()].slice(0,300);
  save("recentQuestionIds",[...new Set(recent)]);
}
function balancedPick(pool, count, opts={}){
  const recent=new Set(recentQuestionIds());
  let fresh=pool.filter(q=>!recent.has(q.id));
  if(fresh.length < Math.min(count, Math.floor(pool.length*0.45))) fresh=pool;
  const seed=hashSeed(`${new Date().toISOString().slice(0,10)}-${opts.mode||"mix"}-${Math.random()}`);
  let groups={};
  fresh.forEach(q=>{
    const key=[q.topic||"x",q.subtopic||"x",q.difficulty||"x"].join("|");
    (groups[key] ||= []).push(q);
  });
  let buckets=Object.values(groups).map(g=>seededShuffle(g, seed + g.length));
  let picked=[];
  let safety=0;
  while(picked.length<count && buckets.length && safety<10000){
    safety++;
    buckets=seededShuffle(buckets.filter(b=>b.length), seed + safety);
    for(const b of buckets){
      if(picked.length>=count) break;
      const q=b.shift();
      if(q && !picked.some(x=>x.id===q.id)) picked.push(q);
    }
  }
  if(picked.length<count){
    for(const q of seededShuffle(pool, seed+999)){
      if(picked.length>=count) break;
      if(!picked.some(x=>x.id===q.id)) picked.push(q);
    }
  }
  rememberQuestionIds(picked.map(q=>q.id));
  return picked.slice(0,count);
}
function balancedPool(pool, opts={}){
  return balancedPick(pool, pool.length, opts);
}

function topicById(id){return TOPICS.find(t=>t.id===id)||{id:"edq",name:"EDQ",icon:"📝",focus:"Examinee descriptive questions",color:"linear-gradient(135deg,#64748b,#334155)"}}
function questionById(id){return QUESTIONS.find(q=>q.id===id)||EDQ.find(q=>q.id===id)}
function card(x,cls=""){return `<div class="card ${cls}">${x}</div>`}

function setTab(tab){state.tab=tab;if(!["practice","activities"].includes(tab)) resetQuizState(false);render()}
function renderTabs(){
  desktopTabs.innerHTML=TABS.map(t=>`<button class="tab ${state.tab===t[0]?'active':''}" onclick="setTab('${t[0]}')">${t[2]} ${t[1]}</button>`).join("");
  mobileTabs.innerHTML=TABS.map(t=>`<button class="${state.tab===t[0]?'active':''}" onclick="setTab('${t[0]}')"><span>${t[2]}</span><br>${t[1]}</button>`).join("");
}
function formatTime(sec){sec=Math.max(0,sec);const m=Math.floor(sec/60),s=sec%60;return `${m}:${String(s).padStart(2,"0")}`}
function startTimer(seconds,label){clearInterval(timerInterval);state.timerEnd=Date.now()+seconds*1000;state.timerLabel=label;timerInterval=setInterval(updateTimer,1000);updateTimer()}
function stopTimer(){clearInterval(timerInterval);timerInterval=null;state.timerEnd=null;state.timerLabel=""}
function updateTimer(){const el=document.getElementById("timerBox");if(!state.timerEnd){if(el)el.textContent="—";return}const left=Math.ceil((state.timerEnd-Date.now())/1000);if(el)el.textContent=formatTime(left);if(left<=0){stopTimer();renderFinished(true)}}
function daysUntil(dateStr){
  if(!dateStr)return null;
  const now=new Date(); const d=new Date(dateStr+"T00:00:00");
  return Math.ceil((d-now)/(1000*60*60*24));
}
function topicCount(id){return QUESTIONS.filter(q=>q.topic===id).length}
function subtopicCount(topic){let obj={};QUESTIONS.filter(q=>q.topic===topic).forEach(q=>obj[q.subtopic]=(obj[q.subtopic]||0)+1);return obj}
function accuracy(){const s=stats();return s.answered?Math.round(s.correct/s.answered*100):0}
function topicAccuracy(id){
  const s=stats(); const t=s.byTopic[id]||{answered:0,correct:0};
  return t.answered?Math.round(t.correct/t.answered*100):0;
}
function weakestTopicIds(){
  const p=profile();
  const s=stats();
  const measured=TOPICS.map(t=>({id:t.id,acc:topicAccuracy(t.id),answered:(s.byTopic[t.id]||{}).answered||0}))
    .filter(x=>x.answered>=3)
    .sort((a,b)=>a.acc-b.acc)
    .slice(0,3)
    .map(x=>x.id);
  return measured.length?measured:p.weakestTopics;
}
function coachLine(){
  const p=profile(); const weak=weakestTopicIds().map(id=>topicById(id).name).join(" + ");
  const d=daysUntil(p.examDate);
  let prefix = p.coachStyle==="strict" ? "Focus mode:" : p.coachStyle==="motivational" ? "You’ve got this:" : p.coachStyle==="calm" ? "Today, keep it simple:" : "Recommended:";
  let countdown = d===null ? "" : d>=0 ? ` ${d} day${d===1?"":"s"} left.` : " Exam date has passed; update it in Settings.";
  return `${prefix} study ${weak || "your weak topics"} first. Target ${p.dailyGoal} questions today.${countdown}`;
}
function dailyAnswered(){
  const s=stats(); const day=s.history[todayKey()]||{answered:0,correct:0}; return day.answered||0;
}
function updateStatsFromResponse(r){
  if(r.edq || r.logged)return;
  const q=questionById(r.id); if(!q || q.kind==="edq")return;
  const s=stats();
  s.answered=(s.answered||0)+1;
  s.correct=(s.correct||0)+(r.correct?1:0);
  s.byTopic=s.byTopic||{};
  s.byTopic[q.topic]=s.byTopic[q.topic]||{answered:0,correct:0};
  s.byTopic[q.topic].answered++;
  if(r.correct)s.byTopic[q.topic].correct++;
  s.history=s.history||{};
  const tk=todayKey();
  s.history[tk]=s.history[tk]||{answered:0,correct:0};
  s.history[tk].answered++;
  if(r.correct)s.history[tk].correct++;
  r.logged=true;
  saveStats(s);
}
function logAllResponses(){
  state.responses.forEach(updateStatsFromResponse);
}
function streakDays(){
  const s=stats(); let days=[];
  for(let i=6;i>=0;i--){
    const d=new Date(); d.setDate(d.getDate()-i);
    const k=d.toISOString().slice(0,10);
    days.push({label:d.toLocaleDateString(undefined,{weekday:"short"}).slice(0,1),done:!!(s.history&&s.history[k]&&s.history[k].answered>0)});
  }
  return days;
}

function renderDashboard(){
  const p=profile(); const s=stats(); const d=daysUntil(p.examDate); const daily=dailyAnswered(); const goalPct=Math.min(100,Math.round((daily/(p.dailyGoal||1))*100));
  const weak=weakestTopicIds();
  app.innerHTML=`<div class="section">
    ${card(`<div class="profileCard">
      <span class="pill premium-pill">Review Studio</span>
      <h2 style="margin-top:14px">${p.name?`Welcome back, ${h(p.name)}.`:"Welcome to your review space."}</h2>
      <p class="muted">${h(coachLine())}</p><p class="small muted">Question bank: ${QUESTIONS.length} items • deep coverage drills • balanced randomizer avoids repeats.</p>
      <div style="height:14px"></div>
      <div class="miniActions">
        <button class="btn" onclick="recommendedStart()">Start Suggested Drill</button>
        <button class="btn secondary" onclick="setTab('activities')">Take Full Mock</button>
        <button class="btn secondary" onclick="setTab('settings')">${p.name?"Edit Settings":"Set Up Profile"}</button>
      </div>
    </div>`)}
    <div class="kpiGrid">
      <div class="kpi"><span>Exam Type</span><strong>${p.examType==="professional"?"Professional":"SubPro"}</strong></div>
      <div class="kpi"><span>Countdown</span><strong>${d===null?"Set date":d>=0?d+"d":"Update"}</strong></div>
      <div class="kpi"><span>Accuracy</span><strong>${accuracy()}%</strong></div>
      <div class="kpi"><span>Today</span><strong>${daily}/${p.dailyGoal}</strong></div>
    </div>
    ${card(`<h3>Today’s Goal</h3><div class="progressBarLite"><div style="width:${goalPct}%"></div></div><p class="muted">${daily} of ${p.dailyGoal} questions completed today.</p><div class="streakRow">${streakDays().map(x=>`<div class="streakDot ${x.done?"done":""}">${x.label}</div>`).join("")}</div>`)}
    ${card(`<h3>Suggested Focus Areas</h3><div class="grid3">${weak.map(id=>{const t=topicById(id);return `<div class="recommendation"><span class="pill">${t.icon} ${t.name}</span><p class="muted">${t.focus}</p><button class="btn full" onclick="startTopicDrill('${id}')">Drill ${t.name}</button></div>`}).join("")}</div>`)}
    ${card(`<h3>Quick Access</h3><div class="grid3"><button class="btn secondary" onclick="startQuickSprint()">⚡ 10-item Sprint</button><button class="btn secondary" onclick="startCaseletDrill()">📄 Caselet Drill</button><button class="btn secondary" onclick="startGraphicDrill()">📊 Graphic Drill</button><button class="btn secondary" onclick="setTab('progress')">📈 View Progress</button></div>`)}
    ${card(DEDICATION_FOOTER, "dedicationFooter small muted")}
  </div>`;
}
function recommendedStart(){const ids=weakestTopicIds();startTopicDrill(ids[0]||"numerical")}
function startTopicDrill(topicId){
  state.sectionTopic=topicId;
  const pool=balancedPick(QUESTIONS.filter(q=>q.topic===topicId),20,{mode:"topic-"+topicId});
  state.quizMode=`Focused Drill: ${topicById(topicId).name}`;
  state.quizStarted=true; state.quizPool=pool; state.quizIndex=0; state.score=0; state.answered=0; state.chosen=null; state.responses=[]; setTabNoReset("practice"); renderQuiz();
}
function setTabNoReset(tab){state.tab=tab;renderTabs()}

function scopeBox(title,items){return `<div class="scopeBox"><b>▪ ${title}</b><div>${items.map(x=>`› ${x}`).join("<br>")}</div></div><br>`}
function renderLibrary(){
  const filtered=TOPICS.filter(t=>(t.name+" "+t.focus).toLowerCase().includes(state.topicQuery.toLowerCase()));
  const t=topicById(state.activeTopic);
  app.innerHTML=`<div class="libraryLayout">
    ${card(`<h2>📚 Topic Library</h2><input placeholder="Search topic..." value="${h(state.topicQuery)}" oninput="state.topicQuery=this.value; renderLibrary()"><div style="height:12px"></div><div class="topicList">${filtered.map(topic=>`<button class="topicBtn ${state.activeTopic===topic.id?'active':''}" onclick="state.activeTopic='${topic.id}'; renderLibrary()"><div class="topicRow"><div class="topicIcon" style="background:${topic.color}">${topic.icon}</div><div><div class="topicName">${topic.name}</div><div class="small muted">${topic.focus}</div><div class="small">${topicCount(topic.id)} questions • ${topicAccuracy(topic.id)}% accuracy</div></div></div></button>`).join("")}</div>`)}
    <div><div class="lessonHero" style="background:${t.color}"><div style="font-size:42px">${t.icon}</div><h2>${t.name}</h2><p>${t.focus}</p></div>
    ${(LESSONS[t.id]||[]).map((lesson,i)=>`<div class="card" style="margin-bottom:12px"><span class="pill">Lesson ${i+1}</span><h3 style="margin-top:12px">${lesson[0]}</h3><div class="grid3"><div class="infoBox"><b>Standard</b>${lesson[1]}</div><div class="infoBox"><b>Shortcut</b>${lesson[2]}</div><div class="infoBox"><b>Explanation</b>${lesson[3]}</div></div></div>`).join("")}
    ${card(`<h3>Topic Actions</h3><div class="grid2"><button class="btn" onclick="startTopicDrill('${t.id}')">Start 20-item Drill</button><button class="btn secondary" onclick="state.selectedTopics=['${t.id}']; setTab('practice')">Practice Only This Topic</button></div>`)}
    </div>
  </div>`;
}

function renderTopicPicker(){
  return card(`<h2>🎯 Pick Topics</h2><p class="muted">Choose topics and difficulty for practice mode.</p><div class="grid2"><button class="btn secondary" onclick="toggleAllTopics()">${state.selectedTopics.length===TOPICS.length?'Clear All':'Select All'}</button><select onchange="state.difficulty=this.value; render()"><option value="">All difficulties</option><option value="easy" ${state.difficulty==="easy"?"selected":""}>Easy only</option><option value="medium" ${state.difficulty==="medium"?"selected":""}>Medium only</option><option value="hard" ${state.difficulty==="hard"?"selected":""}>Hard only</option></select></div><div style="height:12px"></div><div class="topicChips">${TOPICS.map(t=>`<button class="chip ${state.selectedTopics.includes(t.id)?'active':''}" onclick="toggleTopic('${t.id}')"><span class="topicIcon" style="background:${t.color}">${t.icon}</span><span><b>${t.name}</b><br><span class="small muted">${topicCount(t.id)} questions • ${topicAccuracy(t.id)}% accuracy</span></span></button>`).join("")}</div>`);
}
function toggleAllTopics(){state.selectedTopics=state.selectedTopics.length===TOPICS.length?[]:TOPICS.map(t=>t.id);render()}
function toggleTopic(id){state.selectedTopics=state.selectedTopics.includes(id)?state.selectedTopics.filter(x=>x!==id):[...state.selectedTopics,id];render()}
function filteredQuestions(){return QUESTIONS.filter(q=>state.selectedTopics.includes(q.topic)&&(!state.difficulty||q.difficulty===state.difficulty))}
function resetQuizState(full=true){stopTimer();exitFocusMode();state.quizStarted=false;state.quizPool=[];state.quizIndex=0;state.score=0;state.answered=0;state.chosen=null;state.responses=[];if(full)render()}
function startPractice(){let pool=balancedPool(filteredQuestions(),{mode:"practice"});state.quizMode="practice";state.quizStarted=true;state.quizPool=pool;state.quizIndex=0;state.score=0;state.answered=0;state.chosen=null;state.responses=[];renderQuiz()}
function renderPractice(){
  if(state.quizStarted) return renderQuiz();
  app.innerHTML=`<div class="section">${renderTopicPicker()}${card(`<h2>🎯 Practice Mode</h2><p class="muted">Instant correction after every answer. Best for learning and topic drilling.</p><p><b>${filteredQuestions().length}</b> available questions.</p><button class="btn full" onclick="startPractice()">Start Practice</button>`)}</div>`;
}
function sampleFromTopics(topicIds,count,caseletOnly=false){
  let pool=QUESTIONS.filter(q=>topicIds.includes(q.topic));
  if(caseletOnly) pool=pool.filter(q=>q.subtopic && q.subtopic.toLowerCase().includes("caselet"));
  let chosen=balancedPick(pool,count,{mode:"sample"});
  if(chosen.length<count && pool.length){let extra=shuffle(pool);while(chosen.length<count){chosen.push(extra[chosen.length%extra.length])}}
  return chosen;
}
function buildFullMock(type){
  const bp=BLUEPRINTS[type];
  let mock=shuffle(EDQ).slice(0,bp.edq).map(q=>({...q, section:"EDQ"}));
  bp.proper.forEach(section=>{mock.push(...sampleFromTopics(section.topics,section.count).map(q=>({...q, section:section.label})))});
  return mock;
}
function startFullMock(type){
  const bp=BLUEPRINTS[type];
  state.quizMode=type==="professional"?"Professional Full Mock":"SubProfessional Full Mock";
  state.quizStarted=true; state.quizPool=buildFullMock(type); state.quizIndex=0; state.score=0; state.answered=0; state.chosen=null; state.responses=[]; renderQuiz(); startTimer(bp.minutes*60, bp.title);
}
function startSectionDrill(){
  const t=state.sectionTopic;
  const pool=balancedPick(QUESTIONS.filter(q=>q.topic===t),20,{mode:"section-"+t});
  state.quizMode=`Section Drill: ${topicById(t).name}`; state.quizStarted=true; state.quizPool=pool; state.quizIndex=0; state.score=0; state.answered=0; state.chosen=null; state.responses=[]; renderQuiz();
}


function startFocusedDrill(label, matcher, count=30){
  let pool=QUESTIONS.filter(q=>{
    const tags=q.modeTags||[];
    const hay=[q.topic,q.subtopic,q.difficulty,...tags].join(" ").toLowerCase();
    return matcher.some(m=>hay.includes(String(m).toLowerCase()));
  });
  if(!pool.length) pool=QUESTIONS;
  state.quizMode=label;
  state.quizStarted=true;
  state.quizPool=balancedPick(pool, Math.min(count,pool.length), {mode:label});
  state.quizIndex=0; state.score=0; state.answered=0; state.chosen=null; state.responses=[];
  setTabNoReset("activities");
  renderQuiz();
}
function startMathDrill(){startFocusedDrill("Math Drill",["math","numerical","sufficiency"],30)}
function startGrammarDrill(){startFocusedDrill("Grammar Drill",["grammar","Correct Usage","Error Recognition","Spelling","Prepositions","Articles"],30)}
function startFilipinoDrill(){startFocusedDrill("Filipino Drill",["filipino"],30)}
function startLawDrill(){startFocusedDrill("Constitution / Law Drill",["constitution","law","RA 6713","Human Rights","Environment"],30)}
function startLogicDrill(){startFocusedDrill("Logic and Analogy Drill",["logic","analytical","abstract"],30)}
function startClericalDrill(){startFocusedDrill("Clerical Drill",["clerical","Alphabetizing","Detail Checking"],25)}
function startReadingDrill(){startFocusedDrill("Reading and Paragraph Drill",["reading","Reading Comprehension","Paragraph Organization"],25)}

function startGraphicDrill(){
  const gfx=QUESTIONS.filter(q=>q.visual);
  const pool=balancedPick(gfx, Math.min(25,gfx.length), {mode:"graphic"});
  state.quizMode="Graphic/Data Drill";
  state.quizStarted=true; state.quizPool=pool; state.quizIndex=0; state.score=0; state.answered=0; state.chosen=null; state.responses=[];
  setTabNoReset("activities");
  renderQuiz();
}

function startCaseletDrill(){
  let pool=balancedPick(QUESTIONS.filter(q=>q.subtopic && q.subtopic.toLowerCase().includes("caselet")),25,{mode:"caselet"});
  if(!pool.length) pool=balancedPick(QUESTIONS,25,{mode:"caselet-fallback"});
  state.quizMode="Caselet Drill"; state.quizStarted=true; state.quizPool=pool; state.quizIndex=0; state.score=0; state.answered=0; state.chosen=null; state.responses=[]; renderQuiz();
}
function startQuickSprint(){state.quizMode="Quick Sprint";state.quizStarted=true;state.quizPool=balancedPick(QUESTIONS,10,{mode:"sprint"});state.quizIndex=0;state.score=0;state.answered=0;state.chosen=null;state.responses=[];setTabNoReset("activities");renderQuiz();startTimer(10*60,"Quick Sprint")}
function startDiagnostic(){let picked=[];TOPICS.forEach(t=>{picked.push(...balancedPick(QUESTIONS.filter(q=>q.topic===t.id),5,{mode:"diagnostic-"+t.id}))});state.quizMode="Diagnostic";state.quizStarted=true;state.quizPool=balancedPool(picked,{mode:"diagnostic"});state.quizIndex=0;state.score=0;state.answered=0;state.chosen=null;state.responses=[];renderQuiz()}
function renderActivities(){
  if(state.quizStarted) return renderQuiz();
  const p=profile();
  app.innerHTML=`<div class="section">
  ${card(`<h2>Suggested Mock</h2><p class="muted">Current exam setting: <b>${p.examType==="professional"?"Professional":"SubProfessional"}</b>. Default recommended full mock is based on this setting.</p><button class="btn full" onclick="startFullMock('${p.examType}')">Start My Recommended Full Mock</button>`)}
  <div class="grid2">
  ${card(`<div class="modeCard"><h2>📝 Professional Full Mock</h2><p class="muted">170-item simulation: 20 EDQ + 150 scored practice items. Timer: 3h 10m.</p><button class="btn full" onclick="startFullMock('professional')">Start Professional Full Mock</button></div>`)}
  ${card(`<div class="modeCard"><h2>🗂️ SubProfessional Full Mock</h2><p class="muted">165-item simulation: 20 EDQ + 145 scored practice items. Timer: 2h 40m.</p><button class="btn full" onclick="startFullMock('subprofessional')">Start SubProfessional Full Mock</button></div>`)}
  </div>
  ${card(`<h2>Focused Drills</h2><p class="muted">Fast access to high-yield coverage areas.</p><div class="grid3">
    <button class="btn secondary" onclick="startMathDrill()">Math Drill</button>
    <button class="btn secondary" onclick="startGrammarDrill()">Grammar Drill</button>
    <button class="btn secondary" onclick="startFilipinoDrill()">Filipino Drill</button>
    <button class="btn secondary" onclick="startLawDrill()">Constitution / Law Drill</button>
    <button class="btn secondary" onclick="startLogicDrill()">Logic / Analogy Drill</button>
    <button class="btn secondary" onclick="startClericalDrill()">Clerical Drill</button>
    <button class="btn secondary" onclick="startReadingDrill()">Reading / Paragraph Drill</button>
    <button class="btn secondary" onclick="startGraphicDrill()">Graphic / Data Drill</button>
  </div>`)}
  ${card(`<h2>⚡ Activity Hub</h2><div class="grid2">
    <button class="btn secondary" onclick="startQuickSprint()">Quick Sprint 10</button>
    <button class="btn secondary" onclick="startDiagnostic()">Diagnostic 45</button>
    <button class="btn secondary" onclick="startCaseletDrill()">Caselet Drill 25</button><button class="btn secondary" onclick="startGraphicDrill()">Graphic/Data Drill</button>
    <button class="btn secondary" onclick="startWeakQuiz()">Weak Spot Practice</button>
  </div>`)}
  ${card(`<h2>🎯 Section Drill</h2><p class="muted">Pick one section and answer 20 targeted questions.</p><div class="selectRow"><select onchange="state.sectionTopic=this.value">${TOPICS.map(t=>`<option value="${t.id}" ${state.sectionTopic===t.id?"selected":""}>${t.icon} ${t.name} (${topicCount(t.id)})</option>`).join("")}</select><button class="btn" onclick="startSectionDrill()">Start Section Drill</button></div>`)}
  </div>`;
}
function chooseAnswer(i){
  if(state.chosen!==null && state.quizMode==="practice") return;
  const q=state.quizPool[state.quizIndex]; state.chosen=i;
  if(q.kind==="edq" || state.quizMode.includes("Full Mock") || state.quizMode==="Diagnostic"){
    state.responses[state.quizIndex]={id:q.id, chosen:i, correct:q.kind==="edq"?true:i===q.answer, edq:q.kind==="edq", section:q.section||q.subtopic};
    nextQuestion();
  } else renderQuiz();
}
function nextQuestion(){
  const q=state.quizPool[state.quizIndex]; let chosen=state.chosen, correct=q.kind==="edq" ? true : chosen===q.answer;
  if(!state.responses[state.quizIndex]) state.responses[state.quizIndex]={id:q.id,chosen,correct,edq:q.kind==="edq",section:q.section||q.subtopic};
  if(q.kind!=="edq"){ if(correct) state.score++; else addWeak(q.id); state.answered++; }
  updateStatsFromResponse(state.responses[state.quizIndex]);
  state.chosen=null; if(state.quizIndex>=state.quizPool.length-1) renderFinished(); else {state.quizIndex++;renderQuiz()}
}
function addWeak(id){setWeakIds([...weakIds(),id])}
function clearWeak(){setWeakIds([]);renderWeak()}
function renderQuiz(){
  enterFocusMode();
  const pool=state.quizPool;if(!pool.length){app.innerHTML=card(`<h2>No questions found</h2><button class="btn" onclick="resetQuizState()">Back</button>`);return}
  const q=pool[state.quizIndex], t=topicById(q.topic), answered=state.chosen!==null, correct=q.kind==="edq"||state.chosen===q.answer;
  const scoredTotal=pool.filter(x=>x.kind!=="edq").length;
  app.innerHTML=`<div class="activityShell">
  <div class="activityHeader">
    <div>
      <span class="pill">Focused Activity</span>
      <h2>${state.quizMode.replace(" Full Mock","")}</h2>
    </div>
    <button class="btn secondary exitActivityBtn" onclick="quitActivity()">Exit</button>
  </div>
  <div class="quizTop"><div class="statBox"><span>Mode</span><strong>${state.quizMode.replace(" Full Mock","")}</strong></div><div class="statBox"><span>Score</span><strong>${state.score}/${state.answered}</strong></div><div class="statBox"><span>Timer</span><strong class="timer" id="timerBox">${state.timerEnd?"--:--":"—"}</strong></div><div class="statBox"><span>Left</span><strong>${pool.length-state.quizIndex}</strong></div></div>
  <div class="card"><span class="pill">${q.kind==="edq"?"📝 EDQ • Non-scored":`${t.icon} ${t.name} • ${q.subtopic||q.section}`}</span><h2 style="margin-top:14px">Item ${state.quizIndex+1} of ${pool.length}</h2><div class="progress"><div style="width:${((state.quizIndex+1)/pool.length)*100}%"></div></div><h3>${h(q.q)}</h3>${renderVisual(q)}<div class="choices">${q.choices.map((c,i)=>`<button class="choice ${answered&&i===q.answer?'correct':''} ${answered&&i===state.chosen&&i!==q.answer?'wrong':''}" ${answered?'disabled':''} onclick="chooseAnswer(${i})"><span class="letter">${String.fromCharCode(65+i)}</span><span>${h(c)}</span></button>`).join("")}</div>
  ${answered&&!state.quizMode.includes("Full Mock")&&state.quizMode!=="Diagnostic"?`<div class="answerBox ${correct?'good':'bad'}"><h3>${correct?'✅ Correct':'❌ Corrected'}</h3>${!correct?`<p><b>Correct answer:</b> ${String.fromCharCode(65+q.answer)}. ${h(q.choices[q.answer])}</p>`:''}<div class="grid2"><div class="infoBox"><b>Shortcut</b>${h(q.shortcut)}</div><div class="infoBox"><b>Explanation</b>${h(q.explanation)}</div></div><div style="height:12px"></div><button class="btn full" onclick="nextQuestion()">${state.quizIndex>=pool.length-1?'Finish':'Next Question'} →</button></div>`:""}
  </div></div>`;
  updateTimer();
}
function breakdownHTML(){
  const rows={};
  state.responses.forEach(r=>{ if(r.edq)return; const q=questionById(r.id); if(!q)return; const name=topicById(q.topic).name; if(!rows[name])rows[name]={correct:0,total:0}; rows[name].total++; if(r.correct)rows[name].correct++; });
  return `<div class="breakdown">${Object.entries(rows).map(([name,v])=>`<div class="breakItem"><span>${name}</span><b>${v.correct}/${v.total}</b></div>`).join("")}</div>`;
}
function renderFinished(timeExpired=false){
  stopTimer();
  logAllResponses();
  const totalScored=state.responses.filter(r=>!r.edq).length;
  const score=state.responses.filter(r=>!r.edq && r.correct).length;
  state.score=score; const pct=totalScored?Math.round(score/totalScored*100):0;
  const s=stats(); s.lastMock={mode:state.quizMode,score,total:totalScored,pct,date:new Date().toISOString()}; saveStats(s);
  app.innerHTML=card(`<div style="text-align:center"><div style="font-size:60px">${timeExpired?"⏰":"🏆"}</div><h2>${timeExpired?"Time Finished":"Finished"}</h2><p>Scored Test Proper: <b>${score}/${totalScored}</b> (${pct}%)</p><p class="muted">${state.responses.filter(r=>r.edq).length} EDQ items completed and not counted in score.</p><div class="progress"><div style="width:${pct}%"></div></div></div><h3>Score Breakdown</h3>${breakdownHTML()}<div style="height:12px"></div><div class="grid2"><button class="btn" onclick="reviewResults()">Review Explanations</button><button class="btn secondary" onclick="resetQuizState(); setTab('dashboard')">Back to Home</button></div>`);
}
function reviewResults(){
  app.innerHTML=`<div class="section">${card(`<h2>Answer Review</h2><p class="muted">Correct answer, shortcut, and explanation for every scored item. EDQ items are non-scored.</p><button class="btn secondary" onclick="renderFinished()">Back to score</button>`)}
  ${state.responses.map((r,i)=>{const q=questionById(r.id), t=topicById(q.topic); if(!q)return ""; return `<div class="reviewItem"><span class="pill">${q.kind==="edq"?"📝 EDQ • Non-scored":`${t.icon} ${t.name} • ${q.subtopic} • ${q.difficulty}`}</span><h3 style="margin-top:10px">${i+1}. ${h(q.q)}</h3>${renderVisual(q)}<p><b>Your answer:</b> ${r.chosen==null?'No answer':String.fromCharCode(65+r.chosen)+'. '+h(q.choices[r.chosen])}</p>${q.kind==="edq"?`<p class="muted">EDQ item — no correct or incorrect answer.</p>`:`<p><b>Correct answer:</b> ${String.fromCharCode(65+q.answer)}. ${h(q.choices[q.answer])}</p><div class="grid2"><div class="infoBox"><b>Shortcut</b>${h(q.shortcut)}</div><div class="infoBox"><b>Explanation</b>${h(q.explanation)}</div></div>`}</div>`}).join("")}</div>`;
}
function renderWeak(){
  const weakQs=weakIds().map(questionById).filter(Boolean);
  if(!weakQs.length){app.innerHTML=card(`<h2>🧠 Weak Spot Bank</h2><p class="muted">No weak spots yet. Missed scored questions will appear here.</p><button class="btn" onclick="setTab('practice')">Start Practice</button>`);return}
  app.innerHTML=`<div class="section">${card(`<h2>🧠 Weak Spot Bank</h2><p class="muted">${weakQs.length} saved weak questions.</p><div class="grid2"><button class="btn" onclick="startWeakQuiz()">Practice Weak Spots</button><button class="btn danger" onclick="clearWeak()">Clear Weak Spots</button></div>`)}
  ${weakQs.map((q,i)=>`<div class="reviewItem"><span class="pill">${topicById(q.topic).icon} ${topicById(q.topic).name} • ${q.subtopic}</span><h3 style="margin-top:10px">${i+1}. ${h(q.q)}</h3>${renderVisual(q)}<p><b>Answer:</b> ${String.fromCharCode(65+q.answer)}. ${h(q.choices[q.answer])}</p><div class="grid2"><div class="infoBox"><b>Shortcut</b>${h(q.shortcut)}</div><div class="infoBox"><b>Explanation</b>${h(q.explanation)}</div></div></div>`).join("")}</div>`;
}
function startWeakQuiz(){const qs=balancedPool(weakIds().map(questionById).filter(Boolean),{mode:"weak"});if(!qs.length)return renderWeak();state.quizStarted=true;state.quizMode="Weak Practice";state.quizPool=qs;state.quizIndex=0;state.score=0;state.answered=0;state.chosen=null;state.responses=[];setTabNoReset("practice");renderQuiz()}
function renderProgress(){
  const s=stats(); const acc=accuracy(); const p=profile(); const last=s.lastMock;
  app.innerHTML=`<div class="section">
    ${card(`<h2>📈 Progress Report</h2><p class="muted">Your activity is saved locally in this browser.</p><div class="kpiGrid"><div class="kpi"><span>Total Answered</span><strong>${s.answered||0}</strong></div><div class="kpi"><span>Total Accuracy</span><strong>${acc}%</strong></div><div class="kpi"><span>Weak Saved</span><strong>${weakIds().length}</strong></div><div class="kpi"><span>Target</span><strong>${p.targetScore}%</strong></div></div>`)}
    ${card(`<h3>Topic Accuracy</h3><div class="topicProgress">${TOPICS.map(t=>{const a=topicAccuracy(t.id);const answered=((s.byTopic||{})[t.id]||{}).answered||0;return `<div class="topicProgressItem"><div style="display:flex;justify-content:space-between;gap:10px"><b>${t.icon} ${t.name}</b><span class="muted">${answered} answered • ${a}%</span></div><div class="progressBarLite"><div style="width:${a}%"></div></div></div>`}).join("")}</div>`)}
    ${card(`<h3>Coverage Matrix</h3><p class="muted">Topic areas used to build the practice bank.</p><div class="coverageGrid">${Object.entries(window.CSE_DATA.coverageMap||{}).map(([k,v])=>`<div class="coverageBox"><b>${k}</b><span>${v.length} areas</span><p>${v.join(", ")}</p></div>`).join("")}</div>`)}
    ${card(`<h3>Last Mock</h3>${last?`<p><b>${h(last.mode)}</b></p><p>Score: <b>${last.score}/${last.total}</b> (${last.pct}%)</p><p class="muted">${new Date(last.date).toLocaleString()}</p>`:`<p class="muted">No mock completed yet.</p>`}<div class="grid2"><button class="btn" onclick="setTab('activities')">Take Mock</button><button class="btn secondary" onclick="exportProgress()">Export Progress JSON</button></div>`)}
  </div>`;
}
function exportProgress(){
  const blob=new Blob([JSON.stringify({profile:profile(),stats:stats(),weakIds:weakIds()},null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="cse-progress.json"; a.click(); URL.revokeObjectURL(url);
}
function renderFormulas(){
  const shown=FORMULAS.filter(f=>(f[0]+f[1]+f[2]+f[3]).toLowerCase().includes(state.formulaQuery.toLowerCase()));
  app.innerHTML=`<div class="section">${card(`<h2>🧮 Formula Library</h2><p class="muted">Standard computation, shortcut method, and explanation.</p><input placeholder="Search formula..." value="${h(state.formulaQuery)}" oninput="state.formulaQuery=this.value; renderFormulas()">`)}
  <div class="formulaGrid">${shown.map(f=>card(`<span class="pill">Formula</span><h3 style="margin-top:12px">${h(f[0])}</h3><div class="formulaCode">${h(f[1])}</div><p><b>Standard:</b> ${h(f[2])}</p><p><b>Shortcut:</b> ${h(f[3])}</p><p><b>Explanation:</b> ${h(f[4])}</p>`)).join("")}</div>${renderFlashcard()}</div>`;
}
function renderFlashcard(){
  const cards=FORMULAS.map(f=>({front:f[0],back:`${f[1]} | Shortcut: ${f[3]}`}));
  const c=cards[state.flashIndex%cards.length];
  return card(`<h2>Flashcard</h2><p class="muted">Tap card to flip.</p><div class="flashcard scopeBox" onclick="state.flashSide=state.flashSide==='front'?'back':'front'; renderFormulas()"><h2>${state.flashSide==='front'?h(c.front):h(c.back)}</h2></div><div class="grid2"><button class="btn secondary" onclick="state.flashIndex=Math.max(0,state.flashIndex-1);state.flashSide='front';renderFormulas()">Previous</button><button class="btn" onclick="state.flashIndex++;state.flashSide='front';renderFormulas()">Next</button></div>`);
}
function renderSettings(){
  const p=profile();
  app.innerHTML=`<div class="section">
  ${card(`<h2>⚙️ Review Settings</h2><p class="muted">Use these settings to adjust your exam track, study goals, weak topics, and review style. Saved locally in this browser.</p>`)}
  <div class="settingsGrid">
    <div class="settingBlock"><label>Name</label><input id="setName" value="${h(p.name)}" placeholder="Your name"></div>
    <div class="settingBlock"><label>Exam Type</label><select id="setExamType"><option value="professional" ${p.examType==="professional"?"selected":""}>Professional</option><option value="subprofessional" ${p.examType==="subprofessional"?"selected":""}>SubProfessional</option></select></div>
    <div class="settingBlock"><label>Exam Date</label><input id="setExamDate" type="date" value="${h(p.examDate)}"></div>
    <div class="settingBlock"><label>Target Score (%)</label><input id="setTargetScore" type="number" min="80" max="100" value="${p.targetScore}"></div>
    <div class="settingBlock"><label>Daily Question Goal</label><input id="setDailyGoal" type="number" min="5" max="300" value="${p.dailyGoal}"></div>
    <div class="settingBlock"><label>Daily Study Minutes</label><input id="setStudyMinutes" type="number" min="5" max="300" value="${p.studyMinutes}"></div>
    <div class="settingBlock"><label>Review Style</label><select id="setCoachStyle"><option value="direct" ${p.coachStyle==="direct"?"selected":""}>Straightforward</option><option value="calm" ${p.coachStyle==="calm"?"selected":""}>Calm</option><option value="strict" ${p.coachStyle==="strict"?"selected":""}>Strict</option><option value="motivational" ${p.coachStyle==="motivational"?"selected":""}>Encouraging</option></select></div>
    <div class="settingBlock"><label>Explanation Depth</label><select id="setExplanationDepth"><option value="short" ${p.explanationDepth==="short"?"selected":""}>Short</option><option value="balanced" ${p.explanationDepth==="balanced"?"selected":""}>Balanced</option><option value="deep" ${p.explanationDepth==="deep"?"selected":""}>Deep</option></select></div>
    <div class="settingBlock"><label>Preferred Pace</label><select id="setPreferredPace"><option value="fast" ${p.preferredPace==="fast"?"selected":""}>Fast drills</option><option value="balanced" ${p.preferredPace==="balanced"?"selected":""}>Balanced</option><option value="deep" ${p.preferredPace==="deep"?"selected":""}>Deep review</option></select></div>
    <div class="settingBlock"><label>Daily Reminder Text</label><input id="setReminderText" value="${h(p.reminderText)}" placeholder="Example: 30 questions before games"></div>
  </div>
  ${card(`<h3>Weak Topics You Want to Prioritize</h3><div class="checkboxGrid">${TOPICS.map(t=>`<label class="checkItem"><input type="checkbox" class="weakCheck" value="${t.id}" ${p.weakestTopics.includes(t.id)?"checked":""}> <span>${t.icon} ${t.name}</span></label>`).join("")}</div>`)}
  ${card(`<h3>Data Controls</h3><div class="grid3"><button class="btn" onclick="saveSettings()">Save Settings</button><button class="btn secondary" onclick="resetProfileOnly()">Reset Profile</button><button class="btn danger" onclick="resetAllProgress()">Reset All Progress</button></div>`)}
  ${card(`<h3>Formula Library</h3><p class="muted">Formula cards are still available here.</p><button class="btn secondary" onclick="renderFormulas()">Open Formula Library</button>`)}
  ${card(`<h3>About</h3>${DEDICATION_FOOTER}`, "dedicationFooter small muted")}
  </div>`;
}
function saveSettings(){
  const weak=[...document.querySelectorAll(".weakCheck:checked")].map(x=>x.value);
  saveProfile({
    name:document.getElementById("setName").value.trim(),
    examType:document.getElementById("setExamType").value,
    examDate:document.getElementById("setExamDate").value,
    targetScore:Number(document.getElementById("setTargetScore").value||85),
    dailyGoal:Number(document.getElementById("setDailyGoal").value||30),
    studyMinutes:Number(document.getElementById("setStudyMinutes").value||45),
    coachStyle:document.getElementById("setCoachStyle").value,
    explanationDepth:document.getElementById("setExplanationDepth").value,
    preferredPace:document.getElementById("setPreferredPace").value,
    reminderText:document.getElementById("setReminderText").value.trim(),
    weakestTopics:weak.length?weak:["numerical","verbal"]
  });
  setTab("dashboard");
}
function resetProfileOnly(){localStorage.removeItem("profile");renderSettings()}
function resetAllProgress(){if(confirm("Reset all progress, weak spots, stats, and profile?")){localStorage.removeItem("profile");localStorage.removeItem("stats");localStorage.removeItem("weakIds");setTab("dashboard")}}

function render(){
  if(!state.quizStarted) exitFocusMode();
  renderTabs();
  if(state.tab==="dashboard")renderDashboard();
  if(state.tab==="library")renderLibrary();
  if(state.tab==="practice")renderPractice();
  if(state.tab==="activities")renderActivities();
  if(state.tab==="progress")renderProgress();
  if(state.tab==="settings")renderSettings();
}
window.quitActivity=quitActivity;window.startFocusedDrill=startFocusedDrill;window.startMathDrill=startMathDrill;window.startGrammarDrill=startGrammarDrill;window.startFilipinoDrill=startFilipinoDrill;window.startLawDrill=startLawDrill;window.startLogicDrill=startLogicDrill;window.startClericalDrill=startClericalDrill;window.startReadingDrill=startReadingDrill;window.setTab=setTab;window.renderLibrary=renderLibrary;window.toggleAllTopics=toggleAllTopics;window.toggleTopic=toggleTopic;window.startPractice=startPractice;window.startFullMock=startFullMock;window.startQuickSprint=startQuickSprint;window.startDiagnostic=startDiagnostic;window.startGraphicDrill=startGraphicDrill;window.startCaseletDrill=startCaseletDrill;window.startSectionDrill=startSectionDrill;window.startTopicDrill=startTopicDrill;window.recommendedStart=recommendedStart;window.chooseAnswer=chooseAnswer;window.nextQuestion=nextQuestion;window.resetQuizState=resetQuizState;window.reviewResults=reviewResults;window.renderFinished=renderFinished;window.startWeakQuiz=startWeakQuiz;window.clearWeak=clearWeak;window.renderFormulas=renderFormulas;window.renderSettings=renderSettings;window.saveSettings=saveSettings;window.resetProfileOnly=resetProfileOnly;window.resetAllProgress=resetAllProgress;window.exportProgress=exportProgress;window.state=state;
const themeBtn=document.getElementById("themeBtn");const savedTheme=localStorage.getItem("theme")||"dark";document.documentElement.dataset.theme=savedTheme;themeBtn.textContent=savedTheme==="dark"?"☀️":"🌙";themeBtn.onclick=()=>{const next=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=next;localStorage.setItem("theme",next);themeBtn.textContent=next==="dark"?"☀️":"🌙"};render();
