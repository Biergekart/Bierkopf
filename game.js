const suits=["Eichel","Blatt","Herz","Schellen"];
const eyesValue={Ass:11,"10":10,König:4,Ober:3,Unter:2,"9":0};
let scores=[0,0], hands=[], trick=[], eyes=[0,0], turn=0, starter=0, trickNo=0, spritz=false, re=false;

function deck(){
  const d=[];
  ["Eichel","Blatt","Schellen"].forEach(s=>["Ass","10","König","9"].forEach(r=>d.push({s,r})));
  suits.forEach(s=>d.push({s,r:"Ober"}));
  suits.forEach(s=>d.push({s,r:"Unter"}));
  ["Ass","10","König","9"].forEach(r=>d.push({s:"Herz",r}));
  return d;
}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}}
function file(c){return `cards/${c.s.toLowerCase()}_${c.r.toLowerCase()}.svg`}
function isTrump(c){return c.r==="Ober"||c.r==="Unter"||c.s==="Herz"}
function trumpRank(c){
 const order=[
  ["Eichel","Ober"],["Blatt","Ober"],["Herz","Ober"],["Schellen","Ober"],
  ["Eichel","Unter"],["Blatt","Unter"],["Herz","Unter"],["Schellen","Unter"],
  ["Herz","Ass"],["Herz","10"],["Herz","König"],["Herz","9"]
 ];
 return order.findIndex(x=>x[0]===c.s&&x[1]===c.r);
}
function legal(c,h){
 if(!trick.length)return true;
 const lead=trick[0].c;
 if(isTrump(lead)) return isTrump(c)||!h.some(isTrump);
 const hasLead=h.some(x=>!isTrump(x)&&x.s===lead.s);
 return !hasLead||(!isTrump(c)&&c.s===lead.s);
}
function beats(a,b){
 if(isTrump(a)&&!isTrump(b))return true;
 if(!isTrump(a)&&isTrump(b))return false;
 if(isTrump(a))return trumpRank(a)<trumpRank(b);
 if(a.s!==b.s)return false;
 const order=["Ass","10","König","9"];
 return order.indexOf(a.r)<order.indexOf(b.r);
}
function render(){
 document.getElementById("score0").textContent=scores[0];
 document.getElementById("score1").textContent=scores[1];
 document.getElementById("eyes").textContent=`${eyes[0]} Augen`;
 document.getElementById("trickLabel").textContent=`STICH ${trickNo+1}`;
 document.getElementById("status").textContent=turn===0?"👉 Du bist dran!":"🤖 Computer spielt...";
 const t=document.getElementById("trick");t.innerHTML="";
 for(let p=0;p<4;p++){
  const x=trick.find(z=>z.p===p);
  const d=document.createElement("div");
  if(x){d.className="played";d.innerHTML=`<img src="${file(x.c)}">`;}else d.className="slot";
  t.appendChild(d);
 }
 const h=document.getElementById("hand");h.innerHTML="";
 hands[0].forEach((c,i)=>{
  const b=document.createElement("button");b.className="card";
  b.disabled=turn!==0||!legal(c,hands[0]);
  b.innerHTML=`<img src="${file(c)}">`;
  b.onclick=()=>play(0,i);
  h.appendChild(b);
 });
 document.getElementById("spritzBtn").disabled=!(turn===0&&trickNo===0&&trick.length>0&&!spritz);
 document.getElementById("reBtn").disabled=!(turn===0&&trickNo===0&&spritz&&!re);
}
function play(p,i){
 const c=hands[p][i]; if(!c||!legal(c,hands[p]))return;
 hands[p].splice(i,1);trick.push({p,c});turn=(turn+1)%4;render();
 if(trick.length===4)setTimeout(endTrick,550);
 else if(turn!==0)setTimeout(ai,450);
}
function ai(){
 const h=hands[turn], options=h.filter(c=>legal(c,h));
 options.sort((a,b)=>eyesValue[a.r]-eyesValue[b.r]);
 play(turn,h.indexOf(options[0]));
}
function endTrick(){
 let winner=trick[0];
 for(const x of trick.slice(1))if(beats(x.c,winner.c))winner=x;
 const pts=trick.reduce((n,x)=>n+eyesValue[x.c.r],0);
 eyes[winner.p%2]+=pts;trick=[];trickNo++;
 if(trickNo===6){
  const win=eyes[0]>=61?0:1, lose=1-win;
  let mult=eyes[lose]===0?3:(eyes[lose]<31?2:1);
  if(spritz)mult*=2;if(re)mult*=2;
  scores[win]+=mult;
  document.getElementById("status").textContent=`🏆 Runde vorbei: ${eyes[0]} : ${eyes[1]} Augen`;
  if(scores[win]>=21){
    setTimeout(()=>alert((win===0?"DU + FRANZ":"SEPP + XAVER")+" gewinnen das Spiel! 🍺🏆"),300);
    setTimeout(newGame,1400);
  }else setTimeout(newRound,1400);
  return;
 }
 turn=winner.p;render();if(turn!==0)setTimeout(ai,450);
}
function newRound(){
 const d=deck();shuffle(d);hands=[[],[],[],[]];
 for(let i=0;i<24;i++)hands[i%4].push(d[i]);
 trick=[];eyes=[0,0];trickNo=0;spritz=false;re=false;turn=starter;starter=(starter+1)%4;render();
 if(turn!==0)setTimeout(ai,450);
}
function newGame(){scores=[0,0];starter=Math.floor(Math.random()*4);newRound()}
document.getElementById("spritzBtn").onclick=()=>{spritz=true;document.getElementById("status").textContent="🍺 SPRITZ ×2 angesagt!";render()}
document.getElementById("reBtn").onclick=()=>{re=true;document.getElementById("status").textContent="↩ RE ×2!";render()}
document.getElementById("newBtn").onclick=newGame;
newGame();
