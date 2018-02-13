import { Component } from '@angular/core';
import {NavController, NavParams, PopoverController, ToastController, ViewController} from 'ionic-angular';
import {Model} from "../../providers/services/model.service";
import {BinanceService} from "../../providers/services/binance.service";
import {Plan} from "../../providers/domain/plan.model";
import {PathPlan} from "../../providers/domain/pathPlan.model";
import {PlanStep} from "../../providers/domain/planStep.model";

@Component({
  templateUrl: 'planPath.page.html'
})
export class PlanPathPage {

  pathsLoading: boolean = false;
  pathsLoadingFailed: boolean = false;

  plan: Plan;
  paths: PathPlan[] = [];

  showCancelledSteps: boolean = false;

  constructor(public model: Model,
              public nav: NavController,
              public binance: BinanceService,
              public navParams: NavParams,
              public toastCtrl: ToastController,
              public popoverCtrl: PopoverController) {
    this.plan = this.navParams.get("plan");
    this.loadPaths();
  }

  showMenu(myEvent) {
    let popover = this.popoverCtrl.create(PlanPathMenu, {page: this});
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

  isAutoRestart(): boolean {
    if(this.paths.length > 0) {
      return this.paths[0].autoRestart;
    }
    return false;
  }

  loadPaths() {
    if(!this.model.binanceAccount) {
      return;
    }
    this.pathsLoading = true;
    this.pathsLoadingFailed = false;
    this.binance.getPaths(this.plan.id).subscribe(
      data => {
        this.paths = data;
        this.pathsLoading = false;
      }, error => {
        this.pathsLoading = false;
        this.pathsLoadingFailed = true;
      }
    );
  }

}

@Component({
  template: `
    <ion-list>
      <button ion-item icon-start (click)="refresh()">
        <ion-icon name="refresh" class="pointer"></ion-icon>Refresh
      </button>
      <button ion-item (click)="toggleAutoRestart()" [disabled]="page.plan.status != 'ACTIVE'">
        <ion-icon name="checkbox-outline" *ngIf="page.isAutoRestart()"></ion-icon>
        <ion-icon name="square-outline" *ngIf="!page.isAutoRestart()"></ion-icon>
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
export class PlanPathMenu {

  page: PlanPathPage;

  constructor(public viewCtrl: ViewController,
              public navParams: NavParams) {
    this.page = navParams.get('page');
  }

  refresh() {
    this.page.loadPaths();
    this.viewCtrl.dismiss();
  }

  toggleAutoRestart() {
    let autoRestart:boolean = !this.page.isAutoRestart();
    this.page.binance.setAutoRestart(this.page.plan.id, autoRestart).subscribe(
      data => {
        this.page.paths = data;
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
