import { detectPitch, frequencyToNote } from '../bass-fretboard-trainer-v0/pitch.js';

const $ = id => document.getElementById(id);
const ui = Object.fromEntries([
  'homeView','practiceWorkspace','backHomeButton','workspaceTitle','audioControls','diagnosticPanel','deviceSelect','startButton','deviceStatus','stringPicker','fretCount','fretboardTab','theoryTab','fretboardModule','fretboardOptionsSummary','fretboardCoverage','theoryModule','theoryHub','theoryPractice','backTheoryButton','theoryPracticeTitle','wrongBankButton','wrongCount','wrongPracticeDialog','wrongPracticeBody','wrongPracticeRemaining','quizHome','quizCard',
  'round','score','timer','prompt','targetNote','enharmonic','targetOctave','readyButton','feedback','heard','exitWrongButton','pauseButton','nextButton','theoryType','theoryOptionsSummary','theoryCoverage','scaleQualityRow','theoryKeyLabel','scaleKey','theoryStringRow','arpStringRow','triadRow','triadType','scaleTitle','scalePrompt','scaleDirectionText','scaleProgress','scaleFeedback','scaleHeard','sequenceHintControls','resetScaleButton','skipTheoryButton','timeSupportDialog','switchUntimedButton','continueTimedButton','level','confidence','stableFrames'
].map(id => [id,$(id)]));
const SHARPS=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
const FLATS=['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'];
const NATURAL=new Set([0,2,4,5,7,9,11]);
const STRINGS={E:28,A:33,D:38,G:43};
let context,stream,analyser,samples,frame,running=false,paused=false;
let target=null,lastMidi=null,stableCount=0,score=0,round=1,previousKey='';
let armed=false,completed=false,wrongAnswer=false,wrongCountForQuestion=0,releaseFrames=0,advanceTimer=null;
let questionDeck=[],deckSignature='',questionStartedAt=null,responseMs=null;
let waitingForStart=false,timedSessionStarted=false,pausedAfterCompleted=false;
let timedStruggleStreak=0,timeSupportPending=false;
let practiceMode='normal',wrongQueue=[];
let wrongBank=[];
let scrollBeforeWrong=0,wrongViewOpen=false;
let activeModule='fretboard',practiceActive=false,scaleIndex=0,scaleRootMidi=null,scaleSequence=[],scaleArmed=false,scaleLastMidi=null,scaleStable=0,scaleAcceptedMidi=null,scaleAcceptedAt=0,scaleHintRevealed=false;
let scaleExerciseString='A',previousScaleString='',scaleExerciseKey='0',previousScaleKey='';
let scaleAdvanceTimer=null;
const MAJOR_INTERVALS=[0,2,4,5,7,9,11,12];
const MINOR_INTERVALS=[0,2,3,5,7,8,10,12];
const TONICS={
  0:{major:{label:'C',notes:['C','D','E','F','G','A','B','C']},minor:{label:'C',notes:['C','D','E♭','F','G','A♭','B♭','C']}},
  1:{major:{label:'D♭',notes:['D♭','E♭','F','G♭','A♭','B♭','C','D♭']},minor:{label:'C♯',notes:['C♯','D♯','E','F♯','G♯','A','B','C♯']}},
  2:{major:{label:'D',notes:['D','E','F♯','G','A','B','C♯','D']},minor:{label:'D',notes:['D','E','F','G','A','B♭','C','D']}},
  3:{major:{label:'E♭',notes:['E♭','F','G','A♭','B♭','C','D','E♭']},minor:{label:'E♭',notes:['E♭','F','G♭','A♭','B♭','C♭','D♭','E♭']}},
  4:{major:{label:'E',notes:['E','F♯','G♯','A','B','C♯','D♯','E']},minor:{label:'E',notes:['E','F♯','G','A','B','C','D','E']}},
  5:{major:{label:'F',notes:['F','G','A','B♭','C','D','E','F']},minor:{label:'F',notes:['F','G','A♭','B♭','C','D♭','E♭','F']}},
  6:{major:{label:'F♯',notes:['F♯','G♯','A♯','B','C♯','D♯','E♯','F♯']},minor:{label:'F♯',notes:['F♯','G♯','A','B','C♯','D','E','F♯']}},
  7:{major:{label:'G',notes:['G','A','B','C','D','E','F♯','G']},minor:{label:'G',notes:['G','A','B♭','C','D','E♭','F','G']}},
  8:{major:{label:'A♭',notes:['A♭','B♭','C','D♭','E♭','F','G','A♭']},minor:{label:'G♯',notes:['G♯','A♯','B','C♯','D♯','E','F♯','G♯']}},
  9:{major:{label:'A',notes:['A','B','C♯','D','E','F♯','G♯','A']},minor:{label:'A',notes:['A','B','C','D','E','F','G','A']}},
  10:{major:{label:'B♭',notes:['B♭','C','D','E♭','F','G','A','B♭']},minor:{label:'B♭',notes:['B♭','C','D♭','E♭','F','G♭','A♭','B♭']}},
  11:{major:{label:'B',notes:['B','C♯','D♯','E','F♯','G♯','A♯','B']},minor:{label:'B',notes:['B','C♯','D','E','F♯','G','A','B']}}
};
let theoryNames=[],theoryIntervals=[],theoryLabel='',theoryKind='scale',theoryQuality='major',theoryDegree=3;
let previousDegree='',previousTriad='',currentTriadKind='major';
const coverageByConfiguration=new Map();
const theorySessionSettings={
  scale:{scaleQuality:'major',scaleKey:'random',scaleString:'mixed',hintMode:'memory'},
  interval:{scaleKey:'random',hintMode:'memory'},
  triad:{scaleKey:'random',arpString:'mixed',triadType:'major',hintMode:'memory'},
  degree:{scaleQuality:'major',scaleKey:'random',hintMode:'memory'}
};

