
"use strict";

// MISSION: RED PLANET

const TOTAL_DAYS = 30;
const $ = id => document.getElementById(id);


const DAILY_COST = {
    oxygen: 2,
    water: 2,
    food: 2,
    energy: 1
};


const RESOURCES = [
  "oxygen", "water", "food",
  "energy", "shield", "health"
];

const DIFFICULTIES = {
  easy: { consumption: .75, emergency: .15 },
  normal: { consumption: 1, emergency: .28 },
  hard: { consumption: 1.3, emergency: .40 }
};

let game = {
  day: 1,
  oxygen: 100,
  water: 100,
  food: 100,
  energy: 100,
  shield: 50,
  health: 100,
  research: 0,
  score: 0,
  commander: "Explorer",
  difficulty: "normal",
  actionUsed: false,
  running: false,
  logs: []
};

let exploredMarsSites = new Set();
let specialChallengeCompleted = false;

// DISPLAY

function message(text) {
  if ($("messageBox"))
    $("messageBox").textContent = text;
}

function showEvent(title, description, type = "MISSION EVENT") {
  if ($("eventTitle"))
    $("eventTitle").textContent = title;

  if ($("eventText"))
    $("eventText").textContent = description;

  const box = document.querySelector(".event-type");
  if (box) box.textContent = type;
}

function log(text) {
  game.logs.unshift(text);
  game.logs = game.logs.slice(0, 12);

  const box = $("missionLog");
  if (!box) return;

  box.replaceChildren();

  game.logs.forEach(entry => {
    const p = document.createElement("p");
    p.textContent = entry;
    box.appendChild(p);
  });
}


// MISSION SELECTION
const MISSION_OPTIONS = {
  colony: {
    name: "Mars Colony Survival",
    description: "Main mission: manage your colony and keep the crew alive for 30 Martian sols.",
    briefing: "Establish a surviving Mars colony. Keep the crew healthy, manage essential resources, protect the shelter, explore Mars and survive all 30 sols."
  },
  rover: {
    name: "Rescue the Rover",
    description: "Mission focus: prepare the crew, manage resources and complete the Rover Rescue challenge from Mission Control.",
    briefing: "Mission focus: Rescue the Rover. Maintain a healthy crew and sufficient resources, then complete the Rescue the Rover challenge from the mission dashboard."
  },
  ice: {
    name: "Collect Ice Samples",
    description: "Mission focus: prepare the crew, manage resources and complete the Ice Sample Collection challenge from Mission Control.",
    briefing: "Mission focus: Collect Ice Samples. Maintain a healthy crew and sufficient resources, then complete the Ice Sample Collection challenge from the mission dashboard."
  }
};

let selectedMission = "colony";

function selectMission() {
  const selector = $("missionSelect");
  const key = selector && MISSION_OPTIONS[selector.value] ? selector.value : "colony";
  selectedMission = key;
  const mission = MISSION_OPTIONS[key];

  const description = $("mission-description");
  if (description) description.textContent = mission.description;

  const briefing = $("missionBriefing");
  if (briefing) {
    const firstParagraph = briefing.querySelector("p");
    if (firstParagraph) {
      firstParagraph.innerHTML = "<strong>Mission:</strong> " + mission.name + " — " + mission.briefing;
    }
  }

  const display = $("selectedMissionDisplay");
  if (display) display.textContent = "Selected mission: " + mission.name;
}

$("missionSelect")?.addEventListener("change", selectMission);
selectMission();

// START GAME

$("startBtn")?.addEventListener("click", launchCountdown);

function launchCountdown() {
  const overlay = $("launch-countdown");
  const number = $("countdown-number");

  if (!overlay || !number) {
    startGame();
    return;
  }

  $("startBtn").disabled = true;
  overlay.classList.remove("hidden");

  let count = 3;
  number.textContent = count;

  const timer = setInterval(() => {
    count--;

    if (count > 0) {
      number.textContent = count;
    } else {
      clearInterval(timer);
      number.textContent = "🚀"
      overlay.classList.add("launching");
      const launchSound = $("launch-sound");

if (launchSound) {
    launchSound.currentTime = 0;
    launchSound.play().catch(() => {});
};
      setTimeout(() => {
        overlay.classList.add("hidden");
        $("startBtn").disabled = false;
        overlay.classList.remove("launching");
        startGame();
      }, 700);
    }
  }, 1000);
}

