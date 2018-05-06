import {Component} from '@angular/core';
import {
  AlertController, NavController, NavParams, PopoverController, ToastController,
  ViewController
} from 'ionic-angular';
import {Model} from "../../providers/services/model.service";
import {BinanceService} from "../../providers/services/binance.service";
import {Plan} from "../../providers/domain/plan.model";
import {PathPlan} from "../../providers/domain/pathPlan.model";
import {PlanStep} from "../../providers/domain/planStep.model";
import {Util} from "../../providers/services/util";
import {AuditLogsPopover} from "./auditLogs.popover";
import {DepthPage} from "../depth/depth";
import {Ticker} from "../../providers/domain/ticker";

@Component({
  templateUrl: 'planDetails.page.html'
})
export class PlanDetailsPage {

  loading: boolean = false;
  loadingFailed: boolean = false;
  refreshingTicker: boolean = false;
  checkPlanDate: Date;

  plan: Plan;
  latestSymbol: string;
  ticker: Ticker;

  constructor(public model: Model,
              public nav: NavController,
              public binance: BinanceService,
              public navParams: NavParams,
              public toastCtrl: ToastController,
              public popoverCtrl: PopoverController,
              public alertCtrl: AlertController,
              public util: Util) {
    this.plan = this.navParams.get("plan");
  }

  ionViewDidEnter() {
    this.loadPlan();
    if(this.model.tickerUpdated < (new Date().getTime() - 20000)) {
      this.refreshTicker();
    }
  }

  showMenu(myEvent) {
    let popover = this.popoverCtrl.create(PlanDetailsMenu, {page: this});
    popover.present({
      ev: myEvent
    });
  }

  getDoneStep(path: PathPlan, idx: number): PlanStep {
    let counter: number = 0;
    return path.steps.find(step => {
      if(step.status == 'DONE') {
        if(counter == idx) {
          return true;
        } else {
          counter ++;
        }
      }
      return false;
    });
  }

  loadPlan() {
    if(!this.model.binanceAccount) {
      return;
    }
    this.loading = true;
    this.loadingFailed = false;
    this.binance.getPlan(this.plan.id).subscribe(
      data => {
        this.plan = data;
        this.checkPlanDate = new Date();
        this.latestSymbol = this.plan.steps[0].symbol;
        if(this.latestSymbol) {
          this.ticker = this.model.getTicker(this.latestSymbol);
          if(!this.ticker) {
            console.log("No ticker found for " + this.latestSymbol);
          }
        } else {
          this.ticker = null;
        }
        this.loading = false;
      }, error => {
        this.loading = false;
        this.loadingFailed = true;
      }
    );
  }

  showLogs(step: PlanStep) {
    this.binance.getAuditLogs(step.id).subscribe(logs => {
      this.popoverCtrl.create(AuditLogsPopover, {logs: logs}, {cssClass: 'widerPopover'}).present();
    });
  }

  gotoDepth() {
    this.nav.push(DepthPage, {symbol: this.latestSymbol});
  }

  approxLoss(): number {
    let x: number;
    if(this.plan.steps[0].side == 'BUY') {
      x = this.plan.steps[0].price / parseFloat(this.ticker.bidPrice);
    } else {
      x = parseFloat(this.ticker.askPrice) / this.plan.steps[0].price;
    }
    x = 100 * (x - 1);
    return Math.round(100 * x) / 100;
  }

  acceptLoss() {
    this.alertCtrl.create({
      subTitle: 'Accept loss of approx ' + this.approxLoss() + '%',
      message: 'This will remove the price threshold of last step to start trading again.',
      buttons: [
        {text: 'Cancel'},
        {text: 'Okay', handler: () => {
            this.binance.removeThreshold(this.plan.id, this.plan.steps[0].id).subscribe(() => {
              this.toastCtrl.create({
                message: 'Removed threshold from last step',
                duration: 2000,
                position: 'top'
              }).present();
            });
        }}
      ]
    }).present();
  }

  refreshTicker() {
    this.refreshingTicker = true;
    this.binance.getAllBookTickers().subscribe(data => {
      this.model.ticker = data;
      this.model.tickerUpdated = new Date().getTime();
      if(this.latestSymbol) {
        this.ticker = this.model.getTicker(this.latestSymbol);
        if(!this.ticker) {
          console.log("No ticker found for " + this.latestSymbol);
        }
      }
      this.refreshingTicker = false;
    }, error => {this.refreshingTicker = false; console.log("got error refreshing ticker")});
  }

}

@Component({
  template: `
    <ion-list>
      <button ion-item icon-start (click)="refresh()">
        <ion-icon name="refresh" class="pointer"></ion-icon>Refresh
      </button>
      <button ion-item (click)="toggleAutoRestart()" [disabled]="page.plan.status != 'ACTIVE'">
        <ion-icon name="checkbox-outline" *ngIf="page.plan.config.autoRestart"></ion-icon>
        <ion-icon name="square-outline" *ngIf="!page.plan.config.autoRestart"></ion-icon>
        Auto restart plan
      </button>
      <button ion-item (click)="cancelPlan()" [disabled]="page.plan.status != 'ACTIVE'">
        <ion-icon name="square"></ion-icon>
        Cancel plan
      </button>
      <button ion-item (click)="deletePlan()" [disabled]="page.plan.status == 'ACTIVE'">
        <ion-icon name="trash"></ion-icon>
        Delete plan
      </button>
    </ion-list>
  `
})
export class PlanDetailsMenu {

  page: PlanDetailsPage;

  constructor(public viewCtrl: ViewController,
              public navParams: NavParams) {
    this.page = navParams.get('page');
  }

  refresh() {
    this.page.loadPlan();
    this.viewCtrl.dismiss();
  }

  toggleAutoRestart() {
    let autoRestart:boolean = !this.page.plan.config.autoRestart;
    this.page.binance.setAutoRestart(this.page.plan.id, autoRestart).subscribe(
      data => {
        this.page.plan.config = data;
      }
    );
  }

  cancelPlan() {
    this.page.binance.cancelPlan(this.page.plan.id).subscribe(
      data => {
        this.page.toastCtrl.create({
          message: 'Plan #' + this.page.plan.id + ' cancelled',
          duration: 3000,
          position: 'top'
        }).present();
        this.page.plan.status = data.status;
        this.refresh();
      }
    );
  }

  deletePlan() {
    this.page.binance.deletePlan(this.page.plan.id).subscribe(
      data => {
        this.page.toastCtrl.create({
          message: 'Plan #' + this.page.plan.id + ' deleted',
          duration: 3000,
          position: 'top'
        }).present();
        let idx: number = this.page.model.binancePlans.indexOf(this.page.plan);
        if(idx > -1) {
          this.page.model.binancePlans.splice(idx, 1);
        }
        this.viewCtrl.dismiss().then(() => {this.page.nav.pop()});
      }
    );
  }

  close() {
    this.viewCtrl.dismiss();
  }
}