const selected = name => document.querySelector(`input[name="${name}"]:checked`).value;
const choose = (name,value) => {const input=document.querySelector(`input[name="${name}"][value="${value}"]`);if(input)input.checked=true;};
const noteData = midi => ({midi,pc:(midi%12+12)%12,sharp:SHARPS[(midi%12+12)%12],flat:FLATS[(midi%12+12)%12],octave:Math.floor(midi/12)-1});
const questionKey = item => `${item.string}-${item.exact?item.midi:item.pc}`;
const wrongKey = item => `${item.string}|${item.exact?'exact':'ignore'}|${item.exact?item.midi:item.pc}`;
const theoryQuestionKey = item => item.kind?`${item.key}|${item.string}|${item.kind}`:item.degree?`${item.key}|${item.degree}`:`${item.key}|${item.string}`;

function uniqueBy(items,keyFor){const seen=new Set();return items.filter(item=>{const key=keyFor(item);if(seen.has(key))return false;seen.add(key);return true;});}
function coverageState(configurationKey,candidates,keyFor){
  const unique=uniqueBy(candidates,keyFor),validIds=new Set(unique.map(keyFor));let state=coverageByConfiguration.get(configurationKey);
  if(!state){state={seen:new Set()};coverageByConfiguration.set(configurationKey,state);}
  for(const id of [...state.seen])if(!validIds.has(id))state.seen.delete(id);
  return {state,unique,unseen:unique.filter(item=>!state.seen.has(keyFor(item)))};
}
function coverageText(seen,total){return `覆盖 ${seen} / ${total}${total>0&&seen===total?' ✓':''}`;}

function fretboardConfigurationKey(){
  const stringMode=selected('stringMode');return JSON.stringify(['fretboard',stringMode,stringMode==='single'?selected('bassString'):'all',selected('noteSet'),selected('octaveMode'),ui.fretCount.value]);
}
function fretboardCoverageContext(){return coverageState(fretboardConfigurationKey(),buildCandidates(),questionKey);}
function updateFretboardCoverage(){const {state,unique}=fretboardCoverageContext();ui.fretboardCoverage.textContent=coverageText(state.seen.size,unique.length);}
function markFretboardCovered(){if(practiceMode!=='normal'||!target)return;const {state}=fretboardCoverageContext();state.seen.add(questionKey(target));updateFretboardCoverage();}

function theoryConfigurationKey(type=ui.theoryType.value){
  const parts=['theory',type,ui.fretCount.value,ui.scaleKey.value];
  if(type==='scale')parts.push(selected('scaleQuality'),selected('scaleString'));
  else if(type==='degree')parts.push(selected('scaleQuality'));
  else if(type==='triad')parts.push(selected('arpString'),ui.triadType.value);
  return JSON.stringify(parts);
}
function buildTheoryCoverageCandidates(type=ui.theoryType.value){
  const keyOptions=ui.scaleKey.value==='random'?Object.keys(TONICS):[ui.scaleKey.value];
  if(type==='degree')return keyOptions.flatMap(key=>canCompleteFromString(key,'E',0)?['2','3','4','5','6','7'].map(degree=>({key,string:'E',degree})):[]);
  const stringMode=type==='scale'?selected('scaleString'):type==='triad'?selected('arpString'):'E';
  const stringOptions=stringMode==='mixed'?(type==='triad'?['E','A']:Object.keys(STRINGS)):[stringMode],maxSpan=type==='scale'?12:24;
  const pairs=[];for(const key of keyOptions)for(const string of stringOptions)if(canCompleteFromString(key,string,maxSpan))pairs.push({key,string});
  if(type!=='triad')return pairs;
  const kinds=ui.triadType.value==='random'?['major','minor']:[ui.triadType.value];return pairs.flatMap(pair=>kinds.map(kind=>({...pair,kind})));
}
function theoryCoverageContext(type=ui.theoryType.value){return coverageState(theoryConfigurationKey(type),buildTheoryCoverageCandidates(type),theoryQuestionKey);}
function updateTheoryCoverage(){const {state,unique}=theoryCoverageContext();ui.theoryCoverage.textContent=coverageText(state.seen.size,unique.length);}
function markTheoryCovered(){
  const current={key:scaleExerciseKey,string:scaleExerciseString};if(theoryKind==='degree')current.degree=String(theoryDegree);if(theoryKind==='triad')current.kind=currentTriadKind;
  const {state}=theoryCoverageContext(theoryKind);state.seen.add(theoryQuestionKey(current));updateTheoryCoverage();
}

function shuffle(items){
  const result=[...items];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}

function buildCandidates(){
  const strings=selected('stringMode')==='single'?[selected('bassString')]:Object.keys(STRINGS);
  const naturalsOnly=selected('noteSet')==='natural',exact=selected('octaveMode')==='exact';
  const candidates=[],seen=new Set(),fretCount=Number(ui.fretCount.value);
  for(const string of strings)for(let fret=0;fret<=fretCount;fret++){
    const midi=STRINGS[string]+fret,pc=midi%12,key=exact?`${string}-${midi}`:`${string}-${pc}`;
    if((!naturalsOnly||NATURAL.has(pc))&&!seen.has(key)){seen.add(key);candidates.push({string,fret,exact,...noteData(midi)});}
  }
  return candidates;
}

