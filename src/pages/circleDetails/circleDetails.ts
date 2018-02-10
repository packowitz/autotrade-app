import {Component} from "@angular/core";
import {AlertController, NavParams, ToastController} from "ionic-angular";
import {Circle} from "../circle/circle";
import {Model} from "../../providers/services/model.service";
import {BinanceService} from "../../providers/services/binance.service";
import {BinanceBalance} from "../../providers/domain/binanceBalance.model";

@Component({
  templateUrl: 'circleDetails.html'
})
export class CircleDetailsPage {

  circle: Circle;
  refreshing: boolean = false;

  constructor(public navParams: NavParams,
              public alertCtrl: AlertController,
              public toastCtrl: ToastController,
              public model: Model,
              public binance: BinanceService) {
    this.circle = navParams.get("circle");
  }

  optimizeRisk() {
    this.circle.trades.forEach(t => {
      t.optimizeTradePerc();
    });
    this.circle.calc();
  }

  setRisk(risk: string) {
    this.circle.riskLevel = risk;
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

  startCircle() {
    let availableAmount: number = 0;
    let balance: BinanceBalance = this.model.binanceBalances.find(b => b.asset == this.circle.baseCur);
    if(balance) {
      availableAmount = balance.free;
    }
    this.alertCtrl.create({
      subTitle: 'Run ' + this.circle.toString(),
      message: 'Choose how much to invest (' + availableAmount + ' available)',
      inputs: [
        {name: 'amount', placeholder: this.circle.baseCur, type: 'number'}
      ],
      buttons: [
        {text: 'Cancel'},
        {text: 'Start',
          handler: data => {
            if(!data || !data.amount || isNaN(data.amount)) {
              this.alertCtrl.create({
                subTitle: 'Please specify the amount you want to invest',
                buttons: [{text: "Okay"}]
              }).present();
            } else {
              let amount: number = parseFloat(data.amount);
              if(amount > availableAmount) {
                this.alertCtrl.create({
                  subTitle: 'You have only ' + availableAmount + ' ' + this.circle.baseCur + ' available',
                  buttons: [{text: "Okay"}]
                }).present();
              } else {
                this.binance.createCircle(this.circle, amount, 99, true).subscribe(data => {
                  this.toastCtrl.create({
                    message: 'Circle created as plan',
                    duration: 3000,
                    position: 'top'
                  }).present();
                }, error => {
                  this.alertCtrl.create({
                    subTitle: 'Error running circle',
                    buttons: [{text: "Okay"}]
                  }).present();
                });
              }
            }
          }
        }
      ]
    }).present();
  }
}
