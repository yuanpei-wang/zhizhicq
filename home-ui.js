(() => {
  const theoryPractice=document.getElementById('theoryPractice'),wrongDialog=document.getElementById('wrongPracticeDialog');

  const flatNoteSelector='#scaleTitle,#scalePrompt,#scaleFeedback,#scaleHeard,.scale-step';
  const decorateFlatNote=element=>{
    if(!element||element.querySelector('.accidental-mark'))return;
    const original=element.textContent;
    if(!/[♭♯]/.test(original)){if(element.hasAttribute('data-flat-decorated')){element.removeAttribute('aria-label');element.removeAttribute('data-flat-decorated');}return;}
    element.setAttribute('aria-label',original);element.setAttribute('data-flat-decorated','');
    const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())if(/[♭♯]/.test(walker.currentNode.data))nodes.push(walker.currentNode);
    nodes.forEach(node=>{const fragment=document.createDocumentFragment();node.data.split(/([♭♯])/).forEach(part=>{if(part==='♭'||part==='♯'){const mark=document.createElement('span');mark.className=`accidental-mark ${part==='♭'?'flat-mark':'sharp-mark'}`;mark.setAttribute('aria-hidden','true');mark.textContent=part;fragment.append(mark);}else fragment.append(part);});node.replaceWith(fragment);});
  };
  const decorateTheoryFlats=records=>{
    const targets=new Set();
    records?.forEach(record=>{const element=record.target.nodeType===Node.TEXT_NODE?record.target.parentElement:record.target;if(element?.matches?.(flatNoteSelector))targets.add(element);element?.closest?.(flatNoteSelector)&&targets.add(element.closest(flatNoteSelector));element?.querySelectorAll?.(flatNoteSelector).forEach(target=>targets.add(target));});
    if(!records)theoryPractice?.querySelectorAll(flatNoteSelector).forEach(target=>targets.add(target));
    targets.forEach(decorateFlatNote);
  };
  if(theoryPractice)new MutationObserver(decorateTheoryFlats).observe(theoryPractice,{childList:true,characterData:true,subtree:true});
  decorateTheoryFlats();

  const sourceCount=document.getElementById('wrongCount'),headerCount=document.getElementById('headerWrongCount'),headerWrong=document.getElementById('headerWrongBank');
  const syncWrongCount=()=>{const count=sourceCount?.textContent||'0';if(headerCount)headerCount.textContent=count;if(headerWrong)headerWrong.disabled=count==='0';};
  if(sourceCount)new MutationObserver(syncWrongCount).observe(sourceCount,{childList:true,characterData:true,subtree:true});
  syncWrongCount();

  const exitWrongButton=document.getElementById('exitWrongButton');
  wrongDialog?.addEventListener('click',event=>{
    if(event.target!==wrongDialog||!wrongDialog.open)return;
    const rect=wrongDialog.getBoundingClientRect();
    const clickedBackdrop=event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom;
    if(clickedBackdrop)exitWrongButton?.click();
  });

  const deviceStatus=document.getElementById('deviceStatus');
  const heroTitle=document.querySelector('.hero-copy h2');
  const syncHeroTitle=()=>{if(heroTitle)heroTitle.textContent=deviceStatus?.classList.contains('active')?'选择你的练习':'请连接音频设备';};
  if(deviceStatus)new MutationObserver(syncHeroTitle).observe(deviceStatus,{attributes:true,attributeFilter:['class']});
  syncHeroTitle();

  const description=document.getElementById('practiceEntryDescription');
  const entryList=document.querySelector('.practice-entry-list');
  const entries=[...document.querySelectorAll('.practice-entry')];
  const breatheCircles=entries.map(entry=>entry.querySelector('.practice-entry-breathe'));
  const hideDescription=()=>{if(!description)return;const focused=document.activeElement?.closest?.('.practice-entry');if(!focused)description.classList.remove('is-visible');};
  entries.forEach(entry=>{
    const show=()=>{if(!description)return;description.classList.remove('is-visible');requestAnimationFrame(()=>{description.textContent=entry.dataset.description;description.classList.add('is-visible');});};
    entry.addEventListener('mouseenter',show);entry.addEventListener('focus',show);entry.addEventListener('blur',()=>requestAnimationFrame(hideDescription));
  });
  entryList?.addEventListener('mouseleave',hideDescription);

  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  let touchBreatheTimer=null;
  const stopTouchBreatheFallback=()=>{clearTimeout(touchBreatheTimer);touchBreatheTimer=null;document.body.classList.remove('home-touch-breathe-fallback');breatheCircles.forEach(circle=>circle?.style.removeProperty('background-color'));};
  const syncTouchBreatheFallback=()=>{
    stopTouchBreatheFallback();
    if(!reducedMotion.matches)return;
    document.body.classList.add('home-touch-breathe-fallback');
    const startedAt=performance.now(),amplitude=.85,speed=.7,period=3200,offset=1450;
    const tick=()=>{
      if(!reducedMotion.matches){stopTouchBreatheFallback();return;}
      if(!document.hidden&&!document.body.classList.contains('in-practice')){
        const elapsed=(performance.now()-startedAt)*speed;
        breatheCircles.forEach((circle,index)=>{const wave=(1-Math.cos((elapsed+(index?offset:0))*Math.PI*2/period))/2;if(circle)circle.style.backgroundColor=`rgba(216,206,230,${.52*amplitude*wave})`;});
      }
      touchBreatheTimer=setTimeout(tick,document.hidden?200:50);
    };
    tick();
  };
  reducedMotion.addEventListener('change',syncTouchBreatheFallback);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)return;syncTouchBreatheFallback();});
  syncTouchBreatheFallback();
})();
