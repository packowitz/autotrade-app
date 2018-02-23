import {Component} from '@angular/core';
import {NavController, NavParams, PopoverController} from 'ionic-angular';
import {BinanceService} from "../../providers/services/binance.service";
import {Depth} from "../../providers/domain/depth.model";
import {BinanceTrade} from "../../providers/domain/binanceTrade.model";
import {DepthOffer} from "../../providers/domain/depthOffer.model";
import {CreateOneMarketPopover} from "./createOneMarket.popover";

@Component({
  templateUrl: 'depth.html'
})
export class DepthPage {

  depth: Depth;
  tresholdPerc: number = 0.5;
  secOfferPerc: number = 1;
  depthAnalysisInterval: number = 20;
  bestBuyPoint: number;
  bestSellPoint: number;

  trades: BinanceTrade[] = [];
  tradeBuyerMaker: number;
  lastIntervalTrades: BinanceTrade[] = [];
  symbol: string;

  lastTradesInterval: number = 30;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public binance: BinanceService,
              public popoverCtrl: PopoverController) {
    this.symbol = navParams.get('symbol');
    this.refreshData();
  }

  refreshData() {
    this.depth = null;
    this.trades = [];
    this.lastIntervalTrades = [];
    this.binance.getDepth(this.symbol).subscribe(
      data => {
        this.depth = data;
        this.bestBuyPoint = this.getBestBuyPoint();
        this.bestSellPoint = this.getBestSellPoint();
      }
    );
    this.binance.getLatestTrades(this.symbol).subscribe(
      data => {
        this.trades = data;
        let timestamp: number = new Date().getTime() - (60000 * this.lastTradesInterval);
        this.lastIntervalTrades = data.filter(t => t.time > timestamp);
        this.tradeBuyerMaker = 0;
        this.lastIntervalTrades.forEach(t => {if(t.isBuyerMaker) {this.tradeBuyerMaker ++;}});
      }
    );
  }

  asDate(time: number): Date {
    return new Date(time);
  }

  getBestBuyPoint(): number {
    let treshold: number = this.tresholdPerc / this.depthAnalysisInterval;
    let bidVolume: number = 0;
    this.depth.bids.forEach((bid, i) => {
      if(i < this.depthAnalysisInterval) {
        bidVolume += bid.quantity;
      }
    });
    let overTresholdBids: DepthOffer[] = this.depth.bids.filter(t => (t.quantity / bidVolume) > treshold);
    let priceDiffToHighest: number = this.depth.bids[0].price / overTresholdBids[0].price;
    if(priceDiffToHighest > 1.003) {
      return overTresholdBids[0].price;
    }
    if(overTresholdBids.length > 1) {
      //check if 2nd offer is worth to go for
      let priceDiff: number = overTresholdBids[0].price / overTresholdBids[1].price;
      if (priceDiff > (1 + (this.secOfferPerc / 100))) {
        return overTresholdBids[1].price;
      }
    }

    return overTresholdBids[0].price;
  }

  getBestSellPoint(): number {
    let treshold: number = this.tresholdPerc / this.depthAnalysisInterval;
    let askVolume: number = 0;
    this.depth.asks.forEach((ask, i) => {
      if(i < this.depthAnalysisInterval) {
        askVolume += ask.quantity;
      }
    });
    let overTresholdAsks: DepthOffer[] = this.depth.asks.filter(t => (t.quantity / askVolume) > treshold);
    let priceDiffToLowest: number = overTresholdAsks[0].price / this.depth.asks[0].price;
    if(priceDiffToLowest > 1.003) {
      return overTresholdAsks[0].price;
    }
    if(overTresholdAsks.length > 1) {
      //check if 2nd offer is worth to go for
      let priceDiff: number = overTresholdAsks[1].price / overTresholdAsks[0].price;
      if (priceDiff > (1 + (this.secOfferPerc / 100))) {
        return overTresholdAsks[1].price;
      }
    }

    return overTresholdAsks[0].price;
  }


  asTimeDiff(ms: number): string {
    let asString: string = "";
    let secs: number = Math.round(ms / 1000);
    if(secs >= 3600) {
      asString += Math.floor(secs / 3600) + ":";
      secs = secs % 3600;
    } else {
      asString += "0:";
    }
    if(secs >= 60) {
      let mins: number = Math.floor(secs / 60);
      if(mins < 10) {
        asString += "0";
      }
      asString += mins + ":";
      secs = secs % 60;
    } else {
      asString += "00:";
    }
    if(secs < 10) asString += "0";
    return asString + secs + " hours";
  }

  createPlan() {
    let popover = this.popoverCtrl.create(CreateOneMarketPopover, {symbol: this.symbol});
    popover.present();
  }

}
