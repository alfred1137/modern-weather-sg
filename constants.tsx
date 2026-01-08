import React from 'react';

// Enhanced mapping for all NEA forecast values
// Using FontAwesome 6 classes and Tailwind for a premium feel
// Updated to Catppuccin Macchiato Palette
export const WeatherIconMap: Record<string, React.ReactNode> = {
  // Fair & Sunny
  'Fair (Day)': <i className="fas fa-sun text-yellow text-3xl drop-shadow-[0_0_10px_rgba(238,212,159,0.5)]"></i>,
  'Fair (Night)': <i className="fas fa-moon text-blue text-3xl drop-shadow-[0_0_10px_rgba(138,173,244,0.4)]"></i>,
  'Fair': <i className="fas fa-sun text-yellow text-3xl drop-shadow-[0_0_10px_rgba(238,212,159,0.5)]"></i>,
  'Fair and Warm': <i className="fas fa-sun text-peach text-3xl drop-shadow-[0_0_12px_rgba(245,169,127,0.6)]"></i>,
  'Sunny': <i className="fas fa-sun text-yellow text-3xl drop-shadow-[0_0_10px_rgba(238,212,159,0.5)]"></i>,

  // Cloudy variants
  'Partly Cloudy (Day)': <i className="fas fa-cloud-sun text-subtext0 text-3xl drop-shadow-[0_0_8px_rgba(165,173,203,0.4)]"></i>,
  'Partly Cloudy (Night)': <i className="fas fa-cloud-moon text-overlay2 text-3xl drop-shadow-[0_0_8px_rgba(147,154,183,0.3)]"></i>,
  'Partly Cloudy': <i className="fas fa-cloud-sun text-subtext0 text-3xl drop-shadow-[0_0_8px_rgba(165,173,203,0.3)]"></i>,
  'Cloudy': <i className="fas fa-cloud text-overlay1 text-3xl drop-shadow-[0_0_8px_rgba(128,135,162,0.3)]"></i>,

  // Atmospheric
  'Hazy': <i className="fas fa-smog text-overlay0 text-3xl opacity-80"></i>,
  'Slightly Hazy': <i className="fas fa-smog text-overlay0 text-3xl opacity-60"></i>,
  'Windy': <i className="fas fa-wind text-teal text-3xl drop-shadow-[0_0_8px_rgba(139,213,202,0.4)]"></i>,
  'Mist': <i className="fas fa-water text-sapphire text-3xl opacity-70"></i>,
  'Fog': <i className="fas fa-smog text-overlay1 text-3xl opacity-90"></i>,

  // Rain & Showers
  'Light Rain': <i className="fas fa-cloud-rain text-sky text-3xl drop-shadow-[0_0_8px_rgba(145,215,227,0.4)]"></i>,
  'Moderate Rain': <i className="fas fa-cloud-showers-heavy text-blue text-3xl drop-shadow-[0_0_10px_rgba(138,173,244,0.5)]"></i>,
  'Heavy Rain': <i className="fas fa-cloud-showers-water text-sapphire text-3xl drop-shadow-[0_0_12px_rgba(125,196,228,0.6)]"></i>,
  'Passing Showers': <i className="fas fa-cloud-sun-rain text-sky text-3xl opacity-90"></i>,
  'Light Showers': <i className="fas fa-cloud-rain text-sky text-3xl opacity-80"></i>,
  'Showers': <i className="fas fa-cloud-showers-heavy text-blue text-3xl drop-shadow-[0_0_8px_rgba(138,173,244,0.4)]"></i>,
  'Heavy Showers': <i className="fas fa-cloud-showers-water text-sapphire text-3xl drop-shadow-[0_0_10px_rgba(125,196,228,0.5)]"></i>,

  // Thundery
  'Thundery Showers': <i className="fas fa-cloud-bolt text-mauve text-3xl drop-shadow-[0_0_15px_rgba(198,160,246,0.6)]"></i>,
  'Heavy Thundery Showers': <i className="fas fa-cloud-bolt text-pink text-3xl drop-shadow-[0_0_20px_rgba(245,189,230,0.7)] animate-pulse"></i>,
  'Heavy Thundery Showers with Gusty Winds': <i className="fas fa-cloud-bolt text-flamingo text-3xl drop-shadow-[0_0_25px_rgba(240,198,198,0.8)] animate-bounce"></i>,

  'default': <i className="fas fa-cloud text-overlay0 text-3xl"></i>
};

/**
 * Returns a React node for the weather icon based on the forecast description.
 * It uses a prioritized matching system to handle specific cases like 'Night' and 'Heavy'.
 */
export const getWeatherIcon = (description: string, sizeClass: string = "text-3xl") => {
  const desc = description.trim();
  
  // 1. Direct match check (most accurate)
  if (WeatherIconMap[desc]) {
    return WeatherIconMap[desc];
  }

  // 2. Case-insensitive full match
  const lowerDesc = desc.toLowerCase();
  const exactKey = Object.keys(WeatherIconMap).find(k => k.toLowerCase() === lowerDesc);
  if (exactKey) return WeatherIconMap[exactKey];

  // 3. Sub-string priority matching
  // Check for complex conditions first
  if (lowerDesc.includes('heavy thundery showers')) {
    return lowerDesc.includes('gusty') 
      ? WeatherIconMap['Heavy Thundery Showers with Gusty Winds']
      : WeatherIconMap['Heavy Thundery Showers'];
  }

  if (lowerDesc.includes('thundery')) return WeatherIconMap['Thundery Showers'];
  
  // Handle Night vs Day for common types
  if (lowerDesc.includes('night')) {
    if (lowerDesc.includes('fair')) return WeatherIconMap['Fair (Night)'];
    if (lowerDesc.includes('cloudy')) return WeatherIconMap['Partly Cloudy (Night)'];
  }

  if (lowerDesc.includes('heavy rain')) return WeatherIconMap['Heavy Rain'];
  if (lowerDesc.includes('showers')) return WeatherIconMap['Showers'];
  if (lowerDesc.includes('rain')) return WeatherIconMap['Light Rain'];
  if (lowerDesc.includes('cloudy')) return WeatherIconMap['Cloudy'];
  if (lowerDesc.includes('hazy')) return WeatherIconMap['Hazy'];
  if (lowerDesc.includes('fair') || lowerDesc.includes('sunny')) return WeatherIconMap['Fair (Day)'];
  if (lowerDesc.includes('windy')) return WeatherIconMap['Windy'];
  if (lowerDesc.includes('mist') || lowerDesc.includes('fog')) return WeatherIconMap['Mist'];

  return WeatherIconMap['default'];
};

// Normalized coordinates (0-100%) for Singapore Weather Areas
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
  { id: 'north', name: 'North', x: '50%', y: '18%' },
  { id: 'south', name: 'South', x: '50%', y: '82%' },
  { id: 'east', name: 'East', x: '88%', y: '50%' },
  { id: 'west', name: 'West', x: '12%', y: '50%' },
  { id: 'central', name: 'Central', x: '50%', y: '50%' }
];