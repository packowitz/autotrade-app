import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {Ticker} from "../domain/ticker";
import {Model} from "./model.service";
import {Depth} from "../domain/depth.model";
import {BinanceAccount} from "../domain/binanceAccount.model";
import {Plan} from "../domain/plan.model";
import {Circle} from "../../pages/circle/circle";
import {CirclePlan} from "../domain/circlePlan.model";
import {PathPlan} from "../domain/pathPlan.model";

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

  createPath(startCur: string, startAmount, destCur: string, maxSteps, autoRestart: boolean): Observable<Plan> {
    let body: any  = {
      startCurrency: startCur,
      startAmount: parseFloat(startAmount),
      destCurrency: destCur,
      maxSteps: parseInt(maxSteps),
      autoRestart: autoRestart
    };
    return this.http.post<Plan>(this.path + "/plan/path", body);
  }

  getPaths(planId: number): Observable<PathPlan[]> {
    return this.http.get<PathPlan[]>(this.path + "/plan/" + planId + "/paths");
  }

  createCircle(circle: Circle, amount: number, treshold: number, cancelOnTreshold: boolean): Observable<Plan> {
    let steps: any[] = [];
    circle.trades.forEach(t => {
      steps.push({symbol: t.ticker.symbol, side: t.isBuy ? 'buy' : 'sell', price: t.tradePoint});
    });
    let body: any = {
      startCurrency: circle.baseCur,
      startAmount: amount,
      risk: circle.riskLevel.toUpperCase(),
      treshold: treshold,
      cancelOnTreshold: cancelOnTreshold,
      steps: steps
    };
    return this.http.post<Plan>(this.path + "/plan/circle", body);
  }

  getPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(this.path + "/plans");
  }

  cancelPlan(planId: number): Observable<Plan> {
    return this.http.get<Plan>(this.path + "/plan/" + planId + "/cancel");
  }

  getCircles(planId: number): Observable<CirclePlan[]> {
    return this.http.get<CirclePlan[]>(this.path + "/plan/" + planId + "/circles");
  }
}
