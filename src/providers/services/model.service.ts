import {Injectable} from "@angular/core";
import {Ticker} from "../domain/ticker";
import {User} from "../domain/user.model";
import {BinanceBalance} from "../domain/binanceBalance.model";
import {Plan} from "../domain/plan.model";

@Injectable()
export class Model {
  public server = "http://localhost:8080/trade";
  //public server = "https://api.askthepeople.io/trade";

  public user: User;
  public binanceAccount: Account;
  public binanceBalances: BinanceBalance[] = [];
  public binancePlans: Plan[] = [];

  public baseCur: string[] = ["BNB", "BTC", "ETH", "USDT"];

  public ticker: Ticker[];
  public tickerUpdated: number;
}
