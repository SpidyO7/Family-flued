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
   20 survey-style questions, each with answers sorted high-to-low points.
   Points loosely mimic "% of survey respondents who said this".
   ------------------------------------------------------------------------- */
const PRELOADED_QUESTIONS = [
  { question: "Name something people do right after they wake up.",
    answers: [{text:"Check their phone",points:32},{text:"Use the bathroom",points:27},{text:"Hit snooze",points:18},{text:"Brush teeth",points:12},{text:"Make coffee",points:7},{text:"Stretch",points:4}] },
  { question: "Name something you'd find in a kitchen.",
    answers: [{text:"Refrigerator",points:29},{text:"Stove",points:24},{text:"Sink",points:19},{text:"Microwave",points:14},{text:"Utensils",points:9},{text:"Table",points:5}] },
  { question: "Name a reason someone might be late for work.",
    answers: [{text:"Traffic",points:35},{text:"Overslept",points:26},{text:"Car trouble",points:16},{text:"Lost keys",points:11},{text:"Bad weather",points:7},{text:"Kids/family emergency",points:5}] },
  { question: "Name something you take on a road trip.",
    answers: [{text:"Snacks",points:30},{text:"Phone charger",points:24},{text:"Map/GPS",points:17},{text:"Pillow/blanket",points:13},{text:"Sunglasses",points:9},{text:"Playlist/music",points:7}] },
  { question: "Name an animal you might see at a zoo.",
    answers: [{text:"Lion",points:28},{text:"Elephant",points:24},{text:"Giraffe",points:20},{text:"Monkey",points:14},{text:"Zebra",points:8},{text:"Penguin",points:6}] },
  { question: "Name something people are afraid of.",
    answers: [{text:"Spiders",points:26},{text:"Heights",points:22},{text:"Public speaking",points:18},{text:"Snakes",points:14},{text:"The dark",points:12},{text:"Death",points:8}] },
  { question: "Name a job that requires wearing a uniform.",
    answers: [{text:"Police officer",points:27},{text:"Nurse/doctor",points:23},{text:"Firefighter",points:19},{text:"Soldier",points:15},{text:"Chef",points:9},{text:"Pilot",points:7}] },
  { question: "Name something you do to relax after a long day.",
    answers: [{text:"Watch TV",points:31},{text:"Take a bath/shower",points:22},{text:"Read a book",points:16},{text:"Listen to music",points:14},{text:"Nap",points:10},{text:"Exercise",points:7}] },
  { question: "Name a fruit that's red.",
    answers: [{text:"Apple",points:34},{text:"Strawberry",points:26},{text:"Cherry",points:18},{text:"Watermelon",points:12},{text:"Raspberry",points:6},{text:"Pomegranate",points:4}] },
  { question: "Name something you might forget when packing for vacation.",
    answers: [{text:"Phone charger",points:29},{text:"Toothbrush",points:22},{text:"Sunscreen",points:17},{text:"Medication",points:13},{text:"Underwear",points:11},{text:"Passport",points:8}] },
  { question: "Name a popular pizza topping.",
    answers: [{text:"Pepperoni",points:33},{text:"Cheese",points:24},{text:"Mushroom",points:16},{text:"Sausage",points:12},{text:"Olives",points:8},{text:"Pineapple",points:7}] },
  { question: "Name something people collect as a hobby.",
    answers: [{text:"Stamps",points:24},{text:"Coins",points:22},{text:"Trading cards",points:20},{text:"Vinyl records",points:16},{text:"Sneakers",points:10},{text:"Comic books",points:8}] },
  { question: "Name a household chore people hate doing.",
    answers: [{text:"Cleaning the bathroom",points:28},{text:"Doing dishes",points:23},{text:"Laundry",points:19},{text:"Vacuuming",points:14},{text:"Taking out trash",points:9},{text:"Ironing",points:7}] },
  { question: "Name something you'd bring to a picnic.",
    answers: [{text:"Blanket",points:27},{text:"Sandwiches",points:23},{text:"Drinks",points:19},{text:"Fruit",points:14},{text:"Cooler",points:10},{text:"Frisbee/games",points:7}] },
  { question: "Name a superhero.",
    answers: [{text:"Superman",points:26},{text:"Batman",points:24},{text:"Spider-Man",points:22},{text:"Wonder Woman",points:14},{text:"Iron Man",points:9},{text:"The Flash",points:5}] },
  { question: "Name something that's hard to do with your eyes closed.",
    answers: [{text:"Drive",points:32},{text:"Walk in a straight line",points:24},{text:"Read",points:18},{text:"Cook",points:12},{text:"Play sports",points:8},{text:"Find something",points:6}] },
  { question: "Name a type of weather that ruins outdoor plans.",
    answers: [{text:"Rain",points:36},{text:"Snow",points:22},{text:"Extreme heat",points:16},{text:"Wind",points:13},{text:"Thunderstorm",points:8},{text:"Fog",points:5}] },
  { question: "Name something you plug into a wall outlet.",
    answers: [{text:"Phone charger",points:30},{text:"Lamp",points:22},{text:"TV",points:17},{text:"Toaster",points:13},{text:"Vacuum",points:10},{text:"Hair dryer",points:8}] },
  { question: "Name a reason someone would call in sick to work.",
    answers: [{text:"Actually sick/flu",points:34},{text:"Doctor's appointment",points:21},{text:"Family emergency",points:17},{text:"Mental health day",points:14},{text:"Car trouble",points:8},{text:"Overslept",points:6}] },
  { question: "Name something you do before going to bed.",
    answers: [{text:"Brush teeth",points:30},{text:"Set an alarm",points:23},{text:"Check phone",points:19},{text:"Read",points:12},{text:"Wash face",points:9},{text:"Lock doors",points:7}] }
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
  document.getElementById("btn-reveal").style.display = "inline-block";
  document.getElementById("btn-strike").style.display = "inline-block";
  document.getElementById("btn-reveal").disabled = true;
  document.getElementById("btn-strike").disabled = true;

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
  document.getElementById("btn-reveal").disabled = false;
  document.getElementById("btn-strike").disabled = false;
  renderScores();
}

