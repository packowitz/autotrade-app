import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {Model} from "../../providers/services/model.service";
import {BinanceAccountPage} from "../accounts/binanceAccount";
import {BinanceService} from "../../providers/services/binance.service";
import {BinanceBalance} from "../../providers/domain/binanceBalance.model";

@Component({
  templateUrl: 'home.html'
})
export class HomePage {

  balancesLoading: boolean = false;
  balancesLoadingFailed: boolean = false;

  constructor(public model: Model,
              public nav: NavController,
              public binance: BinanceService) {
  }

  ionViewDidEnter() {
    this.loadBalances();
  }

  goBinanceAccount() {
    this.nav.push(BinanceAccountPage);
  }

  loadBalances() {
    if(!this.model.binanceAccount) {
      return;
    }
    this.balancesLoading = true;
    this.balancesLoadingFailed = false;
    this.binance.getAccount().subscribe(
      data => {
        this.model.binanceBalances = data.balances;
        this.balancesLoading = false;
      }, error => {
        this.balancesLoading = false;
        this.balancesLoadingFailed = true;
      }
    );
  }

}
