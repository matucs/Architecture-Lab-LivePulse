// Every link generated from this file points at a real, existing path in
// github.com/matucs/LivePulse at the commit this Lab was built against.
// Never hand-construct a LivePulse URL anywhere else in this app.
export const LIVEPULSE_REPO = "https://github.com/matucs/LivePulse";
export const LIVEPULSE_COMMIT = "a72e618998b3d947609febb9436f7674d00b25a8";
export const LIVEPULSE_LIVE_URL = "https://livepulse-ten.vercel.app";
export const LIVEPULSE_OPS_URL = "https://livepulse-ten.vercel.app/ops";

// A separate, real companion project: an actual 2-instance WebSocket
// fan-out load test run against LivePulse's own (unmodified) backend code.
// Not part of LivePulse itself — linked here because its results back a
// "measured" claim in this Lab's Scaling section.
export const SCALING_DEMO_REPO = "https://github.com/matucs/scaling-demo-LivePulse";

export function repoFile(path: string): string {
  return `${LIVEPULSE_REPO}/blob/main/${path}`;
}

export function repoDir(path: string): string {
  return `${LIVEPULSE_REPO}/tree/main/${path}`;
}

export function repoCommit(sha: string): string {
  return `${LIVEPULSE_REPO}/commit/${sha}`;
}
