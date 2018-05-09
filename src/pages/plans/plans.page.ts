import {Component} from '@angular/core';
import {NavController, NavParams, PopoverController, Tabs, ViewController} from 'ionic-angular';
import {Model} from "../../providers/services/model.service";
import {BinanceAccountPage} from "../accounts/binanceAccount";
import {BinanceService} from "../../providers/services/binance.service";
import {Plan} from "../../providers/domain/plan.model";
import {PlanDetailsPage} from "./planDetails.page";
import {Util} from "../../providers/services/util";

@Component({
  templateUrl: 'plans.page.html'
})
export class PlansPage {

  sort: string = "lastActionDate-desc";

  activePlans: number;
  plansLoading: boolean = false;
  plansLoadingFailed: boolean = false;
  plansCheckDate: Date;

  constructor(public model: Model,
              public nav: NavController,
              public binance: BinanceService,
              public popoverCtrl: PopoverController,
              public util: Util,
              public tabs: Tabs) {
    this.loadPlans();
  }

  goBinanceAccount() {
    this.nav.push(BinanceAccountPage);
  }

  goCreatePlan() {
    this.tabs.select(2);
  }

  loadPlans(refresher?) {
    if(!this.model.binanceAccount) {
      return;
    }
    this.plansLoading = true;
    this.plansLoadingFailed = false;
    this.binance.getPlans().subscribe(
      data => {
        this.model.binancePlans = data;
        this.activePlans = data.filter(p => p.status == 'ACTIVE').length;
        this.plansCheckDate = new Date();
        this.plansLoading = false;
        if(refresher) {
          refresher.complete();
        }
      }, error => {
        this.plansLoading = false;
        this.plansLoadingFailed = true;
        if(refresher) {
          refresher.complete();
        }
      }
    );
  }

  goPlanDetails(plan: Plan) {
    this.nav.push(PlanDetailsPage, {plan: plan});
  }

  showMenu(myEvent) {
    let popover = this.popoverCtrl.create(PlansMenu, {page: this});
    popover.present({
      ev: myEvent
    });
  }

}

@Component({
  template: `
    <ion-list>
      <button ion-item icon-start (click)="refresh()">
        <ion-icon name="refresh" class="pointer"></ion-icon> Refresh
      </button>
      <button ion-item (click)="sortByActive()">
        <span *ngIf="page.sort.startsWith('lastActionDate')" class="bold">
          <ion-icon *ngIf="page.sort.endsWith('-desc')" name="arrow-dropdown" ios="md-arrow-dropdown"></ion-icon>
          <ion-icon *ngIf="!page.sort.endsWith('-desc')" name="arrow-dropup" ios="md-arrow-dropup"></ion-icon>
          Sort by activity
        </span>
        <span *ngIf="!page.sort.startsWith('lastActionDate')">Sort by activity</span>
      </button>
      <button ion-item (click)="sortById()">
        <span *ngIf="page.sort.startsWith('id')" class="bold">
          <ion-icon *ngIf="page.sort.endsWith('-desc')" name="arrow-dropdown" ios="md-arrow-dropdown"></ion-icon>
          <ion-icon *ngIf="!page.sort.endsWith('-desc')" name="arrow-dropup" ios="md-arrow-dropup"></ion-icon>
          Sort by ID
        </span>
        <span *ngIf="!page.sort.startsWith('id')">Sort by ID</span>
      </button>
      <button ion-item (click)="sortByProfit()">
        <span *ngIf="page.sort.startsWith('balancePerc')" class="bold">
          <ion-icon *ngIf="page.sort.endsWith('-desc')" name="arrow-dropdown" ios="md-arrow-dropdown"></ion-icon>
          <ion-icon *ngIf="!page.sort.endsWith('-desc')" name="arrow-dropup" ios="md-arrow-dropup"></ion-icon>
          Sort by profit
        </span>
        <span *ngIf="!page.sort.startsWith('balancePerc')">Sort by profit</span>
      </button>
      <button ion-item (click)="sortByRuns()">
        <span *ngIf="page.sort.startsWith('runsDone')" class="bold">
          <ion-icon *ngIf="page.sort.endsWith('-desc')" name="arrow-dropdown" ios="md-arrow-dropdown"></ion-icon>
          <ion-icon *ngIf="!page.sort.endsWith('-desc')" name="arrow-dropup" ios="md-arrow-dropup"></ion-icon>
          Sort by runs
        </span>
        <span *ngIf="!page.sort.startsWith('runsDone')">Sort by runs</span>
      </button>
    </ion-list>
  `
})
export class PlansMenu {

  page: PlansPage;

  constructor(public viewCtrl: ViewController,
              public navParams: NavParams) {
    this.page = navParams.get('page');
  }

  refresh() {
    this.page.loadPlans();
    this.close();
  }

  sortByActive() {
    this.page.sort = this.page.sort == "lastActionDate-desc" ? "lastActionDate" : "lastActionDate-desc";
    this.close();
  }

  sortById() {
    this.page.sort = this.page.sort == "id-desc" ? "id" : "id-desc";
    this.close();
  }

  sortByProfit() {
    this.page.sort = this.page.sort == "balancePerc-desc" ? "balancePerc" : "balancePerc-desc";
    this.close();
  }

  sortByRuns() {
    this.page.sort = this.page.sort == "runsDone-desc" ? "runsDone" : "runsDone-desc";
    this.close();
  }

  close() {
    this.viewCtrl.dismiss();
  }
}
