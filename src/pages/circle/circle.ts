import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Model} from "../../providers/services/model.service";
import {BinanceService} from "../../providers/services/binance.service";
import {Ticker} from "../../providers/domain/ticker";
import {CircleDetailsPage} from "../circleDetails/circleDetails";

export class CircleStep {
  cur: string;
  amount: number;
  isBuy: boolean;
  tradePoint: number;
  tick: Ticker;

  constructor(cur: string, amount: number, isBuy?: boolean, tradePoint?: number, tick?: Ticker) {
    this.cur = cur;
    this.amount = amount;
    this.isBuy = isBuy;
    this.tradePoint = tradePoint;
    this.tick = tick;
  }
}

export class CircleResult {
  happyPath: CircleStep[];
  middlePath: CircleStep[];
  quickPath: CircleStep[];

  private currentCur: string;

  constructor(startCur: string, public ticker: Ticker[]) {
    this.currentCur = startCur;
    this.happyPath = [new CircleStep(startCur, 1)];
    this.middlePath = [new CircleStep(startCur, 1)];
    this.quickPath = [new CircleStep(startCur, 1)];
  }

  addStep(cur: string) {
    let isBuy: boolean = true;
    let symbol = cur + this.currentCur;
    let tick = this.ticker.find(t => t.symbol === symbol);
    if(!tick) {
      isBuy = false;
      symbol = this.currentCur + cur;
      tick = this.ticker.find(t => t.symbol === symbol);
    }
    let last, newAmount, tradePoint: number;

    last = this.happyPath[this.happyPath.length - 1];
    if(isBuy) {
      tradePoint = parseFloat(tick.bidPrice)
      newAmount = last.amount / tradePoint;
    } else {
      tradePoint = parseFloat(tick.askPrice)
      newAmount = last.amount * tradePoint;
    }
    this.happyPath.push(new CircleStep(cur, newAmount, isBuy, tradePoint, tick));

    last = this.middlePath[this.middlePath.length - 1];
    tradePoint = (parseFloat(tick.bidPrice) + parseFloat(tick.askPrice)) / 2;
    if(isBuy) {
      newAmount = last.amount / tradePoint;
    } else {
      newAmount = last.amount * tradePoint;
    }
    this.middlePath.push(new CircleStep(cur, newAmount, isBuy, tradePoint, tick));

    last = this.quickPath[this.quickPath.length - 1];
    if(isBuy) {
      tradePoint = parseFloat(tick.askPrice);
      newAmount = last.amount / tradePoint;
    } else {
      tradePoint = parseFloat(tick.bidPrice);
      newAmount = last.amount * tradePoint;
    }
    this.quickPath.push(new CircleStep(cur, newAmount, isBuy, tradePoint, tick));

    this.currentCur = cur;
  }
}

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

  chain: string[] = [];
  result: CircleResult;

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

  setCurrency(pos: number, value: string) {
    this.result = null;
    if(this.chain.length > pos) {
      this.chain = this.chain.slice(0, pos);
    }
    this.chain[pos] = value;
  }

  isBaseCurrency(cur: string) {
    return this.model.baseCur.indexOf(cur) != -1;
  }

  isCircle(): boolean {
    return this.chain.length > 2 && this.chain[0] == this.chain[this.chain.length - 1];
  }

  calc() {
    this.result = new CircleResult(this.chain[0], this.model.ticker);
    this.chain.forEach((c,i) => {
      if(i > 0) {
        this.result.addStep(c);
      }
    });
    console.log(this.result);
  }

  gotoCircleDetails(circle: Circle) {
    this.navCtrl.push(CircleDetailsPage, {circle: circle});
  }

  searchCircles() {
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
