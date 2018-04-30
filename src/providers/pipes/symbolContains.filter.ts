import {Pipe} from "@angular/core";

@Pipe({
  name: "symbolContains"
})
export class SymbolContainsFilter {
  transform(array: Array<string>, currency: string): Array<string> {
    if(currency) {
      return array.filter(a => a.startsWith(currency) || a.endsWith(currency));
    } else {
      return array;
    }
  }
}
