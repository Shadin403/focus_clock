# 🍅 Redmi Focus Clock - Advanced Pomodoro Timer

[![Made with Alpine.js](https://img.shields.io/badge/Made%20with-Alpine.js-yellow)](https://alpinejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styled%20with-Tailwind%20CSS-blue)](https://tailwindcss.com/)
[![JavaScript](https://img.shields.io/badge/Powered%20by-JavaScript-red)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

A sophisticated, feature-rich Pomodoro Technique timer built with modern web technologies. This application combines productivity science with beautiful design and advanced functionality to help you maintain focus and boost your productivity.

![Redmi Focus Clock Preview](https://via.placeholder.com/800x400/6366f1/ffffff?text=🍅+Redmi+Focus+Clock)

## ✨ Features

### 🎯 Core Functionality

- **25-minute Pomodoro sessions** with visual progress tracking
- **Smart break management** - 5-minute short breaks, 15-minute long breaks after 4 sessions
- **Session tracking** with detailed statistics and history
- **Task management** - Link tasks to focus sessions for better productivity

### 🔊 Advanced Sound System

**10 Unique Notification Sounds:**

1. **Chime** - Clear ascending tones (C, E, G, C)
2. **Bell** - Traditional bell with harmonics
3. **Digital** - Modern digital beep sequence
4. **Gentle** - Soft, soothing single tone
5. **Bright** - Cheerful ascending sequence
6. **Deep** - Resonant low-frequency sound
7. **Crystal** - Pure, clear harmonic sequence
8. **Warm** - Pleasant dual-tone harmony
9. **Sharp** - Attention-grabbing quick beeps
10. **Melodic** - Musical sequence with rhythm

### 🎨 Modern Design

- **Glass-morphism UI** with backdrop blur effects
- **Multiple themes** - Purple gradient, Blue ocean, Forest green, Pure dark
- **Redmi branding** with gradient logo and modern styling
- **Responsive design** that works on all devices
- **Smooth animations** and transitions

### 📊 Analytics & Tracking

- **Daily statistics** - Sessions, focus time, breaks taken
- **Weekly progress** visualization
- **Productivity metrics** and insights
- **Session history** with detailed timestamps
- **Export/Import** functionality for data backup

### ⚙️ Advanced Settings

- **Customizable durations** - Focus time, short break, long break
- **Sound preferences** - Enable/disable notifications, select sounds
- **Theme selection** - Multiple color schemes
- **Auto-start options** - Automatic session progression
- **Reduced motion** support for accessibility

## 🚀 Technology Stack

- **Frontend Framework:** Alpine.js 3.x (Reactive state management)
- **Styling:** Tailwind CSS (Utility-first CSS framework)
- **Audio:** Web Audio API (Custom sound generation)
- **Icons:** Heroicons (Beautiful hand-crafted SVG icons)
- **Storage:** LocalStorage (Client-side data persistence)
- **Notifications:** Web Notifications API (Desktop notifications)

## 📦 Installation

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (for development)

### Quick Start

1. **Clone or download** the project files
2. **Start a local server:**

   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js (if you have it installed)
   npx serve .

   # Using PHP
   php -S localhost:8000
   ```

3. **Open your browser** and navigate to `http://localhost:8000`

### Project Structure

```
redmi-focus-clock/
├── index.html          # Main application file
├── script.js           # Alpine.js application logic
└── README.md           # This file
```

## 🎮 Usage

### Basic Operation

1. **Click "Start"** to begin a 25-minute focus session
2. **Work focused** until the timer completes
3. **Take a break** when the session ends (5 minutes)
4. **Repeat** the cycle for maximum productivity

### Advanced Features

#### Task Management

- **Add tasks** using the input field in the sidebar
- **Select tasks** to link them to focus sessions
- **Track completion** with checkboxes
- **Delete tasks** when no longer needed

#### Sound Customization

- **Open Settings** (⚙️ button in header)
- **Select notification sound** from 10 unique options
- **Preview sounds** before saving
- **Enable/disable** sound notifications as needed

#### Statistics Tracking

- **View daily stats** in the Statistics modal (📊 button)
- **Monitor productivity** trends
- **Export data** for external analysis
- **Track session history** with timestamps

### Keyboard Shortcuts

- **Space** - Start/Pause timer
- **R** - Reset timer
- **Ctrl+S** - Open settings
- **Ctrl+T** - Open statistics

## 🎨 Customization

### Timer Durations

Customize session lengths in Settings:

- **Focus Time:** 15, 25, or 45 minutes (or custom)
- **Short Break:** 5 minutes (configurable)
- **Long Break:** 15 minutes (configurable)

### Themes

Choose from 4 beautiful themes:

- **Purple Gradient** - Default Redmi theme
- **Blue Ocean** - Calming blue tones
- **Forest Green** - Natural green palette
- **Pure Dark** - Minimal dark theme

### Sound Selection

Pick from 10 distinct notification sounds based on your preference and environment.

## 🔧 Development

### Code Architecture

- **Alpine.js Components** - Reactive data properties and methods
- **Computed Properties** - Dynamic calculations for UI updates
- **Event Listeners** - Keyboard shortcuts and user interactions
- **Local Storage** - Persistent settings and statistics

### Key Components

#### Timer Logic (`script.js`)

```javascript
// Reactive data properties
settings: {
  focusTime: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  soundEnabled: true,
  selectedSound: "chime",
  theme: "purple"
}

// Timer controls
start() { /* Start focus session */ }
pause() { /* Pause current session */ }
reset() { /* Reset to initial state */ }
```

#### Sound Generation

```javascript
// 10 unique sound methods
playChime(); // Ascending clear tones
playBell(); // Traditional bell sound
playDigital(); // Modern beep sequence
playGentle(); // Soft single tone
// ... and 6 more unique sounds
```

## 📱 Responsive Design

The application is fully responsive and works perfectly on:

- **Desktop computers** (1920x1080 and above)
- **Laptops** (1366x768, 1440x900)
- **Tablets** (768x1024, 1024x768)
- **Mobile phones** (375x667, 414x896)

## 🌟 Advanced Features

### Session Auto-Progression

- **Automatic break starts** after focus sessions complete
- **Configurable** in settings panel
- **Smart session counting** for long break timing

### Data Persistence

- **Settings saved** automatically to localStorage
- **Statistics tracked** across browser sessions
- **Tasks maintained** between uses
- **Export/Import** functionality for data portability

### Accessibility

- **Keyboard navigation** support
- **Screen reader friendly** structure
- **High contrast** color schemes available
- **Reduced motion** option for sensitive users

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues and enhancement requests.

### Development Setup

1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Pomodoro Technique** - Developed by Francesco Cirillo
- **Alpine.js** - Lightweight, reactive JavaScript framework
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful hand-crafted SVG icons

## 📞 Support

If you encounter any issues or have questions:

1. Check the browser console for error messages
2. Ensure your browser supports modern JavaScript features
3. Try refreshing the page or clearing browser data
4. Check that your audio system is working for sound features

---

**Built with ❤️ for productivity enthusiasts**

**Made by Shadin Sarkar - Full-Stack Developer**  
🌐 **Portfolio:** [https://dev-shadin.com](https://dev-shadin.com)  
📧 **Expertise:** Laravel & Vue.js Development
