import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {Model} from "../../providers/services/model.service";
import {BinanceAccountPage} from "../accounts/binanceAccount";
import {BinanceService} from "../../providers/services/binance.service";

@Component({
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public model: Model,
              public nav: NavController,
              public binance: BinanceService) {
  }

  ionViewDidEnter() {
    this.binance.loadBalances();
  }

  goBinanceAccount() {
    this.nav.push(BinanceAccountPage);
  }

}
