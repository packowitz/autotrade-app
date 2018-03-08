import {TickerStats} from "./tickerStats.model";

export class Ticker {
  symbol: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  perc: number;
  stats24h: TickerStats;
}
