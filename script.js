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
   7. CORE GAMEPLAY STATE MACHINE — SAME-QUESTION, TWO-TEAM ROUNDS
   ==========================================================================
   NEW ROUND FLOW (replaces the old face-off / strikes / pass-steal loop):

     START ROUND -> show ONE shared question -> Team A turn -> Team A
     submits -> evaluate -> reveal if matched -> Team B turn -> Team B
     submits -> evaluate -> reveal if matched -> compare round points ->
     show ROUND RESULT + winner -> continue to next round.

   Both teams always see and answer the SAME survey board (game.questions
   is unchanged / still driven by PRELOADED_QUESTIONS or custom quizzes).
   Each team gets exactly one guess per round. An answer already claimed
   by the other team can never be claimed again (see revealedIndices).
   ========================================================================== */

/* -------------------------------------------------------------------------
   7A. ANSWER MATCHING ENGINE (semantic, alias-aware, reusable)
   Players type the answer their team called out. Instead of requiring an
   exact string match, a guess runs through a small layered pipeline so
   synonyms, plurals, abbreviations, incomplete words, and small typos are
   all accepted — while the board only ever reveals the ORIGINAL survey
   text (never whatever the player actually typed).

     LEVEL 1 — exact normalized match
     LEVEL 2 — alias / synonym match
     LEVEL 3 — phrase containment / word relationship
     LEVEL 4 — fuzzy string similarity (typos + incomplete-word truncation)

   Reusable building blocks: normalizeAnswer(), calculateSimilarity(),
   getAnswerMatch(). Nothing here is hard-coded per-question — every
   question in PRELOADED_QUESTIONS (and every custom question) is judged
   through the exact same pipeline.
   ------------------------------------------------------------------------- */

// 1) Normalize: lowercase, trim, strip minor punctuation, collapse spaces.
const RELATED_ANSWER_GROUPS = [
  ["phone", "mobile", "cellphone", "cell phone", "smartphone", "handset"],
  ["tea", "chai"], ["coffee", "cold coffee", "cafe coffee"],
  ["food", "snacks", "meal", "eating"], ["shoes", "sneakers", "footwear"],
  ["outfit", "clothes", "dress", "dressing"], ["friends", "friend", "buddies", "mates"],
  ["teachers", "teacher", "professor", "sir", "maam"], ["bike", "motorcycle", "scooter"],
  ["football", "soccer"], ["movie", "film", "cinema"], ["music", "songs", "song"],
  ["instagram", "insta", "ig"], ["youtube", "yt", "you tube"],
  ["whatsapp", "whats app", "wa"], ["hostel", "dorm", "dormitory"],
  ["bag", "backpack", "rucksack"], ["charger", "charging cable", "cable", "wire"]
];

