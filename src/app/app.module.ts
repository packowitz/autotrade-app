import {ErrorHandler, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {MyApp} from './app.component';
import {HomePage} from '../pages/home/home';
import {TabsPage} from '../pages/tabs/tabs';

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {TickerPage} from "../pages/ticker/ticker";
import {BinanceService} from "../providers/services/binance.service";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {Model} from "../providers/services/model.service";
import {BnbFilter} from "../providers/pipes/bnb.filter";
import {SortPipe} from "../providers/pipes/sort.pipe";
import {BtcFilter} from "../providers/pipes/btc.pipe";
import {DepthPage} from "../pages/depth/depth";
import {CirclePage} from "../pages/circle/circle";
import {BaseCurrencyFilter} from "../providers/pipes/baseCurrency.pipe";
import {BuyCurrencyFilter} from "../providers/pipes/buyCurrency.pipe";
import {CircleDetailsPage} from "../pages/circleDetails/circleDetails";
import {LoadingPage} from "../pages/loading/loading";
import {LoadingState} from "../pages/loading/loadingState";
import {LocalStorage} from "../providers/services/localStorage.service";
import {IonicStorageModule} from "@ionic/storage";
import {LoginPage} from "../pages/login/login";
import {UserService} from "../providers/services/user.service";
import {JwtTokenInterceptor} from "../providers/interceptors/jwt_token.interceptor";
import {BinanceAccountPage} from "../pages/accounts/binanceAccount";
import {PlansPage} from "../pages/plans/plans.page";
import {PlanCirclePage} from "../pages/plans/planCircle.page";
import {CreateLoopPopover} from "../pages/plans/createLoop.popover";
import {PlanPathPage} from "../pages/plans/planPath.page";

@NgModule({
  declarations: [
    MyApp,
    BinanceAccountPage,
    CirclePage,
    CircleDetailsPage,
    CreateLoopPopover,
    DepthPage,
    HomePage,
    LoadingPage,
    LoginPage,
    PlanCirclePage,
    PlanPathPage,
    PlansPage,
    TabsPage,
    TickerPage,

    BaseCurrencyFilter,
    BuyCurrencyFilter,
    BnbFilter,
    BtcFilter,
    SortPipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    BinanceAccountPage,
    CirclePage,
    CircleDetailsPage,
    CreateLoopPopover,
    DepthPage,
    HomePage,
    LoadingPage,
    LoginPage,
    PlanCirclePage,
    PlanPathPage,
    PlansPage,
    TabsPage,
    TickerPage
  ],
  providers: [
    BinanceService,
    LoadingState,
    LocalStorage,
    Model,
    StatusBar,
    SplashScreen,
    UserService,
    {provide: HTTP_INTERCEPTORS, useClass: JwtTokenInterceptor, multi: true},
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
