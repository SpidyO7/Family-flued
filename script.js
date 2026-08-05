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
   52 deduped, freshers-event-tested survey questions for a college crowd
   (~70% Assamese/Northeast student life, culture, food, festivals, slang;
   ~30% universally relatable campus/genz/pop-culture). Every answer object
   is { text, points, aliases } — aliases feed the matching engine below but
   are NEVER shown on the board; only .text is ever revealed.
   ------------------------------------------------------------------------- */
const PRELOADED_QUESTIONS = [
  { question: "Name something every fresher is scared of.",
    answers: [{text:"Seniors",points:30,aliases:["senior"]},{text:"Ragging",points:24,aliases:[]},{text:"English",points:18,aliases:[]},{text:"Friends",points:12,aliases:[]},{text:"Attendance",points:10,aliases:[]},{text:"Classes",points:6,aliases:[]}] },
  { question: "Name the first thing you notice about a classmate.",
    answers: [{text:"Face",points:30,aliases:[]},{text:"Dress",points:24,aliases:[]},{text:"Smile",points:18,aliases:[]},{text:"Hair",points:12,aliases:[]},{text:"Height",points:10,aliases:[]},{text:"Shoes",points:6,aliases:["sneakers", "sneaker"]}] },
  { question: "Name something students ask on the first day.",
    answers: [{text:"Name",points:30,aliases:[]},{text:"Department",points:24,aliases:[]},{text:"Hostel",points:18,aliases:[]},{text:"Hometown",points:12,aliases:[]},{text:"Instagram",points:10,aliases:["insta", "ig"]},{text:"Semester",points:6,aliases:[]}] },
  { question: "Name something students secretly judge.",
    answers: [{text:"Outfit",points:30,aliases:["clothes", "dress", "dresses"]},{text:"Shoes",points:22,aliases:["sneakers", "sneaker"]},{text:"Accent",points:18,aliases:[]},{text:"Phone",points:12,aliases:["mobile", "smartphone", "cell", "cellphone"]},{text:"Hair",points:10,aliases:[]},{text:"Bag",points:8,aliases:[]}] },
  { question: "Name something students always lose.",
    answers: [{text:"Pen",points:30,aliases:[]},{text:"Charger",points:22,aliases:["chargers", "cable", "wire"]},{text:"ID",points:18,aliases:["id card", "identity card"]},{text:"Bottle",points:12,aliases:["water bottle"]},{text:"Wallet",points:10,aliases:["purse"]},{text:"Notes",points:8,aliases:["note", "notebook"]}] },
  { question: "Name something students do before sleeping.",
    answers: [{text:"Reels",points:30,aliases:["instagram reels", "insta reels"]},{text:"Chat",points:22,aliases:[]},{text:"Music",points:18,aliases:["song", "songs"]},{text:"YouTube",points:14,aliases:["you tube", "yt"]},{text:"Snapchat",points:10,aliases:["snap"]},{text:"Gaming",points:6,aliases:["games", "game", "gambling online"]}] },
  { question: "Name something students always refresh.",
    answers: [{text:"Instagram",points:30,aliases:["insta", "ig"]},{text:"Snapchat",points:24,aliases:["snap"]},{text:"WhatsApp",points:18,aliases:["whats app", "wp"]},{text:"News",points:12,aliases:[]},{text:"Scores",points:10,aliases:[]},{text:"Mail",points:6,aliases:[]}] },
  { question: "Name a Gen Z word everyone says.",
    answers: [{text:"Bro",points:28,aliases:[]},{text:"Aura",points:22,aliases:["auraa"]},{text:"Cringe",points:18,aliases:[]},{text:"Slay",points:12,aliases:[]},{text:"Sus",points:10,aliases:["suspicious"]},{text:"Delulu",points:10,aliases:["delusional"]}] },
  { question: "Name something students gossip about.",
    answers: [{text:"Crush",points:30,aliases:[]},{text:"Couples",points:24,aliases:[]},{text:"Teachers",points:16,aliases:[]},{text:"Friends",points:12,aliases:[]},{text:"Results",points:10,aliases:[]},{text:"Seniors",points:8,aliases:["senior"]}] },
  { question: "Name something students spend too much money on.",
    answers: [{text:"Food",points:30,aliases:[]},{text:"Coffee",points:22,aliases:["cafe coffee", "cold coffee"]},{text:"Shopping",points:18,aliases:[]},{text:"Recharge",points:12,aliases:["mobile recharge", "topup", "top up"]},{text:"Petrol",points:10,aliases:[]},{text:"Trips",points:8,aliases:[]}] },
  { question: "Name something every hostel room smells of.",
    answers: [{text:"Perfume",points:28,aliases:["deo", "deodorant"]},{text:"Maggi",points:24,aliases:[]},{text:"Shoes",points:18,aliases:["sneakers", "sneaker"]},{text:"Food",points:12,aliases:[]},{text:"Spray",points:10,aliases:["deo spray", "body spray"]},{text:"Laundry",points:8,aliases:[]}] },
  { question: "Name something students pretend to understand.",
    answers: [{text:"Lecture",points:30,aliases:[]},{text:"Assignment",points:22,aliases:[]},{text:"Math",points:18,aliases:[]},{text:"Coding",points:12,aliases:["code", "programming"]},{text:"English",points:10,aliases:[]},{text:"Rules",points:8,aliases:[]}] },
  { question: "Name something students throw a party for.",
    answers: [{text:"Birthday",points:30,aliases:[]},{text:"Results",points:22,aliases:[]},{text:"Fest",points:18,aliases:[]},{text:"Victory",points:14,aliases:[]},{text:"Weekend",points:10,aliases:[]},{text:"Farewell",points:6,aliases:[]}] },
  { question: "Name a sport students never miss.",
    answers: [{text:"Cricket",points:34,aliases:["cricket match"]},{text:"Football",points:24,aliases:["soccer"]},{text:"Badminton",points:16,aliases:[]},{text:"Kabaddi",points:10,aliases:[]},{text:"F1",points:8,aliases:[]},{text:"Volleyball",points:8,aliases:[]}] },
  { question: "Name something students check during the World Cup.",
    answers: [{text:"Score",points:30,aliases:[]},{text:"Highlights",points:24,aliases:[]},{text:"Memes",points:18,aliases:[]},{text:"Reels",points:12,aliases:["instagram reels", "insta reels"]},{text:"Fantasy",points:10,aliases:[]},{text:"Stats",points:6,aliases:[]}] },
  { question: "Name something students flex.",
    answers: [{text:"Phone",points:28,aliases:["mobile", "smartphone", "cell", "cellphone"]},{text:"Outfit",points:22,aliases:["clothes", "dress", "dresses"]},{text:"Shoes",points:18,aliases:["sneakers", "sneaker"]},{text:"Snapscore",points:14,aliases:["snap score", "snap streak"]},{text:"Followers",points:10,aliases:[]},{text:"Bike",points:8,aliases:[]}] },
  { question: "You hear 'Pradhan Ji'. What comes to mind?",
    answers: [{text:"Panchayat",points:32,aliases:[]},{text:"Sachiv",points:24,aliases:[]},{text:"Lauki",points:16,aliases:[]},{text:"Vidhayak",points:12,aliases:[]},{text:"Phulera",points:10,aliases:[]},{text:"Rinki",points:6,aliases:[]}] },
  { question: "You hear 'Pushpa'. What comes to mind?",
    answers: [{text:"Jhukega",points:30,aliases:[]},{text:"Fire",points:24,aliases:[]},{text:"Srivalli",points:18,aliases:[]},{text:"Shekhawat",points:12,aliases:[]},{text:"Red Sandal",points:10,aliases:[]},{text:"Allu",points:6,aliases:[]}] },
  { question: "You hear 'Spider-Man'. What comes to mind?",
    answers: [{text:"Web",points:30,aliases:[]},{text:"MJ",points:22,aliases:[]},{text:"Marvel",points:18,aliases:[]},{text:"Tom",points:12,aliases:[]},{text:"Mask",points:10,aliases:[]},{text:"Swing",points:8,aliases:[]}] },
  { question: "You hear 'Messi'. What comes to mind?",
    answers: [{text:"GOAT",points:30,aliases:[]},{text:"Argentina",points:24,aliases:[]},{text:"Football",points:18,aliases:["soccer"]},{text:"World Cup",points:12,aliases:[]},{text:"Barcelona",points:10,aliases:[]},{text:"Inter Miami",points:6,aliases:[]}] },
  { question: "You hear 'Kohli'. What comes to mind?",
    answers: [{text:"Cricket",points:30,aliases:["cricket match"]},{text:"RCB",points:24,aliases:[]},{text:"Century",points:18,aliases:[]},{text:"Aggression",points:12,aliases:[]},{text:"Anushka",points:10,aliases:[]},{text:"King",points:6,aliases:[]}] },
  { question: "You hear 'Ronaldo'. What comes to mind?",
    answers: [{text:"Siuuu",points:32,aliases:[]},{text:"GOAT",points:22,aliases:[]},{text:"Football",points:18,aliases:["soccer"]},{text:"Portugal",points:12,aliases:[]},{text:"Real Madrid",points:10,aliases:[]},{text:"Al Nassr",points:6,aliases:[]}] },
  { question: "You hear 'Deadpool'. What comes to mind?",
    answers: [{text:"Marvel",points:30,aliases:[]},{text:"Wolverine",points:24,aliases:[]},{text:"Ryan",points:18,aliases:[]},{text:"Red",points:12,aliases:[]},{text:"Comedy",points:10,aliases:[]},{text:"Mask",points:6,aliases:[]}] },
  { question: "You hear 'Wednesday'. What comes to mind?",
    answers: [{text:"Dance",points:30,aliases:[]},{text:"Netflix",points:24,aliases:["net flix"]},{text:"Black",points:18,aliases:[]},{text:"Addams",points:12,aliases:[]},{text:"Thing",points:10,aliases:[]},{text:"School",points:6,aliases:[]}] },
  { question: "Name something that gives you instant aura.",
    answers: [{text:"Confidence",points:30,aliases:[]},{text:"Outfit",points:24,aliases:["clothes", "dress", "dresses"]},{text:"Perfume",points:18,aliases:["deo", "deodorant"]},{text:"Hair",points:12,aliases:[]},{text:"Shoes",points:10,aliases:["sneakers", "sneaker"]},{text:"Smile",points:6,aliases:[]}] },
  { question: "Name a green flag in a classmate.",
    answers: [{text:"Kind",points:30,aliases:[]},{text:"Funny",points:22,aliases:[]},{text:"Helpful",points:18,aliases:[]},{text:"Respect",points:14,aliases:[]},{text:"Honest",points:10,aliases:[]},{text:"Smile",points:6,aliases:[]}] },
  { question: "Name a red flag in a classmate.",
    answers: [{text:"Attitude",points:30,aliases:["attitude problem"]},{text:"Arrogant",points:24,aliases:["arrogance"]},{text:"Rude",points:18,aliases:[]},{text:"Liar",points:12,aliases:[]},{text:"Fake",points:10,aliases:[]},{text:"Ego",points:6,aliases:[]}] },
  { question: "Name something students stalk.",
    answers: [{text:"Crush",points:30,aliases:[]},{text:"Instagram",points:24,aliases:["insta", "ig"]},{text:"Ex",points:18,aliases:[]},{text:"Story",points:12,aliases:[]},{text:"Friends",points:10,aliases:[]},{text:"Profile",points:6,aliases:[]}] },
  { question: "Name something that instantly kills the vibe.",
    answers: [{text:"Rain",points:28,aliases:[]},{text:"Network",points:22,aliases:["signal", "no network"]},{text:"Attendance",points:18,aliases:[]},{text:"Battery",points:14,aliases:["low battery", "charge"]},{text:"Homework",points:10,aliases:[]},{text:"Parents",points:8,aliases:[]}] },
  { question: "Name something everyone lies about.",
    answers: [{text:"Sleep",points:30,aliases:[]},{text:"Study",points:24,aliases:[]},{text:"Marks",points:18,aliases:[]},{text:"Budget",points:12,aliases:[]},{text:"Gym",points:10,aliases:[]},{text:"Diet",points:6,aliases:[]}] },
  { question: "Name something students promise to stop but never do.",
    answers: [{text:"Reels",points:30,aliases:["instagram reels", "insta reels"]},{text:"Gaming",points:24,aliases:["games", "game", "gambling online"]},{text:"YouTube",points:18,aliases:["you tube", "yt"]},{text:"Junk food",points:12,aliases:[]},{text:"Netflix",points:10,aliases:["net flix"]},{text:"Memes",points:6,aliases:[]}] },
  { question: "Name something students secretly compete in.",
    answers: [{text:"Marks",points:28,aliases:[]},{text:"Followers",points:22,aliases:[]},{text:"Snapscore",points:18,aliases:["snap score", "snap streak"]},{text:"Looks",points:14,aliases:[]},{text:"Sports",points:10,aliases:[]},{text:"Gaming",points:8,aliases:["games", "game", "gambling online"]}] },
  { question: "Name something students do before posting a photo.",
    answers: [{text:"Filter",points:30,aliases:[]},{text:"Edit",points:22,aliases:[]},{text:"Caption",points:18,aliases:[]},{text:"Crop",points:12,aliases:[]},{text:"Retake",points:10,aliases:[]},{text:"Music",points:8,aliases:["song", "songs"]}] },
  { question: "Name a singer students play on repeat during heartbreak.",
    answers: [{text:"Arijit",points:32,aliases:["arijit singh"]},{text:"Atif",points:22,aliases:["atif aslam"]},{text:"KK",points:18,aliases:["k k"]},{text:"Shreya",points:12,aliases:["shreya ghoshal"]},{text:"Jubin",points:10,aliases:["jubin garg", "zubeen garg"]},{text:"Anuv",points:6,aliases:[]}] },
  { question: "Name a singer played at every college DJ night.",
    answers: [{text:"Arijit",points:30,aliases:["arijit singh"]},{text:"Honey",points:24,aliases:[]},{text:"Diljit",points:18,aliases:["diljit dosanjh"]},{text:"Shreya",points:12,aliases:["shreya ghoshal"]},{text:"KK",points:10,aliases:["k k"]},{text:"Atif",points:6,aliases:["atif aslam"]}] },
  { question: "Name a game students play when they're bored.",
    answers: [{text:"BGMI",points:30,aliases:["pubg"]},{text:"Ludo",points:22,aliases:[]},{text:"Valorant",points:18,aliases:[]},{text:"UNO",points:12,aliases:[]},{text:"Chess",points:10,aliases:[]},{text:"Minecraft",points:8,aliases:[]}] },
  { question: "Name a sport played every evening on the college ground.",
    answers: [{text:"Cricket",points:34,aliases:["cricket match"]},{text:"Football",points:24,aliases:["soccer"]},{text:"Badminton",points:16,aliases:[]},{text:"Kabaddi",points:10,aliases:[]},{text:"Volleyball",points:8,aliases:[]},{text:"Basketball",points:8,aliases:[]}] },
  { question: "Name something students buy after getting their monthly allowance.",
    answers: [{text:"Food",points:30,aliases:[]},{text:"Clothes",points:22,aliases:[]},{text:"Shoes",points:18,aliases:["sneakers", "sneaker"]},{text:"Coffee",points:12,aliases:["cafe coffee", "cold coffee"]},{text:"Perfume",points:10,aliases:["deo", "deodorant"]},{text:"Recharge",points:8,aliases:["mobile recharge", "topup", "top up"]}] },
  { question: "Name an app students open when they're avoiding studies.",
    answers: [{text:"Instagram",points:30,aliases:["insta", "ig"]},{text:"YouTube",points:24,aliases:["you tube", "yt"]},{text:"Snapchat",points:18,aliases:["snap"]},{text:"Spotify",points:12,aliases:[]},{text:"WhatsApp",points:10,aliases:["whats app", "wp"]},{text:"Netflix",points:6,aliases:["net flix"]}] },
  { question: "Name something students wear when they want to impress.",
    answers: [{text:"Sneakers",points:30,aliases:[]},{text:"Perfume",points:22,aliases:["deo", "deodorant"]},{text:"Watch",points:18,aliases:[]},{text:"Jacket",points:12,aliases:[]},{text:"Chain",points:10,aliases:[]},{text:"Cap",points:8,aliases:[]}] },
  { question: "Name a snack every college canteen sells.",
    answers: [{text:"Momo",points:30,aliases:["momos"]},{text:"Maggi",points:26,aliases:[]},{text:"Samosa",points:18,aliases:[]},{text:"Tea",points:14,aliases:["chai"]},{text:"Chowmein",points:8,aliases:[]},{text:"Roll",points:4,aliases:[]}] },
  { question: "Name something you'll hear blasting during Bihu.",
    answers: [{text:"Dhol",points:30,aliases:[]},{text:"Pepa",points:24,aliases:[]},{text:"Gogona",points:18,aliases:[]},{text:"Xutuli",points:12,aliases:[]},{text:"Toka",points:10,aliases:[]},{text:"DJ",points:6,aliases:[]}] },
  { question: "Name a Bihu outfit every student owns.",
    answers: [{text:"Gamosa",points:30,aliases:["gamocha"]},{text:"Mekhela",points:22,aliases:["mekhela sador", "mekhela chador"]},{text:"Jaapi",points:18,aliases:["japi"]},{text:"Dhoti",points:14,aliases:[]},{text:"Kurta",points:10,aliases:[]},{text:"Sador",points:6,aliases:[]}] },
  { question: "Name a hill station students plan a trip to.",
    answers: [{text:"Shillong",points:30,aliases:[]},{text:"Tawang",points:22,aliases:[]},{text:"Kohima",points:18,aliases:[]},{text:"Ziro",points:14,aliases:[]},{text:"Kalimpong",points:10,aliases:[]},{text:"Cherrapunji",points:6,aliases:[]}] },
  { question: "Name something every tea stall near college sells.",
    answers: [{text:"Tea",points:30,aliases:["chai"]},{text:"Biscuit",points:22,aliases:[]},{text:"Samosa",points:18,aliases:[]},{text:"Bun",points:14,aliases:[]},{text:"Cigarette",points:10,aliases:["smoke", "smoking", "cigarettes", "ciggy"]},{text:"Maggi",points:6,aliases:[]}] },
  { question: "Name something you can't survive Assam's monsoon without.",
    answers: [{text:"Umbrella",points:30,aliases:[]},{text:"Raincoat",points:22,aliases:[]},{text:"Boots",points:18,aliases:[]},{text:"Jacket",points:14,aliases:[]},{text:"Bunk",points:8,aliases:[]},{text:"Tea",points:8,aliases:["chai"]}] },
  { question: "Name something students eat during a college Bihu function.",
    answers: [{text:"Pitha",points:30,aliases:["pithas"]},{text:"Laru",points:24,aliases:[]},{text:"Jolpan",points:18,aliases:[]},{text:"Chira",points:14,aliases:[]},{text:"Curd",points:8,aliases:[]},{text:"Payash",points:6,aliases:[]}] },
  { question: "Name a popular local transport students use to reach college.",
    answers: [{text:"Auto",points:30,aliases:["auto rickshaw", "rickshaw"]},{text:"Bus",points:24,aliases:["city bus"]},{text:"Bike",points:18,aliases:[]},{text:"Cycle",points:12,aliases:[]},{text:"Sumo",points:10,aliases:["tata sumo"]},{text:"Walk",points:6,aliases:[]}] },
  { question: "Name something you'd spot on a trip to Kaziranga.",
    answers: [{text:"Rhino",points:34,aliases:["rhinoceros"]},{text:"Elephant",points:24,aliases:[]},{text:"Jeep",points:18,aliases:[]},{text:"Grass",points:12,aliases:[]},{text:"Bird",points:8,aliases:[]},{text:"Guide",points:4,aliases:[]}] },
  { question: "Name a festival students look forward to on campus.",
    answers: [{text:"Bihu",points:30,aliases:[]},{text:"Durga Puja",points:24,aliases:[]},{text:"Diwali",points:18,aliases:[]},{text:"Saraswati Puja",points:14,aliases:[]},{text:"Freshers",points:10,aliases:[]},{text:"Fest",points:4,aliases:[]}] },
  { question: "Name something every Assamese kitchen has.",
    answers: [{text:"Rice",points:28,aliases:[]},{text:"Fish",points:22,aliases:[]},{text:"Khar",points:18,aliases:[]},{text:"Oil",points:14,aliases:[]},{text:"Tenga",points:10,aliases:[]},{text:"Bamboo",points:8,aliases:[]}] },
  { question: "Name a word Assamese students use a lot with friends.",
    answers: [{text:"Da",points:26,aliases:[]},{text:"Hoi",points:22,aliases:[]},{text:"Ki",points:18,aliases:[]},{text:"Bhai",points:16,aliases:[]},{text:"Mama",points:10,aliases:[]},{text:"Dei",points:8,aliases:[]}] }
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

/* ---------- Answer matching engine (semantic, alias-aware) ----------
   Players type the answer they called out. Instead of requiring an exact
   string match, we run the guess through a small pipeline of reusable
   helpers so synonyms, plurals, abbreviations, and small typos are all
   accepted — while the board only ever reveals the ORIGINAL survey text
   (never whatever the player actually typed). A match flips ONLY that
   specific card (any position) and awards its points; a non-match logs a
   strike. Sequential top-to-bottom reveal does not exist anywhere here. */

// 1) Normalize: lowercase, trim, strip minor punctuation, collapse spaces.
function normalizeAnswer(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[.,!?'"()-]/g, "")     // ignore minor punctuation differences
    .replace(/\s+/g, " ");           // collapse repeated/extra spaces
}

// 2) Very small singular/plural normalizer — enough to treat "momo"/"momos",
//    "class"/"classes", "story"/"stories" etc. as equivalent without pulling
//    in a full NLP library.
function singularize(word) {
  if (word.length <= 3) return word;
  if (word.endsWith("ies") && word.length > 4) return word.slice(0, -3) + "y";
  if (/(ses|xes|ches|shes)$/.test(word)) return word.slice(0, -2);
  if (word.endsWith("ss")) return word;               // "class", "glass" stay as-is
  if (word.endsWith("s")) return word.slice(0, -1);   // "cats" -> "cat"
  return word;
}

// 3) Levenshtein edit distance — classic DP table, used only as a last
//    resort so short/unrelated words can't accidentally match each other.
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const prev = new Array(n + 1);
  const curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,        // deletion
        curr[j - 1] + 1,    // insertion
        prev[j - 1] + cost  // substitution
      );
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
}

