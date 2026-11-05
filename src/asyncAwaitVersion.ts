import {
  getLocation, getTopic, weatherUrl, newsUrl,
  getJSON, formatError, showWeather, showNews,
  type Weather, type News,
} from "./utils";

const location = getLocation();
const getWeather = () => getJSON<Weather>(weatherUrl(location), "Weather");
const getNews = () => getJSON<News>(newsUrl(getTopic()), "News");

// 1) Sequential: each await pauses this function until the promise settles
async function runSequential(): Promise<void> {
  console.log("\n=== 1) Async/await (sequential: weather -> news) ===");
  try {
    const weather = await getWeather();
    showWeather(weather, location);

    const news = await getNews();
    showNews(news);
  } catch (err) {
    console.log(formatError(err));
  }
}

// 2) Parallel: start both, then await them together
async function runParallel(): Promise<void> {
  console.log("\n=== 2) Async/await + Promise.all (parallel) ===");
  const start = Date.now();
  try {
    const [weather, news] = await Promise.all([getWeather(), getNews()]);
    showWeather(weather, location);
    showNews(news);
    console.log(`⏱  Both finished in ${Date.now() - start}ms`);
  } catch (err) {
    console.log(formatError(err));
  }
}

// 3) Race: whichever request finishes first wins
async function runRace(): Promise<void> {
  console.log("\n=== 3) Async/await + Promise.race (fastest wins) ===");
  const start = Date.now();
  try {
    const winner = await Promise.race([
      getWeather().then((data) => ({ source: "Weather", data })),
      getNews().then((data) => ({ source: "News", data })),
    ]);
    console.log(`🏁 Fastest: ${winner.source} in ${Date.now() - start}ms`);
  } catch (err) {
    console.log(formatError(err));
  }
}

async function main(): Promise<void> {
  console.log(`Location: ${location.name}`);
  await runSequential();
  await runParallel();
  await runRace();
}

main();