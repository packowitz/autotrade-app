import {Pipe, PipeTransform} from "@angular/core";
import {Model} from "../services/model.service";

@Pipe({ name: 'baseCurrency' })
export class BaseCurrencyFilter implements PipeTransform {

  constructor(public model: Model) {}

  transform(list: any[], baseCur: string, includeOtherBase: boolean) {
    if(includeOtherBase) {
      let main = [];
      this.model.baseCur.forEach(b => {
        let found = list.find(item => item.symbol === baseCur + b);
        if(found) {
          main.push(found);
        }
      });
      return main.concat(list.filter(item => item.symbol.endsWith(baseCur)));
    } else {
      return list.filter(item => item.symbol.endsWith(baseCur));
    }
  }
}
