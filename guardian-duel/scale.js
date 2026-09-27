/* Anatomical scale, never weapon/cape bounding boxes. Reference: protagonist 1v1.
 * At 1280 scene units: Jessie ~214px crown-to-sole (excluding ponytail),
 * Garrick ~230px, Zoe ~241px. Preserve these existing protagonist renderers.
 * New player appearances fit that band; character build need not be identical.
 */
(function(root){
 const profiles={
  lancer:{sourceBodyHeight:440,idleScale:.70,targetHeight:230},
  explorer:{sourceBodyHeight:468,idleScale:.67,targetHeight:225},
  duelist:{sourceBodyHeight:465,idleScale:.67,targetHeight:230},
  sentinel:{sourceBodyHeight:473,idleScale:.67,targetHeight:228},
  vanguard:{sourceBodyHeight:481,idleScale:.67,targetHeight:235}
 };
 const api={profiles,
  sceneSize(width,cssWidth){return 230*width/1280*(cssWidth<=700?1.5:1)},
  factor(avatar,size){const p=profiles[avatar];return size/230*p.targetHeight/(p.sourceBodyHeight*p.idleScale)}
 };
 if(typeof module!=='undefined')module.exports=api;else root.GuardianScale=api;
})(typeof window!=='undefined'?window:globalThis);