function buildAdaptiveDeck(candidates){
  let history=[];
  try{history=JSON.parse(localStorage.getItem('bassTrainerAttempts')||'[]');if(!Array.isArray(history))history=[];}catch{}
  const candidateMap=new Map(candidates.map(item=>[wrongKey(item),item])),grouped=new Map();
  for(const attempt of history){
    const exact=attempt.octaveMode==='exact';
    const key=`${attempt.string}|${exact?'exact':'ignore'}|${exact?attempt.targetMidi:attempt.targetPitchClass}`;
    if(!candidateMap.has(key))continue;if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(attempt);
  }
  const weak=[];
  for(const [key,attempts] of grouped){
    const recent=attempts.slice(-5),lastThree=attempts.slice(-3);
    const recovered=lastThree.length===3&&lastThree.every(item=>item.result==='correct'&&item.cleanCorrect!==false);
    const failures=recent.filter(item=>item.result==='wrong'||item.result==='timeout').length;
    const lastTwoFailed=attempts.length>=2&&attempts.slice(-2).every(item=>item.result==='wrong'||item.result==='timeout');
    if(!recovered&&(failures>=2||lastTwoFailed))weak.push({item:candidateMap.get(key),priority:failures+(lastTwoFailed?2:0)});
  }
  weak.sort((a,b)=>b.priority-a.priority);
  const extras=weak.slice(0,Math.floor(candidates.length*.3)).map(entry=>({...entry.item,adaptiveReview:true}));
  const deck=shuffle([...candidates,...extras]);
  for(let i=1;i<deck.length;i++)if(questionKey(deck[i])===questionKey(deck[i-1])){
    const swap=deck.findIndex((item,index)=>index>i&&questionKey(item)!==questionKey(deck[i]));
    if(swap>i)[deck[i],deck[swap]]=[deck[swap],deck[i]];
  }
  return deck;
}

function drawQuestion(){
  if(practiceMode==='wrong'){
    if(!wrongQueue.length)wrongQueue=shuffle(wrongBank.map(item=>({...item})));
    return wrongQueue.pop();
  }
  const coverage=fretboardCoverageContext();if(coverage.unseen.length)return randomChoice(coverage.unseen);
  const signature=[selected('stringMode'),selected('bassString'),selected('noteSet'),selected('octaveMode'),ui.fretCount.value].join('|');
  if(signature!==deckSignature||!questionDeck.length){deckSignature=signature;questionDeck=buildAdaptiveDeck(buildCandidates());}
  if(questionDeck.length>1&&questionKey(questionDeck.at(-1))===previousKey)[questionDeck[questionDeck.length-1],questionDeck[questionDeck.length-2]]=[questionDeck[questionDeck.length-2],questionDeck[questionDeck.length-1]];
  return questionDeck.pop();
}

function newQuestion(){
  clearTimeout(advanceTimer);advanceTimer=null;
  const next=drawQuestion();if(!next)return;
  target=next;previousKey=questionKey(next);lastMidi=null;stableCount=0;completed=false;armed=false;wrongAnswer=false;wrongCountForQuestion=0;releaseFrames=0;
  ui.prompt.textContent=`请在 ${target.string} 弦上弹出`;
  ui.targetNote.innerHTML=target.exact?`${target.sharp}<span class="octave-number">${target.octave}</span>`:target.sharp;
  ui.enharmonic.textContent=target.flat!==target.sharp?`也可写作 ${target.flat}${target.exact?target.octave:''}`:'';
  ui.targetOctave.textContent=target.exact?'音名与八度都需要一致':'任意八度均可';
  ui.feedback.textContent='准备好后弹奏';ui.feedback.className='feedback waiting';ui.heard.textContent='';ui.stableFrames.textContent='0 / 4';ui.nextButton.disabled=false;
  const timed=practiceMode==='normal'&&selected('timeLimit')!=='0',needsStart=timed&&!timedSessionStarted;waitingForStart=needsStart;ui.readyButton.hidden=!needsStart;
  for(const element of [ui.prompt,ui.targetNote,ui.enharmonic,ui.targetOctave])element.classList.toggle('question-concealed',needsStart);
  if(needsStart)ui.feedback.textContent='准备好后点击开始';
  ui.timer.textContent=needsStart?'未开始':timed?`${selected('timeLimit')} 秒`:'不限时';ui.timer.classList.remove('urgent');questionStartedAt=null;responseMs=null;
}

function startTimedQuestion(){
  if(!running||paused||!waitingForStart)return;
  waitingForStart=false;timedSessionStarted=true;ui.readyButton.hidden=true;
  for(const element of [ui.prompt,ui.targetNote,ui.enharmonic,ui.targetOctave])element.classList.remove('question-concealed');
  ui.feedback.textContent='请弹奏';ui.feedback.className='feedback listening';ui.timer.textContent=`${selected('timeLimit')} 秒`;releaseFrames=0;
}

function armQuestion(){armed=true;questionStartedAt=performance.now();responseMs=null;}

function renderScaleProgress(){
  const guided=selected('hintMode')==='guided';ui.scaleProgress.innerHTML='';
  ui.scaleProgress.classList.toggle('round-trip',theoryNames.length>8);
  ui.scaleProgress.classList.toggle('short-sequence',theoryNames.length<=3);
  ui.scaleProgress.style.gridTemplateColumns=theoryNames.length>8?'':`repeat(${theoryNames.length},minmax(0,70px))`;
  theoryNames.forEach((name,index)=>{const revealed=guided||index<scaleIndex||(scaleHintRevealed&&index===scaleIndex);const step=document.createElement('div');step.className=`scale-step${index<scaleIndex?' done':index===scaleIndex?' current':''}${!revealed?' concealed':''}${scaleHintRevealed&&index===scaleIndex?' hint':''}`;if(!revealed)step.textContent='•';else{step.textContent=name;if(theoryKind!=='degree'&&scaleSequence[index]!==undefined){const octave=document.createElement('span');octave.className='progress-octave';octave.textContent=noteData(scaleSequence[index]).octave;step.append(octave);}}ui.scaleProgress.append(step);});
}

function randomChoice(values,previous=''){const options=values.filter(value=>value!==previous);return options[Math.floor(Math.random()*options.length)];}
function canCompleteFromString(key,string,maxSpan){
  const frets=Number(ui.fretCount.value),highest=STRINGS.G+frets;
  for(let fret=0;fret<=frets;fret++){const midi=STRINGS[string]+fret;if(midi%12===Number(key)&&midi+maxSpan<=highest)return true;}
  return false;
}
function updateTheorySettings(){
  const type=ui.theoryType.value,isScale=type==='scale',isDegree=type==='degree';
  ui.scaleQualityRow.hidden=!(isScale||isDegree);ui.theoryStringRow.hidden=!isScale;ui.arpStringRow.hidden=type!=='triad';ui.triadRow.hidden=type!=='triad';ui.sequenceHintControls.hidden=false;
  ui.theoryKeyLabel.textContent=isScale||isDegree?'调':'根音';
}

