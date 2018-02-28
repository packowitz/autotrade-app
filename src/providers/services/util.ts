import {Injectable} from "@angular/core";

@Injectable()
export class Util {

  public getTimeDiff(dateFrom: string, dateTo?: string): string {
    let dateFromInMs: number = new Date(Date.parse(dateFrom)).getTime();
    let dateToInMs: number = dateTo ? new Date(Date.parse(dateTo)).getTime() : new Date().getTime();
    let diffInSecs: number = Math.floor((dateToInMs - dateFromInMs) / 1000);
    if(diffInSecs < 60) {
      return diffInSecs + " secs";
    }
    let diffInMins: number = Math.floor(diffInSecs / 60);
    if(diffInMins < 60) {
      let secs: number = diffInSecs % 60;
      return diffInMins + ":" + (secs > 10 ? secs : '0' + secs) + " mins";
    }
    let diffInHours: number = Math.floor(diffInMins / 60);
    if(diffInHours < 48) {
      let mins: number = diffInMins % 60;
      return diffInHours + ":" + (mins > 10 ? mins : '0' + mins) + " hours";
    }
    let diffInDays: number = Math.floor(diffInHours / 24);
    let hours: number = diffInHours % 24;
    return diffInDays + ":" + (hours > 10 ? hours : '0' + hours) + " days"
  }

}
