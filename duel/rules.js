/* Local, unequipped demo. Shared formulas from PracticeRules; no accounts/rewards.
 * Zoe: main.py:17028; Garrick: existing TeamRules protection semantics. */
(function(root){
 'use strict';
 const R=typeof module!=='undefined'?require('../battle-practice/rules.js'):root.PracticeRules;
 const heroes={jessie:{str:9,agi:12,con:14},garrick:{str:14,agi:4,con:12},zoe:{str:14,agi:22,con:14}};
 const copy=x=>JSON.parse(JSON.stringify(x)),even=n=>{const f=Math.floor(n);return n-f===.5?(f%2?f+1:f):Math.round(n)};
 class Battle extends R.Battle{
  constructor(key='zoe',rng=Math.random){if(!heroes[key])throw Error('invalid hero');super(heroes[key],{str:10,agi:6,con:15},rng);this.actors.forEach((a,i)=>Object.assign(a,{key:i?'warden':key,team:i,guard:false,dodgeBonus:0,noCrit:false}));}
  winner(){return this.actors.every(a=>a.hp>0)?null:this.actors[0].hp>0?0:1;}
  chooseEnemy(){return this.round>=9?'ATTACK':['ATTACK','DEFEND','ATTACK','REST','ATTACK','DEFEND'][(this.round-1)%6];}
  resolve(choice,enemyChoice=this.chooseEnemy()){
   if(this.winner()!==null)throw Error('finished');
   if(!['ATTACK','DEFEND','REST','SPECIAL'].includes(choice)||choice==='SPECIAL'&&this.actors[0].used)throw Error('invalid action');
   if(!['ATTACK','DEFEND','REST'].includes(enemyChoice))throw Error('invalid opponent');
   const actions=[choice,enemyChoice],events=[],targeted=new Set(),deferred=[];
   const emit=(type,actor,extra={})=>events.push({type,actor,...extra,state:this.snapshot()});
   const damage=(a,n,parry=false)=>{const before=a.hp;let value=Math.max(0,Math.trunc(n));if(a.guard&&!parry&&value)value=Math.max(1,even(value*.65));a.hp=Math.max(0,a.hp-value);let lastStand=false;if(a.guard&&a.hp===0){a.hp=1;a.guard=false;lastStand=true;}return {amount:before-a.hp,lastStand}};
   const hero=this.actors[0];
   if(choice==='SPECIAL'&&hero.key==='garrick'){hero.used=true;hero.guard=true;emit('protection',0);}
   const strike=(a,b,special=false)=>{
    targeted.add(b.id);const ultra=!special&&a.ultra;let outcome='hit',crit=false;
    if(!ultra&&this.roll(100)<=Math.min(100,R.chance(b)+b.dodgeBonus)){if(!special){a.focus=false;a.ultra=false;}emit('attack',a.id,{target:b.id,special,outcome:'dodge',amount:0});return;}
    let raw=R.base(a,4+this.roll(11));if(!special){crit=!a.noCrit&&this.roll(100)<=R.chance(a);if(crit)raw*=1.5;a.focus=false;a.ultra=false;}raw=Math.max(1,Math.trunc(raw));
    let n;if(ultra){outcome='ultra';n=raw;}
    else if(!special&&(b.guard||actions[b.id]==='DEFEND')){const diff=raw-(b.con*5+b.str);if(diff<=0){emit('attack',a.id,{target:b.id,special,outcome:'parry',amount:0});emit('counter',b.id,{target:a.id,outcome:'hit',...damage(a,b.con*3+b.str,true)});return;}outcome='break';n=Math.max(1,Math.trunc(diff-b.agi*2.5));}
    else{if(!special&&!b.guard&&actions[b.id]==='REST'){raw=Math.trunc(raw*1.5);outcome='vulnerable';}n=Math.max(1,Math.trunc(raw-b.agi*2.5));}
    emit('attack',a.id,{target:b.id,special,outcome,crit,...damage(b,n)});
   };
   for(const id of this.order){const a=this.actors[id],b=this.actors[1-id],action=actions[id];if(a.hp<=0||b.hp<=0)continue;
    if(action==='SPECIAL'&&a.key==='garrick')continue;
    if(action==='SPECIAL'||action==='ATTACK'){
     if(a.rank===1)a.meter=0;
     if(action==='ATTACK'){strike(a,b);continue;}
     // Zoe's bot branch calculates base damage BEFORE consuming Focus.
     const zoeBase=a.key==='zoe'?Math.max(1,Math.trunc(R.base(a,4+this.roll(11)))):0;
     a.used=true;a.focus=false;a.ultra=false;
     if(a.key==='zoe'){
      b.focus=false;b.ultra=false;b.noCrit=true;a.dodgeBonus=20;
      emit('awareness',id,{target:b.id});targeted.add(b.id);
      // Bot Zoe active calls apply_damage directly: no normal dodge/parry/crit roll.
      const raw=Math.max(1,Math.trunc(Math.max(1,Math.trunc(zoeBase*.75))-b.agi*2.5));
      emit('attack',id,{target:b.id,special:true,outcome:'hit',...damage(b,raw)});
     }else{
      emit('special',id);for(let i=0;i<2&&b.hp>0;i++)strike(a,b,true);if(a.hp>0){a.focus=true;emit('focus',id);}
     }
    }else if(action==='REST'){deferred.push(id);emit('rest-start',id);}else emit('guard',id);
   }
   for(const id of deferred){const a=this.actors[id];if(a.hp<=0)continue;if(targeted.has(id))emit('interrupted',id);else{const heal=Math.min(a.max-a.hp,20+3*a.con);a.hp+=heal;if(a.focus)a.ultra=true;a.focus=true;emit('rest',id,{heal});}}
   for(const a of this.actors){a.guard=false;a.dodgeBonus=0;a.noCrit=false;}
   emit('round-end',null);const winner=this.winner(),result={events,actions:copy(actions),finished:winner!==null,winner,state:this.snapshot()};if(!result.finished){this.round++;this.prepare();}result.next=this.snapshot();return result;
  }
 }
 const api={Battle,heroes};if(typeof module!=='undefined')module.exports=api;else root.DuelRules=api;
})(typeof window!=='undefined'?window:globalThis);
