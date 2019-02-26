import { HelperService } from './../services/helper.service';
import { CommonModule } from './../common.module';
import { environment } from './../../environments/environment';
import { DataManagerService } from './../services/data-manager.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _ } from 'underscore';
import { MeetGreet } from './meet-greet/meet-greet';
@Injectable({
  providedIn: 'root'
})
export class WithParentsService {

    constructor(private http: HttpClient, private commonModule: CommonModule,
        private dataManagerService: DataManagerService, private _helper: HelperService) {
    }

    public pageList = null;
    // 현재 주차
    public thisWeek: any = 1;

    public currentPage = 0;

    public weekType = null;

    /**
     * meet & greet 목록
     */
    public meetGreetList() {
        // 페이지 ROW 수
        const pagePerRowCount: Number = 8;
        // 현재 주차의 페이지 번호
        this._helper.openModal({type: 'loading'});
        this.http.put(environment.polyApiUrl + '/enroll/with-parents/meet-greet', null,
            {headers: {'accept': '*/*', 'Content-Type': 'application/json'}, withCredentials: true})
        .subscribe(res => {
            console.log('--- WithParentsService --- ');
            console.log('res : ', res);
            if (res['data']['ContentsInfo'][0]['VOCAB_ATTR_XML'] != null) {
                const xmlData = this.commonModule.xmlToJson(res['data']['ContentsInfo'][0]['VOCAB_ATTR_XML']);
                // console.log(JSON.stringify(xmlData));
                this.pageList = {};
                this.thisWeek = 1;

                // 초기 값 셋팅
                const idxMap = { group: 0, week: 0, bgClass: 0 };
                this.pageList[idxMap.group] = { vacationCount: 0, weekList : [] };

                 // 첨부파일 xml
                const weekDatas = xmlData['document']['scene']['Week'];
                if (weekDatas != null) {
                    // console.log('weekDatas : ', JSON.stringify(weekDatas));
                }
                _.each(weekDatas, (d, idx) => {
                    // console.log('Week ' + d['@attributes']['text'], d['Title']['@attributes']['text']);
                    const vacationCount = this.pageList[idxMap.group].vacationCount;
                    if ( (this.pageList[idxMap.group].weekList.length - vacationCount) === pagePerRowCount ) {
                        idxMap.group++;
                        idxMap.bgClass = 0;
                        // console.log('bgcolorList.length', bgcolorList.length);
                        this.pageList[idxMap.group] = { vacationCount: 0, weekList : [] };
                    }


                    const meetGreet: MeetGreet = new MeetGreet();
                    // 주차 id
                    meetGreet.code = d['@attributes']['code'];
                    meetGreet.num = parseInt(d['@attributes']['code'], 10);
                    // 주차 제목
                    const weekTitle = d['Title']['@attributes']['text'];
                    if (weekTitle != null) {
                        meetGreet.title = weekTitle;
                    }
                    // sound 목록
                    const weekSounds: Array<any> = d['AudioPlay']['Sound'];
                    if (weekSounds != null && weekSounds.length > 0 ) {
                        meetGreet.fileSoundList = new Array();
                        _.each(weekSounds, (sound) => {
                            const weekSound = {
                                uploadFileName: sound['@attributes']['uploadFileName'],
                                uploadFilePath: sound['@attributes']['uploadFilePath'],
                                uploadFileSize: sound['@attributes']['uploadFileSize'],
                                userFileName: sound['@attributes']['userFileName'],
                                isActive: false
                            };
                            meetGreet.fileSoundList.push(weekSound);
                        });
                    }
                    // PDF 첨부 파일
                    const weekFilePdf: any = d['PDF'];
                    if (weekFilePdf != null ) {
                        meetGreet.filePdf =  {
                            uploadFileName: weekFilePdf['@attributes']['uploadFileName'],
                            uploadFilePath: weekFilePdf['@attributes']['uploadFilePath'],
                            uploadFileSize: weekFilePdf['@attributes']['uploadFileSize'],
                            userFileName: weekFilePdf['@attributes']['userFileName'],
                        };
                    }

                    // MP3 첨부 파일
                    const weekFileMp3: any = d['MP3'];
                    if (weekFileMp3 != null ) {
                        meetGreet.fileMp3 =  {
                            uploadFileName: weekFileMp3['@attributes']['uploadFileName'],
                            uploadFilePath: weekFileMp3['@attributes']['uploadFilePath'],
                            uploadFileSize: weekFileMp3['@attributes']['uploadFileSize'],
                            userFileName: weekFileMp3['@attributes']['userFileName'],
                        };
                    }

                    // 방학주차는 boarcolorList에 빈값을 추가한다. /방학주차/이번주/기본
                    if (this.dataManagerService.weekData.thisWeek === meetGreet.num) {
                        meetGreet.bgClassName = 'this-week';
                    } else if (weekTitle === 'No e-POLY') {
                        meetGreet.bgClassName = 'vacation';
                    } else if (this.dataManagerService.weekData.thisWeek < meetGreet.num) {
                        meetGreet.bgClassName = 'disabled';
                    } else {
                        meetGreet.bgClassName = 'default';
                    }

                    if (weekTitle === 'No e-POLY') {
                        this.pageList[idxMap.group].vacationCount++;
                    }

                    this.pageList[idxMap.group]['weekList'].push(meetGreet);
                    this.getThisWeek(idxMap.group, d['@attributes']['code']);
                    //d['activityClass'] = this.getActivityCssWeek(d);
                    idxMap.bgClass++;
                    idxMap.week++;
                });
            }
            this._helper.closeLoading();
        });
    }

