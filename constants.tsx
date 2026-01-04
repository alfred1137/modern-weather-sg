
import React from 'react';

// Simplified mapping from NEA descriptions to Icon types
export const WeatherIconMap: Record<string, React.ReactNode> = {
  'Sunny': <i className="fas fa-sun text-yellow-400 text-3xl drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]"></i>,
  'Fair': <i className="fas fa-sun text-yellow-300 text-3xl drop-shadow-[0_0_8px_rgba(253,224,71,0.4)]"></i>,
  'Partly Cloudy': <i className="fas fa-cloud-sun text-gray-300 text-3xl drop-shadow-[0_0_8px_rgba(209,213,219,0.3)]"></i>,
  'Cloudy': <i className="fas fa-cloud text-gray-400 text-3xl drop-shadow-[0_0_8px_rgba(156,163,175,0.3)]"></i>,
  'Hazy': <i className="fas fa-smog text-gray-500 text-3xl"></i>,
  'Light Rain': <i className="fas fa-cloud-rain text-blue-400 text-3xl drop-shadow-[0_0_8px_rgba(96,165,250,0.4)]"></i>,
  'Showers': <i className="fas fa-cloud-showers-heavy text-blue-500 text-3xl drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]"></i>,
  'Heavy Rain': <i className="fas fa-cloud-showers-water text-blue-600 text-3xl drop-shadow-[0_0_8px_rgba(37,99,235,0.4)]"></i>,
  'Thundery Showers': <i className="fas fa-cloud-bolt text-indigo-400 text-3xl drop-shadow-[0_0_12px_rgba(129,140,248,0.5)]"></i>,
  'default': <i className="fas fa-cloud text-gray-400 text-3xl"></i>
};

export const getWeatherIcon = (description: string, sizeClass: string = "text-3xl") => {
  const key = Object.keys(WeatherIconMap).find(k => description.toLowerCase().includes(k.toLowerCase()));
  const icon = key ? WeatherIconMap[key] : WeatherIconMap['default'];
  
  // If a custom size is needed, we'd wrap it, but for simplicity we use the default
  return icon;
};

// Normalized coordinates (0-100%) for Singapore Weather Areas
// Derived from NEA mobile map layout
export const AREA_COORDINATES: Record<string, { x: number, y: number }> = {
  'Ang Mo Kio':  { x: 49.77, y: 26.95},
  'Bedok':  { x: 65.52, y: 45.76},
  'Bishan':  { x: 49.77, y: 35.42},
  'Boon Lay':  { x: 24.255, y: 51.7},
  'Bukit Batok':  { x: 34.125, y: 34.65},
  'Bukit Merah':  { x: 46.095, y: 61.16},
  'Bukit Panjang':  { x: 37.38, y: 31.46},
  'Bukit Timah':  { x: 40.95, y: 44.33},
  'Central Water Catchment':  { x: 43.47, y: 25.19},
  'Changi':  { x: 77.175, y: 33.22},
  'Choa Chu Kang':  { x: 32.445, y: 26.18},
  'City':  { x: 50.715, y: 55.88},
  'Clementi':  { x: 35.175, y: 47.85},
  'Geylang':  { x: 58.17, y: 46.86},
  'Hougang':  { x: 58.485, y: 31.68},
  'Jalan Bahar':  { x: 18.48, y: 36.74},
  'Jurong East':  { x: 30.975, y: 44},
  'Jurong Island':  { x: 23.94, y: 65.01},
  'Jurong West':  { x: 24.99, y: 39.05},
  'Kallang':  { x: 54.075, y: 48.95},
  'Lim Chu Kang':  { x: 27.3, y: 10.12},
  'Mandai':  { x: 44.835, y: 11.55},
  'Marine Parade':  { x: 59.43, y: 54.12},
  'Novena':  { x: 47.355, y: 43.67},
  'Pasir Ris':  { x: 70.035, y: 28.71},
  'Paya Lebar':  { x: 63.735, y: 32.89},
  'Pioneer':  { x: 19.425, y: 47.85},
  'Pulau Tekong':  { x: 89.46, y: 17.16},
  'Pulau Ubin':  { x: 72.24, y: 16.83},
  'Punggol':  { x: 61.845, y: 17.82},
  'Queenstown':  { x: 40.005, y: 56.21},
  'Seletar':  { x: 55.335, y: 16.83},
  'Sembawang':  { x: 45.99, y: 2.53},
  'Sengkang':  { x: 59.535, y: 23.76},
  'Sentosa':  { x: 48.51, y: 73.04},
  'Serangoon':  { x: 54.6, y: 33.22},
  'Southern Islands':  { x: 50.4, y: 85.25},
  'Sungei Kadut':  { x: 34.44, y: 13.64},
  'Tampines':  { x: 69.3, y: 37.4},
  'Tanglin':  { x: 45.045, y: 50.27},
  'Tengah':  { x: 26.88, y: 27.28},
  'Toa Payoh':  { x: 53.025, y: 41.14},
  'Tuas':  { x: 12.075, y: 54.89},
  'Western Islands':  { x: 32.55, y: 85.91},
  'Western Water Catchment':  { x: 22.05, y: 16.5},
  'Woodlands':  { x: 40.11, y: 7.04},
  'Yishun':  { x: 49.77, y: 11.88}
};

export const SG_REGIONS = [
  { id: 'north', name: 'North', x: '50%', y: '20%' },
  { id: 'south', name: 'South', x: '50%', y: '80%' },
  { id: 'east', name: 'East', x: '82%', y: '50%' },
  { id: 'west', name: 'West', x: '18%', y: '50%' },
  { id: 'central', name: 'Central', x: '50%', y: '50%' }
];
