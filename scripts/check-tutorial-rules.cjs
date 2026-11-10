const assert=require('node:assert/strict');
const {TutorialBattle}=require('../battle-tutorial/rules.js');
let b=new TutorialBattle();
assert.equal(b.actors[0].max,200);
let r=b.resolve('REST');assert.equal(r.next.actors[0].hp,150);assert.equal(r.next.actors[0].focus,true);
r=b.resolve('DEFEND');assert.equal(r.next.actors[0].hp,150);assert.equal(r.next.actors[1].hp,160);assert.equal(r.next.actors[0].focus,true);assert.equal(r.events.find(e=>e.type==='attack').reflected,40);
r=b.resolve('ATTACK');assert.equal(r.next.actors[1].hp,10);assert.equal(r.next.actors[0].focus,false);assert.ok(r.events.some(e=>e.type==='interrupted'&&e.actor===1));
r=b.resolve('ATTACK');assert.equal(r.finished,true);assert.equal(r.winner,0);assert.ok(b.complete());assert.deepEqual(Object.fromEntries(['rest','parry','focus'].map(k=>[k,b.goals[k]])),{rest:true,parry:true,focus:true});
assert.throws(()=>b.resolve('ATTACK'),/invalid/);
b=new TutorialBattle('potion');r=b.resolve('REST');assert.ok(r.finished);assert.equal(r.winner,1);assert.equal(b.actors[0].hp,0);assert.equal(b.actors[0].focus,false);
b=new TutorialBattle('potion');r=b.resolve('ATTACK','potion');assert.equal(r.events[0].type,'auxiliary');assert.equal(r.events[0].state.actors[0].hp,95);assert.equal(r.events[0].heal,50);assert.equal(r.next.actors[0].hp,45);assert.equal(r.next.actors[1].hp,150);assert.equal(b.resources.potions,0);assert.ok(b.goals.potion);
let snapshot=b.snapshot();assert.throws(()=>b.resolve('ATTACK','potion'),/no potion/);assert.deepEqual(b.snapshot(),snapshot);
b=new TutorialBattle('potion');snapshot=b.snapshot();assert.throws(()=>b.resolve('SPECIAL','potion'));assert.deepEqual(b.snapshot(),snapshot);assert.throws(()=>b.resolve('ATTACK',['potion','dose']));assert.deepEqual(b.snapshot(),snapshot);
b.actors[0].hp=195;r=b.resolve('DEFEND','potion');assert.equal(r.events[0].heal,5);assert.equal(b.resources.potions,0);assert.equal(r.next.actors[0].hp,200);assert.equal(r.next.actors[1].hp,160);
b=new TutorialBattle('alchemist');assert.throws(()=>b.resolve('DEFEND','dose'),/no dose/);r=b.resolve('REST');assert.deepEqual(b.resources,{potions:1,doses:1,created:1});assert.ok(r.events.some(e=>e.createdDose));r=b.resolve('DEFEND','dose');assert.equal(r.events[0].heal,40);assert.equal(r.next.actors[0].hp,190);assert.equal(r.next.actors[0].focus,true);assert.deepEqual(b.resources,{potions:1,doses:0,created:1});assert.ok(b.goals.dose);
// A full store blocks creation; the lifetime cap persists after spending.
b=new TutorialBattle('alchemist');b.intent=()=> 'DEFEND';b.resolve('REST');b.resolve('REST');assert.equal(b.resources.created,1);assert.equal(b.actors[0].ultra,true);b.resolve('DEFEND','dose');b.resolve('REST');assert.equal(b.resources.created,2);b.resolve('DEFEND','dose');b.resolve('REST');assert.equal(b.resources.doses,0);assert.equal(b.resources.created,2);
// Ultra Focus bypasses the guard. Normal Focus breaks it for the overflow.
b=new TutorialBattle();b.actors[0].focus=true;r=b.resolve('ATTACK');assert.equal(r.events.find(e=>e.type==='attack').outcome,'break');assert.equal(r.next.actors[1].hp,160);
b=new TutorialBattle();b.actors[0].focus=b.actors[0].ultra=true;r=b.resolve('ATTACK');assert.equal(r.events.find(e=>e.type==='attack').outcome,'ultra');assert.equal(r.next.actors[1].hp,100);
console.log('Tutorial rules: HP/Focus/Parry/Rest, real defeat, potion ordering/cap/once, dose creation/cap/slot, validation atomicity and Ultra Focus passed.');
