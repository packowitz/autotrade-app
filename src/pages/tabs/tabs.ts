import {Component} from '@angular/core';
import {HomePage} from '../home/home';
import {TickerPage} from "../ticker/ticker";
import {CirclePage} from "../circle/circle";
import {Model} from "../../providers/services/model.service";
import {PlansPage} from "../plans/plans.page";

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  home = HomePage;
  plan = PlansPage;
  circle = CirclePage;
  ticker = TickerPage;

  constructor(public model: Model) {}
}
