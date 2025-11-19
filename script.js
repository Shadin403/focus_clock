// Alpine.js Pomodoro Timer Application
document.addEventListener("alpine:init", () => {
  Alpine.data("pomodoroTimer", () => ({
    // Timer settings (in seconds)
    settings: {
      focusTime: 25 * 60,
      shortBreak: 5 * 60,
      longBreak: 15 * 60,
      soundEnabled: true,
      desktopNotifications: false,
      autoStartBreaks: true,
      theme: "purple",
      reducedMotion: false,
      selectedSound: "chime",
    },

    // Timer state
    currentTime: 25 * 60,
    isRunning: false,
    isPaused: false,
    interval: null,
    lastUpdate: Date.now(), // Track last update time for accurate timing
    tabHiddenTime: null, // Track when tab was hidden for accurate timing

    // Session tracking
    sessionCount: 1,
    completedSessions: 0,
    currentMode: "focus", // 'focus', 'shortBreak', 'longBreak'
    currentTask: null,

    // Statistics
    statistics: {
      today: {
        sessions: 0,
        focusTime: 0,
        breaks: 0,
        date: new Date().toDateString(),
      },
      weekly: { sessions: 0, focusTime: 0, breaks: 0 },
      history: [],
    },

    // Tasks
    tasks: [],
    newTaskText: "",

    // UI state
    showSettingsModal: false,
    showStatsModal: false,

    // Motivational quotes
    quotes: [
      {
        text: "The journey of a thousand miles begins with a single step.",
        author: "Lao Tzu",
      },
      {
        text: "Focus on being productive instead of busy.",
        author: "Tim Ferriss",
      },
      {
        text: "Productivity is never an accident. It is always the result of a commitment to excellence.",
        author: "Paul J. Meyer",
      },
      {
        text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
        author: "Stephen Covey",
      },
      {
        text: "You don't need to see the whole staircase, just take the first step.",
        author: "Martin Luther King Jr.",
      },
    ],

    // Initialize the application
    init() {
      this.loadSettings();
      this.loadStatistics();
      this.loadTasks();
      this.updateTheme();
      this.updateMotivationalQuote();
      this.requestNotificationPermission();
      this.$watch("settings", () => this.saveSettings(), { deep: true });

      // Initialize lastUpdate for accurate time tracking
      this.lastUpdate = Date.now();

      // Handle page visibility changes for accurate timing
      this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
      document.addEventListener(
        "visibilitychange",
        this.handleVisibilityChange
      );
    },

    // Timer Controls
    start() {
      if (this.isPaused) {
        this.isPaused = false;
        this.isRunning = true;
        this.lastUpdate = Date.now();
      } else if (!this.isRunning) {
        this.isRunning = true;
        this.lastUpdate = Date.now();
        this.startSession();
      }

      this.updateButtons();
      this.runTimer();
    },

    pause() {
      this.isPaused = true;
      this.isRunning = false;
      this.updateButtons();

      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    },

    reset() {
      this.isRunning = false;
      this.isPaused = false;
      this.currentTime = this.settings.focusTime;
      this.sessionCount = 1;
      this.currentMode = "focus";
      this.currentTask = null;

      this.updateButtons();
      this.updateDisplay();
      this.updateProgress();
      this.updateModeDisplay();
      this.updateCurrentTask();

      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    },

    runTimer() {
      if (this.interval) {
        clearInterval(this.interval);
      }

      this.lastUpdate = Date.now();

      this.interval = setInterval(() => {
        // Calculate actual elapsed time to handle tab switching
        const now = Date.now();
        const elapsed = Math.floor((now - this.lastUpdate) / 1000);

        if (elapsed > 0) {
          // Adjust currentTime based on actual elapsed time
          if (this.currentTime >= elapsed) {
            this.currentTime -= elapsed;
            this.lastUpdate = now;
            this.updateDisplay();
            this.updateProgress();
          } else {
            // Timer has completed
            this.currentTime = 0;
            this.lastUpdate = now;
            this.updateDisplay();
            this.updateProgress();
            this.handleTimerComplete();
            return;
          }
        }

        // Regular 1-second update for display consistency
        if (this.currentTime > 0) {
          this.updateDisplay();
          this.updateProgress();
        } else {
          this.handleTimerComplete();
        }
      }, 100);
    },

    handleTimerComplete() {
      this.isRunning = false;
      this.updateButtons();

      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }

      // Record session
      this.recordSession();

      // Notifications
      if (this.settings.soundEnabled) {
        this.playNotification();
      }
      if (this.settings.desktopNotifications) {
        this.showDesktopNotification();
      }

      if (this.currentMode === "focus") {
        this.handleFocusComplete();
      } else {
        this.handleBreakComplete();
      }
    },

    handleFocusComplete() {
      if (this.sessionCount % 4 === 0) {
        this.currentMode = "longBreak";
        this.currentTime = this.settings.longBreak;
      } else {
        this.currentMode = "shortBreak";
        this.currentTime = this.settings.shortBreak;
      }

      this.updateModeDisplay();
      this.updateDisplay();
      this.updateProgress();

      if (this.settings.autoStartBreaks) {
        setTimeout(() => {
          if (!this.isRunning && !this.isPaused) {
            this.start();
          }
        }, 1000);
      }
    },

    handleBreakComplete() {
      this.sessionCount++;
      this.currentMode = "focus";
      this.currentTime = this.settings.focusTime;

      this.updateModeDisplay();
      this.updateDisplay();
      this.updateProgress();

      if (this.settings.autoStartBreaks) {
        setTimeout(() => {
          if (!this.isRunning && !this.isPaused) {
            this.start();
          }
        }, 1000);
      }
    },

    startSession() {
      // Check if there's a selected task
      const selectedTask = this.tasks.find((task) => task.selected);
      if (selectedTask) {
        this.currentTask = selectedTask.id;
        this.updateCurrentTask();
      }
    },

    recordSession() {
      const session = {
        mode: this.currentMode,
        duration:
          this.currentMode === "focus"
            ? this.settings.focusTime - this.currentTime
            : this.currentMode === "shortBreak"
            ? this.settings.shortBreak
            : this.settings.longBreak,
        timestamp: new Date().toISOString(),
        taskId: this.currentTask,
      };

      this.statistics.history.unshift(session);

      // Update daily stats
      if (this.currentMode === "focus") {
        this.statistics.today.sessions++;
        this.statistics.today.focusTime += Math.floor(session.duration / 60);
        this.statistics.weekly.sessions++;
        this.statistics.weekly.focusTime += Math.floor(session.duration / 60);
      } else {
        this.statistics.today.breaks++;
        this.statistics.weekly.breaks++;
      }

      this.saveStatistics();
      this.updateStatisticsDisplay();
    },

    // Display Updates
    updateDisplay() {
      const minutes = Math.floor(this.currentTime / 60);
      const seconds = this.currentTime % 60;
      this.timerDisplay = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
      this.timerLabel =
        this.currentTime === 1 ? "second remaining" : "remaining";
      this.sessionCountDisplay = this.sessionCount;
      this.completedCountDisplay = this.statistics.today.sessions;
    },

    updateProgress() {
      const totalTime =
        this.currentMode === "focus"
          ? this.settings.focusTime
          : this.currentMode === "shortBreak"
          ? this.settings.shortBreak
          : this.settings.longBreak;

      const circumference = 283;
      this.progressOffset =
        circumference - (this.currentTime / totalTime) * circumference;
    },

    updateModeDisplay() {
      this.modeClasses = {
        "bg-green-400": this.currentMode === "focus",
        "bg-yellow-400": this.currentMode === "shortBreak",
        "bg-red-400": this.currentMode === "longBreak",
      };
      this.modeText =
        this.currentMode === "focus"
          ? "Focus Time"
          : this.currentMode === "shortBreak"
          ? "Short Break"
          : "Long Break";
    },

    updateButtons() {
      this.showStart = !this.isRunning;
      this.showPause = this.isRunning;
    },

    updateCurrentTask() {
      this.currentTaskText = this.currentTask
        ? this.tasks.find((t) => t.id === this.currentTask)?.text
        : "";
      this.showCurrentTask = !!this.currentTask;
    },

    updateMotivationalQuote() {
      const randomQuote =
        this.quotes[Math.floor(Math.random() * this.quotes.length)];
      this.currentQuote = randomQuote;
    },

    updateTheme() {
      const themeClasses = {
        purple: "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900",
        blue: "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900",
        green: "bg-gradient-to-br from-slate-900 via-green-900 to-slate-900",
        dark: "bg-slate-900",
      };

      this.themeClass = themeClasses[this.settings.theme];
    },

    // Timer Settings
    setFocusTime(minutes) {
      this.settings.focusTime = minutes * 60;
      if (this.currentMode === "focus") {
        this.currentTime = this.settings.focusTime;
        this.updateDisplay();
        this.updateProgress();
      }
      this.saveSettings();

      // Update button states
      this.timerButtons = this.timerButtons.map((btn) => ({
        ...btn,
        active: btn.minutes === minutes,
      }));
    },

    // Task Management
    addTask() {
      if (!this.newTaskText.trim()) return;

      const task = {
        id: Date.now().toString(),
        text: this.newTaskText.trim(),
        completed: false,
        created: new Date().toISOString(),
        selected: false,
      };

      this.tasks.unshift(task);
      this.newTaskText = "";
      this.saveTasks();
      this.updateTaskStats();
    },

    toggleTask(task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.updateTaskStats();
    },

    selectTask(task) {
      this.tasks.forEach((t) => (t.selected = false));
      task.selected = true;
      this.currentTask = task.id;
      this.updateCurrentTask();
    },

    deleteTask(taskId) {
      this.tasks = this.tasks.filter((task) => task.id !== taskId);
      if (this.currentTask === taskId) {
        this.currentTask = null;
        this.updateCurrentTask();
      }
      this.saveTasks();
      this.updateTaskStats();
    },

    updateTaskStats() {
      this.totalTasks = this.tasks.length;
      this.completedTasks = this.tasks.filter((task) => task.completed).length;
    },

    // Modal Management
    openModal(modalType) {
      if (modalType === "settings") {
        this.showSettingsModal = true;
      } else if (modalType === "stats") {
        this.showStatsModal = true;
      }
      this.modalOpen = true;
    },

    closeModal(modalType) {
      if (modalType === "settings") {
        this.showSettingsModal = false;
      } else if (modalType === "stats") {
        this.showStatsModal = false;
      }
      this.modalOpen = false;
    },

    // Settings Management
    loadSettings() {
      const saved = localStorage.getItem("pomodoro-settings");
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    },

    saveSettings() {
      localStorage.setItem("pomodoro-settings", JSON.stringify(this.settings));
      this.updateTheme();
    },

    toggleTheme() {
      const themes = ["purple", "blue", "green", "dark"];
      const currentIndex = themes.indexOf(this.settings.theme);
      this.settings.theme = themes[(currentIndex + 1) % themes.length];
      this.updateTheme();
    },

    // Statistics Management
    loadStatistics() {
      const saved = localStorage.getItem("pomodoro-statistics");
      if (saved) {
        this.statistics = { ...this.statistics, ...JSON.parse(saved) };
      }

      // Reset daily stats if it's a new day
      const today = new Date().toDateString();
      if (this.statistics.today.date !== today) {
        this.statistics.today = {
          sessions: 0,
          focusTime: 0,
          breaks: 0,
          date: today,
        };
      }

      this.updateStatisticsDisplay();
    },

    saveStatistics() {
      localStorage.setItem(
        "pomodoro-statistics",
        JSON.stringify(this.statistics)
      );
    },

    updateStatisticsDisplay() {
      this.todaySessions = this.statistics.today.sessions;
      this.todayFocusTime = `${Math.floor(
        this.statistics.today.focusTime / 60
      )}h ${this.statistics.today.focusTime % 60}m`;
      this.todayBreaks = this.statistics.today.breaks;
      this.todayProductivity =
        this.statistics.today.sessions > 0
          ? Math.min(
              100,
              Math.round(
                (this.statistics.today.focusTime /
                  (this.statistics.today.sessions * 25)) *
                  100
              )
            ) + "%"
          : "0%";

      this.updateRecentSessions();
    },

    updateRecentSessions() {
      this.recentSessions = this.statistics.history
        .slice(0, 10)
        .map((session) => {
          const date = new Date(session.timestamp);
          const time = date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          const duration = Math.floor(session.duration / 60);
          const mode =
            session.mode === "focus"
              ? "🍅"
              : session.mode === "shortBreak"
              ? "☕"
              : "🏖️";

          return { mode, duration, time };
        });
    },

    // Task Persistence
    loadTasks() {
      const saved = localStorage.getItem("pomodoro-tasks");
      if (saved) {
        this.tasks = JSON.parse(saved);
      }
      this.updateTaskStats();
    },

    saveTasks() {
      localStorage.setItem("pomodoro-tasks", JSON.stringify(this.tasks));
    },

    // Notifications
    requestNotificationPermission() {
      if ("Notification" in window && this.settings.desktopNotifications) {
        Notification.requestPermission();
      }
    },

    showDesktopNotification() {
      if ("Notification" in window && Notification.permission === "granted") {
        const title =
          this.currentMode === "focus"
            ? "Focus session complete!"
            : "Break time is over!";
        const body =
          this.currentMode === "focus"
            ? "Great job! Time for a break."
            : "Ready for another focus session?";
        new Notification(title, { body, icon: "/favicon.ico" });
      }
    },

    // Sound Generation Methods
    playSound(soundType = this.settings.selectedSound) {
      try {
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();

        switch (soundType) {
          case "chime":
            this.playChime(audioContext);
            break;
          case "bell":
            this.playBell(audioContext);
            break;
          case "digital":
            this.playDigital(audioContext);
            break;
          case "gentle":
            this.playGentle(audioContext);
            break;
          case "bright":
            this.playBright(audioContext);
            break;
          case "deep":
            this.playDeep(audioContext);
            break;
          case "crystal":
            this.playCrystal(audioContext);
            break;
          case "warm":
            this.playWarm(audioContext);
            break;
          case "sharp":
            this.playSharp(audioContext);
            break;
          case "melodic":
            this.playMelodic(audioContext);
            break;
          default:
            this.playChime(audioContext);
        }
      } catch (error) {
        console.log("Could not play notification sound:", error);
      }
    },

    previewSound() {
      this.playSound();
    },

    playChime(audioContext) {
      // Clear ascending chime
      const frequencies = [523, 659, 784, 1047]; // C, E, G, C
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.value = freq;
          oscillator.type = "sine";

          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.3
          );

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
        }, index * 100);
      });
    },

    playBell(audioContext) {
      // Traditional bell sound
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator1.frequency.value = 800;
      oscillator2.frequency.value = 1200;
      oscillator1.type = oscillator2.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.8
      );

      oscillator1.start(audioContext.currentTime);
      oscillator2.start(audioContext.currentTime);
      oscillator1.stop(audioContext.currentTime + 0.8);
      oscillator2.stop(audioContext.currentTime + 0.8);
    },

    playDigital(audioContext) {
      // Modern digital beep
      const frequencies = [800, 1000, 800];
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.value = freq;
          oscillator.type = "square";

          gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.15
          );

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.15);
        }, index * 80);
      });
    },

    playGentle(audioContext) {
      // Soft, gentle tone
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 528; // C5
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 1.0
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1.0);
    },

    playBright(audioContext) {
      // Bright, cheerful sound
      const frequencies = [1047, 1319, 1568]; // C6, E6, G6
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.value = freq;
          oscillator.type = "triangle";

          gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.2
          );

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.2);
        }, index * 50);
      });
    },

    playDeep(audioContext) {
      // Deep, resonant sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 220; // A3
      oscillator.type = "sawtooth";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.6
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.6);
    },

    playCrystal(audioContext) {
      // Crystal clear, pure tone
      const frequencies = [440, 554, 659, 440]; // A4, C#5, E5, A4
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.value = freq;
          oscillator.type = "sine";

          gainNode.gain.setValueAtTime(0.18, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.25
          );

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.25);
        }, index * 60);
      });
    },

    playWarm(audioContext) {
      // Warm, pleasant sound
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator1.frequency.value = 330; // E4
      oscillator2.frequency.value = 415; // G#4
      oscillator1.type = oscillator2.type = "sine";

      gainNode.gain.setValueAtTime(0.22, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.7
      );

      oscillator1.start(audioContext.currentTime);
      oscillator2.start(audioContext.currentTime);
      oscillator1.stop(audioContext.currentTime + 0.7);
      oscillator2.stop(audioContext.currentTime + 0.7);
    },

    playSharp(audioContext) {
      // Sharp, attention-grabbing sound
      const frequencies = [1200, 800, 1200];
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.value = freq;
          oscillator.type = "square";

          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.1
          );

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.1);
        }, index * 40);
      });
    },

    playMelodic(audioContext) {
      // Melodic sequence
      const melody = [
        { freq: 523, duration: 0.2 }, // C5
        { freq: 659, duration: 0.2 }, // E5
        { freq: 784, duration: 0.2 }, // G5
        { freq: 1047, duration: 0.4 }, // C6
      ];

      melody.forEach((note, index) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.value = note.freq;
          oscillator.type = "sine";

          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + note.duration
          );

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + note.duration);
        }, index * 220);
      });
    },

    playNotification() {
      this.playSound();
    },

    // Data Management
    exportData() {
      const data = {
        settings: this.settings,
        statistics: this.statistics,
        tasks: this.tasks,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pomodoro-data-${
        new Date().toISOString().split("T")[0]
      }.json`;
      a.click();
      URL.revokeObjectURL(url);
    },

    importData() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);
            if (confirm("This will overwrite your current data. Continue?")) {
              this.settings = { ...this.settings, ...data.settings };
              this.statistics = { ...this.statistics, ...data.statistics };
              if (data.tasks) {
                this.tasks = data.tasks;
              }
              this.saveSettings();
              this.saveStatistics();
              this.saveTasks();
              location.reload();
            }
          } catch (error) {
            alert("Invalid file format");
          }
        };
        reader.readAsText(file);
      };
      input.click();
    },

    clearData() {
      if (
        confirm(
          "This will delete all your data including statistics and tasks. This cannot be undone!"
        )
      ) {
        localStorage.removeItem("pomodoro-settings");
        localStorage.removeItem("pomodoro-statistics");
        localStorage.removeItem("pomodoro-tasks");
        location.reload();
      }
    },

    // Keyboard shortcuts
    handleKeyboard(e) {
      switch (e.code) {
        case "Space":
          e.preventDefault();
          if (this.isRunning) {
            this.pause();
          } else {
            this.start();
          }
          break;
        case "KeyR":
          e.preventDefault();
          this.reset();
          break;
        case "KeyS":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.openModal("settings");
          }
          break;
        case "KeyT":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.openModal("stats");
          }
          break;
      }
    },

    // Computed properties for Alpine.js
    get timerDisplay() {
      const minutes = Math.floor(this.currentTime / 60);
      const seconds = this.currentTime % 60;
      return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    },

    get timerLabel() {
      return this.currentTime === 1 ? "second remaining" : "remaining";
    },

    get sessionCountDisplay() {
      return this.sessionCount;
    },

    get completedCountDisplay() {
      return this.statistics.today.sessions;
    },

    get progressOffset() {
      const totalTime =
        this.currentMode === "focus"
          ? this.settings.focusTime
          : this.currentMode === "shortBreak"
          ? this.settings.shortBreak
          : this.settings.longBreak;
      const circumference = 283;
      return circumference - (this.currentTime / totalTime) * circumference;
    },

    get modeClasses() {
      return {
        "bg-green-400": this.currentMode === "focus",
        "bg-yellow-400": this.currentMode === "shortBreak",
        "bg-red-400": this.currentMode === "longBreak",
      };
    },

    get modeText() {
      return this.currentMode === "focus"
        ? "Focus Time"
        : this.currentMode === "shortBreak"
        ? "Short Break"
        : "Long Break";
    },

    get showStart() {
      return !this.isRunning;
    },

    get showPause() {
      return this.isRunning;
    },

    get currentTaskText() {
      return this.currentTask
        ? this.tasks.find((t) => t.id === this.currentTask)?.text
        : "";
    },

    get showCurrentTask() {
      return !!this.currentTask;
    },

    get currentQuote() {
      return this.quotes[Math.floor(Math.random() * this.quotes.length)];
    },

    get themeClass() {
      const themeClasses = {
        purple: "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900",
        blue: "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900",
        green: "bg-gradient-to-br from-slate-900 via-green-900 to-slate-900",
        dark: "bg-slate-900",
      };
      return themeClasses[this.settings.theme];
    },

    get timerButtons() {
      return [
        { minutes: 15, active: this.settings.focusTime === 15 * 60 },
        { minutes: 25, active: this.settings.focusTime === 25 * 60 },
        { minutes: 45, active: this.settings.focusTime === 45 * 60 },
      ];
    },

    get todaySessions() {
      return this.statistics.today.sessions;
    },

    get todayFocusTime() {
      return `${Math.floor(this.statistics.today.focusTime / 60)}h ${
        this.statistics.today.focusTime % 60
      }m`;
    },

    get todayBreaks() {
      return this.statistics.today.breaks;
    },

    get todayProductivity() {
      return this.statistics.today.sessions > 0
        ? Math.min(
            100,
            Math.round(
              (this.statistics.today.focusTime /
                (this.statistics.today.sessions * 25)) *
                100
            )
          ) + "%"
        : "0%";
    },

    get recentSessions() {
      return this.statistics.history.slice(0, 10).map((session) => {
        const date = new Date(session.timestamp);
        const time = date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        const duration = Math.floor(session.duration / 60);
        const mode =
          session.mode === "focus"
            ? "🍅"
            : session.mode === "shortBreak"
            ? "☕"
            : "🏖️";
        return { mode, duration, time };
      });
    },

    get totalTasks() {
      return this.tasks.length;
    },

    get completedTasks() {
      return this.tasks.filter((task) => task.completed).length;
    },

    get modalOpen() {
      return this.showSettingsModal || this.showStatsModal;
    },

    // Handle page visibility changes to maintain accurate timing
    handleVisibilityChange() {
      if (document.hidden) {
        // Tab is hidden, store the time
        if (this.isRunning && !this.isPaused) {
          // Store the time when tab became hidden
          this.tabHiddenTime = Date.now();
        }
      } else {
        // Tab is visible again, adjust timer if needed
        if (this.isRunning && !this.isPaused && this.tabHiddenTime) {
          // Calculate elapsed time while tab was hidden
          const hiddenDuration = Date.now() - this.tabHiddenTime;
          const elapsedSeconds = Math.floor(hiddenDuration / 1000);

          // Adjust currentTime based on hidden duration
          if (elapsedSeconds > 0 && this.currentTime >= elapsedSeconds) {
            this.currentTime -= elapsedSeconds;
          } else if (elapsedSeconds > 0 && this.currentTime < elapsedSeconds) {
            // Timer should have completed while tab was hidden
            this.currentTime = 0;
            this.lastUpdate = Date.now();
            this.updateDisplay();
            this.updateProgress();
            this.handleTimerComplete();
            this.tabHiddenTime = null;
            return;
          }

          this.lastUpdate = Date.now();
          this.updateDisplay();
          this.updateProgress();

          // Clear the hidden time
          this.tabHiddenTime = null;
        }
      }
    },

    // Add cleanup for event listeners
    destroy() {
      if (this.interval) {
        clearInterval(this.interval);
      }
      document.removeEventListener(
        "visibilitychange",
        this.handleVisibilityChange
      );
    },
  }));
});

// Add keyboard event listener after Alpine is loaded
document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("keydown", (e) => {
    // This will be handled by Alpine.js x-on:keydown
  });
});
