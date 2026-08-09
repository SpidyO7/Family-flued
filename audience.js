const config = window.SURVEY_SHOWDOWN_CONFIG;
const params = new URLSearchParams(location.search);
const gameId = params.get("game") || "default";
const questionNumber = Number(params.get("question")) || 1;
const questionText = params.get("text");
let liveState = null;

async function getLiveState() {
  try { liveState = JSON.parse(localStorage.getItem("surveyShowdownLiveState")); } catch { liveState = null; }
  if (liveState) document.getElementById("audience-question").textContent = liveState.question;
}
getLiveState(); setInterval(getLiveState, 1000);
if (questionText) document.getElementById("audience-question").textContent = questionText;

document.getElementById("audience-form").addEventListener("submit", async event => {
  event.preventDefault();
  const answer = document.getElementById("audience-answer").value.trim();
  const status = document.getElementById("audience-status");
  status.textContent = "Submitting…";
  try {
    const response = await fetch(`${config.supabaseUrl}/rest/v1/audience_answers`, { method: "POST", headers: { "apikey": config.supabasePublishableKey, "Authorization": `Bearer ${config.supabasePublishableKey}`, "Content-Type": "application/json", "Prefer": "return=minimal" }, body: JSON.stringify({ game_id: gameId, question_number: liveState?.questionNumber || questionNumber, answer }) });
    if (!response.ok) throw new Error();
    event.target.reset(); status.textContent = "Submitted — thanks!"; status.className = "guess-feedback correct";
  } catch { status.textContent = "Could not submit. Check the public setup."; status.className = "guess-feedback wrong"; }
});
