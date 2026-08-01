/* ==========================================================================
   SURVEY SHOWDOWN — Game Logic
   Organized in sections:
     1. Preloaded question bank
     2. LocalStorage helpers for custom quizzes
     3. Sound effects (Web Audio API — no external audio files needed)
     4. Screen navigation
     5. Quiz editor screen logic
     6. Setup screen logic
     7. Core gameplay state machine
   ========================================================================== */

/* -------------------------------------------------------------------------
   1. PRELOADED QUESTION BANK
   Campus-life survey questions written for college students (~70% Assamese,
   ~30% wider Northeast). Short, natural, one-to-two-word answers — the way
   100 real students on campus would actually blurt them out.
   ------------------------------------------------------------------------- */
const PRELOADED_QUESTIONS = [
  { question: "Name the first thing you check when you wake up.",
    answers: [{text:"Phone",points:34},{text:"Time",points:22},{text:"Messages",points:18},{text:"Alarm",points:14},{text:"Instagram",points:8},{text:"Nothing",points:4}] },
  { question: "Name something every hostel room has.",
    answers: [{text:"Charger",points:28},{text:"Bucket",points:22},{text:"Speaker",points:18},{text:"Mirror",points:14},{text:"Kettle",points:10},{text:"Iron",points:8}] },
  { question: "Name a canteen snack students can't live without.",
    answers: [{text:"Maggi",points:30},{text:"Momo",points:24},{text:"Samosa",points:20},{text:"Tea",points:14},{text:"Chowmein",points:8},{text:"Roll",points:4}] },
  { question: "Name something students do in a boring class.",
    answers: [{text:"Sleep",points:30},{text:"Phone",points:26},{text:"Doodle",points:16},{text:"Chat",points:14},{text:"Bunk",points:8},{text:"Reels",points:6}] },
  { question: "Name the first word that pops into your head when you hear 'exam'.",
    answers: [{text:"Stress",points:28},{text:"Backlog",points:22},{text:"Panic",points:18},{text:"Notes",points:16},{text:"Coffee",points:10},{text:"Pray",points:6}] },
  { question: "Name something every fresher feels in week one.",
    answers: [{text:"Lost",points:28},{text:"Shy",points:24},{text:"Nervous",points:18},{text:"Excited",points:16},{text:"Confused",points:10},{text:"Homesick",points:4}] },
  { question: "Name a popular hangout spot for students.",
    answers: [{text:"Canteen",points:28},{text:"Riverside",points:22},{text:"Fancy Bazaar",points:18},{text:"Café",points:16},{text:"Ground",points:10},{text:"Park",points:6}] },
  { question: "Name something you need on a rainy campus day.",
    answers: [{text:"Umbrella",points:32},{text:"Raincoat",points:22},{text:"Boots",points:18},{text:"Jacket",points:14},{text:"Tea",points:9},{text:"Slippers",points:5}] },
  { question: "Name something students binge on during exam season.",
    answers: [{text:"Maggi",points:28},{text:"Coffee",points:24},{text:"Chips",points:18},{text:"Chocolate",points:14},{text:"Chai",points:10},{text:"Biscuits",points:6}] },
  { question: "Name a Gen-Z word students use all the time.",
    answers: [{text:"Bro",points:26},{text:"Vibe",points:22},{text:"Slay",points:18},{text:"Cringe",points:16},{text:"Sus",points:10},{text:"Mood",points:8}] },
  { question: "Name something you do on a college weekend.",
    answers: [{text:"Sleep",points:28},{text:"Movie",points:22},{text:"Outing",points:18},{text:"Shopping",points:14},{text:"Netflix",points:10},{text:"Party",points:8}] },
  { question: "Name a mobile app students open the most.",
    answers: [{text:"Instagram",points:32},{text:"WhatsApp",points:26},{text:"YouTube",points:18},{text:"Snapchat",points:12},{text:"Spotify",points:8},{text:"BGMI",points:4}] },
  { question: "Name something every friend group has one of.",
    answers: [{text:"Foodie",points:24},{text:"Topper",points:20},{text:"Jokester",points:18},{text:"Latecomer",points:16},{text:"Photographer",points:12},{text:"Drama queen",points:10}] },
  { question: "Name a reason students skip breakfast.",
    answers: [{text:"Late",points:30},{text:"Lazy",points:24},{text:"Sleep",points:18},{text:"Diet",points:14},{text:"No time",points:8},{text:"Broke",points:6}] },
  { question: "Name something you'll always hear in a Bihu playlist.",
    answers: [{text:"Dhol",points:30},{text:"Pepa",points:24},{text:"Gogona",points:18},{text:"Xutuli",points:14},{text:"Toka",points:8},{text:"Bihu geet",points:6}] },
  { question: "Name a must-have Bihu outfit item.",
    answers: [{text:"Gamosa",points:30},{text:"Mekhela",points:24},{text:"Dhoti",points:18},{text:"Jaapi",points:14},{text:"Kurta",points:8},{text:"Sador",points:6}] },
  { question: "Name something students eat during Bihu.",
    answers: [{text:"Pitha",points:30},{text:"Laru",points:24},{text:"Jolpan",points:18},{text:"Chira",points:14},{text:"Curd",points:8},{text:"Payash",points:6}] },
  { question: "Name a popular Assamese street food.",
    answers: [{text:"Jhalmuri",points:26},{text:"Momo",points:24},{text:"Pani puri",points:18},{text:"Ghugni",points:14},{text:"Alu chop",points:10},{text:"Piyaji",points:8}] },
  { question: "Name something you'll find at a college fest.",
    answers: [{text:"Music",points:26},{text:"Food stalls",points:22},{text:"Dance",points:18},{text:"Crowd",points:14},{text:"Selfies",points:12},{text:"Chaos",points:8}] },
  { question: "Name a common excuse for missing class.",
    answers: [{text:"Overslept",points:28},{text:"Traffic",points:22},{text:"Sick",points:18},{text:"Rain",points:14},{text:"Bus",points:10},{text:"Lazy",points:8}] },
  { question: "Name something you do right before an exam.",
    answers: [{text:"Pray",points:26},{text:"Cram",points:22},{text:"Panic",points:20},{text:"Skim",points:14},{text:"Copy",points:10},{text:"Blank out",points:8}] },
  { question: "Name a local transport students use to reach college.",
    answers: [{text:"Auto",points:30},{text:"Bus",points:26},{text:"Bike",points:18},{text:"Cycle",points:12},{text:"Sumo",points:8},{text:"Walk",points:6}] },
  { question: "Name something every college group chat is full of.",
    answers: [{text:"Memes",points:28},{text:"Spam",points:22},{text:"Notes",points:18},{text:"Gossip",points:14},{text:"Assignments",points:10},{text:"Silence",points:8}] },
  { question: "Name a snack students order on a rainy day.",
    answers: [{text:"Maggi",points:30},{text:"Pakora",points:24},{text:"Tea",points:20},{text:"Momo",points:16},{text:"Jalebi",points:10}] },
  { question: "Name something you see everywhere during Durga Puja.",
    answers: [{text:"Pandal",points:28},{text:"Lights",points:22},{text:"Dhunuchi",points:16},{text:"Bhog",points:14},{text:"Crowd",points:12},{text:"Sindoor",points:8}] },
  { question: "Name a reason students are broke by month-end.",
    answers: [{text:"Food",points:28},{text:"Shopping",points:22},{text:"Outing",points:18},{text:"Recharge",points:14},{text:"Rent",points:10},{text:"Party",points:8}] },
  { question: "Name a popular hill station NE students visit on trips.",
    answers: [{text:"Shillong",points:30},{text:"Tawang",points:22},{text:"Kohima",points:18},{text:"Ziro",points:14},{text:"Kalimpong",points:10},{text:"Cherrapunji",points:6}] },
  { question: "Name something a student packs for a college trip.",
    answers: [{text:"Clothes",points:26},{text:"Charger",points:22},{text:"Speaker",points:18},{text:"Snacks",points:16},{text:"Camera",points:10},{text:"Cards",points:8}] },
  { question: "Name a common nickname students call each other.",
    answers: [{text:"Bro",points:24},{text:"Dude",points:20},{text:"Buddy",points:18},{text:"Da",points:16},{text:"Bhai",points:14},{text:"Boss",points:8}] },
  { question: "Name something students do to kill time in the hostel.",
    answers: [{text:"Scroll",points:28},{text:"Sleep",points:22},{text:"Gossip",points:18},{text:"Netflix",points:14},{text:"Cards",points:10},{text:"Music",points:8}] },
  { question: "Name a genre of music popular among college students.",
    answers: [{text:"Hip-hop",points:26},{text:"Pop",points:22},{text:"Assamese",points:18},{text:"Bollywood",points:16},{text:"Lo-fi",points:10},{text:"EDM",points:8}] },
  { question: "Name something you do the night before an assignment is due.",
    answers: [{text:"Cram",points:28},{text:"Copy",points:22},{text:"Google",points:18},{text:"Stress",points:14},{text:"Cry",points:10},{text:"Panic",points:8}] },
  { question: "Name a reason students visit the college canteen.",
    answers: [{text:"Hungry",points:28},{text:"Break",points:22},{text:"Chill",points:18},{text:"Gossip",points:16},{text:"Wifi",points:10},{text:"Bored",points:6}] },
  { question: "Name something students do on the first rainy day of the season.",
    answers: [{text:"Selfie",points:26},{text:"Tea",points:22},{text:"Bunk",points:18},{text:"Puddles",points:14},{text:"Pakora",points:12},{text:"Songs",points:8}] }
];

