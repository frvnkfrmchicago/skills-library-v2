# Wave 02: Evidence Contract

To close Wave 02, the following functional requirements must be fully integrated, verified, and checked:

| Target Component | Required Evidence | Verification Method |
|---|---|---|
| **Animation Grid Slicing** | `AnimatedSprite.tsx` renders Leo and all roster fighters with uniform scale, slicing a strict `4x4` sheet layout. | Visual frame sanity: characters maintain perfect proportion during idle/attack states. |
| **Physical Parity** | `Player.tsx` and `Enemy.tsx` models are scaled to identical physical bounding ratios (capsule size, height, plane height). | Collision bounding overlaps under contact do not cause mesh size fluctuations. |
| **Superpower Engine** | Fireball projectiles are spawned when special energy is consumed. They act as sensor bodies, flying straight, and triggering recoil. | Play test casting of fireballs and matching health bar drops. |
| **Block & Engagement** | Blocking state blocks or reduces damage, disabling hitstun. Hit-stops (freeze frame) and camera shake activate. | Collision checks correctly detect matching input state. |
| **Liquid Glass Select Menu** | Bento select cards load at start, display stats, and set Player & Enemy characters from `ROSTER`. | Launch app: selection menu displays immediately, and starts gameplay upon confirm. |
