import {NavParams, ViewController} from "ionic-angular";
import {Component} from "@angular/core";
import {AuditLog} from "../../providers/domain/auditLog.model";

@Component({
  template: `
    <ion-list>
      <ion-item *ngFor="let log of logs">
        <div class="flex-vert">
          <span (click)="log.showMessage = !log.showMessage" class="flex-space-between" [class.pointer]="log.message">{{log.timestamp | date:'HH:mm:ss'}} {{log.title}}<ion-icon *ngIf="log.message" name="arrow-down" md="ios-arrow-down"></ion-icon></span>
          <div *ngIf="log.message && log.showMessage" class="flex-vert">
            <span *ngFor="let msgPart of log.message.split('; ')" class="small-font text-wrap">{{msgPart}}</span>
          </div>
        </div>
      </ion-item>
    </ion-list>
  `
})
export class AuditLogsPopover {

  logs: AuditLog[] = [];

  constructor(public viewCtrl: ViewController, public navParams: NavParams) {
    this.logs = navParams.get("logs");
  }

  close() {
    this.viewCtrl.dismiss();
  }
}