function captureTheorySettings(type=ui.theoryType.value){
  const state=theorySessionSettings[type];if(!state)return;
  state.scaleKey=ui.scaleKey.value;
  if(type==='scale'){state.scaleQuality=selected('scaleQuality');state.scaleString=selected('scaleString');state.hintMode=selected('hintMode');}
  else if(type==='interval')state.hintMode=selected('hintMode');
  else if(type==='triad'){state.arpString=selected('arpString');state.triadType=ui.triadType.value;state.hintMode=selected('hintMode');}
  else{state.scaleQuality=selected('scaleQuality');state.hintMode=selected('hintMode');}
}

function applyTheorySettings(type){
  const state=theorySessionSettings[type];ui.scaleKey.value=state.scaleKey;
  if(state.scaleQuality)choose('scaleQuality',state.scaleQuality);if(state.scaleString)choose('scaleString',state.scaleString);if(state.arpString)choose('arpString',state.arpString);if(state.hintMode)choose('hintMode',state.hintMode);if(state.triadType)ui.triadType.value=state.triadType;
}

function resetScale(keepExercise=false){
  clearTimeout(scaleAdvanceTimer);scaleAdvanceTimer=null;
  scaleIndex=0;scaleRootMidi=null;scaleSequence=[];scaleArmed=false;scaleLastMidi=null;scaleStable=0;scaleAcceptedMidi=null;scaleAcceptedAt=0;scaleHintRevealed=false;releaseFrames=0;
  updateTheorySettings();theoryKind=ui.theoryType.value;theoryQuality=selected('scaleQuality');
  const keyMode=ui.scaleKey.value,stringMode=theoryKind==='scale'?selected('scaleString'):theoryKind==='triad'?selected('arpString'):'E',coverage=theoryCoverageContext(theoryKind),coveragePick=!keepExercise&&coverage.unseen.length?randomChoice(coverage.unseen):null,keyOptions=keepExercise?[scaleExerciseKey]:coveragePick?[coveragePick.key]:keyMode==='random'?Object.keys(TONICS):[keyMode],stringOptions=keepExercise?[scaleExerciseString]:coveragePick?[coveragePick.string]:stringMode==='mixed'?(theoryKind==='triad'?['E','A']:Object.keys(STRINGS)):[stringMode],maxSpan=theoryKind==='scale'?12:theoryKind==='degree'?0:24;
  let pairs=[];for(const key of keyOptions)for(const string of stringOptions)if(canCompleteFromString(key,string,maxSpan))pairs.push({key,string});
  if((keyMode==='random'||stringMode==='mixed')&&pairs.length){const fresh=keyMode==='random'?pairs.filter(pair=>pair.key!==previousScaleKey):pairs.filter(pair=>pair.string!==previousScaleString);const pair=randomChoice(fresh.length?fresh:pairs);scaleExerciseKey=pair.key;scaleExerciseString=pair.string;}
  else{scaleExerciseKey=keyMode==='random'?randomChoice(keyOptions,previousScaleKey):keyMode;scaleExerciseString=stringMode==='mixed'?randomChoice(stringOptions,previousScaleString):stringMode;}
  previousScaleKey=scaleExerciseKey;previousScaleString=scaleExerciseString;
  let tonic=TONICS[scaleExerciseKey][theoryQuality];
  if(theoryKind==='scale'){
    const base=theoryQuality==='major'?MAJOR_INTERVALS:MINOR_INTERVALS;theoryIntervals=[...base,...base.slice(1,-1).reverse(),0];theoryNames=[...tonic.notes,...tonic.notes.slice(0,-1).reverse()];theoryLabel=`${tonic.label} ${theoryQuality==='major'?'大调':'自然小调'}`;ui.scalePrompt.textContent=`从 ${scaleExerciseString} 弦上的 ${tonic.label} 开始`;ui.scaleDirectionText.textContent='上行一个八度，再下行返回';
  }else if(theoryKind==='degree'){
    theoryDegree=keepExercise?theoryDegree:coveragePick?Number(coveragePick.degree):Number(randomChoice(['2','3','4','5','6','7'],previousDegree));previousDegree=String(theoryDegree);const base=theoryQuality==='major'?MAJOR_INTERVALS:MINOR_INTERVALS;theoryIntervals=[base[theoryDegree-1]];theoryNames=[tonic.notes[theoryDegree-1]];theoryLabel=`${tonic.label} ${theoryQuality==='major'?'大调':'自然小调'}的第 ${theoryDegree} 音`;ui.scalePrompt.textContent='请在任意位置弹出';ui.scaleDirectionText.textContent='只判断音名，不限制八度';scaleSequence=[(Number(scaleExerciseKey)+theoryIntervals[0])%12];
  }else if(theoryKind==='interval'){
    tonic=TONICS[scaleExerciseKey].major;theoryIntervals=[0,7,12,19,24];theoryNames=[tonic.notes[0],tonic.notes[4],tonic.notes[7],tonic.notes[4],tonic.notes[7]];theoryLabel=`${tonic.label} 根音—五度音型`;ui.scalePrompt.textContent=`从 E 弦上的 ${tonic.label} 开始`;ui.scaleDirectionText.textContent='跨四弦上行两个八度';
  }else{
    const kind=keepExercise?currentTriadKind:coveragePick?coveragePick.kind:ui.triadType.value==='random'?randomChoice(['major','minor'],previousTriad):ui.triadType.value;currentTriadKind=kind;previousTriad=kind;tonic=TONICS[scaleExerciseKey][kind];theoryIntervals=kind==='major'?[0,4,7,12,16,19,24]:[0,3,7,12,15,19,24];theoryNames=[tonic.notes[0],tonic.notes[2],tonic.notes[4],tonic.notes[7],tonic.notes[2],tonic.notes[4],tonic.notes[7]];theoryLabel=`${tonic.label} ${kind==='major'?'大':'小'}三和弦琶音`;ui.scalePrompt.textContent=`从 ${scaleExerciseString} 弦上的 ${tonic.label} 开始`;ui.scaleDirectionText.textContent='连续上行两个八度';
  }
  updateTheoryCoverage();
  const hintLabel=selected('hintMode')==='guided'?'提示':'不提示',keyLabel=keyMode==='random'?'随机调/根音':tonic.label;
  if(theoryKind==='scale')ui.theoryOptionsSummary.textContent=`${theoryQuality==='major'?'大调':'自然小调'} · ${keyLabel} · ${stringMode==='mixed'?'随机弦':stringMode+' 弦'} · ${hintLabel}`;
  else if(theoryKind==='degree')ui.theoryOptionsSummary.textContent=`${theoryQuality==='major'?'大调':'自然小调'} · ${keyLabel} · 随机级数 · ${hintLabel}`;
  else if(theoryKind==='interval')ui.theoryOptionsSummary.textContent=`${keyLabel} · E 弦 · ${hintLabel}`;
  else ui.theoryOptionsSummary.textContent=`${ui.triadType.value==='random'?'随机大小和弦':ui.triadType.value==='major'?'大三和弦':'小三和弦'} · ${keyLabel} · ${stringMode==='mixed'?'随机 E/A 弦':stringMode+' 弦'} · ${hintLabel}`;
  ui.scaleTitle.textContent=theoryLabel;ui.scaleFeedback.textContent=running?(theoryKind==='degree'?'请弹奏目标音':`请先弹根音 ${theoryNames[0]}`):'启用音频后开始';ui.scaleFeedback.className='feedback waiting';ui.scaleHeard.textContent='';renderScaleProgress();
}

