(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const LB=window.LB||[];
const RM=matchMedia('(prefers-reduced-motion: reduce)');
// reveal on scroll (CSS only animates when motion is allowed; content is visible without JS)
const rv=$$('[data-reveal]');
if('IntersectionObserver' in window&&!RM.matches){
  const rio=new IntersectionObserver(es=>{let k=0;es.forEach(e=>{if(e.isIntersecting){const t=e.target;t.style.setProperty('--d',Math.min(k++,5)*70+'ms');t.classList.add('in');rio.unobserve(t)}})},{rootMargin:'0px 0px -8% 0px',threshold:.06});
  rv.forEach(el=>rio.observe(el));
}else rv.forEach(el=>el.classList.add('in'));
// current section in nav
const links=$$('.nav nav a').filter(a=>/^#[\w-]+$/.test(a.getAttribute('href')));const secs=links.map(a=>$(a.getAttribute('href')));
const sio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.classList.toggle('is-current',a.getAttribute('href')==='#'+e.target.id))}}),{rootMargin:'-45% 0px -50% 0px'});
secs.forEach(s=>s&&sio.observe(s));
// copy email
$$('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{
  const st=$('#copyStatus');
  try{await navigator.clipboard.writeText(b.dataset.copy);b.textContent='Copied';b.classList.add('done');st.textContent='Email address copied'}
  catch(_){location.href='mailto:'+b.dataset.copy}
  setTimeout(()=>{b.textContent='Copy';b.classList.remove('done')},2200);
}));
// nav shadow
const nav=$('.nav');const tg=$('.nav-toggle');
if(tg){const setOpen=o=>{nav.classList.toggle('open',o);tg.setAttribute('aria-expanded',o);tg.setAttribute('aria-label',o?'Close menu':'Open menu')};
 tg.addEventListener('click',()=>setOpen(!nav.classList.contains('open')));
 $$('#navMenu a').forEach(a=>a.addEventListener('click',()=>setOpen(false)));
 addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){setOpen(false);tg.focus()}});
 addEventListener('resize',()=>{if(innerWidth>560)setOpen(false)});}
nav&&addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>10),{passive:true});

// videos: load + play only while visible
const vids=$$('video[data-src]');
const vio=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target;
  if(e.isIntersecting){if(!v.src)v.src=v.dataset.src;v.play().catch(()=>{})}else v.pause()}),{rootMargin:'200px'});
// loops autoplay only while visible, and never when reduced motion is requested (poster stays; open to play)
if(!RM.matches)vids.forEach(v=>{v.muted=true;vio.observe(v)});

// filters
let active='all';
$$('.filter').forEach(b=>b.addEventListener('click',()=>{
  active=b.dataset.filter;
  $$('.filter').forEach(x=>{const on=x===b;x.classList.toggle('is-active',on);x.setAttribute('aria-pressed',on)});
  $$('.tile').forEach(t=>t.classList.toggle('is-hidden',active!=='all'&&t.dataset.cat!==active));
}));

// lightbox
if(!LB.length||!$('#lb'))return;
const lb=$('#lb'),stage=$('#lbStage');let idx=0,seq=[],last=null;
const visibleSeq=g=>LB.map((m,i)=>i).filter(i=>LB[i].g===g&&(g!=='art'||active==='all'||LB[i].cat===active));
function show(i){
  idx=(i+seq.length)%seq.length;const m=LB[seq[idx]];stage.innerHTML='';
  let el;
  if(m.type==='video'){el=document.createElement('video');Object.assign(el,{src:m.src,poster:m.poster,loop:true,muted:!m.audio,autoplay:!RM.matches,controls:true,playsInline:true});}
  else{el=document.createElement('img');Object.assign(el,{src:m.src,alt:m.title,width:m.w,height:m.h});}
  stage.appendChild(el);
  $('#lbTitle').textContent=m.title;$('#lbMeta').textContent=m.medium;
  $('#lbCount').textContent=String(idx+1).padStart(2,'0')+' / '+String(seq.length).padStart(2,'0');
  [seq[idx+1],seq[idx-1]].forEach(n=>{const p=LB[n];if(p&&p.type!=='video'){const im=new Image();im.src=p.src}});
}
function open(lbIndex){
  last=document.activeElement;const g=LB[lbIndex].g;seq=visibleSeq(g);if(!seq.includes(lbIndex))seq=LB.map((m,i)=>i).filter(i=>LB[i].g===g);
  lb.hidden=false;document.body.classList.add('lb-lock');requestAnimationFrame(()=>lb.classList.add('open'));
  show(seq.indexOf(lbIndex));$('#lbClose').focus();
}
function close(){lb.classList.remove('open');document.body.classList.remove('lb-lock');
  setTimeout(()=>{lb.hidden=true;stage.innerHTML=''},200);last&&last.focus();}
$$('[data-open]').forEach(b=>b.addEventListener('click',()=>open(+b.dataset.open)));
$('#lbClose').onclick=close;$('#lbPrev').onclick=()=>show(idx-1);$('#lbNext').onclick=()=>show(idx+1);
lb.addEventListener('click',e=>{if(e.target===stage||e.target===lb)close()});
addEventListener('keydown',e=>{if(lb.hidden)return;
  if(e.key==='Escape')close();else if(e.key==='ArrowRight')show(idx+1);else if(e.key==='ArrowLeft')show(idx-1);
  else if(e.key==='Tab'){const f=$$('#lb button');const a=f.indexOf(document.activeElement);
    if(e.shiftKey&&a<=0){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&a===f.length-1){e.preventDefault();f[0].focus()}}});
// swipe
let sx=0,sy=0;
stage.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
stage.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
  if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))show(idx+(dx<0?1:-1));else if(dy>90&&Math.abs(dy)>Math.abs(dx))close();},{passive:true});
})();