/* ---------- Reveal Answer ---------- */
document.getElementById("btn-reveal").addEventListener("click", () => {
  revealNextAnswer(game.controllingTeam);
});

function revealNextAnswer(awardTeam) {
  const q = currentQuestion();
  // Find the next hidden answer in descending point order (board is already sorted)
  let nextIdx = -1;
  for (let i = 0; i < q.answers.length; i++) {
    if (!game.revealedIndices.has(i)) { nextIdx = i; break; }
  }
  if (nextIdx === -1) return; // nothing left

  game.revealedIndices.add(nextIdx);
  const slot = document.querySelector(`.answer-slot[data-index="${nextIdx}"]`);
  slot.classList.add("revealed");
  setTimeout(() => {
    slot.classList.add("just-revealed");
    setTimeout(() => slot.classList.remove("just-revealed"), 650);
  }, 300);

  AudioFX.correct();

  const points = q.answers[nextIdx].points;
  game.pointsEarnedThisQuestion += points;

  if (game.inStealMode) {
    // A successful steal awards the ENTIRE pot earned so far this question
    resolveSteal(true);
    return;
  } else {
    if (awardTeam === "A") game.teamA.score += points;
    else game.teamB.score += points;
  }

  renderScores();
  updateAnswersRemaining();

  if (game.revealedIndices.size === q.answers.length) {
    endQuestion();
  }
}

/* ---------- Strikes ---------- */
document.getElementById("btn-strike").addEventListener("click", () => {
  if (game.inStealMode) return;
  game.strikes++;
  renderStrikes();
  AudioFX.strike();

  if (game.strikes >= 3) {
    document.getElementById("btn-reveal").disabled = true;
    document.getElementById("btn-strike").disabled = true;
    setTimeout(openStealOverlay, 500);
  }
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
  document.getElementById("overlay-steal-judge").classList.add("active");
});

// Host manually judges the single steal guess
document.getElementById("btn-steal-hit").addEventListener("click", () => {
  document.getElementById("overlay-steal-judge").classList.remove("active");
  // Reveal the next hidden answer as the "guessed" one, awarding it to stealing team
  revealNextAnswer(game.controllingTeam === "A" ? "B" : "A");
});

document.getElementById("btn-steal-miss").addEventListener("click", () => {
  document.getElementById("overlay-steal-judge").classList.remove("active");
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
  document.getElementById("btn-reveal").style.display = "none";
  document.getElementById("btn-strike").style.display = "none";
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
