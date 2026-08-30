(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('tuning') !== 'home') return;

  document.documentElement.classList.add('layout-tuning-mode');

  const controls = [
    ['页面','pageMaxWidth','页面最大宽度',760,1600,10,1180,'px','--home-page-max-width'],
    ['页面','pagePaddingX','页面左右内边距',0,120,1,16,'px','--home-page-padding-x'],
    ['页面','pagePaddingTop','页面顶部留白',0,220,1,24,'px','--home-page-padding-top'],
    ['页面','pagePaddingBottom','页面底部留白',0,220,1,28,'px','--home-page-padding-bottom'],
    ['页面','structureGap','主要模块间距',0,160,1,14,'px','--home-structure-gap'],
    ['标题区域','headerWidth','标题区域宽度',20,100,1,100,'%','--home-header-width'],
    ['标题区域','headerOffsetX','标题区域水平偏移',-240,240,1,0,'px','--home-header-offset-x'],
    ['标题区域','headerMarginTop','标题区域上方 margin',0,160,1,0,'px','--home-header-margin-top'],
    ['标题区域','headerMarginBottom','标题区域下方 margin',0,160,1,0,'px','--home-header-margin-bottom'],
    ['标题区域','headerGap','与下一个 section 的间距',0,160,1,18,'px','--home-header-gap'],
    ['标题区域','subtitleWidth','首页说明最大宽度',180,1200,10,680,'px','--home-subtitle-width'],
    ['标题区域','subtitleGap','标题与说明间距',0,80,1,10,'px','--home-subtitle-gap'],
    ['音频与设置','audioWidth','音频区域宽度',30,100,1,100,'%','--home-audio-width'],
    ['音频与设置','audioMinHeight','音频区域最小高度',0,420,2,0,'px','--home-audio-min-height'],
    ['音频与设置','audioMarginTop','音频区域上方 margin',0,160,1,0,'px','--home-audio-margin-top'],
    ['音频与设置','audioMarginBottom','音频区域下方 margin',0,160,1,0,'px','--home-audio-margin-bottom'],
    ['音频与设置','audioPaddingX','音频区域左右内边距',0,100,1,16,'px','--home-audio-padding-x'],
    ['音频与设置','audioPaddingY','音频区域上下内边距',0,100,1,14,'px','--home-audio-padding-y'],
    ['音频与设置','setupGap','Setup 内部元素间距',0,80,1,12,'px','--home-setup-gap'],
    ['音频与设置','audioGap','与下一个 section 的间距',0,160,1,14,'px','--home-audio-gap'],
    ['音频与设置','fretSetupWidth','贝斯品数区域宽度',100,520,5,180,'px','--home-fret-setup-width'],
    ['音频与设置','fretSetupGap','贝斯品数区域顶部间距',0,80,1,0,'px','--home-fret-setup-gap'],
    ['音频与设置','fretSetupPaddingTop','贝斯品数区域顶部内边距',0,80,1,0,'px','--home-fret-setup-padding-top'],
    ['练习入口卡片','entryWidth','卡片区域宽度',30,100,1,100,'%','--home-entry-width'],
    ['练习入口卡片','entryMarginTop','卡片区域上方 margin',0,160,1,0,'px','--home-entry-margin-top'],
    ['练习入口卡片','entryMarginBottom','卡片区域下方 margin',0,160,1,0,'px','--home-entry-margin-bottom'],
    ['练习入口卡片','entryNextGap','与下一个 section 的间距',0,160,1,0,'px','--home-entry-next-gap'],
    ['练习入口卡片','cardHeight','卡片高度',80,520,5,220,'px','--home-card-height'],
    ['练习入口卡片','leftCardRatio','左侧卡片宽度比例',0.25,3,0.05,1,'fr','--home-left-card-fr'],
    ['练习入口卡片','rightCardRatio','右侧卡片宽度比例',0.25,3,0.05,1,'fr','--home-right-card-fr'],
    ['练习入口卡片','cardGap','卡片间距',0,120,1,14,'px','--home-card-gap'],
    ['练习入口卡片','cardPaddingX','卡片左右内边距',0,100,1,28,'px','--home-card-padding-x'],
    ['练习入口卡片','cardPaddingY','卡片上下内边距',0,100,1,28,'px','--home-card-padding-y'],
    ['文字排版','titleSize','产品标题字号',16,96,1,40,'px','--home-title-size'],
    ['文字排版','titleLineHeight','产品标题行高',0.7,2,0.05,1.1,'','--home-title-line-height'],
    ['文字排版','subtitleSize','首页说明字号',10,36,1,16,'px','--home-subtitle-size'],
    ['文字排版','subtitleLineHeight','首页说明行高',0.8,2.5,0.05,1.4,'','--home-subtitle-line-height'],
    ['文字排版','cardTitleSize','卡片标题字号',12,64,1,28,'px','--home-card-title-size'],
    ['文字排版','cardTitleLineHeight','卡片标题行高',0.8,2,0.05,1.2,'','--home-card-title-line-height'],
    ['文字排版','cardDescriptionSize','卡片说明字号',9,30,1,13,'px','--home-card-description-size'],
    ['文字排版','cardDescriptionLineHeight','卡片说明行高',0.8,2.5,0.05,1.5,'','--home-card-description-line-height'],
    ['文字排版','cardDescriptionGap','卡片标题与说明间距',0,80,1,8,'px','--home-card-description-gap']
  ].map(([group,key,label,min,max,step,baseline,unit,variable]) => ({group,key,label,min,max,step,baseline,unit,variable}));

  const textFields = [
    ['productTitle','产品标题'],['homeDescription','首页静态说明'],
    ['audioLabel','音频区域标签'],['fretLabel','贝斯品数标签'],['privacyText','隐私说明'],
    ['fretboardTitle','指板练习卡片标题'],['fretboardDescription','指板练习卡片说明'],
    ['theoryTitle','乐理练习卡片标题'],['theoryDescription','乐理练习卡片说明'],
    ['startButton','启用音频按钮初始文案']
  ];
  const visibilityFields = [
    ['header','标题区域'],['subtitle','首页静态说明'],['audioControls','音频与设置'],
    ['deviceControls','设备选择区域'],['fretSetup','贝斯品数区域'],['diagnostics','音频诊断'],
    ['privacy','隐私说明'],['homeView','练习入口卡片'],['fretboardCard','指板练习卡片'],['theoryCard','乐理练习卡片']
  ];
  const moduleLabels = {header:'标题区域',audioControls:'音频与设置',homeView:'练习入口卡片'};
  const state = Object.fromEntries(controls.map(control => [control.key,control.baseline]));
  const baselineText = {};
  const visibility = Object.fromEntries(visibilityFields.map(([key]) => [key,true]));
  const structure = {layoutMode:'column',audioFlow:'row',cardsFlow:'row',moduleOrder:['header','audioControls','homeView'],alignments:{header:'start',audioControls:'start',homeView:'start'}};
  const setup = {layout:'grid',frame:true,itemsAlign:'center',order:['enable','device','status','diagnostics','fret'],alignments:{enable:'start',device:'start',status:'start',diagnostics:'start',fret:'start'}};
  const setupLabels = {enable:'启用音频',device:'设备选择器',status:'连接状态',diagnostics:'音频诊断',fret:'贝斯品数'};
  const preview = {viewport:'desktop',skeleton:true,scheme:'A'};
  const viewportPresets = {desktop:{width:1440,height:900},laptop:{width:1280,height:800},tablet:{width:768,height:1024},mobile:{width:390,height:844}};

  function moduleElement(key) {
    if (key === 'audioControls' || key === 'homeView') return document.getElementById(key);
    if (key === 'deviceControls') return document.querySelector('[data-setup-item="device"]');
    return document.querySelector(`[data-tuning-module="${key}"]`);
  }

  function applyStructure() {
    const shell=document.querySelector('.shell');
    shell.dataset.tuningLayoutMode=structure.layoutMode;
    document.getElementById('audioControls').dataset.tuningFlow=structure.audioFlow;
    document.getElementById('homeView').dataset.tuningFlow=structure.cardsFlow;
    document.documentElement.style.setProperty('--home-header-align',structure.alignments.header);
    document.documentElement.style.setProperty('--home-audio-align',structure.alignments.audioControls);
    document.documentElement.style.setProperty('--home-entry-align',structure.alignments.homeView);
    structure.moduleOrder.forEach((key,index) => {
      const element=moduleElement(key);element.style.order=String(index);element.style.gridColumn='';
      if(['1:1','2:1','3:1'].includes(structure.layoutMode)) element.style.gridColumn=index===0?'1 / -1':String(index);
    });
  }

  function applySetup() {
    setupGrid.dataset.setupLayout=setup.layout;
    audioControls.dataset.tuningFrame=String(setup.frame);
    document.documentElement.style.setProperty('--home-setup-items-align',setup.itemsAlign);
    setup.order.forEach((key,index)=>{
      const slot=setupGrid.querySelector(`[data-setup-item="${key}"]`);slot.style.order=String(index);slot.style.setProperty('--setup-item-align',setup.alignments[key]);
    });
  }

  function applyPracticeFirstPreset() {
    structure.layoutMode='practice-first';structure.moduleOrder=['header','audioControls','homeView'];structure.alignments={header:'start',audioControls:'start',homeView:'start'};
    setup.layout='grid';setup.frame=true;setup.itemsAlign='center';setup.order=['enable','device','status','diagnostics','fret'];
    applyControl(controls.find(item=>item.key==='headerGap'),14);applyControl(controls.find(item=>item.key==='audioWidth'),100);applyControl(controls.find(item=>item.key==='audioMinHeight'),0);applyControl(controls.find(item=>item.key==='audioPaddingX'),12);applyControl(controls.find(item=>item.key==='audioPaddingY'),10);applyControl(controls.find(item=>item.key==='audioGap'),22);applyControl(controls.find(item=>item.key==='setupGap'),12);applyControl(controls.find(item=>item.key==='cardHeight'),260);
    renderOrder();renderSetupOrder();syncStructureControls();applyStructure();applySetup();
  }

  function applyPreview() {
    const preset=viewportPresets[preview.viewport];
    document.documentElement.style.setProperty('--tuning-preview-width',`${preset.width}px`);
    document.documentElement.style.setProperty('--tuning-preview-height',`${preset.height}px`);
    previewHost.style.setProperty('--tuning-preview-width',`${preset.width}px`);
    previewHost.style.setProperty('--tuning-preview-height',`${preset.height}px`);
    previewHost.dataset.previewViewport=preview.viewport;
    previewHost.dataset.skeletonPreview=String(preview.skeleton);
    previewHost.dataset.wireframeScheme=preview.scheme;
  }

  function applyControl(control,value) {
    const numeric = Math.min(control.max,Math.max(control.min,Number(value)));
    state[control.key] = numeric;
    document.documentElement.style.setProperty(control.variable,`${numeric}${control.unit}`);
    document.querySelectorAll(`[data-control-key="${control.key}"]`).forEach(input => { input.value = numeric; });
  }

  function makeControl(control) {
    const wrapper = document.createElement('div');
    wrapper.className = 'tuning-control';
    wrapper.innerHTML = `<label>${control.label}</label><div class="tuning-control-row"><input type="range" min="${control.min}" max="${control.max}" step="${control.step}" value="${control.baseline}" data-control-key="${control.key}" aria-label="${control.label}滑块"><input type="number" min="${control.min}" max="${control.max}" step="${control.step}" value="${control.baseline}" data-control-key="${control.key}" aria-label="${control.label}精确数值"></div>`;
    wrapper.querySelectorAll('input').forEach(input => input.addEventListener('input',() => applyControl(control,input.value)));
    return wrapper;
  }

  function makeSelect(label,options,value,onChange) {
    const wrapper=document.createElement('div');wrapper.className='tuning-control';
    wrapper.innerHTML=`<label>${label}</label><select class="tuning-select" aria-label="${label}">${options.map(([key,text])=>`<option value="${key}"${key===value?' selected':''}>${text}</option>`).join('')}</select>`;
    wrapper.querySelector('select').addEventListener('change',event=>onChange(event.target.value));return wrapper;
  }

  function copyText(value,message) {
    const finish = () => { panel.querySelector('.tuning-message').textContent = message; };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(value).then(finish).catch(() => fallbackCopy(value,finish));
    else fallbackCopy(value,finish);
  }

  function fallbackCopy(value,finish) {
    const area = document.createElement('textarea');area.value=value;document.body.append(area);area.select();document.execCommand('copy');area.remove();finish();
  }

  const panel = document.createElement('aside');
  panel.className = 'home-tuning-panel';
  panel.setAttribute('aria-label','首页布局调节面板');
  panel.innerHTML = '<h2>首页布局调节</h2><p class="tuning-panel-note">仅用于预览 · 布局骨架模式</p>';

  const shell=document.querySelector('.shell');
  const previewHost=document.createElement('section');
  previewHost.className='home-tuning-preview-host';
  previewHost.setAttribute('aria-label','首页固定视口预览区');
  shell.before(previewHost);previewHost.append(shell);

  const audioControls=document.getElementById('audioControls');
  const setupGrid=document.createElement('div');setupGrid.className='home-tuning-setup-grid';setupGrid.setAttribute('aria-label','Setup 内部布局');
  const setupNodes={enable:document.getElementById('startButton'),device:[audioControls.querySelector('label[for="deviceSelect"]'),document.getElementById('deviceSelect')],status:document.getElementById('deviceStatus'),diagnostics:document.getElementById('diagnosticPanel'),fret:audioControls.querySelector('.instrument-config')};
  Object.entries(setupNodes).forEach(([key,nodes])=>{const slot=document.createElement('div');slot.className='home-tuning-setup-slot';slot.dataset.setupItem=key;(Array.isArray(nodes)?nodes:[nodes]).forEach(node=>slot.append(node));setupGrid.append(slot);});
  audioControls.prepend(setupGrid);audioControls.classList.add('has-tuning-setup');

  const previewSection=document.createElement('details');previewSection.open=true;previewSection.innerHTML='<summary>预览环境</summary>';
  previewSection.append(makeSelect('模拟视口',[
    ['desktop','桌面 1440'],['laptop','笔记本 1280'],['tablet','平板 768'],['mobile','手机 390']
  ],preview.viewport,value=>{preview.viewport=value;applyPreview();}));
  previewSection.append(makeSelect('Wireframe 方案',[
    ['A','A · 轻量 Setup + 60/40 主次入口'],['B','B · 左侧标题与 Setup + 右侧入口'],['C','C · 顶部标题 + 极简 Setup + 紧凑入口'],['custom','当前自定义结构']
  ],preview.scheme,value=>{preview.scheme=value;if(value!=='custom'){preview.skeleton=true;setup.order=['enable','device','status','diagnostics','fret'];setup.alignments={enable:'start',device:'start',status:'start',diagnostics:'start',fret:'start'};renderSetupOrder();applySetup();skeletonSwitch.querySelector('input').checked=true;skeletonSwitch.querySelector('input').disabled=true;skeletonSwitch.querySelector('span').textContent='开启（方案锁定）';}else{skeletonSwitch.querySelector('input').disabled=false;skeletonSwitch.querySelector('span').textContent=preview.skeleton?'开启':'关闭';}applyPreview();}));
  const skeletonSwitch=document.createElement('div');skeletonSwitch.className='tuning-switch';skeletonSwitch.innerHTML='<label for="tuningSkeletonPreview">骨架预览模式：<span>开启</span></label><input id="tuningSkeletonPreview" type="checkbox" checked>';
  skeletonSwitch.querySelector('input').addEventListener('change',event=>{preview.skeleton=event.target.checked;skeletonSwitch.querySelector('span').textContent=preview.skeleton?'开启':'关闭';applyPreview();});
  skeletonSwitch.querySelector('input').disabled=true;skeletonSwitch.querySelector('span').textContent='开启（方案锁定）';
  previewSection.append(skeletonSwitch);
  const previewNote=document.createElement('p');previewNote.className='tuning-panel-note';previewNote.textContent='预览画布使用固定尺寸；右侧工具区不计入模拟视口宽度。关闭骨架模式可对照当前真实样式。';previewSection.append(previewNote);panel.append(previewSection);

  const structureSection=document.createElement('details');structureSection.open=true;structureSection.innerHTML='<summary>结构组合</summary>';
  structureSection.append(makeSelect('主要容器布局模式',[
    ['practice-first','练习入口优先'],['row','横向排列'],['column','纵向排列'],['1:1','比例 1:1'],['2:1','比例 2:1'],['3:1','比例 3:1']
  ],structure.layoutMode,value=>{if(value==='practice-first')applyPracticeFirstPreset();else{structure.layoutMode=value;applyStructure();}}));
  structureSection.append(makeSelect('音频与设置排列', [['row','横向排列'],['column','纵向排列']],structure.audioFlow,value=>{structure.audioFlow=value;applyStructure();}));
  structureSection.append(makeSelect('练习入口卡片排列', [['row','横向排列'],['column','纵向排列']],structure.cardsFlow,value=>{structure.cardsFlow=value;applyStructure();}));
  const alignmentOptions=[['start','左对齐'],['center','居中'],['end','右对齐']];
  structureSection.append(makeSelect('标题区域水平对齐',alignmentOptions,structure.alignments.header,value=>{structure.alignments.header=value;applyStructure();}));
  structureSection.append(makeSelect('音频与设置水平对齐',alignmentOptions,structure.alignments.audioControls,value=>{structure.alignments.audioControls=value;applyStructure();}));
  structureSection.append(makeSelect('练习入口卡片水平对齐',alignmentOptions,structure.alignments.homeView,value=>{structure.alignments.homeView=value;applyStructure();}));
  const alignmentNote=document.createElement('p');alignmentNote.className='tuning-panel-note';alignmentNote.textContent='对齐基准：页面主内容容器。相同宽度并选择左对齐时，模块左边缘会落在同一内容线上。';structureSection.append(alignmentNote);
  const orderWrap=document.createElement('div');orderWrap.className='tuning-control';orderWrap.innerHTML='<label>主要模块顺序</label><div class="tuning-order-list"></div>';
  structureSection.append(orderWrap);panel.append(structureSection);

  function syncStructureControls() {
    panel.querySelector('[aria-label="主要容器布局模式"]').value=structure.layoutMode;panel.querySelector('[aria-label="标题区域水平对齐"]').value=structure.alignments.header;panel.querySelector('[aria-label="音频与设置水平对齐"]').value=structure.alignments.audioControls;panel.querySelector('[aria-label="练习入口卡片水平对齐"]').value=structure.alignments.homeView;
  }

  function renderOrder() {
    const list=orderWrap.querySelector('.tuning-order-list');list.innerHTML='';
    structure.moduleOrder.forEach((key,index)=>{
      const row=document.createElement('div');row.className='tuning-order-row';row.innerHTML=`<span>${index+1}. ${moduleLabels[key]}</span><button aria-label="上移${moduleLabels[key]}" ${index===0?'disabled':''}>上移</button><button aria-label="下移${moduleLabels[key]}" ${index===structure.moduleOrder.length-1?'disabled':''}>下移</button>`;
      const [up,down]=row.querySelectorAll('button');
      up.addEventListener('click',()=>moveModule(index,-1));down.addEventListener('click',()=>moveModule(index,1));list.append(row);
    });
  }
  function moveModule(index,direction) {
    const next=index+direction;if(next<0||next>=structure.moduleOrder.length)return;
    [structure.moduleOrder[index],structure.moduleOrder[next]]=[structure.moduleOrder[next],structure.moduleOrder[index]];renderOrder();applyStructure();
  }

  const setupSection=document.createElement('details');setupSection.open=true;setupSection.innerHTML='<summary>Setup 内部布局</summary>';
  setupSection.append(makeSelect('Setup 排列方式',[['grid','紧凑网格'],['row','横向换行'],['column','纵向排列']],setup.layout,value=>{setup.layout=value;applySetup();}));
  setupSection.append(makeSelect('Setup 元素垂直对齐',[['start','顶部对齐'],['center','居中对齐'],['end','底部对齐']],setup.itemsAlign,value=>{setup.itemsAlign=value;applySetup();}));
  const frameSwitch=document.createElement('div');frameSwitch.className='tuning-switch';frameSwitch.innerHTML='<label for="tuningSetupFrame">Setup 外框：<span>显示</span></label><input id="tuningSetupFrame" type="checkbox" checked>';
  frameSwitch.querySelector('input').addEventListener('change',event=>{setup.frame=event.target.checked;frameSwitch.querySelector('span').textContent=setup.frame?'显示':'隐藏';applySetup();});setupSection.append(frameSwitch);
  const setupOrderWrap=document.createElement('div');setupOrderWrap.className='tuning-control';setupOrderWrap.innerHTML='<label>Setup 元素顺序与对齐</label><div class="tuning-order-list"></div>';setupSection.append(setupOrderWrap);panel.append(setupSection);

  function renderSetupOrder() {
    const list=setupOrderWrap.querySelector('.tuning-order-list');list.innerHTML='';
    setup.order.forEach((key,index)=>{
      const row=document.createElement('div');row.className='tuning-order-row';row.innerHTML=`<span>${index+1}. ${setupLabels[key]}</span><button aria-label="上移${setupLabels[key]}" ${index===0?'disabled':''}>上移</button><button aria-label="下移${setupLabels[key]}" ${index===setup.order.length-1?'disabled':''}>下移</button>`;
      const align=makeSelect(`${setupLabels[key]}水平对齐`,[['start','左对齐'],['center','居中'],['end','右对齐']],setup.alignments[key],value=>{setup.alignments[key]=value;applySetup();});align.style.gridColumn='1 / -1';
      const [up,down]=row.querySelectorAll('button');up.addEventListener('click',()=>moveSetupItem(index,-1));down.addEventListener('click',()=>moveSetupItem(index,1));list.append(row,align);
    });
  }
  function moveSetupItem(index,direction) {const next=index+direction;if(next<0||next>=setup.order.length)return;[setup.order[index],setup.order[next]]=[setup.order[next],setup.order[index]];renderSetupOrder();applySetup();}

  for (const group of ['页面','标题区域','音频与设置','练习入口卡片','文字排版']) {
    const section = document.createElement('details');section.open = group === '页面';section.innerHTML = `<summary>${group}</summary>`;
    controls.filter(control => control.group === group).forEach(control => section.append(makeControl(control)));
    panel.append(section);
  }

  const contentSection = document.createElement('details');
  contentSection.innerHTML = '<summary>显示与文字</summary><div class="tuning-visibility"></div>';
  const visibilityGrid = contentSection.querySelector('.tuning-visibility');
  visibilityFields.forEach(([key,label]) => {
    const row = document.createElement('label');row.innerHTML = `<input type="checkbox" checked data-visibility-key="${key}"> <span>${label}：显示</span>`;
    row.querySelector('input').addEventListener('change',event => {visibility[key]=event.target.checked;moduleElement(key)?.setAttribute('data-tuning-hidden',String(!visibility[key]));row.querySelector('span').textContent=`${label}：${visibility[key]?'显示':'隐藏'}`;});
    visibilityGrid.append(row);
  });
  textFields.forEach(([key,label]) => {
    const element = document.querySelector(`[data-tuning-text="${key}"]`);if(!element)return;
    baselineText[key]=element.textContent.trim();
    const wrapper=document.createElement('div');wrapper.className='tuning-control';wrapper.innerHTML=`<label>${label}</label><textarea data-text-key="${key}" aria-label="${label}"></textarea>`;
    const input=wrapper.querySelector('textarea');input.value=baselineText[key];input.addEventListener('input',()=>{element.textContent=input.value;});contentSection.append(wrapper);
  });
  panel.append(contentSection);

  const actions=document.createElement('div');actions.className='tuning-actions';actions.innerHTML='<button id="tuningReset">恢复默认</button><button id="tuningCopyCss">复制 CSS 参数</button><button id="tuningCopyJson">复制 JSON 配置</button>';
  panel.append(actions);
  const message=document.createElement('p');message.className='tuning-message';message.setAttribute('aria-live','polite');panel.append(message);
  document.body.append(panel);

  panel.querySelector('#tuningReset').addEventListener('click',() => {
    controls.forEach(control => applyControl(control,control.baseline));
    structure.layoutMode='column';structure.audioFlow='row';structure.cardsFlow='row';structure.moduleOrder=['header','audioControls','homeView'];structure.alignments={header:'start',audioControls:'start',homeView:'start'};setup.layout='grid';setup.frame=true;setup.itemsAlign='center';setup.order=['enable','device','status','diagnostics','fret'];setup.alignments={enable:'start',device:'start',status:'start',diagnostics:'start',fret:'start'};preview.viewport='desktop';preview.skeleton=true;preview.scheme='A';
    panel.querySelector('[aria-label="模拟视口"]').value=preview.viewport;panel.querySelector('[aria-label="Wireframe 方案"]').value=preview.scheme;skeletonSwitch.querySelector('input').checked=true;skeletonSwitch.querySelector('input').disabled=true;skeletonSwitch.querySelector('span').textContent='开启（方案锁定）';applyPreview();
    panel.querySelector('[aria-label="主要容器布局模式"]').value=structure.layoutMode;panel.querySelector('[aria-label="音频与设置排列"]').value=structure.audioFlow;panel.querySelector('[aria-label="练习入口卡片排列"]').value=structure.cardsFlow;panel.querySelector('[aria-label="标题区域水平对齐"]').value=structure.alignments.header;panel.querySelector('[aria-label="音频与设置水平对齐"]').value=structure.alignments.audioControls;panel.querySelector('[aria-label="练习入口卡片水平对齐"]').value=structure.alignments.homeView;panel.querySelector('[aria-label="Setup 排列方式"]').value=setup.layout;panel.querySelector('[aria-label="Setup 元素垂直对齐"]').value=setup.itemsAlign;frameSwitch.querySelector('input').checked=true;frameSwitch.querySelector('span').textContent='显示';renderOrder();renderSetupOrder();applyStructure();applySetup();
    textFields.forEach(([key]) => {const element=document.querySelector(`[data-tuning-text="${key}"]`),input=panel.querySelector(`[data-text-key="${key}"]`);if(element&&input){element.textContent=baselineText[key];input.value=baselineText[key];}});
    visibilityFields.forEach(([key,label]) => {visibility[key]=true;moduleElement(key)?.removeAttribute('data-tuning-hidden');const input=panel.querySelector(`[data-visibility-key="${key}"]`);if(input){input.checked=true;input.nextElementSibling.textContent=`${label}：显示`;}});
    message.textContent='已恢复默认设置。';
  });
  panel.querySelector('#tuningCopyCss').addEventListener('click',() => copyText(`:root {\n${controls.map(control=>`  ${control.variable}: ${state[control.key]}${control.unit};`).join('\n')}\n}`,'已复制 CSS 参数。'));
  panel.querySelector('#tuningCopyJson').addEventListener('click',() => {
    const textOverrides=Object.fromEntries(textFields.map(([key])=>[key,document.querySelector(`[data-tuning-text="${key}"]`)?.textContent||'']));
    copyText(JSON.stringify({layoutTokens:state,layoutMode:structure.layoutMode,moduleOrder:structure.moduleOrder,alignments:structure.alignments,setupLayout:setup,regionFlows:{audioSetup:structure.audioFlow,practiceEntryCards:structure.cardsFlow},preview:{viewport:preview.viewport,skeleton:preview.skeleton,scheme:preview.scheme},visibility,textOverrides},null,2),'已复制 JSON 配置。');
  });

  renderOrder();renderSetupOrder();applyStructure();applySetup();applyPreview();
})();
