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

/* Example conversation card: cycles through the five industries */
(function(){
  const box=document.getElementById('livedemo');
  if(!box)return;
  const tabsEl=box.querySelector('.dl-tabs');
  const msgs=document.getElementById('dl-msgs');
  const res=document.getElementById('dl-result');
  const title=document.getElementById('dl-title');
  const bar=document.getElementById('dl-bar');
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scenes=[
    {tab:'Roofing', title:'Roofing · storm leak',
     c:'Water is coming through my ceiling after the storm.',
     a:"I'm sorry, that sounds stressful. I've marked this urgent and can book a roof inspection for tomorrow at 9:00 AM. What's the address?",
     result:'Inspection booked · Tomorrow, 9:00 AM'},
    {tab:'AC & HVAC', title:'AC & HVAC · no cooling',
     c:'The AC stopped and it is really hot in here.',
     a:"That's no fun. I can get a technician out this afternoon. Can I have your service address?",
     result:'Visit booked · Today, 3:00 PM'},
    {tab:'Dentists', title:'Dentist · new patient',
     c:'My tooth hurts. Do you have anything this week?',
     a:"I'm sorry you're in pain. I have a new-patient visit on Thursday at 8:30 AM. Would that work for you?",
     result:'New patient booked · Thursday, 8:30 AM'},
    {tab:'Hotels', title:'Hotel · weekend stay',
     c:'Do you have a room for two this Friday night?',
     a:"Yes, we have a queen room for Friday. Shall I reserve it for you, and can I get a name for the booking?",
     result:'Reservation held · Friday, 1 night'},
    {tab:'Real Estate', title:'Real estate · showing request',
     c:'I saw the listing on Maple Street. Can I see it this weekend?',
     a:"Happy to help. Saturday at 11:00 AM works. May I have your name and phone number to confirm?",
     result:'Showing booked · Saturday, 11:00 AM'}
  ];
  let idx=0, timers=[], paused=false;

  scenes.forEach(function(s,i){
    const b=document.createElement('button');
    b.type='button';
    b.setAttribute('role','tab');
    b.textContent=s.tab;
    b.addEventListener('click',function(){ show(i); });
    tabsEl.appendChild(b);
  });

  function later(fn,ms){ timers.push(setTimeout(fn,ms)); }
  function clearAll(){ timers.forEach(clearTimeout); timers=[]; }
  function bubble(cls,text){
    const d=document.createElement('div');
    d.className='bub '+cls;
    d.textContent=text;
    msgs.appendChild(d);
  }

  function show(i){
    idx=i; clearAll();
    const s=scenes[i];
    [...tabsEl.children].forEach(function(b,k){ b.setAttribute('aria-selected', k===i ? 'true' : 'false'); });
    title.textContent=s.title;
    msgs.innerHTML='';
    res.classList.remove('on');
    res.textContent=s.result;
    bar.classList.remove('run');
    if(reduce){
      bubble('c',s.c); bubble('a',s.a); res.classList.add('on');
      return;
    }
    void bar.offsetWidth;
    bar.classList.add('run');
    let typing=null;
    later(function(){ bubble('c',s.c); },300);
    later(function(){
      typing=document.createElement('div');
      typing.className='typing';
      typing.innerHTML='<i></i><i></i><i></i>';
      msgs.appendChild(typing);
    },1100);
    later(function(){ if(typing)typing.remove(); bubble('a',s.a); },2300);
    later(function(){ res.classList.add('on'); },3000);
    later(next,4900);
  }

  function next(){
    if(paused){ later(next,500); return; }
    show((idx+1)%scenes.length);
  }

  box.addEventListener('mouseenter',function(){ paused=true; });
  box.addEventListener('mouseleave',function(){ paused=false; });
  show(0);
})();

/* Booking-flight animation: an incoming call is flown by the AI into the calendar and booked.
   Drag the phone to move the incoming call; click any calendar day to send a call there. */
