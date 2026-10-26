/* HelloAIPilot answer engine + site chat + Ava voice demo. Scripted replies only (no live AI). */
(function(){
  const BOOK='https://calendar.app.google/snJDiGwFyuFC5GVa7';

  /* ---------- Knowledge base: first matching rule wins. Shared by the chat, Ava and the preview. ---------- */
  const KB=[
    {k:/^(hi|hello|hey|good (morning|afternoon|evening))\b/i,
     r:"Hi there. Ask me about HelloAIPilot, our prices, how setup works, or book a strategy call."},
    {k:/\b(thanks|thank you|thx|cheers)\b/i,
     r:"You're welcome. Anything else you'd like to know?"},
    {k:/are you (a |an )?(real|human|bot|ai|robot)|is this (a )?(real|human|bot|ai)/i,
     r:"I'm an AI assistant for HelloAIPilot. I can answer questions and book a strategy call. A team member can take over if you ask for one."},
    {k:/owner|who (is|are|was|runs|owns)|who'?s behind|about (you|us|the company|helloaipilot)|founder|chandra|who built/i,
     r:"HelloAIPilot builds AI phone receptionists for local businesses in Katy, Texas. Chandra Vy, M.B.A., leads the team. You can read more on our About page."},
    {k:/what is an? (ai )?receptionist|ai receptionist\?|what('s| is) a receptionist/i,
     r:"An AI receptionist is software that answers your phone the way a front-desk person would. It answers questions, takes messages and books appointments, following the rules you set."},
    {k:/what (do|does) (you|helloaipilot|this) do|what is (this|helloaipilot)|what do you offer|what (services?|do you sell)|what exactly/i,
     r:"HelloAIPilot gives your business an AI receptionist. It answers every call, answers common questions, takes messages and books appointments into your calendar."},
    {k:/industr|who (do|does) (you|it) (serve|work)|who is (this|it) for|which businesses|types? of (business|compan)|clients?\b/i,
     r:"We set up receptionists for roofing, AC and HVAC, dentists, hotels and real estate teams. Each one is trained on that trade's calls."},
    {k:/\broof|storm|shingle|leak/i,
     r:"Our roofing receptionist books free inspections, collects the property and insurance details, and flags active leaks for a fast callback. Would you like to try a sample call?", link:'demo'},
    {k:/\bac\b|hvac|cooling|furnace|heat pump|air condition|technician/i,
     r:"Our AC and HVAC receptionist handles emergency triage, service calls and maintenance bookings, and sends urgent no-cooling calls to a technician. Would you like to try a sample call?", link:'demo'},
    {k:/dent|tooth|teeth|patient|cleaning|insurance|new.?patient/i,
     r:"Our dental receptionist books new-patient visits, answers insurance questions and handles reschedules. Would you like to try a sample call?", link:'demo'},
    {k:/hotel|room|reservation|check.?in|rates? for|stay/i,
     r:"Our hotel receptionist answers questions about rooms and rates, takes reservations and handles check-in questions. Would you like to try a sample call?", link:'demo'},
    {k:/real ?estate|realtor|showing|listing|buyer|seller|property|lead/i,
     r:"Our real estate receptionist answers instant leads, qualifies callers and books showing requests. Would you like to try a sample call?", link:'demo'},
    {k:/missed|\bmiss\b|text ?back|sms|text message|unanswered|voicemail|leave a message/i,
     r:"When a call goes unanswered, the receptionist can text the caller straight away and keep the conversation going by text, including booking a visit. You can see it on the Live preview page.", link:'demo'},
    {k:/voice|sound|speak|hear|talk to|audio|accent|robot/i,
     r:"Yes. You can talk to Jessica on the home page and hear how the receptionist sounds. Voice and accent for your own line are chosen on your strategy call."},
    {k:/language|spanish|french|translat|bilingual|english/i,
     r:"Language options depend on your customers. Which languages we set up is confirmed on your strategy call."},
    {k:/emergenc|urgent|no cooling|flood|\bgas\b|severe|\bpain\b|broken/i,
     r:"Urgent calls follow the rules you set. For example, a no-cooling call or an active leak can go straight to an on-call person, and the caller gets a callback time."},
    {k:/how (does|do) (it|this|the (service|system)) work|how it works|process|steps|get started|getting started|set ?up|onboard|install|go live|how long|timeline|launch/i,
     r:"Here's the process: a short call to learn your services, prices and rules, then we build the receptionist, test it with you, and connect your phone once you're happy. Timing is confirmed on your strategy call."},
    {k:/transfer|cell|mobile|on-?call|hand (it |them )?off/i,
     r:"Yes. Hot leads and urgent jobs can be transferred to your cell or office line when you choose. Which numbers and cases are set up is confirmed on your strategy call."},
    {k:/forward|keep (my|our|the) (number|phone)|existing (number|phone)|my number|our number|switch|\bport\b/i,
     r:"Most businesses keep their existing number. Calls are forwarded to the receptionist when the line is busy, after hours or not answered."},
    {k:/messages?\b|take a message|leave a message/i,
     r:"Yes. When no one can take the call, the receptionist takes a message with the caller's name, number and reason, and sends it to you."},
    {k:/accura|mistake|wrong|reliab|correct|make things up|hallucinat/i,
     r:"The receptionist answers only from the prices, hours and rules you give it. Anything it isn't sure about goes to a team member or a message for a callback."},
    {k:/website chat|chat (on|for|on my) (site|website)|chatbot|chat widget|live chat/i,
     r:"Yes. A chat button sits in the corner of the site, answers visitors' questions in the same way and offers a booking. It's the one you're using now."},
    {k:/review|testimonial|case stud|customers say|references?\b|proof/i,
     r:"We'd rather show you than promise. Try a sample call on the Live preview page, and references are shared on your strategy call.", link:'demo'},
    {k:/calendar|crm|integrat|software|google|outlook|sync|spreadsheet|connect|tools/i,
     r:"Bookings go into the calendar you choose, and call summaries can be sent to your existing tools. Which systems we connect is confirmed on your strategy call."},
    {k:/privacy|secur|hipaa|gdpr|\bdata\b|confidential|retention|record(ed|ing)?\b/i,
     r:"Callers are told the call may be recorded. We review privacy and data-handling needs with you before anything goes live. Dental offices get a patient-privacy review on the strategy call."},
    {k:/summar|report|transcript|notes|dashboard|call log/i,
     r:"After each call you get a short summary with the caller's name, the reason for calling and any booking that was made."},
    {k:/24|after.?hours|overnight|night|weekend|holiday|sunday|saturday/i,
     r:"Yes. The receptionist answers around the clock, including nights, weekends and holidays. Urgent calls follow the rules you set."},
    {k:/hours?\b|\bopen\b|opening|closed?\b|when are you|available/i,
     r:"Our team takes calls on weekdays. Pick a time on our booking calendar, which is set to Central Time.", link:'book'},
    {k:/time ?zone|central time|\bcst\b|\bct\b|chicago/i,
     r:"Booking times are set to Central Time (America/Chicago)."},
    {k:/price|pricing|cost|how much|\bfees?\b|quote|\brates?\b|charge|budget|expensive|monthly|per month|plans?\b/i,
     r:"Pricing depends on your call volume and the services you need. Book a free strategy call and we'll give you a quote.", link:'book'},
    {k:/contract|cancel|commit|lock.?in|\bterms?\b|minimum|sign ?up/i,
     r:"Terms are written out and confirmed with you before you start, so you know exactly what's included and how to change or stop the service."},
    {k:/\bfree\b|trial|try it first|no cost/i,
     r:"The strategy call is free, and you can try a sample call on the Live preview page right now. Any trial terms are confirmed on your call.", link:'demo'},
    {k:/demo|sample|preview|example|show me|\btest\b/i,
     r:"Yes. Try a sample call on our Live preview page, or talk to Jessica on the home page.", link:'demo'},
    {k:/book|appointment|schedule|call me|slot|tomorrow|today|this week|meeting|consult|call ?back/i,
     r:"Yes. Pick a free strategy call time on our booking calendar and it will be added right away.", link:'book'},
    {k:/human|person|someone|manager|team member|real person|phone|email|contact|reach|number/i,
     r:"Of course. You can reach our team at chandra@helloaipilot.com or +1 346-889-6827. You can also send an enquiry on the contact page."},
    {k:/address|location|where (are|is) (you|your|the)|based|office|visit|directions|katy|texas|located/i,
     r:"We're based in Katy, Texas, at 28111 S Firethorne Road 605, Katy, Texas 77494."}
  ];
  const FALLBACK="I'm not sure about that one yet. Send us a note on the contact page or call +1 346-889-6827, and the team will follow up.";

  window.HAPAnswer=function(q){
    const text=String(q||'');
    for(const rule of KB){
      if(rule.k.test(text)) return {text:rule.r, link:rule.link||''};
    }
    return {text:FALLBACK, link:''};
  };

  /* The preview page has its own chat and sets this flag; the site launcher stays off there. */
  if(location.pathname.indexOf('/demo/')===0) return;

  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  function later(fn,ms){ timers.push(setTimeout(fn,ms)); }
  function bubble(cls,text){
    const d=document.createElement('div');
    d.className='bub '+cls;
    d.textContent=text;
    msgs.appendChild(d);
    msgs.scrollTop=msgs.scrollHeight;
  }
  function bubbleWithLink(text,kind){
    const d=document.createElement('div');
    d.className='bub a';
    d.appendChild(document.createTextNode(text));
    const wrap=document.createElement('div');
    const a=document.createElement('a');
    a.className='btn demo-pick';
    if(kind==='demo'){
      a.href='/demo/';
      a.textContent='Try a sample call ↗';
    } else {
      a.href=BOOK; a.target='_blank'; a.rel='noopener';
      a.textContent='Pick a time ↗';
    }
    wrap.appendChild(a); d.appendChild(wrap);
    msgs.appendChild(d);
    msgs.scrollTop=msgs.scrollHeight;
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
    const answer=window.HAPAnswer(q);
    const typing=document.createElement('div');
    typing.className='typing';
    typing.innerHTML='<i></i><i></i><i></i>';
    msgs.appendChild(typing);
    msgs.scrollTop=msgs.scrollHeight;
    later(function(){
      typing.remove();
      if(answer.link) bubbleWithLink(answer.text, answer.link);
      else bubble('a',answer.text);
    }, reduce?0:900);
  });

  /* ---------- Jessica: voice demo on the home page (browser speech, no phone call) ---------- */
  const AV=document.getElementById('ava');
  if(!AV) return;
  const log=AV.querySelector('#ava-log');
  const mic=AV.querySelector('#ava-mic');
  const avForm=AV.querySelector('#ava-form');
  const avInput=AV.querySelector('#ava-q');
  const status=AV.querySelector('#ava-status');
  const canSpeak='speechSynthesis' in window;

  function line(cls,text){
    const d=document.createElement('div');
    d.className='bub '+cls;
    d.textContent=text;
    log.appendChild(d);
    log.scrollTop=log.scrollHeight;
  }
  function ask(text, spoken){
    const clean=String(text||'').trim();
    if(!clean) return;
    line('c',clean);
    const a=window.HAPAnswer(clean);
    line('a',a.text);
    if(spoken && canSpeak){
      try{
        speechSynthesis.cancel();
        const u=new SpeechSynthesisUtterance(a.text);
        u.lang='en-US';
        speechSynthesis.speak(u);
      }catch(err){}
    }
  }

  avForm.addEventListener('submit', function(e){
    e.preventDefault();
    ask(avInput.value,false);
    avInput.value='';
  });

  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){
    mic.hidden=true;
    status.textContent='Voice needs Chrome, Edge or Safari. You can still type your question below.';
  } else {
    const rec=new SR();
    rec.lang='en-US';
    rec.interimResults=false;
    rec.maxAlternatives=1;
    let listening=false;
    function setListening(on){
      listening=on;
      mic.setAttribute('aria-pressed',on?'true':'false');
      mic.classList.toggle('on',on);
      mic.textContent=on?'Listening… tap to stop':'Talk to Jessica';
    }
    rec.onresult=function(ev){
      setListening(false);
      ask(ev.results[0][0].transcript,true);
    };
    rec.onerror=function(){
      setListening(false);
      status.textContent="I didn't catch that. Tap the mic to try again, or type your question below.";
    };
    rec.onend=function(){ setListening(false); };
    mic.addEventListener('click', function(){
      if(listening){ rec.stop(); return; }
      status.textContent='';
      try{ rec.start(); setListening(true); }catch(err){ setListening(false); }
    });
  }
})();
