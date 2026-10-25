const MSG1 = "I need a haircut and colour please";
const NAME = "Emma Wilson";
const DAY = "Tomorrow";
const TIME = "2:00 PM";
const GREET = "Hello. I am Mia, the AI receptionist at Velvet Petal Beauty Studio. What service can I book for you today?";
const DAYMSG = "Lovely choice. A haircut and colour is $133 and takes about 90 minutes. Which day suits you best?";
const TIMEMSG = "Here are the open times for tomorrow. Tap one to book it.";
const NAMEMSG = "Perfect, 2:00 PM is held for you. What name should I put on the booking?";
const DONEMSG = "All done. Your visit is booked and your reminder is set.";
const TREATS = ["Haircut", "Colour", "Facial"];
const DAYS = ["Today", "Tomorrow", "Saturday"];
const TIMES = ["10:00 AM", "2:00 PM", "4:30 PM", "6:00 PM"];

const qs = new URLSearchParams(location.search);
if (qs.has("cz")) document.body.classList.add("cz");

const msgsEl = document.getElementById("msgs");
const chipsEl = document.getElementById("chips");
const inputEl = document.getElementById("chatText");

function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
function bubble(who, text) { return '<div class="msg ' + who + '">' + esc(text) + "</div>"; }
function typingBubble() { return '<div class="msg agent typing">● ● ●</div>'; }
function bookedCard() {
  return '<div class="booked" id="bookedCard"><div class="bt">Booking confirmed</div>' +
    '<div class="bl">Haircut and Colour</div>' +
    '<div class="bl">Tomorrow at 2:00 PM</div>' +
    '<div class="bl">Client: Emma Wilson</div>' +
    '<div class="bs">Mia will send a friendly reminder before your visit.</div></div>';
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