function normalizeAnswer(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[.,!?'"()-]/g, "")     // ignore minor punctuation differences
    .replace(/\s+/g, " ");           // collapse repeated/extra spaces
}

function relatedForms(value) {
  const normalized = normalizeAnswer(value);
  const forms = new Set([normalized]);
  RELATED_ANSWER_GROUPS.forEach(group => {
    const normalizedGroup = group.map(normalizeAnswer);
    if (normalizedGroup.includes(normalized)) normalizedGroup.forEach(item => forms.add(item));
  });
  return [...forms];
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

// 3) Levenshtein edit distance — classic DP table, used as the base for
//    fuzzy spelling matches and the calculateSimilarity() helper below.
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

// calculateSimilarity(a, b) -> 0..1 normalized similarity (1 = identical,
// 0 = completely different). Reusable outside the matching pipeline too
// (e.g. for future features like "closest answer" hints).
function calculateSimilarity(a, b) {
  const normA = normalizeAnswer(a);
  const normB = normalizeAnswer(b);
  const maxLen = Math.max(normA.length, normB.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(normA, normB) / maxLen;
}

// 3b) Character-bag similarity — Jaccard overlap of letter counts. More
//    forgiving than edit distance to letter transpositions/heavier typos on
//    longer words ("ciggerate" vs "cigarette" is 4 edits apart but shares
//    almost the same letters). Only ever consulted for longer, similar-
//    length words with a high threshold, so genuinely different real
//    answers (e.g. "Shillong" vs "Kalimpong", both real hill stations)
//    stay well below it and are correctly rejected.
function letterBagSimilarity(a, b) {
  const count = s => { const m = {}; for (const c of s) m[c] = (m[c] || 0) + 1; return m; };
  const ca = count(a), cb = count(b);
  const keys = new Set([...Object.keys(ca), ...Object.keys(cb)]);
  let overlap = 0, union = 0;
  keys.forEach(k => {
    const x = ca[k] || 0, y = cb[k] || 0;
    overlap += Math.min(x, y);
    union += Math.max(x, y);
  });
  return union === 0 ? 1 : overlap / union;
}

// 4) Fuzzy equality — allows small spelling mistakes ("instgram") via edit
//    distance, plus heavier typos/transpositions ("ciggerate") via letter-
//    bag similarity — while staying strict enough that unrelated short or
//    dissimilar words never collide.
function fuzzyEqual(a, b) {
  if (a === b) return true;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen <= 3) return false;               // too short to risk fuzzy matching
  const threshold = maxLen <= 6 ? 1 : 2;
  if (levenshtein(a, b) <= threshold) return true;

  const minLen = Math.min(a.length, b.length);
  if (minLen >= 6 && Math.abs(a.length - b.length) <= 2) {
    return letterBagSimilarity(a, b) >= 0.75;
  }
  return false;
}

// 5) Prefix / truncation match — accepts an incomplete word ("smartph") as
//    the start of a longer one ("smartphone"), but ONLY once it covers a
//    meaningful majority of the full word. This is what keeps "ph" from
//    ever matching "phone" (2 chars is below the minimum length) while
//    still accepting "smartph" -> "smartphone" (covers 70% of the word).
function isPrefixMatch(a, b) {
  if (a === b) return false;
  const short = a.length <= b.length ? a : b;
  const long = a.length <= b.length ? b : a;
  if (short.length < 4) return false;          // too short to safely treat as truncation
  if (!long.startsWith(short)) return false;
  return short.length / long.length >= 0.6;    // must cover most of the full word
}

// 6) wordsMatch — "are these two normalized single words/phrases the same
//    idea": exact -> singular/plural -> fuzzy spelling -> prefix truncation.
function wordsMatch(normA, normB) {
  if (normA === normB) return true;
  if (singularize(normA) === singularize(normB)) return true;
  if (fuzzyEqual(normA, normB)) return true;
  if (isPrefixMatch(normA, normB)) return true;
  return false;
}

// 7) LEVEL 3 — phrase containment / word relationship. Lets a shorter
//    phrase (often a single word) match when it's meaningfully contained
//    inside a longer one, e.g. "Auto" <- "Auto Rickshaw", "Reels" <- "IG
//    Reels", "Bus" <- "City Bus" — even without an explicit alias entry.
//    Guarded so two same-length (usually single-word) phrases never reach
//    here — those are already judged by wordsMatch above.
function phraseContains(normA, normB) {
  const wordsA = normA.split(" ").filter(Boolean);
  const wordsB = normB.split(" ").filter(Boolean);
  const [shorter, longer] = wordsA.length <= wordsB.length ? [wordsA, wordsB] : [wordsB, wordsA];
  if (shorter.length === 0 || shorter.length === longer.length) return false;
  return shorter.every(w => longer.some(lw => wordsMatch(w, lw)));
}

// isStrongAnswerMatch — checks a raw guess against one answer object
// ({ text, points, aliases }) using LEVELS 1/2/4 only (exact, alias, fuzzy
// typo, prefix truncation) against the answer's full text/alias strings.
// Aliases let a single survey answer accept synonyms ("mobile"/"smartphone"
// for "Phone", "chai" for "Tea", etc.) without ever changing what's shown
// on the board.
function isStrongAnswerMatch(guessText, answerObj) {
  const guessForms = relatedForms(guessText).filter(Boolean);
  if (!guessForms.length) return false;
  const candidateForms = [answerObj.text, ...(answerObj.aliases || [])]
    .flatMap(relatedForms);
  return guessForms.some(guess => candidateForms.some(candidate => wordsMatch(guess, candidate)));
}

// isWeakAnswerMatch — LEVEL 3 only (phrase containment). Deliberately kept
// separate from the strong check: a shared word inside one answer's alias
// (e.g. "deo" inside Perfume's aliases) must never out-rank a DIFFERENT
// answer's own exact alias (e.g. "Spray" <- "deo spray") just because it
// happens to sit earlier on the board — see getAnswerMatch below.
function isWeakAnswerMatch(guessText, answerObj) {
  const guessForms = relatedForms(guessText).filter(Boolean);
  if (!guessForms.length) return false;
  const candidateForms = [answerObj.text, ...(answerObj.aliases || [])]
    .flatMap(relatedForms);
  return guessForms.some(guess => candidateForms.some(candidate => phraseContains(guess, candidate)));
}

// isAnswerMatch — combined predicate (strong OR weak), kept for anywhere a
// simple yes/no check against a single answer is needed.
function isAnswerMatch(guessText, answerObj) {
  return isStrongAnswerMatch(guessText, answerObj) || isWeakAnswerMatch(guessText, answerObj);
}

// getAnswerMatch(userAnswer, questionAnswers, excludeIndices) — the main
// reusable entry point. Given a raw guess and a question's answer list,
// returns the best not-excluded answer it matches as { index, answer }, or
// null. excludeIndices lets an in-progress round skip answers already
// claimed by the other team (an answer can only ever be claimed once).
//
// Runs in two passes so match STRENGTH decides the winner, never board
// position: every answer is checked for a strong match (levels 1/2/4)
// first; only if nothing on the whole board qualifies does a second pass
// fall back to phrase containment (level 3). This is what keeps a merely-
// related word from stealing a hit that rightfully belongs to a different,
// more exactly-matched answer elsewhere on the board.
function getAnswerMatch(userAnswer, questionAnswers, excludeIndices = new Set()) {
  for (let i = 0; i < questionAnswers.length; i++) {
    if (excludeIndices.has(i)) continue;
    if (isStrongAnswerMatch(userAnswer, questionAnswers[i])) {
      return { index: i, answer: questionAnswers[i] };
    }
  }
  for (let i = 0; i < questionAnswers.length; i++) {
    if (excludeIndices.has(i)) continue;
    if (isWeakAnswerMatch(userAnswer, questionAnswers[i])) {
      return { index: i, answer: questionAnswers[i] };
    }
  }
  return null;
}

// Thin convenience wrapper bound to the current question + this round's
// already-revealed answers — used everywhere below in the round flow.
function findMatchingAnswerIndex(guessText) {
  const q = currentQuestion();
  return getAnswerMatch(guessText, q.answers, game.revealedIndices);
}

/* -------------------------------------------------------------------------
   7B. MATCH / ROUND STATE
   ------------------------------------------------------------------------- */
let game = null; // holds the full match state

function startMatch(nameA, nameB, questions) {
  game = {
    gameId: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    teamA: { name: nameA, score: 0, roundPoints: 0 },
    teamB: { name: nameB, score: 0, roundPoints: 0 },
    questions,
    qIndex: 0,
    turn: null,                    // 'A' | 'B' | null (round finished, showing result)
    revealedIndices: new Set()
  };
  document.getElementById("score-name-a").textContent = nameA;
  document.getElementById("score-name-b").textContent = nameB;
  showScreen("screen-game");
  loadQuestion();
}

function currentQuestion() {
  return game.questions[game.qIndex];
}

function publishLiveState(status = "live") {
  if (!game || !currentQuestion()) return;
  const q = currentQuestion();
  const state = {
    updatedAt: Date.now(),
    status,
    questionNumber: game.qIndex + 1,
    questionCount: game.questions.length,
    question: q.question,
    gameId: game.gameId,
    teamA: { name: game.teamA.name, score: game.teamA.score },
    teamB: { name: game.teamB.name, score: game.teamB.score },
    activeTeam: game.turn,
    answers: q.answers.map((answer, index) => ({
      text: answer.text,
      points: answer.points,
      revealed: game.revealedIndices.has(index)
    }))
  };
  try {
    localStorage.setItem("surveyShowdownLiveState", JSON.stringify(state));
  } catch (error) {
    console.warn("Could not update contestant display", error);
  }
}

/* ---------- Start of round ---------- */
function loadQuestion() {
  const q = currentQuestion();
  game.revealedIndices = new Set();
  game.teamA.roundPoints = 0;
  game.teamB.roundPoints = 0;
  game.turn = "A"; // The admin can switch this at any time as teams compete for answers.

  document.getElementById("question-text").textContent = q.question;
  document.getElementById("question-counter").textContent =
    `Question ${game.qIndex + 1} / ${game.questions.length}`;
  updateAnswersRemaining();
  renderScores();
  buildAnswerBoard();

  // Strikes / pass-steal belong to the old single-team-controls-the-board
  // mode and have no role in the same-question two-team flow — keep that
  // row out of the way rather than deleting it from the markup.
  document.getElementById("strikes-display").style.display = "none";
  document.getElementById("btn-strike").style.display = "none";
  document.getElementById("btn-reveal-remaining").style.display = "none";
  document.getElementById("host-controls").style.display = "none";

  document.getElementById("btn-next-question").style.display = "none";
  document.getElementById("guess-row").style.display = "flex";

  const guessInput = document.getElementById("input-guess");
  setGuessFeedback("");
  guessInput.value = "";
  guessInput.classList.remove("shake");
  guessInput.disabled = false;
  document.getElementById("btn-submit-guess").disabled = false;

  setupAdminControls();
  updateTurnIndicator();
  guessInput.focus();
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
  publishLiveState();
}

function renderScores() {
  document.getElementById("score-value-a").textContent = game.teamA.score;
  document.getElementById("score-value-b").textContent = game.teamB.score;
  publishLiveState();
}

// Highlights whichever team is currently up, reusing the existing
// score-card "in-control" glow + control-flag label (repurposed from
// "who's in control of the board" to "whose turn it is").
function updateTurnIndicator() {
  const cardA = document.getElementById("score-card-a");
  const cardB = document.getElementById("score-card-b");
  document.getElementById("control-flag-a").textContent = "ANSWERING NOW";
  document.getElementById("control-flag-b").textContent = "ANSWERING NOW";
  cardA.classList.toggle("in-control", game.turn === "A");
  cardB.classList.toggle("in-control", game.turn === "B");
  const contestantStatus = document.getElementById("contestant-status");
  if (contestantStatus) {
    contestantStatus.textContent = `${game.turn === "A" ? game.teamA.name : game.teamB.name} is selected — both teams may buzz in.`;
  }
  document.getElementById("btn-award-a").classList.toggle("selected", game.turn === "A");
  document.getElementById("btn-award-b").classList.toggle("selected", game.turn === "B");
}

function setupAdminControls() {
  const buttonA = document.getElementById("btn-award-a");
  const buttonB = document.getElementById("btn-award-b");
  buttonA.textContent = `${game.teamA.name} Answer`;
  buttonB.textContent = `${game.teamB.name} Answer`;
  [buttonA, buttonB, document.getElementById("btn-reveal-now"), document.getElementById("btn-skip-question")]
    .forEach(button => { button.disabled = false; });
  document.getElementById("btn-next-board").style.display = "none";
}

function selectAnsweringTeam(team) {
  if (!game || !game.turn) return;
  game.turn = team;
  setGuessFeedback("");
  updateTurnIndicator();
  document.getElementById("input-guess").focus();
}

/* -------------------------------------------------------------------------
   7C. TWO-TEAM SAME-QUESTION ROUND LOGIC
   ------------------------------------------------------------------------- */

// Flips the ONE matched card (regardless of its position on the board) and
// credits its points to awardTeam's round total AND running score. Guarded
// against double-scoring (an answer already claimed can't be claimed again).
function revealAnswerByIndex(idx, awardTeam) {
  const q = currentQuestion();
  if (game.revealedIndices.has(idx)) return;

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
  const teamState = awardTeam === "A" ? game.teamA : game.teamB;
  teamState.roundPoints += points;
  teamState.score += points;

  renderScores();
  updateAnswersRemaining();
}

// Briefly shakes the guess input to give visual feedback on a wrong answer.
function flashWrongGuess() {
  const input = document.getElementById("input-guess");
  input.classList.remove("shake");
  void input.offsetWidth; // restart the animation
  input.classList.add("shake");
}

function setGuessFeedback(message, type = "") {
  const feedback = document.getElementById("guess-feedback");
  feedback.textContent = message;
  feedback.className = `guess-feedback ${type}`.trim();
}

function handleGuessSubmit() {
  if (!game || !game.turn) return; // no active turn (round already over)
  const input = document.getElementById("input-guess");
  const guess = input.value;
  if (!guess.trim()) return;

  const answeringTeam = game.turn;
  const match = findMatchingAnswerIndex(guess);
  input.value = "";

  if (match) {
    revealAnswerByIndex(match.index, answeringTeam);
    setGuessFeedback(`Matched: ${match.answer.text}`, "correct");
  } else {
    flashWrongGuess();
    AudioFX.strike();
    setGuessFeedback("No matching answer found.", "wrong");
  }

  if (game.revealedIndices.size === currentQuestion().answers.length) {
    finishRound(true);
  }
}

document.getElementById("btn-submit-guess").addEventListener("click", handleGuessSubmit);
document.getElementById("input-guess").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleGuessSubmit();
  }
});

