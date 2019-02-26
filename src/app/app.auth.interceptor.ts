import { Injectable } from "@angular/core";
import { HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpErrorResponse } from "@angular/common/http";
import { HttpRequest, HttpResponse } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from './app.auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private _authService: AuthService, private http: HttpClient) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(map((event: HttpEvent<any>) => {
                    if (event instanceof HttpResponse) {
                        // do stuff with response and headers you want
                        console.log('--Response--');
                        // console.log(event);

                        this._authService.stateController(event);
                    }
                    return event;
                }), catchError((error: any, caught: Observable<HttpEvent<any>>)  => {
                    console.log('--catchError--');
                    // console.log(error);
                    // console.log(error.status);

                    this._authService.stateController(error);

                    // return of(error);
                    throw error;
                }));
    }
}
