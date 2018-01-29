import {Pipe, PipeTransform} from "@angular/core";

@Pipe({ name: 'bnb' })
export class BnbFilter implements PipeTransform {
  transform(list: any[]) {
    return list.filter(item => item.symbol.endsWith('BNB'));
  }
}
