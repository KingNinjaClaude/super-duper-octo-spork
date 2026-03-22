# Territorial Conquest - RTS Strategy Game

A sleek, modern browser-based real-time strategy game inspired by territory control games like OpenFront and Territorial.io.

## 🎮 Features

### Core Gameplay
- **Territory Control**: Dynamic 2D map with procedural generation
- **Multiple Terrain Types**: Plains, Mountains (defense boost, slow movement), Water (impassable), and High-value Cities
- **Unit Types**: Infantry (balanced), Tanks (slow but powerful), Scouts (fast but weak)
- **Army Management**: Send, split, and control multiple armies simultaneously
- **Combat System**: Army size-based combat with randomness for balance
- **Fog of War**: Exploration system for discovering new territories

### Economy & Progression
- **Territory-Based Income**: Passive resource generation scaling with upgrades
- **City Bonuses**: 1.5x income multiplier on high-value cities
- **Upgrade Paths**: Production (20% per level), Speed (10% per level), Strength scaling
- **Resource Management**: Dynamic caps encourage active gameplay

### AI & Multiplayer
- **AI Opponents**: 3 difficulty levels (Easy, Normal, Hard) with distinct strategies
- **Strategic AI**: Evaluates nearby enemies and launches calculated attacks
- **Multiplayer Ready**: WebSocket infrastructure for real-time multiplayer
- **Leaderboard System**: Scoring based on territories, troops, and wins

### User Experience
- **Modern UI**: Glass-morphism design with smooth animations
- **Real-time Mini-map**: Scaled overview of territories and armies
- **Intuitive Controls**: Click-select, drag-to-send armies, touch-friendly
- **Visual Effects**: Combat animations, territory transitions, smooth unit movement
- **Responsive Design**: Works seamlessly on desktop and tablets

## 🚀 Getting Started

### Installation
```bash
git clone https://github.com/KingNinjaClaude/super-duper-octo-spork.git
cd super-duper-octo-spork
npm install
```

### Development
```bash
npm start
```
The game will run at `http://localhost:8080`

### Production Build
```bash
npm run build
```

## 📁 Project Structure

```
src/
├── core/
│   └── GameEngine.ts       # Core game logic & state management
├── graphics/
│   └── Renderer.ts         # Pixi.js rendering engine
├── ui/
│   └── UI.ts              # HUD and UI management
├── input/
│   └── InputHandler.ts    # Mouse/touch input handling
├── types/
│   └── index.ts           # TypeScript type definitions
├── styles/
│   └── main.css          # Modern minimalist styling
└── index.ts              # Main game entry point
```

## 🎯 Game Mechanics

### Combat
- Combat is determined by army size with a 10-20% randomness factor
- Terrain and city bonuses provide defensive advantages (up to 30%)
- Victors sustain 20% casualties; defenders can be completely defeated
- Conquered territories change ownership immediately

### Units
| Type | Speed | Strength | Cost | Use |
|------|-------|----------|------|-----|
| Infantry | 1.0x | 1.0x | 10 | Balanced |
| Tank | 0.6x | 2.0x | 40 | Sieges |
| Scout | 1.8x | 0.5x | 5 | Reconnaissance |

### Resource Generation
- **Base**: 10 resources/tick per territory
- **City Bonus**: +50% income
- **Upgrade Bonus**: +20% per production level
- **Resource Cap**: Encourages continuous expansion

## 🎨 Visual Design

- **Color Palette**: Modern gradient accents (purple-blue)
- **UI**: Glass-morphism with backdrop blur effects
- **Animations**: GSAP-powered smooth transitions
- **Rendering**: GPU-accelerated with Pixi.js

## 🔧 Technology Stack

- **Frontend**: TypeScript, Pixi.js
- **Animation**: GSAP (GreenSock)
- **Build**: Webpack, Babel
- **Styling**: Modern CSS with glass-morphism
- **State Management**: Custom event-driven architecture

## 📝 Roadmap

- [ ] Multiplayer with WebSocket synchronization
- [ ] Procedural map generation improvements
- [ ] Power-up system (double production, shields, etc.)
- [ ] Replay system with state snapshots
- [ ] Sound effects and audio
- [ ] Customizable themes and skins
- [ ] Mobile app version
- [ ] Matchmaking and ranking system

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to submit pull requests or open issues for bug reports and feature requests.

---

**Made with ❤️ by KingNinjaClaude**