/* -------------------------------------------------------------------------
   2. LOCALSTORAGE HELPERS FOR CUSTOM QUIZZES
   ------------------------------------------------------------------------- */
const STORAGE_KEY = "surveyShowdown_customQuestions";

function loadCustomQuestions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("Could not read custom questions from localStorage", e);
    return [];
  }
}

function saveCustomQuestions(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("Could not save custom questions to localStorage", e);
  }
}

/* -------------------------------------------------------------------------
   3. SOUND EFFECTS — generated with the Web Audio API (no external files,
   so the game works fully offline and has zero licensing concerns).
   ------------------------------------------------------------------------- */
const AudioFX = (() => {
  let ctx = null;
  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  function tone(freq, start, duration, type = "sine", gain = 0.2) {
    const c = getCtx();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = 0;
    osc.connect(g).connect(c.destination);
    const t0 = c.currentTime + start;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }

  return {
    correct() {
      // bright ascending "ding-ding" — pleasant confirmation
      tone(880, 0, 0.18, "triangle", 0.22);
      tone(1174.66, 0.08, 0.22, "triangle", 0.22);
    },
    strike() {
      // harsh low buzz
      tone(140, 0, 0.35, "sawtooth", 0.25);
      tone(110, 0.05, 0.3, "sawtooth", 0.2);
    },
    steal() {
      tone(660, 0, 0.15, "square", 0.15);
      tone(880, 0.12, 0.15, "square", 0.15);
      tone(1100, 0.24, 0.2, "square", 0.15);
    },
    fanfare() {
      // simple victory arpeggio
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.14, 0.3, "triangle", 0.2));
    }
  };
})();

