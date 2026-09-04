# Shio

[![CI](https://github.com/BrendanBuono/Shio/actions/workflows/ci.yml/badge.svg)](https://github.com/BrendanBuono/Shio/actions/workflows/ci.yml)

Shio is a small 2D HTML5 game engine written from scratch as a learning exercise. It started in 2015 as a Grunt and Browserify project and was revived in 2026 on Vite, TypeScript and Vitest.

What it currently does: a fixed-timestep game loop, a component system on game objects, keyboard input with held-key tracking, a queued event manager with a time budget, simple gravity and floor physics, sprite sheets with frame animation loaded from a JSON game description, box collision with solid resolution and collision events, and a small demo: a pixel-art hero who can jump onto crates, and a patrolling slime that can be stomped from above but kills the hero from the side.

## Running it

```
npm install
npm run dev
```

Open the URL Vite prints. Arrow keys walk, Up or Space jumps, Escape pauses. Land on the slime to squash it; touch it any other way and you respawn. The running game is exposed as `window.shio` for poking at from the console.

Other scripts:

| Script | What it does |
| --- | --- |
| `npm test` | Runs the unit tests once with Vitest |
| `npm run test:watch` | Runs the tests in watch mode |
| `npm run typecheck` | Type-checks with `tsc --noEmit` |
| `npm run build` | Produces a static site in `dist/` |
| `npm run sprites` | Regenerates the placeholder sprite sheets from `scripts/make-placeholder-sprites.mjs` |
| `npm run check` | Typecheck, test and build, which is what CI runs |

## Layout

```
public/game/
  game.json                   Sprite sheets, frame sizes and animations
  sprites/*.png               Generated placeholder art
scripts/
  make-placeholder-sprites.mjs  Text-grid pixel art to PNG, no image editor needed
src/
  main.ts                     Loads game.json and builds the demo scene
  core/
    Game.ts                   Canvas, objects, input, events, ground height and the loop
    GameLoop.ts               Fixed-timestep loop with render interpolation
    GameObject.ts             Position, velocity and a list of components
    Box.ts                    A drawable rectangle
    Label.ts                  A line of live text
    TiledGround.ts            Repeats a tile along the floor and fills below it
    KeyboardInput.ts          Held, pressed and released key state
    ResourceLoader.ts         JSON, image and whole-game loading
  components/
    PhysicsComponent.ts       Gravity, floor and walls
    PlayerInputComponent.ts   Walk and jump from the keyboard
    PlayerRulesComponent.ts   Stomp enemies from above, die from the side
    EnemyComponent.ts         Patrol, turn at edges and obstacles, squash and expire
    SpriteComponent.ts        Named animation states, facing, scaled drawing
  events/
    EventManager.ts           Register, fire and queue events
    EventType.ts, Event.ts, GamePausedEvent.ts
    CollisionEvent.ts         Who touched whom, on which side
    ActorEvents.ts            ActorCreated, ActorDestroyed, PlayerDied, PlayerRespawn
  graphics/
    SpriteSheet.ts            Frame grid over one image, scaled and flipped drawing
    Animation.ts              Plays a frame list at a rate
    GameDefinition.ts         Validates game.json
  physics/
    Vector2.ts
    Aabb.ts                   Rectangle overlap and minimum separation
    CollisionSystem.ts        Pushes solid pairs apart and fires collision events
  utility/Queue.ts, uuid.ts
```

Tests live next to the code they test as `*.test.ts`.

## How the pieces fit

The loop calls `Game.step` a fixed number of times per frame to catch up with real time, then calls `Game.render` once. Each step checks for a pause key, drains queued events, and updates every object unless the game is paused. Each object runs its components in order, so the player input component sets velocity from the keys currently held, and the physics component then integrates velocity into position and resolves the floor and walls.

Rendering interpolates between an object's previous and current positions so movement stays smooth when the frame rate and simulation rate differ. See [Fix Your Timestep](https://gafferongames.com/post/fix_your_timestep/) for the reasoning.

After every object has moved, the collision system checks each pair of objects that have a collider. Overlapping solids are pushed apart along the axis of least penetration, a static solid never moves, and an object pushed upward is marked grounded so it can jump off whatever it landed on. Every overlap, solid or not, fires a collision event that the game forwards to both objects' components, so a component reacts by implementing `onCollision`. That is how the enemy turns at crates and how the player rules decide between a stomp and a death. The check is discrete, so a very fast object could pass through a very thin one in a single step; nothing in the demo moves anywhere near that fast.

Objects carry a set of string tags such as `player`, `enemy` or `crate` so rules can tell things apart without class checks. Destroying an object is an event too: anything can queue `ActorDestroyedEvent` and the game removes the object on the next drain.

Art comes from `public/game/game.json`. Each entry names a sprite sheet image, its frame size, and optional animations as lists of frame indices at a frame rate. The resource loader validates the file and rejects it with the name of the first bad field, then loads every image in parallel. The sprite component picks idle, walk or jump from the object's motion, flips the frame when facing left, and draws it scaled with image smoothing off so pixels stay crisp.

## Adding art

Edit the text grids in `scripts/make-placeholder-sprites.mjs` and run `npm run sprites`, or drop your own PNG sheets into `public/game/sprites/` and describe them in `game.json`. Frames are indexed left to right, then top to bottom.

## Not done yet

There is no camera, no audio, no level format beyond hand-placing objects in `main.ts`, and no way to lose or win.
