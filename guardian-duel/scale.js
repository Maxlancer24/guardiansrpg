/* Anatomical scale, never weapon/cape bounding boxes. Reference: protagonist 1v1.
 * At 1280 scene units: Jessie ~214px crown-to-sole (excluding ponytail),
 * Garrick ~230px, Zoe ~241px. Preserve these existing protagonist renderers.
 * New player appearances fit that band; character build need not be identical.
 */
(function(root){
 const profiles={
  jadewind:{sourceBodyHeight:506,idleScale:1,targetHeight:230},
  lancer:{sourceBodyHeight:440,idleScale:.70,targetHeight:230},
  explorer:{sourceBodyHeight:468,idleScale:.67,targetHeight:225},
  duelist:{sourceBodyHeight:465,idleScale:.67,targetHeight:230},
  sentinel:{sourceBodyHeight:473,idleScale:.67,targetHeight:228},
  vanguard:{sourceBodyHeight:481,idleScale:.67,targetHeight:235},
  arcanist:{sourceBodyHeight:470,idleScale:.67,targetHeight:230},
  pugilist:{sourceBodyHeight:489,idleScale:.67,targetHeight:232},
  tracker:{sourceBodyHeight:500,idleScale:.67,targetHeight:228},
  custodian:{sourceBodyHeight:494,idleScale:.67,targetHeight:235},
  wanderer:{sourceBodyHeight:491,idleScale:.67,targetHeight:228},
  guardian:{sourceBodyHeight:495,idleScale:.67,targetHeight:230},
  alchemist:{sourceBodyHeight:495,idleScale:.67,targetHeight:228},
  brisa:{sourceBodyHeight:492,idleScale:1,targetHeight:228}
 };
 const api={profiles,
  sceneSize(width,cssWidth){return 230*width/1280*(cssWidth<=700?1.5:1)},
  factor(avatar,size){const p=profiles[avatar];return size/230*p.targetHeight/(p.sourceBodyHeight*p.idleScale)}
 };
 if(typeof module!=='undefined')module.exports=api;else root.GuardianScale=api;
})(typeof window!=='undefined'?window:globalThis);
