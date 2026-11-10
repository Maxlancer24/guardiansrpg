/* Bounded training scenarios. Shared resolver; fixed AGI 0 / roll 10 removes
 * crit/dodge randomness. Live accounts, gear and rewards are never accessed. */
(function(root){
 'use strict';
 const R=typeof module==='object'?require('../battle-practice/rules.js'):root.PracticeRules;
 const copy=x=>JSON.parse(JSON.stringify(x));
 const modes=['basics','potion','alchemist','practice'];
 class TutorialBattle extends R.Battle{
  constructor(mode='basics'){
   if(!modes.includes(mode))throw Error('unknown lesson');
   super({str:10,agi:0,con:10},{str:10,agi:0,con:10},()=>.5);
   this.mode=mode;this.resources={potions:mode==='potion'||mode==='alchemist'?1:0,doses:0,created:0};
   this.goals={rest:false,parry:false,focus:false,potion:false,prepared:false,dose:false};
   this.actors[0].hp=mode==='potion'?45:100;
  }
  snapshot(){return {...super.snapshot(),resources:copy(this.resources||{}),goals:copy(this.goals||{}),mode:this.mode};}
  intent(){return (this.mode==='potion'?['ATTACK','DEFEND','REST','ATTACK']:['DEFEND','ATTACK','REST','ATTACK'])[(this.round-1)%4];}
  resolve(action,auxiliary=null){
   // Validate before any resource or HP mutation. There is one auxiliary slot.
   if(!['ATTACK','DEFEND','REST'].includes(action)||this.actors.some(a=>a.hp<=0))throw Error('invalid action');
   if(auxiliary!==null&&!['potion','dose'].includes(auxiliary))throw Error('invalid auxiliary');
   if(auxiliary==='potion'&&!this.resources.potions)throw Error('no potion');
   if(auxiliary==='dose'&&(this.mode!=='alchemist'||!this.resources.doses))throw Error('no dose');
   const events=[],a=this.actors[0],wasFocus=a.focus,wasUltra=a.ultra;
   if(auxiliary){
    const heal=Math.min(a.max-a.hp,auxiliary==='potion'?50:40);a.hp+=heal;
    this.resources[auxiliary==='potion'?'potions':'doses']--;
    this.goals[auxiliary]=true;
    events.push({type:'auxiliary',actor:0,kind:auxiliary,heal,state:this.snapshot()});
   }
   const result=super.resolve(action,this.intent());
   const presentationResources=copy(this.resources);
   for(const event of result.events){
    if(event.type==='attack'&&event.actor===0&&(wasFocus||wasUltra))this.goals.focus=true;
    if(event.type==='attack'&&event.actor===1&&event.outcome==='parry')this.goals.parry=true;
    if(event.type==='rest'&&event.actor===0){
     this.goals.rest=true;
     if(this.mode==='alchemist'&&this.resources.created<2&&this.resources.doses<1){
      this.resources.created++;this.resources.doses++;this.goals.prepared=true;
      Object.assign(presentationResources,this.resources);event.createdDose=true;
     }
    }
    event.state.resources=copy(presentationResources);
    events.push(event);
   }
   result.events=events;result.next=this.snapshot();
   result.state.resources=copy(this.resources);result.state.goals=copy(this.goals);
   return result;
  }
  objectiveKeys(){return this.mode==='basics'?['rest','parry','focus']:this.mode==='potion'?['potion']:this.mode==='alchemist'?['prepared','dose']:[];}
  complete(){return this.objectiveKeys().every(k=>this.goals[k])&&this.actors[0].hp>0&&this.actors[1].hp===0;}
 }
 const api={TutorialBattle,modes};if(typeof module==='object')module.exports=api;else root.GuardiansTutorialRules=api;
})(typeof window==='object'?window:globalThis);