// 4) Fuzzy equality — allows small spelling mistakes ("cigrette", "colege")
//    while staying strict enough that unrelated short words don't collide.
function fuzzyEqual(a, b) {
  if (a === b) return true;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen <= 3) return false;               // too short to risk fuzzy matching
  const threshold = maxLen <= 6 ? 1 : 2;
  return levenshtein(a, b) <= threshold;
}

// 5) wordsMatch — the core "are these two normalized words the same idea"
//    check: exact -> singular/plural -> fuzzy spelling.
function wordsMatch(normA, normB) {
  if (normA === normB) return true;
  if (singularize(normA) === singularize(normB)) return true;
  if (fuzzyEqual(normA, normB)) return true;
  return false;
}

// 6) isAnswerMatch — checks a raw guess against one answer object
//    ({ text, points, aliases }). Aliases let a single survey answer accept
//    synonyms ("mobile"/"smartphone" for "Phone", "chai" for "Tea", etc.)
//    without ever changing what gets displayed on the board.
function isAnswerMatch(guessText, answerObj) {
  const guessNorm = normalizeAnswer(guessText);
  if (!guessNorm) return false;
  const candidates = [answerObj.text, ...(answerObj.aliases || [])].map(normalizeAnswer);
  return candidates.some(candidate => wordsMatch(guessNorm, candidate));
}

// Returns the index of the first NOT-YET-REVEALED answer that the guess
// matches (by text or alias), or -1 if nothing matches.
function findMatchingAnswerIndex(guessText) {
  const q = currentQuestion();
  for (let i = 0; i < q.answers.length; i++) {
    if (game.revealedIndices.has(i)) continue; // already scored — can't score twice
    if (isAnswerMatch(guessText, q.answers[i])) return i;
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
