import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';
import { HelperService } from './services/helper.service';
import { _ } from 'underscore';
import { environment } from 'src/environments/environment';
import { message } from './global/messages/message';

@Injectable()
export class AuthService {
    constructor(private _helper: HelperService, private router: Router, private http: HttpClient) { }

    public stateController(event) {
        let target,
            code;
        const errorHttpStatus: Array<number> = [400, 401, 403, 500];
        console.log('stateController', event['status'], errorHttpStatus.indexOf(event['status']));
        if ( errorHttpStatus.indexOf(event['status']) > -1 ) {
            // 아이패드에서 close 안되는 문제로 setTimeout으로 처리
            this._helper.closeLoading();
            console.log( 'event : ', event );
            code = (event.error !== undefined) ? event.error.serviceCode : event.body.serviceCode;
            // target = _.findWhere((<any>httpstatus).default, {"status":event.status, "code": code});
            // target = _.findWhere(httpstatus, {"status":event.status, "code": code});
            target = message[code];
            console.log('target :', target);
            if (target === undefined) {
                console.log('정의가 안된 Status 입니다.');
                return false;
            } else if (window.location.href.indexOf('teachers-page') < 0) {
                this.stateProxy(target);
            }
        }
    }

    /**
     * [stateProxy description]
     * @param  target [description]
     * @return        [description]
     */
    private stateProxy(target) {
        console.log('--stateProxy--');
        console.log('target', target);
        switch(target.event) {
            case 'login':  {
                console.log('stateProxy to login');
                location.href = environment.portalUrl;
                //this.router.navigate(['http://devportal.koreapolyschool.com']);
                break;
            }
            case 'modal':  {
                console.log('stateProxy to modal');
                this._helper.openModal({type: 'commonModal02', msg: target['msg']});
                break;
            }
            case 'modalTitle':  {
                console.log('stateProxy to modal Title');
                this._helper.openModal({type: 'commonModal03', msg: target['msg'], title:target['title']});
                break;
            }
            default:
                //this._helper.openModal({type: 'commonModal', msg: target.msg});
                console.log('status proxy default');
        }
    }
}
