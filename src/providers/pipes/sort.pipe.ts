import {Pipe} from "@angular/core";

@Pipe({
  name: "sort"
})
export class SortPipe {
  transform(array: Array<string>, args: string): Array<string> {
    let asc: boolean = true;
    let attr: string;
    let indexOf: number = args.indexOf("-");
    if(indexOf != -1) {
      attr = args.substr(0, indexOf);
      asc = args.substr(indexOf + 1) !== 'desc';
    } else {
      attr = args;
    }
    array.sort((a: any, b: any) => {
      if (a[attr] < b[attr]) {
        return asc ? -1 : 1;
      } else if (a[attr] > b[attr]) {
        return asc ? 1 : -1;
      } else {
        return 0;
      }
    });
    return array;
  }
}