/* -------------------------------------------------------------------------
   4. SCREEN NAVIGATION
   ------------------------------------------------------------------------- */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

document.getElementById("btn-start-game").addEventListener("click", () => {
  refreshSourceHint();
  showScreen("screen-setup");
});
document.getElementById("btn-create-quiz").addEventListener("click", () => {
  renderCustomQuestionList();
  showScreen("screen-editor");
});
document.getElementById("btn-rules").addEventListener("click", () => showScreen("screen-rules"));
document.getElementById("btn-rules-back").addEventListener("click", () => showScreen("screen-home"));
document.getElementById("btn-setup-back").addEventListener("click", () => showScreen("screen-home"));
document.getElementById("btn-editor-back").addEventListener("click", () => showScreen("screen-home"));
document.getElementById("btn-quit").addEventListener("click", () => {
  if (confirm("Quit the current match and return home?")) showScreen("screen-home");
});
document.getElementById("btn-end-home").addEventListener("click", () => showScreen("screen-home"));

/* ==========================================================================
   5. QUIZ EDITOR SCREEN LOGIC
   ========================================================================== */
const answerRowsEl = document.getElementById("answer-rows");

function addAnswerRow(text = "", points = "") {
  const row = document.createElement("div");
  row.className = "answer-row";
  row.innerHTML = `
    <input type="text" class="ans-text" placeholder="Answer text" value="${escapeHtml(text)}" />
    <input type="number" class="ans-points" placeholder="Pts" min="1" max="99" value="${points}" />
    <button type="button" class="remove-row" title="Remove">✕</button>
  `;
  row.querySelector(".remove-row").addEventListener("click", () => row.remove());
  answerRowsEl.appendChild(row);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function resetEditorForm() {
  document.getElementById("edit-question").value = "";
  answerRowsEl.innerHTML = "";
  for (let i = 0; i < 4; i++) addAnswerRow();
  document.getElementById("editor-status").textContent = "";
}

document.getElementById("btn-add-answer-row").addEventListener("click", () => {
  const rowCount = answerRowsEl.querySelectorAll(".answer-row").length;
  if (rowCount >= 8) { alert("Maximum 8 answers per question."); return; }
  addAnswerRow();
});

document.getElementById("btn-save-question").addEventListener("click", () => {
  const questionText = document.getElementById("edit-question").value.trim();
  const rows = answerRowsEl.querySelectorAll(".answer-row");
  const answers = [];

  rows.forEach(row => {
    const text = row.querySelector(".ans-text").value.trim();
    const points = parseInt(row.querySelector(".ans-points").value, 10);
    if (text && !isNaN(points) && points > 0) {
      answers.push({ text, points });
    }
  });

  const statusEl = document.getElementById("editor-status");

  if (!questionText) {
    statusEl.style.color = "var(--strike-red)";
    statusEl.textContent = "Please enter a question.";
    return;
  }
  if (answers.length < 2) {
    statusEl.style.color = "var(--strike-red)";
    statusEl.textContent = "Add at least 2 valid answers with points.";
    return;
  }

  answers.sort((a, b) => b.points - a.points);

  const customList = loadCustomQuestions();
  customList.push({
    id: "custom_" + Date.now(),
    question: questionText,
    answers
  });
  saveCustomQuestions(customList);

  statusEl.style.color = "var(--success-green)";
  statusEl.textContent = "Saved! ✓";
  resetEditorForm();
  renderCustomQuestionList();
});

function renderCustomQuestionList() {
  const list = loadCustomQuestions();
  const container = document.getElementById("custom-question-list");
  document.getElementById("custom-count").textContent = list.length;

  if (list.length === 0) {
    container.innerHTML = `<p class="empty-note">No custom questions yet. Add one above!</p>`;
    return;
  }

  container.innerHTML = "";
  list.forEach(q => {
    const item = document.createElement("div");
    item.className = "custom-question-item";
    item.innerHTML = `
      <div>
        <div class="cq-text">${escapeHtml(q.question)}</div>
        <div class="cq-meta">${q.answers.length} answers</div>
      </div>
      <button data-id="${q.id}">Delete</button>
    `;
    item.querySelector("button").addEventListener("click", () => {
      const updated = loadCustomQuestions().filter(x => x.id !== q.id);
      saveCustomQuestions(updated);
      renderCustomQuestionList();
    });
    container.appendChild(item);
  });
}

resetEditorForm(); // pre-populate 4 empty answer rows on load

/* ==========================================================================
   6. SETUP SCREEN LOGIC
   ========================================================================== */
let selectedSource = "preloaded";

document.querySelectorAll("#question-source-group .chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll("#question-source-group .chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    selectedSource = chip.dataset.source;
    refreshSourceHint();
  });
});

