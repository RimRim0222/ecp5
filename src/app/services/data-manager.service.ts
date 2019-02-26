import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs/index';
import {Router} from '@angular/router';
import { Location } from '@angular/common';
import { environment } from '../../environments/environment';
import { _ } from 'underscore';
import { NgxXml2jsonService } from 'ngx-xml2json';
import {HelperService} from "./helper.service";
import { MainCache } from "./vo/mainCache";
import { constant } from '../global/constans/constant';
import {SoundManagerService} from "./sound-manager.service";

@Injectable({
  providedIn: 'root'
})
export class DataManagerService {
  public initDataLoaded$ = new Subject<boolean>();
  public initDataLoaded: boolean = false;
  public processDemoEnded$ = new Subject<boolean>();
  public isBGMOff$ = new Subject<boolean>();

  public playVideoOnDemand$ = new Subject<object>();
  public playProlog$ = new Subject<any>();
  public playEpilog$ = new Subject<any>();
  public initPrologEnded$ = new Subject<any>();
  public monthlyPrologEnded$ = new Subject<any>();
  public epilogEnded$ = new Subject<any>();

  public contentPopupClose$ = new Subject<any>();
  public weekGroup: Array<Array<number>> = [[], [], [], [], [], []];
  public isThisWeek: boolean;
  public characterPath: String;
  public weekData: {
    validWeek: number[],
    permittedWeek: number[],
    lastWeekOfSeason1: number,
    viewWeek: number,
    seqOfCourseWeek: number,
    thisWeek: number,
    untilThisWeek: Array<number>,
    firstWeekOfMonth: Array<number>,
    minValidWeek: any,
    allWeek: Array<number>,
    monthNames: Array<string>
  } = null;
  public isDemo: boolean;
  public sessionData: object = null;
  public activityList: object = null;
  public isFirstStatus = {};
  public isMobile: boolean;
  public updateMainActStatus$ = new Subject();
  public readyToRewardActivityCode$ = new Subject<string>();
  public completeRewardAction$ = new Subject<any>();
  public loadContentsFlag: Boolean = false;
  public lastRunContentsOfProgress: object = null;
  public completeAllFlashCard$ = new Subject<object>();

  public modalInfos = {
    noPoly:          {type: 'noPoly', elClass: 'modalNoPoly', depth: 1},
    notBuyWeek:      {type: 'notBuyWeek', elClass: 'modalNotBuyWeek', depth: 1},
    endPoly:         {type: 'endPoly', elClass: 'modalEndPoly', depth: 1},
    pdfViewer:       {type: 'pdfViewer', elClass: 'modalPdfViewer', depth: 1},
    meetGreetPdfViewer: {type: 'meetGreetPdfViewer', elClass: 'modalMeeGreetPdfViewer', depth: 1},
    activitySheetPdfViewer: {type: 'activitySheetPdfViewer', elClass: 'modalActivitySheetPdfViewer', depth: 1},
    flashCardMain:   {type: 'flashCardMain', elClass: 'main-flashcard01', depth: 1},
    flashCardDetail: {type: 'flashCardDetail', elClass: 'main-flashcard-detail01', depth: 2},
    commonHelp :     {type: 'commonHelp', elClass: 'common-help01', depth: 3},
    commonModal :    {type: 'commonModal', elClass: 'common-modal01', depth: 5},
    commonModal02 :  {type: 'commonModal02', elClass: 'common-modal02', depth: 5},
    commonModal03 :  {type: 'commonModal03', elClass: 'common-modal03', depth: 5},
    loading:         {type: 'loading', elClass: 'modalLoading', depth: 3},
    profileSetup:    {type: 'profileSetup', elClass: 'modalProfileSetup', depth: 1},
    mainReward1:     {type: 'mainReward1', elClass: 'main-reward01', depth: 1},
    weeklyComplete:  {type: 'weeklyComplete', elClass: 'main-complete01', depth: 5},
    monsterCure:     {type: 'monsterCure', elClass: 'monster-cure', depth: 1},
    mainClose:       {type: 'mainClose', elClass: 'main-close01', depth: 1},
    gameTimeLimitAlert: {type: 'gameTimeLimitAlert', elClass: 'modalEndPoly', depth: 1}
  };

  constructor( private http: HttpClient, private router: Router, private _location: Location,
               private ngxXml2jsonService: NgxXml2jsonService, private _helper: HelperService,
               private _sndMgr: SoundManagerService) {
    this.isMobile = this.getIsMobile();
    if (this.isMobile)
      window['POLY'].browserPlatform = this.getMobileOS();

    this.setMsgEventListener(this.contentFrameEventListener, this);
  }

  private isLoadMainCache: boolean = false;
  private mainCache = new MainCache();
  private mainCacheKey: string;
  private loadMainCache(sessionData: any) {
    if (this.isDemo) {
      this.isLoadMainCache = true;
      return;
    }
    this.mainCacheKey = this.generateMainCacheKey(sessionData);
    // console.log('### main cache key:', this.mainCacheKey);
    const params = new HttpParams().set('ipYn', 'Y').set('key', this.mainCacheKey);
    return this.http.get(environment.polyApiUrl + '/cookie/cookie', { params: params, withCredentials: true })
  }

  private generateMainCacheKey(sessionData: any) {
    const arrayKey = new Array();
    arrayKey.push(sessionData['finalCrsCode']); // 레벨
    arrayKey.push(sessionData['learningYearCode']); // 년도
    arrayKey.push(sessionData['semesterGbn']); // 학기
    arrayKey.push(sessionData['memberCode']); // 회원코드
    arrayKey.push('main'); // 메인 전용
    return arrayKey.join('-');
  }

