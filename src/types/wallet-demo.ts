// Demo/live behaviour: Shared types for wallet sandbox flows; update alongside live implementations.
export type WalletMode = "demo" | "live";

export interface DemoTipPayload {
  address: string;
  amount: number;
  token: string;
  chain: string;
  postId: string;
  ts: string;
  note?: string;
}

export interface DemoTipRecord extends DemoTipPayload {
  txHash: string;
  demo: true;
}

export interface DemoTipResponse {
  ok: true;
  txHash: string;
  record: DemoTipRecord;
}

export interface HumanityAttestResponse {
  ok: true;
  attestationCount: number;
  score: number;
  receipt: Record<string, unknown>;
}
