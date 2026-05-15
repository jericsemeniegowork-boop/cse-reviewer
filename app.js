
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
  themeAccent:"blue",
  showShortcuts:true,
  showExplanations:true,
  compactMode:false,
  topicPrefs:{}
};

let state = {
  tab:"dashboard", activeTopic:"numerical", selectedTopics:TOPICS.map(t=>t.id),
  topicQuery:"", formulaQuery:"", libraryQuery:"", difficulty:"", sectionTopic:"general",
  quizStarted:false, quizMode:"practice", quizPool:[], quizIndex:0,
  score:0, answered:0, chosen:null, responses:[], flashIndex:0, flashSide:"front",
  timerEnd:null, timerLabel:"", libraryPanel:"overview"
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

function displayPrefs(){const p=profile();return {showShortcuts:p.showShortcuts!==false, showExplanations:p.showExplanations!==false}}
function answerSupportHTML(q){const pref=displayPrefs();const parts=[];if(pref.showShortcuts)parts.push(`<div class="infoBox"><b>Shortcut</b>${h(q.shortcut||"")}</div>`);if(pref.showExplanations)parts.push(`<div class="infoBox"><b>Explanation</b>${h(q.explanation||"")}</div>`);return parts.length?`<div class="grid2">${parts.join("")}</div>`:`<p class="small muted">Shortcuts and explanations are hidden in Settings.</p>`}
function userNotes(){return load("userNotes",{})}
function saveUserNote(key,val){const n=userNotes();n[key]=val;save("userNotes",n)}
function getTopicPref(topicId){const p=profile();return (p.topicPrefs||{})[topicId] || {confidence:"", priority:"normal", reminder:""}}
function saveTopicPref(topicId,field,val){const p=profile();const prefs={...(p.topicPrefs||{})};prefs[topicId]={...(prefs[topicId]||{confidence:"",priority:"normal",reminder:""}),[field]:val};saveProfile({topicPrefs:prefs})}
function renderTopicCustomizer(topicId){const pref=getTopicPref(topicId);return `<div class="topicCustomizer"><h3>Topic Customizer</h3><div class="settingsGrid"><div class="settingBlock"><label>Confidence</label><select onchange="saveTopicPref('${topicId}','confidence',this.value)"><option value="" ${pref.confidence===""?"selected":""}>Not set</option><option value="weak" ${pref.confidence==="weak"?"selected":""}>Weak</option><option value="okay" ${pref.confidence==="okay"?"selected":""}>Okay</option><option value="strong" ${pref.confidence==="strong"?"selected":""}>Strong</option></select></div><div class="settingBlock"><label>Priority</label><select onchange="saveTopicPref('${topicId}','priority',this.value)"><option value="low" ${pref.priority==="low"?"selected":""}>Low</option><option value="normal" ${pref.priority==="normal"?"selected":""}>Normal</option><option value="high" ${pref.priority==="high"?"selected":""}>High</option></select></div><div class="settingBlock wide"><label>Reminder for this topic</label><input value="${h(pref.reminder||"")}" placeholder="Example: Review reverse percent and fractions" oninput="saveTopicPref('${topicId}','reminder',this.value)"></div></div></div>`}
function renderStudyNotesBlock(topicId){const noteData=(window.CSE_DATA.studyNotes||{})[topicId];if(!noteData)return `<div class="studyNoteBlock"><p>No built-in note for this topic yet. Use your personal notes below.</p></div>`;return `<div class="studyNoteBlock"><h3>${h(noteData.title)}</h3>${(noteData.body||[]).map(p=>`<p>${h(p)}</p>`).join("")}</div>`}
function renderPersonalNotes(topicId="general"){const notes=userNotes();const val=notes[topicId]||"";return `<div class="personalNotesBox"><h3>My ${h(topicById(topicId).name||"Topic")} Notes</h3><p class="muted">Write your own reviewer notes, formulas, reminders, and mistakes. Saved in this browser.</p><textarea class="notesArea" placeholder="Write notes for this topic..." oninput="saveUserNote('${topicId}', this.value)">${h(val)}</textarea></div>`}
function noteTopicButton(current,id,label){return `<button class="chip ${current===id?'active':''}" onclick="state.noteTopic='${id}'; state.activeTopic='${id}'; renderLibrary()">${label}</button>`}

function libraryData(){return load("libraryData",{})}
function libraryTopicData(topicId){
  const d=libraryData();
  return d[topicId] || {notes:"", mistakes:"", rules:"", checklist:{}, lastReviewed:""};
}
function saveLibraryField(topicId, field, value){
  const d=libraryData();
  d[topicId]=d[topicId] || {notes:"", mistakes:"", rules:"", checklist:{}, lastReviewed:""};
  d[topicId][field]=value;
  save("libraryData", d);
}
function toggleLibraryCheck(topicId, index){
  const d=libraryData();
  d[topicId]=d[topicId] || {notes:"", mistakes:"", rules:"", checklist:{}, lastReviewed:""};
  d[topicId].checklist=d[topicId].checklist || {};
  d[topicId].checklist[index]=!d[topicId].checklist[index];
  save("libraryData", d);
  renderLibrary();
}
function markTopicReviewed(topicId){
  saveLibraryField(topicId, "lastReviewed", new Date().toISOString());
  renderLibrary();
}
function topicQuestions(topicId){return QUESTIONS.filter(q=>q.topic===topicId)}
function topicSubtopicRows(topicId){
  const map={};
  topicQuestions(topicId).forEach(q=>{
    const key=q.subtopic || "General";
    map[key]=map[key] || {total:0,easy:0,medium:0,hard:0};
    map[key].total++;
    map[key][q.difficulty || "medium"]=(map[key][q.difficulty || "medium"]||0)+1;
  });
  return Object.entries(map).sort((a,b)=>b[1].total-a[1].total);
}
function escAttr(s){return h(s).replace(/'/g,"&#39;")}
function startSubtopicDrill(topicId, subtopic){
  const pool=QUESTIONS.filter(q=>q.topic===topicId && (q.subtopic||"General")===subtopic);
  state.quizMode=`${topicById(topicId).name}: ${subtopic}`;
  state.quizStarted=true;
  state.quizPool=balancedPick(pool,Math.min(20,pool.length),{mode:"subtopic-"+topicId+"-"+subtopic});
  state.quizIndex=0; state.score=0; state.answered=0; state.chosen=null; state.responses=[];
  setTabNoReset("practice");
  renderQuiz();
}
function topicKeywords(topicId){
  const bank={
    general:["constitution","ra 6713","public","rights","environment","law","suffrage","impeachment","saln","ombudsman","commission"],
    verbal:["grammar","sentence","reading","paragraph","vocabulary","error","subject","verb"],
    filipino:["filipino","ng","nang","kasingkahulugan","kasalungat","pang-uri","pang-abay"],
    numerical:["percent","fraction","ratio","average","work","motion","geometry","sequence","formula","rate"],
    analytical:["logic","analogy","assumption","conclusion","argument","strengthen","weaken"],
    data:["data","table","chart","average","percentage","graph"],
    clerical:["filing","spelling","alphabet","clerical","detail"],
    sufficiency:["sufficiency","statement","enough","definite"],
    abstract:["sequence","pattern","fibonacci","letter","abstract"]
  };
  return bank[topicId] || [topicId];
}
function topicFormulaCards(topicId){
  const keys=topicKeywords(topicId);
  return FORMULAS.filter(f=>keys.some(k=>(f.join(" ")).toLowerCase().includes(k))).slice(0,8);
}
function exportTopicNotes(topicId){
  const t=topicById(topicId), d=libraryTopicData(topicId), pref=getTopicPref(topicId);
  const text=`${t.name} Notes\n\nConfidence: ${pref.confidence || "Not set"}\nPriority: ${pref.priority || "normal"}\nReminder: ${pref.reminder || ""}\n\nMy Notes:\n${d.notes || ""}\n\nMistake Log:\n${d.mistakes || ""}\n\nRules / Formulas:\n${d.rules || ""}`;
  const blob=new Blob([text],{type:"text/plain"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=`${t.name.replace(/[^a-z0-9]+/gi,"_")}_notes.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
}
function copyTopicNotes(topicId){
  const t=topicById(topicId), d=libraryTopicData(topicId);
  const text=`${t.name} Notes\n\nMy Notes:\n${d.notes || ""}\n\nMistake Log:\n${d.mistakes || ""}\n\nRules / Formulas:\n${d.rules || ""}`;
  navigator.clipboard?.writeText(text);
}
function libraryTabButton(id,label){
  return `<button class="libraryTab ${state.libraryPanel===id?'active':''}" onclick="state.libraryPanel='${id}';renderLibrary()">${label}</button>`;
}
function renderTopicCustomizer(topicId){
  const pref=getTopicPref(topicId);
  return `<div class="topicCustomizer">
    <h3>Topic Customizer</h3>
    <p class="small muted">Make this topic personal. Use it to decide what deserves more review time.</p>
    <div class="settingsGrid">
      <div class="settingBlock"><label>Confidence</label><select onchange="saveTopicPref('${topicId}','confidence',this.value);renderLibrary()"><option value="" ${pref.confidence===""?"selected":""}>Not set</option><option value="weak" ${pref.confidence==="weak"?"selected":""}>Weak</option><option value="okay" ${pref.confidence==="okay"?"selected":""}>Okay</option><option value="strong" ${pref.confidence==="strong"?"selected":""}>Strong</option></select></div>
      <div class="settingBlock"><label>Priority</label><select onchange="saveTopicPref('${topicId}','priority',this.value);renderLibrary()"><option value="low" ${pref.priority==="low"?"selected":""}>Low</option><option value="normal" ${pref.priority==="normal"?"selected":""}>Normal</option><option value="high" ${pref.priority==="high"?"selected":""}>High</option></select></div>
      <div class="settingBlock"><label>Target</label><select onchange="saveTopicPref('${topicId}','target',this.value);renderLibrary()"><option value="" ${(pref.target||"")===""?"selected":""}>Not set</option><option value="accuracy" ${pref.target==="accuracy"?"selected":""}>Accuracy</option><option value="speed" ${pref.target==="speed"?"selected":""}>Speed</option><option value="memory" ${pref.target==="memory"?"selected":""}>Memory</option><option value="deep" ${pref.target==="deep"?"selected":""}>Deep understanding</option></select></div>
      <div class="settingBlock wide"><label>Reminder for this topic</label><input value="${h(pref.reminder||"")}" placeholder="Example: Recheck reverse percent and fractions" oninput="saveTopicPref('${topicId}','reminder',this.value)"></div>
    </div>
  </div>`;
}
function renderLibraryOverview(topicId){
  const t=topicById(topicId), qs=topicQuestions(topicId), pref=getTopicPref(topicId), d=libraryTopicData(topicId);
  const acc=topicAccuracy(topicId), rows=topicSubtopicRows(topicId), checklist=(window.CSE_DATA.libraryChecklists||{})[topicId]||[];
  const doneCount=checklist.filter((_,i)=>d.checklist&&d.checklist[i]).length;
  const last=d.lastReviewed?new Date(d.lastReviewed).toLocaleDateString():"Not yet";
  return `<div class="libraryGrid">
    ${card(`<h3>Topic Snapshot</h3><div class="topicSnapshot">
      <div><span>Questions</span><strong>${qs.length}</strong></div>
      <div><span>Accuracy</span><strong>${acc}%</strong></div>
      <div><span>Confidence</span><strong>${pref.confidence||"Unset"}</strong></div>
      <div><span>Priority</span><strong>${pref.priority||"normal"}</strong></div>
    </div><p class="small muted">Last reviewed: ${last}</p><div class="grid2"><button class="btn" onclick="startTopicDrill('${topicId}')">Start Topic Drill</button><button class="btn secondary" onclick="markTopicReviewed('${topicId}')">Mark Reviewed</button></div>`)}
    ${card(`<h3>Study Checklist</h3><p class="small muted">${doneCount}/${checklist.length} completed</p><div class="libraryChecklist">${checklist.map((x,i)=>`<label><input type="checkbox" ${d.checklist&&d.checklist[i]?"checked":""} onchange="toggleLibraryCheck('${topicId}',${i})"><span>${h(x)}</span></label>`).join("")}</div>`)}
    ${card(`<h3>Subtopic Map</h3><div class="subtopicRows">${rows.slice(0,10).map(([name,info])=>`<div class="subtopicRow"><div><b>${h(name)}</b><span>${info.total} items • Easy ${info.easy||0} • Medium ${info.medium||0} • Hard ${info.hard||0}</span></div><button class="btn secondary" onclick="startSubtopicDrill('${topicId}','${escAttr(name)}')">Drill</button></div>`).join("")}</div>`)}
    ${card(`<h3>Recommended Flow</h3><ol class="studyFlow"><li>Read the guide for this topic.</li><li>Do one 20-item drill.</li><li>Review wrong answers.</li><li>Write the missed rule in Mistake Log.</li><li>Mark the checklist item done.</li></ol>`)}
  </div>`;
}
function renderLibraryLessons(topicId){
  const raw=LESSONS[topicId]||[];
  const q=(state.libraryQuery||"").toLowerCase();
  const filtered=raw.filter(lesson=>{
    const title=Array.isArray(lesson)?lesson[0]:(lesson.title||"");
    const body=Array.isArray(lesson)?lesson.slice(1).join(" "):(lesson.body||"");
    return (title+" "+body).toLowerCase().includes(q);
  });
  return `${card(`<h3>Lesson Deck</h3><p class="muted">Short lessons that explain what to watch for before answering questions.</p><input placeholder="Search lessons..." value="${h(state.libraryQuery||"")}" oninput="state.libraryQuery=this.value;renderLibrary()">`)}
  <div class="lessonDeck">${filtered.map((lesson,i)=>{
    const title=Array.isArray(lesson)?lesson[0]:(lesson.title||`Lesson ${i+1}`);
    const standard=Array.isArray(lesson)?lesson[1]:(lesson.body||"");
    const shortcut=Array.isArray(lesson)?lesson[2]:"";
    const explanation=Array.isArray(lesson)?lesson[3]:"";
    return `<div class="studyLessonCard"><span class="pill">Lesson</span><h3>${h(title)}</h3><div class="lessonParagraph"><p>${h(standard)}</p>${shortcut?`<p><b>Shortcut:</b> ${h(shortcut)}</p>`:""}${explanation?`<p><b>Why it matters:</b> ${h(explanation)}</p>`:""}</div></div>`;
  }).join("") || card(`<h3>No lessons matched</h3><p class="muted">Try a different search term.</p>`)}</div>`;
}
function renderLibraryNotes(topicId){
  const d=libraryTopicData(topicId);
  return `<div class="notesWorkspace">
    ${card(`<h3>My Study Notes</h3><p class="muted">Write explanations in your own words. Keep this as your personal reviewer.</p><textarea class="notesArea big" placeholder="Write topic notes here..." oninput="saveLibraryField('${topicId}','notes',this.value)">${h(d.notes||"")}</textarea>`)}
    ${card(`<h3>Mistake Log</h3><p class="muted">Write the rule you missed, not just the question number.</p><textarea class="notesArea" placeholder="Example: Reverse percent uses final ÷ remaining percent, not final - discount." oninput="saveLibraryField('${topicId}','mistakes',this.value)">${h(d.mistakes||"")}</textarea>`)}
    ${card(`<h3>Rules / Formulas</h3><p class="muted">Keep shortcuts, formulas, and memory hooks here.</p><textarea class="notesArea" placeholder="Example: Work rate = 1/a + 1/b" oninput="saveLibraryField('${topicId}','rules',this.value)">${h(d.rules||"")}</textarea>`)}
    ${card(`<h3>Note Actions</h3><div class="grid2"><button class="btn secondary" onclick="copyTopicNotes('${topicId}')">Copy Notes</button><button class="btn secondary" onclick="exportTopicNotes('${topicId}')">Export .txt</button></div>`)}
  </div>`;
}
function renderLibraryCards(topicId){
  const cards=topicFormulaCards(topicId);
  return `<div class="libraryGrid">${card(`<h3>Quick Cards for ${h(topicById(topicId).name)}</h3><p class="muted">Useful formulas, rules, and study cards related to this topic.</p><button class="btn secondary" onclick="renderFormulas()">Open Full Formula Library</button>`)}
    ${cards.map(f=>card(`<span class="pill">Card</span><h3>${h(f[0])}</h3><div class="formulaCode">${h(f[1])}</div><p><b>Use:</b> ${h(f[2])}</p><p><b>Shortcut:</b> ${h(f[3])}</p><p><b>Note:</b> ${h(f[4])}</p>`)).join("") || card(`<h3>No specific cards found</h3><p class="muted">Use the full formula library for all cards.</p>`)}</div>`;
}

function toggleShortcuts(v){saveProfile({showShortcuts:v});renderSettings()}
function toggleExplanations(v){saveProfile({showExplanations:v});renderSettings()}
function toggleCompactMode(v){saveProfile({compactMode:v});document.body.classList.toggle("compactStudy",v);renderSettings()}

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
      <p class="muted">${h(coachLine())}</p><p class="small muted">Question bank: ${QUESTIONS.length} items • math variants • balanced randomizer avoids repeats.</p>
      <div style="height:14px"></div>
      <div class="miniActions">
        <button class="btn" onclick="recommendedStart()">Start Drill</button>
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
    ${card(`<h3>Suggested Focus</h3><div class="grid3">${weak.map(id=>{const t=topicById(id);return `<div class="recommendation"><span class="pill">${t.icon} ${t.name}</span><p class="muted">${t.focus}</p><button class="btn full" onclick="startTopicDrill('${id}')">Start Drill</button></div>`}).join("")}</div>`)}
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
  const active = state.activeTopic || "numerical";
  const query=(state.topicQuery||"").toLowerCase();
  const filtered=TOPICS.filter(t=>(t.name+" "+t.focus).toLowerCase().includes(query));
  const t=topicById(active);
  const pref=getTopicPref(active);
  const panel=state.libraryPanel||"overview";
  const guideHTML=`${renderStudyNotesBlock(active)}${renderTopicCustomizer(active)}`;
  const body = panel==="overview" ? renderLibraryOverview(active)
    : panel==="guide" ? `${card(`<h3>Study Guide</h3><p class="muted">Read this before drilling. This is the topic's core reviewer.</p>${guideHTML}`)}`
    : panel==="lessons" ? renderLibraryLessons(active)
    : panel==="notes" ? renderLibraryNotes(active)
    : panel==="cards" ? renderLibraryCards(active)
    : renderLibraryOverview(active);

  app.innerHTML=`<div class="libraryMaster">
    <aside class="librarySidebar card">
      <div class="librarySideHeader"><h2>Library</h2><p class="muted">Choose one topic and build your personal reviewer.</p></div>
      <input placeholder="Search topic..." value="${h(state.topicQuery||"")}" oninput="state.topicQuery=this.value;renderLibrary()">
      <div class="topicList libraryTopicList">${filtered.map(topic=>{
        const p=getTopicPref(topic.id), count=topicCount(topic.id), acc=topicAccuracy(topic.id);
        return `<button class="topicBtn ${active===topic.id?'active':''}" onclick="state.activeTopic='${topic.id}';state.noteTopic='${topic.id}';state.libraryPanel='overview';renderLibrary()">
          <div class="topicRow">
            <div class="topicIcon" style="background:${topic.color}">${topic.icon}</div>
            <div>
              <div class="topicName">${topic.name}</div>
              <div class="small muted">${count} questions • ${acc}% accuracy</div>
              <div class="topicBadges">${p.priority==="high"?`<span>High priority</span>`:""}${p.confidence?`<span>${p.confidence}</span>`:""}</div>
            </div>
          </div>
        </button>`}).join("")}</div>
    </aside>
    <main class="libraryMain">
      <section class="libraryHero card">
        <div>
          <span class="pill">${t.icon} ${h(t.name)}</span>
          <h2>${h(t.focus)}</h2>
          <p class="muted">${pref.reminder?`Reminder: ${h(pref.reminder)}`:"Use the tabs below to study, personalize, and drill this topic."}</p>
        </div>
        <div class="libraryHeroActions">
          <button class="btn" onclick="startTopicDrill('${active}')">Start Drill</button>
          <button class="btn secondary" onclick="state.libraryPanel='notes';renderLibrary()">Write Notes</button>
        </div>
      </section>
      <nav class="libraryTabs">
        ${libraryTabButton("overview","Overview")}
        ${libraryTabButton("guide","Guide")}
        ${libraryTabButton("lessons","Lessons")}
        ${libraryTabButton("notes","Notes")}
        ${libraryTabButton("cards","Cards")}
      </nav>
      <section class="libraryPanel">${body}</section>
    </main>
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

function makeDynChoice(correct, wrongs){
  let vals=[String(correct)];
  wrongs.forEach(w=>{ if(!vals.includes(String(w))) vals.push(String(w)); });
  let base=Number(String(correct).replace(/[^0-9.-]/g,""));
  let i=1;
  while(vals.length<4){
    let extra=Number.isFinite(base) ? String(base+i) : `Choice ${i}`;
    if(!vals.includes(extra)) vals.push(extra);
    i++;
  }
  vals=seededShuffle(vals.slice(0,4), Date.now()+Math.floor(Math.random()*9999));
  return {choices:vals, answer:vals.indexOf(String(correct))};
}
function dynMoney(n){
  n=Number(n);
  return "₱"+n.toLocaleString(undefined,{maximumFractionDigits:2});
}
function dynQ(topic, subtopic, q, correct, wrongs, shortcut, explanation){
  const c=makeDynChoice(correct, wrongs);
  const item={id:"dynmath"+Date.now()+Math.floor(Math.random()*100000), kind:"scored", topic, subtopic, difficulty:"medium", q, choices:c.choices, answer:c.answer, shortcut, explanation, modeTags:["math","dynamic","variant"], sourceBank:"dynamicMath"};
  QUESTIONS.push(item);
  return item;
}
function makeMathVariantQuestions(count=30){
  const out=[];
  const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  const pctList=[5,10,12,15,20,25,30,35,40];
  const templates=[
    function(){
      const pct=pctList[rand(0,pctList.length-1)];
      const amount=rand(12,70)*50;
      const ans=amount*pct/100;
      return dynQ("numerical","Dynamic Percent",`${pct}% of ${dynMoney(amount)} is how much?`, dynMoney(ans), [dynMoney(ans+50),dynMoney(Math.max(0,ans-50)),dynMoney(amount-pct)], `${pct}% = ${pct}/100.`, `${amount} × ${pct}/100 = ${ans}.`);
    },
    function(){
      const old=rand(8,40)*50;
      const rate=[10,15,20,25,30,40][rand(0,5)];
      const newer=old*(1+rate/100);
      return dynQ("numerical","Dynamic Percent Change",`A value increased from ${dynMoney(old)} to ${dynMoney(newer)}. What is the percent increase?`, `${rate}%`, [`${rate+5}%`,`${Math.max(1,rate-5)}%`,`${Math.round(newer/old*100)}%`], `Increase ÷ original × 100.`, `Increase is ${newer-old}. ${newer-old} ÷ ${old} × 100 = ${rate}%.`);
    },
    function(){
      const final=rand(8,30)*80;
      const off=[10,20,25,30,40][rand(0,4)];
      const orig=final/(1-off/100);
      return dynQ("numerical","Dynamic Reverse Percent",`After a ${off}% discount, an item costs ${dynMoney(final)}. What was the original price?`, dynMoney(orig), [dynMoney(orig+100),dynMoney(Math.max(0,orig-100)),dynMoney(final*(1+off/100))], `Remaining price is ${100-off}% of original.`, `${final} ÷ ${(100-off)/100} = ${orig}.`);
    },
    function(){
      const total=[60,72,84,96,120,144,180,240][rand(0,7)];
      const a=rand(2,7), b=rand(2,8);
      const ans=total*b/(a+b);
      return dynQ("numerical","Dynamic Ratio",`${total} forms are divided in the ratio ${a}:${b}. How many forms are in the second share?`, String(ans), [String(total*a/(a+b)),String(ans+6),String(Math.max(1,ans-6))], `Total parts = ${a+b}.`, `Second share = ${b}/${a+b} × ${total} = ${ans}.`);
    },
    function(){
      const a=[6,8,10,12,15][rand(0,4)];
      const b=[12,16,18,20,24][rand(0,4)];
      const ans=Number((a*b/(a+b)).toFixed(2));
      return dynQ("numerical","Dynamic Work Rate",`A can finish a job in ${a} days and B in ${b} days. How long together?`, `${ans} days`, [`${Math.min(a,b)} days`,`${Math.round((a+b)/2)} days`,`${ans+2} days`], `Together time = ab ÷ (a+b).`, `${a}×${b} ÷ (${a}+${b}) = ${ans} days.`);
    },
    function(){
      const dist=rand(12,50)*10;
      const s1=rand(3,8)*10;
      const s2=rand(3,8)*10;
      const ans=Number((dist/(s1+s2)).toFixed(2));
      return dynQ("numerical","Dynamic Motion",`Two vehicles are ${dist} km apart and travel toward each other at ${s1} km/h and ${s2} km/h. When will they meet?`, `${ans} hours`, [`${ans+1} hours`,`${Math.max(.5,ans-1)} hours`,`${Number((dist/Math.max(1,Math.abs(s1-s2))).toFixed(2))} hours`], `Toward each other means add speeds.`, `${dist} ÷ (${s1}+${s2}) = ${ans} hours.`);
    },
    function(){
      const x=rand(8,25), diff=rand(3,10), yrs=rand(2,8);
      const total=2*x+diff+2*yrs;
      return dynQ("numerical","Dynamic Age",`Ben is ${diff} years older than Ana. In ${yrs} years, their ages will total ${total}. How old is Ana now?`, String(x), [String(x+diff),String(x+yrs),String(Math.max(1,x-yrs))], `Let Ana=x and Ben=x+${diff}.`, `x+${yrs}+x+${diff}+${yrs}=${total}, so x=${x}.`);
    },
    function(){
      const count=rand(4,6), avg=rand(70,92);
      let known=[]; for(let i=0;i<count-1;i++) known.push(avg+rand(-8,8));
      const miss=count*avg-known.reduce((a,b)=>a+b,0);
      return dynQ("numerical","Dynamic Average",`The average of ${count} scores is ${avg}. Known scores: ${known.join(", ")}. What is the missing score?`, String(miss), [String(miss+3),String(miss-3),String(avg)], `Total = average × count.`, `Needed total=${count*avg}. Known total=${known.reduce((a,b)=>a+b,0)}. Missing=${miss}.`);
    },
    function(){
      const L=rand(8,30), W=rand(5,18);
      const p=2*(L+W);
      return dynQ("numerical","Dynamic Geometry",`A rectangle is ${L} m long and ${W} m wide. What is its perimeter?`, `${p} m`, [`${L*W} m`,`${L+W} m`,`${p+10} m`], `Perimeter=2(L+W).`, `2(${L}+${W})=${p} m.`);
    },
    function(){
      const start=rand(2,12), gap=rand(3,8);
      const seq=[start,start+gap,start+2*gap,start+3*gap,start+4*gap];
      const ans=start+5*gap;
      return dynQ("abstract","Dynamic Sequence",`Find the next number: ${seq.join(", ")}, __`, String(ans), [String(ans+gap),String(ans-gap),String(ans+2)], `Arithmetic sequence with common difference ${gap}.`, `${seq[4]} + ${gap} = ${ans}.`);
    }
  ];
  for(let i=0;i<count;i++) out.push(templates[i%templates.length]());
  return seededShuffle(out, Date.now());
}
function startMathVariantDrill(){
  const pool=makeMathVariantQuestions(30);
  state.quizMode="Math Variant Drill";
  state.quizStarted=true;
  state.quizPool=pool;
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
    <button class="btn secondary" onclick="startMathDrill()">Math Drill</button><button class="btn secondary" onclick="startMathVariantDrill()">Math Variant Drill</button>
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
  ${answered&&!state.quizMode.includes("Full Mock")&&state.quizMode!=="Diagnostic"?`<div class="answerBox ${correct?'good':'bad'}"><h3>${correct?'✅ Correct':'❌ Corrected'}</h3>${!correct?`<p><b>Correct answer:</b> ${String.fromCharCode(65+q.answer)}. ${h(q.choices[q.answer])}</p>`:''}${answerSupportHTML(q)}<div style="height:12px"></div><button class="btn full" onclick="nextQuestion()">${state.quizIndex>=pool.length-1?'Finish':'Next Question'} →</button></div>`:""}
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
  ${state.responses.map((r,i)=>{const q=questionById(r.id), t=topicById(q.topic); if(!q)return ""; return `<div class="reviewItem"><span class="pill">${q.kind==="edq"?"📝 EDQ • Non-scored":`${t.icon} ${t.name} • ${q.subtopic} • ${q.difficulty}`}</span><h3 style="margin-top:10px">${i+1}. ${h(q.q)}</h3>${renderVisual(q)}<p><b>Your answer:</b> ${r.chosen==null?'No answer':String.fromCharCode(65+r.chosen)+'. '+h(q.choices[r.chosen])}</p>${q.kind==="edq"?`<p class="muted">EDQ item — no correct or incorrect answer.</p>`:`<p><b>Correct answer:</b> ${String.fromCharCode(65+q.answer)}. ${h(q.choices[q.answer])}</p>${answerSupportHTML(q)}`}</div>`}).join("")}</div>`;
}
function renderWeak(){
  const weakQs=weakIds().map(questionById).filter(Boolean);
  if(!weakQs.length){app.innerHTML=card(`<h2>🧠 Weak Spot Bank</h2><p class="muted">No weak spots yet. Missed scored questions will appear here.</p><button class="btn" onclick="setTab('practice')">Start Practice</button>`);return}
  app.innerHTML=`<div class="section">${card(`<h2>🧠 Weak Spot Bank</h2><p class="muted">${weakQs.length} saved weak questions.</p><div class="grid2"><button class="btn" onclick="startWeakQuiz()">Practice Weak Spots</button><button class="btn danger" onclick="clearWeak()">Clear Weak Spots</button></div>`)}
  ${weakQs.map((q,i)=>`<div class="reviewItem"><span class="pill">${topicById(q.topic).icon} ${topicById(q.topic).name} • ${q.subtopic}</span><h3 style="margin-top:10px">${i+1}. ${h(q.q)}</h3>${renderVisual(q)}<p><b>Answer:</b> ${String.fromCharCode(65+q.answer)}. ${h(q.choices[q.answer])}</p>${answerSupportHTML(q)}</div>`).join("")}</div>`;
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
  ${card(`<h2>Settings</h2><p class="muted">Personalize the review flow. Saved locally in this browser.</p>`)}
  <div class="settingsGrid">
    <div class="settingBlock"><label>Name</label><input id="setName" value="${h(p.name)}" placeholder="Your name"></div>
    <div class="settingBlock"><label>Exam Type</label><select id="setExamType"><option value="professional" ${p.examType==="professional"?"selected":""}>Professional</option><option value="subprofessional" ${p.examType==="subprofessional"?"selected":""}>SubProfessional</option></select></div>
    <div class="settingBlock"><label>Exam Date</label><input id="setExamDate" type="date" value="${h(p.examDate)}"></div>
    <div class="settingBlock"><label>Target Score (%)</label><input id="setTargetScore" type="number" min="80" max="100" value="${p.targetScore}"></div>
    <div class="settingBlock"><label>Daily Question Goal</label><input id="setDailyGoal" type="number" min="5" max="300" value="${p.dailyGoal}"></div>
    <div class="settingBlock"><label>Daily Study Minutes</label><input id="setStudyMinutes" type="number" min="5" max="300" value="${p.studyMinutes}"></div>
    <div class="settingBlock"><label>Review Style</label><select id="setCoachStyle"><option value="direct" ${p.coachStyle==="direct"?"selected":""}>Straightforward</option><option value="calm" ${p.coachStyle==="calm"?"selected":""}>Calm</option><option value="strict" ${p.coachStyle==="strict"?"selected":""}>Strict</option><option value="motivational" ${p.coachStyle==="motivational"?"selected":""}>Encouraging</option></select></div>
    <div class="settingBlock"><label>Preferred Pace</label><select id="setPreferredPace"><option value="fast" ${p.preferredPace==="fast"?"selected":""}>Fast drills</option><option value="balanced" ${p.preferredPace==="balanced"?"selected":""}>Balanced</option><option value="deep" ${p.preferredPace==="deep"?"selected":""}>Deep review</option></select></div>
    <div class="settingBlock wide"><label>Daily Reminder Text</label><input id="setReminderText" value="${h(p.reminderText)}" placeholder="Example: Math variants first, then RA 6713"></div>
  </div>
  ${card(`<h3>Study Display</h3><div class="settingRow"><span>Show shortcuts after answering</span><button class="btn secondary" onclick="toggleShortcuts(${p.showShortcuts===false?'true':'false'})">${p.showShortcuts===false?"Off":"On"}</button></div><div class="settingRow"><span>Show explanations after answering</span><button class="btn secondary" onclick="toggleExplanations(${p.showExplanations===false?'true':'false'})">${p.showExplanations===false?"Off":"On"}</button></div><div class="settingRow"><span>Compact study spacing</span><button class="btn secondary" onclick="toggleCompactMode(${p.compactMode===true?'false':'true'})">${p.compactMode===true?"On":"Off"}</button></div><p class="small muted">Turn shortcuts or explanations off when you need more room for long questions and paragraph study.</p>`)}
  ${card(`<h3>Weak Topics to Prioritize</h3><div class="checkboxGrid">${TOPICS.map(t=>`<label class="checkItem"><input type="checkbox" class="weakCheck" value="${t.id}" ${p.weakestTopics.includes(t.id)?"checked":""}> <span>${t.icon} ${t.name}</span></label>`).join("")}</div>`)}
  ${card(`<h3>Data Controls</h3><div class="grid3"><button class="btn" onclick="saveSettings()">Save Settings</button><button class="btn secondary" onclick="resetProfileOnly()">Reset Profile</button><button class="btn danger" onclick="resetAllProgress()">Reset All Progress</button></div>`)}
  ${card(`<h3>About</h3>${DEDICATION_FOOTER}`, "dedicationFooter small muted")}
  </div>`;
}
function saveSettings(){
  const weak=[...document.querySelectorAll(".weakCheck:checked")].map(x=>x.value);
  const p=profile();
  saveProfile({
    name:document.getElementById("setName").value.trim(),
    examType:document.getElementById("setExamType").value,
    examDate:document.getElementById("setExamDate").value,
    targetScore:Number(document.getElementById("setTargetScore").value||85),
    dailyGoal:Number(document.getElementById("setDailyGoal").value||30),
    studyMinutes:Number(document.getElementById("setStudyMinutes").value||45),
    coachStyle:document.getElementById("setCoachStyle").value,
    preferredPace:document.getElementById("setPreferredPace").value,
    reminderText:document.getElementById("setReminderText").value.trim(),
    weakestTopics:weak.length?weak:["numerical","verbal"],
    showShortcuts:p.showShortcuts!==false,
    showExplanations:p.showExplanations!==false,
    compactMode:p.compactMode===true,
    topicPrefs:p.topicPrefs||{}
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
window.saveUserNote=saveUserNote;window.saveTopicPref=saveTopicPref;window.toggleShortcuts=toggleShortcuts;window.toggleExplanations=toggleExplanations;window.toggleCompactMode=toggleCompactMode;window.quitActivity=quitActivity;window.startFocusedDrill=startFocusedDrill;window.startMathVariantDrill=startMathVariantDrill;window.startMathDrill=startMathDrill;window.startGrammarDrill=startGrammarDrill;window.startFilipinoDrill=startFilipinoDrill;window.startLawDrill=startLawDrill;window.startLogicDrill=startLogicDrill;window.startClericalDrill=startClericalDrill;window.startReadingDrill=startReadingDrill;window.saveLibraryField=saveLibraryField;window.toggleLibraryCheck=toggleLibraryCheck;window.markTopicReviewed=markTopicReviewed;window.startSubtopicDrill=startSubtopicDrill;window.exportTopicNotes=exportTopicNotes;window.copyTopicNotes=copyTopicNotes;window.setTab=setTab;window.renderLibrary=renderLibrary;window.toggleAllTopics=toggleAllTopics;window.toggleTopic=toggleTopic;window.startPractice=startPractice;window.startFullMock=startFullMock;window.startQuickSprint=startQuickSprint;window.startDiagnostic=startDiagnostic;window.startGraphicDrill=startGraphicDrill;window.startCaseletDrill=startCaseletDrill;window.startSectionDrill=startSectionDrill;window.startTopicDrill=startTopicDrill;window.recommendedStart=recommendedStart;window.chooseAnswer=chooseAnswer;window.nextQuestion=nextQuestion;window.resetQuizState=resetQuizState;window.reviewResults=reviewResults;window.renderFinished=renderFinished;window.startWeakQuiz=startWeakQuiz;window.clearWeak=clearWeak;window.renderFormulas=renderFormulas;window.renderSettings=renderSettings;window.saveSettings=saveSettings;window.resetProfileOnly=resetProfileOnly;window.resetAllProgress=resetAllProgress;window.exportProgress=exportProgress;window.state=state;
const themeBtn=document.getElementById("themeBtn");const savedTheme=localStorage.getItem("theme")||"light";document.documentElement.dataset.theme=savedTheme;if(profile().compactMode===true)document.body.classList.add("compactStudy");themeBtn.textContent=savedTheme==="dark"?"☀️":"🌙";themeBtn.onclick=()=>{const next=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=next;localStorage.setItem("theme",next);themeBtn.textContent=next==="dark"?"☀️":"🌙"};render();
