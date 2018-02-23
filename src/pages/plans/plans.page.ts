import { Component } from '@angular/core';
import {NavController, PopoverController} from 'ionic-angular';
import {Model} from "../../providers/services/model.service";
import {BinanceAccountPage} from "../accounts/binanceAccount";
import {BinanceService} from "../../providers/services/binance.service";
import {Plan} from "../../providers/domain/plan.model";
import {CreateLoopPopover} from "./createLoop.popover";
import {PlanPathPage} from "./planPath.page";
import {PlanOneMarketPage} from "./planOneMarket.page";

@Component({
  templateUrl: 'plans.page.html'
})
export class PlansPage {

  plansLoading: boolean = false;
  plansLoadingFailed: boolean = false;

  constructor(public model: Model,
              public nav: NavController,
              public binance: BinanceService,
              public popoverCtrl: PopoverController) {
    this.loadPlans();
  }

  goBinanceAccount() {
    this.nav.push(BinanceAccountPage);
  }

  loadPlans() {
    if(!this.model.binanceAccount) {
      return;
    }
    this.plansLoading = true;
    this.plansLoadingFailed = false;
    this.binance.getPlans().subscribe(
      data => {
        this.model.binancePlans = data;
        this.plansLoading = false;
      }, error => {
        this.plansLoading = false;
        this.plansLoadingFailed = true;
      }
    );
  }

  goPlanDetails(plan: Plan) {
    if(plan.type == 'PATH') {
      this.nav.push(PlanPathPage, {plan: plan});
    } else if(plan.type == 'ONEMARKET') {
      this.nav.push(PlanOneMarketPage, {plan: plan});
    }
  }

  createLoop() {
    let popover = this.popoverCtrl.create(CreateLoopPopover);
    popover.present();
  }

}
