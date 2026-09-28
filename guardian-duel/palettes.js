/* Cosmetic recipes only. Animation geometry, timing and combat data are inherited. */
(function(root){
 'use strict';
 const profiles={lancer:{version:1,materials:{
  cloth:{hue:[165,250],saturation:[.08,.20],value:[.015,.075]},
  sash:{hue:[315,367],saturation:[.10,.23],value:[.035,.10],region:[0,.32,1,1],regions:{motion:{4:[0,0,.6,1]},defeat:{4:[0,.32,.65,1],5:[0,.32,.65,1]}}}
 },variants:{crimson:{es:'Carmesí',en:'Crimson',swatches:['#842f40','#e6d4af'],materials:{
  cloth:['#160f18','#842f40','#d87880'],
  sash:['#241d20','#b5a183','#fff0cd']
 }}}}};
 if(typeof module!=='undefined')module.exports=profiles;
 else root.GuardianPalettes=profiles;
})(typeof globalThis!=='undefined'?globalThis:this);
