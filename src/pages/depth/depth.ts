import { Component } from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {BinanceService} from "../../providers/services/binance.service";
import {Depth} from "../../providers/domain/depth.model";

@Component({
  templateUrl: 'depth.html'
})
export class DepthPage {

  depth: Depth;
  symbol: string

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public binance: BinanceService) {
    this.symbol = navParams.get('symbol');
    this.refreshData();
  }

  refreshData() {
    this.depth = null;
    this.binance.getDepth(this.symbol).subscribe(data => {this.depth = data});
  }

}
