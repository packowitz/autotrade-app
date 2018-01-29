import {Pipe, PipeTransform} from "@angular/core";

@Pipe({ name: 'btc' })
export class BtcFilter implements PipeTransform {
  transform(list: any[]) {
    return list.filter(item => item.symbol.endsWith('BTC'));
  }
}
