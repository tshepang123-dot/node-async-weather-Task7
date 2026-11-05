import https from "node:https";

// ---------- Types ----------
export interface Weather {
  current_weather: { temperature: number; windspeed: number };
}

export interface News {
  posts: { id: number; title: string }[];
}

export interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

export type Callback<T> = (error: Error | null, data?: T) => void;

// ---------- Locations (centred on Kimberley) ----------
export const LOCATIONS: Record<string, Location> = {
  kimberley: { name: "Kimberley", latitude: -28.7282, longitude: 24.7499 },
  "barkly west": { name: "Barkly West", latitude: -28.5333, longitude: 24.5167 },
  warrenton: { name: "Warrenton", latitude: -28.1167, longitude: 24.85 },
  "jan kempdorp": { name: "Jan Kempdorp", latitude: -27.9333, longitude: 24.8167 },
  hartswater: { name: "Hartswater", latitude: -27.75, longitude: 24.8 },
  vryburg: { name: "Vryburg", latitude: -26.9567, longitude: 24.7283 },
  griekwastad: { name: "Griekwastad", latitude: -28.8333, longitude: 23.25 },
  douglas: { name: "Douglas", latitude: -29.05, longitude: 23.7667 },
  hopetown: { name: "Hopetown", latitude: -29.6167, longitude: 24.0833 },
  postmasburg: { name: "Postmasburg", latitude: -28.3333, longitude: 23.0667 },
  kuruman: { name: "Kuruman", latitude: -27.4524, longitude: 23.4325 },
  kathu: { name: "Kathu", latitude: -27.6975, longitude: 23.0472 },
  upington: { name: "Upington", latitude: -28.4478, longitude: 21.2561 },
  bloemfontein: { name: "Bloemfontein", latitude: -29.0852, longitude: 26.1596 },
};

const DEFAULT_LOCATION = LOCATIONS["kimberley"] as Location;

// npm run async -- "Barkly West"
export function getLocation(): Location {
  const arg = process.argv[2]?.trim().toLowerCase();
  if (!arg) return DEFAULT_LOCATION;

  const found = LOCATIONS[arg];
  if (!found) {
    console.log(`⚠️  Unknown location "${process.argv[2]}", using ${DEFAULT_LOCATION.name}`);
    return DEFAULT_LOCATION;
  }
  return found;
}

// npm run async -- Kimberley love   (optional news search word)
export function getTopic(): string | undefined {
  return process.argv[3];
}

export function weatherUrl(loc: Location): string {
  if (process.env["TEST_ERROR"] === "network") {
    return "https://api.open-meteo.invalid/v1/forecast"; // host doesn't exist
  }
  return `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current_weather=true`;
}

export function newsUrl(topic?: string): string {
  if (process.env["TEST_ERROR"] === "status") {
    return "https://dummyjson.com/postsX"; // returns 404
  }
  if (process.env["TEST_ERROR"] === "json") {
    return "https://example.com"; // returns HTML, not JSON
  }
  return topic
    ? `https://dummyjson.com/posts/search?q=${encodeURIComponent(topic)}&limit=5`
    : "https://dummyjson.com/posts?limit=5";
}

// ---------- Error formatting (same format in all three versions) ----------
export function formatError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  return `❌ Error: ${message}`;
}

// ---------- Display helpers ----------
export function showWeather(weather: Weather, loc: Location): void {
  console.log(`🌤  Weather in ${loc.name}`);
  console.log(`   Temperature: ${weather.current_weather.temperature}°C`);
  console.log(`   Wind speed:  ${weather.current_weather.windspeed} km/h`);
}

export function showNews(news: News): void {
  console.log("📰 Latest headlines");
  if (news.posts.length === 0) {
    console.log("   No posts found");
    return;
  }
  news.posts.forEach((post, i) => console.log(`   ${i + 1}. ${post.title}`));
}

// ---------- HTTP: callback style (used by callbackVersion.ts) ----------
export function getJSONCallback<T>(
  url: string,
  label: string,
  callback: Callback<T>
): void {
  const req = https.get(url, (res) => {
    let body = "";

    res.on("data", (chunk) => {
      body += chunk;
    });

    res.on("end", () => {
      if (res.statusCode !== 200) {
        return callback(
          new Error(`${label} request failed (status ${res.statusCode})`)
        );
      }
      try {
        callback(null, JSON.parse(body) as T);
      } catch {
        callback(new Error(`${label} returned invalid JSON`));
      }
    });
  });

  // Give up after 10 seconds; destroy() triggers the "error" event below
  req.setTimeout(10000, () => {
    req.destroy(new Error("timed out"));
  });

  req.on("error", (err) => {
    callback(new Error(`${label} request failed (${err.message})`));
  });
}

export function getJSON<T>(url: string, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    getJSONCallback<T>(url, label, (error, data) => {
      if (error) return reject(error);
      resolve(data as T);
    });
  });
}