window.addEventListener('DOMContentLoaded',function(){

const out=document.getElementById('out'),go=document.getElementById('go');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function rng(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
function personalRisk(profile){
 const vals=Object.values(profile).filter(v=>String(v||'').trim().length>1);
 let score=vals.length*7;
 if(profile.dob)score+=18;
 if(profile.nickname)score+=12;
 if(profile.favorite||profile.hobby||profile.animal||profile.game)score+=12;
 if(profile.place||profile.team||profile.music)score+=10;
 if(profile.importantYear)score+=15;
 if(profile.favoriteNumber)score+=12;
 if(profile.favoriteColor)score+=8;
 return Math.min(99,score);
}
function profileTerms(profile){return Object.entries(profile).filter(([k])=>k!=='dob').map(([,v])=>String(v||'').toLowerCase().replace(/[^a-z0-9]/g,'')).filter(v=>v.length>2);}
function analyze(p,first,last,y,m,d,personalExtra=[]){let obvious=0;const low=p.toLowerCase(),personal=[first,last,String(y),String(y).slice(-2),String(m).padStart(2,'0'),String(d).padStart(2,'0'),...personalExtra.filter(Boolean)];personal.forEach(x=>{if(x.length>1&&low.includes(x))obvious++});const unique=new Set(p).size,variety=(/[a-z]/.test(p)?1:0)+(/[A-Z]/.test(p)?1:0)+(/[0-9]/.test(p)?1:0)+(/[^A-Za-z0-9]/.test(p)?1:0);if(p.length<=5)return ['BRUH','bruh'];if(p.length<=7||obvious>=2&&p.length<11)return ['WEAK','weak'];if(obvious>=1&&p.length<10)return ['MEDIUM','medium'];if(p.length<9||variety<2)return ['STRONG','strong'];if(p.length<12||variety<3||unique<7)return ['VERY STRONG','strong'];if(p.length<16||unique<9)return ['VERY STRONG','strong'];if(p.length>=16&&variety>=3&&unique>=10)return ['UNGUESSABLE*','unpredictable'];return ['VERY STRONG','strong']}
function aiPatternScore(p,first,last,y,m,d,personalExtra=[]){const low=p.toLowerCase();let score=0;const add=(value,points)=>{const v=String(value||'').toLowerCase().trim();if(v.length>1&&low.includes(v))score+=points};add(first,22);add(last,18);add(y,16);if(y)add(String(y).slice(-2),7);if(m)add(String(m).padStart(2,'0'),5);if(d)add(String(d).padStart(2,'0'),5);personalExtra.filter(Boolean).forEach((x,i)=>{const v=String(x).toLowerCase().trim();if(v.length>1&&low.includes(v))score+=Math.max(4,12-Math.min(i,8));});if(/(123|1234|111|000|qwerty|password|admin)/i.test(p))score+=20;if(/^[a-z]+\d+$/i.test(p))score+=12;if(/[!@#$%^&*]/.test(p))score+=2;if(p.length<=8)score+=12;else if(p.length<=10)score+=7;else if(p.length>=16)score-=8;return Math.max(0,Math.min(99,score))}
const letters='abcdefghijklmnopqrstuvwxyz',symbols='!@#$%^&*_+=?';
function rndLen(r,n){return Math.floor(r()*n)}
function randomish(r,n,withSymbols){let p='';for(let i=0;i<n;i++){let q=r();if(q<.42)p+=letters[Math.floor(r()*26)];else if(q<.78)p+=letters[Math.floor(r()*26)].toUpperCase();else if(q<.93)p+=Math.floor(r()*10);else if(withSymbols)p+=symbols[Math.floor(r()*symbols.length)];else p+=Math.floor(r()*10)}return p}
function generate(count,type,chaos,seed,profile){
 const r=rng(seed),set=new Set(),pr=profile||{}; count=Math.min(Math.max(Number(count)||50,1),500);
 const terms=profileTerms(pr), first=(pr.first||'alex').replace(/[^a-z0-9]/gi,''), last=(pr.last||'morgan').replace(/[^a-z0-9]/gi,'');
 let dobYear='',dobMonth='',dobDay='';
 if(/^\\d{4}-\\d{2}-\\d{2}$/.test(pr.dob||'')){const parts=pr.dob.split('-');dobYear=parts[0];dobMonth=parts[1];dobDay=parts[2]}
 const datePieces=[dobYear,dobYear.slice(-2),dobMonth,dobDay,dobMonth+dobDay,dobDay+dobMonth,dobMonth+dobDay+dobYear.slice(-2),dobDay+dobMonth+dobYear.slice(-2)].filter(Boolean);
 const exactDateExamples=[dobYear,dobYear+dobMonth+dobDay,dobMonth+dobDay+dobYear.slice(-2),dobDay+dobMonth+dobYear.slice(-2)].filter(Boolean);
 const favNum=String(pr.favoriteNumber||'').replace(/\\D/g,'');
 const favVariants=favNum?[favNum,favNum+favNum.slice(-2),favNum+'0',favNum+'1'].filter((v,i,a)=>v&&a.indexOf(v)===i):[];
 const color=(pr.favoriteColor||'').toLowerCase().replace(/[^a-z0-9]/g,'');
 const profileNumberExamples=[...new Set([...exactDateExamples,...favVariants])];
 const profileWordExamples=[...new Set([...terms,color].filter(v=>v&&v.length>2))];
 const safeWords=['Blue','Tiger','Rocket','Maple','Cedar','Pixel','Comet','River','Falcon','Quartz','Orbit','Forest'];
 const safeLower=['blue','tiger','rocket','maple','cedar','pixel','comet','river','falcon','quartz','orbit','forest'];
 const mixedChars='aZ7!kP2@qR9#vT4$';
 function balanced(i){
   const b=i%6;
   if(b===0) return safeLower[i%safeLower.length].slice(0,5);
   if(b===1) return (first||'alex').slice(0,5)+(10+(i%90));
   if(b===2){const term=profileWordExamples.length?profileWordExamples[i%profileWordExamples.length]:safeLower[i%safeLower.length];return term.slice(0,6)+(favNum||datePieces[i%Math.max(1,datePieces.length)]||'42')+'!';}
   if(b===3) return safeWords[i%safeWords.length]+(i%10)+'Sky!';
   if(b===4){let p='';for(let j=0;j<13;j++)p+=mixedChars[(i*7+j*3)%mixedChars.length];return p;}
   let p='';for(let j=0;j<20;j++)p+=mixedChars[(i*11+j*5)%mixedChars.length];return p;
 }
 let safety=0; while(set.size<count && safety++<count*20){
   const i=set.size;
   let p='';
   if(type==='numbers'){
     if(profileNumberExamples.length && i%4<2)p=profileNumberExamples[i%profileNumberExamples.length];
     else if(datePieces.length && i%4===2)p=datePieces[i%datePieces.length];
     else if(favNum && i%4===3)p=favVariants[i%favVariants.length];
     else p=String((chaos?Math.floor(r()*90000000)+10000000:10+Math.floor(r()*90)));
   } else if(type==='all'||type==='mixed'){
     p=balanced(i);
     if(chaos&&i%10===9)p=randomish(r,18,true);
   } else if(type==='words'){
     p=balanced(i);
     if(i%6===3)p=safeWords[i%safeWords.length]+'-'+safeLower[(i+2)%safeLower.length];
   } else {
     p=randomish(r,6+Math.floor(r()*10),false);
   }
   if(p.length>=4)set.add(p);
 }
 return [...set];
}
function sortRows(rows,mode){const rank={'bruh':0,'weak':1,'medium':2,'strong':3,'very strong':4,'unpredictable':5};rows.sort((a,b)=>{const pa=a.querySelector('.p').textContent,pb=b.querySelector('.p').textContent,ba=a.querySelector('.strength').textContent.trim().toLowerCase(),bb=b.querySelector('.strength').textContent.trim().toLowerCase();if(mode==='ai-likely')return Number(b.dataset.ai)-Number(a.dataset.ai);if(mode==='strength-desc')return rank[bb]-rank[ba];if(mode==='strength-asc')return rank[ba]-rank[bb];if(mode==='length-desc')return pb.length-pa.length;if(mode==='length-asc')return pa.length-pb.length;if(mode==='az')return pa.localeCompare(pb);if(mode==='za')return pb.localeCompare(pa);if(mode==='generated')return Number(a.dataset.order)-Number(b.dataset.order);return 0})}
go.addEventListener('click',function(){
 if(go.disabled)return;
 const name=document.getElementById('name').value.trim(),dob=document.getElementById('dob').value;
 if(!name){out.innerHTML='<p class="weak">> INPUT ERROR: NAME REQUIRED</p>';return}
 if(!dob){out.innerHTML='<p class="weak">> INPUT ERROR: VALID DATE REQUIRED</p>';return}
 const parts=dob.split('-').map(Number),y=parts[0],m=parts[1],d=parts[2],dt=new Date(y,m-1,d);
 if(parts.length!==3||!Number.isFinite(y)||!Number.isFinite(m)||!Number.isFinite(d)||y<1900||y>2026||dt.getFullYear()!==y||dt.getMonth()!==m-1||dt.getDate()!==d){out.innerHTML='<p class="weak">> INPUT ERROR: VALID DATE REQUIRED</p>';return}
 go.disabled=true;
 const stages=['Loading security model...','Analyzing password patterns...','Checking length and character diversity...','Comparing common-pattern signals...','Calculating local AI-style score...','Building security report...','Analysis complete.'];
 const start=Date.now(),duration=3000;
 out.innerHTML='<div class="loader"><div class="terminal" id="term">'+stages[0]+'</div><div class="bar"><div class="fill" id="fill"></div></div><div class="percent" id="pct">0%</div><div class="funny">LOCAL SECURITY MODEL // FICTIONAL DATA</div></div>';
 const timer=setInterval(function(){
  const progress=Math.min(1,(Date.now()-start)/duration),idx=Math.min(stages.length-1,Math.floor(progress*stages.length));
  const fill=document.getElementById('fill'),pct=document.getElementById('pct'),term=document.getElementById('term');
  if(fill)fill.style.width=(progress*100)+'%';if(pct)pct.textContent=Math.floor(progress*100)+'%';if(term)term.textContent=stages[idx];
  if(progress>=1){
   clearInterval(timer);
   const requestedCount=Math.min(Math.max(Number(document.getElementById('count').value)||100,1),500),type=document.getElementById('type').value,chaos=document.getElementById('chaos').checked;
   const profile={favorite:document.getElementById('favorite').value.trim(),favoriteNumber:document.getElementById('favoriteNumber').value.trim(),favoriteColor:document.getElementById('favoriteColor').value.trim(),nickname:document.getElementById('nickname').value.trim(),place:document.getElementById('place').value.trim(),hobby:document.getElementById('hobby').value.trim(),animal:document.getElementById('animal').value.trim(),game:document.getElementById('game').value.trim(),team:document.getElementById('team').value.trim(),music:document.getElementById('music').value.trim(),importantYear:document.getElementById('importantYear').value.trim(),dob:dob};
   profile.first=name.split(/\s+/)[0]||'alex';profile.last=name.split(/\s+/).at(-1)||'morgan';const terms=profileTerms(profile),arr=generate(requestedCount,type,chaos,hash(name+'|'+JSON.stringify(profile)),profile),mode=document.getElementById('sort').value;
   const rank={'BRUH':0,'WEAK':1,'MEDIUM':2,'STRONG':3,'VERY STRONG':4,'UNGUESSABLE*':5};
   arr.sort(function(a,b){if(mode==='ai-likely')return aiPatternScore(b,profile.first,profile.last,y,m,d,terms)-aiPatternScore(a,profile.first,profile.last,y,m,d,terms);if(mode==='strength-desc')return rank[analyze(b,profile.first,profile.last,y,m,d,terms)[0]]-rank[analyze(a,profile.first,profile.last,y,m,d,terms)[0]];if(mode==='strength-asc')return rank[analyze(a,profile.first,profile.last,y,m,d,terms)[0]]-rank[analyze(b,profile.first,profile.last,y,m,d,terms)[0]];if(mode==='length-desc')return b.length-a.length;if(mode==='length-asc')return a.length-b.length;if(mode==='az')return a.localeCompare(b);if(mode==='za')return b.localeCompare(a);return 0});
   const exposure=personalRisk(profile),counts={BRUH:0,WEAK:0,MEDIUM:0,STRONG:0,'VERY STRONG':0,'UNGUESSABLE*':0};
   arr.forEach(p=>counts[analyze(p,profile.first,profile.last,y,m,d,terms)[0]]++);
   const renderPage=function(page){const pageSize=100,totalPages=Math.max(1,Math.ceil(arr.length/pageSize)),safePage=Math.max(1,Math.min(page,totalPages)),start=(safePage-1)*pageSize,end=Math.min(arr.length,start+pageSize),visible=arr.slice(start,end);out.innerHTML='<div class="riskbox"><b>PERSONAL-INFO RISK: '+(exposure>=60?'HIGH':exposure>=30?'MEDIUM':'LOW')+'</b>Uses fictional profile details to demonstrate which kinds of personal information should be kept out of passwords. This module does not generate targeted guesses.</div><div class="stats"><div class="stat"><b>'+arr.length.toLocaleString()+'</b><span class="muted">generated</span></div><div class="stat"><b>'+counts.BRUH+'</b><span class="muted">BRUH</span></div><div class="stat"><b>'+counts.WEAK+'</b><span class="muted">WEAK</span></div><div class="stat"><b>'+counts.MEDIUM+'</b><span class="muted">MEDIUM</span></div><div class="stat"><b>'+counts.STRONG+'</b><span class="muted">STRONG</span></div><div class="stat"><b>'+counts['VERY STRONG']+'</b><span class="muted">VERY STRONG</span></div><div class="stat"><b>'+counts['UNGUESSABLE*']+'</b><span class="muted">UNGUESSABLE*</span></div></div><h2>SECURITY ANALYSIS // '+arr.length.toLocaleString()+' RECORDS</h2><div class="pager"><button id="prevPage" '+(safePage===1?'disabled':'')+'>‹ PREVIOUS</button><span>PAGE '+safePage+' / '+totalPages+' · SHOWING '+(start+1)+'–'+end+'</span><button id="nextPage" '+(safePage===totalPages?'disabled':'')+'>NEXT ›</button></div><div class="list">'+visible.map(function(p,j){const a=analyze(p,profile.first,profile.last,y,m,d,terms),sc=aiPatternScore(p,profile.first,profile.last,y,m,d,terms);return '<div class="row" data-ai="'+sc+'" data-order="'+(start+j)+'"><span class="p">'+esc(p)+'</span><span><span class="badge ai">AI '+sc+'%</span> <span class="badge strength '+a[1]+'">'+a[0]+'</span></span></div>';}).join('')+'</div><p class="note">Showing '+arr.length.toLocaleString()+' generated results, with 100 rendered at a time to keep the page fast and prevent browser crashes. AI-style score is a fictional local heuristic.</p>';document.getElementById('prevPage').onclick=function(){renderPage(safePage-1)};document.getElementById('nextPage').onclick=function(){renderPage(safePage+1)}};renderPage(1);
   go.disabled=false;
  }
 },100);
});
document.getElementById('sort').addEventListener('change',()=>{const list=document.querySelector('.list');if(!list)return;const rows=[...list.querySelectorAll('.row')];sortRows(rows,document.getElementById('sort').value);rows.forEach(row=>list.appendChild(row));const note=document.querySelector('#out > .note');if(note)note.innerHTML='Showing '+rows.length.toLocaleString()+' results. Sorted by '+esc(document.getElementById('sort').selectedOptions[0].text)+'. AI score is a fictional local heuristic.';});
});