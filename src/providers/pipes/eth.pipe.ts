import {Pipe, PipeTransform} from "@angular/core";

@Pipe({ name: 'eth' })
export class EthFilter implements PipeTransform {
  transform(list: any[]) {
    return list.filter(item => item.symbol.endsWith('ETH'));
  }
}
