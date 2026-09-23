/* Demo-only encounter configuration; the shared bot-parity rules are unchanged. */
(() => {
 const hero={str:9,agi:12,con:14},enemy={str:10,agi:6,con:15};
 class DemoBattle extends PracticeRules.Battle {
  constructor(rng=Math.random){super(hero,enemy,rng);}
  chooseEnemy(){return this.round>=9?'ATTACK':['ATTACK','DEFEND','ATTACK','REST','ATTACK','DEFEND'][(this.round-1)%6];}
 }
 window.GuardiansDemo={Battle:DemoBattle,hero,enemy};
})();