  private setMainCacheValue(code: string, params: any) {
    this.mainCache.key = this.mainCacheKey;
    this.mainCache.setValue(code, params);
    // console.log('code: ', code);
    // console.log('param: ', params);
    // console.log('setValue main cache', this.mainCache);
    this.http.post(environment.polyApiUrl + '/cookie/cookie', JSON.stringify(this.mainCache),
      {headers: {'accept': '*/*', 'Content-Type': 'application/json'}, withCredentials: true})
      .subscribe(() => {
        // console.log('complete main cache set');
      })
  }

  private initFirstStatusAll() {
    const isTutoComplete = {};
    _.each(['PP1','PP2','RV1','RP1','MP1','MP2'], d => { isTutoComplete[d] = 'N'; });
    this.initFirstStatus('mainTutorialComplete', isTutoComplete);
    this.initFirstStatus('prologVideo', [false, false, false, false, false, false]);
    this.initFirstStatus('epilogVideo', false);
    this.initFirstStatus('initGuideAffordancePlayed', false);
    this.initFirstStatus('initPrologVideo', false);
    this.initFirstStatus('BGMOff', false);
    // console.log('isFirstStatusAll :', this.isFirstStatus);
  }

  public initFirstStatus(name: string, value: any) { // 캐시 데이터 초기값 설정
    if (typeof(value) == 'object' && !Array.isArray(value) && (null !== localStorage.getItem(name)))
      // object 타입으로 캐시가 있을 때
      this.isFirstStatus[name] = JSON.parse(localStorage.getItem(name));
    else if (null !== localStorage.getItem(name)) {
      // object가 아니며 localstorage에 값이 있을 때
      // console.log(`initFirst getItem keyname - ${name} / value - ${localStorage.getItem(name)}`); //TESTTEST
      const tmp = localStorage.getItem(name);
      if (tmp === 'true' || tmp === 'false')
        this.isFirstStatus[name] = (tmp == 'true'); // boolean 값일 때 타입에 맞춰 할당
      else
        this.isFirstStatus[name] = tmp;
    }
    else // 캐시가 존재하지 않는 값
      this.isFirstStatus[name] = value;
  }
  public getFirstStatus(name: string) {
    return this.isFirstStatus[name];
  }
  public setFirstStatus(name: string, value: any) {
    this.isFirstStatus[name] = value;
    if (name == 'BGMOff') {
      this._sndMgr.isBGMOff = value;
      this.isBGMOff$.next(value);
      // console.log('### call set bgmOff :', value);
    }
    if (this.isDemo)
      return;

    if (typeof(value) == 'object' && !Array.isArray(value))
      localStorage.setItem(name, JSON.stringify(value));
    else
      localStorage.setItem(name, value);

    // console.log('setMainCacheValue', name, value);
    if (typeof(value) == 'string' || typeof(value) == 'boolean')
      this.setMainCacheValue(name, value);
    else
      this.setMainCacheValue(name, JSON.stringify(value));
  }
  public checkPrologPlayComplete(weekGroupIdx: number): boolean {
    // console.log('isFirstStatus all :', this.isFirstStatus);
    return this.isFirstStatus['prologVideo'][weekGroupIdx];
  }

  public getIsMobile(): boolean { // PC, 태블릿 구분
    const filter = "win16|win32|win64|mac|macintel";
    if (navigator.platform)
      return 0 > filter.indexOf(navigator.platform.toLowerCase()) ? true : false;
  }
  public getMobileOS(): string { // 태블릿의 플랫폼 구분
    var userAgent = navigator.userAgent || navigator.vendor;
    if (/android/i.test(userAgent))
      return "Android";
    if (/iPad|iPhone|iPod/.test(userAgent) && !window['MSStream'])
      return "iOS";

    return "unknown";
  }

  public currentContentComponent: any;
  public currentMsgEventListener: any;

  private definedIframeMsgFnList: object = {};
  public registerIframeMsgFn(msg: string, fn, scope) {
    this.definedIframeMsgFnList[msg] = fn.bind(scope);
  }
  public clearIframeMsgFnList() {
    this.definedIframeMsgFnList = {};
  }
  public setMsgEventListener(listener, scope) { // 컨텐츠간 기본 API 처리 리스너 교체
    this.clearIframeMsgFnList();

    const lsnr = listener.bind(scope);
    window.removeEventListener( 'message', this.currentMsgEventListener);
    window.addEventListener('message', lsnr);
    this.currentMsgEventListener = lsnr;
  }

