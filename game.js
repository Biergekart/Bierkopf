
const SUITS=['Eichel','Gras','Herz','Schellen'];
const SYMBOL={Eichel:'🌰',Gras:'🍃',Herz:'♥',Schellen:'🔔'};
const EYES={Ass:11,'10':10,'König':4,Ober:3,Unter:2,'9':0};
const COLOR_ORDER=['Ass','10','König','9'];
const TRUMP=[
['Eichel','Ober'],['Gras','Ober'],['Herz','Ober'],['Schellen','Ober'],
['Eichel','Unter'],['Gras','Unter'],['Herz','Unter'],['Schellen','Unter'],
['Herz','Ass'],['Herz','10'],['Herz','König'],['Herz','9']
];
let hands,turn,trick,trickIndex,eyes,score,startPlayer,roundNo,spritz,re,finished=false;

function makeDeck(){
 const d=[];
 ['Eichel','Gras','Schellen'].forEach(s=>['Ass','10','König','9'].forEach(r=>d.push({s,r})));
 ['Ober','Unter'].forEach(r=>SUITS.forEach(s=>d.push({s,r})));
 ['Ass','10','König','9'].forEach(r=>d.push({s:'Herz',r}));
 return d;
}
function shuffle(a){for(let i=a.length-1;i;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}}
function isTrump(c){return c.r==='Ober'||c.r==='Unter'||c.s==='Herz'}
function trumpPower(c){return TRUMP.findIndex(x=>x[0]===c.s&&x[1]===c.r)}
function team(p){return p%2===0?0:1}
function legal(c,h){
 if(!trick.length)return true;
 const lead=trick[0].c;
 if(isTrump(lead)) return isTrump(c)||!h.some(isTrump);
 const hasLead=h.some(x=>!isTrump(x)&&x.s===lead.s);
 return !hasLead || (!isTrump(c)&&c.s===lead.s);
}
function beats(a,b){
 const at=isTrump(a),bt=isTrump(b);
 if(at&&!bt)return true;if(!at&&bt)return false;
 if(at&&bt)return trumpPower(a)<trumpPower(b);
 return a.s===b.s&&COLOR_ORDER.indexOf(a.r)<COLOR_ORDER.indexOf(b.r);
}
function currentWinner(){
 let best=trick[0];
 trick.slice(1).forEach(x=>{if(beats(x.c,best.c))best=x});
 return best;
}
function cardName(c){return `${c.r} ${c.s}`}
function showOverlay(title,text,cb){
 modalTitle.textContent=title;modalText.textContent=text;overlay.classList.remove('hidden');
 modalBtn.onclick=()=>{overlay.classList.add('hidden');if(cb)cb()};
}
function newGame(){
 score=[0,0];roundNo=0;startPlayer=Math.floor(Math.random()*4);finished=false;newRound(true);
}
function newRound(first){
 roundNo++; const d=makeDeck();shuffle(d);
 hands=[[],[],[],[]];for(let i=0;i<24;i++)hands[i%4].push(d[i]);
 hands.forEach(h=>h.sort((a,b)=>(isTrump(b)-isTrump(a))||a.s.localeCompare(b.s)||COLOR_ORDER.indexOf(a.r)-COLOR_ORDER.indexOf(b.r)));
 trick=[];trickIndex=0;eyes=[0,0];spritz=null;re=null;
 if(!first)startPlayer=(startPlayer+1)%4; turn=startPlayer;
 announcement.textContent=`Runde ${roundNo} – ${turn===0?'Du':'Spieler '+(turn+1)} spielt aus!`;
 render(); if(turn!==0)setTimeout(aiTurn,800);
}
function play(p,i){
 if(finished||p!==turn)return;
 const c=hands[p][i];if(!legal(c,hands[p]))return;
 hands[p].splice(i,1);trick.push({p,c});
 announcement.textContent=`${p===0?'Du':p===1?'Sepp':p===2?'Franz':'Xaver'} spielt ${cardName(c)}.`;
 turn=(turn+1)%4;render();
 if(trick.length===4)setTimeout(finishTrick,700);
 else if(turn!==0)setTimeout(aiTurn,650);
}
function aiTurn(){
 if(finished||turn===0)return;
 const h=hands[turn],legalCards=h.filter(c=>legal(c,h));
 // Simple prototype AI: cheapest legal card, preferring a cheap winning card if possible
 let choice=legalCards.slice().sort((a,b)=>EYES[a.r]-EYES[b.r])[0];
 if(trick.length){
   const best=currentWinner().c;
   const winners=legalCards.filter(c=>beats(c,best));
   if(winners.length)choice=winners.sort((a,b)=>EYES[a.r]-EYES[b.r])[0];
 }
 play(turn,h.indexOf(choice));
}
function finishTrick(){
 const win=currentWinner().p;
 const value=trick.reduce((s,x)=>s+EYES[x.c.r],0);
 eyes[team(win)]+=value;trick=[];trickIndex++;
 announcement.textContent=`🏆 ${win===0?'Du':win===1?'Sepp':win===2?'Franz':'Xaver'} gewinnt den Stich mit ${value} Augen!`;
 if(trickIndex===6){setTimeout(finishRound,800);return}
 turn=win;render();if(turn!==0)setTimeout(aiTurn,700);
}
function finishRound(){
 const winner=eyes[0]>=61?0:1, loser=1-winner;
 let mult=eyes[loser]===0?3:(eyes[loser]<31?2:1);
 if(spritz!==null)mult*=2;if(re!==null)mult*=2;
 score[winner]+=mult;
 const extra=eyes[loser]===0?'Schwarz ×3':eyes[loser]<31?'Schneider ×2':'normal';
 showOverlay('🍺 Runde beendet',`Team ${winner===0?'A (Du + Franz)':'B (Sepp + Xaver)'} gewinnt ${eyes[0]} : ${eyes[1]} Augen. ${extra}${spritz!==null?' · Spritzen ×2':''}${re!==null?' · Re ×2':''} → +${mult} Punkte.`,()=>{
   if(score[winner]>=21){finished=true;render();showOverlay('🏆 Spiel gewonnen!',`Team ${winner===0?'A':'B'} hat ${score[winner]} Punkte erreicht!`,()=>newGame());}
   else newRound(false);
 });
 render();
}
function announceSpritz(){
 if(trickIndex!==0||trick.length===0||spritz!==null)return;
 spritz=0;announcement.textContent='🍺 DU SAGST: SPRITZEN! ×2';render();
}
function announceRe(){
 if(spritz===null||re!==null||trickIndex!==0)return;
 re=0;announcement.textContent='↩️ DU SAGST: RE! ×2';render();
}
function render(){
 scoreA.textContent=score[0];scoreB.textContent=score[1];round.textContent=roundNo;trickNo.textContent=trickIndex+1;
 turnText.textContent=finished?'Spiel beendet':turn===0?'Du bist dran':(turn===1?'Sepp':turn===2?'Franz':'Xaver')+' ist dran';
 status.textContent=finished?'🏆 Partie beendet':turn===0?'👉 Du bist dran – wähle eine gültige Karte.':'🤖 Der Computer überlegt...';
 eyeInfo.textContent=`${eyes[0]} Augen`;
 seppInfo.textContent=`${hands?.[1]?.length??6} Karten`;franzInfo.textContent=`${hands?.[2]?.length??6} Karten`;xaverInfo.textContent=`${hands?.[3]?.length??6} Karten`;
 const t=document.getElementById('trick');t.innerHTML='';
 for(let p=0;p<4;p++){const x=trick.find(z=>z.p===p);if(x){const d=document.createElement('div');d.className='played '+(x.c.s==='Herz'?'redcard':'');d.innerHTML=`<span>${x.c.r}</span><span class="symbol">${SYMBOL[x.c.s]}</span><small>P${p+1}</small>`;t.appendChild(d)}else{const d=document.createElement('div');d.className='empty-slot';t.appendChild(d)}}
 const h=document.getElementById('hand');h.innerHTML='';
 hands?.[0]?.forEach((c,i)=>{const b=document.createElement('button');b.className='card '+((c.s==='Herz'||c.s==='Schellen')?'redcard':'');b.disabled=turn!==0||!legal(c,hands[0])||finished;b.innerHTML=`<span class="rank">${c.r}</span><span class="suit">${SYMBOL[c.s]}</span>`;b.onclick=()=>play(0,i);h.appendChild(b)});
 spritzBtn.disabled=!(turn===0&&trickIndex===0&&trick.length>0&&spritz===null);
 reBtn.disabled=!(turn===0&&trickIndex===0&&spritz!==null&&re===null);
}
spritzBtn.onclick=announceSpritz;reBtn.onclick=announceRe;restartBtn.onclick=newGame;
modalBtn.onclick=()=>overlay.classList.add('hidden');
newGame();
