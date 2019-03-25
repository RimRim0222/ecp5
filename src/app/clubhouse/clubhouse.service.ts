import { CommonModule } from './../common.module';
import { DataManagerService } from './../services/data-manager.service';
import { environment } from './../../environments/environment';
import { HelperService } from '../services/helper.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _ } from 'underscore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClubhouseService {

    constructor(private http: HttpClient,
        private commonModule: CommonModule,
        private dataManagerService: DataManagerService,
        protected _helper: HelperService) {
    }

    public pageList = null;
    // 페이지 ROW 수
    private pagePerRowCount: Number = 4;
    // 현재 주차의 페이지 번호
    public currentPage = 0;
    // 현재 주차
    private thisWeek: any = 1;
    private lcmsContents = null;
    public activityCode = null;
    public currentWeekData = null;
    public questionList = null;

    public clubhouseInfo(param) {
        console.log('clubhouseInfo');
        this._helper.openModal({type: 'loading'});
        const sub = this.getWeekList(param).subscribe(res => {
            sub.unsubscribe();
            console.log('res : ', res);
            this.pageList = {};
            this.thisWeek = 1;
            let bgcolorList: Array<any> = null;
            let characterList: Array<any> = null;
            console.log('res.data : ', res['data']);

            // 초기 값 셋팅
            const idxMap = { group: 0, week: 0, bgClass: 0 };
            this.pageList[idxMap.group] = { vacationCount: 0, weekList : [] };
            bgcolorList = this.geratorRandomNumber(0);
            if ( this.activityCode === 'PS') {
                characterList = this.geratorCharacterNumber(0);
            }

            // 썸네일 및 첨부파일 xml
            let thumbnailXml;
            let thumbnailWeeks = null;
            if (res['data']['thumbnailXml'] != null) {
                thumbnailXml = this.commonModule.xmlToJson(res['data']['thumbnailXml']);
                thumbnailWeeks = thumbnailXml['document']['scene']['Week'];
                // console.log(JSON.stringify(thumbnailWeeks));
            }
            const attachsMap = new Object();
            if (res['data']['attachList'] != null) {
                console.log('attachList : ', res['data']['attachList']);
                _.each(res['data']['attachList'], (d, idx) => {
                    if ( !attachsMap[ d['lessonSeq'] + ''] ) {
                        attachsMap[d['lessonSeq']] = new Array();
                    }
                    attachsMap[d['lessonSeq']].push(d);
                });
            }
            // 현재 주차
            _.each(res['data']['weekList'], (d, idx) => {
                const vacationCount = this.pageList[idxMap.group].vacationCount;
                if ( (this.pageList[idxMap.group].weekList.length - vacationCount) === this.pagePerRowCount ) {
                    idxMap.group++;
                    idxMap.bgClass = 0;
                    bgcolorList = this.geratorRandomNumber(idx);
                    if ( this.activityCode === 'PS') {
                        characterList = this.geratorCharacterNumber(idx);
                    }
                    // console.log('bgcolorList.length', bgcolorList.length);
                    this.pageList[idxMap.group] = { vacationCount: 0, weekList : [] };
                }
                // 방학주차는 boarcolorList에 빈값을 추가한다.
                if (d['vacationIncludeCode'] === 'HW') {
                    d['bgClassName'] = 'vacation';
                    this.pageList[idxMap.group].vacationCount++;
                    bgcolorList.splice(idxMap.bgClass, 0, '');
                } else {
                    d['bgClassName'] = 'bg-color' + bgcolorList[idxMap.bgClass];
                }

                if ( this.activityCode === 'PS') {
                    if (d['vacationIncludeCode'] === 'HW') {
                        d['bgClassName'] = 'vacation';
                        characterList.splice(idxMap.bgClass, 0, '');
                    } else {
                        let prefixFileName = 'img_ct';
                        prefixFileName += characterList[idxMap.bgClass] + '_' + this.getActivityImgCharacter(d) + '.png';
                        d['characterImg'] = prefixFileName;
                    }
                }

                // 썸네일 이미지 및 첨부 파일 XML
                if (res['data']['thumbnailXml'] != null) {
                    const thumbnailWeek = thumbnailWeeks[idx];
                    if (thumbnailWeek['Title']) {
                        d['title'] = thumbnailWeek['Title']['@attributes']['text'];
                    }
                    // 썸네일 이미지
                    // console.log('attachsMap[d[weekId]', attachsMap);
                    if ( attachsMap[d['weekId']] && attachsMap[d['weekId']][0]['fileUrl'] !== '') {
                        console.log('htmlCont : ', attachsMap[d['weekId']][0]['htmlCont']);
                        d['filePathThumbnail'] = attachsMap[d['weekId']][0]['htmlCont'];
                    } else {
                        if ( d['vacationIncludeCode'] !== 'HW'  ) {
                            const img = thumbnailWeek['Image']['@attributes'];
                            d['filePathThumbnail'] = environment.opURL + img['uploadFilePath'] + img['uploadFileName'];
                        }
                    }
                    // PDF
                    if (thumbnailWeek['PDF']) {
                        const pdf = thumbnailWeek['PDF']['@attributes'];
                        d['filePathPdf'] = pdf['uploadFilePath'] + pdf['uploadFileName'];
                        d['filePdfName'] = pdf['userFileName'];
                        console.log(d['PdfFilePath']);
                    }
                }
                this.pageList[idxMap.group]['weekList'].push(d);
                this.getThisWeek(idxMap.group, d['weekId']);
                d['activityClass'] = this.getActivityCssWeek(d);
                idxMap.bgClass++;
                idxMap.week++;
            });
            this._helper.closeLoading();
        });
    }

    /**
     * 주차 정보
     * @param param activityCode
     */
    public getWeekList(param) {
        console.log('week List 요청...');
        this.activityCode = param.activityCodes;
        const params = new HttpParams().set('activityCodes', param.activityCodes);
        return this.http.get(environment.polyApiUrl + '/enroll/clubhouse/week/list', { params: params, withCredentials: true });
    }

    /**
     * 데모 주차 정보
     */
    public getDemoClubhouseWeekList() {
        console.log('Clubhouse Demo Week List 요청...');
        const params = new HttpParams().set('language', 'EN').set('productBrn', 'BP').set('clubHouseYn', 'Y');
        return this.http.get(environment.polyApiUrl + '/lcms/curriculum/demo/list', { params: params, withCredentials: true });
    }

    /**
     * css class bgcolor 번호를 랜덤하게 가져온다.
     */
    private geratorRandomNumber(idx) {
        const bgcolorList = new Array('01', '02', '03', '04');
        let currentIndex = bgcolorList.length;
        let temporaryValue;
        let randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = bgcolorList[currentIndex];
            bgcolorList[currentIndex] = bgcolorList[randomIndex];
            bgcolorList[randomIndex] = temporaryValue;
        }
        return bgcolorList;
    }

    /**
     * photoshoot 전용
     * @param idx idx
     */
    private geratorCharacterNumber(idx) {
        const characterList = new Array('1', '2', '3', '4');
        if (idx !== 0) {
            let currentIndex = characterList.length;
            let temporaryValue;
            let randomIndex;
            while (0 !== currentIndex) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
                temporaryValue = characterList[currentIndex];
                characterList[currentIndex] = characterList[randomIndex];
                characterList[randomIndex] = temporaryValue;
            }
        }
        return characterList;
    }

    /**
     * 현재 페이지 및 현재 주차일 구한다.
     * @param currentPage 현재 페이지
     * @param startDate 주차 시작일
     */
    private getThisWeek(currentPage, weekId) {
        if ( this.dataManagerService.weekData.thisWeek === parseInt(weekId, 10)) {
            this.currentPage = currentPage;
        }
        // console.log('this.currentPage : ' + currentPage,
        //   'this.thisWeek :' + this.dataManagerService.weekData.thisWeek, 'weekId : ' + weekId);
    }

    /**
     * 주차별 activity class를 가져온다.
     * @param week 주차 Data
     */
    private getActivityCssWeek(weekData) {
        const classList = new Array('default');
        if (weekData.completeYn === 'Y') {
            classList.push('complete');
        }
        if (this.dataManagerService.weekData.thisWeek === parseInt(weekData.weekId, 10)) {
            classList.push('this-week');
        }
        if (this.dataManagerService.weekData.thisWeek < parseInt(weekData.weekId, 10)) {
            classList.push('disabled');
        }
        return classList.join(' ');
    }

    private getActivityImgCharacter(weekData) {
        let status = 'default';
        if (weekData.completeYn === 'Y') {
            status = 'complete';
        } else if (this.dataManagerService.weekData.thisWeek < parseInt(weekData.weekId, 10) ) {
            status = 'disabled';
        }
        return status;
    }

    /**
     * Sing Along Tab menu Json Data
     */
    public singAlognTabsongsList(): Observable<any> {
        console.log('singAlognTabsongsList -- JSON DATA GET');
        return this.http.get( environment.resourceURL.static + '/json/clubhouse/clubhouse-tab-songs.json');
    }

    public enrollContent(week: any) {
        console.log('enrollContent data :', week);
        const params = {
            currCode: week['currCode'],
            learningEleCode: week['learningEleCode'],
            lcmsPrdId: week['lcmsPrdId'],
            activityCode: week['activityCode'],
            language: 'EN'
        };
        console.log( 'json :' + JSON.stringify(params));
        return this.http.put(environment.polyApiUrl + '/enroll/content', JSON.stringify(params),
        {headers: {'accept': '*/*', 'Content-Type': 'application/json'}, withCredentials: true});
    }

    /**
     * lcms contents를 가져온다.
     * @param currCode  커리큘러 코드
     * @param learningEleCode ele 코드
     */
    public getLcmsContents(week: any) {
        console.log('getLcmsContents :', week);
        this.currentWeekData = week;
        const params = new HttpParams().set('language', 'EN').set('currCode', week.currCode).set('learningEleCode', week.learningEleCode);
        return this.http.get(environment.polyApiUrl + '/lcms/contents', { params: params, withCredentials: true });
    }

    public getEnrollQuestionList(params: any) {
        console.log('Activity Questions 요청...');
        return this.http.get(environment.polyApiUrl + '/enroll/question/list', {params: params, withCredentials: true});
    }

    /**
     * 문제 수정
     * @question 문제정보
     */
    public enrollQuestion(question) {
        console.log('enrollQuestion : ', question);
        return this.http.put(environment.polyApiUrl + '/enroll/question', JSON.stringify(question),
        {headers: {'accept': '*/*', 'Content-Type': 'application/json'}, withCredentials: true});
    }

    /**
     * 여러 문제
     * @param questions 문제 목록
     */
    public enrollQuestions(questions) {
        console.log('enrollQuestions : ', questions);
        return this.http.put(environment.polyApiUrl + '/enroll/questions', JSON.stringify(questions),
        {headers: {'accept': '*/*', 'Content-Type': 'application/json'}, withCredentials: true});
    }

    /**
     *
     * @param dirName 디렉토리
     * @param file 파일
     */
    public uploadFile(dirName: string, file: File) {
        const url = environment.polyApiUrl + '/global/fileUploadAction';
        const formData = new FormData();
        formData.append('dirName', 'color-magic');
        formData.append('file', file);
        return this.http.post(url, formData, {withCredentials: true});
    }

    /**
     * 주차 완료 처리
     * @param completeYn
     */
    public setCompleteYn(completeYn: string) {
        if (this.currentWeekData['completeYn'] !== 'Y') {
            this.currentWeekData['completeYn'] = completeYn;
            this.currentWeekData['activityClass'] = 'complete';
        }
        console.log('this.currentWeekData[characterImg]', this.currentWeekData['characterImg']);
        // 이미지 변경
        if (this.activityCode === 'PS'
                && completeYn === 'Y') {
            this.currentWeekData['characterImg'] = this.currentWeekData['characterImg'].replace('default', 'complete');
        }
    }
}
