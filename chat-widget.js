/* HelloAIPilot site chat + answer engine. Shared by the chat widget and the Live preview page.
   Scripted answers only (no live AI). Anything not covered gets a helpful route to a person. */
(function(){
  const BOOK='https://calendar.app.google/snJDiGwFyuFC5GVa7';
  const BUY='https://buy.stripe.com/cNi4gt2zX2t05lad8J2kw00';
  const PHONE='+1 346-889-6827';
  const EMAIL='chandra@helloaipilot.com';

  /* ---------- Knowledge base. Order matters: specific topics first, greetings last.
     soft:true = greeting/thanks/bye, only used when nothing else matches.
     l = buttons to show: 'buy' (Stripe checkout), 'book' (strategy call), 'demo' (sample call). ---------- */
  const KB=[
    /* Greetings and small talk */
    {soft:true, k:/^\s*(hi|hello|hey|hiya|yo|good (morning|afternoon|evening))\b/i,
     r:"Hi there! Ask me anything about HelloAIPilot: how it works, pricing, industries, booking, or how the voice sounds."},
    {soft:true, k:/\b(thanks|thank you|thx|cheers|appreciate it)\b/i,
     r:"You're welcome. Is there anything else I can help with?"},
    {soft:true, k:/\b(bye|goodbye|see you|that's all|thats all|nothing else|no more questions)\b/i,
     r:"Thanks for stopping by. Whenever you're ready, you can book a free strategy call."},

    /* Off topic and people */
    {k:/weather|joke|poem|story|sports|\bnews\b|politic|election|recipe|homework|essay|crypto|stock tip/i,
     r:"I can only help with questions about HelloAIPilot. Ask me about how the receptionist works, pricing, industries or booking a call."},
    {k:/are you (a |an )?(real|human|bot|ai|robot|person)|is this (a )?(real|human|bot|ai|person)|talk to (a )?(real )?(person|human)|speak to (a )?(real )?(person|human)|live (agent|person|operator)/i,
     r:"I'm HelloAIPilot's AI assistant. I can answer most questions and book a call. If you'd like a person, email "+EMAIL+" or call "+PHONE+", and the team will get back to you."},
    {k:/contact|email|e-?mail|reach (you|the team|someone)|get in touch|call (you|us|the team)|talk to (someone|the team)|team member|manager|someone to (call|help)|speak with/i,
     r:"You can reach the team at "+EMAIL+" or "+PHONE+". You can also send an enquiry on the contact page, and we'll reply within one business day.", l:['book']},
    {k:/who (is|are|runs|owns|started|founded|built|made)|who'?s behind|owner|founder|chandra|about (you|us|the company|helloaipilot)|tell me about/i,
     r:"HelloAIPilot is based in Houston, Texas, and led by Chandra Vy, M.B.A. You can read more on our About page."},
    {k:/address|location|where (are|is) (you|your|the)|where do you|based|office|visit|directions|houston|texas|located/i,
     r:"We're based in Houston, Texas."},
    {k:/\bhours?\b|business hours|office hours|hours of (operation|business)|opening hours|weekday|are you open|when (are|do) you|when (can|do|will) (i|we) (reach|talk|speak)|team (hours|availability)|are you open/i,
     r:"The team is available on weekdays. To pick a time that suits you, use our booking calendar, which is set to Central Time.", l:['book']},
    {k:/time ?zone|central time|\bcst\b|\bct\b|chicago|eastern|pacific/i,
     r:"Our booking calendar is set to Central Time (America/Chicago)."},

    /* What the product is */
    {k:/what is an? (ai )?receptionist|what('s| is) (an? )?(ai )?receptionist|how is (it|this) different|compared (to|with)|instead of (a|an|my|hiring)/i,
     r:"An AI receptionist answers your phone the way a front-desk person would. It follows the rules you set, answers questions and books appointments. It is available around the clock and can book straight into your calendar while the caller is still on the line."},
    {k:/better than|competitor|answering service|virtual receptionist|call center|smith|ruby|other (service|company|option)/i,
     r:"A live answering service is staffed by people, billed by the minute and works from scripts. An AI receptionist is available 24/7 at a set cost, follows your rules and can book directly into your calendar. A strategy call is the quickest way to compare them for your call volume.", l:['book']},
    {k:/what (do|does) (you|helloaipilot|this|it) do|what is (this|helloaipilot|it)|what do you (offer|sell|provide)|what (services?|exactly)|what exactly|tell me more|how can you help|what can (you|it|she|shailey) do|what can (i|you) ask/i,
     r:"HelloAIPilot gives your business an AI receptionist. It answers every call, answers common questions, takes messages, sends urgent calls to the right person and books appointments into your calendar."},
    {k:/faq|frequently asked/i,
     r:"Our FAQ page covers the common questions in more detail. Ask me here for quick answers, or book a call for anything specific to your business."},

    /* Industries */
    {k:/roof|storm|shingle|gutter|hail|leaking roof/i,
     r:"Our roofing receptionist books free inspections, collects the property and insurance details, and flags active leaks for a fast callback. Try a sample call to hear it.", l:['demo','book']},
    {k:/\bac\b|a\/c|hvac|cooling|furnace|heating|heat pump|air ?condition|technician|thermostat|no heat/i,
     r:"Our AC and HVAC receptionist handles emergency triage, service calls and maintenance bookings, and sends urgent no-cooling calls to a technician. Try a sample call to hear it.", l:['demo','book']},
    {k:/dent|tooth|teeth|orthodont|cleaning|implant|new.?patient|dental/i,
     r:"Our dental receptionist books new-patient and routine visits, answers common questions about hours, insurance and services, and handles reschedules. Patient information is handled carefully, and we review privacy needs before go-live.", l:['demo','book']},
    {k:/hotel|motel|\binn\b|resort|bed and breakfast|bnb|reservation|check.?in|check.?out|room rate|\brooms?\b/i,
     r:"Our hotel receptionist answers questions about rooms and rates, takes reservations and handles check-in questions. Try a sample call to hear it.", l:['demo','book']},
    {k:/real ?estate|realtor|listing|showing|open house|buyer|seller|home for sale|property manag/i,
     r:"Our real estate receptionist answers instant leads, qualifies callers and books showing requests. Try a sample call to hear it.", l:['demo','book']},
    {k:/clinic|medical|doctor|physician|chiropract|therap|vet\b|veterinar|law (firm|office)|attorney|lawyer|salon|barber|spa\b|restaurant|gym|fitness/i,
     r:"Most appointment-based businesses can use a receptionist like this. For clinics, medical or legal offices, we review privacy and compliance needs with you first, then set the rules. A strategy call is the fastest way to see if it fits.", l:['book']},
    {k:/plumb|electric|handyman|landscap|pest|garage door|locksmith|cleaning service|contractor|painter|flooring|remodel|home service/i,
     r:"Most home-service trades can use the same setup. The receptionist learns your services, prices and service areas, then books the visit. Tell us your trade on a strategy call and we'll confirm the details.", l:['book']},
    {k:/industr|which (businesses|industry|trades?|clients?)|who (do|does) (you|it) (serve|work|help)|who is (this|it) for|what (kind|type)s? of (business|compan)|for my (business|company|type)/i,
     r:"We set up receptionists for roofing companies, AC and HVAC, dentists, hotels and real estate teams. If your business is different, tell us on a strategy call and we'll see if it fits.", l:['book']},

    /* Calls and what the receptionist does */
    {k:/missed (call|calls)|\bmiss(ed)?\b|text ?back|unanswered|no answer|go to voicemail|goes to voicemail|voicemail/i,
     r:"When a call goes unanswered, the receptionist can text the caller straight away and keep the conversation going by text, including booking a visit. You can see it on the Live preview page.", l:['demo']},
    {k:/\b(sms|text messages?|texts?|texting|send (a )?text)\b/i,
     r:"Yes. After a missed call the receptionist can send a text right away, and it can send booking confirmations. Text rules for your business are set up on your strategy call."},
    {k:/messages?\b|take a message|leave a message|callback|call back/i,
     r:"Yes. If no one can take the call, the receptionist takes the caller's name, number and reason, then sends it to you. Urgent messages can go to your cell."},
    {k:/emergenc|urgent|no cooling|flood|gas leak|\bgas\b|severe|\bpain\b|burst|active leak|on[- ]?call/i,
     r:"Urgent calls follow the rules you set. For example, a no-cooling call or an active leak can go straight to an on-call person, and the caller gets a callback time. For a life-threatening emergency, always call 911."},
    {k:/transfer|cell|mobile|ring (my|our)|forward (calls )?to (my|our)|hand (it |them )?off|warm transfer|connect me|live person/i,
     r:"Yes. Hot leads and urgent jobs can be transferred to your cell or office line. You choose which calls go through and when. The exact setup is confirmed on your strategy call."},
    {k:/24|24\/7|after.?hours|overnight|night|weekend|holiday|sunday|saturday|always on|round the clock|around the clock/i,
     r:"Yes. The receptionist answers around the clock, including nights, weekends and holidays. Urgent calls follow the rules you set."},
    {k:/how (many|much) calls|how many (calls|lines)|volume|multiple (locations|lines|numbers)|several (locations|offices|trucks)|more than one (location|line|office)|at the same time/i,
     r:"Yes. The receptionist can handle several calls at the same time and can be set up for more than one location or line. Volume and cost are confirmed on your strategy call."},
    {k:/messages? (to|for) my|(caller|customer) (info|information|details)|collect (info|information|details)|what (info|information|details) (does|will) it (collect|take|ask)/i,
     r:"The receptionist collects what you tell it to. Typically that's the caller's name, phone number, reason for calling and a preferred time. We set the list on your strategy call."},
    {k:/accura|mistake|wrong|reliab|correct|make things up|hallucinat|doesn'?t know|don'?t know|unsure|not sure|what if (it|she|shailey)/i,
     r:"The receptionist answers only from the prices, hours and rules you give it. If it isn't sure, it takes a message or passes the caller to a team member, so nothing is made up."},

    /* Voice, language and setup */
    {k:/shailey|jessica|voice|sound|speak|accent|how (does|do) (it|she|he|they) sound|natural|robot|hear (it|her|him)/i,
     r:"You can talk to Shailey on the home page and hear how the receptionist sounds. Your own voice and accent are chosen on your strategy call.", l:['demo']},
    {k:/language|spanish|espa|french|bilingual|translat/i,
     r:"Tell us which languages your customers speak. We confirm the language setup on your strategy call."},
    {k:/how (does|do) (it|this|the (service|system)|you) work|how it works|process|steps|get started|getting started|set ?up|onboard|install|go live|launch|sign ?up/i,
     r:"Here's the process: a short strategy call to learn your services, prices and rules, then we build your receptionist and test it with you. Once you approve it, we connect your phone.", l:['book']},
    {k:/how long|timeline|how soon|how fast|when can|when will|turn ?around|time it takes/i,
     r:"Most setups are finished soon after your strategy call and testing with you. The timing depends on how many rules you need, and we confirm it before you start."},
    {k:/my number|keep (my|our|the) (number|phone)|existing (number|phone)|phone number|switch|\bport\b|forward|carrier|landline|cell phone|\bsim\b|voip|ring group|busy line/i,
     r:"Most businesses keep their current number. Calls are forwarded to the receptionist when the line is busy, after hours or unanswered, so you don't need a new number. We confirm the steps for your phone provider on the call."},
    {k:/calendar|google|outlook|icloud|calendly|jobber|servicetitan|housecall|crm|software|integrat|\bsync\b|spreadsheet|connect (to|with)|tools?\b/i,
     r:"Bookings go into the calendar you choose, and call summaries can be sent to your team. Which calendars and business tools we connect is confirmed on your strategy call."},
    {k:/summar|report|transcript|notes|dashboard|call log|history|recording|analytics/i,
     r:"After each call you get a short summary: who called, why, what was booked and the next step. Call logs and recordings can be reviewed with your team."},
    {k:/privacy|secur|hipaa|gdpr|\bdata\b|confidential|retention|personal (info|information)|is it safe|safe to/i,
     r:"Callers are told that calls may be recorded. We review privacy and data-handling needs with you before anything goes live, including any patient or client information. We'll go through the details on your strategy call."},

    /* Booking */
    {k:/call me|schedule a call|book a call|strategy call|consult|meeting|talk to you|speak to you/i,
     r:"Sure. Pick a free strategy call time on our booking calendar and it's added right away.", l:['book']},
    {k:/\bbook(ing)?\b|appointment|schedule|slot|reserve|availability|available (times|slots)|tomorrow|this week/i,
     r:"Yes, in two ways. Your receptionist books appointments for your customers straight into your calendar. To talk about it for your business, you can also pick a free strategy call time below.", l:['book']},

    /* Pricing, buying and terms */
    {k:/\bbuy\b|purchase|checkout|check out|\bpay\b|payment|pay now|subscribe|\border\b|sign me up|get it now|start now|credit card|invoice|how do i (start|get|sign)/i,
     r:"You can buy your AI receptionist directly through our secure checkout. Payments are handled by Stripe. Want a walkthrough first? Book a free strategy call.", l:['buy','book']},
    {k:/price|pricing|prices|cost|how much|\bfees?\b|quote|\brates?\b|charge|budget|expensive|affordable|monthly|per month|a month|plans?\b|package/i,
     r:"Pricing depends on your call volume, hours and the services you need. Book a free strategy call and we'll give you a quote, or you can buy directly if you already know what you need.", l:['book','buy']},
    {k:/contract|cancel|cancellation|commit|lock.?in|\bterms?\b|minimum|long.?term|refund|money back|guarantee/i,
     r:"Terms are written out and confirmed with you before you start. They cover what's included, how billing works, and how to change or stop the service. For refunds, check the terms at checkout or ask the team."},
    {k:/\bfree\b|trial|try (it|before)|no cost|no obligation|no risk/i,
     r:"The strategy call is free, and you can try a sample call on the Live preview page right now. Any trial details are confirmed on your call.", l:['demo','book']},
    {k:/demo|sample|preview|example|show me|test (it|call)|try (a |the )?(call|it)|listen|hear it|phone line/i,
     r:"Yes. Try a sample call on our Live preview page, or call our demo line at +1 (877) 834-5524.", l:['demo']},
    {k:/review|testimonial|case stud|customers say|references?\b|proof|results|success stor|track record/i,
     r:"We'd rather show you than promise. Try a sample call on the Live preview page, and we'll share examples and references on your strategy call.", l:['demo','book']},
    {k:/capacity|how many (staff|people|team)|replace (my|our|the) (receptionist|staff|front desk)|hire|front desk|receptionist (job|position)/i,
     r:"Many businesses use the receptionist alongside their team, so staff can focus on in-person customers. The right setup depends on your call volume, and we'll map it out on your strategy call.", l:['book']},
    {k:/complain|angry|unhappy|bad experience|problem with (my|the) (service|account)|not working|broken|support|issue with/i,
     r:"Sorry to hear that. Please email "+EMAIL+" or call "+PHONE+" so the team can look into it right away."},
    {k:/partner|reseller|affiliate|agency|jobs?\b|career|hiring you|work (for|with) you|intern/i,
     r:"For partnerships, reseller or job questions, email "+EMAIL+" with a short note and the team will reply."},
    {k:/website chat|chat (on|for|on my) (site|website)|chatbot|chat widget|live chat|this chat|chat ?bot|are you the chat/i,
     r:"Yes. This chat answers visitors' questions on your website and offers a booking. It's the one you're using now. Ask me anything about HelloAIPilot."}
  ];

  const FALLBACK="That's a good question, and I don't have a clear answer for it yet. The fastest way to get it right is a free 30-minute strategy call. You can also email "+EMAIL+" or call "+PHONE+".";

  function linkFor(kind){
    if(kind==='buy') return {kind:'buy', href:BUY, label:'Buy now ↗', ext:true};
    if(kind==='demo') return {kind:'demo', href:'/demo/', label:'Try a sample call ↗', ext:false};
    return {kind:'book', href:BOOK, label:'Pick a time ↗', ext:true};
  }

  /* Returns {text, link, links}. link is kept for the demo page (single 'book' or first kind). */
  window.HAPAnswer=function(q){
    const t=String(q||'').trim();
    const hits=t?KB.filter(function(e){ return e.k.test(t); }):[];
    let use=hits.filter(function(e){ return !e.soft; });
    if(!use.length) use=hits;
    if(!use.length) return {text:FALLBACK, link:'book', links:['book'], fallback:true};
    /* If the visitor asked more than one thing, answer up to two topics. */
    const multi=(t.match(/\?/g)||[]).length>1 || (/\b(and|also|plus)\b/i.test(t) && use.length>1);
    const pick=use.slice(0, multi?2:1);
    const text=pick.map(function(e){ return e.r; }).filter(function(v,i,a){ return a.indexOf(v)===i; }).join(' ');
    const links=[];
    pick.forEach(function(e){ (e.l||[]).forEach(function(x){ if(links.indexOf(x)<0) links.push(x); }); });
    const top=links.slice(0,2);
    return {text:text, link: top.indexOf('book')>=0 ? 'book' : (top[0]||''), links:top};
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
    '<form class="cw-form" id="cw-form" autocomplete="off"><input id="cw-q" maxlength="300" placeholder="Ask anything about HelloAIPilot" aria-label="Type a question"><button class="btn" type="submit">Send</button></form>'+
    '<p class="cw-note">AI assistant. Replies are automated and may not always be right. Appointments are confirmed by email. Please don\'t share card numbers or sensitive personal details in this chat.</p>';

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  const msgs=panel.querySelector('#cw-msgs');
  const form=panel.querySelector('#cw-form');
  const input=panel.querySelector('#cw-q');

  function bubble(cls,text){
    const d=document.createElement('div');
    d.className='bub '+cls;
    d.textContent=text;
    msgs.appendChild(d);
    msgs.scrollTop=msgs.scrollHeight;
  }
  function bubbleWithLinks(text,kinds){
    const d=document.createElement('div');
    d.className='bub a';
    d.appendChild(document.createTextNode(text));
    if(kinds&&kinds.length){
      const wrap=document.createElement('div');
      wrap.className='cw-btns';
      kinds.forEach(function(k){
        const L=linkFor(k);
        const a=document.createElement('a');
        a.className='btn demo-pick';
        a.href=L.href;
        if(L.ext){ a.target='_blank'; a.rel='noopener'; }
        a.textContent=L.label;
        wrap.appendChild(a);
      });
      d.appendChild(wrap);
    }
    msgs.appendChild(d);
    msgs.scrollTop=msgs.scrollHeight;
  }

  function open(){
    panel.hidden=false;
    launcher.setAttribute('aria-expanded','true');
    launcher.classList.add('cw-hide');
    if(!msgs.childElementCount){
      bubble('a',"Hi, I'm the HelloAIPilot assistant. Ask me anything about the receptionist, pricing, industries, setup or booking.");
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

  /* ---- appointment flow and AI fallback ----
     CHAT_API is the n8n webhook that calls ChatGPT and books appointments.
     If it is empty or does not reply, the chat uses its built-in answers. */
  const CHAT_API='https://nexzenfinancials.app.n8n.cloud/webhook/helloaipilot-chat';
  const SCHED_RE=/\b(schedule|appointment|set up a (time|call|meeting)|pick a time|book (an? )?(time|slot|appointment))\b/i;
  const TIME_RE=/(\b(mon|tue|wed|thu|fri|sat|sun)[a-z]*\b|\btoday\b|\btomorrow\b|\b\d{1,2}(:\d{2})?\s*(am|pm)\b|\b\d{1,2}\/\d{1,2}\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2}\b|\bnoon\b|\bmorning\b|\bafternoon\b|\bevening\b)/i;
  const EMAIL_RE=/[^\s@]+@[^\s@]+\.[^\s@]+/;
  let flow=null;        /* null | 'time' | 'email' */
  let pendingWhen='';
  const history=[];   /* recent chat turns sent to ChatGPT for context */

  function postChat(payload){
    if(!CHAT_API) return Promise.resolve(null);
    return fetch(CHAT_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
      .then(function(r){ return r.ok ? r.json() : null; })
      .catch(function(){ return null; });
  }
  function startSchedule(){
    flow='time';
    bubbleWithLinks("Sure. Tell me a day and time that works for you, for example “Thursday at 10am” or “tomorrow afternoon”. You can also pick an open slot yourself with the button below.", ['book']);
  }
  function handleFlow(q){
    if(flow==='time'){
      if(!TIME_RE.test(q)){ bubble('a',"Which day and time works for you? For example “Thursday at 10am”."); return; }
      pendingWhen=q; flow='email';
      bubble('a',"Thanks, I've noted “"+q+"”. What email address should we send the appointment link to?");
      return;
    }
    if(flow==='email'){
      const m=q.match(EMAIL_RE);
      if(!m){ bubble('a',"That doesn't look like an email address. Please type it like name@example.com."); return; }
      const email=m[0], when=pendingWhen;
      flow=null; pendingWhen='';
      postChat({action:'book', when:when, email:email, page:location.pathname}).then(function(res){
        if(res && res.ok){ bubble('a',"Your appointment request for “"+when+"” is booked. We've sent the appointment link to "+email+"."); }
        else if(res && res.reply){ bubble('a', res.reply); }
        else { bubbleWithLinks("Thanks, I've noted “"+when+"” for "+email+". Online booking isn't connected on this page yet, so please pick your time with the button below or email "+EMAIL+".", ['book']); }
      });
    }
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    const q=input.value.trim();
    if(!q) return;
    input.value='';
    bubble('c',q);
    const typing=document.createElement('div');
    typing.className='typing';
    typing.innerHTML='<i></i><i></i><i></i>';
    msgs.appendChild(typing);
    msgs.scrollTop=msgs.scrollHeight;
    const later=function(fn){ setTimeout(function(){ typing.remove(); fn(); }, reduce?0:900); };

    if(flow){ later(function(){ handleFlow(q); }); return; }
    if(SCHED_RE.test(q)){ later(startSchedule); return; }

    /* Every other question goes to ChatGPT through the n8n webhook.
       The built-in answers are only used if the webhook is not set or does not reply. */
    const answer=window.HAPAnswer(q);
    postChat({message:q, page:location.pathname, history:history.slice(-8)}).then(function(res){
      typing.remove();
      if(res && res.reply){
        history.push({role:'user', content:q}, {role:'assistant', content:res.reply});
        bubbleWithLinks(res.reply, []);
      } else {
        bubbleWithLinks(answer.text, answer.links);
      }
    });
  });

})();