function startGame() {
  selectMission();
  const name = $("commanderName")?.value.trim();
  const difficulty = $("difficulty")?.value || "normal";

  game = {
    day: 1,
    oxygen: 100,
    water: 100,
    food: 100,
    energy: 100,
    shield: 50,
    health: 100,
    research: 0,
    score: 0,
    commander: name || "Explorer",
    difficulty: DIFFICULTIES[difficulty] ? difficulty : "normal",
    actionUsed: false,
    running: true,
    logs: []
  };

  exploredMarsSites.clear();
  specialChallengeCompleted = false;
  

  
// Reset special mission challenge
const roverButton = document.getElementById("rescue-rover");
const iceButton = document.getElementById("collect-ice");
const challengeResult = document.getElementById("challenge-result");

if (roverButton) {
    roverButton.disabled = false;
}

if (iceButton) {
    iceButton.disabled = false;
}

if (challengeResult) {
    challengeResult.textContent =
        "Choose your mission strategy, Commander.";
}

// Reset achievement displays
const achievementIds = [
    "badge-first",
    "badge-explorer",
    "badge-hero",
    "badge-scientist"
];

achievementIds.forEach(id => {
    const badge = document.getElementById(id);

    if (badge) {
        badge.classList.remove("unlocked");
        badge.classList.add("locked");
    }
});

const achievementProgress =
    document.getElementById("achievement-progress");

if (achievementProgress) {
    achievementProgress.textContent =
        "Achievements unlocked: 0 / 4";
}

  
  // Reset exploration display
const result = document.getElementById("exploration-result");
const count = document.getElementById("discovery-count");
const list = document.getElementById("discovery-list");

if (result) {
    result.textContent = "No discoveries yet. Choose a location!";
}

if (count) {
    count.textContent = "Discoveries: 0 / 3";
}

if (list) {
    list.innerHTML = "<li>No discoveries recorded yet.</li>";
}

// Re-enable all exploration buttons
document.querySelectorAll(".explore-btn").forEach(button => {
    button.disabled = false;
    button.classList.remove("discovered");
});

  $("welcomeScreen")?.classList.add("hidden");
  $("resultScreen")?.classList.add("hidden");
  $("gameScreen")?.classList.remove("hidden");

  if ($("commanderDisplay"))
    $("commanderDisplay").textContent =
      "Commander: " + game.commander;

  if ($("eventIcon"))
    $("eventIcon").textContent = "📡";

  showEvent(
    "MISSION INITIALIZED",
    "Four astronauts have landed safely on Mars. Your 30-sol survival mission begins now.",
    "MISSION UPDATE"
  );

  log("SOL 1: Your crew landed successfully on Mars.");

  message("Welcome, Commander! Choose your first engineering action.");

  updateDashboard();
  saveGame();

}

// DIFFICULTY

function selectDifficulty() {
  if (game.running) {
    message("Difficulty cannot be changed during a mission.");
    return;
  }

  const value = $("difficulty")?.value;

  if (DIFFICULTIES[value])
    game.difficulty = value;
}

$("difficulty")?.addEventListener("change", selectDifficulty);

// RESOURCE MANAGEMENT

function addResource(resource, amount) {
  game[resource] = Math.max(
    0,
    Math.min(100, game[resource] + amount)
  );
}

function canAfford(costs) {
  for (const resource in costs) {
    if (game[resource] < costs[resource]) {
      message("Not enough " + resource + ". Choose another action.");
      return false;
    }
  }
  return true;
}

function applyCosts(costs) {
  for (const resource in costs)
    game[resource] -= costs[resource];
}

// DASHBOARD

