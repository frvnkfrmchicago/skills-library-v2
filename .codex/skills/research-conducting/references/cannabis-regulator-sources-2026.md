# US Cannabis Regulator Open-Data Sources (2026)

Condensed from GrazzHopper Landing codebase research, June 2026.
Each entry: jurisdiction, regulator, source URL, data format, and notes.

## Data Format Legend

| Kind | Adapter | Notes |
|------|---------|-------|
| `json` | REST JSON API | Paginated or single-request |
| `arcgis` | ArcGIS FeatureServer | Query via REST API, often filtered |
| `csv` | CSV/XLSX download | Convert to CSV, load from file |
| `socrata` | Socrata SODA API | JSON via Socrata open-data portal |
| `html` | HTML portal scrape | No machine-readable feed, manual or scrape |
| `pending` | None yet | Registered in catalog but no rows ingested |

## States with Verified Machine-Readable Feeds

| State | Regulator | Source URL | Kind | Est. Rows | Notes |
|-------|-----------|-----------|------|-----------|-------|
| **CA** | DCC | `https://as-dcc-pub-cann-w-p-002.azurewebsites.net/licenses/RetailerLocationSearch?...&pageSize=5000` | `json` | ~1,857 retailers | Azure-hosted DCC API. Retailers only. Cultivators need separate DCC endpoint. |
| **CO** | MED | `https://sbg.colorado.gov/med/licensed-facilities` → Stores.xlsx | `csv` | ~943 | Download xlsx, convert to CSV. 276 medical + 667 retail. Updated monthly. |
| **NY** | OCM | `https://services8.arcgis.com/CsL4l0ex90otnsI9/arcgis/rest/services/ActiveLicensesV1/FeatureServer/0` | `arcgis` | ~662 open dispensaries | Filter: `Retail_Date_Opened_to_Public IS NOT NULL`. Geocoded. Has Entity_Name + DBA. |
| **NJ** | CRC | `https://www.nj.gov/cannabis/dispensaries/find/` | `html` (load-nj-find) | ~311 | Loaded from verbatim official find-list. No Socrata JSON (404). |
| **MI** | CRA | `https://www.michigan.gov/cra/verify-a-license` | None verified | ~562 | Third-party greentripz data used temporarily. Names don't match CRA portal. Replace with official. |

## States with Known Regulator Portals (No Feed Confirmed Yet)

| State | Regulator | Portal URL | Program | Notes |
|-------|-----------|-----------|---------|-------|
| **AK** | AMCO | `https://www.commerce.alaska.gov/web/amco` | Rec | State-specific license pack. Check for public license search. |
| **AZ** | ADHS | `https://www.azdhs.gov/licensing/medical-marijuana/` | Rec | State-specific. Has dispensary agent registry. Check for establishment list. |
| **CT** | DCP | `https://portal.ct.gov/cannabis` | Rec | State-specific. Social equity focus. |
| **DE** | DHSS/OMC | `https://omc.delaware.gov/` | Rec | State-specific. New program, limited licensees. |
| **DC** | ABCA | `https://abca.dc.gov/page/medical-cannabis-program` | Rec | Fallback. Congressional block on commercial sales. |
| **FL** | OMMU | `https://knowthefactsmmj.com/` | Med | Fallback. Medical Marijuana Treatment Center licenses. |
| **IL** | DFPR | `https://idfpr.illinois.gov/profs/adultusecan.html` | Rec | **PRIORITY**. Social equity lotteries. Large market. |
| **MA** | CCC | `https://masscannabiscontrol.com/` | Rec | State-specific. Has CCCL public data. Check for API. |
| **MD** | Cannabis Admin | `https://cannabis.maryland.gov/` | Rec | State-specific. New adult-use market. |
| **ME** | OMP | `https://www.maine.gov/dafs/ocp` | Rec | State-specific. |
| **MI** | CRA | `https://www.michigan.gov/cra` | Rec | State-specific. Need OFFICIAL source to replace greentripz. |
| **MN** | OCM | `https://cannabis.mn.gov/` | Rec | Fallback. Very new program (2024-2025). |
| **MO** | DCR | `https://health.mo.gov/safety/cannabis/` | Rec | Fallback. |
| **MT** | DoR | `https://mtrevenue.gov/cannabis/` | Rec | Fallback. |
| **NV** | CCB | `https://ccb.nv.gov/` | Rec | Fallback. |
| **NM** | CCD | `https://www.rld.nm.gov/cannabis/` | Rec | Fallback. |
| **OH** | DCC | `https://codes.ohio.gov/ohio-revised-code/chapter-3780` | Rec | Fallback. New adult-use (2024). |
| **OR** | OLCC | `https://www.oregon.gov/olcc/marijuana` | Rec | State-specific. Check for license search API. |
| **WA** | LCB | `https://lcb.wa.gov/` | Rec | State-specific. Check for license data. |

