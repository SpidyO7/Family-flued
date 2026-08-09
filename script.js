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
  {
    id: 1,
    question: "What is the first thing students do after waking up?",
    answers: [
      ["Check phone", 35],
      ["Check notifications", 25],
      ["Instagram/Reels", 18],
      ["WhatsApp", 12],
      ["Go back to sleep", 10]
    ]
  },

  {
    id: 2,
    question: "What is the first thing students check before going to class?",
    answers: [
      ["Class timing", 30],
      ["WhatsApp class group", 25],
      ["Attendance", 20],
      ["Classroom/location", 15],
      ["Is the class cancelled?", 10]
    ]
  },

  {
    id: 3,
    question: "What does someone check when they say, \"I'm just checking the time\"?",
    answers: [
      ["Instagram", 30],
      ["WhatsApp", 25],
      ["Notifications", 20],
      ["Messages", 15],
      ["Actually the time", 10]
    ]
  },

  {
    id: 4,
    question: "What do students open first when they unlock their phone?",
    answers: [
      ["Instagram", 35],
      ["WhatsApp", 25],
      ["Snapchat", 20],
      ["YouTube", 12],
      ["Gallery", 8]
    ]
  },

  {
    id: 5,
    question: "What does someone actually mean by \"I'm just checking Instagram\"?",
    answers: [
      ["Scrolling Reels", 40],
      ["Checking someone's profile", 25],
      ["Replying to DMs", 15],
      ["Checking stories", 12],
      ["Actually checking something", 8]
    ]
  },

  {
    id: 6,
    question: "What makes someone open Snapchat immediately?",
    answers: [
      ["Streaks", 40],
      ["New snap", 25],
      ["Someone they like sent one 👀", 20],
      ["Memories", 10],
      ["Accidentally opened it", 5]
    ]
  },

  {
    id: 7,
    question: "What is the biggest Snapchat crime?",
    answers: [
      ["Breaking a streak", 35],
      ["Leaving someone on delivered", 25],
      ["Screenshotting a private snap", 20],
      ["Sending a boring snap", 12],
      ["Replying after 2 days", 8]
    ]
  },

  {
    id: 8,
    question: "What happens when someone says \"one last reel\"?",
    answers: [
      ["Watches 20 more", 35],
      ["Loses track of time", 25],
      ["Sends it to a friend", 20],
      ["Likes it", 12],
      ["Actually stops", 8]
    ]
  },

  {
    id: 9,
    question: "What type of Reel gets sent to the group chat?",
    answers: [
      ["Relatable", 30],
      ["Savage/funny", 25],
      ["College-related", 20],
      ["Crush/relationship", 15],
      ["Completely random", 10]
    ]
  },

  {
    id: 10,
    question: "What makes someone instantly send a Reel to their best friend?",
    answers: [
      ["This is literally you", 35],
      ["Inside joke", 25],
      ["Crush/relationship reference", 20],
      ["Dark humour", 12],
      ["Food/travel", 8]
    ]
  },

  {
    id: 11,
    question: "Where does college gossip spread fastest?",
    answers: [
      ["Friend group", 30],
      ["WhatsApp group", 25],
      ["Canteen", 20],
      ["Snapchat/Instagram", 15],
      ["Someone told someone", 10]
    ]
  },

  {
    id: 12,
    question: "What does someone say before telling you gossip?",
    answers: [
      ["Don't tell anyone…", 40],
      ["I shouldn't be telling you this…", 25],
      ["Promise you won't tell?", 15],
      ["Bro, listen…", 12],
      ["This is crazy", 8]
    ]
  },

  {
    id: 13,
    question: "What makes college gossip interesting?",
    answers: [
      ["Crush involved", 30],
      ["Teacher involved", 25],
      ["Friend group involved", 20],
      ["Relationship drama", 15],
      ["Nobody knows the full story", 10]
    ]
  },

  {
    id: 14,
    question: "What does \"Bro is cooked\" mean?",
    answers: [
      ["He's in serious trouble", 35],
      ["Failed badly", 25],
      ["Mentally exhausted", 20],
      ["Situation is hopeless", 12],
      ["Actually cooking", 8]
    ]
  },

  {
    id: 15,
    question: "What does \"It's giving…\" usually mean?",
    answers: [
      ["Describing a vibe", 40],
      ["Complimenting someone", 20],
      ["Judging something", 15],
      ["Making a joke", 15],
      ["Nobody knows anymore", 10]
    ]
  },

  {
    id: 16,
    question: "What does \"NPC\" describe?",
    answers: [
      ["Someone acting predictable", 35],
      ["Someone with no reaction", 25],
      ["Someone behaving randomly", 20],
      ["Someone always following others", 12],
      ["A gaming character", 8]
    ]
  },

  {
    id: 17,
    question: "What does \"W\" mean in the group chat?",
    answers: [
      ["Win", 45],
      ["Good decision", 25],
      ["Respect", 15],
      ["Congratulations", 10],
      ["Nobody knows anymore", 5]
    ]
  },

  {
    id: 18,
    question: "What does \"Delulu\" usually describe?",
    answers: [
      ["Being unrealistically hopeful", 40],
      ["Having a crush", 20],
      ["Overthinking", 15],
      ["Being confident", 15],
      ["Being completely confused", 10]
    ]
  },

  {
    id: 19,
    question: "What is the most common excuse for missing class?",
    answers: [
      ["I wasn't feeling well.", 30],
      ["I overslept.", 25],
      ["I had some work.", 20],
      ["I didn't know there was class.", 15],
      ["I thought it was cancelled.", 10]
    ]
  },

  {
    id: 20,
    question: "What happens when students hear \"assignment submission is today\"?",
    answers: [
      ["Start immediately", 5],
      ["Ask friends for the file", 30],
      ["Google/YouTube it", 20],
      ["Ask AI", 25],
      ["Bro, what assignment?", 20]
    ]
  },

  {
    id: 21,
    question: "What happens when the teacher says \"I won't take attendance today\"?",
    answers: [
      ["Everyone relaxes", 30],
      ["Some students leave", 25],
      ["Start talking", 20],
      ["Open phones", 15],
      ["Suddenly interested in the lecture", 10]
    ]
  },

  {
    id: 22,
    question: "What happens 5 minutes before a presentation?",
    answers: [
      ["Everyone suddenly practices", 30],
      ["Fight over who speaks first", 20],
      ["Check the PPT", 20],
      ["Bro, what's my part?", 20],
      ["Someone disappears", 10]
    ]
  },

  {
    id: 23,
    question: "What happens when someone says, \"Let's go to the canteen for 5 minutes\"?",
    answers: [
      ["5 minutes becomes 30", 35],
      ["Everyone joins", 25],
      ["Gossip starts", 20],
      ["Buy something unnecessarily", 12],
      ["Actually return in 5 minutes", 8]
    ]
  },

  {
    id: 24,
    question: "What happens during a free period?",
    answers: [
      ["Canteen", 30],
      ["Reels", 25],
      ["Gossip", 20],
      ["Sleep", 15],
      ["Last-minute assignment", 10]
    ]
  },

  {
    id: 25,
    question: "What is most likely to start an argument in a friend group?",
    answers: [
      ["Where to eat", 30],
      ["Who pays", 20],
      ["Where to go", 20],
      ["Someone cancelling plans", 15],
      ["Bro, you didn't invite me?", 15]
    ]
  },

  {
    id: 26,
    question: "What do people do when they see their crush?",
    answers: [
      ["Fix their hair", 30],
      ["Pretend not to notice", 25],
      ["Check their phone", 20],
      ["Act extra confident", 15],
      ["Forget how to walk", 10]
    ]
  },

  {
    id: 27,
    question: "What is the first thing someone does after getting a DM from their crush?",
    answers: [
      ["Shows their best friend", 35],
      ["Takes a screenshot", 25],
      ["Thinks about the reply", 20],
      ["Replies instantly", 12],
      ["Pretends they don't care", 8]
    ]
  },

  {
    id: 28,
    question: "What is the biggest sign someone likes someone?",
    answers: [
      ["Finds reasons to talk", 30],
      ["Replies quickly", 25],
      ["Remembers small things", 20],
      ["Looks at them repeatedly", 15],
      ["Friends start teasing them", 10]
    ]
  },

  {
    id: 29,
    question: "What do people do when they see an attractive person walking toward them?",
    answers: [
      ["Fix their hair", 30],
      ["Check themselves in phone camera", 25],
      ["Walk differently", 20],
      ["Pretend not to care", 15],
      ["Forget how to function", 10]
    ]
  },

  {
    id: 30,
    question: "What is the biggest red flag in a person?",
    answers: [
      ["Lies", 30],
      ["Never apologizes", 25],
      ["Talks badly about everyone", 20],
      ["I'm always right", 15],
      ["Says I'm not toxic", 10]
    ]
  },

  {
    id: 31,
    question: "What is the biggest sign someone is toxic?",
    answers: [
      ["Blames everyone else", 30],
      ["Never admits they're wrong", 25],
      ["Constant drama", 20],
      ["Controlling behaviour", 15],
      ["Says I'm the least toxic person", 10]
    ]
  },

  {
    id: 32,
    question: "What do people do when they say, \"I'm going to sleep early tonight\"?",
    answers: [
      ["Scroll Reels", 35],
      ["Watch Netflix/YouTube", 25],
      ["Overthink", 20],
      ["Text someone", 12],
      ["Actually sleep", 8]
    ]
  },

  {
    id: 33,
    question: "What is something students say every day but rarely mean?",
    answers: [
      ["I'll study tonight.", 35],
      ["I'm coming in 5 minutes.", 25],
      ["One last reel.", 20],
      ["I'll sleep early.", 12],
      ["I'm not hungry.", 8]
    ]
  },

  {
    id: 34,
    question: "What is the most common reason someone doesn't reply to a message?",
    answers: [
      ["I was busy.", 35],
      ["Forgot", 25],
      ["Saw it and ignored it", 20],
      ["Fell asleep", 12],
      ["My phone was on silent.", 8]
    ]
  },

  {
    id: 35,
    question: "What is the biggest group-chat betrayal?",
    answers: [
      ["Sending a private screenshot", 35],
      ["Breaking someone's secret", 25],
      ["Leaving someone on seen", 20],
      ["Removing someone from the group", 12],
      ["Reacting with 👍", 8]
    ]
  },

  {
    id: 36,
    question: "What should never accidentally be sent to the wrong group chat?",
    answers: [
      ["Screenshot", 35],
      ["Gossip", 30],
      ["Crush message", 20],
      ["Private photo", 10],
      ["Look what they said 😂", 5]
    ]
  },

  {
    id: 37,
    question: "What is most likely to be discussed in the class WhatsApp group?",
    answers: [
      ["Assignment", 30],
      ["Attendance", 25],
      ["Class timing", 20],
      ["Is there class tomorrow?", 15],
      ["Random meme", 10]
    ]
  },

  {
    id: 38,
    question: "What happens when someone asks \"Guys, attendance today?\"",
    answers: [
      ["Everyone checks their own", 30],
      ["I'm not going.", 25],
      ["Calculate percentage", 20],
      ["Someone sends a screenshot", 15],
      ["Ask the teacher.", 10]
    ]
  },

  {
    id: 39,
    question: "What is the first thing a fresher notices about a new class?",
    answers: [
      ["Who looks friendly", 25],
      ["Who is attractive 👀", 20],
      ["Who seems smart", 20],
      ["Where everyone sits", 20],
      ["Who should I talk to?", 15]
    ]
  },

  {
    id: 40,
    question: "How does a new college friendship usually start?",
    answers: [
      ["Which section are you in?", 25],
      ["Asking for notes", 25],
      ["Sitting beside someone", 20],
      ["Group project", 15],
      ["What's your Instagram/Snap?", 15]
    ]
  },

  {
    id: 41,
    question: "What does a CSE student do when their code doesn't work?",
    answers: [
      ["Read the error", 10],
      ["Google it", 30],
      ["YouTube it", 20],
      ["Ask a friend", 20],
      ["ChatGPT, please save me.", 20]
    ]
  },

  {
    id: 42,
    question: "What happens during a group project?",
    answers: [
      ["One person does everything", 30],
      ["Someone disappears", 25],
      ["Everyone says I'll do it tonight", 20],
      ["Last-minute panic", 15],
      ["Somehow it gets submitted", 10]
    ]
  },

  {
    id: 43,
    question: "What does the person who says \"I'll do it tonight\" usually do?",
    answers: [
      ["Does nothing", 35],
      ["Sends it at the last minute", 25],
      ["Says Bro, remind me", 20],
      ["Copies someone else's part", 12],
      ["Actually finishes it", 8]
    ]
  },

  {
    id: 44,
    question: "What is the biggest enemy of a student in Guwahati?",
    answers: [
      ["Sudden rain", 30],
      ["Traffic", 25],
      ["Humidity", 20],
      ["Getting late to class", 15],
      ["All of the above", 10]
    ]
  },

  {
    id: 45,
    question: "What is the first thought after coming back to the room after college?",
    answers: [
      ["I'm hungry.", 30],
      ["I need to sleep.", 25],
      ["I'll study after 10 minutes.", 20],
      ["Open Instagram", 15],
      ["What should I eat?", 10]
    ]
  },

  {
    id: 46,
    question: "What is most likely to expose someone in a friend group?",
    answers: [
      ["Screenshot", 35],
      ["Old photo", 25],
      ["Group chat message", 20],
      ["Story archive", 12],
      ["Friend accidentally telling everyone", 8]
    ]
  },

  {
    id: 47,
    question: "Who usually knows the latest college gossip first?",
    answers: [
      ["The social person", 25],
      ["Class group admin", 25],
      ["Canteen regular", 20],
      ["Someone from another section", 15],
      ["That one person who knows EVERYTHING", 15]
    ]
  },

  {
    id: 48,
    question: "Who is most likely to become famous on campus?",
    answers: [
      ["The extrovert", 25],
      ["The funny one", 25],
      ["The attractive one", 20],
      ["The topper", 15],
      ["The mysterious quiet person", 15]
    ]
  },

  {
    id: 49,
    question: "What happens after someone gets rejected?",
    answers: [
      ["I'm fine.", 30],
      ["Tells their best friend", 25],
      ["Archives/deletes the chat", 20],
      ["Acts like they never cared", 15],
      ["Suddenly becomes a gym bro", 10]
    ]
  },

  {
    id: 50,
    question: "What is the biggest lie students tell themselves?",
    answers: [
      ["I'll study tomorrow.", 35],
      ["I'll sleep early tonight.", 25],
      ["I'll attend every class from now.", 20],
      ["I'll only watch one reel.", 12],
      ["This semester I'll be serious.", 8]
    ]
  },

  {
    id: 51,
    question: "Name something students check before class.",
    answers: [
      ["WhatsApp", 30],
      ["Attendance", 25],
      ["Timetable", 20],
      ["Classroom", 15],
      ["Instagram", 10]
    ]
  },

  {
    id: 52,
    question: "Name a social media app students use every day.",
    answers: [
      ["Instagram", 35],
      ["WhatsApp", 30],
      ["Snapchat", 20],
      ["YouTube", 10],
      ["Facebook", 5]
    ]
  },

  {
    id: 53,
    question: "Name something that spreads quickly on campus.",
    answers: [
      ["Gossip", 35],
      ["Rumours", 25],
      ["Memes", 20],
      ["News", 12],
      ["Screenshots", 8]
    ]
  },

  {
    id: 54,
    question: "Name an excuse students give for being late.",
    answers: [
      ["Traffic", 30],
      ["Overslept", 25],
      ["Couldn't find transport", 20],
      ["Rain", 15],
      ["I was on my way", 10]
    ]
  },

  {
    id: 55,
    question: "Name something students do instead of studying.",
    answers: [
      ["Reels", 35],
      ["Snapchat", 25],
      ["YouTube", 20],
      ["Gaming", 12],
      ["Gossip", 8]
    ]
  }
];


// Optional helper functions

function getQuestionById(id) {
  return questions.find(q => q.id === id);
}

function getRandomQuestion() {
  return questions[Math.floor(Math.random() * questions.length)];
}

function getRandomQuestions(count = 10) {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
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
