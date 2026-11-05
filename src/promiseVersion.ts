import {
  getLocation, getTopic, weatherUrl, newsUrl,
  getJSON, formatError, showWeather, showNews,
  type Weather, type News,
} from "./utils";

const location = getLocation();
const getWeather = () => getJSON<Weather>(weatherUrl(location), "Weather");
const getNews = () => getJSON<News>(newsUrl(getTopic()), "News");

// 1) Promise chain: weather -> news, flat instead of nested
function runChain(): Promise<void> {
  console.log("\n=== 1) Promise chain (weather -> news) ===");
  return getWeather()
    .then((weather) => {
      showWeather(weather, location);
      return getNews(); // returning a promise continues the chain
    })
    .then((news) => {
      showNews(news);
    })
    .catch((err) => {
      console.log(formatError(err));
    });
}

// 2) Promise.all: run both at the same time, wait for BOTH
function runAll(): Promise<void> {
  console.log("\n=== 2) Promise.all (parallel, wait for both) ===");
  const start = Date.now();
  return Promise.all([getWeather(), getNews()])
    .then(([weather, news]) => {
      showWeather(weather, location);
      showNews(news);
      console.log(`⏱  Both finished in ${Date.now() - start}ms`);
    })
    .catch((err) => {
      console.log(formatError(err));
    });
}

// 3) Promise.race: run both, take whichever finishes FIRST
function runRace(): Promise<void> {
  console.log("\n=== 3) Promise.race (fastest wins) ===");
  const start = Date.now();
  return Promise.race([
    getWeather().then((data) => ({ source: "Weather", data })),
    getNews().then((data) => ({ source: "News", data })),
  ])
    .then((winner) => {
      console.log(`🏁 Fastest: ${winner.source} in ${Date.now() - start}ms`);
    })
    .catch((err) => {
      console.log(formatError(err));
    });
}

console.log(`Location: ${location.name}`);
runChain().then(runAll).then(runRace);