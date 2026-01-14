<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
<br />
[![React][react-shield]][react-url]
[![Tailwind][tailwind-shield]][tailwind-url]
[![Vite][vite-shield]][vite-url]
[![TypeScript][typescript-shield]][typescript-url]
[![FontAwesome][fontawesome-shield]][fontawesome-url]
[![Gemini][gemini-shield]][gemini-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/alfred1137/modern-weather-sg">
    <img src="public/icon.svg" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Modern Weather.sg</h3>

  <p align="center">
    A modern UI/UX reimagining of Singapore's real-time weather data.
    <br />
    <a href="https://alfred1137.github.io/modern-weather-sg/"><strong>Try the Demo »</strong></a>
    <br />
    <img src="https://img.shields.io/badge/version-v0.9.1-blue" alt="Version">
    <br />
    <br />
    <a href="https://github.com/alfred1137/modern-weather-sg/issues">Report Bug</a>
    &middot;
    <a href="https://github.com/alfred1137/modern-weather-sg/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#overview">📖 Overview</a></li>
    <li><a href="#features">✨ Features</a></li>
    <li><a href="#technologies">📦 Technologies</a></li>
    <li>
      <a href="#getting-started">🚀 Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#repository-structure">🗂️ Repository Structure</a></li>
    <li><a href="#deployment">🚢 Deployment</a></li>
    <li><a href="#contributing">🤝 Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">❤️ Acknowledgments</a></li>
  </ol>
</details>

<!-- OVERVIEW -->
<a id="overview"></a>
## 📖 Overview

Modern Weather.sg is a modern web interface for Singapore's real-time weather data. This project reimagines the [NEA Mobile Weather site](https://www.weather.gov.sg/mobile) with a focus on high-end UI/UX, responsive design, and performance using the latest React ecosystem.

> [!NOTE]
> **Development Note**
> This minisite was developed as a hobbyist project. Its creation was largely built with **vibe coding** using **Gemini 3 Preview** in **Google AI Studio** for logic generation and implementation of my design directions UI styling. It can serve as a showcase of how AI tools can bridge the gap between creative ideas and functional code.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FEATURES -->
<a id="features"></a>
## ✨ Features

*   **2-Hour Nowcast**: Interactive map and grid views of 2-hour weather forecasts across Singapore's 47 weather areas.
*   **Rain Radar**: High-resolution playback of rain areas (50km and 240km regional views) with an optimized dark-mode interface.
*   **Flood Warnings**: Live alerts synchronized with PUB (Singapore's National Water Agency) including severity levels and instructions.
*   **24-Hour Forecast**: Regional outlooks (North, South, East, West, Central) with temperature, humidity, and wind data.
*   **4-Day Outlook**: Extended weather planning with high-fidelity icons and trend insights.
*   **Fully Responsive**: Optimized for everything from mobile devices to high-resolution desktop monitors.
*   **Progressive Web App (PWA)**: Installable on iOS and Android for a native-like experience with offline asset caching.
*   **Automatic Sync**: Data refreshes automatically every 5 minutes from official sources.


<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- TECHNOLOGIES -->
<a id="technologies"></a>
## 📦 Technologies

*   **Framework**: [React 19](https://react.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (via CDN with Catppuccin theme)
*   **Build Tool**: [Vite 6](https://vitejs.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Icons**: [FontAwesome 6](https://fontawesome.com/)
*   **API**: [Data.gov.sg APIs](https://data.gov.sg/) (NEA & PUB)
*   **AI-Assisted Development**: [Google Gemini 3 (AI Studio)](https://aistudio.google.com/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
<a id="getting-started"></a>
## 🚀 Getting Started

The easiest way to start using this modern weather app is to use the demo version hosted as github page [here](https://alfred1137.github.io/modern-weather-sg/).

On mobile, you can install it as PWA by going to your browser menu (three dots), and then tap on `Add to Home Screen`. Follow on screen instructions to install.

### Hosting Your Own Copy

To get a local copy up and running, follow these steps.

<a id="prerequisites"></a>
### Prerequisites

*   npm
    ```sh
    npm install npm@latest -g
    ```

<a id="installation"></a>
### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/alfred1137/modern-weather-sg.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Start the development server
    ```sh
    npm run dev
    ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- REPOSITORY STRUCTURE -->
<a id="repository-structure"></a>
## 🗂️ Repository Structure

```
.
├── components/           # UI components for different views (Nowcast, Radar, etc.)
├── context/              # Context providers (ThemeContext)
├── services/             # API service layers (weatherService)
├── public/               # Static assets, manifest, and service worker
├── App.tsx               # Main application container
├── index.tsx             # Entry point
├── types.ts              # TypeScript interfaces
└── README.md             # This documentation
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- DEPLOYMENT -->
<a id="deployment"></a>
## 🚢 Deployment

This project is set up with **GitHub Actions** for automatic deployment to GitHub Pages.

1.  **Push to main**: Simply commit and push changes to the `main` branch.
2.  **GitHub Actions**: The "Deploy to GitHub Pages" workflow will run automatically.
3.  **Check Settings**: Ensure **Settings > Pages** is set to "Deploy from a branch" using the `gh-pages` branch.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
<a id="contributing"></a>
## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
<a id="license"></a>
## License

Distributed under the MIT License. See `LICENSE` for more information. Data used within the app is subject to the [Singapore Open Data Licence](https://data.gov.sg/open-data-licence).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
<a id="contact"></a>
## Contact

Alfred TANG - [GitHub](https://github.com/alfred1137)

Project Link: [https://github.com/alfred1137/modern-weather-sg](https://github.com/alfred1137/modern-weather-sg)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->
<a id="acknowledgments"></a>
## ❤️ Acknowledgments

*   [National Environment Agency (NEA)](https://www.nea.gov.sg/)
*   [PUB, Singapore's National Water Agency](https://www.pub.gov.sg/)
*   [Meteorological Service Singapore (MSS)](http://www.weather.gov.sg/)
*   [Data.gov.sg](https://data.gov.sg/)
*   [Catppuccin Theme](https://github.com/catppuccin/catppuccin)
*   [Font Awesome](https://fontawesome.com)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/alfred1137/modern-weather-sg.svg?style=for-the-badge
[contributors-url]: https://github.com/alfred1137/modern-weather-sg/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/alfred1137/modern-weather-sg.svg?style=for-the-badge
[forks-url]: https://github.com/alfred1137/modern-weather-sg/network/members
[stars-shield]: https://img.shields.io/github/stars/alfred1137/modern-weather-sg.svg?style=for-the-badge
[stars-url]: https://github.com/alfred1137/modern-weather-sg/stargazers
[issues-shield]: https://img.shields.io/github/issues/alfred1137/modern-weather-sg.svg?style=for-the-badge
[issues-url]: https://github.com/alfred1137/modern-weather-sg/issues
[license-shield]: https://img.shields.io/github/license/alfred1137/modern-weather-sg.svg?style=for-the-badge
[license-url]: https://github.com/alfred1137/modern-weather-sg/blob/main/LICENSE
[react-shield]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[react-url]: https://reactjs.org/
[tailwind-shield]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[tailwind-url]: https://tailwindcss.com/
[vite-shield]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[vite-url]: https://vitejs.dev/
[typescript-shield]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[typescript-url]: https://www.typescriptlang.org/
[fontawesome-shield]: https://img.shields.io/badge/Font_Awesome-339AF0?style=for-the-badge&logo=fontawesome&logoColor=white
[fontawesome-url]: https://fontawesome.com/
[gemini-shield]: https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white
[gemini-url]: https://aistudio.google.com/