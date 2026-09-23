/* Local 1v1, unequipped practice port. NOT an authoritative account combat API.
 * Sources: combat_rules.py; main.py duel ATTACK/DEFEND/REST and Jessie active.
 * RNG injected for parity tests. No inventory, rewards, guild or NPC passives. */
(function(root){
  'use strict';
  const clone=x=>JSON.parse(JSON.stringify(x));
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const chance=a=>Math.min(100,a.agi<=10?a.agi:10+Math.floor((a.agi-10)/3));
  const base=(a,roll)=>(4*a.str+roll)*(a.focus?2:1)*(1+a.agi*.0175);
  const fighter=(id,stats)=>{const a={id};for(const k of ['str','agi','con'])a[k]=clamp(Math.trunc(Number(stats[k])||0),0,60);return {...a,max:50+a.con*15,hp:50+a.con*15,focus:false,ultra:false,meter:0,rank:0,used:false};};
  class Battle {
    constructor(hero={str:10,agi:12,con:10},enemy={str:12,agi:8,con:12},rng=Math.random){this.rng=rng;this.actors=[fighter(0,hero),fighter(1,enemy)];this.round=1;this.prepare();}
    roll(n){return 1+Math.floor(this.rng()*n);}
    prepare(){const alive=this.actors.filter(a=>a.hp>0);if(alive.length<2)return;const wait=Math.min(...alive.map(a=>(100-a.meter)/(1+a.agi)));const ties=alive.map(()=>this.rng());for(const a of alive){a.meter=Math.min(100,a.meter+(1+a.agi)*wait);a.initiative=Math.floor(a.meter+.5);}this.order=alive.map(a=>a.id).sort((x,y)=>this.actors[y].meter-this.actors[x].meter||this.actors[y].agi-this.actors[x].agi||ties[y]-ties[x]);this.order.forEach((id,i)=>this.actors[id].rank=i+1);}
    snapshot(){return clone({actors:this.actors,round:this.round,order:this.order});}
    chooseEnemy(){const a=this.actors[1];if(a.focus||a.ultra)return 'ATTACK';const n=this.rng();return n<(a.hp<a.max*.6?.27:.16)?'REST':n<.45?'DEFEND':'ATTACK';}
    resolve(choice,enemyChoice){
      if(this.actors.some(a=>a.hp<=0))throw Error('finished');
      if(!['ATTACK','DEFEND','REST','SPECIAL'].includes(choice)||choice==='SPECIAL'&&this.actors[0].used)throw Error('invalid action');
      const actions=[choice,enemyChoice||this.chooseEnemy()];if(!['ATTACK','DEFEND','REST'].includes(actions[1]))throw Error('invalid opponent');
      const events=[],targeted=[0,0],deferred=[];
      const emit=(type,actor,extra={})=>{const e={type,actor,...extra,state:this.snapshot()};events.push(e);return e;};
      const damage=(a,n)=>{const amount=Math.min(a.hp,Math.max(0,Math.trunc(n)));a.hp-=amount;return amount;};
      const strike=(a,b,special=false)=>{
        targeted[b.id]++;const ultra=!special&&a.ultra;let crit=false,outcome='hit',amount=0,reflected=0;
        if(!ultra&&this.roll(100)<=chance(b)){a.focus=special?a.focus:false;return {outcome:'dodge',amount:0,reflected:0,crit:false};}
        let raw=base(a,4+this.roll(11));
        if(!special){crit=this.roll(100)<=chance(a);if(crit)raw*=1.5;a.focus=false;a.ultra=false;}
        raw=Math.max(1,Math.trunc(raw));
        if(ultra){outcome='ultra';amount=damage(b,raw);}
        else if(!special&&actions[b.id]==='DEFEND'){
          const diff=raw-(b.con*5+b.str);
          if(diff>0){outcome='break';amount=damage(b,Math.max(1,Math.trunc(diff-b.agi*2.5)));}
          else{outcome='parry';reflected=damage(a,b.con*3+b.str);}
        }else{
          if(!special&&actions[b.id]==='REST'){raw=Math.trunc(raw*1.5);outcome='vulnerable';}
          amount=damage(b,Math.max(1,Math.trunc(raw-b.agi*2.5)));
        }
        return {outcome,amount,reflected,crit};
      };
      for(const id of this.order){const a=this.actors[id],b=this.actors[1-id],action=actions[id];if(a.hp<=0)continue;
        if(action==='ATTACK'||action==='SPECIAL'){
          if(a.rank===1)a.meter=0;if(b.hp<=0)continue;
          if(action==='SPECIAL'){
            a.used=true;a.focus=false;a.ultra=false;const hits=[];
            for(let i=0;i<2&&b.hp>0;i++)hits.push({...strike(a,b,true),state:this.snapshot()});
            a.focus=true;emit('special',id,{hits});
          }else emit('attack',id,strike(a,b));
        }else if(action==='REST'){deferred.push(id);emit('rest-start',id);}
        else emit('guard',id);
      }
      for(const id of deferred){const a=this.actors[id];if(a.hp<=0)continue;if(targeted[id])emit('interrupted',id);else{const heal=Math.min(a.max-a.hp,20+3*a.con);a.hp+=heal;if(a.focus)a.ultra=true;a.focus=true;emit('rest',id,{heal});}}
      const finished=this.actors.some(a=>a.hp<=0);const result={events,actions,finished,winner:finished?(this.actors[0].hp>0?0:1):null,state:this.snapshot()};
      if(!finished){this.round++;this.prepare();}result.next=this.snapshot();return result;
    }
  }
  const api={Battle,chance,base,fighter};if(typeof module!=='undefined')module.exports=api;else root.PracticeRules=api;
})(typeof window!=='undefined'?window:globalThis);
