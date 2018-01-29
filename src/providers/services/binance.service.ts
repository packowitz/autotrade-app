import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {Ticker} from "../domain/ticker";
import {Model} from "./model.service";
import {Depth} from "../domain/depth.model";
import {BinanceAccount} from "../domain/binanceAccount.model";

@Injectable()
export class BinanceService {

  path: string;

  constructor(public model: Model, public http: HttpClient) {
    this.path = this.model.server + "/app/binance"
  }

  getAllBookTickers(): Observable<Ticker[]> {
    return this.http.get<Ticker[]>(this.path + "/ticker");
  }

  getDepth(symbol: string): Observable<Depth> {
    return this.http.get<Depth>(this.path + "/depth/" + symbol);
  }

  getAccount(): Observable<BinanceAccount> {
    return this.http.get<BinanceAccount>(this.path + "/account");
  }
}