    /**
     * reportsList
     * @param  n=this.dataManagerService.weekData.thisWeek [description]
     * @return                                             [description]
     */
    public reportsWeek() {
        this._helper.openModal({type: 'loading'});
        let params:{params, withCredentials};
        this.pageList = {
            activeWeek: 0,                  // 오픈된 주차의 수
            selectedWeek: 0,                // 선택된 주차
            selectedWeekComplete: null,
            selectedWeekVacation: null,
            weekData:{},
            result: {},
            skillAnalysis:{}
        };

        const httpParams = new HttpParams().set('activityCodes', 'RP1');
        const sub = this.http.get(environment.polyApiUrl + '/enroll/activity/list', {params: httpParams, withCredentials: true});
        sub.subscribe(res => {
            console.log('reports weekData : ', res);
            let arr = [],
                re;

            _.each(res['data'], (d, idx) => {
                arr.push({
                    'weekId': Number(d.weekId),
                    'weekName': d.weekName,
                    'activityCode': d.activityCode,
                    'currCode': d.currCode,
                    'lcmsPrdId': d.lcmsPrdId,
                    'tlLessonYn': d.tlLessonYn,
                    'completeYn': d.completeYn,
                    'vacationIncludeCode': d.vacationIncludeCode,
                    isDisabled: d.vacationIncludeCode === 'HW'
                });
            });

            re = _.chain(arr)
                .sortBy('weekId')
                .groupBy((d, n)=>{return Math.ceil((n+1)/6)})
                .value();

            _.extend(this.pageList.weekData, re);

            // 현재 주차 설정
            this.thisWeek = this.dataManagerService.weekData.thisWeek;
            this.currentPage = Math.floor(this.thisWeek / 6);
            this.reportsList(arr[this.thisWeek-1]);
        });
        return sub;
    }

