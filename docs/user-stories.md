# User stories

Status: `todo` · `doing` · `done`. Each story lists acceptance criteria (AC) that are
checked in the browser and, where they are rules, in unit tests. A story is `done` only
after the browser check (CLAUDE.md §7); `doing` with green tests means that check is pending.

## Epic 1 — Shooting

### US-01 Aim and shoot — `done`

As a player, I want to pull back from the ball and release, so that I can shoot with the
power and direction I choose.

- AC1: Pressing anywhere and dragging shows the shot direction (opposite to the drag) and its power. Anywhere, not only on the ball, so a finger never hides what it aims.
- AC2: Power grows with drag distance up to a maximum; dragging further does not add power.
- AC3: Releasing launches the ball and adds one stroke.
- AC4: A drag shorter than a minimum distance cancels the shot and adds no stroke.
- AC5: Works with mouse and with touch.

### US-02 Trajectory preview — `done`

As a player, I want to see where the first part of my shot will go, so that aiming is a
skill and not a guess.

- AC1: While aiming, a dotted line shows the predicted path including gravity.
- AC2: The preview is limited in length, so long orbits still require judgement.
- AC3: The preview matches the real flight exactly for its length (same simulation).

## Epic 2 — Physics

### US-03 Gravity — `done`

As a player, I want planets to pull the ball, so that I can curve shots around them.

- AC1: Each planet attracts the ball with a force that grows with its mass and falls with distance.
- AC2: The black hole also attracts the ball.
- AC3: The simulation is deterministic: the same shot from the same position always ends the same way.

### US-04 Landing on planets — `done`

As a player, I want the ball to bounce on planets and come to rest, so that I can shoot again from there.

- AC1: The ball never passes through a planet.
- AC2: It bounces, losing energy on each bounce, and slides with friction.
- AC3: When it is almost still, it stops and the next shot can be taken from there.

### US-05 Lost balls — `doing`

As a player, I want a lost ball to come back, so that one bad shot does not end the level.

- AC1: A ball that leaves the play area returns to where the shot was taken, with a one-stroke penalty.
- AC2: A ball still flying after a time limit (stuck in orbit) is treated the same way.
- AC3: A message tells the player what happened.

## Epic 3 — Goal and scoring

### US-06 Sinking the ball — `doing`

As a player, I want the black hole to swallow the ball, so that I finish the level.

- AC1: The ball is captured when it is inside the event horizon.
- AC2: The ball spirals in with an animation before the result appears.
- AC3: The result shows strokes, par and stars.

### US-07 Par and stars — `doing`

As a player, I want a score that rewards good play, so that I want to replay levels.

- AC1: 3 stars at or under par, 2 stars at par + 1 or + 2, 1 star otherwise.
- AC2: The best result per level is saved in the browser and shown in level select.

## Epic 4 — Levels and navigation

### US-08 Level select — `doing`

As a player, I want to choose a level, so that I can replay or continue.

- AC1: Shows all levels with their best stars.
- AC2: A level unlocks when the previous one is completed.
- AC3: From a finished level I can retry or go to the next one.

### US-09 Ten levels — `doing`

As a player, I want levels that teach and then challenge, so that the game has a curve.

- AC1: Level 1 needs no gravity trick; later levels introduce obstacles, curved shots, heavy wells, gaps and slingshots one idea at a time.
- AC2: Every level is solvable, proven by an automated test that finds a shot sequence within par.

## Backlog (1.1)

- US-10 Level editor with shareable link
- US-11 Sound effects
- US-12 Moons that orbit planets