## Medical-Only States

| State | Regulator | Portal URL | Notes |
|-------|-----------|-----------|-------|
| **AL** | AMCC | `https://amcc.alabama.gov/` | New program, limited licenses. |
| **AR** | DFA/MMC | `https://www.dfa.arkansas.gov/office/medical-marijuana-commission/` | |
| **HI** | DOH | `https://health.hawaii.gov/medicalcannabis/` | |
| **KY** | DoA | `https://kymedcan.ky.gov/` | Very new (2025). |
| **LA** | DoA&F | `https://www.ldh.la.gov/page/medical-marijuana` | |
| **MS** | DoH | `https://www.mmcp.ms.gov/` | |
| **ND** | DoH | `https://www.hhs.nd.gov/mm` | |
| **NH** | DHHS | `https://www.dhhs.nh.gov/...` | 403 on probe. |
| **OK** | OMMA | `https://oklahoma.gov/omma.html` | Large medical market (~7,000+ licenses). |
| **PA** | DoH | `https://www.health.pa.gov/topics/programs/medical-marijuana/` | |
| **SD** | DoH | `https://medcannabis.sd.gov/` | |
| **UT** | DHHS | `https://medicalcannabis.utah.gov/` | Pharmacy (dispensary) model. |
| **VT** | CCB | `https://ccb.vermont.gov/` | 403 on probe. |
| **VA** | CCA | `https://cca.virginia.gov/` | State-specific. |
| **WV** | OMC | `https://omc.wv.gov/` | |

## Source-Finding Strategy

1. **Check Socrata/open data portals first** — many states publish via Socrata (data.ny.gov, data.ct.gov). Append `.json?$limit=50000` to dataset URLs.
2. **Check ArcGIS FeatureServer** — regulators using Esri often have public REST endpoints. Look for `/arcgis/rest/services/` in the portal.
3. **Check for CSV/XLSX downloads** — many regulators publish "Licensed Facilities" spreadsheets.
4. **Use the regulator's license verification tool** — if there's a public search, it often hits a JSON API behind the scenes. Inspect network requests.
5. **Last resort: manual registry** — scrape or manually compile from HTML directory, save as `data/manual-registry/<ST>.json`.

## GrazzHopper Ingest Architecture Reference

The GrazzHopper Landing codebase at `~/Documents/GrazzHopper Dev/grazzhopper-v2/grazzhopper-landing/` uses:
- `scripts/ingest-dispensaries/sources.ts` — `SOURCE_CATALOG: SourceCatalogEntry[]` (single source of truth)
- `scripts/ingest-dispensaries/adapters/` — adapter pattern (`json`, `csv`, `arcgis`, `pending`)
- `scripts/ingest-dispensaries/ingest.ts` — runner that loops catalog, fetches, geocodes, upserts
- Target table: `gh_dispensary_directory` (keyed on `license_number`, categories: dispensary, cultivation, delivery, manufacturer, distributor, other)
- Geocoding: US Census batch geocoder (free, public domain)
- Manual fallback: `data/manual-registry/<ST>.json`

## License Type Catalog (15 types in gh_business_licenses)

`cultivator`, `manufacturer`, `distributor`, `wholesaler`, `dispensary`, `testing_lab`, `microbusiness`, `delivery`, `transporter`, `courier`, `consumption_lounge`, `event_organizer`, `nursery`, `research_facility`, `cooperative`
