# SG Weather Modernized

A modern web interface for Singapore's real-time weather data. This project reimagines the [NEA Mobile Weather site](https://www.weather.gov.sg/mobile) with a focus on high-end UI/UX, responsive design, and performance using the latest React ecosystem.

> **Development Note**: This minisite was developed as a hobbyist project. Its creation was largely built using **"vibe coding"** and was highly dependent on the **Gemini 3 Preview** model within **Google AI Studio Build mode** for logic generation and UI styling. As the creator is not an experienced programmer, this project serves as a showcase of how AI tools can bridge the gap between creative ideas and functional code.

## 🌟 Features

- **Real-time Nowcast**: Interactive map and grid views of 2-hour weather forecasts across Singapore's 47 weather areas.
- **Rain Radar**: High-resolution playback of rain areas (50km and 240km regional views) with an optimized dark-mode interface.
- **Flood Warnings**: Live alerts synchronized with PUB (Singapore's National Water Agency) including severity levels and instructions.
- **24-Hour Forecast**: Regional outlooks (North, South, East, West, Central) with temperature, humidity, and wind data.
- **4-Day Outlook**: Extended weather planning with high-fidelity icons and trend insights.
- **Fully Responsive**: Optimized for everything from mobile devices to high-resolution desktop monitors.
- **Automatic Sync**: Data refreshes automatically every 5 minutes from official sources.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [FontAwesome 6](https://fontawesome.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **API**: [Data.gov.sg APIs](https://data.gov.sg/)
- **AI-Assisted Development**: [Google Gemini 3 (AI Studio)](https://aistudio.google.com/)

## 📊 Data Sources & Credits

This application utilizes real-time data provided by the Singapore Government's Open Data portal.

- **Weather Data**: Provided by the [National Environment Agency (NEA)](https://www.nea.gov.sg/).
- **Flood Alerts**: Provided by [PUB, Singapore's National Water Agency](https://www.pub.gov.sg/).
- **Map Assets**: Based on official meteorological layouts provided by Meteorological Service Singapore (MSS).

*Note: This is a hobbyist, community-driven modernization project and is not an official application of the Singapore Government.*

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/alfred1137/sg-weather-modernized.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Deployment
This project is configured for easy deployment to GitHub Pages:
```bash
npm run deploy
```

## 📜 License
This project is open-source and available under the MIT License. Data used within the app is subject to the [Singapore Open Data Licence](https://data.gov.sg/open-data-licence).