const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url=pathToFileURL(require('node:path').join(__dirname,'Immersion Sound Windows/assets/index.html')).href+'#film';
 await page.goto(url);
 await page.selectOption('#profile','pov');
 for(const [id,value] of Object.entries({radius:'12',volume:'64',boost:'4',bass:'-3',envelopment:'32',roomAmount:'63',rearFocus:'82'}))await page.locator('#'+id).fill(value);
 const devices=[{kind:'audioinput',deviceId:'cable',label:'CABLE Output'},{kind:'audiooutput',deviceId:'g435',label:'G435'},{kind:'audiooutput',deviceId:'speakers',label:'Speakers'}];
 await page.evaluate(d=>fillDevices(d),devices);
 await page.selectOption('#audioOutput','speakers');
 await page.reload();
 for(const [id,value] of Object.entries({profile:'pov',radius:'12',volume:'64',boost:'4',bass:'-3',envelopment:'32',roomAmount:'63',rearFocus:'82'}))assert.equal(await page.locator('#'+id).inputValue(),value);
 await page.evaluate(d=>fillDevices(d),devices);assert.equal(await page.locator('#audioOutput').inputValue(),'speakers');
 await page.evaluate(d=>fillDevices(d.filter(x=>x.deviceId!=='speakers')),devices);
 await page.evaluate(()=>saveSettings());await page.reload();
 await page.evaluate(d=>fillDevices(d.map(x=>x.deviceId==='speakers'?{...x,deviceId:'speakers-new'}:x)),devices);
 assert.equal(await page.locator('#audioOutput').inputValue(),'speakers-new');
 assert.equal(await page.evaluate(()=>running),false);
 await page.selectOption('#profile','concert');await page.locator('#hallAmount').fill('68');await page.reload();
 assert.equal(await page.locator('#profile').inputValue(),'concert');
 assert.equal(await page.locator('#hallAmount').inputValue(),'68');
 assert.equal(await page.locator('#concertControls').isVisible(),true);
 await page.selectOption('#profile','communication');await page.reload();assert.equal(await page.locator('#envelopment').isDisabled(),true);
 // Simulate corrupt storage without the pagehide saver replacing it.
 await page.evaluate(()=>{window.removeEventListener('pagehide',saveSettings);localStorage.setItem(settingsKey,'broken');});
 await page.addInitScript(()=>localStorage.setItem('immersion-sound.settings.v1','broken'));await page.reload();assert.equal(await page.locator('#profile').inputValue(),'film');
 assert.deepEqual(errors,[]);
 console.log('PASS: saved controls override startup #film; devices restored including changed IDs and temporary absence; communication state restored; corrupt storage handled; no automatic playback.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
