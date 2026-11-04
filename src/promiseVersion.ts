import https from "node:https";

const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=-26.2&longitude=28.04&current_weather=true";
const NEWS_URL = "https://dummyjson.com/posts?limit=5";

interface Weather {
  current_weather: { temperature: number; windspeed: number };
}
interface News {
  posts: { id: number; title: string }[];
}

// The same https logic as before, but wrapped in a Promise
function getJSON<T>(url: string, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let body = "";

        res.on("data", (chunk) => {
          body += chunk;
        });

        res.on("end", () => {
          if (res.statusCode !== 200) {
            return reject(
              new Error(`${label} request failed (status ${res.statusCode})`)
            );
          }
          try {
            resolve(JSON.parse(body) as T);
          } catch {
            reject(new Error(`${label} returned invalid JSON`));
          }
        });
      })
      .on("error", (err) => {
        reject(new Error(`${label} request failed (${err.message})`));
      });
  });
}

const getWeather = () => getJSON<Weather>(WEATHER_URL, "Weather");
const getNews = () => getJSON<News>(NEWS_URL, "News");

function showWeather(weather: Weather): void {
  console.log("🌤  Weather in Johannesburg");
  console.log(`   Temperature: ${weather.current_weather.temperature}°C`);
  console.log(`   Wind speed:  ${weather.current_weather.windspeed} km/h`);
}

function showNews(news: News): void {
  console.log("📰 Latest headlines");
  news.posts.forEach((post, i) => console.log(`   ${i + 1}. ${post.title}`));
}

// 1) Promise chain: weather -> news, flat instead of nested
function runChain(): Promise<void> {
  console.log("\n=== 1) Promise chain (weather -> news) ===");
  return getWeather()
    .then((weather) => {
      showWeather(weather);
      return getNews(); // returning a promise continues the chain
    })
    .then((news) => {
      showNews(news);
    })
    .catch((err: Error) => {
      console.log("❌ Error:", err.message);
    });
}

// 2) Promise.all: run both at the same time, wait for BOTH
function runAll(): Promise<void> {
  console.log("\n=== 2) Promise.all (parallel, wait for both) ===");
  const start = Date.now();
  return Promise.all([getWeather(), getNews()])
    .then(([weather, news]) => {
      showWeather(weather);
      showNews(news);
      console.log(`⏱  Both finished in ${Date.now() - start}ms`);
    })
    .catch((err: Error) => {
      console.log("❌ Error:", err.message);
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
    .catch((err: Error) => {
      console.log("❌ Error:", err.message);
    });
}

runChain().then(runAll).then(runRace);