const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try {
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const appUrl=process.env.IMMERSION_TEST_URL||pathToFileURL(require('node:path').join(__dirname,'index.html')).href;
 await page.goto(appUrl);
 // Switching to live must work before the audio engine has ever been started.
 await page.selectOption('#inputMode','live');
 assert.equal(await page.locator('#liveSetup').isVisible(),true);
 assert.equal(await page.locator('#profile').isVisible(),true);
 assert.deepEqual(errors,[]);
 await page.selectOption('#inputMode','demo');
 await page.click('#play');await page.waitForTimeout(300);
 assert.equal(await page.evaluate(()=>ctx.state),'running');
 for(const level of ['-1','0','1']){
  await page.selectOption('#level',level);
  for(const name of ['Avant','Avant droite','Droite','Arrière droite','Arrière','Arrière gauche','Gauche','Avant gauche']){
   await page.getByRole('button',{name,exact:true}).click();
   assert.ok((await page.locator('#location').textContent()).endsWith(' · '+name));
  }
 }
await page.locator('#bass').fill('6');await page.waitForTimeout(500);
 assert.equal(await page.locator('#radiusValue').textContent(),'2,0 m');
 assert.ok(await page.evaluate(()=>pan.positionY.value>6));
 for(const pole of ['2','-2']){
  await page.selectOption('#level',pole);
  await page.click('#pole');await page.waitForTimeout(900);
  const coords=await page.evaluate(()=>[pan.positionX.value,pan.positionY.value,pan.positionZ.value]);
  assert.ok(Math.abs(coords[0])<.01&&Math.abs(coords[2])<.01);
  assert.ok(Math.abs(coords[1]-(Number(pole)>0?20:-20))<.01);
  assert.equal(await page.locator('#positions').isVisible(),false);
  assert.equal(await page.locator('#motion option[value=orbit]').isDisabled(),true);
  assert.ok((await page.locator('#location').textContent()).endsWith(' · Centre'));
 }
 await page.selectOption('#level','0');
 assert.equal(await page.locator('#positions').isVisible(),true);
 assert.equal(await page.locator('#motion option[value=orbit]').isDisabled(),false);
 await page.selectOption('#motion','sphere');const before=await page.evaluate(()=>angle);await page.waitForTimeout(300);assert.ok(await page.evaluate(a=>angle>a,before));
 await page.click('#stop');await page.waitForTimeout(800);assert.ok(await page.evaluate(()=>!running&&master.gain.value<.001));
 await page.click('#play');assert.equal(await page.evaluate(()=>running),true);await page.click('#stop');
 const detection=await page.evaluate(async()=>{
  let active=false,stopped=false;
  navigator.mediaDevices.enumerateDevices=async()=>active?[
   {kind:'audioinput',deviceId:'capture',label:'CABLE Output'},
   {kind:'audiooutput',deviceId:'headset',label:'G435'}
  ]:[];
  navigator.mediaDevices.getUserMedia=async()=>{active=true;return {getTracks:()=>[{stop(){active=false;stopped=true;}}]};};
  await scanDevices(true);
  return {input:document.getElementById('audioInput').selectedOptions[0].text,output:document.getElementById('audioOutput').selectedOptions[0].text,stopped,pending:permissionScanPending};
 });
 assert.equal(detection.input,'CABLE Output');assert.equal(detection.output,'G435');
 assert.equal(detection.stopped,true);assert.equal(detection.pending,false);
 await page.evaluate(()=>{
  navigator.mediaDevices.enumerateDevices=async()=>[
   {kind:'audioinput',deviceId:'test-in',label:'CABLE Output'},
   {kind:'audiooutput',deviceId:'test-out',label:'G435'},
   {kind:'audiooutput',deviceId:'other-out',label:'Haut-parleurs'},
   {kind:'audiooutput',deviceId:'virtual-out',label:'Immersion Sound (VB-Audio Virtual Cable)'},
   {kind:'audiooutput',deviceId:'cable-out',label:'CABLE Input'}
  ];
  navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('Permission refusée','NotAllowedError');};
 });
 await page.selectOption('#inputMode','live');
 await page.waitForFunction(()=>document.getElementById('audioOutput').options.length===2);
 assert.equal(await page.locator('#audioInput').inputValue(),'test-in');
 assert.equal(await page.locator('#audioOutput').inputValue(),'test-out');
 await page.selectOption('#audioOutput','other-out');
 await page.click('#devices');
 await page.waitForFunction(()=>document.getElementById('deviceStatus').textContent.includes('refusé'));
 assert.equal(await page.locator('#audioOutput').inputValue(),'other-out');
 assert.equal(await page.locator('#audioInput').isEnabled(),true);
 assert.equal(await page.locator('#audioOutput option[value="virtual-out"]').count(),0);
 assert.equal(await page.locator('#audioOutput option[value="cable-out"]').count(),0);
 assert.equal(await page.locator('#liveSetup').isVisible(),true);
 assert.equal(await page.locator('#motion').isDisabled(),true);
 // Synthetic stereo input validates the live graph without recording a microphone
 // or changing the user's device routing.
 await page.evaluate(()=>{
  const testStream=ctx.createMediaStreamDestination();
  const testTone=ctx.createOscillator();testTone.connect(testStream);testTone.start();
  navigator.mediaDevices.getUserMedia=async()=>testStream.stream;
  window.testSink=null;ctx.setSinkId=async id=>{window.testSink=id;};
 });
 await page.click('#play');
 assert.equal(await page.evaluate(()=>running&&livePans.length===26),true);
 assert.equal(await page.evaluate(()=>window.testSink),'other-out');
 await page.selectOption('#profile','fps');await page.waitForTimeout(800);
 assert.equal(await page.locator('#envelopment').inputValue(),'25');
 assert.ok(await page.evaluate(()=>liveGraph.filter.frequency.value>8990&&liveGraph.direct.gain.value>.79&&liveGraph.reverb.gain.value<.03));
 assert.equal(await page.evaluate(()=>livePans.length),26);
 await page.selectOption('#profile','music');await page.waitForTimeout(800);
 assert.equal(await page.locator('#envelopment').inputValue(),'10');
 assert.ok(await page.evaluate(()=>liveGraph.filter.frequency.value>19990&&liveGraph.direct.gain.value>.99&&liveGraph.reverb.gain.value<.01));
 await page.selectOption('#profile','pov');await page.waitForTimeout(800);
 assert.equal(await page.locator('#povControls').isVisible(),true);
 assert.equal(await page.locator('#envelopment').inputValue(),'15');
 assert.ok(await page.evaluate(()=>liveGraph.voiceHighpass.frequency.value>79&&liveGraph.voicePresence.gain.value>2.99&&liveGraph.direct.gain.value>.99&&liveGraph.filter.frequency.value>15990&&liveGraph.reverb.gain.value<.001));
 await page.locator('#roomAmount').fill('100');await page.waitForTimeout(800);
 assert.ok(await page.evaluate(()=>Math.abs(liveGraph.povWet.gain.value-.22)<.001));
 await page.locator('#roomAmount').fill('0');await page.waitForTimeout(800);
 assert.ok(await page.evaluate(()=>liveGraph.povWet.gain.value<.001));
 const roomRender=await page.evaluate(async()=>{
  const c=new OfflineAudioContext(2,48000,48000),src=c.createBufferSource();
  src.buffer=c.createBuffer(2,48000,48000);src.buffer.getChannelData(0)[0]=.5;src.buffer.getChannelData(1)[0]=.5;
  const g=ImmersionSphere.create(c,src,c.destination,c.createGain());
  g.set({radius:12,cutoff:16000,directLevel:0,bassDb:0,envelopment:0,roomLevel:0,pov:true,roomAmount:1},true);
  src.start();const b=await c.startRendering();const d=b.getChannelData(0);
  return {finite:d.every(Number.isFinite),early:d.slice(800,6000).some(v=>Math.abs(v)>1e-5),late:d.slice(30000).every(v=>Math.abs(v)<1e-7)};
 });assert.deepEqual(roomRender,{finite:true,early:true,late:true});
 await page.selectOption('#profile','concert');await page.waitForTimeout(800);
 assert.equal(await page.locator('#concertControls').isVisible(),true);
 assert.equal(await page.locator('#povControls').isVisible(),false);
 assert.equal(await page.locator('#envelopment').inputValue(),'45');
 assert.ok(await page.evaluate(()=>liveGraph.direct.gain.value>.89&&liveGraph.filter.frequency.value>15990&&liveGraph.reverb.gain.value<.001&&liveGraph.povWet.gain.value<.001&&liveGraph.voicePresence.gain.value<.001));
 await page.locator('#hallAmount').fill('100');await page.waitForTimeout(800);
 assert.ok(await page.evaluate(()=>Math.abs(liveGraph.concertWet.gain.value-.32)<.001));
 await page.locator('#hallAmount').fill('0');await page.waitForTimeout(800);
 assert.ok(await page.evaluate(()=>liveGraph.concertWet.gain.value<.001));
 const hallRender=await page.evaluate(async()=>{
  const c=new OfflineAudioContext(2,144000,48000),src=c.createBufferSource();
  src.buffer=c.createBuffer(2,144000,48000);src.buffer.getChannelData(0)[0]=.5;src.buffer.getChannelData(1)[0]=.5;
  const g=ImmersionSphere.create(c,src,c.destination,c.createGain());
  g.set({radius:12,cutoff:16000,directLevel:0,bassDb:0,envelopment:0,roomLevel:0,concert:true,hallAmount:1},true);
  src.start();const b=await c.startRendering();const d=b.getChannelData(0),right=b.getChannelData(1);
  const energy=(a,z)=>d.slice(a,z).reduce((sum,v)=>sum+v*v,0);
  return {finite:d.every(Number.isFinite)&&right.every(Number.isFinite),tail:energy(24000,48000)>1e-10,decays:energy(48000,72000)<energy(2400,26400),ends:energy(96000,144000)<1e-12,stereo:d.some((v,i)=>Math.abs(v-right[i])>1e-5)};
 });assert.deepEqual(hallRender,{finite:true,tail:true,decays:true,ends:true,stereo:true});
 await page.locator('#hallAmount').fill('100');await page.waitForTimeout(800);
 await page.selectOption('#profile','communication');await page.waitForTimeout(800);
 assert.equal(await page.locator('#envelopment').inputValue(),'0');
 assert.equal(await page.locator('#envelopment').isDisabled(),true);
 assert.equal(await page.locator('#concertControls').isVisible(),false);
 assert.ok(await page.evaluate(()=>liveGraph.concertWet.gain.value<.001));
 assert.equal(await page.locator('#povControls').isVisible(),false);
 assert.ok(await page.evaluate(()=>liveGraph.povWet.gain.value<.001));
 assert.ok(await page.evaluate(()=>liveGraph.surround.gain.value<.001&&liveGraph.reverb.gain.value<.001&&liveGraph.voiceHighpass.frequency.value>119&&liveGraph.voicePresence.gain.value>2.49));
 await page.selectOption('#profile','film');await page.waitForTimeout(800);
 assert.equal(await page.locator('#envelopment').isEnabled(),true);
 assert.ok(await page.evaluate(()=>liveGraph.voiceHighpass.frequency.value<21&&liveGraph.voicePresence.gain.value<.001));
 await page.selectOption('#profile','film');await page.waitForTimeout(800);
 assert.equal(await page.locator('#envelopment').inputValue(),'55');
 assert.ok(await page.evaluate(()=>liveGraph.filter.frequency.value<4000&&liveGraph.direct.gain.value<.5));
 await page.waitForTimeout(500);
 assert.ok(await page.evaluate(()=>liveGraph.routes.find(r=>r.position.level===0&&r.position.direction===7).panner.positionX.value<0&&liveGraph.routes.find(r=>r.position.level===0&&r.position.direction===1).panner.positionX.value>0));
