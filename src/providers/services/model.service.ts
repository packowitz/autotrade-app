import {Injectable} from "@angular/core";
import {Ticker} from "../domain/ticker";
import {User} from "../domain/user.model";
import {BinanceBalance} from "../domain/binanceBalance.model";
import {Plan} from "../domain/plan.model";

@Injectable()
export class Model {
  //public server = "http://localhost:8080/trade";
  public server = "https://api.askthepeople.io/trade";

  public user: User;
  public binanceAccount: Account;
  public binanceBalances: BinanceBalance[] = [];
  public binancePlans: Plan[] = [];

  public baseCur: string[] = ["BNB", "BTC", "ETH", "USDT"];

  public ticker: Ticker[];
  public tickerUpdated: number;

  public setBalances(balances: BinanceBalance[]) {
    this.binanceBalances = balances;
    let usdtBtcPrice: number = parseFloat(this.getTicker("BTCUSDT").stats24h.lastPrice);
    this.binanceBalances.forEach(bal => {
      bal.total = bal.free + bal.locked;
      let ticker: Ticker = this.getTicker(bal.asset + "BTC");
      if(bal.asset == "BTC") {
        bal.totalInBtc = bal.total;
        bal.freeInBtc = bal.free;
        bal.lockedInBtc = bal.locked;
      } else {
        if(ticker) {
          let price: number = parseFloat(ticker.stats24h.lastPrice);
          bal.totalInBtc = bal.total * price;
          bal.freeInBtc = bal.free * price;
          bal.lockedInBtc = bal.locked * price;
        } else {
          ticker = this.getTicker("BTC" + bal.asset);
          if(ticker) {
            let price: number = parseFloat(ticker.stats24h.lastPrice);
            bal.totalInBtc = bal.total / price;
            bal.freeInBtc = bal.free / price;
            bal.lockedInBtc = bal.locked / price;
          }
        }
      }
      bal.totalInUsdt = bal.totalInBtc * usdtBtcPrice;
      bal.freeInUsdt = bal.freeInBtc * usdtBtcPrice;
      bal.lockedInUsdt = bal.lockedInBtc * usdtBtcPrice;
    });
  }

  public getTicker(symbol: string): Ticker {
    return this.ticker.find(t => t.symbol == symbol);
  }
}