document.getElementById("btn-award-a").addEventListener("click", () => selectAnsweringTeam("A"));
document.getElementById("btn-award-b").addEventListener("click", () => selectAnsweringTeam("B"));
document.getElementById("btn-reveal-now").addEventListener("click", () => finishRound(true));
document.getElementById("btn-skip-question").addEventListener("click", skipQuestion);
document.getElementById("btn-next-board").addEventListener("click", advanceToNextQuestion);
document.getElementById("btn-refresh-votes").addEventListener("click", refreshAudienceVotes);
document.getElementById("btn-sort-votes").addEventListener("click", sortBoardByAudienceVotes);
document.getElementById("btn-rewrite-votes").addEventListener("click", rewriteBoardFromAudienceVotes);

let audienceVoteTotals = [];
async function refreshAudienceVotes() {
  if (!game || !window.SURVEY_SHOWDOWN_CONFIG) return;
  const { supabaseUrl, supabasePublishableKey } = window.SURVEY_SHOWDOWN_CONFIG;
  const url = `${supabaseUrl}/rest/v1/audience_answers?game_id=eq.${encodeURIComponent(game.gameId)}&question_number=eq.${game.qIndex + 1}&select=answer`;
  try {
    const response = await fetch(url, { headers: { apikey: supabasePublishableKey, Authorization: `Bearer ${supabasePublishableKey}` } });
    if (!response.ok) throw new Error();
    const counts = new Map();
    (await response.json()).forEach(row => { const key = normalizeAnswer(row.answer); const item = counts.get(key) || { text: row.answer, votes: 0 }; item.votes++; counts.set(key, item); });
    audienceVoteTotals = [...counts.values()].sort((a, b) => b.votes - a.votes);
    document.getElementById("audience-vote-summary").textContent = audienceVoteTotals.length ? `${audienceVoteTotals.length} suggested answers` : "No audience answers yet";
    document.getElementById("audience-vote-list").innerHTML = audienceVoteTotals.slice(0, 8).map(item => `<li>${escapeHtml(item.text)} <strong>${item.votes}</strong></li>`).join("");
  } catch { document.getElementById("audience-vote-summary").textContent = "Votes unavailable — complete Supabase setup."; }
}
function sortBoardByAudienceVotes() {
  if (!game) return;
  const q = currentQuestion(); const votesFor = answer => audienceVoteTotals.find(item => isAnswerMatch(item.text, answer))?.votes || 0;
  q.answers.sort((a, b) => votesFor(b) - votesFor(a)); game.revealedIndices = new Set(); buildAnswerBoard(); updateAnswersRemaining();
}
function rewriteBoardFromAudienceVotes() {
  if (!game || !audienceVoteTotals.length) return;
  const q = currentQuestion(); q.answers = audienceVoteTotals.slice(0, 6).map(item => ({ text: item.text, points: item.votes * 10, aliases: [] })); game.revealedIndices = new Set(); buildAnswerBoard(); updateAnswersRemaining();
}

