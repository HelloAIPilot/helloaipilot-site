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
