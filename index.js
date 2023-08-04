const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(
  ".grant-location-container"
);
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const searchInput = document.querySelector("[data-searchInput]");
// const apiErrorWindow = document.querySelector(".api-fetch-error");
// const apiErrorImg = document.querySelector("[errorImg]");
// const apiErrorMsg = document.querySelector("[errorMsg");
const apiErrorContainer = document.querySelector(".api-error-container");
const apiErrorImg = document.querySelector("[data-notFoundImg]");
const apiErrorMessage = document.querySelector("[data-apiErrorText]");
const apiErrorBtn = document.querySelector("[data-apiErrorBtn]");

// variables needed ?

let oldTab = userTab;
// const API_KEY = process.env.API_KEY;
const API_KEY = "db4b4c90ff4aa110c6ec3bd784546bc3";

oldTab.classList.add("current-tab");
// ek kaam aur pending
getFromSessionStorage();

function switchTab(newTab) {
  if (oldTab != newTab) {
    apiErrorContainer.classList.remove("active");
    oldTab.classList.remove("current-tab");
    oldTab = newTab;
    oldTab.classList.add("current-tab");

    if (!searchForm.classList.contains("active")) {
      // kya search form wala conatainer is invisisble ?,  if yes then make it visible
      searchInput.value = "";
      userInfoContainer.classList.remove("active");
      grantAccessContainer.classList.remove("active");
      searchForm.classList.add("active");
    } else {
      // mein phele search wale tab mein tha, ab your weather wala tab visible karna h
      searchForm.classList.remove("active");
      userInfoContainer.classList.remove("active");
      // ab mein your weather tab mein aagaya hoon, to weather bhi display karna padega, so let's  check local storage first for coordinates, if we have saved them there.
      getFromSessionStorage();
    }
  }
}

userTab.addEventListener("click", () => {
  // passed clicked tab as input parameter
  switchTab(userTab);
});

searchTab.addEventListener("click", () => {
  // passed clicked tab as input parameter
  switchTab(searchTab);
});

// check if coordinates are already present in session storage
function getFromSessionStorage() {
  const localCoordinate = sessionStorage.getItem("user-coordinates");
  if (!localCoordinate) {
    // agar local coordinates nahi mile
    grantAccessContainer.classList.add("active");
  } else {
    // agar mil gaye to user weather wali window show karani hai
    const coordinates = JSON.parse(localCoordinate);
    userInfoContainer.classList.remove("active");
    fetchUserWeatherInfo(coordinates);
    // userInfoContainer.classList.add("active");
  }
}

async function fetchUserWeatherInfo(coordinates) {
  const { lat, lon } = coordinates;
  //make grantContainer invisible
  grantAccessContainer.classList.remove("active");
  //make loading screen visible
  loadingScreen.classList.add("active");

  // API CALL
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    loadingScreen.classList.remove("active");

    // user info container ko visible karo
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data);
  } catch (err) {
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.remove("active");
    apiErrorContainer.classList.add("active");
    apiErrorImg.style.display = "none";
    apiErrorMessage.innerText = `Error: ${error?.message}`;
    apiErrorBtn.addEventListener("click", fetchUserWeatherInfo);
  }
}

function renderWeatherInfo(weatherInfo) {
  // firstly, we have to fetch the elemets

  const cityName = document.querySelector("[data-cityName]");
  const countryIcon = document.querySelector("[data-countryIcon]");
  const desc = document.querySelector("[data-weatherDesc]");
  const weatherIcon = document.querySelector("[data-weatherIcon]");
  const temp = document.querySelector("[data-temp]");
  const windspeed = document.querySelector("[data-windspeed]");
  const humidity = document.querySelector("[data-humidity]");
  const cloudiness = document.querySelector("[data-cloudiness]");

  // fetch value from weatherINFO object and put it on UI elements
  cityName.innerText = weatherInfo?.name;
  countryIcon.src = `https://flagcdn.com//144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
  desc.innerText = weatherInfo?.weather?.[0]?.main;
  weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
  temp.innerText = `${weatherInfo?.main?.temp.toFixed(2)} °C`;
  windspeed.innerText = `${weatherInfo?.wind?.speed.toFixed(2)}m/s`;
  humidity.innerText = `${weatherInfo?.main?.humidity}%`;
  cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

function getLocation() {
  if (navigator.geolocation) {
    // navigator.geolocation.getCurrentPosition(showPosition);
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    //HW :- show an alert for no geolocation support available
    grantAccessBtn.style.display = "none";
    messageText.innerText = "Geolocation is not supported by this browser.";
  }
}

// navigator.geolocation.getCurrentPosition(showPosition, showError);

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      console.error("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      console.error("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      console.error("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      console.error("An unknown error occurred.");
      break;
  }
}

function showPosition(position) {
  const userCoordinates = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  };
  sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
  fetchUserWeatherInfo(userCoordinates);
}

const grantAccessBtn = document.querySelector("[data-grantAccess]");
grantAccessBtn.addEventListener("click", getLocation);

// Search wali window
// const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
  // apiErrorWindow.classList.remove("active ");
  e.preventDefault();
  let cityName = searchInput.value;

  if (cityName === "") return;
  else {
    fetchSearchWeatherInfo(cityName);
  }
});

async function fetchSearchWeatherInfo(city) {
  loadingScreen.classList.add("active");
  userInfoContainer.classList.remove("active");
  grantAccessBtn.classList.remove("active");
  apiErrorContainer.classList.remove("active");

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    if (!response.ok) {
      throw new Error("City Unavailable");
    }
    const data = await response.json();
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data);
  } catch (err) {
    // Home work
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.remove("active");
    apiErrorContainer.classList.add("active");
    apiErrorMessage.innerText = `${err?.message}`;
    apiErrorBtn.style.display = "none";
  }
}
