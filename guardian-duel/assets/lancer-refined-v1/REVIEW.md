# Visual corrections — Lancer and Duelist

Built-in image tool, transparent_background=true. Original images preserved.

Saved assets: idle.png, attack.png, guard.png in this directory; corrected Duelist
attack at ../duelist-v1/attack-right-v2.png. The other Lancer poses are retained.

Lancer: replaced idle, attack and guard source sheets, maintaining original costume
and world scale. Old attack standing pose was about 310 source pixels; replacement
is about 393. Old guard was about 310; replacement about 450. Separate source scales
compensate for this without enlarging the actor in combat. Pixel counts are source
detail, not merely a resized copy. New crop masks exclude adjacent spear/boot pieces.

Duelist: the previous review missed the hand switch in the extended poses. The
new six-frame attack rotates the torso into a rear three-quarter view and keeps
the right shoulder/arm as the weapon arm through extension and recovery. Full
thrust still lands at 1235ms overall (875ms after approach), one rules hit.

Reviewed both complete contact-sheet renders at actual anatomical scale, including
the new masks, and all generated source sheets. Updated selector retina rendering
and support up to 3x mobile pixel density, keeping the 4-million-pixel backing cap.
Regression checks include source bounds, 59 rules battles, 24 simulated client
battles, timing, replay, selection, language and 2x/3x canvas dimensions.

This is image/native-canvas review, not a live browser/audio check.

# Exact prompts

## duelist

Edit/reference task identity-preserve. Create corrected RIGHT-HANDED rapier attack animation for EXACT Duelist in attached idle reference. Same adult slim man short tousled chestnut hair, wine burgundy sleeveless longcoat goldtrim, cream rolled sleeves, brown glovesboots and diagonalcheststrap charcoalpants. Character is RIGHT HANDED; his RIGHT shoulder is the near-camera shoulder appearing on LEFT of torso in reference idle. CRITICAL: During thrust rotate torso so we see the BACK of his burgundy vest/coat and his RIGHT SHOULDER foreground. The free LEFT arm extends backwards behindbody. Do NOT show frontal chest with far arm holding sword. Six sequential fullbody poses, 2 COLUMNS x3 ROWS on transparent1536x1536, widecells768x512. Wholefigureandlongthinrapier fit eachcell withpadding. SAME physical body/head scale everyframe (standingequivalent420px height), soleslocaly485. AllfaceRIGHT. Frame0 en-garde RIGHT hand across torso ready tothrust, freeleft handdown. Frame1 anticipation twisting away from camera, rightnear shoulder rotatesforward and rightelbowbent ready; freeleftarm begins movingback. Frame2 full powerful fencing lunge toRIGHT, BACK THREEQUARTER visible, RIGHT foregroundarm extends horizontally to right holding rapier, leftfree arm extendsleftbehind, rightfrontknee bent leftlegstretchedback. Frame3 settles same right-handedlunge backstillvisible. Frame4 rightelbow retracts sword backnearwaist torso unwinds back towardoriginal3/4. Frame5 recovery en-garde likeframe0. One thin silver straight blade attached goldcupguard, closedrightfist grippingonlyhandlebehindguard, no extra arm, no changinghands. Elegant smooth animecel shading professionalgame, no effects trails shadowsground textgrid. Truealpha.

## lancer-idle

Use case identity-preserve edit. Redraw the supplied Lancer idle animation sheet at premium clean anime RPG sprite quality, matching delicate linework and smooth cel-shading of modern illustrated 2D RPG characters, NOT pixelart, NOT chunky lowpoly facets or thickblack outlines. Preserve EXACT identity: youngadult athleticman tousled BLACK hair, teal long tunic rolled sleeves, single silver shoulderplate on RIGHT shoulder(imageleft), crossed brownchestbelts, burgundyred waist sash andclothpanels, charcoalpants, brown gloves, silver shin armoroverboots; long straight brownshaft spear silverdiamondpoint goldenfittings held RIGHT hand(imageleft), LEFT handfree. Same faceRIGHT3/4 adultnormalproportions. 6 fullbody IDLE poses strict3columns2rows. Highresolution3072x2048 transparentatlas; each1024cell, body crown-to-sole~840px, soleslocaly980, spearfullyinsidecell (do notcrop tip). Allposes exactsameanatomicalscale anchoredfeet. Frames0neutralalert;1smallinhale chest/shoulders;2exhale hair/sashfollow;3gentlebreathingreturn;4neutral;5neutralclosedeyelids forbriefblink. Subtle naturaldifferences notmajorposechanges. Finely drawn facehandsandarmor clean smooth contour antialiased, 2-3tonecelshading cloth readable edges not noisytexture. No new clothing, no exaggeratedmuscles, no glow haze shadows floorlabels orgrid. Truealphabackground. Preserveindividualfingers correctly wrappedaroundspearshaft. Twofeetplanted and spearfirm so no jitter.

## lancer-attack

Generate a replacement high-detail ATTACK animation atlas using this exact Lancer as model/style reference. Preserve appearance and adult anatomy: black tousledhair teal rolledsleevetunic single silver RIGHT shoulderplate imageleft, crossedbrownchestbelts redburgundysash charcoalpants brownleathergloves silvergreaves boots. Same clean anime painted/cel game look but fine crisp contours, nuanced cloth andmetal shading; absolutely NOpixelart jaggies. SIX fullbody sequential frames in2columns3rows on transparent1536x1536. Widecells768x512 fitFULLspear withpadding. Same headsize/body scale (standingcrownsoles420px) allframes solesy485. FaceRIGHT. 0 spear angledforward twohandedready;1 lowerhorizontalspear and loadbackleg torsoanticipation;2 powerful forward thrust spearTIP right handrearLEFT handforward oncontinuouswoodshaft, frontkneebends right, armsdrive shaft;3 extended thrustfollowthrough;4 recovertwogripandreturn;5 same firstreadypose. One long brownshaft spear silverdiamondpoint goldfittings, bothhands wrapcorrectlyaroundshaft consistenthandorder allframes, no shaftbreaks no armchanges. Spearalwaysfullyvisible withinowncell nooverlap; no text/noeffects/shadows/halo/ground/grid. True transparentalpha. Detailedface andsleekcontours equaltohighqualityanimeRPGsprites, preserve characterclothes.

## lancer-guard

Create high-detail PARRY DEFENSE sixframe atlas of exact reference Lancer. Preserve face blackhair, tealrolledsleevetunic, single silver rightshoulderplate imageleft, crossedbrownstraps, burgundysash, charcoalpants, browngloves silvergreaves boots, longbrownspear silverdiamondpoint goldfittings. Same adultnormalproportionscleanillustratedanime detailed smoothcelshading, thincrispoutlines no pixelart. 6fullbody poses3columns2rows1536x1024, cells512square, bodyheight430px each, solebaseline490. Spear angled UP RIGHT fitscell, continuousshaft andproperhandgrips, rightrearhandnearhip,leftforwardhandnearchest. Frames0 raising twohandedspear acrosschest;1 defensiveen-garde balancedknees;2 slightbreathheldguard;3 blockcontact torsoleansback spear braces diagonallyacrossbody;4 absorbpressurekneesflex;5 defensive recovery like1. Defensive only NOthrust orcounterattack. Sameheadsize andlimblength everyframe. Feetplanted, nooverlap betweencells, wholebody spearbladeandbuttvisible. True transparentbackground no halo, effects, groundshadows, labels orgrid. Make fine facialdetail armorhighlights clothingfolds more refined thanold lowresolutiongamesprites.