// Team A -> Team B -> round over. Each team gets exactly one guess per round.
function advanceTurn() {
  if (game.turn === "A") {
    game.turn = "B";
    updateTurnIndicator();
    const input = document.getElementById("input-guess");
    input.value = "";
    input.focus();
  } else {
    game.turn = null;
    endRound();
  }
}

// Flips every still-hidden card (no points awarded — just a clean board)
// once both teams have had their turn.
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
}

function disableAdminControls() {
  ["btn-award-a", "btn-award-b", "btn-reveal-now", "btn-skip-question"].forEach(id => {
    document.getElementById(id).disabled = true;
  });
}

function finishRound(revealAnswers) {
  if (!game || !game.turn) return;
  game.turn = null;
  document.getElementById("guess-row").style.display = "none";
  setGuessFeedback("");
  disableAdminControls();
  if (revealAnswers) revealAllRemaining();
  const contestantStatus = document.getElementById("contestant-status");
  if (contestantStatus) contestantStatus.textContent = "Round complete — remaining answers are visible.";
  document.getElementById("score-card-a").classList.remove("in-control");
  document.getElementById("score-card-b").classList.remove("in-control");
  document.getElementById("btn-next-board").style.display = "inline-block";
  publishLiveState("revealed");
}

function skipQuestion() {
  if (!game || !game.turn) return;
  game.turn = null;
  disableAdminControls();
  publishLiveState("skipped");
  advanceToNextQuestion();
}

