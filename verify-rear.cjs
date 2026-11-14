const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
 const page=await browser.newPage();await page.goto(require('node:url').pathToFileURL(require('node:path').join(__dirname,'index.html')).href);
 const result=await page.evaluate(async()=>{
  async function render(focus,mono){
   const c=new OfflineAudioContext(26,12000,48000),src=c.createBufferSource();src.buffer=c.createBuffer(2,12000,48000);
   let seed=5;for(let i=0;i<4000;i++){seed=(seed*1664525+1013904223)>>>0;const v=(seed/4294967296-.5)*.2;src.buffer.getChannelData(0)[i]=v;src.buffer.getChannelData(1)[i]=mono?v:-v;}
   const g=ImmersionSphere.create(c,src,c.createGain(),c.createGain());g.set({radius:12,cutoff:16000,directLevel:1,bassDb:0,envelopment:.55,roomLevel:0,rearFocus:focus},true);
   const mix=c.createChannelMerger(26);mix.connect(c.destination);
   g.routes.forEach((r,i)=>{const n=c.createGain();n.channelCount=1;n.channelCountMode='explicit';r.panner.connect(n);n.connect(mix,0,i);});
   const budget=g.routes.reduce((sum,r)=>sum+(r.difference?Math.abs(r.difference.gain.value):0),0);
   src.start();const b=await c.startRendering();let rear=0,other=0,front=0,finite=true;
   g.routes.forEach((r,i)=>{const d=b.getChannelData(i);finite&&=d.every(Number.isFinite);const e=d.reduce((sum,v)=>sum+v*v,0);if(r.front)front+=e;else if(r.rear)rear+=e;else other+=e;});g.destroy();return {rear,other,front,budget,finite};
  }
  return {balanced:await render(0,false),rear:await render(.6,false),mono0:await render(0,true),mono1:await render(1,true)};
 });
 for(const r of Object.values(result)){assert.ok(r.finite);assert.ok(Math.abs(r.budget-.65)<1e-6);}
 assert.ok(result.rear.rear>result.balanced.rear*1.8);
 assert.ok(result.rear.other<result.balanced.other);
 assert.ok(Math.abs(result.rear.front-result.balanced.front)<1e-8);
 assert.ok(Math.abs(result.mono0.rear-result.mono1.rear)<1e-8);
 console.log('PASS: rear ambience energy increased, other ambience reduced, direct stage and mono speech unchanged, gain budget conserved, finite output.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
