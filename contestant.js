const LIVE_KEY = "surveyShowdownLiveState";
const audienceParams = new URLSearchParams(location.search);
const audienceMode = audienceParams.get("audience") === "1";
const audienceGameId = audienceParams.get("game") || "default";
const audienceQuestionNumber = Number(audienceParams.get("question")) || 1;
const audienceQuestionText = audienceParams.get("text");
let timerEndsAt = 0;

function readLiveState() {
  try { return JSON.parse(localStorage.getItem(LIVE_KEY)); }
  catch { return null; }
}

function renderDisplay(state) {
  if (!state) return;
  document.getElementById("display-counter").textContent = `Question ${state.questionNumber} / ${state.questionCount}`;
  document.getElementById("display-team-a").textContent = state.teamA.name;
  document.getElementById("display-team-b").textContent = state.teamB.name;
  document.getElementById("display-score-a").textContent = state.teamA.score;
  document.getElementById("display-score-b").textContent = state.teamB.score;
  document.getElementById("display-question").textContent = state.question;
  if (state.updatedAt && (!timerEndsAt || state.questionNumber !== window.lastDisplayQuestion)) { timerEndsAt = state.updatedAt + 40000; window.lastDisplayQuestion = state.questionNumber; }
  const activeName = state.activeTeam === "A" ? state.teamA.name : state.activeTeam === "B" ? state.teamB.name : "Admin reveal";
  document.getElementById("display-status").textContent = state.status === "revealed" ? "Answers revealed — please wait" : `${activeName} selected`;
  const board = document.getElementById("display-board");
  board.innerHTML = "";
  state.answers.forEach((answer, index) => {
    const card = document.createElement("article");
    card.className = `display-answer ${answer.revealed ? "is-revealed" : ""}`;
    card.innerHTML = answer.revealed
      ? `<span>${answer.text}</span><strong>${answer.points}</strong>`
      : `<span>${index + 1}</span><strong>?</strong>`;
    board.appendChild(card);
  });
  const baseAudienceUrl = window.SURVEY_SHOWDOWN_CONFIG?.audienceUrl || new URL("contestant.html", location.href).href;
  const audienceUrl = new URL(baseAudienceUrl);
  audienceUrl.searchParams.set("audience", "1");
  audienceUrl.searchParams.set("game", state.gameId);
  audienceUrl.searchParams.set("question", state.questionNumber);
  audienceUrl.searchParams.set("text", state.question);
  document.getElementById("audience-qr").src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(audienceUrl.href)}`;
  document.getElementById("audience-link-note").textContent = "Scan the code and vote for an answer";
}

window.addEventListener("storage", event => {
  if (event.key === LIVE_KEY) renderDisplay(readLiveState());
});
renderDisplay(readLiveState());
setInterval(() => renderDisplay(readLiveState()), 500);
setInterval(() => { const seconds = Math.max(0, Math.ceil((timerEndsAt - Date.now()) / 1000)); document.getElementById("display-timer").textContent = `00:${String(seconds).padStart(2, "0")}`; }, 250);

if (audienceMode) {
  document.body.classList.add("audience-view");
  document.getElementById("audience-question").textContent = audienceQuestionText || "Submit your answer";
  document.getElementById("audience-form").addEventListener("submit", async event => {
    event.preventDefault();
    const answer = document.getElementById("audience-answer").value.trim();
    const status = document.getElementById("audience-status");
    try {
      const config = window.SURVEY_SHOWDOWN_CONFIG;
      const response = await fetch(`${config.supabaseUrl}/rest/v1/audience_answers`, { method: "POST", headers: { apikey: config.supabasePublishableKey, Authorization: `Bearer ${config.supabasePublishableKey}`, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ game_id: audienceGameId, question_number: audienceQuestionNumber, answer }) });
      if (!response.ok) throw new Error();
      event.target.reset(); status.textContent = "Submitted — thanks!"; status.className = "guess-feedback correct";
    } catch { status.textContent = "Could not submit. Ask the host to check Supabase setup."; status.className = "guess-feedback wrong"; }
  });
}
