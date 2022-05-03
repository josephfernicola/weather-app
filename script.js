const weatherInput = document.getElementById("weatherInput");
weatherInput.addEventListener("input", () => searchStates(weatherInput.value));

//search states.json and filter it
const searchStates = async (searchText) => {
  const res = await fetch("./data/states.json");
  const states = await res.json();

  let matches = states.filter((state) => {
    const regex = new RegExp(`^${searchText}`, "gi");
    return state.match(regex);
  });
  const matchList = document.querySelector(".match-list");
  if (searchText.length === 0) {
    matches = [];
    while (matchList.firstChild) {
      matchList.firstChild.remove();
    }
  }
  let content = matches.map((item) => {
    return `<br><div class="listItem">${item}</div><br>`;
  });
  let firstTen = content.slice(0, 5).join("");
  matchList.innerHTML = firstTen;
  autoFillOutInputBox();
};

function autoFillOutInputBox() {
  const listItem = document.querySelectorAll(".listItem");
  const matchList = document.querySelector(".match-list");
  listItem.forEach((item) => {
    item.addEventListener("click", () => {
      weatherInput.value = item.textContent;
      while (matchList.firstChild) {
        matchList.firstChild.remove();
      }
    });
  });
}

async function getCurrentWeather() {
  const submit = document.querySelector(".submit");
  submit.addEventListener("click", async function () {
    const matchList = document.querySelector(".match-list");
    while (matchList.firstChild) {
      //remove auto fill options
      matchList.firstChild.remove();
    }
    const weatherInput = document.getElementById("weatherInput");
    let searchValue = weatherInput.value;
    const errorMessage = document.querySelector(".errorMessage");
    if (
      !searchValue &&
      !weatherInput.classList.contains("errorActive") &&
      !errorMessage
    ) {
      displayErrorMessage(weatherInput);
    }
    if (searchValue) {
      weatherInput.classList.remove("errorActive");
      const searchBar = document.querySelector(".searchBar");
      if (errorMessage) {
        searchBar.removeChild(errorMessage);
      }
      const response = await fetch(
        "https://api.openweathermap.org/data/2.5/weather?appid=64f56c5c06b4d23394c01125c1983ca3&q=" +
          searchValue,
        { mode: "cors" }
      );

      if (response.statusText == "Not Found") {
        weatherInput.classList.add("errorActive");
        const errorMessage = document.createElement("div");
        errorMessage.textContent = "Please Enter a City Name";
        errorMessage.classList.add("errorMessage");
        const searchBar = document.querySelector(".searchBar");
        searchBar.appendChild(errorMessage);
      } else {
        await displayWeatherInfo(response, searchValue);
      }
    }
  });
}

getCurrentWeather();

function displayErrorMessage(weatherInput) {
  weatherInput.classList.add("errorActive");
  const errorMessage = document.createElement("div");
  errorMessage.textContent = "Please Enter a City Name";
  errorMessage.classList.add("errorMessage");
  const searchBar = document.querySelector(".searchBar");
  searchBar.appendChild(errorMessage);
}

async function displayWeatherInfo(response, searchValue) {
  const current = document.querySelector(".current");
  const name = document.querySelector(".name");
  const feelsLike = document.querySelector(".feelsLike");
  const humidity = document.querySelector(".humidity");
  const wind = document.querySelector(".wind");
  const finalDisplay = document.querySelector(".finalDisplay");
  const daily = document.querySelector(".daily");
  const hourly = document.querySelector(".hourly");

  const weatherData = await response.json();
  const lat = weatherData.coord.lat;
  const lon = weatherData.coord.lon;
  const newResponse = await fetch(
    "https://api.openweathermap.org/data/2.5/weather?&units=imperial&appid=64f56c5c06b4d23394c01125c1983ca3&lat=" +
      lat +
      "&lon=" +
      lon,
    { mode: "cors" }
  );
  const newData = await newResponse.json();

  const hourlyAndDailyResponse = await fetch(
    "https://api.openweathermap.org/data/2.5/onecall?&units=imperial&appid=64f56c5c06b4d23394c01125c1983ca3&lat=" +
      lat +
      "&lon=" +
      lon,
    { mode: "cors" }
  );
  const newHourlyAndDailyResponse = await hourlyAndDailyResponse.json();

  current.textContent = "Now: " + newData.main.temp + " °F";
  humidity.textContent = "Humidity: " + newData.main.humidity + "%";
  name.textContent = searchValue;
  feelsLike.textContent = "Feels like: " + newData.main.feels_like + " °F";
  wind.textContent = "Wind: " + newData.wind.speed + " mph";
  finalDisplay.style.backgroundColor = "rgb(20, 5, 73)";
  finalDisplay.style.boxShadow = "0 0 10px black";

  hourly.textContent =
    "1 Hour: " + newHourlyAndDailyResponse.hourly[0].temp + " °F";
  daily.textContent =
    "Today: " + newHourlyAndDailyResponse.daily[0].temp.day + " °F";
}