function handleScalePitch(midi){
  if(scaleIndex>=theoryNames.length)return;
  if(!scaleArmed){if(midi===scaleAcceptedMidi||performance.now()-scaleAcceptedAt<100)return;scaleArmed=true;scaleLastMidi=null;scaleStable=0;}
  if(midi===scaleLastMidi)scaleStable++;else{scaleLastMidi=midi;scaleStable=1;}if(scaleStable<4)return;
  markTheoryCovered();
  scaleArmed=false;scaleStable=0;scaleAcceptedMidi=midi;scaleAcceptedAt=performance.now();releaseFrames=0;const heard=noteData(midi),startString=scaleExerciseString,fret=midi-STRINGS[startString],highestMidi=STRINGS.G+Number(ui.fretCount.value);
  if(theoryKind==='degree'){
    if(heard.pc!==scaleSequence[0]){ui.scaleFeedback.textContent=`再试一次 · 你弹了 ${heard.sharp}${heard.octave}`;ui.scaleFeedback.className='feedback wrong';return;}
    scaleIndex=1;ui.scaleFeedback.textContent='正确';ui.scaleFeedback.className='feedback correct';ui.scaleHeard.textContent=`${theoryNames[0]} · 你弹了 ${heard.sharp}${heard.octave}`;renderScaleProgress();return;
  }
  if(scaleIndex===0){
    if(heard.pc!==Number(scaleExerciseKey)){ui.scaleFeedback.textContent=`请先弹 ${theoryNames[0]} · 你弹了 ${heard.sharp}${heard.octave}`;ui.scaleFeedback.className='feedback wrong';return;}
    if(fret<0||fret>Number(ui.fretCount.value)){ui.scaleFeedback.textContent=`这个 ${theoryNames[0]} 不在 ${startString} 弦的可用范围内`;ui.scaleFeedback.className='feedback wrong';return;}
    if(midi+Math.max(...theoryIntervals)>highestMidi){ui.scaleFeedback.textContent='这个起点过高，无法完成本题，请换一个低八度的起点';ui.scaleFeedback.className='feedback wrong';return;}
    scaleRootMidi=midi;scaleSequence=theoryIntervals.map(interval=>midi+interval);scaleIndex=1;scaleHintRevealed=false;ui.scaleFeedback.textContent=`已锁定 ${theoryNames[0]}${heard.octave}`;ui.scaleFeedback.className='feedback correct';renderScaleProgress();return;
  }
  const expected=scaleSequence[scaleIndex];
  if(midi!==expected){const wanted=noteData(expected);ui.scaleFeedback.textContent=selected('hintMode')==='memory'?`这个音不对 · 你弹了 ${heard.sharp}${heard.octave}`:`目标 ${theoryNames[scaleIndex]}${wanted.octave} · 你弹了 ${heard.sharp}${heard.octave}`;ui.scaleFeedback.className='feedback wrong';return;}
  scaleIndex++;scaleHintRevealed=false;renderScaleProgress();
  if(scaleIndex===scaleSequence.length){ui.scaleFeedback.textContent=`完成 ${theoryLabel}`;ui.scaleFeedback.className='feedback correct';ui.scaleHeard.textContent=theoryNames.join(' → ');}
  else{const next=noteData(scaleSequence[scaleIndex]);ui.scaleFeedback.textContent=selected('hintMode')==='memory'?'正确 · 继续':`正确 · 下一音 ${theoryNames[scaleIndex]}${next.octave}`;ui.scaleFeedback.className='feedback correct';}
}

function handleScaleSilence(){
  releaseFrames++;if(releaseFrames<12)return;scaleLastMidi=null;scaleStable=0;scaleAcceptedMidi=null;
  if(scaleSequence.length&&scaleIndex>=scaleSequence.length){
    if(!scaleAdvanceTimer)scaleAdvanceTimer=setTimeout(()=>{scaleAdvanceTimer=null;if(activeModule==='theory'&&running)resetScale();},500);
    return;
  }
  scaleArmed=true;
}

function switchModule(module){
  if(wrongViewOpen)exitWrongPractice();activeModule=module;practiceActive=module==='fretboard';document.body.classList.add('in-practice');ui.homeView.hidden=true;ui.practiceWorkspace.hidden=false;ui.audioControls.classList.add('compact');paused=false;ui.pauseButton.textContent='暂停练习';ui.fretboardModule.hidden=module!=='fretboard';ui.theoryModule.hidden=module!=='theory';ui.workspaceTitle.textContent=module==='fretboard'?'指板练习':'乐理练习';armed=false;scaleArmed=false;releaseFrames=0;clearTimeout(advanceTimer);advanceTimer=null;
  if(module==='theory'){ui.theoryHub.hidden=false;ui.theoryPractice.hidden=true;}else if(running)newQuestion();
}

