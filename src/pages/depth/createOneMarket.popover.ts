import {AlertController, NavParams, ToastController, ViewController} from "ionic-angular";
import {Component} from "@angular/core";
import {Model} from "../../providers/services/model.service";
import {BinanceBalance} from "../../providers/domain/binanceBalance.model";
import {BinanceService} from "../../providers/services/binance.service";

@Component({
  template: `
    <ion-list>
      <ion-list-header>Create micro trade plan on {{symbol}}</ion-list-header>
      <ion-item><div class="text-wrap">Select your start currency and the amount you want to trade. The rest is done automatically.</div></ion-item>
      <ion-item>
        <!--<ion-label>Start currency</ion-label>-->
        <select [(ngModel)]="currency" class="width-100">
          <option value="" disabled selected>Start currency</option>
          <option *ngFor="let bal of balances" [value]="bal.asset">{{bal.asset}} ({{bal.free | number: '1.0-8'}} free)</option>
        </select>
        <!--<ion-input [(ngModel)]="currency"></ion-input>-->
      </ion-item>
      <ion-item>
        <ion-label floating>Start amount</ion-label>
        <ion-input type="number" [(ngModel)]="amount"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label>Auto repeat</ion-label>
        <ion-checkbox [(ngModel)]="autoRepeat"></ion-checkbox>
      </ion-item>
      <ion-item>
        <div class="flex-space-between">
          <button ion-button outline (click)="close()">Cancel</button>
          <button ion-button (click)="startLoop()" color="primary" [disabled]="startDisabled()">Start<ion-spinner class="margin-left-s" name="circles" *ngIf="starting"></ion-spinner></button>
        </div>
      </ion-item>
    </ion-list>
  `
})
export class CreateOneMarketPopover {

  symbol: string;
  minProfit: number = 0.005;
  currency: string = "";
  amount: number;
  autoRepeat: boolean = true;

  starting: boolean = false;
  balances: BinanceBalance[] = [];

  constructor(public model: Model,
              public viewCtrl: ViewController,
              public binance: BinanceService,
              public toastCtrl: ToastController,
              public alertCtrl: AlertController,
              public navParams: NavParams) {
    this.symbol = navParams.get('symbol');
    this.model.binanceBalances.forEach(b => {
      if(this.symbol.startsWith(b.asset) || this.symbol.endsWith(b.asset)) {
        this.balances.push(b);
      }
    });
  }

  close() {
    this.viewCtrl.dismiss();
  }

  startDisabled(): boolean {
    if(this.starting || this.currency.length == 0 || !this.amount || this.amount <= 0) {
      return true;
    }
    let balance: BinanceBalance = this.model.binanceBalances.find(b => b.asset == this.currency);
    if(!balance || balance.free < this.amount) {
      return true;
    }
    return false;
  }

  startLoop() {
    this.starting = true;
    this.binance.createOneMarket(this.symbol, this.minProfit, this.currency, this.amount, this.autoRepeat).subscribe(
      data => {
        this.model.binancePlans.unshift(data);
        this.starting = false;
        this.toastCtrl.create({
          message: 'Plan created',
          duration: 3000,
          position: 'top'
        }).present().then(() => this.close());
      }, error => {
        this.alertCtrl.create({
          subTitle: 'Creating plan failed',
          buttons: [{text: 'OK'}]
        }).present();
      }
    );
  }
}