  public contentFrameEventListener(event) { // 컨텐츠간 기본 API 처리 리스너 등록
    if(event.data['op']) {
      console.error('컨텐츠로부터 받은 메시지 :', event.data);

      //event.data['op'] = 'closeContent';

      switch(event.data['op']) {
        case 'contentInit': {
          this.loadContentsFlag = true;
          this._helper.closeLoading();
          this.registStudyStart();
          const target = document.getElementById(this.currentContentComponent.childFrameElementId)['contentWindow'];
          target.postMessage({op: 'notifyContentInitFinish', from:'poly'}, '*');
          target.postMessage({op: 'setActivityMenu', from:'poly', data: {
              buyerYN: this.isDemo ? 'N' : 'Y',
              mobileYN: this.isMobile ? 'Y' : 'N',
              teachersYN: this.currentContentComponent['teachersYN'] || 'N',
              helpPageCode: this.currentContentComponent['activityCode'] || '',
              tutorialCompleteYN: this.currentContentComponent['tutorialCompleteYN'],
              tutoCompleteYNTyped: this.currentContentComponent['tutoCompleteYNTyped'],
              runType: this.currentContentComponent['contentRunType'] || '',
              studyTimeLimitSec: this.studyTimeLimitSec || 0,
              studyTimeLimitMax: constant.studyTimeLimitMax,
              bgmOffYN: this.getFirstStatus('BGMOff') ? 'Y' : 'N',
              fromWithParentsYN: _.isNull(this.currentContentComponent['fromWithParentComp']) ? 'N' : 'Y'
            }}, '*');
          break;
        }
        case 'closeContent': {  //보상 닫고 메인으로
          console.log('this.activityList : ', this.activityList[this.weekData.viewWeek][this.currentContentComponent['activityCode']]);
          // activity 완료 여부
          const activityListViewWeetData = this.getActivityListViewWeetData();
          const activityCompleteYN = activityListViewWeetData != null ? this.getActivityListViewWeetData()['completeYn'] : '';
          this.registStudyEnd();
          if (this.currentContentComponent.isRecvSaveCompleted) {
            this.readyToRewardActivityCode$.next(this.currentContentComponent.activityCode);
          } else if (this.currentContentComponent.didIncompleteSaving && activityCompleteYN !== 'Y') {
            this.activityList[this.weekData.viewWeek][this.currentContentComponent['activityCode']]['completeYn'] = 'N';
            this.updateMainActStatus$.next();
          }
          this.clearIframeMsgFnList();
          // console.log('closeContent3', window.history);
          console.log('close content : fromWith comp value - ', this.currentContentComponent.fromWithParentComp,
            'isRecvSaveCompleted - ', this.currentContentComponent.isRecvSaveCompleted);
          if (_.isNull(this.currentContentComponent.fromWithParentComp) || !this.currentContentComponent.isRecvSaveCompleted) {
            console.log("this.activityList[this.weekData.viewWeek][this.currentContentComponent['activityCode']]: ", this.activityList[this.weekData.viewWeek][this.currentContentComponent['activityCode']])
            this.currentContentComponent.fromWithParentComp = null;
            this._location.back();
            /*if (this.activityList[this.weekData.viewWeek][this.currentContentComponent['activityCode']] !== undefined) {
              //alert("메인일때;")
              console.log("메인일때;")
              this._location.back();
            } else {
              //alert("clubhouse일때;")
              console.log("clubhouse일때;")
              this.router.navigateByUrl('/main');
            }*/
          }
          else if (!_.isNull(this.currentContentComponent.fromWithParentComp) && this.currentContentComponent.isRecvSaveCompleted) {
            //alert("with-parents일때");
            console.log("with-parents일때");
            this.afterContentTargetComp = _.clone(this.currentContentComponent.fromWithParentComp);
            this.router.navigateByUrl('/main');
          }
          break;
        }
        default:
          this.definedIframeMsgFnList[event.data['op']](event.data['data']);
      }
    }
  }

  public getActivityListViewWeetData() {
    return this.activityList[this.weekData.viewWeek][this.currentContentComponent['activityCode']];
  }

  public afterContentTargetComp = null;
  public isSetProgressWeekSlidePos: boolean = false;

  public sendRecordResultNotify(res: object) { // say it 녹음 데이터의 db 저장이 끝났음을 컨텐츠로 notify
    const target = document.getElementById(this.currentContentComponent.childFrameElementId)['contentWindow'];
    target.postMessage({op: 'notifyDeviceOrientationResult', from:'poly', data: {
        type: res['command']||'record', result: res['result'], fileUrl: res['fileUrl']||'', message: res['msg']||'', id: res['id']
      }}, '*');
  }

  private checkLoadingComplete() { // 기본 데이터 4가지 로딩 완료 여부 체크
    if (this.weekData && this.sessionData && this.activityList && this.isLoadMainCache) {
      this.initFirstStatusAll();

      this.processDemoEnded$.subscribe(() => {
        const tmp = [];
        _.each(this.activityList, d => { tmp.push(_.pluck(d, 'completeYn')); });
        const isNoneStudied: boolean = _.chain(tmp).flatten().every(d => { return d == ""; }).value();
        if ( !isNoneStudied )
          this.setFirstStatus('initGuideAffordancePlayed', true);

        this._helper.isBgmMute = this.getFirstStatus('BGMOff');
        this.initDataLoaded$.next(true);
        this.initDataLoaded = true;
      })
      this.processDemoUser();
    }
  }
  public loadInitData() {
    this._helper.openModal({type: 'loading'});
    this.loadProfileData();
    this.loadWeekData();
    this.loadActivityList();
  }

  private processDemoUser() { // 데모 유저의 week, activity list 데이터 로딩
    if (this.isDemo) {
      this.setWeekData('permittedWeek', [1]);
      this.setWeekData('validWeek', [1]);
      this.setWeekData('viewWeek', 1);
      this.setWeekData('thisWeek', 1);
      this.setWeekData('seqOfCourseWeek', 1);
      this.setWeekData('untilThisWeek', [1]);
      this.setWeekData('minValidWeek', 1);
      this.weekGroup = [[1]];

      console.log('Demo Activity List 요청...');
      const params = {};
      params['productBrn'] = 'BP';
      params['language'] = 'EN';
      params['clubHouseYn'] = 'N';
      const subs = this.http.get(environment.polyApiUrl+'/lcms/curriculum/demo/list',
        {params: params, withCredentials: true})
        .subscribe(res => {
          subs.unsubscribe();

          this.activityList = {1:{}};
          _.each(res['data']['weekList'], (d) => {
            if (typeof this.activityList[1][d.activityCode] === 'undefined')
              this.activityList[1][d.activityCode] = {};

            this.activityList[1][d.activityCode] = d;
          });
          console.log('demo activity list :', this.activityList);
          this.processDemoEnded$.next(true);
        });
    }
    else
      this.processDemoEnded$.next(true);
  }

