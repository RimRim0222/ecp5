import { environment } from './../../environments/environment';
import { Cache } from './vo/cache';
import { DataManagerService } from './data-manager.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CacheManagerService {

    private cache = new Cache();

    constructor(private http: HttpClient, private dataManagerService: DataManagerService) {
        console.log('CacheManagerService init');
        if (!this.dataManagerService.initDataLoaded) {
            this.dataManagerService.initDataLoaded$.subscribe(res => {
                console.log('this.dataManagerService.initDataLoaded');
                const sessionData = this.dataManagerService.sessionData;
                this.cache.key = this.geneateKey(sessionData);
                console.log('1. cache key: ', this.cache.key);
                this.init();
            });
        } else {
            const sessionData = this.dataManagerService.sessionData;
            this.cache.key = this.geneateKey(sessionData);
            this.init();
        }
    }

    public init() {
        this.getValue().subscribe( res => {
            if (res['data']['data']) {
                const cacheData = JSON.parse(decodeURI(res['data']['data']));
                console.log('CacheManagerService init() cacheRes :', cacheData);
                this.getCache().setValues(cacheData);
            }
        });
    }

    public getCache() {
        return this.cache;
    }

    /**
     * 회원정보로 키를 만든다.
     * @param sessionData 회원정보
     */
    private geneateKey(sessionData: any) {
        const arrayKey = new Array();
        arrayKey.push(sessionData['finalCrsCode']); // 레벨
        arrayKey.push(sessionData['learningYearCode']); // 년도
        arrayKey.push(sessionData['semesterGbn']); // 학기
        arrayKey.push(sessionData['memberCode']); // 회원코드
        arrayKey.push('clubhouse');
        return arrayKey.join('-');
    }

    public getValue() {
        console.log('2. this.cache.key', this.cache);
        const params = new HttpParams().set('ipYn', 'Y').set('key', this.cache.key);
        return this.http.get(environment.polyApiUrl + '/cookie/cookie', { params: params, withCredentials: true });
        // return this.cache.value[key];
    }

    public setValue(code: string, params: any) {
        this.cache.setValue(code, params);
        console.log('3. setValue this.cache', this.cache);
        return this.http.post(environment.polyApiUrl + '/cookie/cookie', JSON.stringify(this.cache),
        {headers: {'accept': '*/*', 'Content-Type': 'application/json'}, withCredentials: true});
    }

    public setTutorialCompleteYN(activityCode: string, completeYN: string) {
        return this.setValue(activityCode, {isTutorial : true});
    }

    public setTutorialComplete(activityCode: string, typed: string) {
        return this.setValue(activityCode, {isTutorial : true, tutoCompleteYNTyped: typed});
    }
}
