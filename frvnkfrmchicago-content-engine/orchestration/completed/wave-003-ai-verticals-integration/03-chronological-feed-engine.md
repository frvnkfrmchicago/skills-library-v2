# Lane 3 Completion Evidence: Chronological Feed Engine

## Explainer
We replaced the randomized engagement score/comments in `loadTrending()` inside `app/src/trending.js` with stable, deterministic metrics derived from a stable hash of the article URL and title. We also implemented a time-decay algorithm using hours elapsed since publication date, meaning hot news rises to the top and decays naturally. Finally, we added `formatPublishDate()` to display absolute dates and relative times inline on post cards.

## TL;DR
Implemented deterministic URL hashing, time-decay gravity ranking, and absolute+relative date formats.

## Verification Details
- **File modified**: `app/src/trending.js` (lines 89-112, 134-155, 399-404)
- **Gaps**: None. Sorting is now completely stable across page loads.