  private loadActivityList() {
    console.log('Activity List 요청...');

    // const subs = this.http.get('http://localhost:4200/assets/activity_list.json') //TESTTEST
    const subs = this.http.get(environment.polyApiUrl+'/enroll/activity/list',{withCredentials: true})
      .subscribe(res => {
        subs.unsubscribe();

        this.activityList = {};
        _.each(res['data'], (d) => {
          if (typeof this.activityList[d.weekId] === 'undefined')
            this.activityList[d.weekId] = {};

          if (typeof this.activityList[d.weekId][d.activityCode] === 'undefined')
            this.activityList[d.weekId][d.activityCode] = {};

          this.activityList[d.weekId][d.activityCode] = d;
        });
        this.checkLoadingComplete();
        console.log('activity list :', this.activityList);
      });
  }

  /*public setWeekMainActivity(type: string) {
    let completeVal: string;
    if (type == 'complete')
      completeVal = 'Y';
    else if (type == 'incomplete')
      completeVal = 'N';
    else
      completeVal = 'T';

    console.log('Main Activity Status to ', type);
    _.each(this.activityList[this.weekData.viewWeek], (d, actCode) => {
      if(!_.contains(['PP1','PP2','RV1','RP1','MP1','MP2'], actCode))
        return;

      const params = {};
      params['lcmsPrdId'] = d['lcmsPrdId'];
      params['activityCode'] = actCode;
      params['currCode'] = d['currCode'];
      params['completeYn'] = completeVal;

      const subActComplete = this.http.put(environment.polyApiUrl + '/enroll/activity/complete', JSON.stringify(params),
        {headers: {'accept':'*!/!*','Content-Type': 'application/json'}, withCredentials: true})
        .subscribe(() => {
          subActComplete.unsubscribe();
          console.log('Main Activity Complete reset 완료 - ', actCode);
        }, error => {
          console.log('Main Activity Complete reset 실패 - ', actCode);
        });

      console.log('문항요청:', actCode);
      const sub1 = this.http.get(environment.polyApiUrl+'/enroll/question/list',
        {params: params, withCredentials: true})
        .subscribe(res => {
          sub1.unsubscribe();

          let reqBody = [];
          _.each(res['data'], (res2, key) => {
            reqBody.push({});
            reqBody[key]['activityCode'] = actCode;
            reqBody[key]['lcmsPrdId'] = d['lcmsPrdId'];
            reqBody[key]['currCode'] = d['currCode'];
            reqBody[key]['completeYn'] = completeVal;
            reqBody[key]['contentsCode'] = res2['contentsCode'];
            reqBody[key]['examPaperCode'] = res2['examPaperCode'];
            reqBody[key]['itmCode'] = res2['itmCode'];
            reqBody[key]['itmNo'] = res2['itmNo'];
            reqBody[key]['firstAnsYn'] = completeVal;

            if (actCode == 'MP1') {
              reqBody[key]['htmlCont'] = '';
              reqBody[key]['actualFileName'] = '';
              reqBody[key]['userFileName'] = '';
              reqBody[key]['fileSize'] = '';
              reqBody[key]['filePath'] = '';
            }
          })
          console.log('문항 reset 요청 - Activity: ', actCode);
          // console.log('string reqbody :', JSON.stringify(reqBody));
          const sub2 = this.http.put(environment.polyApiUrl + '/enroll/questions', JSON.stringify(reqBody),
            {headers: {'accept':'*!/!*','Content-Type': 'application/json'}, withCredentials: true})
            .subscribe(() => {
              sub2.unsubscribe();
              console.log('문항 reset 완료 - activityCode: ', actCode, ' body: ', reqBody);
            }, error => {
              console.log('문항 reset 실패 - activityCode: ', actCode, ' body: ', reqBody);
            })

        })
    })
  }*/

  public saveMainContentsData(reqBody) {
    if (this.isDemo) {
      this.sendMainActSaveCompleteNotifyToContent();
      return;
    }

    console.log('Main Contents answerList 저장 요청');
    let apiURL: string;
    Array.isArray(reqBody) ? apiURL='/enroll/questions' : apiURL='/enroll/question';
    const subsQuestion = this.http.put(environment.polyApiUrl + apiURL, JSON.stringify(reqBody),
      {headers: {'accept':'*/*','Content-Type': 'application/json'}, withCredentials: true})
      .subscribe(res => {
        subsQuestion.unsubscribe();
        console.log('Main Contents answerList 저장 완료 :', reqBody);
        this.sendMainActSaveCompleteNotifyToContent();
      }, error => {
        this._location.back();
        this._helper.closeLoading();
        this.clearIframeMsgFnList();
      });
  }
  public sendMainActSaveCompleteNotifyToContent() {
    const target = document.getElementById(this.currentContentComponent.childFrameElementId)['contentWindow'];
    target.postMessage({op: 'notifySaveActivityQuizDetail', from:'poly'}, '*');
    // withparents Reports review 이면 완료처리를 하지 않는다.
    if( !this.mainContentsData['isReview'] ) {
      this.currentContentComponent.didIncompleteSaving = true;
    }
  }

