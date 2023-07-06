import { ref } from 'vue';

export const removeCity = ref({
  remove(cityId) {
    const cities = JSON.parse(localStorage.getItem('savedCities'));
    const updatedCities = cities.filter((savedCity) => savedCity.id !== cityId);
    localStorage.setItem('savedCities', JSON.stringify(updatedCities));
  }
});
