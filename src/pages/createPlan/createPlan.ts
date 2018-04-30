import {Component} from "@angular/core";
import {PlanConfig} from "../../providers/domain/planConfig.model";
import {Strategy} from "../../providers/domain/strategy.model";
import {BinanceService} from "../../providers/services/binance.service";
import {Model} from "../../providers/services/model.service";
import {BinanceAccountPage} from "../accounts/binanceAccount";
import {AlertController, NavController, ToastController} from "ionic-angular";
import {StrategyParam} from "../../providers/domain/strategyParam.model";
import {BinanceBalance} from "../../providers/domain/binanceBalance.model";
import {CreatePlanParams} from "../../providers/services/createPlanParams.service";

@Component({
  templateUrl: 'createPlan.html'
})
export class CreatePlanPage {

  config: PlanConfig;

  firstStepStrategy: Strategy;
  firstStepStrategyParams: StrategyParam[];
  firstStepPriceStrategy: Strategy;
  firstStepPriceStrategyParams: StrategyParam[];
  nextStepStrategy: Strategy;
  nextStepStrategyParams: StrategyParam[];

  refreshing: boolean = false;
  starting: boolean = false;

  constructor(public model: Model,
              public nav: NavController,
              public binance: BinanceService,
              public alertCtrl: AlertController,
              public toastCtrl: ToastController,
              public createPlanParams: CreatePlanParams) {
    this.resetPage();
  }

  ionViewDidEnter() {
    this.binance.loadBalances();

    if(this.createPlanParams.firstStepStrategy) {
      this.firstStepStrategySelected(this.createPlanParams.firstStepStrategy);
      this.createPlanParams.firstStepStrategy = null;
      if(this.createPlanParams.firstStepStrategyParams) {
        let paramSplit: string[] = this.createPlanParams.firstStepStrategyParams.split(";");
        paramSplit.forEach((p, i) => {
          this.firstStepStrategyParams[i].value = p;
        });
        this.createPlanParams.firstStepStrategyParams = null;
      }
    }
  }

  resetPage() {
    this.config = new PlanConfig();
    this.config.autoRestart = true;
    this.firstStepStrategy = null;
    this.firstStepStrategyParams = null;
    this.firstStepPriceStrategy = null;
    this.firstStepPriceStrategyParams = null;
    this.nextStepStrategy = null;
    this.nextStepStrategyParams = null;
  }

  refreshData() {
    this.refreshing = true;
    let loading1: boolean = true;
    let loading2: boolean = true;
    let loading3: boolean = true;
    this.binance.loadBalances();
    this.binance.getFirstStepStrategies().subscribe(data => {
      this.model.firstStepStrategies = data;
      loading1 = false;
      this.refreshing = loading1 || loading2 || loading3;
    }, error => {console.log("got error")});
    this.binance.getFirstStepPriceStrategies().subscribe(data => {
      this.model.firstStepPriceStrategies = data;
      loading2 = false;
      this.refreshing = loading1 || loading2 || loading3;
    }, error => {console.log("got error")});
    this.binance.getNextStepStrategies().subscribe(data => {
      this.model.nextStepStrategies = data;
      loading3 = false;
      this.refreshing = loading1 || loading2 || loading3;
    }, error => {console.log("got error")});
  }

  firstStepStrategySelected(strategyName) {
    console.log("First step strategy selected: " + strategyName);
    this.firstStepStrategy = this.model.firstStepStrategies.find(s => s.name == strategyName);
    if(this.firstStepStrategy.params) {
      this.firstStepStrategyParams = [];
      let params: string[] = this.firstStepStrategy.params.split(";");
      let defaults: string[] = this.firstStepStrategy.defaultParam ? this.firstStepStrategy.defaultParam.split(";") : null;
      params.forEach((p, i) => {
        let param: StrategyParam = new StrategyParam();
        let paramSplit: string[] = p.split(":");
        param.label = paramSplit[0];
        param.type = paramSplit[1];
        if(defaults) {
          param.value = defaults[i];
        }
        this.firstStepStrategyParams.push(param);
      });
    } else {
      this.firstStepStrategyParams = null;
    }
  }

