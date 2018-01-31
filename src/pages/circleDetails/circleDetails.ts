import {Component} from "@angular/core";
import {NavParams} from "ionic-angular";
import {Circle} from "../circle/circle";
import {Model} from "../../providers/services/model.service";
import {BinanceService} from "../../providers/services/binance.service";

@Component({
  templateUrl: 'circleDetails.html'
})
export class CircleDetailsPage {

  circle: Circle;
  allRisk: number = 50;
  refreshing: boolean = false;

  constructor(public navParams: NavParams, public model: Model, public binance: BinanceService) {
    this.circle = navParams.get("circle");
  }

  applyAllRisk() {
    this.circle.trades.forEach(c => {c.tradePerc = this.allRisk});
    this.circle.calc();
  }

  refreshData() {
    this.model.ticker = null;
    this.refreshing = true;
    this.binance.getAllBookTickers().subscribe(data => {
      this.model.ticker = data;
      this.model.tickerUpdated = new Date().getTime();
      this.circle.updateTicker(data);
      this.refreshing = false;
    }, error => {console.log("got error")});
  }

  optimizeRisk() {
    this.circle.trades.forEach(t => {
      t.optimizeTradePerc();
    });
    this.circle.calc();
  }
}
