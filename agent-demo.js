/* Demo-line cards on the Industries page: tap a card to talk to that receptionist in the browser (Retell web call). */
import { RetellClient } from "https://cdn.jsdelivr.net/npm/retell-client-js-sdk@3.0.2/+esm";

const PUBLIC_KEY = "public_key_0afdb535d2b193d7be415";
const PANEL = document.getElementById('dn-call');
const CARDS = document.querySelectorAll("[data-agent]");

if (PANEL && CARDS.length) {
  const log = PANEL.querySelector('#dn-log');
  const status = PANEL.querySelector('#dn-status');
  const title = PANEL.querySelector('#dn-title');
  const endBtn = PANEL.querySelector('#dn-end');
  const client = new RetellClient({ key: PUBLIC_KEY });
  let session = null;
  let timer = null;
  let started = 0;
  let seq = 0;            // each call gets an id; old callbacks are ignored once a newer call starts

  function fmt(sec) { return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }
  function addLine(role, text) {
    const d = document.createElement('div');
    d.className = 'bub ' + (role === 'user' ? 'c' : 'a');
    d.textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  }
  function stopTimer() { clearInterval(timer); timer = null; }
  function finish(id, msg) {
    if (id !== seq) return;
    stopTimer();
    session = null;
    endBtn.hidden = true;
    CARDS.forEach(c => c.classList.remove('on'));
    if (msg) {
      status.textContent = msg;   // errors stay visible so the visitor can read them
    } else {
      PANEL.hidden = true;        // normal end: close the panel
      log.innerHTML = '';
    }
  }

  function start(card) {
    const id = ++seq;
    if (session) { try { session.end(); } catch (e) {} session = null; }
    window.dispatchEvent(new CustomEvent('hap-call-start', { detail: { src: 'demo' } }));
    stopTimer();
    CARDS.forEach(c => c.classList.toggle('on', c === card));
    title.textContent = card.dataset.name + ' · ' + card.dataset.ind;
    log.innerHTML = '';
    endBtn.hidden = false;
    const slot = card.closest('.agent-slot');
    if (slot) slot.insertAdjacentElement('afterend', PANEL);
    PANEL.hidden = false;
    status.textContent = 'Connecting to ' + card.dataset.name + '…';
    PANEL.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    try {
      session = client.createWebCall({
        agent_id: card.dataset.agent,
        transcript: true,
        hooks: {
          onStatus: function (s) {
            if (id !== seq) return;
            if (s === 'live') {
              started = Date.now();
              stopTimer();
              timer = setInterval(function () {
                status.textContent = 'Connected. Speak now. ' + fmt(Math.floor((Date.now() - started) / 1000));
              }, 1000);
            }
          },
          onTranscript: function (t) {
            if (id !== seq) return;
            log.innerHTML = '';
            for (const u of t) {
              if (u.role === 'user' || u.role === 'agent') addLine(u.role, u.content);
            }
          },
          onEnd: function () { finish(id); },
          onError: function (err) {
            finish(id, 'Could not connect the call. ' + (err && err.message ? err.message : 'Please check your microphone and try again.'));
          }
        }
      });
    } catch (err) {
      finish(id, 'Could not start the call. Please try again.');
    }
  }

  CARDS.forEach(card => card.addEventListener('click', () => start(card)));

  endBtn.addEventListener('click', function () {
    if (!session) return;
    status.textContent = 'Ending call…';
    session.end().catch(() => finish(seq));
  });

  // Another call on the page (the home-page Shailey demo) ends this one.
  window.addEventListener('hap-call-start', function (e) {
    if (e.detail && e.detail.src === 'demo') return;
    if (session) { try { session.end(); } catch (err) {} session = null; finish(seq); }
  });
}
