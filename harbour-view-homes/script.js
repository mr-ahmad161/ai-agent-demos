const MSG1 = "I want a 3 bedroom house in London under £650,000 please";
const NAME = "James Carter";
const DAY = "Saturday";
const TIME = "11:00 AM";
const GREET = "Hello. I am Noah, the AI property assistant at Harbour View Homes. What kind of home are you looking for?";
const DAYMSG = "Great choice. I found a 3 bedroom house in Greenwich for £625,000. Which day suits you for a viewing?";
const TIMEMSG = "Here are the open viewing times for Saturday. Tap one to book it.";
const NAMEMSG = "Perfect, 11:00 AM is held for you. What name should I put on the viewing?";
const DONEMSG = "All done. Your viewing is booked and your reminder is set.";
const TREATS = ["3 Bed House", "2 Bed Flat", "1 Bed Flat"];
const DAYS = ["Friday", "Saturday", "Sunday"];
const TIMES = ["10:00 AM", "11:00 AM", "1:00 PM", "3:00 PM"];

const qs = new URLSearchParams(location.search);
if (qs.has("cz")) document.body.classList.add("cz");

const msgsEl = document.getElementById("msgs");
const chipsEl = document.getElementById("chips");
const inputEl = document.getElementById("chatText");

function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
function bubble(who, text) { return '<div class="msg ' + who + '">' + esc(text) + "</div>"; }
function typingBubble() { return '<div class="msg agent typing">● ● ●</div>'; }
function bookedCard() {
  return '<div class="booked" id="bookedCard"><div class="bt">Viewing confirmed</div>' +
    '<div class="bl">3 Bedroom House, Greenwich</div>' +
    '<div class="bl">Saturday at 11:00 AM</div>' +
    '<div class="bl">Client: James Carter</div>' +
    '<div class="bs">Noah will send a friendly reminder before your viewing.</div></div>';
}
function chipRow(kind, items, sel) {
  return items.map(t => '<button class="chip' + (t === sel ? " sel" : "") + '" data-kind="' + kind + '" data-v="' + t + '">' + t + "</button>").join("");
}

let stage = "start";
function render(state, typedText) {
  let h = bubble("agent", GREET);
  let chips = chipRow("treat", TREATS, null);
  let inputVal = "";
  const upToSent = ["sent","typing","days","daypicked","typing2","times","timepicked","typing3","nameask","typed2","namesent","typing4","confirmed"].includes(state);
  const upToDays = ["days","daypicked","typing2","times","timepicked","typing3","nameask","typed2","namesent","typing4","confirmed"].includes(state);
  const upToDayPicked = ["daypicked","typing2","times","timepicked","typing3","nameask","typed2","namesent","typing4","confirmed"].includes(state);
  const upToTimes = ["times","timepicked","typing3","nameask","typed2","namesent","typing4","confirmed"].includes(state);
  const upToTimePicked = ["timepicked","typing3","nameask","typed2","namesent","typing4","confirmed"].includes(state);
  const upToNameAsk = ["nameask","typed2","namesent","typing4","confirmed"].includes(state);
  const upToNameSent = ["namesent","typing4","confirmed"].includes(state);
  if (state === "typed1") inputVal = typedText || "";
  if (upToSent) h += bubble("user", MSG1);
  if (state === "typing") h += typingBubble();
  if (upToDays) h += bubble("agent", DAYMSG);
  if (upToDays && !upToDayPicked) chips = chipRow("day", DAYS, null);
  if (upToDayPicked) { h += bubble("user", DAY + " please"); chips = chipRow("day", DAYS, DAY); }
  if (state === "typing2") h += typingBubble();
  if (upToTimes) h += bubble("agent", TIMEMSG);
  if (upToTimes && !upToTimePicked) chips = chipRow("time", TIMES, null);
  if (upToTimePicked) { h += bubble("user", TIME + " please"); chips = chipRow("time", TIMES, TIME); }
  if (state === "typing3") h += typingBubble();
  if (upToNameAsk) { h += bubble("agent", NAMEMSG); chips = ""; }
  if (state === "typed2") inputVal = typedText || "";
  if (upToNameSent) h += bubble("user", NAME);
  if (state === "typing4") h += typingBubble();
  if (state === "confirmed") { h += bubble("agent", DONEMSG) + bookedCard(); chips = ""; }
  if (["typing","typing2","typing3","typing4"].includes(state)) chips = state === "typing" ? chipRow("treat", TREATS, null) : chips;
  msgsEl.innerHTML = h;
  chipsEl.innerHTML = chips;
  inputEl.value = inputVal;
  inputEl.scrollLeft = 9999;
  msgsEl.scrollTop = msgsEl.scrollHeight;
  requestAnimationFrame(() => { msgsEl.scrollTop = msgsEl.scrollHeight; });
  setTimeout(() => { msgsEl.scrollTop = msgsEl.scrollHeight; }, 150);
  bindChips();
}

function agentSay(nextState, delay) {
  setTimeout(() => render(nextState), delay || 650);
}
function onSend() {
  const v = inputEl.value.trim();
  if (!v) return;
  if (stage === "start") { stage = "day"; render("sent"); agentSay("typing", 500); setTimeout(() => { render("days"); }, 1400); }
  else if (stage === "name") { stage = "done"; render("namesent"); agentSay("typing4", 500); setTimeout(() => { render("confirmed"); }, 1400); }
}
function onChip(kind, val) {
  if (kind === "treat" && stage === "start") { inputEl.value = "I need a " + val.toLowerCase() + " please"; onSend(); }
  else if (kind === "day" && stage === "day") { stage = "time"; render("daypicked"); agentSay("typing2", 500); setTimeout(() => { render("times"); }, 1400); }
  else if (kind === "time" && stage === "time") { stage = "name"; render("timepicked"); agentSay("typing3", 500); setTimeout(() => { render("nameask"); }, 1400); }
}
function bindChips() {
  chipsEl.querySelectorAll(".chip").forEach(c => c.addEventListener("click", () => onChip(c.dataset.kind, c.dataset.v)));
}
document.getElementById("sendBtn").addEventListener("click", onSend);
inputEl.addEventListener("keydown", e => { if (e.key === "Enter") onSend(); });
const heroBtn = document.getElementById("heroBook");
if (heroBtn) heroBtn.addEventListener("click", () => document.getElementById("booking").scrollIntoView());

const perksN = parseInt(qs.get("perks") || "0", 10);
document.querySelectorAll(".perk").forEach(p => { if (parseInt(p.dataset.perk, 10) <= perksN) p.classList.add("lit"); });

const st = qs.get("state");
if (qs.has("typed1")) { render("typed1", MSG1.slice(0, parseInt(qs.get("typed1"), 10))); stage = "start"; }
else if (qs.has("typed2")) { render("typed2", NAME.slice(0, parseInt(qs.get("typed2"), 10))); stage = "name"; }
else if (st) {
  render(st);
  stage = { days: "day", daypicked: "time", times: "time", timepicked: "name", nameask: "name", confirmed: "done" }[st] || stage;
} else {
  render("closed");
}
