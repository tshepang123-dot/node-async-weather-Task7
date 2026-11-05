# Task 7: Async Weather & News Dashboard

A Node.js + TypeScript project that fetches weather and news headlines from public APIs. It is built three times to compare asynchronous styles: **callbacks**, **promises** and **async/await**.

- Weather: [Open-Meteo](https://open-meteo.com/) (no API key needed)
- News: [DummyJSON Posts](https://dummyjson.com/docs/posts)

## Features

- Callback version using Node's built-in `https` module, with nested callbacks to show callback hell
- Promise version with a flat promise chain, `Promise.all()` and `Promise.race()`
- Async/await version with `try...catch`, `Promise.all()` and `Promise.race()`
- Consistent, readable error handling across all three versions
- Location and a news search word can be chosen from the command line (default: Kimberley)

## Project structure

```
node-async-weather/
├── src/
│   ├── callbackVersion.ts     # callbacks
│   ├── promiseVersion.ts      # promises, Promise.all, Promise.race
│   ├── asyncAwaitVersion.ts   # async/await + try...catch
│   └── utils.ts               # shared types, locations, URLs, helpers, formatError()
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
git clone <your-repo-url>
cd node-async-weather
npm install
```

Requires Node.js and npm. TypeScript files run directly with [tsx](https://github.com/privatenumber/tsx).

## Usage

```bash
npm run callback
npm run promise
npm run async
```

Choose a location (default is Kimberley) and an optional news search word:

```bash
npm run async -- Warrenton
npm run promise -- "Barkly West"
npm run callback -- Upington love
```

The `--` passes the arguments through npm to the script. Available locations: Kimberley, Barkly West, Warrenton, Jan Kempdorp, Hartswater, Vryburg, Griekwastad, Douglas, Hopetown, Postmasburg, Kuruman, Kathu, Upington and Bloemfontein. An unknown location falls back to Kimberley with a warning.

## The three styles

### 1. Callbacks (`callbackVersion.ts`)
`getJSONCallback` wraps `https.get`. It collects the response chunks, checks the status code, parses the JSON and reports back through an `(error, data)` callback. Weather and news are fetched one after the other by nesting the callbacks, which shows **callback hell**: the code drifts to the right and every level needs its own error check.

### 2. Promises (`promiseVersion.ts`)
`getJSON` returns a Promise (the callback helper wrapped in `new Promise`). The nested pyramid becomes a flat chain with one `.catch()`.

- **`Promise.all()`** runs weather and news at the same time and waits for both.
- **`Promise.race()`** returns whichever request finishes first.

### 3. Async/await (`asyncAwaitVersion.ts`)
The same promise functions, written so they read top to bottom. `await` pauses the function (not the whole program) until the promise settles, and `try...catch` handles errors. It also uses `await Promise.all(...)` for the parallel case and `await Promise.race(...)` for the fastest-wins case.

## Error handling

All three versions use the same `formatError()` helper, so errors look identical:

```
❌ Error: News request failed (status 404)
```

Handled cases:

- network failures (for example no internet or an unknown host)
- non-200 status codes
- invalid JSON
- requests that take longer than 10 seconds

To demonstrate this, set the `TEST_ERROR` environment variable (PowerShell):

```powershell
$env:TEST_ERROR="status"    # 404 from the news API
$env:TEST_ERROR="json"      # response that is not JSON
$env:TEST_ERROR="network"   # host that does not exist
npm run async
Remove-Item Env:TEST_ERROR
```

## Sample output

### Callback version
``

> node-async-weather@1.0.0 callback
> tsx src/callbackVersion.ts

Fetching weather...
🌤  Weather in Kimberley
   Temperature: 23.1°C
   Wind speed:  8.4 km/h

Fetching news...
📰 Latest headlines
   1. His mother had always taught him
   2. He was an expert but not in a discipline
   3. Dave watched as the forest burned up on the hill.
   4. All he wanted was a candy bar.
   5. Hopes and dreams were dashed that day.

✅ Done (weather -> news, nested callbacks)

### Promise version
```

> node-async-weather@1.0.0 promise
> tsx src/promiseVersion.ts

Location: Kimberley

=== 1) Promise chain (weather -> news) ===
🌤  Weather in Kimberley
   Temperature: 23.1°C
   Wind speed:  8.4 km/h
📰 Latest headlines
   1. His mother had always taught him
   2. He was an expert but not in a discipline
   3. Dave watched as the forest burned up on the hill.
   4. All he wanted was a candy bar.
   5. Hopes and dreams were dashed that day.

=== 2) Promise.all (parallel, wait for both) ===
🌤  Weather in Kimberley
   Temperature: 23.1°C
   Wind speed:  8.4 km/h
📰 Latest headlines
   1. His mother had always taught him
   2. He was an expert but not in a discipline
   3. Dave watched as the forest burned up on the hill.
   4. All he wanted was a candy bar.
   5. Hopes and dreams were dashed that day.
⏱  Both finished in 217ms

=== 3) Promise.race (fastest wins) ===
🏁 Fastest: News in 304ms


### Async/await version
```

> node-async-weather@1.0.0 async
> tsx src/asyncAwaitVersion.ts

Location: Kimberley

=== 1) Async/await (sequential: weather -> news) ===
🌤  Weather in Kimberley
   Temperature: 23.1°C
   Wind speed:  8.7 km/h
📰 Latest headlines
   1. His mother had always taught him
   2. He was an expert but not in a discipline
   3. Dave watched as the forest burned up on the hill.
   4. All he wanted was a candy bar.
   5. Hopes and dreams were dashed that day.

=== 2) Async/await + Promise.all (parallel) ===
🌤  Weather in Kimberley
   Temperature: 23.1°C
   Wind speed:  8.7 km/h
📰 Latest headlines
   1. His mother had always taught him
   2. He was an expert but not in a discipline
   3. Dave watched as the forest burned up on the hill.
   4. All he wanted was a candy bar.
   5. Hopes and dreams were dashed that day.
⏱  Both finished in 264ms

=== 3) Async/await + Promise.race (fastest wins) ===
🏁 Fastest: Weather in 249ms
PS C:\Users\Admin\Documents\node-async-weather> 

### Error example
```
 
> node-async-weather@1.0.0 callback
> tsx src/callbackVersion.ts

Fetching weather...
🌤  Weather in Kimberley
   Temperature: 23.1°C
   Wind speed:  8.7 km/h

Fetching news...
❌ Error: News request failed (status 404)


## What I learned

- **Node does not wait for slow work.** `https.get` starts the request and returns immediately. The event loop runs other code and calls back when the response arrives, so output follows the order things finish, not the order of the lines.
- **Callback hell:** dependent calls have to be nested, so the code gets deeper and error handling is repeated at each level.
- **Promises** flatten the nesting into a chain, with one `.catch()` for the whole chain.
- **Async/await** is promise-based code that reads like synchronous code, and `try...catch` feels familiar.
- **Promisifying:** a callback API can be wrapped in a Promise, which is how `getJSON` is built on `getJSONCallback`.
- **`Promise.all` vs sequential:** running requests in parallel takes about as long as the slowest one, instead of the sum of both.
- **`Promise.all` fails fast:** if one request fails, the whole thing rejects and the other result is lost.
- **`Promise.race`:** the first request to settle wins, even if it is a failure, and the slower request still completes in the background.

