import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {BinanceService} from "../../providers/services/binance.service";
import {DepthPage} from "../depth/depth";
import {Model} from "../../providers/services/model.service";

@Component({
  templateUrl: 'ticker.html'
})
export class TickerPage {

  bnbExpand: boolean = false;
  btcExpand: boolean = false;

  constructor(public nav: NavController, public model: Model, public binance: BinanceService) {
    if(!this.model.ticker || this.model.tickerUpdated < (new Date().getTime() - 20000)) {
      this.refreshData();
    }
  }

  refreshData() {
    this.model.ticker = null;
    this.binance.getAllBookTickers().subscribe(data => {
      this.model.ticker = data;
      this.model.tickerUpdated = new Date().getTime();
    }, error => {console.log("got error")});
  }

  gotoDepth(symbol: string) {
    this.nav.push(DepthPage, {symbol: symbol});
  }
}
