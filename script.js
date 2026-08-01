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
   32 survey-style questions localized for a Northeast India / Assam student
   audience (momos, Bihu, tea stalls, Kaziranga, local transport, etc.),
   each with answers sorted high-to-low points. Points loosely mimic
   "% of survey respondents who said this".
   ------------------------------------------------------------------------- */
const PRELOADED_QUESTIONS = [
  { question: "Name a popular momo filling.",
    answers: [{text:"Chicken",points:34},{text:"Pork",points:26},{text:"Veg/Cabbage",points:18},{text:"Paneer",points:12},{text:"Egg",points:6},{text:"Buff",points:4}] },
  { question: "Name a hill station Assamese students love to visit.",
    answers: [{text:"Shillong",points:32},{text:"Darjeeling",points:24},{text:"Kalimpong",points:15},{text:"Tawang",points:12},{text:"Kohima",points:10},{text:"Cherrapunji",points:7}] },
  { question: "Name a popular Assamese dish.",
    answers: [{text:"Khar",points:26},{text:"Masor Tenga",points:24},{text:"Duck curry",points:18},{text:"Pitha",points:16},{text:"Aloo Pitika",points:10},{text:"Bamboo shoot curry",points:6}] },
  { question: "Name something you'd find at a tea stall.",
    answers: [{text:"Cutting tea",points:30},{text:"Biscuits",points:22},{text:"Samosa/Singara",points:18},{text:"Bun",points:14},{text:"Cigarettes",points:10},{text:"Newspaper",points:6}] },
  { question: "Name a dish made using bamboo shoot (khorisa).",
    answers: [{text:"Fish with khorisa",points:28},{text:"Pork with bamboo shoot",points:24},{text:"Khar with bamboo shoot",points:20},{text:"Bamboo shoot pickle",points:16},{text:"Duck with bamboo shoot",points:12}] },
  { question: "Name something associated with a Jaapi.",
    answers: [{text:"Worn during Bihu",points:30},{text:"Sun protection while farming",points:24},{text:"Symbol of Assamese culture",points:20},{text:"Given as an honour/gift",points:16},{text:"Hung as wall decoration",points:10}] },
  { question: "Name something people do during Bihu.",
    answers: [{text:"Dance Bihu",points:28},{text:"Eat pitha",points:22},{text:"Wear mekhela sador/gamosa",points:18},{text:"Visit family",points:16},{text:"Play traditional games",points:10},{text:"Sing Bihu geet",points:6}] },
  { question: "Name a popular snack at a college canteen.",
    answers: [{text:"Maggi",points:30},{text:"Samosa",points:24},{text:"Momo",points:20},{text:"Tea",points:14},{text:"Chow",points:8},{text:"Puri-sabzi",points:4}] },
  { question: "Name something students carry to college every day.",
    answers: [{text:"Bag/books",points:30},{text:"Water bottle",points:22},{text:"Umbrella",points:18},{text:"Phone",points:14},{text:"Pen/pencil",points:10},{text:"Wallet",points:6}] },
  { question: "Name something essential during Assam's monsoon season.",
    answers: [{text:"Umbrella",points:30},{text:"Raincoat",points:22},{text:"Gumboots",points:18},{text:"Waterproof bag cover",points:14},{text:"Extra clothes",points:10},{text:"Torch for power cuts",points:6}] },
  { question: "Name a popular mode of local transport in Guwahati.",
    answers: [{text:"Auto-rickshaw",points:30},{text:"City bus",points:24},{text:"Shared Sumo/taxi",points:18},{text:"Bike/scooter",points:16},{text:"Ferry",points:8},{text:"Cycle",points:4}] },
  { question: "Name a must-visit tourist place in Northeast India.",
    answers: [{text:"Kaziranga National Park",points:26},{text:"Majuli Island",points:20},{text:"Shillong",points:18},{text:"Tawang Monastery",points:16},{text:"Loktak Lake",points:12},{text:"Ziro Valley",points:8}] },
  { question: "Name a sport popular among students in Assam.",
    answers: [{text:"Football",points:32},{text:"Cricket",points:28},{text:"Badminton",points:16},{text:"Volleyball",points:12},{text:"Kabaddi",points:7},{text:"Kho-Kho",points:5}] },
  { question: "Name something people add to Maggi to make it better.",
    answers: [{text:"Egg",points:30},{text:"Vegetables",points:24},{text:"Cheese",points:18},{text:"Extra masala/chilli",points:16},{text:"Bhujia",points:8},{text:"Butter",points:4}] },
  { question: "Name a reason students hang out at a tea stall.",
    answers: [{text:"Chat with friends",points:30},{text:"Have tea/snacks",points:24},{text:"Kill time between classes",points:18},{text:"Watch cricket/football",points:16},{text:"Escape the rain",points:8},{text:"Study together",points:4}] },
  { question: "Name something people do on a rainy day in Assam.",
    answers: [{text:"Drink tea",points:28},{text:"Eat pakora/pitha",points:22},{text:"Watch movies indoors",points:18},{text:"Avoid going out",points:14},{text:"Play carrom/cards",points:12},{text:"Walk in the rain",points:6}] },
  { question: "Name a festival celebrated in Assam.",
    answers: [{text:"Bihu",points:34},{text:"Durga Puja",points:24},{text:"Diwali",points:16},{text:"Ambubachi Mela",points:14},{text:"Baishagu",points:7},{text:"Me-Dam-Me-Phi",points:5}] },
  { question: "Name an item found in a typical Assamese kitchen.",
    answers: [{text:"Rice",points:28},{text:"Fish",points:22},{text:"Mustard oil",points:18},{text:"Khar",points:14},{text:"Tenga",points:10},{text:"Bamboo shoot",points:8}] },
  { question: "Name a popular street food in Guwahati.",
    answers: [{text:"Momo",points:30},{text:"Jhalmuri",points:22},{text:"Golgappa",points:18},{text:"Pork fry",points:16},{text:"Rolls",points:9},{text:"Chaat",points:5}] },
  { question: "Name something people do while waiting for the bus.",
    answers: [{text:"Check phone",points:30},{text:"Talk with friends",points:24},{text:"Listen to music",points:16},{text:"Grab tea nearby",points:14},{text:"Read newspaper",points:10},{text:"Get impatient",points:6}] },
  { question: "Name a subject Assamese college students commonly study.",
    answers: [{text:"Science",points:26},{text:"Commerce",points:22},{text:"Arts/Humanities",points:20},{text:"Engineering",points:18},{text:"Computer Science",points:10},{text:"Law",points:4}] },
  { question: "Name something you'd see during a college fest in Assam.",
    answers: [{text:"Live band/music",points:28},{text:"Food stalls",points:24},{text:"Dance performances",points:20},{text:"Bihu performance",points:14},{text:"Rangoli/art contest",points:8},{text:"Fashion show",points:6}] },
  { question: "Name a common excuse students give for missing class.",
    answers: [{text:"Traffic jam",points:28},{text:"Overslept",points:24},{text:"Bad weather/rain",points:18},{text:"Bus was late",points:14},{text:"Family function",points:10},{text:"Not feeling well",points:6}] },
  { question: "Name something associated with the Brahmaputra river.",
    answers: [{text:"Ferry rides",points:26},{text:"Fishing",points:22},{text:"Flood season",points:20},{text:"River islands",points:16},{text:"Sunset view",points:10},{text:"Boat cruise",points:6}] },
  { question: "Name a popular hangout spot for youth in Guwahati.",
    answers: [{text:"Fancy Bazaar",points:24},{text:"Brahmaputra riverside",points:22},{text:"Shopping mall",points:20},{text:"Dighalipukhuri",points:18},{text:"Nehru Park",points:10},{text:"Gaming zone",points:6}] },
  { question: "Name something people gift during Bihu.",
    answers: [{text:"Gamosa",points:30},{text:"Sweets/pitha",points:24},{text:"Clothes",points:18},{text:"Jaapi",points:16},{text:"Money",points:8},{text:"Flowers",points:4}] },
  { question: "Name a type of tea people drink in Assam.",
    answers: [{text:"Milk tea",points:30},{text:"Black tea",points:24},{text:"Ginger tea",points:18},{text:"Lemon tea",points:14},{text:"Green tea",points:9},{text:"Masala tea",points:5}] },
  { question: "Name something you need before an Assam bandh.",
    answers: [{text:"Stock up groceries",points:28},{text:"Charge phone/power bank",points:22},{text:"Fill fuel in advance",points:18},{text:"Keep cash in hand",points:16},{text:"Cancel travel plans",points:10},{text:"Inform college/office",points:6}] },
  { question: "Name a popular pitha eaten during Bihu.",
    answers: [{text:"Til pitha",points:30},{text:"Ghila pitha",points:22},{text:"Sunga pitha",points:18},{text:"Narikol pitha",points:16},{text:"Bhapot Diya pitha",points:9},{text:"Chunga pitha",points:5}] },
  { question: "Name a common reason college students visit Fancy Bazaar.",
    answers: [{text:"Shopping for clothes",points:28},{text:"Buying books/stationery",points:22},{text:"Eating street food",points:20},{text:"Meeting friends",points:16},{text:"Window shopping",points:8},{text:"Buying gifts",points:6}] },
  { question: "Name something associated with Kaziranga National Park.",
    answers: [{text:"One-horned rhino",points:34},{text:"Elephant safari",points:24},{text:"Jeep safari",points:18},{text:"Tigers",points:12},{text:"Wetlands/grasslands",points:8},{text:"Birdwatching",points:4}] },
  { question: "Name something a student packs for a college picnic.",
    answers: [{text:"Chips/snacks",points:26},{text:"Cold drinks",points:22},{text:"Packed lunch",points:20},{text:"Speaker for music",points:16},{text:"Football",points:10},{text:"Camera/phone",points:6}] }
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
