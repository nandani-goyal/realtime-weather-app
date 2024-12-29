const cityInput = document.getElementById('city_input');
const searchBtn = document.getElementById('searchBtn');
const api_key = '1f59371ccf1acaeab5698f17b6b9b517';
const currentWeatherCard = document.querySelectorAll('.weather-left .card')[0];
const fiveDAYSforecastCard = document.querySelector('.day-forcast');

if (!currentWeatherCard) {
  console.error("Element '.weather-left .card' not found in the DOM.");
}

if (!fiveDAYSforecastCard) {
  console.error("Element '.day-forcast' not found in the DOM.");
}

function getWeatherDetails(name, lat, lon, country, state) {
  const FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}`;
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`;
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Fetch Current Weather
  fetch(WEATHER_API_URL)
    .then(res => res.json())
    .then(weatherData => {
      if (!weatherData || !weatherData.main || !weatherData.weather) {
        alert('Failed to fetch valid weather data.');
        return;
      }

      const date = new Date();
      currentWeatherCard.innerHTML = `
        <div class="current-weather">
          <div class="details">
            <p>Now</p>
            <h2>${(weatherData.main.temp - 273.15).toFixed(2)}°C</h2>
            <p>${weatherData.weather[0].description}</p>
          </div>
          <div class="weather-icon">
            <i class="fa-solid fa-cloud"></i>
          </div>
        </div>
        <hr>
        <div class="card-footer">
          <p>
            <i class="fa-regular fa-calendar" style="color: #d4d6d8;"></i>
            ${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}
          </p>
          <p>
            <i class="fa-solid fa-location-dot" style="color: #d4d6d8;"></i>
            ${name}, ${country}
          </p>
        </div>`;
    })
    .catch(err => {
      console.error('Error fetching weather data:', err);
      alert('Failed to fetch current weather.');
    });

  // Fetch 5-day Forecast
  fetch(FORECAST_API_URL)
    .then(res => res.json())
    .then(data => {
      if (!data || !data.list || data.list.length === 0) {
        alert('Failed to fetch valid forecast data.');
        return;
      }

      // Filter unique forecast days
      const uniqueForecastDays = [];
      const filteredForecast = data.list.filter(forecast => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          uniqueForecastDays.push(forecastDate);
          return true;
        }
        return false;
      });

      // Update 5-day forecast in the DOM
      fiveDAYSforecastCard.innerHTML = '';
      filteredForecast.forEach((forecast, index) => {
        if (index === 0) return; // Skip today

        const date = new Date(forecast.dt_txt);
        fiveDAYSforecastCard.innerHTML += `
          <div class="forecast-item">
            <div class="icon-wrapper">
              <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="${forecast.weather[0].description}">
              <span>${(forecast.main.temp - 273.15).toFixed(2)}°C</span>
            </div>
            <p>${date.getDate()} ${months[date.getMonth()]}</p>
            <p>${days[date.getDay()]}</p>
          </div>`;
      });
    })
    .catch(err => {
      console.error('Error fetching forecast data:', err);
      alert('Failed to fetch weather forecast.');
    });
}

function getCityCoordinates() {
  const cityName = cityInput.value.trim();
  cityInput.value = '';
  if (!cityName) {
    alert('Please enter a city name.');
    return;
  }

  const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${api_key}`;

  fetch(GEOCODING_API_URL)
    .then(res => res.json())
    .then(data => {
      if (!data || data.length === 0) {
        alert('City not found.');
        return;
      }

      const { name, lat, lon, country, state } = data[0];
      getWeatherDetails(name, lat, lon, country, state);
    })
    .catch(err => {
      console.error('Error fetching city coordinates:', err);
      alert('Coordinates not found.');
    });
}

searchBtn.addEventListener('click', getCityCoordinates);
