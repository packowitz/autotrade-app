import { Component } from '@angular/core';

import { HomePage } from '../home/home';
import {TickerPage} from "../ticker/ticker";
import {CirclePage} from "../circle/circle";

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = CirclePage;
  tab3Root = TickerPage;

  constructor() {

  }
}