function showHome(){if(!ui.theoryPractice.hidden)captureTheorySettings();practiceActive=false;armed=false;scaleArmed=false;clearTimeout(advanceTimer);clearTimeout(scaleAdvanceTimer);advanceTimer=scaleAdvanceTimer=null;document.body.classList.remove('in-practice');ui.practiceWorkspace.hidden=true;ui.homeView.hidden=false;ui.audioControls.classList.remove('compact');}
function openTheoryPractice(type){
  if(!ui.theoryPractice.hidden)captureTheorySettings();practiceActive=true;ui.theoryType.value=type;applyTheorySettings(type);ui.theoryHub.hidden=true;ui.theoryPractice.hidden=false;ui.theoryPracticeTitle.textContent={scale:'音阶',interval:'五度音型',triad:'三和弦琶音',degree:'调内级数'}[type];resetScale();
}
function showTheoryHub(){captureTheorySettings();practiceActive=false;armed=false;scaleArmed=false;clearTimeout(scaleAdvanceTimer);scaleAdvanceTimer=null;ui.theoryPractice.hidden=true;ui.theoryHub.hidden=false;}

function recordAttempt(result,heardMidi=null){
  const attempt={at:new Date().toISOString(),result,cleanCorrect:result==='correct'&&wrongCountForQuestion===0,responseMs:responseMs===null?null:Math.round(responseMs),string:target.string,targetMidi:target.midi,targetPitchClass:target.pc,heardMidi,octaveMode:target.exact?'exact':'ignore',noteSet:selected('noteSet'),stringMode:selected('stringMode'),timeLimit:practiceMode==='wrong'?0:Number(selected('timeLimit'))};
  try{const history=JSON.parse(localStorage.getItem('bassTrainerAttempts')||'[]');history.push(attempt);if(history.length>2000)history.splice(0,history.length-2000);localStorage.setItem('bassTrainerAttempts',JSON.stringify(history));}catch{}
}

function saveWrongBank(){try{localStorage.setItem('bassTrainerWrongBank',JSON.stringify(wrongBank));}catch{}updateWrongCount();}
function updateWrongCount(){ui.wrongCount.textContent=wrongBank.length;ui.wrongPracticeRemaining.textContent=`剩余 ${wrongBank.length} 题`;ui.wrongBankButton.disabled=!wrongBank.length||practiceMode==='wrong';}
function addWrong(item){if(wrongBank.some(saved=>wrongKey(saved)===wrongKey(item)))return;wrongBank.push({string:item.string,fret:item.fret,exact:item.exact,...noteData(item.midi)});saveWrongBank();}
function removeWrong(item){wrongBank=wrongBank.filter(saved=>wrongKey(saved)!==wrongKey(item));wrongQueue=wrongQueue.filter(saved=>wrongKey(saved)!==wrongKey(item));saveWrongBank();}
function updateTimer(){
  const limit=practiceMode==='wrong'?0:Number(selected('timeLimit'));if(!limit||!armed||questionStartedAt===null)return;
  const remaining=limit-(performance.now()-questionStartedAt)/1000;ui.timer.textContent=`${Math.max(0,Math.ceil(remaining))} 秒`;ui.timer.classList.toggle('urgent',remaining<=1.5);
  if(remaining<=0){armed=false;completed=true;responseMs=null;recordAttempt('timeout');ui.feedback.textContent='超时';ui.feedback.className='feedback wrong';ui.heard.textContent='下一题准备中';if(!registerTimedOutcome(true)){releaseFrames=12;handleSilence();}}
}

function registerTimedOutcome(struggled){
  if(practiceMode!=='normal'||selected('timeLimit')==='0')return false;
  timedStruggleStreak=struggled?timedStruggleStreak+1:0;
  if(timedStruggleStreak<5)return false;
  timeSupportPending=true;armed=false;clearTimeout(advanceTimer);advanceTimer=null;ui.timeSupportDialog.showModal();return true;
}

function resolveTimedSupport(switchToUntimed){
  if(!timeSupportPending)return;
  if(switchToUntimed){const option=document.querySelector('input[name="timeLimit"][value="0"]');option.checked=true;timedSessionStarted=true;saveSettings();}
  timedStruggleStreak=0;timeSupportPending=false;ui.timeSupportDialog.close();round++;ui.round.textContent=round;newQuestion();
}

async function listDevices(selectedId){
  const devices=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='audioinput');ui.deviceSelect.innerHTML='';
  devices.forEach((device,index)=>{const option=document.createElement('option');option.value=device.deviceId;option.textContent=device.label||`音频输入 ${index+1}`;option.selected=device.deviceId===selectedId;ui.deviceSelect.append(option);});ui.deviceSelect.disabled=!devices.length;
}

