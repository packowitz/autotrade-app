import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {Ticker} from "../domain/ticker";
import {Model} from "./model.service";
import {Depth} from "../domain/depth.model";
import {BinanceAccount} from "../domain/binanceAccount.model";
import {Plan} from "../domain/plan.model";
import {PathPlan} from "../domain/pathPlan.model";
import {BinanceTrade} from "../domain/binanceTrade.model";
import {OneMarketPlan} from "../domain/oneMarketPlan.model";
import {AuditLog} from "../domain/auditLog.model";
import {PlanStep} from "../domain/planStep.model";

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

  getLatestTrades(symbol: string): Observable<BinanceTrade[]> {
    return this.http.get<BinanceTrade[]>(this.path + "/trades/" + symbol);
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

  createOneMarket(symbol: string, minProfit: number, startCurrency: string, startAmount: number, autoRestart: boolean): Observable<Plan> {
    let body: any = {
      symbol: symbol,
      minProfit: minProfit,
      startCurrency: startCurrency,
      startAmount: startAmount,
      autoRestart: autoRestart
    };
    return this.http.post<Plan>(this.path + "/plan/onemarket", body);
  }

  getOneMarket(planId: number): Observable<OneMarketPlan> {
    return this.http.get<OneMarketPlan>(this.path + "/plan/" + planId + "/onemarket");
  }

  setAutoRestart(planId: number, autoRestart: boolean): Observable<any> {
    return this.http.put<any>(this.path + "/plan/" + planId + "/autorepeat/" + autoRestart, {});
  }

  getPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(this.path + "/plans");
  }

  cancelPlan(planId: number): Observable<Plan> {
    return this.http.get<Plan>(this.path + "/plan/" + planId + "/cancel");
  }

  deletePlan(planId: number): Observable<any> {
    return this.http.delete<any>(this.path + "/plan/" + planId);
  }

  getAuditLogs(stepId: number): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(this.path + "/step/" + stepId + "/logs");
  }

  removeThreshold(planId: number, stepId: number): Observable<PlanStep> {
    return this.http.post<PlanStep>(this.path + "/plan/" + planId + "/step/" + stepId + "/removeThreshold", {});
  }
}
