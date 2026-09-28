/* Shared no-profile animation demo rules. Guardian is a protagonist, not a skin;
 * no equipped skill is simulated here. Live rooms use the player's server loadout. */
(function(root){
 'use strict';
 const R=typeof module==='object'?require('../battle-practice/rules.js'):root.PracticeRules;
 const stats={str:12,agi:10,con:14},enemy={str:10,agi:6,con:15};
 class Battle extends R.Battle{
  constructor(rng=Math.random){super(stats,enemy,rng)}
  resolve(action,opponent){if(!['ATTACK','DEFEND','REST'].includes(action))throw Error('unsupported guardian action');return super.resolve(action,opponent)}
 }
 const api={Battle,stats,enemy};
 if(typeof module==='object')module.exports=api;else root.GuardianRules=api;
})(typeof window==='object'?window:globalThis);
