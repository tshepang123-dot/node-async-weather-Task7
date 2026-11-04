Topic: NodeTS <br />
Submission Date: 05 November 2026 <br />
Time: 09:00 AM


Please submit by pushing to your GitHub repository and creating a pull request to your mentor

# Title: Task 7 - Async Weather & News Dashboard

## Project Overview
You are tasked to build a project that demonstrates your grasp of asynchronous programming and the event loop. This app should fetch weather data and news headlines from public APIs, showcasing different asynchronous styles, namely:
Callbacks, promises, and async/await.

## Use-case Scenario
 - A user wants to see the weather in their location.
 - They also want to see the latest news headlines at the same time.
 - Data is fetched asynchronously from external APIs.
 - The app implements the same functionality using:
   - Callbacks
   - Promises
   - Async/Await (try…catch)


## Core Features
1. Fetch weather data (Open-Meteo API or any other weather API)
2. Fetch news headlines (DummyJSON Posts API or any other news API)
3. Callback-based implementation
4. Promise-based implementation
5. Async/Await implementation
6. Promise.all() → run weather + news requests simultaneously
7. Promise.race() → get the fastest response

## Task Breakdown

1. Sprint 1: Project Setup
  - Setup Node.js + TypeScript project (tsconfig.json, package.json)
  - Install dependencies
  - Create folder structure (src/ with separate files for each version)
2. Sprint 2: Callback Version
  - Create callbackVersion.ts
  - Implement fetching weather and news using https module with callbacks
  - Demonstrate "callback hell" by nesting dependent calls
3. Sprint 3: Promise Version
  - Create promiseVersion.ts
  - Chain Promises to fetch weather → news → display
  - Implement Promise.all() and Promise.race() examples
4. Sprint 4: Async/Await Version
  - Create asyncAwaitVersion.ts
  - Refactor Promise code to use async/await
  - Handle errors with try...catch
5. Sprint 5: Error Handling & Response Consistency
  - Ensure consistent error handling across all versions
  - Display errors in a readable format
6. Sprint 6: Testing & Documentation
  - Test all three versions with npm run callback, npm run promise, npm run async
  - Document usage and learning outcomes in README.md
  - Include sample console outputs for each style

## Deliverables
   1. Readme file
   2. Project
