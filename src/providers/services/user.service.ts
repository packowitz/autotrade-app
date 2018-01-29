import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {Model} from "./model.service";
import {User} from "../domain/user.model";

export class UserWithBinance {
  user: User;
  binance: Account;
}

export class TokenResponse {
  token: string;
}

@Injectable()
export class UserService {

  constructor(public model: Model, public http: HttpClient) {}

  getLoggedInUser(): Observable<UserWithBinance> {
    return this.http.get<UserWithBinance>(this.model.server + "/app/user");
  }

  register(username: string, password: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(this.model.server + "/auth/register", {username: username, password: password});
  }

  login(username: string, password: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(this.model.server + "/auth/login", {username: username, password: password});
  }

  postBinanceKeys(apiKey: string, privateKey: string): Observable<UserWithBinance> {
    return this.http.post<UserWithBinance>(this.model.server + "/app/user/add/binance", {apiKey: apiKey, privateKey: privateKey});
  }
}
