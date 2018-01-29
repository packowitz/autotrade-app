import {Pipe, PipeTransform} from "@angular/core";

@Pipe({ name: 'buyCurrency' })
export class BuyCurrencyFilter implements PipeTransform {
  transform(list: any[], cur: string) {
    return list.filter(item => item.symbol.startsWith(cur));
  }
}
