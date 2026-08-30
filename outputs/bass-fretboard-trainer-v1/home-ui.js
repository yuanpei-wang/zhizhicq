(() => {
  const params=new URLSearchParams(window.location.search);
  if(params.get('home')==='1')document.documentElement.classList.add('home-direct-preview');

  const actions={
    home:()=>document.getElementById('backHomeButton')?.click(),
    fretboard:()=>document.getElementById('fretboardTab')?.click(),
    theory:()=>document.getElementById('theoryTab')?.click(),
    wrong:()=>document.getElementById('wrongBankButton')?.click()
  };
  document.querySelectorAll('[data-home-action]').forEach(button=>button.addEventListener('click',()=>actions[button.dataset.homeAction]?.()));

  const navButtons=[...document.querySelectorAll('.top-nav-link[data-home-action]')];
  const fretboardModule=document.getElementById('fretboardModule'),theoryModule=document.getElementById('theoryModule'),wrongDialog=document.getElementById('wrongPracticeDialog');
  const syncActiveNavigation=()=>{
    const active=wrongDialog?.open?'wrong':document.body.classList.contains('in-practice')?(fretboardModule?.hidden?'theory':'fretboard'):'home';
    navButtons.forEach(button=>button.classList.toggle('is-active',button.dataset.homeAction===active));
  };
  const activeObserver=new MutationObserver(syncActiveNavigation);
  activeObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
  if(fretboardModule)activeObserver.observe(fretboardModule,{attributes:true,attributeFilter:['hidden']});
  if(theoryModule)activeObserver.observe(theoryModule,{attributes:true,attributeFilter:['hidden']});
  if(wrongDialog)activeObserver.observe(wrongDialog,{attributes:true,attributeFilter:['open']});
  syncActiveNavigation();

  const sourceCount=document.getElementById('wrongCount'),headerCount=document.getElementById('headerWrongCount'),headerWrong=document.getElementById('headerWrongBank');
  const syncWrongCount=()=>{const count=sourceCount?.textContent||'0';if(headerCount)headerCount.textContent=count;if(headerWrong)headerWrong.disabled=count==='0';};
  if(sourceCount)new MutationObserver(syncWrongCount).observe(sourceCount,{childList:true,characterData:true,subtree:true});
  syncWrongCount();

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
