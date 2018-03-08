export class BinanceBalance {
  asset: string;
  free: number;
  locked: number;

  //view related fields
  total: number;
  totalInBtc: number;
  freeInBtc: number;
  lockedInBtc: number;
  totalInUsdt: number;
  freeInUsdt: number;
  lockedInUsdt: number;
}