  public mainContentsData: object = {param: {}, answerList: []};
  public loadMainContentsData(activityCode: string) {
    this._helper.openModal({type: 'loading'});
    const actData = this.activityList[this.weekData.viewWeek][activityCode];
    const body = {
      'currCode': actData['currCode'],
      'learningEleCode': actData['learningEleCode'],
      'lcmsPrdId': actData['lcmsPrdId'],
      'activityCode': activityCode,
      'language': 'EN'
    }
    const contentsDataLoaded$ = new Subject();
    let activityContentsData: object = {};

    console.log('Activity 컨텐츠 등록 중...');
    console.log('컨텐츠 등록 params :', body);
    const subs = this.http.put(environment.polyApiUrl+'/enroll/content', JSON.stringify(body),
      {headers: {'accept':'*/*','Content-Type': 'application/json'}, withCredentials: true})
      .subscribe(res => {
        subs.unsubscribe();

        if (!res['data']['Table1']) {
          console.log('Activity 컨텐츠 배정 안됨');
          return;
        }
        activityContentsData = res['data']['Table1'][0];

        const params2 = new HttpParams()
          .set('currCode', actData['currCode'])
          .set('lcmsPrdId', actData['lcmsPrdId'])
          .set('activityCode', activityCode);

        console.log('Activity Questions 요청...');
        const subs2 = this.http.get(environment.polyApiUrl+'/enroll/question/list',
          {params: params2, withCredentials: true})
        .subscribe(res => {
            subs2.unsubscribe();

            const questionListSrc = res['data'];

            const questionListResult = [];
            _.each(questionListSrc, (d, key) => {
              questionListResult[key] = {};

              let mapName: string;
              activityCode == 'MP1' ? mapName = 'sayItQuiz' : mapName = 'quiz';

              _.each(constant.contentInfoAnswerListPropNameMap[mapName], (matchedName, srcName) => {
                if (matchedName == 'applyYN') {
                  if (questionListSrc[key][srcName] == 'Y' || questionListSrc[key][srcName] == 'N')
                    questionListResult[key][matchedName] = questionListSrc[key][srcName];
                  else
                    questionListResult[key][matchedName] = 'N';
                }
                else
                  questionListResult[key][matchedName] = questionListSrc[key][srcName] || "";
              })

              if (activityCode == 'MP1'){
                questionListResult[key]['attachfileURL'] = environment.resourceURL.userFile + questionListSrc[key]['fileUrl'];
              }
            });
            console.log('/lcms/contents :', activityContentsData);
            console.log('/enroll/question/list :', questionListResult);

            const params = {
              memberCode: this.sessionData['memberCode'],
              learningYearCode: this.sessionData['learningYearCode'],
              termGbn: this.sessionData['semesterGbn'],
              lcmsPrdId: actData['lcmsPrdId'],
              currCode: actData['currCode'],
              activityCode: activityCode,
              learningGbn: activityCode,
            };
            if (activityCode === 'MP1') {
                params['runType'] = 'listen';
            }
            this.mainContentsData['param'] = params;
            this.mainContentsData['answerList'] = questionListResult;
            this.mainContentsData['contentInfoSrc'] = activityContentsData;
            this.mainContentsData['isReview'] = false;

            contentsDataLoaded$.next({
              url: activityContentsData['EXECUTE_FILE_PATH'],
              activityCode: activityCode
            });
          });
      });
    return contentsDataLoaded$;
  }

  /**
   * 메인 컨텐츠 문제 초기화 함수
   */
  public convertingReviewData() {
    _.each(this.mainContentsData['answerList'], answer => {
      answer['applyYN'] = 'N';
    });
    this.mainContentsData['isReview'] = true;
  }

