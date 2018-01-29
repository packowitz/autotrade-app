import { Component } from '@angular/core';
import {AlertController, NavController} from 'ionic-angular';
import {Model} from "../../providers/services/model.service";
import {UserService} from "../../providers/services/user.service";

@Component({
  templateUrl: 'binanceAccount.html'
})
export class BinanceAccountPage {

  apiKey: string;
  privateKey: string;

  constructor(public model: Model,
              public navCtrl: NavController,
              public userService: UserService,
              public alertCtrl: AlertController) {

  }

  postKeys() {
    if(this.apiKey && this.privateKey) {
      this.userService.postBinanceKeys(this.apiKey, this.privateKey).subscribe(data => {
        this.model.binanceAccount = data.binance;
        this.apiKey = null;
        this.privateKey = null;
      }, error => {
        this.alertCtrl.create({
          subTitle: 'Posting keys went wrong. Please try again later',
          buttons: [{text: 'Okay'}]
        }).present();
      });
    }
  }
}