function refreshSourceHint() {
  const custom = loadCustomQuestions();
  const hintEl = document.getElementById("source-hint");
  if (selectedSource === "preloaded") {
    hintEl.textContent = `${PRELOADED_QUESTIONS.length} ready-made questions.`;
  } else if (selectedSource === "custom") {
    hintEl.textContent = custom.length
      ? `${custom.length} custom question(s) saved.`
      : "You have no custom questions yet — add some from the home screen first!";
  } else {
    hintEl.textContent = `${PRELOADED_QUESTIONS.length} preloaded + ${custom.length} custom = ${PRELOADED_QUESTIONS.length + custom.length} total.`;
  }
}

const roundsSlider = document.getElementById("input-rounds");
roundsSlider.addEventListener("input", () => {
  document.getElementById("rounds-value").textContent = roundsSlider.value;
});

document.getElementById("btn-setup-play").addEventListener("click", () => {
  const nameA = document.getElementById("input-team-a").value.trim() || "Team A";
  const nameB = document.getElementById("input-team-b").value.trim() || "Team B";
  const numRounds = parseInt(roundsSlider.value, 10);

  let pool = [];
  if (selectedSource === "preloaded") pool = [...PRELOADED_QUESTIONS];
  else if (selectedSource === "custom") pool = [...loadCustomQuestions()];
  else pool = [...PRELOADED_QUESTIONS, ...loadCustomQuestions()];

  if (pool.length === 0) {
    alert("No questions available for that source. Try 'Preloaded' or add a custom quiz first.");
    return;
  }

  // Shuffle and trim to requested round count (reuse if pool smaller than rounds)
  pool = shuffle(pool);
  const questions = [];
  for (let i = 0; i < numRounds; i++) {
    questions.push(pool[i % pool.length]);
  }

  startMatch(nameA, nameB, questions);
});

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ==========================================================================
   7. CORE GAMEPLAY STATE MACHINE
   ========================================================================== */
