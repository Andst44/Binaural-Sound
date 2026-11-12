const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
  const page=await browser.newPage();
  await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
  const result=await page.evaluate(async()=>{
   const offline=new OfflineAudioContext(26,24000,48000);
   const src=offline.createBufferSource();const buf=offline.createBuffer(2,24000,48000);
   // Uncorrelated stereo excites both mid and side, including the pole routes.
   let seed=17;for(let c=0;c<2;c++)for(let i=0;i<2400;i++){seed=(seed*1664525+1013904223)>>>0;buf.getChannelData(c)[i]=(seed/4294967296-.5)*.2;}
   src.buffer=buf;const sink=offline.createGain();const room=offline.createGain();
   const graph=ImmersionSphere.create(offline,src,sink,room);
   graph.set({radius:20,cutoff:12000,directLevel:1,bassDb:0,envelopment:.55,roomLevel:.2},true);
   const merger=offline.createChannelMerger(26);merger.connect(offline.destination);
   graph.routes.forEach((r,i)=>{const mono=offline.createGain();mono.channelCount=1;mono.channelCountMode='explicit';r.panner.connect(mono);mono.connect(merger,0,i);});
   src.start();const rendered=await offline.startRendering();
   const peaks=Array.from({length:26},(_,c)=>Math.max(...rendered.getChannelData(c).map(Math.abs)));
   graph.destroy();
   const coordinates=ImmersionSphere.positions.map(p=>[p.x,p.y,p.z]);
   // A centered mono voice must cancel in the side bus, but remain in mid.
   const monoContext=new OfflineAudioContext(2,8000,48000), monoSource=monoContext.createBufferSource();
   const monoBuffer=monoContext.createBuffer(1,8000,48000);for(let i=0;i<8000;i++)monoBuffer.getChannelData(0)[i]=.1*Math.sin(i*.04);
   monoSource.buffer=monoBuffer;const graph2=ImmersionSphere.create(monoContext,monoSource,monoContext.createGain(),monoContext.createGain());
   graph2.set({radius:20,cutoff:12000,directLevel:1,bassDb:0,envelopment:1,roomLevel:0},true);
   const merge2=monoContext.createChannelMerger(2);graph2.mid.connect(merge2,0,0);graph2.side.connect(merge2,0,1);merge2.connect(monoContext.destination);
   monoSource.start();const monoRendered=await monoContext.startRendering();
   const monoPeaks=[0,1].map(c=>Math.max(...monoRendered.getChannelData(c).map(Math.abs)));graph2.destroy();
   return {peaks,coordinates,monoPeaks};
  });
  assert.equal(result.peaks.length,26);
  assert.ok(result.peaks.every(p=>Number.isFinite(p)&&p>1e-8&&p<1));
  assert.equal(new Set(result.coordinates.map(c=>c.map(v=>v.toFixed(5)).join(','))).size,26);
  assert.ok(result.coordinates.every(c=>Math.abs(Math.hypot(...c)-1)<1e-6));
  assert.ok(result.monoPeaks[0]>.01&&result.monoPeaks[1]<1e-7);
  console.log('PASS: offline audio rendered on all 26 distinct HRTF positions; finite bounded signals; mono voice cancels in side bus.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
