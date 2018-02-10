import { Component } from '@angular/core';
import {NavController, NavParams, ToastController} from 'ionic-angular';
import {Model} from "../../providers/services/model.service";
import {BinanceAccountPage} from "../accounts/binanceAccount";
import {BinanceService} from "../../providers/services/binance.service";
import {BinanceBalance} from "../../providers/domain/binanceBalance.model";
import {Plan} from "../../providers/domain/plan.model";
import {CirclePlan} from "../../providers/domain/circlePlan.model";

@Component({
  templateUrl: 'planCircle.page.html'
})
export class PlanCirclePage {

  circlesLoading: boolean = false;
  circlesLoadingFailed: boolean = false;

  plan: Plan;
  circles: CirclePlan[] = [];

  constructor(public model: Model,
              public nav: NavController,
              public binance: BinanceService,
              public navParams: NavParams,
              public toastCtrl: ToastController) {
    this.plan = this.navParams.get("plan");
    this.loadCircles();
  }

  loadCircles() {
    if(!this.model.binanceAccount) {
      return;
    }
    this.circlesLoading = true;
    this.circlesLoadingFailed = false;
    this.binance.getCircles(this.plan.id).subscribe(
      data => {
        this.circles = data;
        this.circlesLoading = false;
      }, error => {
        this.circlesLoading = false;
        this.circlesLoadingFailed = true;
      }
    );
  }

  cancelPlan() {
    if (!this.model.binanceAccount) {
      return;
    }
    this.binance.cancelPlan(this.plan.id).subscribe(
      data => {
        this.toastCtrl.create({
          message: 'Plan #' + this.plan.id + ' cancelled',
          duration: 3000,
          position: 'top'
        }).present();
        this.plan.status = data.status;
        this.loadCircles();
      }
    );
  }

}
