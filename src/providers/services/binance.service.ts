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
import {Strategy} from "../domain/strategy.model";
import {PlanConfig} from "../domain/planConfig.model";

@Injectable()
export class BinanceService {

  path: string;

  public balancesLoading: boolean = false;
  public balancesLoadingFailed: boolean = false;

  constructor(public model: Model, public http: HttpClient) {
    this.path = this.model.server + "/app/binance"
  }

  loadBalances() {
    if(!this.model.binanceAccount) {
      return;
    }
    this.balancesLoading = true;
    this.balancesLoadingFailed = false;
    this.getAccount().subscribe(
      data => {
        this.model.setBalances(data.balances);
        this.balancesLoading = false;
      }, error => {
        this.balancesLoading = false;
        this.balancesLoadingFailed = true;
      }
    );
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

  createPlan(planConfig: PlanConfig): Observable<Plan> {
    return this.http.post<Plan>(this.path + "/plan", planConfig);
  }

  getPaths(planId: number): Observable<PathPlan[]> {
    return this.http.get<PathPlan[]>(this.path + "/plan/" + planId + "/paths");
  }

  getOneMarket(planId: number): Observable<OneMarketPlan> {
    return this.http.get<OneMarketPlan>(this.path + "/plan/" + planId + "/onemarket");
  }

  setAutoRestart(planId: number, autoRestart: boolean): Observable<PlanConfig> {
    return this.http.put<PlanConfig>(this.path + "/plan/" + planId + "/autorepeat/" + autoRestart, {});
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

  getFirstStepStrategies(): Observable<Strategy[]> {
    return this.http.get<Strategy[]>(this.path + "/config/firstmarket");
  }

  getFirstStepPriceStrategies(): Observable<Strategy[]> {
    return this.http.get<Strategy[]>(this.path + "/config/firststepprice");
  }

  getNextStepStrategies(): Observable<Strategy[]> {
    return this.http.get<Strategy[]>(this.path + "/config/nextmarket");
  }
}