(function(){
  const cvs=document.getElementById('bookflight');
  if(!cvs||!cvs.getContext)return;
  const ctx=cvs.getContext('2d');
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const VIOLET='#bc8cff', GOLD='#ffd27a', INK='rgba(245,247,255,0.72)';
  const COLS=7, ROWS=4, PW=40, PH=72;
  let w=0,h=0,dpr=1;
  let phoneFrac={x:0.16,y:0.52};
  let phone={x:0,y:0}, grid={x:0,y:0,w:0,h:0,cw:0,ch:0};
  const cells=[];
  const trips=[], rings=[];
  let lastTrip=0, lastNow=0;
  let drag=null, hoverCell=null, hoverPhone=false;

  function size(){
    const b=cvs.getBoundingClientRect();
    dpr=Math.min(window.devicePixelRatio||1,2);
    w=b.width; h=b.height;
    cvs.width=w*dpr; cvs.height=h*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    grid={x:w*0.5, y:h*0.2, w:w*0.44, h:h*0.62};
    grid.cw=grid.w/COLS; grid.ch=grid.h/ROWS;
    if(!cells.length){
      for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells.push({c:c,r:r,booked:-Infinity});
    }
    for(const cell of cells){
      cell.x=grid.x+(cell.c+0.5)*grid.cw;
      cell.y=grid.y+(cell.r+0.5)*grid.ch;
    }
    clampPhone();
  }

  function clampPhone(){
    phone.x=Math.min(Math.max(phoneFrac.x*w, PW/2+4), w-PW/2-4);
    phone.y=Math.min(Math.max(phoneFrac.y*h, PH/2+30), h-PH/2-4);
  }

  function cellRect(cell){
    const cw=grid.cw*0.78, ch=grid.ch*0.7;
    return {x:cell.x-cw/2, y:cell.y-ch/2, w:cw, h:ch};
  }

  function star(x,y,r,color){
    const k=r*0.2;
    ctx.fillStyle=color;
    ctx.beginPath();
    ctx.moveTo(x,y-r);
    ctx.quadraticCurveTo(x+k,y-k,x+r,y);
    ctx.quadraticCurveTo(x+k,y+k,x,y+r);
    ctx.quadraticCurveTo(x-k,y+k,x-r,y);
    ctx.quadraticCurveTo(x-k,y-k,x,y-r);
    ctx.fill();
  }

  function roundRect(x,y,rw,rh,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+rw,y,x+rw,y+rh,r);
    ctx.arcTo(x+rw,y+rh,x,y+rh,r);
    ctx.arcTo(x,y+rh,x,y,r);
    ctx.arcTo(x,y,x+rw,y,r);
    ctx.closePath();
  }

  function bez(t,tr){
    const u=1-t;
    return {x:u*u*tr.x+2*u*t*tr.qx+t*t*tr.tx, y:u*u*tr.y+2*u*t*tr.qy+t*t*tr.ty};
  }

  function launch(target,now){
    trips.push({
      x:phone.x, y:phone.y,
      qx:(phone.x+target.x)/2, qy:Math.min(phone.y,target.y)-h*0.3,
      tx:target.x, ty:target.y, cell:target, t:0, speed:0.6+Math.random()*0.2
    });
    lastTrip=now;
  }

  function startTrip(now){
    const free=cells.filter(function(c){ return now-c.booked>6000; });
    const pool=free.length?free:cells;
    launch(pool[Math.floor(Math.random()*pool.length)], now);
  }

  function drawPhone(now,ringing){
    const x=phone.x, y=phone.y;
    ctx.fillStyle='rgba(131,166,255,0.08)';
    ctx.strokeStyle=hoverPhone||drag?'rgba(188,140,255,0.9)':'rgba(131,166,255,0.55)';
    ctx.lineWidth=1.5;
    roundRect(x-PW/2,y-PH/2,PW,PH,8); ctx.fill(); ctx.stroke();
    ctx.fillStyle='rgba(131,166,255,0.35)';
    ctx.fillRect(x-7,y-PH/2+6,14,2);
    if(ringing){
      for(let i=0;i<3;i++){
        const p=((now/700)+i/3)%1;
        ctx.strokeStyle='rgba(131,166,255,'+(0.5*(1-p))+')';
        ctx.lineWidth=1.5;
        ctx.beginPath();
        ctx.arc(x+PW/2+4, y, 8+p*30, -0.7, 0.7);
        ctx.stroke();
      }
    }
  }

  function drawCell(cell,now){
    const r=cellRect(cell);
    const age=now-cell.booked;
    let fill=0;
    if(age>=0 && age<4000) fill=1;
    else if(age>=4000 && age<6000) fill=1-(age-4000)/2000;
    const hov=cell===hoverCell;
    ctx.strokeStyle=hov?'rgba(188,140,255,0.9)':'rgba(131,166,255,0.2)';
    ctx.lineWidth=hov?1.5:1;
    roundRect(r.x,r.y,r.w,r.h,4); ctx.stroke();
    if(fill>0){
      ctx.globalAlpha=fill;
      ctx.fillStyle='rgba(255,210,122,0.16)';
      roundRect(r.x,r.y,r.w,r.h,4); ctx.fill();
      ctx.strokeStyle=GOLD;
      ctx.lineWidth=1.8;
      const s=Math.min(r.w,r.h)*0.22;
      ctx.beginPath();
      ctx.moveTo(cell.x-s,cell.y);
      ctx.lineTo(cell.x-s*0.3,cell.y+s*0.7);
      ctx.lineTo(cell.x+s,cell.y-s*0.6);
      ctx.stroke();
      ctx.globalAlpha=1;
    }
  }

  function draw(now){
    const dt=lastNow?Math.min((now-lastNow)/1000,0.05):0;
    lastNow=now;
    ctx.clearRect(0,0,w,h);

    ctx.font='600 11px Inter, system-ui, sans-serif';
    ctx.textAlign='center'; ctx.textBaseline='alphabetic';
    ctx.fillStyle=INK;
    ctx.fillText('INCOMING CALL', phone.x, phone.y-PH/2-10);
    ctx.fillText('CALENDAR', grid.x+grid.w/2, grid.y-12);

    drawPhone(now, trips.length>0 || reduce);
    for(const cell of cells) drawCell(cell,now);

    if(!reduce && trips.length===0 && now-lastTrip>1200){
      startTrip(now);
    }

    for(let i=trips.length-1;i>=0;i--){
      const tr=trips[i];
      tr.t+=dt*tr.speed;
      if(tr.t>=1){
        tr.cell.booked=now;
        rings.push({x:tr.cell.x,y:tr.cell.y,r:4,a:1});
        trips.splice(i,1);
        continue;
      }
      ctx.setLineDash([3,5]);
      ctx.strokeStyle='rgba(188,140,255,0.35)';
      ctx.lineWidth=1;
      ctx.beginPath();
      ctx.moveTo(tr.x,tr.y);
      ctx.quadraticCurveTo(tr.qx,tr.qy,tr.tx,tr.ty);
      ctx.stroke();
      ctx.setLineDash([]);
      for(let k=0;k<14;k++){
        const p=bez(Math.max(0,tr.t-k*0.018),tr);
        ctx.globalAlpha=(1-k/14)*0.7;
        ctx.fillStyle=VIOLET;
        ctx.beginPath(); ctx.arc(p.x,p.y,2.4-k*0.12,0,Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha=1;
      const head=bez(tr.t,tr);
      ctx.fillStyle='rgba(155,184,255,0.25)';
      ctx.beginPath(); ctx.arc(head.x,head.y,11,0,Math.PI*2); ctx.fill();
      star(head.x,head.y,7,'#ffffff');
    }

    for(let i=rings.length-1;i>=0;i--){
      const r=rings[i];
      r.r+=dt*60; r.a-=dt*1.1;
      if(r.a<=0){ rings.splice(i,1); continue; }
      ctx.strokeStyle='rgba(255,210,122,'+(r.a*0.8)+')';
      ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(r.x,r.y,r.r,0,Math.PI*2); ctx.stroke();
    }

    if(!reduce) requestAnimationFrame(draw);
  }

  function pointerPos(e){
    const b=cvs.getBoundingClientRect();
    return {x:e.clientX-b.left, y:e.clientY-b.top};
  }
  function overPhone(p){
    return Math.abs(p.x-phone.x)<=PW/2+8 && Math.abs(p.y-phone.y)<=PH/2+8;
  }
  function cellAt(p){
    for(const cell of cells){
      const r=cellRect(cell);
      if(p.x>=r.x-3 && p.x<=r.x+r.w+3 && p.y>=r.y-3 && p.y<=r.y+r.h+3) return cell;
    }
    return null;
  }

  cvs.style.touchAction='none';
  cvs.addEventListener('pointerdown',function(e){
    const p=pointerPos(e);
    if(overPhone(p)){
      drag={dx:p.x-phone.x, dy:p.y-phone.y};
      cvs.setPointerCapture(e.pointerId);
      e.preventDefault();
      return;
    }
    const cell=cellAt(p);
    if(cell){
      launch(cell, performance.now());
      if(reduce) draw(performance.now());
    }
  });
  cvs.addEventListener('pointermove',function(e){
    const p=pointerPos(e);
    if(drag){
      phoneFrac.x=(p.x-drag.dx)/w;
      phoneFrac.y=(p.y-drag.dy)/h;
      clampPhone();
      if(reduce) draw(performance.now());
      return;
    }
    hoverPhone=overPhone(p);
    hoverCell=cellAt(p);
    cvs.style.cursor=(hoverPhone||drag)?'grab':(hoverCell?'pointer':'default');
    if(reduce) draw(performance.now());
  });
  function endDrag(){ drag=null; }
  cvs.addEventListener('pointerup',endDrag);
  cvs.addEventListener('pointercancel',endDrag);
  cvs.addEventListener('pointerleave',function(){ hoverPhone=false; hoverCell=null; if(reduce) draw(performance.now()); });

  size();
  if(reduce){
    const now=performance.now();
    for(const cell of cells){ if(Math.random()<0.35) cell.booked=now-1000; }
    draw(now);
  } else {
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize',function(){ size(); if(reduce) draw(performance.now()); });
})();