  firstStepPriceStrategySelected(strategyName) {
    this.firstStepPriceStrategy = this.model.firstStepPriceStrategies.find(s => s.name == strategyName);
    if(this.firstStepPriceStrategy.params) {
      this.firstStepPriceStrategyParams = [];
      let params: string[] = this.firstStepPriceStrategy.params.split(";");
      let defaults: string[] = this.firstStepPriceStrategy.defaultParam ? this.firstStepPriceStrategy.defaultParam.split(";") : null;
      params.forEach((p, i) => {
        let param: StrategyParam = new StrategyParam();
        let paramSplit: string[] = p.split(":");
        param.label = paramSplit[0];
        param.type = paramSplit[1];
        if(defaults) {
          param.value = defaults[i];
        }
        this.firstStepPriceStrategyParams.push(param);
      });
    } else {
      this.firstStepPriceStrategyParams = null;
    }
  }

  nextStepStrategySelected(strategyName) {
    this.nextStepStrategy = this.model.nextStepStrategies.find(s => s.name == strategyName);
    if(this.nextStepStrategy.params) {
      this.nextStepStrategyParams = [];
      let params: string[] = this.nextStepStrategy.params.split(";");
      let defaults: string[] = this.nextStepStrategy.defaultParam ? this.nextStepStrategy.defaultParam.split(";") : null;
      params.forEach((p, i) => {
        let param: StrategyParam = new StrategyParam();
        let paramSplit: string[] = p.split(":");
        param.label = paramSplit[0];
        param.type = paramSplit[1];
        if(defaults) {
          param.value = defaults[i];
        }
        this.nextStepStrategyParams.push(param);
      });
    } else {
      this.nextStepStrategyParams = null;
    }
  }

  isConfigComplete(): boolean {
    if(!this.config.startCurrency || !this.config.startAmount || !this.firstStepStrategy || !this.firstStepPriceStrategy || !this.nextStepStrategy) {
      return false;
    }
    let balance: BinanceBalance = this.model.binanceBalances.find(b => b.asset == this.config.startCurrency);
    if(this.config.startAmount > balance.free) {
      return false;
    }
    let missingParam: boolean = false;
    if(this.firstStepStrategyParams) {
      this.firstStepStrategyParams.forEach(s => {
        if(!s.value) {
          missingParam = true;
        }
      });
      if(missingParam) {
        return false;
      }
    }
    if(this.firstStepPriceStrategyParams) {
      this.firstStepPriceStrategyParams.forEach(s => {
        if(!s.value) {
          missingParam = true;
        }
      });
      if(missingParam) {
        return false;
      }
    }
    if(this.nextStepStrategyParams) {
      this.nextStepStrategyParams.forEach(s => {
        if(!s.value) {
          missingParam = true;
        }
      });
      if(missingParam) {
        return false;
      }
    }
    return true;
  }

  startPlan() {
    this.config.firstMarketStrategy = this.firstStepStrategy.name;
    this.config.firstMarketStrategyParams = this.paramsToConfig(this.firstStepStrategyParams);
    this.config.firstStepPriceStrategy = this.firstStepPriceStrategy.name;
    this.config.firstStepPriceStrategyParams = this.paramsToConfig(this.firstStepPriceStrategyParams);
    this.config.nextMarketStrategy = this.nextStepStrategy.name;
    this.config.nextMarketStrategyParams = this.paramsToConfig(this.nextStepStrategyParams);

    this.starting = true;
    this.binance.createPlan(this.config).subscribe(data => {
      this.model.binancePlans.unshift(data);
      this.starting = false;
      this.resetPage();
      this.toastCtrl.create({
        message: 'Plan created',
        duration: 3000,
        position: 'top',
        showCloseButton: true
      }).present();
    }, error => {
      this.alertCtrl.create({
        subTitle: 'Creating plan failed',
        buttons: [{text: 'OK'}]
      }).present();
    });
  }

  paramsToConfig(params: StrategyParam[]): string {
    let configString: string = null;
    if(params) {
      params.forEach(s => {
        let val: string = s.value;
        if(s.type == 'percentage') {
          val = (parseFloat(val) * 10 / 1000).toString();
        }
        if(configString == null) {
          configString = val;
        } else {
          configString += ";" + val;
        }
      });
    }
    return configString;
  }

  goBinanceAccount() {
    this.nav.push(BinanceAccountPage);
  }
}
