const sysConfig = Shelly.getComponentConfig("sys");

const timezone = sysConfig.location.tz;

const lat = sysConfig.location.lat;

const lon = sysConfig.location.lon;

const url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&daily=precipitation_probability_max&timezone=" + timezone;

console.log("URL:", url);

function readRainProbability(result, error_code, error_message) {
  if (error_code !== 0) {
    console.log(error_message);
    return;
  }
  const response = JSON.parse(result.body);
  const times = response.daily.time;
  const probabilities = response.daily.precipitation_probability_max;
  
  for (let i = 0; i < times.length; i++) {
    let date = times[i];
    let probability = probabilities[i];
    console.log("Date", date, "- rain probability is", probability);
  }
}

Shelly.call(
  "HTTP.GET",
  {"url": url},
  readRainProbability
);