let game = null; // holds the full match state

function startMatch(nameA, nameB, questions) {
  game = {
    teamA: { name: nameA, score: 0 },
    teamB: { name: nameB, score: 0 },
    questions,
    qIndex: 0,
    controllingTeam: null, // 'A' or 'B'
    strikes: 0,
    revealedIndices: new Set(),
    pointsEarnedThisQuestion: 0,
    inStealMode: false
  };
  document.getElementById("score-name-a").textContent = nameA;
  document.getElementById("score-name-b").textContent = nameB;
  showScreen("screen-game");
  loadQuestion();
}

function currentQuestion() {
  return game.questions[game.qIndex];
}

function loadQuestion() {
  const q = currentQuestion();
  game.strikes = 0;
  game.revealedIndices = new Set();
  game.pointsEarnedThisQuestion = 0;
  game.inStealMode = false;
  game.controllingTeam = null;

  document.getElementById("question-text").textContent = q.question;
  document.getElementById("question-counter").textContent =
    `Question ${game.qIndex + 1} / ${game.questions.length}`;
  updateAnswersRemaining();
  renderStrikes();
  renderScores();
  buildAnswerBoard();

  document.getElementById("btn-next-question").style.display = "none";
  document.getElementById("guess-row").style.display = "flex";
  document.getElementById("btn-strike").style.display = "inline-block";
  document.getElementById("btn-reveal-remaining").style.display = "inline-block";

  const guessInput = document.getElementById("input-guess");
  guessInput.value = "";
  guessInput.classList.remove("shake");
  guessInput.disabled = true;
  document.getElementById("btn-submit-guess").disabled = true;
  document.getElementById("btn-strike").disabled = true;
  document.getElementById("btn-reveal-remaining").disabled = true;

  openFaceOff();
}