function updateDashboard() {
  RESOURCES.forEach(name => {
    const value = Math.max(0, Math.min(100, game[name]));
    const bar = $(name + "Bar");

    if ($(name + "Value"))
      $(name + "Value").textContent = Math.round(value);

    if (bar) {
      bar.style.width = value + "%";
      bar.style.background =
        value <= 20 ? "#ff4d4d" :
        value <= 45 ? "#ffad45" : "#39d98a";
    }
  });

  if ($("dayNumber"))
    $("dayNumber").textContent = "SOL " + game.day;

  const progress = ((game.day - 1) / TOTAL_DAYS) * 100;

  if ($("missionProgress"))
    $("missionProgress").style.width = progress + "%";

  if ($("progressFill"))
    $("progressFill").style.width = progress + "%";

  if ($("progressText"))
    $("progressText").textContent =
      `Day ${game.day} / ${TOTAL_DAYS}`;

  if ($("researchPoints"))
    $("researchPoints").textContent = game.research;

  const danger = RESOURCES.some(r => game[r] <= 20);

  if ($("missionStatus")) {
    $("missionStatus").textContent = danger ? "WARNING" : "STABLE";
    $("missionStatus").style.color =
      danger ? "#ff5959" : "#39d98a";
  }

  document.querySelectorAll(".action-card").forEach(button => {
    button.disabled = !game.running || game.actionUsed;
  });

  if ($("nextDayBtn"))
    $("nextDayBtn").disabled = !game.running;

  if ($("crew-health-report"))
    $("crew-health-report").textContent = game.health + "%";

  if ($("crew-status")) {
    $("crew-status").textContent =
      game.health >= 80 ? "🟢 Crew members are healthy." :
      game.health >= 50 ? "🟡 Crew members are tired. Provide recovery." :
      game.health > 20 ? "🟠 Crew health is low. Medical support needed." :
      "🔴 CRITICAL: Crew members are in serious danger!";
  }

  if ($("daysSurvived"))
    $("daysSurvived").textContent = Math.max(game.day - 1, 0);

  if ($("researchTotal"))
    $("researchTotal").textContent = game.research;

  if ($("missionScore"))
    $("missionScore").textContent = game.score;

  if ($("locationsExplored"))
    $("locationsExplored").textContent = exploredMarsSites.size;

  updateMissionAlert();
}

// MEDICAL SUPPORT
const medicalSupportButton = $("medical-support-btn");

if (medicalSupportButton) {
  medicalSupportButton.addEventListener("click", recoverCrew);
}

function recoverCrew() {
  const status = $("medical-support-status");

  const report = text => {
    if (status) status.textContent = text;
    message(text);
  };

  if (!game.running) {
    report("Start your Mars mission before using medical support.");
    return;
  }

  if (game.health >= 100) {
    report("Crew health is already at 100%. Medical support is not needed.");
    return;
  }

  if (game.actionUsed) {
    report("Today's action has already been used. Advance to the next Sol to use medical support.");
    return;
  }

  const cost = { water: 5, energy: 10 };
  if (!canAfford(cost)) {
    report("Medical support needs 5 water and 10 energy. Replenish resources and try again.");
    return;
  }

  applyCosts(cost);
  const oldHealth = game.health;
  addResource("health", 20);
  const restored = game.health - oldHealth;
  game.actionUsed = true;

  const successText = "Medical support successful! Crew health restored by " + restored + " points. Cost: 5 water and 10 energy.";
  report(successText);
  log("MEDICAL SUPPORT: " + successText);
  updateDashboard();
  saveGame();
}

// MISSION ALERTS

function updateMissionAlert() {
  const box = $("mission-alert");
  if (!box) return;

  const warnings = [];

  RESOURCES.forEach(r => {
    if (game[r] <= 25)
      warnings.push("⚠️ " + r.toUpperCase() + " is dangerously low.");
  });

  box.textContent = warnings.length
    ? warnings.join(" ")
    : "✅ All major mission systems are operating normally.";
}

// ENGINEERING ACTIONS

