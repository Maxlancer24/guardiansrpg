/* Local unequipped 2v2 demo. No account access/rewards. Formulas mirror the
 * existing practice port; Garrick guard follows main.py story guard branches.
 * This is not the complete bot engine (equipment/passives/statuses excluded). */
(function(root){
 'use strict';
 const R=typeof module!=='undefined'?require('../battle-practice/rules.js'):root.PracticeRules;
 const copy=x=>JSON.parse(JSON.stringify(x));
 const roundEven=n=>{const f=Math.floor(n);return n-f===.5?(f%2?f+1:f):Math.round(n);};
 const heroes={jessie:{str:9,agi:12,con:14},garrick:{str:14,agi:4,con:12},zoe:{str:14,agi:22,con:14}};
 const specs=[['jessie',0,{str:9,agi:12,con:14}],['garrick',0,{str:14,agi:4,con:12}],['warden',1,{str:10,agi:6,con:15}],['ash',1,{str:12,agi:8,con:12}]];
 class Battle{
  constructor(rng=Math.random,team=['jessie','garrick']){if(team.length!==2||new Set(team).size!==2||team.some(k=>!heroes[k]))throw Error('invalid team');this.rng=rng;const roster=[...team.map(k=>[k,0,heroes[k]]),...specs.slice(2)];this.actors=roster.map(([key,team,stats],id)=>({...R.fighter(id,stats),key,team,guard:false,dodgeBonus:0,noCrit:false}));this.round=1;this.prepare();}
  living(team){return this.actors.filter(a=>a.hp>0&&(team===undefined||a.team===team));}
  winner(){const a=this.living(0).length,b=this.living(1).length;return a&&b?null:a?0:b?1:-1;}
  roll(n){return 1+Math.floor(this.rng()*n);}
  prepare(){const alive=this.living();if(this.winner()!==null)return;const wait=Math.min(...alive.map(a=>(100-a.meter)/(1+a.agi))),ties={};for(const a of alive){ties[a.id]=this.rng();a.meter=Math.min(100,a.meter+(1+a.agi)*wait);}this.order=alive.map(a=>a.id).sort((x,y)=>this.actors[y].meter-this.actors[x].meter||this.actors[y].agi-this.actors[x].agi||ties[y]-ties[x]);this.order.forEach((id,i)=>this.actors[id].rank=i+1);}
  snapshot(){return copy({actors:this.actors,round:this.round,order:this.order});}
  intents(){const allies=this.living(0);return Object.fromEntries(this.living(1).map((a,i)=>[a.id,{action:this.round>=9?'ATTACK':['ATTACK','DEFEND','ATTACK','REST','ATTACK'][(this.round+i-1)%5],target:allies[(this.round+i-1)%allies.length]?.id}]));}
  resolve(player,enemy=this.intents()){
   if(this.winner()!==null)throw Error('finished');
   const plans={...player,...enemy};
   for(const a of this.living()){
    const p=plans[a.id];if(!p||!['ATTACK','DEFEND','REST','SPECIAL'].includes(p.action))throw Error('invalid action');
    if(p.action==='SPECIAL'&&(a.used||a.team!==0))throw Error('special unavailable');
    if(p.action==='ATTACK'||(p.action==='SPECIAL'&&a.key!=='garrick')){const b=this.actors[p.target];if(!b||b.hp<=0||b.team===a.team)throw Error('invalid target');}
   }
   const events=[],targeted=new Set(),deferred=[];
   const emit=(type,actor,extra={})=>events.push({type,actor,...extra,state:this.snapshot()});
   const damage=(a,n,parry=false)=>{
    const before=a.hp;let value=Math.max(0,Math.trunc(n));
    if(a.guard&&!parry&&value>0)value=Math.max(1,roundEven(value*.65));
    a.hp=Math.max(0,a.hp-value);let lastStand=false;
    if(a.guard&&a.hp===0){a.hp=1;a.guard=false;lastStand=true;}
    return {amount:before-a.hp,lastStand};
   };
   // Team protection is armed BEFORE initiative, even when Garrick acts last.
   const g=this.actors.find(a=>a.key==='garrick');
   if(g?.hp>0&&plans[g.id].action==='SPECIAL'){g.used=true;g.guard=true;emit('protection',g.id,{team:g.team});}
   const select=(a,id)=>{const preferred=this.actors[id];return preferred?.hp>0&&preferred.team!==a.team?preferred:this.living(1-a.team).sort((x,y)=>x.hp-y.hp||x.id-y.id)[0];};
   const strike=(a,original,special=false)=>{
    const guard=this.living(original.team).find(x=>x.guard&&x.id!==original.id),b=guard||original;
    targeted.add(b.id);const redirected=guard?original.id:null;
    const ultra=!special&&a.ultra;let crit=false,outcome='hit';
    if(!ultra&&this.roll(100)<=Math.min(100,R.chance(b)+b.dodgeBonus)){if(!special){a.focus=false;a.ultra=false;}emit('attack',a.id,{target:b.id,protected:redirected,special,outcome:'dodge',amount:0});return;}
    let raw=R.base(a,4+this.roll(11));
    if(!special){crit=!a.noCrit&&this.roll(100)<=R.chance(a);if(crit)raw*=1.5;a.focus=false;a.ultra=false;}
    raw=Math.max(1,Math.trunc(raw));
    const defending=b.guard||plans[b.id].action==='DEFEND';let n;
    if(ultra){outcome='ultra';n=raw;}
    else if(!special&&defending){const diff=raw-(b.con*5+b.str);if(diff<=0){emit('attack',a.id,{target:b.id,protected:redirected,special,outcome:'parry',amount:0});const hit=damage(a,b.con*3+b.str,true);emit('counter',b.id,{target:a.id,...hit});return;}outcome='break';n=Math.max(1,Math.trunc(diff-b.agi*2.5));}
    else{if(!special&&!b.guard&&plans[b.id].action==='REST'){raw=Math.trunc(raw*1.5);outcome='vulnerable';}n=Math.max(1,Math.trunc(raw-b.agi*2.5));}
    const hit=damage(b,n);emit('attack',a.id,{target:b.id,protected:redirected,special,outcome,crit,...hit});
   };
   for(const id of this.order){const a=this.actors[id],p=plans[id];if(a.hp<=0||!this.living(1-a.team).length)continue;
    if(p.action==='SPECIAL'&&a.key==='garrick')continue;
    if(p.action==='ATTACK'||p.action==='SPECIAL'){
     if(a.rank===1)a.meter=0;
     const b=select(a,p.target);if(!b)continue;
     if(p.action==='SPECIAL'){
      if(a.key==='zoe'){
       const base=Math.max(1,Math.trunc(R.base(a,4+this.roll(11))));
       a.used=true;a.focus=false;a.ultra=false;
       for(const rival of this.living(1-a.team)){rival.focus=false;rival.ultra=false;rival.noCrit=true}
       for(const ally of this.living(a.team))ally.dodgeBonus=Math.max(20,ally.dodgeBonus);
       emit('awareness',id,{target:b.id});targeted.add(b.id);
       const raw=Math.max(1,Math.trunc(Math.max(1,Math.trunc(base*.75))-b.agi*2.5));
       emit('attack',id,{target:b.id,special:true,outcome:'hit',...damage(b,raw)});
       continue;
      }
      a.used=true;a.focus=false;a.ultra=false;emit('special',id);
      // Two logical shots, selected opponent then other living opponent; fallback
      // to the survivor matches the bot's dead-target substitution.
      const other=this.living(1-a.team).find(x=>x.id!==b.id)||b;
      for(const wanted of [b.id,other.id]){const t=select(a,wanted);if(t&&a.hp>0)strike(a,t,true);}
      if(a.hp>0){a.focus=true;emit('focus',id);}
     }else strike(a,b);
    }else if(p.action==='REST'){deferred.push(id);emit('rest-start',id);}else emit('guard',id);
   }
   for(const id of deferred){const a=this.actors[id];if(a.hp<=0)continue;if(targeted.has(id))emit('interrupted',id);else{const heal=Math.min(a.max-a.hp,20+a.con*3);a.hp+=heal;if(a.focus)a.ultra=true;a.focus=true;emit('rest',id,{heal});}}
   for(const a of this.actors){a.guard=false;a.dodgeBonus=0;a.noCrit=false}
   emit('round-end',null);
   const winner=this.winner(),result={events,plans:copy(plans),winner,finished:winner!==null,state:this.snapshot()};
   if(!result.finished){this.round++;this.prepare();}result.next=this.snapshot();return result;
  }
 }
 const api={Battle,roundEven,heroes};if(typeof module!=='undefined')module.exports=api;else root.TeamRules=api;
})(typeof window!=='undefined'?window:globalThis);
