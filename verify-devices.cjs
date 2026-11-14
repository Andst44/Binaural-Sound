const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
 const page=await browser.newPage();await page.goto(require('node:url').pathToFileURL(require('node:path').join(__dirname,'index.html')).href);
 const result=await page.evaluate(()=>{
  const physical=[{deviceId:'usb',label:'Casque USB marque A',groupId:'usb-group'},{deviceId:'bt',label:'Headphones Bluetooth marque B',groupId:'bt-group'},{deviceId:'jack',label:'Headphones (Realtek Audio)',groupId:'jack-group'},{deviceId:'hdmi',label:'HDMI écran',groupId:'hdmi-group'},{deviceId:'speakers',label:'Haut-parleurs',groupId:'speaker-group'},{deviceId:'hf',label:'Headset Hands-Free AG Audio',groupId:'hf-group'}].map(d=>({...d,kind:'audiooutput'}));
  const devices=[{kind:'audioinput',deviceId:'cable-in',label:'CABLE Output'},{kind:'audiooutput',deviceId:'default',label:'Default - HDMI',groupId:'hdmi-group'},...physical,{kind:'audiooutput',deviceId:'virtual',label:'CABLE Input'}];
  savedSettings={};fillDevices(devices);
  const initial=$('audioOutput').value,options=[...$('audioOutput').options].map(o=>o.value);
  $('audioOutput').value='bt';$('audioOutput').dispatchEvent(new Event('change'));fillDevices(devices);
  const remembered=$('audioOutput').value;
  savedSettings={};$('audioOutput').replaceChildren();fillDevices(devices.filter(d=>d.deviceId!=='default'));
  const generic=$('audioOutput').value;
  savedSettings={};$('audioOutput').replaceChildren();fillDevices(devices.filter(d=>d.deviceId==='hf'||d.deviceId==='cable-in'));
  return {initial,options,remembered,generic,hf:$('audioOutput').value};
 });
 assert.equal(result.initial,'hdmi');assert.deepEqual(result.options,['usb','bt','jack','hdmi','speakers','hf']);assert.equal(result.remembered,'bt');assert.equal(result.generic,'usb');assert.equal(result.hf,'hf');
 console.log('PASS: generic USB/Bluetooth/jack/HDMI/speaker enumeration; physical Windows default; remembered output; no brand requirement; virtual output excluded.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