function useAction(action) {
  if (!game.running) {
    message("Start your mission first.");
    return;
  }

  if (game.actionUsed) {
    message("You have already used your engineering action today. Advance to the next day.");
    return;
  }

  const actions = {
    shield: {
      name: "Radiation Shield",
      cost: { energy: 10 },
      effect() {
        addResource("shield", 25);
      },
      text: "Radiation protection improved by 25 points."
    },

    farm: {
      name: "Grow Food",
      cost: { water: 12, energy: 8 },
      effect() {
        addResource("food", 30);
      },
      text: "Your greenhouse produced 30 food points."
    },

    water: {
      name: "Recycle Water",
      cost: { energy: 10 },
      effect() {
        addResource("water", 30);
      },
      text: "Water recycling restored 30 water points."
    },

    oxygen: {
      name: "Produce Oxygen",
      cost: { energy: 12 },
      effect() {
        addResource("oxygen", 30);
      },
      text: "Your oxygen generator produced 30 oxygen points."
    },

    repair: {
      name: "Repair Systems",
      cost: { energy: 15 },
      effect() {
        addResource("health", 10);
        addResource("shield", 10);
      },
      text: "Systems repaired. Crew health and shield improved."
    },

    research: {
      name: "Conduct Research",
      cost: { energy: 10 },
      effect() {
        game.research += 10;
        game.score += 15;
      },
      text: "Scientific research increased by 10 points."
    },

    rest: {
      name: "Crew Rest",
      cost: {},
      effect() {
        addResource("health", 15);
        addResource("energy", 20);
      },
      text: "The crew rested and recovered health and energy."
    },

    explore: {
      name: "Explore Mars",
      cost: { food: 5, oxygen: 5, energy: 15 },
      effect() {
        exploreMars();
      },
      text: "Mars exploration completed."
    }
  };

  const selected = actions[action];

  if (!selected) {
    message("Unknown engineering action.");
    return;
  }

  if (!canAfford(selected.cost)) return;

  applyCosts(selected.cost);
  selected.effect();

  game.actionUsed = true;
  game.score += 10;

  message(selected.text);
  log("SOL " + game.day + ": " + selected.text);

  updateDashboard();
}

// CONNECT ACTION BUTTONS

document.querySelectorAll(".action-card").forEach(button => {
  button.addEventListener("click", () => {
    useAction(button.dataset.action);
  });
});

// MARS EXPLORATION

const MARS_SITES = [
  {
    name: "Olympus Mons",
    description: "You explored the largest volcano in the solar system.",
    reward: 20
  },
  {
    name: "Valles Marineris",
    description: "You discovered clues about ancient water channels.",
    reward: 25
  },
  {
    name: "Jezero Crater",
    description: "You investigated a location where ancient microbial life may once have existed.",
    reward: 30
  },
  {
    name: "Utopia Planitia",
    description: "You studied the Martian surface and collected valuable soil data.",
    reward: 20
  },
  {
    name: "Gale Crater",
    description: "You discovered interesting geological evidence.",
    reward: 25
  }
];


function exploreMars(siteName) {
    if (!game.running) {
        alert("Start your mission first!");
        return;
    }

    const site = MARS_SITES.find(
        item => item.name === siteName
    );

    if (!site) {
        alert("Exploration location not found!");
        return;
    }

    if (exploredMarsSites.has(site.name)) {
        alert("You have already explored this location!");
        return;
    }

    // Exploration resource costs
    if (
        game.energy < 15 ||
        game.oxygen < 5 ||
        game.water < 4 ||
        game.food < 3
    ) {
        alert("Not enough resources to explore Mars!");
        return;
    }

    game.energy -= 15;
    game.oxygen -= 5;
    game.water -= 4;
    game.food -= 3;

    exploredMarsSites.add(site.name);
saveGame();
    game.research += site.reward;
    game.score += site.reward;

    const result = document.getElementById("exploration-result");

    if (result) {
        result.textContent =
            "Discovery: " + site.name + " — " + site.description;
    }

    const count = document.getElementById("discovery-count");

    if (count) {
        count.textContent =
            "Discoveries: " + exploredMarsSites.size + " / 3";
    }

    const list = document.getElementById("discovery-list");

    if (list) {
        list.innerHTML = "";

        exploredMarsSites.forEach(name => {
            const item = document.createElement("li");
            item.textContent = "🏆 " + name;
            list.appendChild(item);
        });
    }

    if (typeof updateMissionAchievements === "function") {
        updateMissionAchievements();
    }

    if (typeof playSuccessSound === "function") {
        playSuccessSound();
    }

    showEvent(
        "🔭 " + site.name,
        site.description,
        "EXPLORATION DISCOVERY"
    );

    log("Explored " + site.name + ": " + site.description);

    updateDashboard();
    if (exploredMarsSites.size === 3) {
    showEvent(
        "🏆 MARS EXPLORER!",
        "Congratulations, Commander! You have discovered all three Mars locations. You are now a true Mars Explorer!",
        "MISSION ACHIEVEMENT"
    );

    game.score += 50;
    updateDashboard();
}
}

// RANDOM MISSION EMERGENCIES