  public flashCardData: object = {vocabs: [], questions: [], contentsInfo: {}};
  public loadFlashCardData(week: number, activityCode: string, currCode = null, learningEleCode= null, lcmsPrdId= null) {
    const flashCardLoaded$ = new Subject();

    if (_.isNull(currCode)) {
      this._helper.openModal({type: 'loading'});
      const d = this.activityList[week][activityCode];
      const body = {
        'currCode': d['currCode'],
        'learningEleCode': d['learningEleCode'],
        'lcmsPrdId': d['lcmsPrdId'],
        'activityCode': activityCode,
        'language': 'EN'
      }

      console.log('FlashCard 컨텐츠 등록 중...');
      // const subs = this.http.get('http://localhost:4200/assets/flashcard_enroll_content.json', {withCredentials: true})  //TESTTEST
      const subs = this.http.put(environment.polyApiUrl+'/enroll/content', JSON.stringify(body),
        {headers: {'accept':'*/*','Content-Type': 'application/json'}, withCredentials: true})
        .subscribe(res => {
          subs.unsubscribe();

          if (!res['data']) {
            console.log('flashcard 컨텐츠 배정 안됨');
            return;
          }
          this.flashCardData['contentsInfo'] = res['data']['ContentsInfo'] || [];
          this.flashCardData['contentsInfo']['currCode'] = d['currCode'];
          this.flashCardData['contentsInfo']['lcmsPrdId'] = d['lcmsPrdId'];
          this.flashCardData['contentsInfo']['activityCode'] = activityCode;
          this.flashCardData['vocabs'] = res['data']['VocabList'] || [];

          const params2 = new HttpParams()
            .set('currCode', d['currCode'])
            .set('lcmsPrdId', d['lcmsPrdId'])
            .set('activityCode', activityCode);

          console.log('FlashCard Questions 요청...');
          const subs2 = this.http.get(environment.polyApiUrl+'/enroll/question/list',
            // const subs2 = this.http.get('http://localhost:4200/assets/flashcard_question_list.json', //TESTTEST
            {params: params2, withCredentials: true})
            .subscribe(res => {
              subs2.unsubscribe();
              this._helper.closeLoading();

              this.flashCardData['questions'] = res['data'] || [];

              console.log('FlashCard Source Data :', this.flashCardData);
              flashCardLoaded$.next();
            });
        });
    }
    else {  //TODO: Teachers 플래시카드 처리
      const params = new HttpParams()
            .set('currCode', currCode)
            .set('learningEleCode', learningEleCode)
            .set('activityCode', activityCode)
            .set('language', 'EN');
      console.log('Teachers FlashCard 컨텐츠 등록 중...');
      const subs = this.http.get(environment.polyFrontUrl + '/lcms/contents', {params: params})
        .subscribe(res => {
          subs.unsubscribe();
          console.log('Flashcard Data for Teachers :', res['data']);

          this.flashCardData['contentsInfo'] = res['data']['ContentsInfo'] || [];
          this.flashCardData['contentsInfo']['currCode'] = currCode;
          this.flashCardData['contentsInfo']['lcmsPrdId'] = lcmsPrdId;
          this.flashCardData['contentsInfo']['activityCode'] = activityCode;
          this.flashCardData['vocabs'] = res['data']['VocabList'] || [];
          this.flashCardData['questions'] = [];

          _.each(res['data']['VocabList'], () => {
            this.flashCardData['questions'].push({
              examPaperCode: 'crsAuthoringCode',
              contentsCode: 'contentsCode',
              firstAns: 'userAnswer',
              firstAnsYn: 'correctYN',
              answer: 'correctAnswer',
              applyYn: 'applyYN',
              completeYn: 'completeYn',
              itmCode: 'objectAuthoringCode',
              itmNo: 'questionNumber',
              questionTypeCode: 'projectAuthoringCode',
              skillCode: 'skillCode'
            });
          });
          this.isDemo = true;
          console.log('FlashCard Source Data :', this.flashCardData);
          flashCardLoaded$.next();
        });
    }
    return flashCardLoaded$;
  }

  public setFlashCardPuzzleData(body: object) {  // 특정 퍼즐 조각 풀기 여부 저장
    if (this.isDemo)
      return;

    const subs = this.http.put(environment.polyApiUrl+'/enroll/question', JSON.stringify(body),
      {headers: {'accept':'*/*','Content-Type': 'application/json'}, withCredentials: true})
      .subscribe(res => {
        subs.unsubscribe();
        // console.log('success 퍼즐 풀기 put :', body['firstAns']);
      });
  }

  public setFlashCardComplete(body: object) { // 해당 주차-액티비티의 모든 카드 완료 여부 저장
    if (this.isDemo)
      return;

    const subs = this.http.put(environment.polyApiUrl+'/enroll/activity/complete', JSON.stringify(body),
      {headers: {'accept':'*/*','Content-Type': 'application/json'}, withCredentials: true})
      .subscribe(res => {
        subs.unsubscribe();
        this.activityList[this.weekData.viewWeek][body['activityCode']]['completeYn'] = 'Y';
        console.log(`Flashcard ${this.weekData.viewWeek}주차 ${body['activityCode']} 완료`);
        console.log('activity list check ', this.activityList[this.weekData.viewWeek][body['activityCode']]);
      });
  }

  private loadProfileData() {
    console.log('세션 데이터 요청...');
    // const subs = this.http.get('http://localhost:4200/assets/response_session.json') //TESTTEST
    const subs = this.http.get(environment.polyApiUrl+'/member/view', {withCredentials: true})
      .subscribe(res => {
        subs.unsubscribe();
        console.log('response session data : ', res);

        this.sessionData = res['data'];
        this.isDemo = (this.sessionData['buyerYn'] == 'N');

        if (!this.isDemo) {
          this.loadMainCache(this.sessionData).subscribe( res2 => {
            if (res2['data']['data']) {
              const cacheData = JSON.parse(decodeURI(res2['data']['data']));
              // console.log('Main Cache init :', cacheData);
              this.mainCache.setValues(cacheData);
              _.each(cacheData['main'], (d, key) => {
                let tmp = JSON.parse(d);
                // console.log(`cache key-${key} d-${d} tmp-${tmp} typeof tmp-${typeof(tmp)}`);
                if (typeof(tmp) == 'object' && !Array.isArray(tmp))
                  localStorage.setItem(key, JSON.stringify(tmp));
                else
                  localStorage.setItem(key, tmp);
              });
            }
            this.isLoadMainCache = true;
            this.checkLoadingComplete();
          });
        } else {
          this.isLoadMainCache = true;
          this.checkLoadingComplete();
        }
      });
  }

