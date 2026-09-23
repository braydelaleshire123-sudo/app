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
 return Math.min(99,score);
}
function profileTerms(profile){return Object.values(profile).map(v=>String(v||'').toLowerCase().replace(/[^a-z0-9]/g,'')).filter(v=>v.length>2);}

function analyze(p,first,last,y,m,d,personalExtra=[]){let obvious=0;const low=p.toLowerCase(),personal=[first,last,String(y),String(y).slice(-2),String(m).padStart(2,'0'),String(d).padStart(2,'0'),...personalExtra.filter(Boolean)];personal.forEach(x=>{if(x.length>1&&low.includes(x))obvious++});const unique=new Set(p).size,variety=(/[a-z]/.test(p)?1:0)+(/[A-Z]/.test(p)?1:0)+(/[0-9]/.test(p)?1:0)+(/[^A-Za-z0-9]/.test(p)?1:0);if(obvious>=2||p.length<7)return ['BRUH','bruh'];if(obvious===1)return ['WEAK','weak'];if(p.length<10||variety<2)return ['MEDIUM','medium'];if(p.length<13||unique<8||variety<3)return ['STRONG','strong'];if(p.length>=16&&variety>=3&&unique>=10)return ['UNGUESSABLE*','unpredictable'];return ['VERY STRONG','strong']}
function aiPatternScore(p,first,last,y,m,d,personalExtra=[]){const low=p.toLowerCase();let score=0;if(low.includes(first.toLowerCase()))score+=22;if(low.includes(last.toLowerCase()))score+=18;if(low.includes(String(y)))score+=16;if(low.includes(String(y).slice(-2)))score+=7;if(low.includes(String(m).padStart(2,'0')))score+=5;if(low.includes(String(d).padStart(2,'0')))score+=5;personalExtra.filter(Boolean).forEach((x,i)=>{const v=String(x).toLowerCase().trim();if(v.length>1&&low.includes(v))score+=Math.max(4,12-Math.min(i,8));});if(/(123|1234|111|000|qwerty|password|admin)/i.test(p))score+=20;if(/^[a-z]+\d+$/i.test(p))score+=12;if(/[!@#$%^&*]/.test(p))score+=2;if(p.length<=8)score+=12;else if(p.length<=10)score+=7;else if(p.length>=16)score-=8;return Math.max(0,Math.min(99,score))}
function numeric(r,y,m,d,i){const patterns=[String(y),String(y).slice(-2)+String(m).padStart(2,'0')+String(d).padStart(2,'0'),String(m).padStart(2,'0')+String(d).padStart(2,'0')+String(y).slice(-2),String(d).padStart(2,'0')+String(m).padStart(2,'0')+String(y),String(Math.floor(r()*900000)+100000),String(Math.floor(r()*90000000)+10000000),String((i*37)%1000000).padStart(6,'0')];return patterns[i%patterns.length]}
const letters='abcdefghijklmnopqrstuvwxyz',symbols='!@#$%^&*_+=?';
function rndLen(r,n){return Math.floor(r()*n)}
function randomish(r,n,withSymbols){let p='';for(let i=0;i<n;i++){let q=r();if(q<.42)p+=letters[Math.floor(r()*26)];else if(q<.78)p+=letters[Math.floor(r()*26)].toUpperCase();else if(q<.93)p+=Math.floor(r()*10);else if(withSymbols)p+=symbols[Math.floor(r()*symbols.length)];else p+=Math.floor(r()*10)}return p}
function advancedPattern(r,first,last,y,m,d,extra=[]){const year=String(y),yy=year.slice(-2),mm=String(m).padStart(2,'0'),dd=String(d).padStart(2,'0');const clean=s=>s.replace(/[^a-z]/gi,'');const f=clean(first),l=clean(last);const leet=s=>s.replace(/a/gi,'4').replace(/e/gi,'3').replace(/i/gi,'1').replace(/o/gi,'0').replace(/s/gi,'5');const extras=extra.filter(Boolean).map(clean).filter(Boolean);const e=extras.length?extras[Math.floor(r()*extras.length)]:'example';const variants=[f+dd+yy,l+mm+yy,f+'_'+l,f+'.'+l,f+'-'+l,leet(f)+yy,leet(l)+dd,f.toUpperCase()+mm,f+l+dd,l+f+yy,f+dd+'!'+yy,f+'@'+mm+dd,e+yy,e+'123',f+e+dd,leet(e)+yy,randomish(r,18+rndLen(r,8),true),randomish(r,22+rndLen(r,10),true)];return variants[Math.floor(r()*variants.length)]}
function generate(count,type,chaos,seed){
 const r=rng(seed),set=new Set();
 while(set.size<count){
  let p='';
  if(type==='numbers') p=String(Math.floor(r()*90000000)+10000000);
  else if(type==='words') p=randomish(r,8+Math.floor(r()*7),false)+'-'+randomish(r,4,false);
  else p=randomish(r,(chaos?18:11)+Math.floor(r()*(chaos?10:7)),type==='mixed'||type==='all');
  if(p.length>=6)set.add(p);
 }
 return [...set];
}

function sortRows(rows,mode){const rank={'bruh':0,'weak':1,'medium':2,'strong':3,'very strong':4,'unpredictable':5};rows.sort((a,b)=>{const pa=a.querySelector('.p').textContent,pb=b.querySelector('.p').textContent,ba=a.querySelector('.strength').textContent.trim().toLowerCase(),bb=b.querySelector('.strength').textContent.trim().toLowerCase();if(mode==='ai-likely')return Number(b.dataset.ai)-Number(a.dataset.ai);if(mode==='strength-desc')return rank[bb]-rank[ba];if(mode==='strength-asc')return rank[ba]-rank[bb];if(mode==='length-desc')return pb.length-pa.length;if(mode==='length-asc')return pa.length-pb.length;if(mode==='az')return pa.localeCompare(pb);if(mode==='za')return pb.localeCompare(pa);if(mode==='generated')return Number(a.dataset.order)-Number(b.dataset.order);return 0})}
go.addEventListener('click',function(){
  if(go.disabled)return;
  const name=document.getElementById('name').value.trim();
  const dob=document.getElementById('dob').value;
  if(!name){out.innerHTML='<p class="weak">> INPUT ERROR: NAME REQUIRED</p>';return;}
  if(!dob){out.innerHTML='<p class="weak">> INPUT ERROR: VALID DATE REQUIRED</p>';return;}
  const parts=dob.split('-').map(Number),y=parts[0],m=parts[1],d=parts[2],dt=new Date(y,m-1,d);
  if(parts.length!==3||!Number.isFinite(y)||!Number.isFinite(m)||!Number.isFinite(d)||y<1900||y>2026||dt.getFullYear()!==y||dt.getMonth()!==m-1||dt.getDate()!==d){
    out.innerHTML='<p class="weak">> INPUT ERROR: VALID DATE REQUIRED</p>';return;
  }
  go.disabled=true;
  const stages=['Loading security model...','Analyzing password patterns...','Checking length and character diversity...','Comparing common-pattern signals...','Calculating local AI-style score...','Building security report...','Analysis complete.'];
  const start=Date.now(),duration=15000;
  out.innerHTML='<div class="loader"><div class="terminal" id="term">'+stages[0]+'</div><div class="bar"><div class="fill" id="fill"></div></div><div class="percent" id="pct">0%</div><div class="funny">LOCAL SECURITY MODEL // FICTIONAL DATA</div></div>';
  const timer=setInterval(function(){
    const progress=Math.min(1,(Date.now()-start)/duration);
    const idx=Math.min(stages.length-1,Math.floor(progress*stages.length));
    const fill=document.getElementById('fill'),pct=document.getElementById('pct'),term=document.getElementById('term');
    if(fill)fill.style.width=(progress*100)+'%';
    if(pct)pct.textContent=Math.floor(progress*100)+'%';
    if(term)term.textContent=stages[idx];
    if(progress>=1){
      clearInterval(timer);
      const count=Number(document.getElementById('count').value);
      const type=document.getElementById('type').value;
      const chaos=document.getElementById('chaos').checked;
      const profile={favorite:document.getElementById('favorite').value.trim(),nickname:document.getElementById('nickname').value.trim(),place:document.getElementById('place').value.trim(),hobby:document.getElementById('hobby').value.trim(),animal:document.getElementById('animal').value.trim(),game:document.getElementById('game').value.trim(),team:document.getElementById('team').value.trim(),music:document.getElementById('music').value.trim(),importantYear:document.getElementById('importantYear').value.trim(),dob:dob};
      const arr=generate(count,type,chaos,hash(name+'|'+JSON.stringify(profile))); const mode=document.getElementById('sort').value;
      const rank={'BRUH':0,'WEAK':1,'MEDIUM':2,'STRONG':3,'VERY STRONG':4,'UNGUESSABLE*':5};
      arr.sort(function(a,b){
        if(mode==='ai-likely')return aiPatternScore(b,'','','','','')-aiPatternScore(a,'','','','','');
        if(mode==='strength-desc')return rank[analyze(b,'','','','','')[0]]-rank[analyze(a,'','','','','')[0]];
        if(mode==='strength-asc')return rank[analyze(a,'','','','','')[0]]-rank[analyze(b,'','','','','')[0]];
        if(mode==='length-desc')return b.length-a.length;
        if(mode==='length-asc')return a.length-b.length;
        if(mode==='az')return a.localeCompare(b);
        if(mode==='za')return b.localeCompare(a);
        return 0;
      });
      const exposure=personalRisk(profile);
      const counts={BRUH:0,WEAK:0,MEDIUM:0,STRONG:0,'VERY STRONG':0,'UNGUESSABLE*':0};
      arr.forEach(function(p){counts[analyze(p,'','','','','')[0]]++;});
      out.innerHTML='<div class="riskbox"><b>PERSONAL-INFO RISK: '+(exposure>=60?'HIGH':exposure>=30?'MEDIUM':'LOW')+'</b>Uses fictional profile details to demonstrate which kinds of personal information should be kept out of passwords. This module does not generate targeted guesses.</div><div class="stats"><div class="stat"><b>'+arr.length.toLocaleString()+'</b><span class="muted">generated</span></div><div class="stat"><b>'+counts.BRUH+'</b><span class="muted">BRUH</span></div><div class="stat"><b>'+counts.WEAK+'</b><span class="muted">WEAK</span></div><div class="stat"><b>'+counts.MEDIUM+'</b><span class="muted">MEDIUM</span></div><div class="stat"><b>'+counts.STRONG+'</b><span class="muted">STRONG</span></div><div class="stat"><b>'+counts['VERY STRONG']+'</b><span class="muted">VERY STRONG</span></div><div class="stat"><b>'+counts['UNGUESSABLE*']+'</b><span class="muted">UNGUESSABLE*</span></div></div><h2>SECURITY ANALYSIS // '+arr.length.toLocaleString()+' RECORDS</h2><div class="list">'+arr.map(function(p){const a=analyze(p,'','','','',''),terms=profileTerms(profile),hits=terms.filter(t=>p.toLowerCase().replace(/[^a-z0-9]/g,'').includes(t)).length,sc=Math.min(99,Math.max(0,aiPatternScore(p,'','','','','')+hits*18));return '<div class="row"><span class="p">'+esc(p)+'</span><span><span class="badge ai">AI '+sc+'%</span> <span class="badge strength '+a[1]+'">'+a[0]+'</span></span></div>';}).join('')+'</div><p class="note">Showing '+arr.length.toLocaleString()+' results. AI-style score is calculated locally from password-pattern signals; this is not a real-world password prediction. Personal-info risk is an educational warning, not a password-guessing system.</p>';
      go.disabled=false;
    }
  },100);
});

document.getElementById('sort').addEventListener('change',()=>{const list=document.querySelector('.list');if(!list)return;const rows=[...list.querySelectorAll('.row')];sortRows(rows,document.getElementById('sort').value);rows.forEach(row=>list.appendChild(row));const note=document.querySelector('#out > .note');if(note)note.innerHTML='Showing '+rows.length.toLocaleString()+' results. Sorted by '+esc(document.getElementById('sort').selectedOptions[0].text)+'. AI score is a fictional local heuristic.';});

});