async function start(preferredId=ui.deviceSelect.value){
  stop(false);ui.startButton.disabled=true;ui.deviceStatus.innerHTML='<span class="dot"></span>正在连接…';
  try{
    const audio={echoCancellation:false,noiseSuppression:false,autoGainControl:false,channelCount:1};if(preferredId)audio.deviceId={exact:preferredId};
    try{stream=await navigator.mediaDevices.getUserMedia({audio,video:false});}catch(error){if(!preferredId||!['OverconstrainedError','NotFoundError'].includes(error.name))throw error;delete audio.deviceId;stream=await navigator.mediaDevices.getUserMedia({audio,video:false});}
    context=new AudioContext({latencyHint:'interactive'});await context.resume();analyser=context.createAnalyser();analyser.fftSize=8192;analyser.smoothingTimeConstant=0;samples=new Float32Array(analyser.fftSize);context.createMediaStreamSource(stream).connect(analyser);
    const settings=stream.getAudioTracks()[0].getSettings();await listDevices(settings.deviceId);running=true;ui.startButton.disabled=false;ui.startButton.textContent='断开音频';ui.startButton.classList.add('stop');ui.deviceStatus.classList.add('active');ui.deviceStatus.innerHTML='<span class="dot"></span>已连接：'+(stream.getAudioTracks()[0].label||'当前设备');
    paused=false;timedSessionStarted=false;score=0;round=1;ui.score.textContent='0';ui.round.textContent='1';ui.pauseButton.disabled=false;ui.pauseButton.textContent='暂停练习';if(practiceActive){if(activeModule==='theory')resetScale();else newQuestion();}tick();
  }catch(error){ui.startButton.disabled=false;ui.deviceStatus.classList.remove('active');const messages={NotAllowedError:'未获得麦克风权限',NotFoundError:'没有找到音频输入设备',NotReadableError:'设备正被其他程序占用'};ui.deviceStatus.innerHTML='<span class="dot"></span>'+(messages[error.name]||`连接失败：${error.message||error.name}`);}
}

function stop(reset=true){
  running=false;paused=false;waitingForStart=false;timedSessionStarted=false;timeSupportPending=false;timedStruggleStreak=0;if(ui.timeSupportDialog.open)ui.timeSupportDialog.close();cancelAnimationFrame(frame);clearTimeout(advanceTimer);stream?.getTracks().forEach(t=>t.stop());context?.close();stream=context=analyser=null;
  if(reset){practiceMode='normal';closeWrongPracticeView();ui.startButton.textContent='启用音频';ui.startButton.classList.remove('stop');ui.deviceStatus.classList.remove('active');ui.deviceStatus.innerHTML='<span class="dot"></span>已断开';ui.feedback.textContent='等待启用音频';ui.feedback.className='feedback waiting';ui.readyButton.hidden=true;ui.pauseButton.disabled=true;ui.pauseButton.textContent='暂停练习';ui.nextButton.disabled=true;if(activeModule==='theory')resetScale();}
}

function togglePause(){
  if(!running)return;
  if(!paused){paused=true;pausedAfterCompleted=completed;armed=false;clearTimeout(advanceTimer);advanceTimer=null;ui.feedback.textContent='已暂停';ui.feedback.className='feedback waiting';ui.heard.textContent='';ui.timer.textContent='暂停';ui.timer.classList.remove('urgent');ui.pauseButton.textContent='继续练习';ui.nextButton.disabled=true;}
  else{paused=false;if(pausedAfterCompleted){round++;ui.round.textContent=round;}ui.pauseButton.textContent='暂停练习';newQuestion();}
}

function normalizeMidiForTargetString(midi){
  if(!target)return midi;const lowest=STRINGS[target.string],highest=lowest+Number(ui.fretCount.value);while(midi<lowest&&midi+12<=highest)midi+=12;return midi;
}

function judge(midi){
  if(!armed||completed)return;midi=normalizeMidiForTargetString(midi);const heard=noteData(midi);
  if(midi===lastMidi)stableCount++;else{lastMidi=midi;stableCount=1;}ui.stableFrames.textContent=`${Math.min(stableCount,4)} / 4`;if(stableCount<4)return;
  markFretboardCovered();
  const correct=target.exact?midi===target.midi:heard.pc===target.pc;armed=false;stableCount=0;releaseFrames=0;
  if(correct){const struggled=wrongCountForQuestion>0;completed=true;wrongAnswer=false;recordAttempt('correct',midi);if(practiceMode==='wrong'&&wrongCountForQuestion===0)removeWrong(target);score++;ui.score.textContent=score;ui.feedback.textContent=`正确 · ${heard.sharp}${heard.octave}`;ui.feedback.className='feedback correct';ui.heard.textContent=practiceMode==='wrong'&&wrongCountForQuestion>0?'本题继续保留在错题库':'';registerTimedOutcome(struggled);}
  else{wrongAnswer=true;wrongCountForQuestion++;recordAttempt('wrong',midi);if(wrongCountForQuestion>=2)addWrong(target);ui.feedback.textContent=`再试一次 · 你弹了 ${heard.sharp}${heard.octave}`;ui.feedback.className='feedback wrong';ui.heard.textContent='请再次弹奏';}
}

function handleSilence(){
  if(timeSupportPending)return;
  releaseFrames++;if(releaseFrames<12)return;lastMidi=null;stableCount=0;ui.stableFrames.textContent='0 / 4';
  if(completed&&!advanceTimer){advanceTimer=setTimeout(()=>{advanceTimer=null;if(!running)return;if(practiceMode==='wrong'&&!wrongBank.length){practiceMode='normal';paused=false;pausedAfterCompleted=false;closeWrongPracticeView();updateWrongCount();score=0;round=1;ui.score.textContent='0';ui.round.textContent='1';questionDeck=[];timedSessionStarted=true;newQuestion();return;}round++;ui.round.textContent=round;newQuestion();},700);}
  else if(!completed&&!armed&&!waitingForStart){armQuestion();if(wrongAnswer)ui.heard.textContent='请再次弹奏';}
}

function tick(){
  if(!running)return;if(paused||!practiceActive){frame=requestAnimationFrame(tick);return;}analyser.getFloatTimeDomainData(samples);const found=detectPitch(samples,context.sampleRate);const db=found.rms?20*Math.log10(found.rms):-Infinity;
  ui.level.textContent=Number.isFinite(db)?`${db.toFixed(1)} dB`:'— dB';ui.confidence.textContent=found.frequency?`${Math.round(found.confidence*100)}%`:'—';
  if(found.frequency&&found.confidence>=.72){releaseFrames=0;const midi=frequencyToNote(found.frequency).midi;if(activeModule==='theory')handleScalePitch(midi);else{if(armed&&responseMs===null)responseMs=performance.now()-questionStartedAt;judge(midi);}}else if(db < -44){if(activeModule==='theory')handleScaleSilence();else handleSilence();}if(activeModule==='fretboard')updateTimer();frame=requestAnimationFrame(tick);
}