    /**
     * Reports 주차 데이터 조회
     * @param  n=this.dataManagerService.weekData.thisWeek [description]
     * @return                                             [description]
     */
    public reportsList(week){
        let params,
            thisWeekData;

        //파라메터 값 불러오기
        this.pageList.selectedWeek = week.weekId.toString();
        this.pageList.selectedWeekComplete = week.completeYn;
        //this.pageList.selectedWeekVacation = week.vacationIncludeCode;
        // console.log('this.dataManagerService.getWeekType(week.weekId)', this.dataManagerService.getWeekType(week.weekId));
        if ( week['isDisabled'] ) {
            this.pageList.selectedWeekType = 'noPoly';
            this._helper.closeLoading();
            return false;
        } else {
            this.pageList.selectedWeekType = this.dataManagerService.getWeekType(week.weekId);
        }
                // 테스트용 RP1 데이터에 방학주차정보 없어서 weekType으로 구분함, 데이터 정정되면 수정

        _.each(this.pageList.weekData, (d, idx) => {
            let r = _.find(d, (d, idx)=>{
                return d.weekId == this.pageList.selectedWeek;
            });

            if(undefined !== r)thisWeekData =  r;
        });
      console.log('thisWeekData :', thisWeekData);


        //파라메터 값 설정
        params = {
            params:{
                activityCode: thisWeekData.activityCode,
                activityCodes: thisWeekData.activityCode,
                currCode: thisWeekData.currCode,
                lcmsPrdId: thisWeekData.lcmsPrdId
            },
            withCredentials: true
        };

        //Result
        this.http.get(environment.polyApiUrl + '/enroll/question/list', params)
        .subscribe(res => {
            this.pageList['result'] = res['data'];
             // console.log("===================== Result : res ")
             // console.log(res)
            // console.log('page list params: ', params, 'data : ', res['data']);
            this._helper.closeLoading();
        });

        //Skill Analysis
        this.http.get(environment.polyApiUrl + '/enroll/with-parents/stats-skill', params)
        .subscribe(res => {
            this.pageList['skillAnalysis'] = res['data'];
           console.log("======= Skill Analysis : param :", params, " / res : ", res);
           this._helper.closeLoading();
        });
    }


    /**
     * TimeSpent
     * @param  weekType [description]
     * @return          [description]
     */
    public timeSpentList(weekType?: string) {
        this._helper.openModal({type: 'loading'});
        this.pageList = null;
        let thisMon,
            params: {params, withCredentials};
        weekType = weekType || 'this';
        this.weekType = weekType;

        if(weekType === 'this'){
            thisMon = this.getMonday(new Date());
        }else{
            thisMon = this.getMonday(this.lastWeek(new Date()));
        }

        //파라메터 값 셋팅
        params = {
            params: {
                monday: thisMon.toISOString().slice(0,10).replace(/-/g,"")
            },
            withCredentials: true
        };

        const weekList = {};
        const sub = this.http.get(environment.polyApiUrl + '/enroll/with-parents/time-spent', params)
        .subscribe(res => {
            sub.unsubscribe();
            this._helper.closeLoading();
            const arr = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

            //데이터 배정
            _.each(res['data'], (val, key) => {
                let k = key.substring(0,3);

                if(arr.indexOf(k) !== -1){
                    let r = {},
                        h = 0,
                        valTitle = '',
                        val = res['data'][key];

                    //높이 계산 및 데이터 값 배정
                    if(val > 30){
                        h = 34 * 13;
                        valTitle = '30+';
                    }else{
                        h = val * 13;
                        valTitle = val;
                    }

            		r[arr.indexOf(k)] = {
                        'title': k,
                        'min': val,
                        'height': h,
                        'valTitle': valTitle
                    };

                    _.extend(weekList, r);
                }
            });

            //날짜 배정
            _.each(weekList, (val, key) =>{
                let date = new Date(thisMon);
                date.setDate(date.getDate() + Number(key));

                val['month'] = date.toLocaleString("en-us", { month: "short" });
                val['day'] = date.getDate();
            });
            this.pageList = weekList;
        });
    }

    /**
     * 그주 월요일을 계산해서 돌려 준다.
     * @param  d [description]
     * @return   [description]
     */
    private getMonday(d: any) {
        d = new Date(d);
        var day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? -6:1);

        return new Date(d.setDate(diff));
    }

    /**
     * 전 주를 돌려 준다.
     * @param  d [description]
     * @return   [description]
     */
    private lastWeek(d: any) {
        d = new Date(d);
        var dayOfMonth = d.getDate();
        d.setDate(dayOfMonth - 7);

        return new Date(d);
    }

    /**
     * 현재 페이지 및 현재 주차일 구한다.
     * @param currentPage 현재 페이지
     * @param startDate 주차 시작\
     *
     */
    private getThisWeek(currentPage, weekId) {
        if ( this.dataManagerService.weekData.thisWeek === parseInt(weekId, 10)) {
            this.currentPage = currentPage;
        }
        console.log('this.currentPage : ' + currentPage,
          'this.thisWeek :' + this.dataManagerService.weekData.thisWeek, 'weekId : ' + weekId);
    }
}
