# Leaderboard Audit Checklist

Use when reviewing any social platform leaderboard for copy, categorization, and design issues.

## 1. Category Naming Audit

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| Every category name is domain-native (community vocabulary) | | |
| No generic names ("Engagement", "Signal", "Score") | | |
| Names pass "would a user say this out loud" test | | |
| Max 3 words per category name | | |
| No TBD/placeholder categories showing as live | | |

## 2. Handle Attribution Audit

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| @handle appears inline with display name | | |
| @handle is the primary attributed identifier | | |
| @handle not buried in smaller secondary text row | | |
| Click/tap on user row navigates to correct profile | | |

## 3. Categorization Architecture Audit

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| Categories grouped into 3-4 dimensional clusters | | |
| Group names are domain-native | | |
| Flat list not exceeding 5 ungrouped tabs | | |
| Sub-routes exist for scope views (habitat, region, category) | | |
| Filter state persists across navigation | | |

## 4. Copy & Voice Audit

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| Masthead copy uses community voice (not corporate) | | |
| Scope labels match platform culture | | |
| Empty states are domain-appropriate | | |
| Metric previews use community vocabulary | | |
| No banned words (from copywriting-enforcing skill) | | |
| Habitat/tier names and descriptions match domain | | |

## 5. Design Token Audit

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| Zero raw hex/rgba values in leaderboard components | | |
| Opacity values use systematic scale (not random floats) | | |
| Elevation/shadow depth consistent across podium + rows | | |
| All colors reference design tokens | | |

## 6. Scoring Audit

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| Every live category has a working scoring function | | |
| No TBD scoring logic in production | | |
| Score weights are documented and configurable | | |
| Overall score formula is transparent to users | | |

## Example: Cannabis Social Platform Renames

| Generic | Cannabis-Native | Rationale |
|---------|----------------|-----------|
| Higher Connect | Plug In | "Plug" is industry slang for connection |
| Habitat Engagement | Loud in the Habitat | "Loud" = high quality, also means vocal |
| Profile Visits | Stopped By | Casual, how people actually talk |
| Canna Influencer | Strain Maker | Cannabis culture — makes waves |
| Top Buys | Bag Talk | "Bag" = purchase amount |
| Reviews | Notes | Like tasting notes — connoisseur language |
| Top Listeners | In the Room | Audio presence |
| Float (TBD) | REMOVE | Never ship TBD categories |
| Most Live | On Air | Broadcasting — universal and clean |
