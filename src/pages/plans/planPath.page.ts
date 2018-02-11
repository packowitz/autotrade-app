import { Component } from '@angular/core';
import {NavController, NavParams, ToastController} from 'ionic-angular';
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
              public toastCtrl: ToastController) {
    this.plan = this.navParams.get("plan");
    this.loadPaths();
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
        this.loadPaths();
      }
    );
  }

}
