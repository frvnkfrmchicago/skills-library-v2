# GrazzHopper Influencer Ops Framing

Session-derived reference for future GrazzHopper cannabis influencer planning.

## Correct model

Do **not** describe GrazzHopper as `consumer vs creative` where creative is a separate public experience. Frank corrected this framing.

Use this model instead:

```txt
Public consumer app = everyone participates
Creator tools = approved creators / influencers get extra capabilities
Internal influencer ops = GrazzHopper staff manages cannabis creators behind the scenes
```

A cannabis influencer is still a consumer in the public app. They get elevated-account tools and internal management.

## Product layers

```txt
GrazzHopper public app
├─ Consumer layer
│  ├─ Feed
│  ├─ Explore
│  ├─ Strains
│  ├─ Learn
│  ├─ Shop
│  ├─ Dispensaries
│  ├─ Experience Rooms
│  └─ Profiles
├─ Creator tool layer
│  ├─ /host
│  ├─ /host/content
│  ├─ /host/live
│  ├─ /host/live/create
│  ├─ /host/calendar
│  ├─ /host/audience
│  ├─ /host/analytics
│  ├─ /host/media-kit
│  ├─ /host/collab
│  ├─ /host/payouts
│  ├─ /host/rooms
│  ├─ /host/recordings
│  └─ /host/strain-templates
└─ Internal influencer ops layer
   ├─ Creator registry
   ├─ Application and approval queue
   ├─ Compliance review
   ├─ Campaign assignments
   ├─ Sponsored content disclosure checks
   ├─ Payout status
   ├─ Performance metrics
   ├─ Strike / risk log
   └─ Content calendar / publishing ops
```

## Planning rule

If asked for a SAD, research, route plan, or multi-agent orchestration plan around creators, hosts, or influencers:

1. State the model plainly first.
2. Separate public consumer surfaces from creator tools and internal staff ops.
3. Tie recommendations to code evidence.
4. Include citations, not just a source list.
5. Protect internal influencer ops from public navigation.
6. Decide whether staff operations belong in the standalone Content Hub, protected platform admin routes, or both.

## Required citation classes

Use current sources where possible, but these classes are durable:

- FTC social media influencer disclosure guidance: disclosures must be clear, hard to miss, and close to the endorsement. Live streams need repeated disclosure.
- FTC endorsement guidance: endorsements must be honest, not misleading, and cannot make claims the marketer could not legally make.
- FDA cannabis/CBD guidance: cannabis-derived product and health claims are regulatory risk.
- State cannabis regulator context: cannabis businesses operate under strict state and local rules.
- Creator platform patterns: Instagram Creators and Twitch Creator Camp organize creator tooling around create, grow, monetize, safety, going live, community, copyright, and sponsorships.
- Cannabis consumer patterns: Leafly and Jane connect consumer discovery to strains, local availability, shopping, products, brands, dispensaries, age gates, and community.

## Entity model starter

```txt
InfluencerProfile
├─ id
├─ user_id
├─ handle
├─ legal_name_private
├─ public_display_name
├─ age_verified
├─ state_market
├─ primary_habitat
├─ content_categories
├─ approval_status: applied | review | approved | restricted | rejected
├─ risk_level
├─ compliance_notes
├─ audience_metrics
├─ payout_status
└─ created_at / updated_at
```

```txt
InfluencerCampaign
├─ id
├─ sponsor_business_id
├─ influencer_id
├─ campaign_type: post | live_room | strain_template | event | review
├─ target_url_or_entity
├─ disclosure_required
├─ disclosure_text
├─ jurisdiction_scope
├─ approval_status
├─ publish_window
├─ performance_metrics
├─ payout_amount
└─ payout_status
```

## Common seam checks

When reviewing the platform, check:

- Creator application CTAs should not send users to business onboarding.
- Creator/host role mapping should be explicit, not silently collapsed into consumer flow.
- `/host/*` should read like a creator toolbench, not a second public home.
- Public influencer content can appear in feed, explore, rooms, profiles, strain pages, and shop-adjacent moments.
- Public components must not expose staff notes, approval state, private legal names, payout details, risk scores, or internal campaign details.
- Sponsored public content needs disclosure text and compliance state before promotion.

## Better language

Use:

- `creator tools`
- `approved influencer`
- `host studio`
- `creator application`
- `internal influencer ops`
- `campaign review`
- `disclosure/compliance review`

Avoid:

- `consumer vs creative` as a product split
- `creative is a separate consumer world`
- `creative home replaces consumer home`
- public nav that exposes internal ops concepts
