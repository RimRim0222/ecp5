import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { icreateContentsConfig } from './icreate-contents-config';

@Injectable({
    providedIn: 'root'
})
export class TeachersPageService {

    constructor(private http: HttpClient) {
    }

    public getLcmsContents(week: any) {
        const params = new HttpParams().set('language', 'EN').set('currCode', week.currCode).set('learningEleCode', week.learningEleCode);
        return this.http.get(environment.polyFrontUrl + '/lcms/contents', { params: params, withCredentials: true });
    }

    public icreateContentsInfo(params: any) {
        console.log('params : ', params);
        params = new HttpParams().set('crsAuthoringCode', params['crsAuthoringCode']);
        const url = environment.resourceURL.icreate + '/tlesif/authoringTool/api/getContentsInfo.json';
        return this.http.get(url, { params: params });
    }
}
