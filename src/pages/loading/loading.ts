import {Component} from "@angular/core";
import {Model} from "../../providers/services/model.service";
import {LoadingState} from "./loadingState";
import {LocalStorage} from "../../providers/services/localStorage.service";
import {UserService} from "../../providers/services/user.service";
import {AlertController, NavController} from "ionic-angular";
import {LoginPage} from "../login/login";
import {TabsPage} from "../tabs/tabs";

@Component({
  templateUrl: 'loading.html'
})
export class LoadingPage {

  constructor(public model: Model,
              public state: LoadingState,
              public nav: NavController,
              public localStorage: LocalStorage,
              public userService: UserService,
              public alertCtrl: AlertController) {
    this.init();
  }

  init() {
    if (!this.state.loadedLocalStorage) {
      this.loadLocalStorage();
    } else if (!this.state.loadedUser) {
      this.loadUser();
    } else {
      this.nav.setRoot(TabsPage);
    }
  }

  loadLocalStorage() {
    this.localStorage.loadData().then(() => {
      this.state.loadedLocalStorage = true;
      this.init();
    });
  }

  loadUser() {
    if(!this.localStorage.getToken()) {
      this.nav.setRoot(LoginPage);
    } else {
      this.userService.getLoggedInUser().subscribe(
        data => {
          this.model.user = data.user;
          this.model.binanceAccount = data.binance;
          this.state.loadedUser = true;
          this.init();
        },
        error => {
          this.alertCtrl.create({
            subTitle: 'Error retrieving user data',
            buttons: [
              {text: 'Cancel'},
              {text: 'Login', handler: () => {
                this.localStorage.clearStorage();
                this.nav.setRoot(LoginPage);
              }}
            ]
          }).present();
        }
      );
    }
  }
}