function generateEmergency() {
  const settings = DIFFICULTIES[game.difficulty] || DIFFICULTIES.normal;

  if (Math.random() > settings.emergency) return null;

  const events = [
    {
      title: "☀️ SOLAR STORM",
      description: "A solar storm is approaching. Radiation may damage the crew.",
      effect() {
        if (game.shield >= 15) {
          game.shield -= 15;
          return "Your shield absorbed most of the radiation.";
        }

        game.health -= 20;
        return "Weak radiation protection injured the crew!";
      }
    },
    {
      title: "💧 WATER LEAK",
      description: "A leak has been detected in the water storage system.",
      effect() {
        game.water -= 20;
        return "Water reserves decreased by 20 points.";
      }
    },
    {
      title: "⚡ POWER FAILURE",
      description: "A power failure has affected the habitat.",
      effect() {
        game.energy -= 20;
        return "Energy reserves decreased by 20 points.";
      }
    },
    {
      title: "🥫 FOOD CONTAMINATION",
      description: "Some stored food has become contaminated.",
      effect() {
        game.food -= 20;
        return "Food reserves decreased by 20 points.";
      }
    },
    {
      title: "🛠️ EQUIPMENT DAMAGE",
      description: "A critical habitat component has been damaged.",
      effect() {
        game.shield -= 10;
        game.energy -= 10;
        return "Shield and energy systems were damaged.";
      }
    },
    {
      title: "🩺 CREW ILLNESS",
      description: "One crew member is showing signs of illness.",
      effect() {
        game.health -= 15;
        return "Crew health decreased by 15 points.";
      }
    }
  ];

  const event = events[Math.floor(Math.random() * events.length)];
  const result = event.effect();

  showEvent(event.title, event.description, "EMERGENCY ALERT");
  log(event.title + ": " + result);

  return result;
}

// NEXT DAY

$("nextDayBtn")?.addEventListener("click", nextDay);

function nextDay() {
  if (!game.running) return;

  game.day++;

  const settings = DIFFICULTIES[game.difficulty] || DIFFICULTIES.normal;
  const multiplier = settings.consumption;

  for (const resource in DAILY_COST) {
    game[resource] -= Math.ceil(DAILY_COST[resource] * multiplier);
  }

  game.actionUsed = false;
  game.score += 5;

  log("SOL " + game.day + ": Daily supplies consumed.");

  generateEmergency();

  RESOURCES.forEach(resource => {
    game[resource] = Math.max(0, Math.min(100, game[resource]));
  });

  updateDashboard();

  if (game.health <= 0 || game.oxygen <= 0 ||
      game.water <= 0 || game.food <= 0) {
    endMission(false);
    return;
  }

  if (game.day >= TOTAL_DAYS) {
    endMission(true);
    return;
  }

  message("SOL " + game.day + ": Your crew begins a new day on Mars.");

  updateDashboard();
}

// MISSION END

function endMission(success) {
  game.running = false;

  if (success) {
    game.score += game.health + game.research;
    showResults(true);
  } else {
    showResults(false);
  }

  saveGame();
}

function showResults(success) {
  $("gameScreen")?.classList.add("hidden");
  $("welcomeScreen")?.classList.add("hidden");
  $("resultScreen")?.classList.remove("hidden");

  if ($("resultIcon"))
    $("resultIcon").textContent = success ? "🏆" : "🚨";

  if ($("resultTitle"))
    $("resultTitle").textContent = success
      ? "MISSION SUCCESS!"
      : "MISSION FAILED";

  if ($("resultText"))
    $("resultText").textContent = success
      ? "Congratulations, Commander! Your crew survived the 30-day Mars mission."
      : "Your mission ended early because a critical resource or crew health reached zero.";

  if ($("finalScore"))
    $("finalScore").textContent = game.score;

  if ($("certificate-name"))
    $("certificate-name").textContent = game.commander;

  if ($("daysSurvived"))
    $("daysSurvived").textContent = Math.max(0, game.day - 1);

  if ($("researchTotal"))
    $("researchTotal").textContent = game.research;

  if ($("missionScore"))
    $("missionScore").textContent = game.score;

  if ($("locationsExplored"))
    $("locationsExplored").textContent = exploredMarsSites.size;

  const lessons = success
    ? [
        "Careful resource management leads to survival.",
        "Engineering improvements protect astronauts.",
        "Scientific research helps us understand Mars."
      ]
    : [
        "Monitor oxygen, water and food every day.",
        "Use engineering actions before resources become critical.",
        "Protect the crew from emergencies and radiation."
      ];

  const list = $("lessonsLearned");

  if (list) {
    list.replaceChildren();

    lessons.forEach(lesson => {
      const item = document.createElement("li");
      item.textContent = lesson;
      list.appendChild(item);
    });
  }

  if (success) playSuccessSound();
}


