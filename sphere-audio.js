'use strict';
// Stereo upmix, not an object-audio decoder. All positions are listener-relative.
globalThis.ImmersionSphere = (() => {
  const positions = [];
  for (const level of [-1, 0, 1]) {
    for (let direction = 0; direction < 8; direction++) {
      const azimuth = direction * Math.PI / 4, elevation = level * Math.PI / 4;
      positions.push({level, direction, x: Math.sin(azimuth)*Math.cos(elevation),
        y: Math.sin(elevation), z: -Math.cos(azimuth)*Math.cos(elevation)});
    }
  }
  positions.push({level:2,direction:0,x:0,y:1,z:0},{level:-2,direction:0,x:0,y:-1,z:0});

  function create(context, input, output, room) {
    const nodes=[], routes=[];
    const own = node => {nodes.push(node);return node;};
    const gain = value => {const n=own(context.createGain());n.gain.value=value;return n;};
    const stereo=gain(1);stereo.channelCount=2;stereo.channelCountMode='explicit';
    stereo.channelInterpretation='speakers'; // Duplicate mono into L/R if necessary.
    input.connect(stereo);
    const bass=own(context.createBiquadFilter());bass.type='lowshelf';bass.frequency.value=160;
    const filter=own(context.createBiquadFilter());filter.type='lowpass';filter.Q.value=.5;
    const voiceHighpass=own(context.createBiquadFilter());voiceHighpass.type='highpass';voiceHighpass.frequency.value=20;voiceHighpass.Q.value=.707;
    const voicePresence=own(context.createBiquadFilter());voicePresence.type='peaking';voicePresence.frequency.value=2200;voicePresence.Q.value=.8;voicePresence.gain.value=0;
    const split=own(context.createChannelSplitter(2));
    stereo.connect(bass).connect(voiceHighpass).connect(voicePresence).connect(filter).connect(split);
    const mid=gain(1), side=gain(1);
    for(let ch=0;ch<2;ch++) {
      const m=gain(.5),s=gain(ch===0?.5:-.5);
      split.connect(m,ch);m.connect(mid);split.connect(s,ch);s.connect(side);
    }
    const diffuse=own(context.createBiquadFilter());diffuse.type='highpass';diffuse.frequency.value=180;
    side.connect(diffuse);
    const common=own(context.createBiquadFilter());common.type='highpass';common.frequency.value=700;
    mid.connect(common);
    const direct=gain(0), surround=gain(0), reverb=gain(0);
    direct.connect(output);surround.connect(output);filter.connect(reverb).connect(room);
    const surroundCount=23;
    positions.forEach((position,index)=>{
      const panner=own(context.createPanner());panner.panningModel='HRTF';panner.rolloffFactor=0;
      const front=position.level===0&&[0,1,7].includes(position.direction);
      if(front){
        const level=gain(position.direction===0?.2:.4);
        if(position.direction===0)mid.connect(level);
        else split.connect(level,position.direction===7?0:1);
        level.connect(panner).connect(direct);
      }else{
        // Mostly stereo difference: centered speech is kept out of the surround bed.
        // A small mid feed gives mono material a subtle ambient field, not new directions.
        const difference=gain((position.x<0?1:-1)*.65/surroundCount);
        const mono=gain(.06/surroundCount);
        const allpass=own(context.createBiquadFilter());allpass.type='allpass';
        allpass.frequency.value=350+(index*197)%2300;allpass.Q.value=.6;
        const delay=own(context.createDelay(.025));delay.delayTime.value=.004+(index%11)*.0012;
        diffuse.connect(difference);common.connect(mono);
        difference.connect(allpass);mono.connect(allpass);allpass.connect(delay).connect(panner).connect(surround);
      }
      routes.push({position,panner,front});
    });
    let disposed=false;
    function set({radius,cutoff,directLevel,bassDb,envelopment,roomLevel,communication=false},immediate=false){
      if(disposed)return;
      const value=(param,v)=>{if(immediate)param.setValueAtTime(v,context.currentTime);else param.setTargetAtTime(v,context.currentTime,.08);};
      routes.forEach(({position,panner})=>{
        value(panner.positionX,position.x*radius);value(panner.positionY,position.y*radius);value(panner.positionZ,position.z*radius);
      });
      value(voiceHighpass.frequency,communication?120:20);value(voicePresence.gain,communication?2.5:0);
      value(filter.frequency,cutoff);value(bass.gain,bassDb);value(direct.gain,directLevel);
      value(surround.gain,envelopment*(.25+.75*directLevel));
      value(reverb.gain,roomLevel*(.12+.28*envelopment));
    }
    function destroy(){if(disposed)return;disposed=true;input.disconnect(stereo);nodes.forEach(n=>n.disconnect());}
    return {routes,voiceHighpass,voicePresence,filter,bass,direct,surround,reverb,mid,side,set,destroy};
  }
  return {positions,create};
})();
