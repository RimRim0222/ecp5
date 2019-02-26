import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from "rxjs/Observable";
import { environment } from '../environments/environment';
import 'rxjs/add/operator/map';

@Injectable()
export class UserService {
    constructor(private router: Router, private http: HttpClient) { }
    isLoggedIn() {
        return this.http.get(environment.polyApiUrl + '/member/view', {withCredentials: true})
        .map(res => {
            if (res) {
                console.log('--Guard 검증 통과--');
                console.log(res);
                return true;
            }
            console.log('--Guard 검증 실패--');
            console.log(res);
            this.router.navigateByUrl('./');
            // this.router.navigateByUrl('/login');
            return false;
        });
    }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private http: HttpClient, private userService: UserService) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      console.log('-- AuthGuard 접근 완료--');
      return this.userService.isLoggedIn();
  }
}

@Injectable()
export class AuthGuardChild implements CanActivateChild {
    constructor(private router: Router, private http: HttpClient, private userService: UserService) { }

    canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        console.log('-- AuthGuardChild 접근 완료--');
        return this.userService.isLoggedIn();
    }
}
