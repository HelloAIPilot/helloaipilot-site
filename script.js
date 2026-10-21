document.querySelectorAll('#year').forEach(e=>e.textContent=new Date().getFullYear());

/* Inquiry form (Netlify Forms) */
const form=document.querySelector('#inquiry');
if(form)form.addEventListener('submit',async e=>{
  e.preventDefault();
  const btn=form.querySelector('button[type="submit"]'),status=document.querySelector('#form-status');
  btn.disabled=true;btn.textContent='Sending…';status.hidden=true;status.className='form-status';
  try{
    const res=await fetch(form.action,{method:'POST',headers:{'Accept':'application/json'},body:new FormData(form)});
    const data=await res.json();
    if(!data.success)throw new Error(data.message||res.status);
    const name=(form.elements.name.value||'').trim().split(' ')[0];
    status.textContent='Thank you'+(name?', '+name:'')+'! Your inquiry has been sent. We will contact you within one business day.';
    status.classList.add('ok');form.reset();
  }catch(err){
    status.textContent='Sorry, your inquiry could not be sent. Please email chandra@helloaipilot.com or call +1 346-889-6827.';
    status.classList.add('err');
  }finally{status.hidden=false;btn.disabled=false;btn.textContent='Send inquiry ↗';}
});

/* Industry tabs */
const tabs=[...document.querySelectorAll('.tab')];
function showTab(t,focus){
  tabs.forEach(x=>{const on=x===t;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;document.getElementById(x.getAttribute('aria-controls')).hidden=!on;});
  if(focus)t.focus();
}
tabs.forEach((t,i)=>{
  t.addEventListener('click',()=>showTab(t));
  t.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();showTab(tabs[(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length],true);}
  });
});

/* Missed-call calculator */
const cm=document.getElementById('c-missed'),cr=document.getElementById('c-rate'),cv=document.getElementById('c-value');
function calc(){
  if(!cm)return;
  const n=v=>Math.max(0,parseFloat(v.value)||0);
  const month=n(cm)*Math.min(n(cr),100)/100*n(cv)*52/12;
  const fmt=x=>'$'+Math.round(x).toLocaleString('en-US');
  document.getElementById('c-month').textContent=fmt(month);
  document.getElementById('c-year').textContent=fmt(month*12)+' per year';
  const f=document.getElementById('c-formula');if(f)f.textContent=n(cm).toLocaleString('en-US')+' calls × '+Math.min(n(cr),100)+'% × '+fmt(n(cv))+' × 4.33 weeks';
}
[cm,cr,cv].forEach(el=>el&&el.addEventListener('input',calc));calc();

