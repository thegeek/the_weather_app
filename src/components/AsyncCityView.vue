<template>
  <div class="flex flex-col flex-1 items-center">
    <!-- Banner -->
    <div v-if="route.query.preview" class="text-white p-4 bg-weather-secondary w-full text-center">
      <p>You are currenty previewing this city, click the "+" icon to start tracking this city.</p>
    </div>
    <!-- Weather Overview -->
    <div class="flex flex-col items-center text-white py-12">
      <h1 class="text-4xl mb-2">{{ route.params.city }}</h1>
      <p class="text-sm mb-12">
        {{
          new Date(weatherData.currentTime).toLocaleDateString('en-us', {
            weekday: 'short',
            day: '2-digit',
            month: 'long'
          })
        }}
        {{ new Date(weatherData.currentTime).toLocaleTimeString('en-us', { timeStyle: 'short' }) }}
      </p>
      <p class="text-8xl mb-8">{{ Math.round(weatherData.current.main.temp) }}&deg;</p>
      <p>Feels Like {{ Math.round(weatherData.current.main.feels_like) }}&deg;</p>
      <p class="capitalize">{{ weatherData.current.weather[0].description }}</p>
      <img
        class="w-[150px] h-auto"
        :src="`https://openweathermap.org/img/wn/${weatherData.current.weather[0].icon}@2x.png`"
        alt=""
      />
    </div>

    <hr class="border-white border-opacity-10 border w-full" />

    <!-- Hourly Weather -->
    <div class="max-w-screen-md w-full py-12">
      <div class="mx-8 text-white">
        <h2 class="mb-4">Hourly Weather</h2>
        <div class="flex gap-10 no-overflow-x-scroll">
          <div
            v-for="hourData in weatherData.hourly"
            :key="hourData.dt"
            class="flex flex-col gap-4 items-center"
          >
            <p class="whitespace-nowrap text-md">
              {{ new Date(hourData.currentTime).toLocaleTimeString('en-us', { hour: 'numeric' }) }}
            </p>
            <img
              class="w-auto h-[50] object-cover"
              :src="`https://openweathermap.org/img/wn/${hourData.weather[0].icon}@2x.png`"
              alt=""
            />
            <p class="text-xl">{{ Math.round(hourData.main.temp) }}&deg;</p>
          </div>
        </div>
      </div>
    </div>

    <hr class="border-white border-opacity-10 border w-full" />

    <!-- Weekly Weather -->
    <div class="max-w-screen-md w-full py-12">
      <div class="mx-8 text-white">
        <h2 class="mb-4">5 Day Forecast</h2>
        <div v-for="day in weatherData.daily" :key="day.dt" class="flex items-center">
          <p class="flex-1">
            {{ new Date(day.currentTime).toLocaleDateString('en-us', { weekday: 'long' }) }}
            {{ new Date(day.currentTime).toLocaleTimeString('en-us', { timeStyle: 'short' }) }}
          </p>
          <img
            class="w-[50px] h-[50] object-cover"
            :src="`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`"
            alt=""
          />
          <div class="flex gap-2 flex-1 justify-end">
            <p>H: {{ Math.round(day.main.temp_max) }}</p>
            <p>L: {{ Math.round(day.main.temp_min) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div
      class="flex items-center gap-2 py-12 text-white cursor-pointer duration-150 hover:text-red-500"
      @click="removeCity"
      v-show="!route.query.preview"
    >
      <i class="fa-solid fa-trash"></i>
      <p>Remove City</p>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import { openweatherAPIKey, units } from '../constants';

const route = useRoute();
const router = useRouter();

const getWeatherData = async () => {
  try {
    // With old api
    // const weatherData = await axios.get(
    //   `https://api.openweathermap.org/data/3.0/onecall?lat=${route.query.lat}&lon=${route.query.lng}&exclude={part}&appid=${openweatherAPIKey}&units=${units}`
    // );

    const forecastData = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${route.query.lat}&lon=${route.query.lng}&appid=${openweatherAPIKey}&units=${units}`
    );

    const todayWeatherData = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${route.query.lat}&lon=${route.query.lng}&appid=${openweatherAPIKey}&units=${units}`
    );

    const weatherData = {
      data: {
        current: todayWeatherData.data,
        hourly: forecastData.data.list.slice(0, 7),
        daily: forecastData.data.list,
        city: forecastData.data.city
      }
    };

    // Calculate current date and time
    const localOffset = new Date().getTimezoneOffset();
    const utc = weatherData.data.current.dt * 1000 + localOffset;
    weatherData.data.currentTime = utc + weatherData.data.current.timezone;

    weatherData.data.daily.forEach((hour) => {
      const utc = hour.dt * 1000 + localOffset;
      hour.currentTime = utc + weatherData.data.current.timezone;
    });

    // Flicker fix
    await new Promise((res) => setTimeout(res, 1000));

    return weatherData.data;
  } catch (err) {
    console.error(err);
  }
};

const weatherData = await getWeatherData();

const removeCity = () => {
  const cities = JSON.parse(localStorage.getItem('savedCities'));
  const updatedCities = cities.filter((city) => city.id !== route.query.id);
  localStorage.setItem('savedCities', JSON.stringify(updatedCities));
  router.push({
    name: 'home'
  });
};
</script>
