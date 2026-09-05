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
  const hideDescription=()=>{if(!description)return;const focused=document.activeElement?.closest?.('.practice-entry');if(!focused)description.classList.remove('is-visible');};
  document.querySelectorAll('.practice-entry').forEach(entry=>{
    const show=()=>{if(!description)return;description.classList.remove('is-visible');requestAnimationFrame(()=>{description.textContent=entry.dataset.description;description.classList.add('is-visible');});};
    entry.addEventListener('mouseenter',show);entry.addEventListener('focus',show);entry.addEventListener('blur',()=>requestAnimationFrame(hideDescription));
  });
  entryList?.addEventListener('mouseleave',hideDescription);
})();