function buildAnswerBoard() {
  const board = document.getElementById("answer-board");
  board.innerHTML = "";
  const q = currentQuestion();

  q.answers.forEach((ans, idx) => {
    const slot = document.createElement("div");
    slot.className = "answer-slot";
    slot.dataset.index = idx;
    slot.innerHTML = `
      <div class="slot-inner">
        <div class="slot-face slot-front">${idx + 1}</div>
        <div class="slot-face slot-back">
          <span class="ans-label">${escapeHtml(ans.text)}</span>
          <span class="ans-points">${ans.points}</span>
        </div>
      </div>
    `;
    board.appendChild(slot);
  });
}

function updateAnswersRemaining() {
  const q = currentQuestion();
  const remaining = q.answers.length - game.revealedIndices.size;
  document.getElementById("answers-remaining").textContent =
    `${remaining} of ${q.answers.length} answers still on the board`;
}

function renderStrikes() {
  document.querySelectorAll(".strike-x").forEach(el => {
    const n = parseInt(el.dataset.n, 10);
    el.classList.toggle("active", n <= game.strikes);
  });
}

function renderScores() {
  document.getElementById("score-value-a").textContent = game.teamA.score;
  document.getElementById("score-value-b").textContent = game.teamB.score;

  const cardA = document.getElementById("score-card-a");
  const cardB = document.getElementById("score-card-b");
  cardA.classList.toggle("in-control", game.controllingTeam === "A");
  cardB.classList.toggle("in-control", game.controllingTeam === "B");
}

/* ---------- Face-off overlay ---------- */
function openFaceOff() {
  const overlay = document.getElementById("overlay-faceoff");
  document.getElementById("btn-faceoff-a").textContent = `${game.teamA.name} buzzed in first`;
  document.getElementById("btn-faceoff-b").textContent = `${game.teamB.name} buzzed in first`;
  overlay.classList.add("active");
}

document.getElementById("btn-faceoff-a").addEventListener("click", () => chooseControl("A"));
document.getElementById("btn-faceoff-b").addEventListener("click", () => chooseControl("B"));

function chooseControl(team) {
  game.controllingTeam = team;
  document.getElementById("overlay-faceoff").classList.remove("active");
  document.getElementById("input-guess").disabled = false;
  document.getElementById("btn-submit-guess").disabled = false;
  document.getElementById("btn-strike").disabled = false;
  document.getElementById("btn-reveal-remaining").disabled = false;
  document.getElementById("input-guess").focus();
  renderScores();
}

/* ---------- Answer matching (Revision 1: typed-guess reveal) ----------
   Players type the answer they called out. We compare it against the
   hidden survey answers case-insensitively and ignoring extra/duplicate
   whitespace. A match flips ONLY that specific card (any position) and
   awards its points; a non-match logs a strike. The old "reveal answers
   top-to-bottom" behavior has been removed entirely. */
