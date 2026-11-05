import {
  getLocation, getTopic, weatherUrl, newsUrl,
  getJSONCallback, formatError, showWeather, showNews,
  type Weather, type News,
} from "./utils";

const location = getLocation();
const WEATHER_URL = weatherUrl(location);
const NEWS_URL = newsUrl(getTopic());

console.log("Fetching weather...");

getJSONCallback<Weather>(WEATHER_URL, "Weather", (weatherError, weather) => {
  if (weatherError || !weather) return console.log(formatError(weatherError));
  showWeather(weather, location);

  console.log("\nFetching news...");

  getJSONCallback<News>(NEWS_URL, "News", (newsError, news) => {
    if (newsError || !news) return console.log(formatError(newsError));
    showNews(news);
    console.log("\n✅ Done (weather -> news, nested callbacks)");
  });
});