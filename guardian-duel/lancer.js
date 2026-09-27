/* Guardian demo animation metadata. Coordinates in source pixels. */
const LANCER_ACTIONS = {
  idle: {src:'../lancero-v2/idle.png',scale:.70,frames:[
    [0,0,512,512,315,504],[512,0,512,512,278,504],[1024,0,512,512,246,504],
    [0,512,512,512,315,494],[512,512,512,512,278,494],[1024,512,512,512,246,494]
  ],sequence:[[0,550],[1,350],[4,450],[3,350],[0,550]],loop:true},
  hurt: {src:'hurt.png',scale:.60,frames:[
    [150,0,410,610,230,600],[750,0,450,610,260,600],
    [150,615,410,620,230,609],[780,615,390,620,210,609]
  ],sequence:[[0,100],[1,150],[2,200],[3,200]],loop:false},
  rest: {src:'rest.png',scale:.70,frames:[
    [0,0,512,512,315,504],[512,0,512,512,284,504],[1024,0,512,512,263,504],
    [0,512,512,512,315,496],[512,512,512,512,284,496],[1024,512,512,512,263,496]
  ],sequence:[[0,160],[1,260],[2,430],[1,360],[2,430],[3,260],[4,240],[5,200]],loop:false,
  markers:[{at:1900,event:'rest-complete',frame:4,point:[800,740]}]},
  attack: {src:'attack.png',scale:1,frames:[
    [130,0,260,390,145,376],[620,0,340,390,150,376],
    [60,400,470,330,160,318],[580,400,500,330,180,318],
    [0,755,565,292,200,287],[575,755,511,292,185,287],
    [70,1060,460,370,170,345],[675,1040,260,390,125,366]
  ],sequence:[[0,140],[1,180],[2,210],[3,260],[4,85],[5,110],[6,220],[7,220]],loop:false,
  markers:[{at:875,event:'visual-impact',frame:4,point:[540,860]}]},
  guard: {src:'guard.png',scale:.98,frames:[
    [260,0,230,370,130,364],[990,0,380,370,155,362],
    [250,340,370,365,150,355],[1000,340,370,365,160,355],
    [250,690,370,334,150,324],[1050,680,300,344,140,334]
  ],
  // The generated rows interleave: lower spear tips begin before upper boots
  // end. A rectangular cell alone therefore includes pieces of another pose.
  // Source-space clip polygons isolate each drawing without moving its pivot.
  clips:[
    null,
    [[990,0],[1370,0],[1370,330],[1280,330],[1280,370],[990,370]],
    [[250,380],[490,380],[530,340],[620,340],[620,680],[540,680],[540,705],[250,705]],
    [[1000,380],[1240,380],[1290,340],[1370,340],[1370,705],[1140,705],[1140,680],[1090,680],[1090,705],[1000,705]],
    [[250,710],[530,710],[550,690],[620,690],[620,1024],[250,1024]],
    [[1050,710],[1090,710],[1090,680],[1140,680],[1140,710],[1350,710],[1350,1024],[1050,1024]]
  ],sequence:[[0,180],[1,250],[2,450],[1,450],[2,450],[3,140],[4,300],[5,220]],loop:false,
  markers:[{at:1780,event:'block-contact',frame:3,point:[1140,535]}]}
};
for (const [key, pack] of Object.entries(LANCER_ACTIONS)) pack.src='/guardian-duel/assets/'+key+'.png';
const cells=(anchors,floors)=>anchors.map((x,i)=>[i%3*512,Math.floor(i/3)*512,512,512,x,floors[i]]);
Object.assign(LANCER_ACTIONS,{
 motion:{src:'/guardian-duel/assets/motion.png',scale:.70,frames:cells([230,225,240,250,250,250],[455,455,455,440,440,440]),sequence:[[0,100],[1,130],[2,130],[3,160],[4,160],[5,160]],loop:false},
 activation:{src:'/guardian-duel/assets/activation.png',scale:.70,frames:cells([315,285,275,315,285,275],[504,504,504,496,496,496]),sequence:[[0,180],[1,230],[2,280],[3,300],[4,230],[5,200]],loop:false},
 victory:{src:'/guardian-duel/assets/victory.png',scale:.70,frames:cells([300,270,265,300,270,265],[504,504,504,496,496,496]),sequence:[[0,180],[1,200],[2,240],[3,300],[4,320],[5,700]],loop:false},
 defeat:{src:'/guardian-duel/assets/defeat.png',scale:.70,frames:cells([335,310,240,285,255,255],[504,504,504,450,425,425]),sequence:[[0,170],[1,240],[2,330],[3,370],[4,320],[5,800]],loop:false}
});
// The third dash drawing extends left of its nominal cell at boot height.
LANCER_ACTIONS.motion.frames[2]=[992,0,544,512,272,455];
LANCER_ACTIONS.motion.clips=[null,
 [[512,0],[1024,0],[1024,300],[970,300],[970,512],[512,512]],
 [[1024,0],[1536,0],[1536,512],[992,512],[992,330],[1024,330]]];
if(typeof module!=='undefined')module.exports=LANCER_ACTIONS;