function saveGame() {
    const savedData = {
        game: game,
        exploredMarsSites: [...exploredMarsSites],
        specialChallengeCompleted: specialChallengeCompleted
    };

    localStorage.setItem(
        "marsMissionSave",
        JSON.stringify(savedData)
    );

    console.log("Mission saved!");
}

function loadGame() {
    const savedData = localStorage.getItem("marsMissionSave");

    if (!savedData) {
        console.log("No saved mission found.");
        return;
    }

    try {
        const data = JSON.parse(savedData);

        Object.assign(game, data.game);

        exploredMarsSites = new Set(
            data.exploredMarsSites || []
        );

        specialChallengeCompleted =
            data.specialChallengeCompleted || false;

        console.log("Mission loaded!");
    } catch (error) {
        console.error("Save loading failed:", error);
    }
}

// Load saved mission when the game opens
loadGame();






// LOAD SAVED GAME

function loadSavedGame() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("redPlanetSave")
    );

    if (!saved || !saved.game) return false;

    game = saved.game;
    exploredMarsSites = new Set(saved.exploredMarsSites || []);

    return true;
  } catch (error) {
    console.warn("Could not load saved game:", error);
    return false;
  }
}

// RESTART GAME

function restartGame() {
  localStorage.removeItem("marsMissionSave");
  localStorage.removeItem("redPlanetSave");

  $("resultScreen")?.classList.add("hidden");
  $("gameScreen")?.classList.add("hidden");
  $("welcomeScreen")?.classList.remove("hidden");

  game.running = false;
  game.actionUsed = false;

  message("Start a new Mars survival mission.");
}

// Backward-compatible handler used by the Reset Mission button.
function resetMission() {
  restartGame();
}

$("restartBtn")?.addEventListener("click", restartGame);
$("playAgainBtn")?.addEventListener("click", restartGame);

// VICTORY SOUND

function playSuccessSound() {
  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    const audio = new AudioContextClass();
    const oscillator = audio.createOscillator();
    const volume = audio.createGain();

    oscillator.connect(volume);
    volume.connect(audio.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(523, audio.currentTime);
    oscillator.frequency.setValueAtTime(659, audio.currentTime + 0.2);
    oscillator.frequency.setValueAtTime(784, audio.currentTime + 0.4);

    volume.gain.setValueAtTime(0.15, audio.currentTime);
    volume.gain.exponentialRampToValueAtTime(
      0.001,
      audio.currentTime + 1
    );

    oscillator.start();
    oscillator.stop(audio.currentTime + 1);

    oscillator.onended = () => audio.close();
  } catch (error) {
    console.warn("Victory sound unavailable:", error);
  }
}

// NASA API

const NASA_API_KEY = "WfDgbcG6D77LdRrdcQW8dRLcBPH68TphTp8CmPWk";



// INITIALIZE

updateDashboard();



document.querySelectorAll(".explore-btn").forEach(button => {
    const siteName = button.dataset.site;

    // Restore previously discovered locations
    if (exploredMarsSites.has(siteName)) {
        button.disabled = true;
        button.classList.add("discovered");
    }

    button.addEventListener("click", function () {
        if (exploredMarsSites.has(siteName)) {
            alert("You have already discovered this location!");
            return;
        }

        exploreMars(siteName);

        if (exploredMarsSites.has(siteName)) {
            this.disabled = true;
            this.classList.add("discovered");
       
        }
    });
});



/* =================================
   MARS SPECIAL CHALLENGES
================================= */

// Connect the special challenge buttons after the page is ready.
function connectMarsChallengeButtons() {
  const roverButton = document.getElementById("rescue-rover");
  const iceButton = document.getElementById("collect-ice");

  if (roverButton && !roverButton.dataset.challengeBound) {
    roverButton.addEventListener("click", () => completeMarsChallenge("rover"));
    roverButton.dataset.challengeBound = "true";
  }

  if (iceButton && !iceButton.dataset.challengeBound) {
    iceButton.addEventListener("click", () => completeMarsChallenge("ice"));
    iceButton.dataset.challengeBound = "true";
  }
}