  public monthNames = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  private loadWeekData() {
    console.log('week 데이터 요청...');

    const weeksOfMonth = [];
    _.each(this.monthNames, () => {
      weeksOfMonth.push([]);
    });

    // const subs = this.http.get('http://localhost:4200/ecp5/assets/response_week.json') //TESTTEST
    const subs = this.http.get(environment.polyApiUrl+'/enroll/week/list', {withCredentials: true})
      .subscribe(res => {
        subs.unsubscribe();
        console.log('response week data : ', res);

        this.weekData = {
          validWeek: [], // 방학주차를 제외한 모든 주차
          permittedWeek: [], // 구매 주차
          lastWeekOfSeason1: 0, // 첫번째 반기의 마지막 주차
          viewWeek: 0,  // 현재 실행 중인 주차
          seqOfCourseWeek: 0,  // 현재 viewWeek가 validWeek 중에 몇번째 순서인가
          thisWeek: 0,
          untilThisWeek: [],
          firstWeekOfMonth: new Array(12),
          minValidWeek: 0,
          allWeek: [],
          monthNames: [], // 주차의 순서대로 startDate 기준 월의 3자리 이니셜
        };

        const data = this.weekData;
        let firstProductId = null;
        let weekNum: number;
        _.each(res['data'], (d) => {
          if( firstProductId == null )
            firstProductId = parseInt(d['lcmsPrdId']);

          if( parseInt(d['lcmsPrdId']) == firstProductId ) {
            weekNum = parseInt( d['weekId']);

            if( d['vacationIncludeCode'] == 'WK' )
              data.validWeek.push( weekNum );
            if( data.validWeek.length == 12 )
              data.lastWeekOfSeason1 = data.validWeek.slice(-1)[0];
            if( d['tlLessonYn'] == 'Y')
              data.permittedWeek.push( weekNum );
            if( d['thisWeek'] == 'Y')
              data.thisWeek = weekNum;
            this.weekData.monthNames.push(this.monthNames[parseInt(d['startDate'].substring(4, 6), 10) - 1]);
          }
          weeksOfMonth[parseInt(d['startDate'].substring(4, 6)) - 1].push( parseInt(d['weekId']) );
          
        });
        _.each(weeksOfMonth, (d, i) => {
          this.weekData.firstWeekOfMonth[i] = _.min(d);
        });
        const firstMonthIdx = _.indexOf(this.weekData.firstWeekOfMonth, 1);
        // console.log('firstWeekOfMonth :', this.weekData.firstWeekOfMonth);
        // console.log('firstMonthIdx:', firstMonthIdx);
        this.weekData.firstWeekOfMonth = _.filter(this.weekData.firstWeekOfMonth, (week) => {
          return Number.isInteger(week);
        });
        let monthTmp = this.monthNames.slice(firstMonthIdx, firstMonthIdx + this.weekData.firstWeekOfMonth.length);
        if (monthTmp.length < this.weekData.firstWeekOfMonth.length) {
          const appendMonthCnt: number = this.weekData.firstWeekOfMonth.length - monthTmp.length;
          // console.log('month cnt :', this.weekData.firstWeekOfMonth.length);
          // console.log('until 12 cnt :', monthTmp.length);
          // console.log('append month :', this.monthNames.slice(0, appendMonthCnt));
          monthTmp = monthTmp.concat(this.monthNames.slice(0, appendMonthCnt));
        }
        this.monthNames = monthTmp;
        console.log('valid month: ', this.monthNames);

        if( data.thisWeek == 0 )
          data.thisWeek = data.validWeek[0];

        data.untilThisWeek =  _.map(Array.from(Array(data.thisWeek).keys()), (d) => { return d+1; });
        let validWeeks = _.filter(data.untilThisWeek, d => {
          return this.getWeekType(d) != 'notPermitted';
        });
        data.minValidWeek = _.min(validWeeks);
        data.untilThisWeek = data.untilThisWeek.slice(data.minValidWeek-1);
        if (data.untilThisWeek.length == 0)
          data.untilThisWeek.push(data.thisWeek);
        // console.log('####### valid weeks ########', data.untilThisWeek);

        if (data.validWeek.length > 1)
          data.allWeek = _.map(Array.from(Array(_.max(data.validWeek)).keys()), (d) => { return d+1; });

        data.viewWeek = data.thisWeek;

        console.log('week data : ', this.weekData);
        this.generateWeekGroup();
        this.checkLoadingComplete();
      });
  }

  public getWeekType(week: number): string {
    if( _.contains(this.weekData.validWeek, week) ) {
      if( _.contains(this.weekData.permittedWeek, week) )
        return 'learningWeek';
      else
        return 'notPermitted';
    } else
      return 'noPoly';
  }
  public getWeekStatusOfMainActs(week: number): string {
    let completeWeekActCnt: number = 0;
    _.each(this.activityList[week], (d, actCode) => {
      if(_.contains(['PP1','PP2','RV1','RP1','MP1','MP2'], actCode) && d['completeYn'] == 'Y')
        completeWeekActCnt++;
    })
    if (completeWeekActCnt == 6)
      return 'complete';
    else
      return 'incomplete';
  }

  public getWeekGroupNum(week: number): number {
    return this._helper.getIndexOfK(this.weekGroup, week)[0];
  }

  private setWeekData(key: string, value: any) {
    this.weekData[key] = value;

    function pushDataTest() { }
    pushDataTest();
  }

  public setViewWeek(week: number) {
    const data = this.weekData;

    if (week <= data.lastWeekOfSeason1)
      this._sndMgr.mainBGMSeason = 'spring';
    else
      this._sndMgr.mainBGMSeason = 'summer';

    this.setWeekData('viewWeek', week);
    data.seqOfCourseWeek = data.validWeek.indexOf(week)+1;
    data.thisWeek == data.viewWeek ? this.isThisWeek = true : this.isThisWeek = false;

    if ( !_.contains(data.validWeek, week) )
      console.log('No e-Poly');
    else if ( !_.contains(data.permittedWeek, week) )
      console.log('미구매');
    else {
      console.log('학습 주차');
    }
    // console.log('Week', week, ' | Sequence of CourseWeek : ', data.seqOfCourseWeek);
  }