function openWrongPracticeView(){scrollBeforeWrong=window.scrollY;wrongViewOpen=true;ui.wrongPracticeBody.append(ui.quizCard);ui.wrongPracticeDialog.showModal();ui.exitWrongButton.hidden=false;ui.pauseButton.hidden=true;}
function closeWrongPracticeView(){
  const shouldRestore=wrongViewOpen;wrongViewOpen=false;
  if(ui.wrongPracticeDialog.open)ui.wrongPracticeDialog.close();ui.quizHome.after(ui.quizCard);ui.exitWrongButton.hidden=true;ui.pauseButton.hidden=false;
  if(shouldRestore)requestAnimationFrame(()=>window.scrollTo(0,scrollBeforeWrong));
}

async function startWrongPractice(){
  if(!wrongBank.length||practiceMode==='wrong')return;
  if(!running){await start();if(!running)return;}
  practiceMode='wrong';wrongQueue=[];timedSessionStarted=selected('timeLimit')==='0';score=0;round=1;ui.score.textContent='0';ui.round.textContent='1';updateWrongCount();openWrongPracticeView();
  paused=false;ui.pauseButton.textContent='暂停练习';newQuestion();
}

function exitWrongPractice(){
  if(practiceMode!=='wrong')return;practiceMode='normal';wrongQueue=[];closeWrongPracticeView();score=0;round=1;ui.score.textContent='0';ui.round.textContent='1';
  updateWrongCount();
  if(running){paused=false;ui.pauseButton.textContent='暂停练习';questionDeck=[];newQuestion();}else{ui.feedback.textContent='等待开始';ui.feedback.className='feedback waiting';}
}

function updateFretboardSummary(){
  const stringLabel=selected('stringMode')==='mixed'?'混合弦':`单弦 ${selected('bassString')}`,noteLabel=selected('noteSet')==='natural'?'仅自然音':'包含升降音',octaveLabel=selected('octaveMode')==='exact'?'区分八度':'不区分八度',time=selected('timeLimit');ui.fretboardOptionsSummary.textContent=`${stringLabel} · ${noteLabel} · ${octaveLabel} · ${time==='0'?'不限时':time+' 秒'}`;updateFretboardCoverage();
}
function saveSettings(){updateFretboardSummary();if(!ui.theoryPractice.hidden)captureTheorySettings();}
function restoreData(){
  try{wrongBank=JSON.parse(localStorage.getItem('bassTrainerWrongBank')||'[]');if(!Array.isArray(wrongBank))wrongBank=[];}catch{wrongBank=[];}
  ui.stringPicker.classList.toggle('hidden',selected('stringMode')==='mixed');updateWrongCount();updateFretboardSummary();
}

restoreData();
resetScale();
ui.startButton.addEventListener('click',()=>running?stop():start());ui.deviceSelect.addEventListener('change',()=>{if(running)start(ui.deviceSelect.value);});ui.readyButton.addEventListener('click',startTimedQuestion);ui.pauseButton.addEventListener('click',togglePause);ui.nextButton.addEventListener('click',()=>{if(running&&!paused)newQuestion();});
ui.fretboardTab.addEventListener('click',()=>switchModule('fretboard'));ui.theoryTab.addEventListener('click',()=>switchModule('theory'));ui.backHomeButton.addEventListener('click',showHome);ui.backTheoryButton.addEventListener('click',showTheoryHub);document.querySelectorAll('[data-theory-type]').forEach(button=>button.addEventListener('click',()=>openTheoryPractice(button.dataset.theoryType)));ui.resetScaleButton.addEventListener('click',()=>resetScale(true));ui.skipTheoryButton.addEventListener('click',()=>resetScale(false));[ui.theoryType,ui.scaleKey,ui.triadType].forEach(input=>input.addEventListener('change',()=>{saveSettings();resetScale();}));document.querySelectorAll('input[name="scaleString"],input[name="arpString"],input[name="scaleQuality"]').forEach(input=>input.addEventListener('change',()=>{saveSettings();resetScale();}));document.querySelectorAll('input[name="hintMode"]').forEach(input=>input.addEventListener('change',()=>{saveSettings();ui.theoryOptionsSummary.textContent=ui.theoryOptionsSummary.textContent.replace(/(?:提示|不提示)$/,selected('hintMode')==='guided'?'提示':'不提示');renderScaleProgress();}));
ui.wrongBankButton.addEventListener('click',startWrongPractice);ui.exitWrongButton.addEventListener('click',exitWrongPractice);ui.wrongPracticeDialog.addEventListener('cancel',event=>{event.preventDefault();exitWrongPractice();});
document.querySelectorAll('input[name="stringMode"]').forEach(input=>input.addEventListener('change',()=>{ui.stringPicker.classList.toggle('hidden',selected('stringMode')==='mixed');questionDeck=[];saveSettings();if(running&&!paused&&practiceMode==='normal')newQuestion();}));
document.querySelectorAll('input[name="bassString"],input[name="noteSet"],input[name="octaveMode"]').forEach(input=>input.addEventListener('change',()=>{questionDeck=[];saveSettings();if(running&&!paused&&practiceMode==='normal')newQuestion();}));
document.querySelectorAll('input[name="timeLimit"]').forEach(input=>input.addEventListener('change',()=>{questionDeck=[];timedStruggleStreak=0;timedSessionStarted=selected('timeLimit')==='0';saveSettings();if(running&&!paused)newQuestion();}));
ui.fretCount.addEventListener('change',()=>{questionDeck=[];saveSettings();if(activeModule==='theory')resetScale();else if(running&&!paused&&practiceMode==='normal')newQuestion();});navigator.mediaDevices?.addEventListener('devicechange',()=>listDevices(ui.deviceSelect.value));
ui.switchUntimedButton.addEventListener('click',()=>resolveTimedSupport(true));ui.continueTimedButton.addEventListener('click',()=>resolveTimedSupport(false));ui.timeSupportDialog.addEventListener('cancel',event=>event.preventDefault());
