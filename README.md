# Modern Weather.sg

A modern web interface for Singapore's real-time weather data. This project reimagines the [NEA Mobile Weather site](https://www.weather.gov.sg/mobile) with a focus on high-end UI/UX, responsive design, and performance using the latest React ecosystem.

> **Development Note**: This minisite was developed as a hobbyist project. Its creation was largely built with **vibe coding** with **Gemini 3 Preview** model within **Google AI Studio Build mode** for logic generation and UI styling. As the creator is not an experienced programmer, this project serves as a showcase of how AI tools can bridge the gap between creative ideas and functional code.

**v0.7.2**

## 🌟 Features

- **2-Hour Nowcast**: Interactive map and grid views of 2-hour weather forecasts across Singapore's 47 weather areas.
- **Rain Radar**: High-resolution playback of rain areas (50km and 240km regional views) with an optimized dark-mode interface.
- **Flood Warnings**: Live alerts synchronized with PUB (Singapore's National Water Agency) including severity levels and instructions.
- **24-Hour Forecast**: Regional outlooks (North, South, East, West, Central) with temperature, humidity, and wind data.
- **4-Day Outlook**: Extended weather planning with high-fidelity icons and trend insights.
- **Fully Responsive**: Optimized for everything from mobile devices to high-resolution desktop monitors.
- **Progressive Web App (PWA)**: PWA support allowing installation on iOS and Android devices for a native-like experience, complete with offline asset caching.
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

## 🚀 Deployment

This project is set up with **GitHub Actions**.

1.  **Push the code**: Simply commit and push changes to the `main` branch.
2.  **Wait for the Magic**: Go to the **Actions** tab in the GitHub repository. "Deploy to GitHub Pages" workflow will run automatically to compile the site into `gh-pages` branch.
3.  **Check the Site**: Once it turns green, the site is updated!

### ⚠️ Critical First-Time Setup
If the Action is green but the site is a 404:
1. Go to the repo on GitHub.com.
2. Click **Settings** > **Pages**.
3. Under **Build and deployment > Source**, ensure it says "Deploy from a branch".
4. Under **Branch**, select `gh-pages` (this branch is created by the Action) and click **Save**.
5. Wait 1-2 minutes for GitHub to start serving the files.

## 📜 License
This project is open-source and available under the MIT License. Data used within the app is subject to the [Singapore Open Data Licence](https://data.gov.sg/open-data-licence).
