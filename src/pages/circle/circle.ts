import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Model} from "../../providers/services/model.service";
import {BinanceService} from "../../providers/services/binance.service";
import {Ticker} from "../../providers/domain/ticker";
import {CircleDetailsPage} from "../circleDetails/circleDetails";

export class CircleTrade {
  isBuy: boolean;
  ticker: Ticker;
  tradePerc: number = 50;
  tradePoint: number;
  cur: string;
  amount: number;
  showDetails: boolean = false;

  constructor(isBuy: boolean, ticker: Ticker) {
    this.isBuy = isBuy;
    this.ticker = ticker;
    this.optimizeTradePerc();
  }

  optimizeTradePerc() {
    if(this.ticker.perc < 0.002) {
      this.tradePerc = 0;
    } else if(this.ticker.perc < 0.003) {
      this.tradePerc = 20;
    } else if(this.ticker.perc < 0.006) {
      this.tradePerc = 50;
    } else if(this.ticker.perc < 0.01) {
      this.tradePerc = 65;
    } else {
      this.tradePerc = 80;
    }
  }

  calc(inCur: string, inAmount) {
    this.cur = this.ticker.symbol.replace(inCur, "");
    let ask: number = parseFloat(this.ticker.askPrice);
    let bid: number = parseFloat(this.ticker.bidPrice);
    let buyAskDiff: number = ask - bid;
    let precission: number = 1;
    while(precission * bid < 1) {
      precission *= 10;
    }
    precission *= 1000;
    if(this.isBuy) {
      this.tradePoint = ask - (buyAskDiff * this.tradePerc / 100);
      this.tradePoint = Math.round(precission * this.tradePoint) / precission;
      this.amount = inAmount / this.tradePoint;
    } else {
      this.tradePoint = bid + (buyAskDiff * this.tradePerc / 100);
      this.tradePoint = Math.round(precission * this.tradePoint) / precission;
      this.amount = inAmount * this.tradePoint;
    }
  }
}

export class Circle {
  baseCur: string;
  lastCur: string;
  trades: CircleTrade[] = [];

  finalAmount: number;

  constructor(baseCur: string) {
    this.baseCur = baseCur;
    this.lastCur = baseCur;
  }

  addTrade(trade: CircleTrade) {
    this.lastCur = trade.ticker.symbol.replace(this.lastCur, "");
    this.trades.push(trade);
  }

  isCircleClosed(): boolean {
    return this.baseCur == this.lastCur && this.trades.length > 1;
  }

  calc() {
    let tradeCur: string = this.baseCur;
    let tradeAmount: number = 1;
    this.trades.forEach(t => {
      t.calc(tradeCur, tradeAmount);
      tradeCur = t.cur;
      tradeAmount = t.amount;
    });
    this.finalAmount = tradeAmount;
  }

  updateTicker(tickers: Ticker[]) {
    let prevCur: string = this.baseCur;
    this.trades.forEach(t => {
      let cur: string = t.isBuy ? t.cur + prevCur : prevCur + t.cur;
      prevCur = t.cur;
      let ticker: Ticker = tickers.find(tick => tick.symbol === cur);
      if(!ticker) {
        console.log("Found no ticker for " + cur + ". I am screwed.")
      }
      t.ticker = ticker;
    });
    this.calc();
  }

  toString(): string {
    let tradeSteps = this.baseCur;
    this.trades.forEach(t => {
      tradeSteps += "->" + t.cur;
    });
    return tradeSteps;
  }

  public static clone(orig: Circle): Circle {
    let clone: Circle = new Circle(orig.baseCur);
    clone.lastCur = orig.lastCur;
    clone.trades = orig.trades.slice(0);
    return clone;
  }
}

@Component({
  templateUrl: 'circle.html'
})
export class CirclePage {

  baseCur: string;
  maxSteps: number = 4;
  searchInProgress: boolean = false;
  searchResults: Circle[] = [];
  lastSearchTickerTimestamp: number;
  refreshing: boolean = false;

  constructor(public navCtrl: NavController, public model: Model, public binance: BinanceService) {
    if(!this.model.ticker || this.model.tickerUpdated < (new Date().getTime() - 20000)) {
      this.refreshData();
    }
  }

  ionViewDidEnter() {
    if(this.searchResults.length > 0 && this.model.tickerUpdated > this.lastSearchTickerTimestamp) {
      this.searchCircles();
    }
  }

  refreshData() {
    this.model.ticker = null;
    this.refreshing = true;
    this.binance.getAllBookTickers().subscribe(data => {
      this.model.ticker = data;
      this.model.tickerUpdated = new Date().getTime();
      if(this.searchResults.length > 0) {
        this.searchCircles();
      }
      this.refreshing = false;
    }, error => {console.log("got error")});
  }

  isBaseCurrency(cur: string) {
    return this.model.baseCur.indexOf(cur) != -1;
  }

  gotoCircleDetails(circle: Circle) {
    this.navCtrl.push(CircleDetailsPage, {circle: circle});
  }

  searchCircles() {
    if(this.maxSteps < 3 || this.maxSteps > 6) {
      return;
    }
    this.searchInProgress = true;
    this.searchResults = [];
    this.lastSearchTickerTimestamp = this.model.tickerUpdated;
    let circle: Circle = new Circle(this.baseCur);
    let buys: Ticker[] = this.findBuys(circle.lastCur);
    buys.forEach(buy => {
      this.addCircleStep(circle, new CircleTrade(true, buy));
    });
    let sells: Ticker[] = this.findSells(circle.lastCur);
    sells.forEach(sell => {
      this.addCircleStep(circle, new CircleTrade(false, sell));
    });
    this.searchInProgress = false;
  }

  private addCircleStep(origCircle: Circle, trade: CircleTrade) {
    let circle: Circle = Circle.clone(origCircle);
    circle.addTrade(trade);
    if(circle.isCircleClosed()) {
      this.finishCircle(circle);
    } else {
      if(circle.trades.length < this.maxSteps) {
        let buys: Ticker[] = this.findBuys(circle.lastCur);
        buys.forEach(buy => {
          this.addCircleStep(circle, new CircleTrade(true, buy));
        });
        let sells: Ticker[] = this.findSells(circle.lastCur);
        sells.forEach(sell => {
          this.addCircleStep(circle, new CircleTrade(false, sell));
        });
      }
    }
  }

  private finishCircle(circle: Circle) {
    circle.calc();
    if(circle.finalAmount > 1) {
      this.searchResults.push(circle);
      this.searchResults.sort((a, b) => b.finalAmount - a.finalAmount);
      if(this.searchResults.length > 20) {
        this.searchResults.splice(20, 1);
      }
    }
  }

  private findBuys(cur: string): Ticker[] {
    if(!this.isBaseCurrency(cur)) {
      return [];
    }
    return this.model.ticker.filter(t => t.symbol.endsWith(cur));
  }

  private findSells(cur: string): Ticker[] {
    return this.model.ticker.filter(t => {
      if(t.symbol.startsWith(cur)) {
        let otherCur = t.symbol.replace(cur, "");
        return this.isBaseCurrency(otherCur);
      } else {
        return false;
      }
    });
  }

}