function advanceToNextQuestion() {
  if (!game) return;
  game.qIndex++;
  if (game.qIndex >= game.questions.length) endMatch();
  else loadQuestion();
}

/* -------------------------------------------------------------------------
   7D. ROUND WINNER LOGIC
   ------------------------------------------------------------------------- */
function endRound() {
  finishRound(true);
}

function showRoundResult() {
  const { teamA, teamB } = game;
  let title, roundWinnerCard = null;

  if (teamA.roundPoints > teamB.roundPoints) {
    title = `${teamA.name.toUpperCase()} WINS THE ROUND`;
    roundWinnerCard = "A";
  } else if (teamB.roundPoints > teamA.roundPoints) {
    title = `${teamB.name.toUpperCase()} WINS THE ROUND`;
    roundWinnerCard = "B";
  } else {
    title = "DRAW — NO ROUND WINNER"; // handled gracefully, game continues normally
  }

  document.getElementById("round-result-title").textContent = title;
  document.getElementById("round-result-detail").textContent =
    `${teamA.name}: ${teamA.roundPoints} pts this round   •   ${teamB.name}: ${teamB.roundPoints} pts this round`;

  if (roundWinnerCard === "A") document.getElementById("score-card-a").classList.add("in-control");
  if (roundWinnerCard === "B") document.getElementById("score-card-b").classList.add("in-control");

  AudioFX.fanfare();
  document.getElementById("overlay-round-result").classList.add("active");
}

document.getElementById("btn-round-continue").addEventListener("click", () => {
  document.getElementById("overlay-round-result").classList.remove("active");
  document.getElementById("score-card-a").classList.remove("in-control");
  document.getElementById("score-card-b").classList.remove("in-control");
  game.qIndex++;
  if (game.qIndex >= game.questions.length) {
    endMatch();
  } else {
    loadQuestion();
  }
});

/* ---------- End of match ---------- */
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