function normalizeAnswer(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")           // collapse repeated/extra spaces
    .replace(/[.,!?'"()-]/g, "");   // ignore minor punctuation differences
}

// Returns the index of the first NOT-YET-REVEALED answer whose normalized
// text matches the normalized guess, or -1 if nothing matches.
function findMatchingAnswerIndex(guessText) {
  const q = currentQuestion();
  const normalizedGuess = normalizeAnswer(guessText);
  if (!normalizedGuess) return -1;
  for (let i = 0; i < q.answers.length; i++) {
    if (game.revealedIndices.has(i)) continue; // already scored — can't score twice
    if (normalizeAnswer(q.answers[i].text) === normalizedGuess) return i;
  }
  return -1;
}

// Flips the ONE matched card (regardless of its position on the board)
// and awards its points to awardTeam. Guarded against double-scoring.
function revealAnswerByIndex(idx, awardTeam) {
  const q = currentQuestion();
  if (game.revealedIndices.has(idx)) return; // already scored — never score twice

  game.revealedIndices.add(idx);
  const slot = document.querySelector(`.answer-slot[data-index="${idx}"]`);
  if (slot) {
    slot.classList.add("revealed");
    setTimeout(() => {
      slot.classList.add("just-revealed");
      setTimeout(() => slot.classList.remove("just-revealed"), 650);
    }, 300);
  }

  AudioFX.correct();

  const points = q.answers[idx].points;
  game.pointsEarnedThisQuestion += points;

  if (game.inStealMode) {
    // A successful steal awards the ENTIRE pot earned so far this question
    resolveSteal(true);
    return;
  }

  if (awardTeam === "A") game.teamA.score += points;
  else game.teamB.score += points;

  renderScores();
  updateAnswersRemaining();

  if (game.revealedIndices.size === q.answers.length) {
    endQuestion();
  }
}

// Briefly shakes the guess input to give visual feedback on a wrong answer
function flashWrongGuess() {
  const input = document.getElementById("input-guess");
  input.classList.remove("shake");
  void input.offsetWidth; // restart the animation
  input.classList.add("shake");
}

function handleGuessSubmit() {
  if (!game || game.inStealMode || game.strikes >= 3) return;
  const input = document.getElementById("input-guess");
  const guess = input.value;
  if (!guess.trim()) return;

  const idx = findMatchingAnswerIndex(guess);
  input.value = "";
  input.focus();

  if (idx !== -1) {
    revealAnswerByIndex(idx, game.controllingTeam);
  } else {
    flashWrongGuess();
    registerStrike();
  }
}

document.getElementById("btn-submit-guess").addEventListener("click", handleGuessSubmit);
document.getElementById("input-guess").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleGuessSubmit();
  }
});

/* ---------- Host: Reveal Remaining Answers ----------
   Lets the host end a round early by flipping every still-hidden card.
   No points are awarded for these — it's purely a board clean-up action
   at the end of a round (e.g. after a Pass, or if the host wants to move on). */
document.getElementById("btn-reveal-remaining").addEventListener("click", () => {
  if (!game || game.inStealMode) return;
  revealAllRemaining();
});

function revealAllRemaining() {
  const q = currentQuestion();
  q.answers.forEach((ans, idx) => {
    if (!game.revealedIndices.has(idx)) {
      game.revealedIndices.add(idx);
      const slot = document.querySelector(`.answer-slot[data-index="${idx}"]`);
      if (slot) slot.classList.add("revealed");
    }
  });
  updateAnswersRemaining();
  endQuestion();
}

/* ---------- Strikes ---------- */
function registerStrike() {
  game.strikes++;
  renderStrikes();
  AudioFX.strike();

  if (game.strikes >= 3) {
    document.getElementById("input-guess").disabled = true;
    document.getElementById("btn-submit-guess").disabled = true;
    document.getElementById("btn-strike").disabled = true;
    document.getElementById("btn-reveal-remaining").disabled = true;
    setTimeout(openStealOverlay, 500);
  }
}

// Host can still log a strike manually (e.g. a wrong answer said out loud
// that the host chooses not to type in) — this is kept for flexibility.
document.getElementById("btn-strike").addEventListener("click", () => {
  if (!game || game.inStealMode || game.strikes >= 3) return;
  registerStrike();
});

/* ---------- Pass / Steal ---------- */
function openStealOverlay() {
  const otherTeam = game.controllingTeam === "A" ? "B" : "A";
  const otherName = otherTeam === "A" ? game.teamA.name : game.teamB.name;
  document.getElementById("steal-prompt").textContent =
    `${otherName}, do you want to Pass or Steal?`;
  document.getElementById("overlay-steal").classList.add("active");
}

document.getElementById("btn-pass").addEventListener("click", () => {
  document.getElementById("overlay-steal").classList.remove("active");
  // Controlling team keeps their earned points; move on
  endQuestion();
});

document.getElementById("btn-steal").addEventListener("click", () => {
  document.getElementById("overlay-steal").classList.remove("active");
  game.inStealMode = true;
  AudioFX.steal();
  document.getElementById("input-steal-guess").value = "";
  document.getElementById("overlay-steal-judge").classList.add("active");
  document.getElementById("input-steal-guess").focus();
});

