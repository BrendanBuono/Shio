# Shio

[![CI](https://github.com/BrendanBuono/Shio/actions/workflows/ci.yml/badge.svg)](https://github.com/BrendanBuono/Shio/actions/workflows/ci.yml)

Shio is a small 2D HTML5 game engine written from scratch as a learning exercise. It started in 2015 as a Grunt and Browserify project and was revived in 2026 on Vite, TypeScript and Vitest.

What it currently does: a fixed-timestep game loop, a component system on game objects, keyboard input with held-key tracking, a queued event manager with a time budget, simple gravity and floor physics, and a red box you can move and jump around the screen.

## Running it

```
npm install
npm run dev
```

Open the URL Vite prints. Arrow keys walk, Up or Space jumps, Escape pauses. The running game is exposed as `window.shio` for poking at from the console.

Other scripts:

| Script | What it does |
| --- | --- |
| `npm test` | Runs the unit tests once with Vitest |
| `npm run test:watch` | Runs the tests in watch mode |
| `npm run typecheck` | Type-checks with `tsc --noEmit` |
| `npm run build` | Produces a static site in `dist/` |
| `npm run check` | Typecheck, test and build, which is what CI runs |

## Layout

```
src/
  main.ts                     Wires a Game and a Box together
  core/
    Game.ts                   Canvas, objects, input, events and the loop
    GameLoop.ts               Fixed-timestep loop with render interpolation
    GameObject.ts             Position, velocity and a list of components
    Box.ts                    A drawable rectangle
    KeyboardInput.ts          Held, pressed and released key state
    ResourceLoader.ts         JSON and image loading
  components/
    PhysicsComponent.ts       Gravity, floor and walls
    PlayerInputComponent.ts   Walk and jump from the keyboard
  events/
    EventManager.ts           Register, fire and queue events
    EventType.ts, Event.ts, GamePausedEvent.ts
  physics/Vector2.ts
  graphics/Sprite.ts
  utility/Queue.ts, uuid.ts
```

Tests live next to the code they test as `*.test.ts`.

## How the pieces fit

The loop calls `Game.step` a fixed number of times per frame to catch up with real time, then calls `Game.render` once. Each step checks for a pause key, drains queued events, and updates every object unless the game is paused. Each object runs its components in order, so the player input component sets velocity from the keys currently held, and the physics component then integrates velocity into position and resolves the floor and walls.

Rendering interpolates between an object's previous and current positions so movement stays smooth when the frame rate and simulation rate differ. See [Fix Your Timestep](https://gafferongames.com/post/fix_your_timestep/) for the reasoning.

## Not done yet

Sprite sheets and the JSON game description are loaded but nothing draws them yet. There is no collision between objects, no camera, no audio, and only one actor.