/* Animated call-flow map behind the home hero: calls from each industry reach the AI and book */
(function(){
  const cvs=document.getElementById('callmap');
  if(!cvs||!cvs.getContext)return;
  const ctx=cvs.getContext('2d');
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const labels=['Roofing','AC & HVAC','Dentists','Hotels','Real Estate'];
  const BLUE='#83a6ff', VIOLET='#bc8cff', GOLD='#ffd27a';
  let w=0,h=0,dpr=1,cx=0,cy=0,nodes=[];
  const pulses=[], rings=[];
  let lastSpawn=0, lastNow=0;

  function size(){
    const b=cvs.getBoundingClientRect();
    dpr=Math.min(window.devicePixelRatio||1,2);
    w=b.width; h=b.height;
    cvs.width=w*dpr; cvs.height=h*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    cx=w/2; cy=h/2;
    const rx=Math.min(w*0.36,300), ry=Math.min(h*0.36,110);
    nodes=labels.map(function(l,i){
      const a=-Math.PI/2 + i*(2*Math.PI/labels.length) + 0.25;
      return {label:l, x:cx+Math.cos(a)*rx, y:cy+Math.sin(a)*ry, a:a};
    });
  }

  function spawn(){
    const n=nodes[Math.floor(Math.random()*nodes.length)];
    const mx=(n.x+cx)/2, my=(n.y+cy)/2;
    const dx=cx-n.x, dy=cy-n.y, d=Math.hypot(dx,dy)||1;
    const bend=(Math.random()<0.5?-1:1)*d*0.18;
    pulses.push({
      x0:n.x, y0:n.y, x1:cx, y1:cy,
      qx:mx - dy/d*bend, qy:my + dx/d*bend,
      t:0, speed:0.55+Math.random()*0.35, color:Math.random()<0.7?BLUE:VIOLET
    });
  }

  function bez(p,t){
    const u=1-t;
    return {
      x:u*u*p.x0 + 2*u*t*p.qx + t*t*p.x1,
      y:u*u*p.y0 + 2*u*t*p.qy + t*t*p.y1
    };
  }

  function draw(now){
    const dt=lastNow?Math.min((now-lastNow)/1000,0.05):0;
    lastNow=now;
    ctx.clearRect(0,0,w,h);

    // faint lines from each industry to the AI core
    ctx.lineWidth=1;
    for(const n of nodes){
      ctx.strokeStyle='rgba(131,166,255,0.14)';
      ctx.beginPath(); ctx.moveTo(n.x,n.y); ctx.lineTo(cx,cy); ctx.stroke();
    }

    // AI core glow
    const pulseGlow=reduce?0.5:0.5+0.25*Math.sin(now/700);
    const g=ctx.createRadialGradient(cx,cy,0,cx,cy,90);
    g.addColorStop(0,'rgba(188,140,255,'+(0.45*pulseGlow+0.15)+')');
    g.addColorStop(1,'rgba(188,140,255,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,90,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#ffffff';
    ctx.beginPath(); ctx.arc(cx,cy,4.5,0,Math.PI*2); ctx.fill();

    // industry nodes and labels
    ctx.font='600 12px Inter, system-ui, sans-serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    for(const n of nodes){
      ctx.fillStyle='rgba(131,166,255,0.18)';
      ctx.beginPath(); ctx.arc(n.x,n.y,11,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=BLUE;
      ctx.beginPath(); ctx.arc(n.x,n.y,4,0,Math.PI*2); ctx.fill();
      const c=Math.cos(n.a), s=Math.sin(n.a);
      ctx.fillStyle='rgba(245,247,255,0.7)';
      if(c>0.3){ ctx.textAlign='left'; ctx.fillText(n.label.toUpperCase(), n.x+14, n.y); }
      else if(c<-0.3){ ctx.textAlign='right'; ctx.fillText(n.label.toUpperCase(), n.x-14, n.y); }
      else { ctx.textAlign='center'; ctx.fillText(n.label.toUpperCase(), n.x, n.y+(s<0?-18:18)); }
      ctx.textAlign='center';
    }

    // spawn calls
    if(!reduce && now-lastSpawn>420){ spawn(); lastSpawn=now; }

    // calls travelling to the AI
    for(let i=pulses.length-1;i>=0;i--){
      const p=pulses[i];
      p.t+=dt*p.speed;
      if(p.t>=1){
        rings.push({r:6, a:1});
        pulses.splice(i,1);
        continue;
      }
      // short trail
      ctx.lineWidth=2;
      for(let k=0;k<8;k++){
        const tt=Math.max(0,p.t-k*0.012);
        const q=bez(p,tt);
        ctx.globalAlpha=(1-k/8)*0.6;
        ctx.fillStyle=p.color;
        ctx.beginPath(); ctx.arc(q.x,q.y,2.2-k*0.2,0,Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha=1;
    }

    // "booked" rings radiating from the AI core
    for(let i=rings.length-1;i>=0;i--){
      const r=rings[i];
      r.r+=dt*70; r.a-=dt*0.9;
      if(r.a<=0){ rings.splice(i,1); continue; }
      ctx.strokeStyle='rgba(255,210,122,'+(r.a*0.8)+')';
      ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(cx,cy,r.r,0,Math.PI*2); ctx.stroke();
    }

    if(!reduce) requestAnimationFrame(draw);
  }

  size();
  if(reduce){
    // static frame for reduced motion
    for(let i=0;i<14;i++){ spawn(); pulses[pulses.length-1].t=Math.random(); }
    draw(performance.now());
  } else {
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize',function(){ size(); if(reduce) draw(performance.now()); });
})();
