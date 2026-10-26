/* Jessica live voice call via Retell (public key, runs in the browser; no server needed). */
import { RetellClient } from "https://cdn.jsdelivr.net/npm/retell-client-js-sdk@3.0.2/+esm";

const PUBLIC_KEY = "public_key_0afdb535d2b193d7be415";
const AGENT_ID = "agent_d5b9f3bb0acb7706fb389c7efe";

const AV = document.getElementById('ava');
if (AV) {
  const old = AV.querySelector('#ava-mic');
  const mic = old.cloneNode(true);          // drops the browser-speech listeners
  mic.hidden = false;
  old.replaceWith(mic);

  const log = AV.querySelector('#ava-log');
  const status = AV.querySelector('#ava-status');
  const say = AV.querySelector('.ava-say');
  const client = new RetellClient({ key: PUBLIC_KEY });
  const seen = new Set();
  let session = null;
  let timer = null;
  let started = 0;

  function setMic(text, on) {
    mic.textContent = text;
    mic.classList.toggle('on', !!on);
    mic.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  function fmt(sec) { return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }
  function startTimer() {
    started = Date.now();
    clearInterval(timer);
    timer = setInterval(function () {
      status.textContent = 'Connected. Speak now. ' + fmt(Math.floor((Date.now() - started) / 1000));
    }, 1000);
  }
  function addLine(role, text) {
    const d = document.createElement('div');
    d.className = 'bub ' + (role === 'user' ? 'c' : 'a');
    d.textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  }
  function endedUI(msg) {
    clearInterval(timer);
    timer = null;
    session = null;
    setMic('Talk to Jessica', false);
    status.textContent = msg || 'Call ended. Tap "Talk to Jessica" to start again.';
  }

  mic.addEventListener('click', function () {
    if (session) {
      setMic('Ending…', false);
      session.end().catch(function () { endedUI(); });
      return;
    }
    setMic('Connecting…', false);
    status.textContent = 'Connecting to Jessica…';
    seen.clear();
    log.innerHTML = '';
    try {
      session = client.createWebCall({
        agent_id: AGENT_ID,
        hooks: {
          onStatus: function (s) {
            if (s === 'live') {
              setMic('End call', true);
              startTimer();
            }
          },
          onTranscript: function (t) {
            for (const u of t) {
              if ((u.role === 'user' || u.role === 'agent') && !seen.has(u.id)) {
                seen.add(u.id);
                addLine(u.role, u.content);
              }
            }
          },
          onEnd: function () { endedUI(); },
          onError: function (err) {
            endedUI('Could not connect the call. ' + (err && err.message ? err.message : 'Please check your microphone and try again.'));
          }
        }
      });
    } catch (err) {
      endedUI('Could not start the call. Please try again.');
    }
  });
}
