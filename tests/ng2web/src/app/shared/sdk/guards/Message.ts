/* tslint:disable */
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { MessageApi } from '../services/index';
import { getMessageById } from '../reducers/Message';
import { MessageActions } from '../actions/Message';

@Injectable()
export class MessageExistsGuard implements CanActivate {
  constructor(
    private store: Store<any>,
    private Message: MessageApi
  ) {}

  public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.hasEntity(route.params['MessageId'] || route.params['id']);
  }

  protected hasEntityInStore(id: string): Observable<boolean> {
    return this.store.select(getMessageById(id))
      .map((entitie) => !!entitie)
      .take(1);
  }

  protected hasEntityInApi(id: string): Observable<boolean> {
    return this.Message.exists(id)
      .map((response: any) => !!response.exists)
      .catch(() => {
        this.store.dispatch(new MessageActions.guardFail());
        return of(false);
      });
  }

  protected hasEntity(id: string): Observable<boolean> {
    return this.hasEntityInStore(id)
      .switchMap((inStore) => {
        if (inStore) {
          return of(inStore);
        }

        return this.hasEntityInApi(id);
      });
  }
}
