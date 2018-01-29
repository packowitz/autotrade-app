import {Injectable} from "@angular/core";
import {Storage} from "@ionic/storage";

@Injectable()
export class LocalStorage {
  prefix: string = "autotrade-";

  token: string;

  constructor(public storage: Storage) {}

  loadData(): Promise<any> {
    return this.storage.get(this.prefix + 'token').then(data => {
      this.token = data;
    });
  }

  clearStorage(): Promise<any> {
    this.token = null;
    return this.storage.clear();
  }

  public getToken(): string {
    return this.token;
  }

  public setToken(token: string) {
    this.token = token;
    this.storage.set(this.prefix + 'token', this.token);
  }
}