function completeMarsChallenge(type) {
  const result = document.getElementById("challenge-result");

  if (!result) return;

  if (!game.running) {
    result.textContent = "Start your mission before choosing a challenge.";
    return;
  }

  if (specialChallengeCompleted) {
    result.textContent = "You have already completed a special challenge this mission.";
    return;
  }

  let energyCost;
  let oxygenCost;
  let reward;
  let successMessage;

  if (type === "rover") {
    energyCost = 20;
    oxygenCost = 5;
    reward = 20;
    successMessage = "ROVER RESCUED! You recovered valuable scientific equipment.";
  } else if (type === "ice") {
    energyCost = 10;
    oxygenCost = 3;
    reward = 15;
    successMessage = "ICE SAMPLES COLLECTED! You gathered valuable Martian water-ice data.";
  } else {
    result.textContent = "Unknown challenge. Please try again.";
    return;
  }

  if (game.energy < energyCost || game.oxygen < oxygenCost) {
    result.textContent = "Not enough energy or oxygen. Prepare your colony and try again.";
    return;
  }

  game.energy -= energyCost;
  game.oxygen -= oxygenCost;
  game.research += reward;
  game.score += reward;
  specialChallengeCompleted = true;

  result.textContent = successMessage + " You earned " + reward + " research points.";

  const roverButton = document.getElementById("rescue-rover");
  const iceButton = document.getElementById("collect-ice");
  if (roverButton) roverButton.disabled = true;
  if (iceButton) iceButton.disabled = true;

  if (typeof updateMissionAchievements === "function") updateMissionAchievements();
  if (typeof updateDashboard === "function") updateDashboard();
  if (typeof log === "function") log("SPECIAL MISSION: " + successMessage);
  if (typeof saveGame === "function") saveGame();
  if (typeof playSuccessSound === "function") playSuccessSound();

  console.log("Mars challenge completed:", type);
}

// Support both normal and deferred script loading.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", connectMarsChallengeButtons, { once: true });
} else {
  connectMarsChallengeButtons();
}

function updateMissionAchievements() {
  const achievements = [
    {
      id: "badge-first",
      unlocked: exploredMarsSites.size >= 1
    },
    {
      id: "badge-explorer",
      unlocked: exploredMarsSites.size >= 3
    },
    {
      id: "badge-hero",
      unlocked: specialChallengeCompleted
    },
    {
      id: "badge-scientist",
      unlocked: game.research >= 50
    }
  ];

  let unlockedCount = 0;

  achievements.forEach(item => {
    const badge = document.getElementById(item.id);

    if (!badge) return;

    if (item.unlocked) {
      unlockedCount++;
      badge.classList.remove("locked");
      badge.classList.add("unlocked");

      const names = {
        "badge-first": "🔭 First Discovery — UNLOCKED!",
        "badge-explorer": "🧭 Mars Explorer — UNLOCKED!",
        "badge-hero": "🛠️ Mission Hero — UNLOCKED!",
        "badge-scientist": "🧪 Junior Scientist — UNLOCKED!"
      };

      badge.textContent = names[item.id];
    }
  });

  const progress =
    document.getElementById("achievement-progress");

  if (progress) {
    progress.textContent =
      "Achievements unlocked: " + unlockedCount + " / 4";
  }
}

updateMissionAchievements();

// ======================================
// PRINT MISSION CERTIFICATE
// ======================================

window.printCertificate = function () {
    window.print();
};



// ======================================
// NASA DONKI SPACE WEATHER INTEGRATION
// ======================================