// The stealing team gets exactly ONE guess. The host types what they said;
// if it matches a still-hidden answer, that card flips and the stealing
// team takes the whole pot earned this question. Any non-match is a miss.
document.getElementById("btn-steal-hit").addEventListener("click", () => {
  const guess = document.getElementById("input-steal-guess").value;
  const idx = findMatchingAnswerIndex(guess);
  document.getElementById("overlay-steal-judge").classList.remove("active");
  document.getElementById("input-steal-guess").value = "";

  const stealingTeam = game.controllingTeam === "A" ? "B" : "A";
  if (idx !== -1) {
    revealAnswerByIndex(idx, stealingTeam);
  } else {
    AudioFX.strike();
    resolveSteal(false);
  }
});

// Host override: declare the steal a miss without needing exact typed text
// (e.g. the team clearly said something not on the board).
document.getElementById("btn-steal-miss").addEventListener("click", () => {
  document.getElementById("overlay-steal-judge").classList.remove("active");
  document.getElementById("input-steal-guess").value = "";
  resolveSteal(false);
});

function resolveSteal(success) {
  const stealingTeam = game.controllingTeam === "A" ? "B" : "A";
  if (success) {
    // Award the entire pot earned this question to the stealing team,
    // and remove whatever was already credited to the controlling team.
    if (game.controllingTeam === "A") game.teamA.score -= (game.pointsEarnedThisQuestion - lastRevealPoints());
    else game.teamB.score -= (game.pointsEarnedThisQuestion - lastRevealPoints());

    if (stealingTeam === "A") game.teamA.score += game.pointsEarnedThisQuestion;
    else game.teamB.score += game.pointsEarnedThisQuestion;

    AudioFX.correct();
  }
  // On a miss, controlling team simply keeps what they already earned.
  renderScores();
  updateAnswersRemaining();
  endQuestion();
}

// Helper: points from the most recently revealed answer (used to correct
// scoring when a steal succeeds, since revealNextAnswer already added the
// guessed answer's points to pointsEarnedThisQuestion before we adjust totals)
function lastRevealPoints() {
  const q = currentQuestion();
  const indices = [...game.revealedIndices];
  const last = indices[indices.length - 1];
  return q.answers[last].points;
}

/* ---------- End of question / match ---------- */
function endQuestion() {
  document.getElementById("guess-row").style.display = "none";
  document.getElementById("btn-strike").style.display = "none";
  document.getElementById("btn-reveal-remaining").style.display = "none";
  document.getElementById("btn-next-question").style.display = "inline-block";

  // Reveal any remaining hidden answers automatically for a clean board
  const q = currentQuestion();
  q.answers.forEach((ans, idx) => {
    if (!game.revealedIndices.has(idx)) {
      const slot = document.querySelector(`.answer-slot[data-index="${idx}"]`);
      if (slot) slot.classList.add("revealed");
      game.revealedIndices.add(idx);
    }
  });
  updateAnswersRemaining();
}

document.getElementById("btn-next-question").addEventListener("click", () => {
  game.qIndex++;
  if (game.qIndex >= game.questions.length) {
    endMatch();
  } else {
    loadQuestion();
  }
});

function endMatch() {
  const { teamA, teamB } = game;
  let winnerText;
  if (teamA.score > teamB.score) winnerText = `${teamA.name} Wins! 🎉`;
  else if (teamB.score > teamA.score) winnerText = `${teamB.name} Wins! 🎉`;
  else winnerText = "It's a Tie!";

  document.getElementById("winner-title").textContent = winnerText;
  document.getElementById("end-name-a").textContent = teamA.name;
  document.getElementById("end-name-b").textContent = teamB.name;
  document.getElementById("end-score-a").textContent = teamA.score;
  document.getElementById("end-score-b").textContent = teamB.score;

  AudioFX.fanfare();
  showScreen("screen-end");
}

document.getElementById("btn-play-again").addEventListener("click", () => {
  showScreen("screen-setup");
  refreshSourceHint();
});

/* ---------- Init ---------- */
refreshSourceHint();
