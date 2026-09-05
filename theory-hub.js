(() => {
  const hub=document.getElementById('theoryHub');
  if(!hub)return;

  const hero=document.getElementById('theoryHubHero');
  const title=document.getElementById('theoryHubTitle');
  const description=document.getElementById('theoryHubDescription');
  const launch=document.getElementById('theoryHubLaunch');
  const preview=hub.querySelector('.theory-hub-preview');
  const previewPrompt=document.getElementById('theoryPreviewPrompt');
  const previewTitle=document.getElementById('theoryPreviewTitle');
  const previewSequence=document.getElementById('theoryPreviewSequence');
  const tabs=[...hub.querySelectorAll('[data-hub-theory]')];
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let previewFrameMotionTimer=null;
  const stopReducedPreviewMotion=()=>{clearTimeout(previewFrameMotionTimer);previewFrameMotionTimer=null;preview.style.removeProperty('background-color');preview.style.removeProperty('box-shadow');};
  const syncReducedPreviewMotion=()=>{
    stopReducedPreviewMotion();
    if(!reducedMotion.matches)return;
      const startedAt=performance.now();
      const tick=()=>{
        if(!reducedMotion.matches){stopReducedPreviewMotion();return;}
        if(!document.hidden&&!hub.hidden){
          const wave=(1-Math.cos((performance.now()-startedAt)*Math.PI*2/3800))/2;
          preview.style.backgroundColor='#fff';
          preview.style.boxShadow=`0 ${10+6*wave}px ${32+34*wave}px rgba(255,255,255,${.09+.19*wave}),0 0 ${14+30*wave}px ${3+7*wave}px rgba(255,255,255,${.06+.13*wave})`;
        }
      previewFrameMotionTimer=setTimeout(tick,document.hidden||hub.hidden?200:50);
    };
    tick();
  };

  // These deterministic examples are the display-only results of the formal
  // exercise rules in app.js. They never enter audio, judging or coverage state.
  const modules={
    scale:{
      title:'音阶',description:'熟悉大调与自然小调的音阶走向',color:'#CBCADA',
      examples:[
        {title:'大调',notes:['C','D','E','F','G','A','B','C']},
        {title:'自然小调',notes:['A','B','C','D','E','F','G','A']}
      ]
    },
    interval:{
      title:'五度音型',description:'根音与五度在指板上的连接',color:'#C0D1CA',
      examples:[{prompt:'从 E 弦上的 D 开始',title:'D 根音 · 五度音型',notes:['D','A','D','A','D']}]
    },
    triad:{
      title:'三和弦琶音',description:'熟悉三和弦在指板上的构成与走向',color:'#CC7C5E',
      examples:[{title:'三和弦琶音',notes:['C','E','G','C','E','G','C']}]
    },
    degree:{
      title:'调内级数',description:'建立调内音级与目标音的反应',color:'#B86B86',
      examples:[{prompt:'请在任意位置弹出',title:'A♭ 大调的第 7 音',notes:['G']}]
    }
  };

  let activeKind='scale',exampleIndex=0,stepIndex=0,timer=null,switchTimer=null;
  const STEP_MS=580,COMPLETE_PAUSE_MS=1450,RESET_PAUSE_MS=360;

  const clearTimers=()=>{clearTimeout(timer);clearTimeout(switchTimer);timer=switchTimer=null;};
  const schedule=(callback,delay)=>setTimeout(callback,delay);
  const appendNote=(element,note)=>{
    element.textContent='';
    [...note].forEach(character=>{
      if(character==='♭'||character==='♯'){
        const mark=document.createElement('span');
        mark.className=`theory-preview-accidental ${character==='♭'?'flat':'sharp'}`;
        mark.textContent=character;
        element.append(mark);
      }else element.append(character);
    });
  };
  const setPreviewText=(element,text)=>{
    element.hidden=!text;
    if(!text){element.textContent='';return;}
    appendNote(element,text);
  };
  const renderNodes=(notes,complete=false)=>{
    previewSequence.textContent='';
    notes.forEach((note,index)=>{
      const node=document.createElement('span');
      node.className=`theory-preview-node${complete?' is-complete':''}`;
      node.dataset.note=note;
      if(complete)appendNote(node,note);
      previewSequence.append(node);
    });
  };
  const renderExample=(complete=false)=>{
    const example=modules[activeKind].examples[exampleIndex];
    setPreviewText(previewPrompt,example.prompt||'');
    setPreviewText(previewTitle,example.title);
    previewSequence.className=`theory-preview-sequence theory-preview-sequence--${activeKind}`;
    renderNodes(example.notes,complete);
    stepIndex=complete?example.notes.length:0;
  };
  const advance=()=>{
    if(hub.hidden||document.hidden)return;
    const example=modules[activeKind].examples[exampleIndex];
    const nodes=[...previewSequence.children];
    if(stepIndex<example.notes.length){
      if(stepIndex>0)nodes[stepIndex-1]?.classList.replace('is-current','is-complete');
      const node=nodes[stepIndex];
      appendNote(node,example.notes[stepIndex]);
      node.classList.add('is-current');
      stepIndex++;
      timer=schedule(advance,STEP_MS);
      return;
    }
    nodes.at(-1)?.classList.replace('is-current','is-complete');
    timer=schedule(()=>{
      exampleIndex=(exampleIndex+1)%modules[activeKind].examples.length;
      renderExample();
      timer=schedule(advance,RESET_PAUSE_MS);
    },COMPLETE_PAUSE_MS);
  };
  const startPreview=()=>{
    clearTimers();
    exampleIndex=0;
    renderExample(false);
    if(!hub.hidden&&!document.hidden)timer=schedule(advance,RESET_PAUSE_MS);
  };
  const selectModule=(kind,animate=true)=>{
    if(!modules[kind])return;
    clearTimers();
    activeKind=kind;
    tabs.forEach(tab=>{const selected=tab.dataset.hubTheory===kind;tab.classList.toggle('is-selected',selected);tab.setAttribute('aria-selected',String(selected));});
    if(animate)hero.classList.add('is-switching');
    const apply=()=>{
      const module=modules[kind];
      hero.dataset.hubKind=kind;
      hero.style.setProperty('--theory-hub-color',module.color);
      title.textContent=module.title;
      description.textContent=module.description;
      launch.dataset.theoryType=kind;
      preview.setAttribute('aria-label',`${module.title}过程预览`);
      startPreview();
      requestAnimationFrame(()=>hero.classList.remove('is-switching'));
    };
    if(animate)switchTimer=schedule(apply,110);else apply();
  };

  tabs.forEach(tab=>tab.addEventListener('click',()=>selectModule(tab.dataset.hubTheory)));
  hero.addEventListener('click',event=>{if(!event.target.closest('button'))launch.click();});
  reducedMotion.addEventListener('change',()=>{startPreview();syncReducedPreviewMotion();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTimers();else startPreview();syncReducedPreviewMotion();});
  new MutationObserver(()=>{if(hub.hidden)clearTimers();else selectModule(activeKind,false);syncReducedPreviewMotion();}).observe(hub,{attributes:true,attributeFilter:['hidden']});
  selectModule('scale',false);
  syncReducedPreviewMotion();
})();
