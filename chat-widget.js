/* Site-wide chat launcher (bottom-right). Scripted replies only. Skipped on /demo/, which has its own chat. */
(function(){
  if(location.pathname.indexOf('/demo/')===0) return;
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const BOOK='https://calendar.app.google/snJDiGwFyuFC5GVa7';

  const launcher=document.createElement('button');
  launcher.type='button';
  launcher.className='cw-launch';
  launcher.setAttribute('aria-expanded','false');
  launcher.setAttribute('aria-controls','cw-panel');
  launcher.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg><span>Chat with us</span>';

  const panel=document.createElement('section');
  panel.id='cw-panel';
  panel.className='cw-panel';
  panel.hidden=true;
  panel.setAttribute('aria-label','Chat with HelloAIPilot');
  panel.innerHTML='<div class="cw-head"><span>HelloAIPilot chat</span><button type="button" class="cw-close" aria-label="Close chat">×</button></div>'+
    '<div class="cw-msgs" id="cw-msgs" aria-live="polite"></div>'+
    '<form class="cw-form" id="cw-form" autocomplete="off"><input id="cw-q" maxlength="200" placeholder="Ask about prices, hours or booking" aria-label="Type a question"><button class="btn" type="submit">Send</button></form>'+
    '<p class="cw-note">Scripted replies. A live receptionist answers from your own rules and calendar.</p>';

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  const msgs=panel.querySelector('#cw-msgs');
  const form=panel.querySelector('#cw-form');
  const input=panel.querySelector('#cw-q');
  let timers=[];

  const rules=[
    {k:/are you (a |an )?(real|human|bot|ai|robot)|is this (a )?(real|human|bot|ai)/i,
     r:"I'm an AI assistant for HelloAIPilot. I can answer questions and book a strategy call. A team member can take over if you ask for one."},
    {k:/price|cost|how much|fee|quote|rate/i,
     r:"Pricing depends on your call volume and the services you need. Book a free strategy call and we'll give you a quote."},
    {k:/book|appointment|schedule|call me|available|slot|tomorrow|today|this week/i,
     r:"Yes. Pick a free strategy call time on our booking calendar and it will be added right away.", link:true},
    {k:/hour|open|close|weekend|holiday/i,
     r:"Our team can confirm availability on a call. Would you like to pick a time?", link:true},
    {k:/human|person|someone|manager|team member|phone|email/i,
     r:"Of course. You can reach our team at chandra@helloaipilot.com or +1 346-889-6827."},
    {k:/.*/,
     r:"I'm not sure about that one. Send us a note on the contact page and the team will follow up."}
  ];

  function later(fn,ms){ timers.push(setTimeout(fn,ms)); }
  function bubble(cls,text){
    const d=document.createElement('div');
    d.className='bub '+cls;
    d.textContent=text;
    msgs.appendChild(d);
    msgs.scrollTop=msgs.scrollHeight;
  }
  function bubbleWithBooking(text){
    const d=document.createElement('div');
    d.className='bub a';
    d.appendChild(document.createTextNode(text));
    const wrap=document.createElement('div');
    const a=document.createElement('a');
    a.className='btn demo-pick';
    a.href=BOOK; a.target='_blank'; a.rel='noopener';
    a.textContent='Pick a time ↗';
    wrap.appendChild(a); d.appendChild(wrap);
    msgs.appendChild(d);
    msgs.scrollTop=msgs.scrollHeight;
  }
  function reply(q){
    for(const rule of rules){
      if(rule.k.test(q)) return {text:rule.r, link:!!rule.link};
    }
  }

  function open(){
    panel.hidden=false;
    launcher.setAttribute('aria-expanded','true');
    launcher.classList.add('cw-hide');
    if(!msgs.childElementCount){
      bubble('a',"Hi, I'm the HelloAIPilot assistant. Ask about prices, hours or booking, or book a strategy call.");
    }
    setTimeout(function(){ input.focus(); },50);
  }
  function close(){
    panel.hidden=true;
    launcher.setAttribute('aria-expanded','false');
    launcher.classList.remove('cw-hide');
    launcher.focus();
  }

  launcher.addEventListener('click', function(){ panel.hidden ? open() : close(); });
  panel.querySelector('.cw-close').addEventListener('click', close);
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && !panel.hidden) close(); });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    const q=input.value.trim();
    if(!q) return;
    input.value='';
    bubble('c',q);
    const answer=reply(q);
    const typing=document.createElement('div');
    typing.className='typing';
    typing.innerHTML='<i></i><i></i><i></i>';
    msgs.appendChild(typing);
    msgs.scrollTop=msgs.scrollHeight;
    later(function(){
      typing.remove();
      if(answer.link) bubbleWithBooking(answer.text);
      else bubble('a',answer.text);
    }, reduce?0:900);
  });
})();