  // valid week 4개씩 한 그룹으로
  private generateWeekGroup():any {
    let max5 = 1, grp = 0;
    for( let cnt = 1; cnt <= this.weekData.validWeek.slice(-1)[0]; cnt++ ) {
      if( this.weekData.validWeek.includes(cnt) ){
        max5++;
      }
      if (grp > 5) {
        console.log( 'error : ', '현재 group은 ' +  grp + ' Group 입니다. [Group 갯수는 5를 넘을수 없습니다.]' );
        console.log( 'error : ', '방학를 뺀 주차는 24주차 넘을수 없습니다. 방학주차를 지정하여 주십시오.');
      }
      this.weekGroup[grp].push(cnt);
      if( max5 == 5 ) {
        grp++;
        max5 = 1;
      }
    }
    console.log('week group :', this.weekGroup);
  }

  /**
   * 캐릭터 목록 가져오기
   */
  public memberCharacterList() {
    return this.http.get(environment.polyApiUrl + '/member/character/list', {withCredentials: true});
  }

  /**
   * 선택한 캐릭터 수정
   * @param params 캐릭터
   */
  public memberCharacterModify(character) {
    return this.http.put(environment.polyApiUrl + '/member/profile', JSON.stringify( character ),
        {headers: {'accept' : '*/*', 'Content-Type': 'application/json'}, withCredentials: true});
  }

  /**
   * 캐릭터 삭제
   */
  public memberCharacterDelete() {
    return this.http.delete(environment.polyApiUrl + '/member/profile', {withCredentials: true});
  }

  private historyActCode = _.clone(constant.mainContentsActCode).concat(constant.gameContentsActCode);
  private registStudyStart() {
    if (this.isDemo)
      return false;
    const paramAll = this.mainContentsData['param'];
    if (!_.contains(this.historyActCode, paramAll['activityCode']))
      return false;

    const param = {lcmsPrdId:paramAll['lcmsPrdId'], activityCode:paramAll['activityCode'], currCode:paramAll['currCode']};
    this.http.post(environment.polyApiUrl+'/enroll/activity/history', param, {withCredentials: true})
      .subscribe(res => {
        // console.log('학습 시작시간 등록 성공: ', param);
      });
  }
  private registStudyEnd() {
    if (this.isDemo)
      return false;
    const paramAll = this.mainContentsData['param'];
    if (!_.contains(this.historyActCode, paramAll['activityCode']))
      return false;

    const param = {lcmsPrdId:paramAll['lcmsPrdId'], activityCode:paramAll['activityCode'], currCode:paramAll['currCode']};
    this.http.put(environment.polyApiUrl+'/enroll/activity/history', param, {withCredentials: true})
      .subscribe(res => {
        // console.log('학습 종료시간 등록 성공: ', param);
      });
  }

  private studyTimeLimitSec;
  public checkGameTime$ = new Subject<boolean>();
  public checkGameTime(actCode: string) {
    // console.log('check game time act', actCode);
    if (_.contains(constant.gameContentsActCode, actCode)) {
      this.http.get(environment.polyApiUrl + '/enroll/activity/history/game-time', {withCredentials: true })
        .subscribe(res => {
        console.log('game time response :', res);
        let gameTime: number;
        res['data'] ? gameTime = parseInt(res['data']['totalSecond']) : gameTime = 0;
        this.studyTimeLimitSec = gameTime;
        if (constant.studyTimeLimitMax-10 < parseInt(this.studyTimeLimitSec)) {
          this._helper.closeLoading();
          this._helper.openModal({type: 'gameTimeLimitAlert'});
          this.checkGameTime$.next(false);
        }
        else
          this.checkGameTime$.next(true);
      })
    }
    else
      this.checkGameTime$.next(true);
  }

  /**
   * 캐릭터 이미지를 저장한다.
   */
  public setCharacterPath() {
    if (this.sessionData['character'] != null ) {
      this.characterPath = environment.resourceURL.static
        + '/images/week_tree/profile_' + (this.sessionData['character']['characterName']).toLowerCase() + '.jpg';
    } else {
      this.characterPath = environment.opURL + this.sessionData['pictureUrl'];
    }
    console.log('characterPath :' + this.characterPath);
  }

  private isAfterChange1s = true;
  private afterChangeDelayTimer() {
    setTimeout(() => {
      this.isAfterChange1s = true;
    },1000);
  }
  public bgmToggle(bgmCls = '/main') {
    if (!this.isAfterChange1s)
      return 'skip';
    else {
      this.isAfterChange1s = false;
      this.afterChangeDelayTimer();
    }
    // console.log(`##### called main header bgmToggle - ${this._helper.isBgmMute}`);
    this._sndMgr.playEventSound('common', 'buttonClick');
    if (this.getFirstStatus('BGMOff')) {
      this.setFirstStatus('BGMOff', false);
      this._sndMgr.bgmPlay(bgmCls);
      return 'on';
    }
    else {
      this.setFirstStatus('BGMOff', true);
      this._sndMgr.bgmPause();
      return 'off';
    }
  }

  public getBGMIconClass(): string {
    if (this.initDataLoaded) {
      if ( this.getFirstStatus('BGMOff') )
        return '_mute';
      else
        return '';
    }
    else
      return '';
  }

  /**
   * 주차 목록
   */
  public enrollWeekList() {
    return this.http.get(environment.polyApiUrl + '/enroll/week/list', {withCredentials: true});
  }
}
