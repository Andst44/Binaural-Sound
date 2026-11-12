(async()=>{
 const check=(v,m)=>{if(!v)throw new Error(m);};
 try{
  check(isSecureContext,'Secure context absent');
  check(!!navigator.mediaDevices?.getUserMedia,'Audio capture API absent');
  check(typeof AudioContext.prototype.setSinkId==='function','Output selection API absent');
  check(ImmersionSphere.positions.length===26,'26 positions absent');
  check(!$('liveSetup').hidden&&$('inputMode').value==='live','Live interface hidden');
  const c=new OfflineAudioContext(2,12000,48000),src=c.createBufferSource();
  const b=c.createBuffer(2,12000,48000);for(let ch=0;ch<2;ch++)for(let i=0;i<12000;i++)b.getChannelData(ch)[i]=.1*Math.sin(i*(ch?.09:.04));src.buffer=b;
  const room=c.createGain();room.gain.value=0;room.connect(c.destination);
  const graph=ImmersionSphere.create(c,src,c.destination,room);
  graph.set({radius:20,cutoff:9000,directLevel:.8,bassDb:0,envelopment:.55,roomLevel:.1},true);
  check(graph.routes.length===26,'26 audio paths absent');src.start();
  const audio=await c.startRendering();let peak=0;for(const v of audio.getChannelData(0)){check(Number.isFinite(v),'Invalid samples');peak=Math.max(peak,Math.abs(v));}check(peak>0&&peak<1,'Audio render invalid');graph.destroy();
  for(const name of ['fps','stadium','film']){$('profile').value=name;$('profile').onchange();check($('envelopment').value===({fps:'25',stadium:'85',film:'55'})[name],'Profile mismatch');}
  check($('radius').min==='5'&&$('radius').max==='30','Distance range');
  check($('volume').max==='100','Volume range');
  chrome.webview.postMessage(JSON.stringify({ok:true,secureContext:isSecureContext,captureAPI:true,outputSelection:true,positions:26,renderPeak:peak,profiles:['film','fps','stadium'],nodeRequired:false}));
 }catch(e){chrome.webview.postMessage(JSON.stringify({ok:false,error:e.message}));}
})();