async function refreshNASAData() {

    const status = $("nasa-status");
    const eventsBox = $("nasa-events");
    const cmeBox = $("nasa-cme-events");

    if (status) {
        status.textContent = "Loading NASA space weather data...";
    }

    try {

        // Get the last 7 days
        const today = new Date();
        const start = new Date(today);

        start.setDate(today.getDate() - 7);

        const formatDate = date =>
            date.toISOString().slice(0, 10);

        const startDate = formatDate(start);
        const endDate = formatDate(today);

        // Updated official NASA CCMC DONKI API
        const base =
            "https://ccmc.gsfc.nasa.gov/DONKI-API/get";

        const flareURL =
            `${base}/FLR?startDate=${startDate}&endDate=${endDate}`;

        const cmeURL =
            `${base}/CME?startDate=${startDate}&endDate=${endDate}`;

        // Request both NASA datasets
        const [flareResponse, cmeResponse] =
            await Promise.all([
                fetch(flareURL),
                fetch(cmeURL)
            ]);

        // Check Solar Flare response
        if (flareResponse.ok === false) {
            throw new Error(
                "Solar flare API error: " +
                flareResponse.status + " " +
                flareResponse.statusText
            );
        }

        // Check CME response
        if (cmeResponse.ok === false) {
            throw new Error(
                "CME API error: " +
                cmeResponse.status + " " +
                cmeResponse.statusText
            );
        }

        // Convert responses to JSON
        const flares = await flareResponse.json();
        const cmes = await cmeResponse.json();

        // Display Solar Flare events
        if (eventsBox) {

            eventsBox.replaceChildren();

            if (!Array.isArray(flares) || flares.length === 0) {

                eventsBox.textContent =
                    "No solar flare events reported in the last 7 days.";

            } else {

                flares.slice(0, 5).forEach(event => {

                    const p = document.createElement("p");

                    p.textContent =
                        "☀️ " +
                        (event.classType || "Solar flare") +
                        " — " +
                        (event.beginTime || "Date unavailable");

                    eventsBox.appendChild(p);
                });
            }
        }

        // Display Coronal Mass Ejection events
        if (cmeBox) {

            cmeBox.replaceChildren();

            if (!Array.isArray(cmes) || cmes.length === 0) {

                cmeBox.textContent =
                    "No coronal mass ejection events reported in the last 7 days.";

            } else {

                cmes.slice(0, 5).forEach(event => {

                    const p = document.createElement("p");

                    p.textContent =
                        "🌞 " +
                        (event.activityID || "CME event") +
                        " — " +
                        (event.startTime || "Date unavailable");

                    cmeBox.appendChild(p);
                });
            }
        }

        // Success message
        if (status) {
            status.textContent =
                "NASA space weather data updated successfully.";
        }

        console.log("NASA DONKI data loaded successfully.");

    } catch (error) {

        console.error("NASA data error:", error);

        if (status) {
            status.textContent =
                "NASA ERROR: " + error.message;
        }
    }
}

// NASA refresh button
$("nasa-refresh")?.addEventListener(
    "click",
    refreshNASAData
);


// ======================================
// NASA MARS EXPLORATION IMAGE INTEGRATION
// ======================================

async function loadMarsImages() {

    const status = document.getElementById("mars-status");
    const gallery = document.getElementById("mars-gallery");

    if (status) {
        status.textContent = "Loading real NASA Mars photographs...";
    }

    try {

        const url =
            "https://images-api.nasa.gov/search?q=Mars%20Perseverance%20rover&media_type=image&page_size=8";

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("NASA Images API error: " + response.status);
        }

        const data = await response.json();

        const items = data.collection.items || [];

        if (gallery) {
            gallery.replaceChildren();
        }

        let displayed = 0;

        items.forEach(item => {

            const details = item.data?.[0];
            const imageLink = item.links?.find(
                link => link.render === "image"
            );

            if (!details || !imageLink || !gallery) {
                return;
            }

            const card = document.createElement("article");
            card.className = "mars-card";

            const image = document.createElement("img");
            image.src = imageLink.href;
            image.alt = details.title || "NASA Mars photograph";
            image.loading = "lazy";

            const title = document.createElement("h4");
            title.textContent = details.title || "Mars photograph";

            const description = document.createElement("p");
            description.textContent =
                (details.description || "NASA Mars exploration image.")
                .slice(0, 180);

            const link = document.createElement("a");
            link.href = imageLink.href;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "View NASA image";

            card.appendChild(image);
            card.appendChild(title);
            card.appendChild(description);
            card.appendChild(link);

            gallery.appendChild(card);

            displayed++;
        });

        if (status) {
            status.textContent = displayed > 0
                ? displayed + " NASA Mars photographs loaded successfully."
                : "No Mars photographs were found. Please try again.";
        }

    } catch (error) {

        console.error("NASA Mars image error:", error);

        if (status) {
            status.textContent = "Mars image error: " + error.message;
        }
    }
}

// Mars image refresh button
document.getElementById("mars-refresh")
    ?.addEventListener("click", loadMarsImages);

// Automatically load Mars photographs
loadMarsImages();