await page.waitForTimeout(800);
 assert.equal(await page.locator('#radiusValue').textContent(),'2,0 m');
 assert.ok(await page.evaluate(()=>liveGraph.filter.frequency.value>3000&&liveGraph.direct.gain.value>.39));
await page.waitForTimeout(800);
 assert.ok(await page.evaluate(()=>liveGraph.filter.frequency.value>3000&&liveGraph.direct.gain.value>.39));
 await page.locator('#envelopment').fill('0');await page.waitForTimeout(800);
 assert.ok(await page.evaluate(()=>liveGraph.surround.gain.value<.001));
 await page.locator('#envelopment').fill('100');await page.waitForTimeout(800);
 assert.ok(await page.evaluate(()=>liveGraph.surround.gain.value>.5));
await page.waitForTimeout(800);
 assert.ok(await page.evaluate(()=>liveGraph.filter.frequency.value>3000&&liveGraph.direct.gain.value>.39));
 const tracks=await page.evaluate(()=>liveStream.getTracks().length);assert.ok(tracks>0);
 for(const [value,label] of [['5','0,5 m'],['30','3,0 m']]){
  await page.locator('#radius').fill(value);await page.waitForTimeout(600);
  assert.equal(await page.locator('#radiusValue').textContent(),label);
  assert.ok(await page.evaluate(r=>liveGraph.routes.every(({panner})=>Math.abs(Math.hypot(panner.positionX.value,panner.positionY.value,panner.positionZ.value)-r)<.05),Number(value)));
 }
 await page.locator('#volume').fill('100');await page.waitForTimeout(700);
 assert.ok(await page.evaluate(()=>master.gain.value>.999));
 await page.locator('#boost').fill('0');await page.waitForTimeout(700);
 assert.ok(await page.evaluate(()=>Math.abs(master.gain.value-1)<.002));
 await page.locator('#boost').fill('12');await page.waitForTimeout(700);
 assert.ok(await page.evaluate(()=>Math.abs(master.gain.value-Math.pow(10,12/20))<.002));
 await page.locator('#boost').fill('6');
 await page.locator('#volume').fill('0');await page.waitForTimeout(700);
 assert.ok(await page.evaluate(()=>master.gain.value<.001));
 await page.click('#stop');
 assert.equal(await page.evaluate(()=>liveStream===null&&livePans.length===0),true);
 await page.selectOption('#inputMode','demo');
 for(const width of [360,1080]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
 assert.deepEqual(errors,[]);
 await page.evaluate(()=>{document.getElementById('inputMode').value='live';window.dispatchEvent(new Event('pageshow'));});
 assert.equal(await page.locator('#liveSetup').isVisible(),true);
 assert.equal(await page.locator('#motion').isDisabled(),true);
 // Verify the legacy shortcut in a fresh settings session.
 await page.addInitScript(()=>localStorage.removeItem('immersion-sound.settings.v1'));
 await page.goto(appUrl+'#stadium');
 await page.waitForFunction(()=>document.getElementById('profile').value==='music');
 assert.equal(await page.locator('#inputMode').inputValue(),'live');
 assert.equal(await page.locator('#profile').inputValue(),'music');
 assert.equal(await page.locator('#envelopment').inputValue(),'10');
 assert.equal(await page.evaluate(()=>running),false);
 await page.reload();
 assert.equal(await page.locator('#profile').inputValue(),'music');
 assert.equal(await page.locator('#liveSetup').isVisible(),true);
 for(const width of [360,1080]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
 assert.deepEqual(errors,[]);
 await page.screenshot({path:require('node:path').join(__dirname,'prototype-preview.png'),fullPage:true});
 console.log('PASS: Film/Musique/Com/Jeu profiles; legacy stadium shortcut maps to music; 26 live HRTF paths; envelopment 0–100; distance 0.5–3 m; volume 0–100; audio start/stop/restart; responsive layout; no browser errors.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
