import {Component} from "@angular/core";
import {Model} from "../../providers/services/model.service";
import {UserService} from "../../providers/services/user.service";
import {AlertController, NavController} from "ionic-angular";
import {LocalStorage} from "../../providers/services/localStorage.service";
import {LoadingPage} from "../loading/loading";

@Component({
  templateUrl: 'login.html'
})
export class LoginPage {
  username: string;
  password: string;
  rePassword: string;
  register: boolean = false;

  constructor(public model: Model,
              public localStorage: LocalStorage,
              public userService: UserService,
              public alertCtrl: AlertController,
              public nav: NavController) {}

  registerValid(): boolean {
    return this.username && this.username.length >= 4 && this.password && this.password.length >= 8 && this.password == this.rePassword;
  }

  doLogin() {
    if(!this.username || !this.password) {
      return;
    }
    this.userService.login(this.username, this.password).subscribe(
      data => {
        this.localStorage.setToken(data.token);
        this.nav.setRoot(LoadingPage);
      },
      error => {
        this.alertCtrl.create({
          subTitle: 'Login failed',
          buttons: [{text: 'Okay'}]
        }).present();
      }
      );
  }

  doRegister() {
    if(!this.registerValid()) {
      return;
    }
    this.userService.register(this.username, this.password).subscribe(
      data => {
        this.localStorage.setToken(data.token);
        this.nav.setRoot(LoadingPage);
      },
      error => {
        this.alertCtrl.create({
          subTitle: 'Register failed. Probably username is already in use.',
          buttons: [{text: 'Okay'}]
        }).present();
      }
    );
  }
}
