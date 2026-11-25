/**
 * Structure of the DMV services hub: ordered groups, their tiles and the
 * official dmv.ca.gov page each tile opens. The copy (title, text, keywords)
 * lives in messages under `DmvServices.tiles.<id>`.
 */
export type DmvServiceGroup = {
  id: string;
  tiles: { id: string; url: string }[];
};

const BASE = "https://www.dmv.ca.gov/portal";

// TODO(spec): confirm deep links. Tiles point at section pages that are known
// to exist rather than at guessed deep paths.
const PORTAL = `${BASE}/`;
const LICENSES = `${BASE}/driver-licenses-identification-cards/`;
const REAL_ID = `${BASE}/driver-licenses-identification-cards/real-id/`;
const VEHICLES = `${BASE}/vehicle-registration/`;

export const DMV_SERVICE_GROUPS: readonly DmvServiceGroup[] = [
  {
    id: "moving",
    tiles: [
      { id: "new-resident-license", url: LICENSES },
      { id: "new-resident-vehicle", url: VEHICLES },
      { id: "change-address", url: PORTAL },
    ],
  },
  {
    id: "renewals",
    tiles: [
      { id: "renew-license", url: LICENSES },
      { id: "renew-registration", url: VEHICLES },
      { id: "renew-id-card", url: LICENSES },
      { id: "make-appointment", url: PORTAL },
    ],
  },
  {
    id: "real-id",
    tiles: [
      { id: "real-id-overview", url: REAL_ID },
      { id: "real-id-documents", url: REAL_ID },
      { id: "real-id-apply", url: REAL_ID },
    ],
  },
  {
    id: "vehicles",
    tiles: [
      { id: "buy-vehicle", url: VEHICLES },
      { id: "sell-vehicle", url: VEHICLES },
      { id: "transfer-title", url: VEHICLES },
      { id: "register-new-vehicle", url: VEHICLES },
    ],
  },
  {
    id: "replace",
    tiles: [
      { id: "replace-license", url: LICENSES },
      { id: "replace-registration", url: VEHICLES },
      { id: "replace-title", url: VEHICLES },
      { id: "name-change", url: LICENSES },
    ],
  },
  {
    id: "status-pay",
    tiles: [
      { id: "check-status", url: PORTAL },
      { id: "pay-fees", url: PORTAL },
      { id: "driver-record", url: LICENSES },
    ],
  },
];
