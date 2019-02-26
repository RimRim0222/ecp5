import {Component, OnInit, OnDestroy, ViewChild, NgZone} from '@angular/core';
import {DataManagerService} from '../services/data-manager.service';
import {HelperService} from '../services/helper.service';
import {SoundManagerService} from '../services/sound-manager.service';
import { environment } from '../../environments/environment';
import { CommonModule } from './../common.module';
import {Router} from '@angular/router';
import { _ } from 'underscore';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css', './main.custom.component.css']
})
export class MainComponent implements OnInit, OnDestroy {
  public dataInitialized: boolean = false;
  public index: number;
  private imagePath = environment.imagePath;
  @ViewChild('touchGuide') public touchGuideEl: any;

  public activityInfo: Array<object> = [
    {name: 'chant', actId: 'PP1', id: '01', status: 'default', subId: '01-2nd'},
    {name: 'play',  actId: 'PP2', id: '02', status: 'default', subId: '02-2nd'},
    {name: 'read',  actId: 'RV1', id: '03', status: 'default'},
    {name: 'check', actId: 'RP1', id: '04', status: 'default'},
    {name: 'say',   actId: 'MP1', id: '05', status: 'default'},
    {name: 'find',  actId: 'MP2', id: '06', status: 'default'}
  ];

  constructor(public _helper: HelperService, public _sndMgr: SoundManagerService, public zone: NgZone,
              private commonModule: CommonModule, public _dataMgr: DataManagerService, private router: Router) { }

  ngOnInit() {
    console.log('Activity Main OnInit');
    this.commonModule.activityClass = 'main';

    if (this._dataMgr.initDataLoaded) {
      this.init();
      this._sndMgr.bgmResume('/main');
    }
    else {
      const subs = this._dataMgr.initDataLoaded$.subscribe(() => {
        subs.unsubscribe();
        this._helper.closeLoading();
        console.log('ActivityMain - DataManager Initialized');
        this.init();
        this.afterInit();
      });
    }
  }

  private init() {
    this.processDemoUser();
    this.dataInitialized = true;

    const URLParam = new URLSearchParams(window.location.search);
    const week = parseInt(URLParam.get('week'));
    if (Number.isInteger(week))
      this.changeWeek(week);
    else
      this.changeWeek(this._dataMgr.weekData.viewWeek);

    this._dataMgr.updateMainActStatus$.subscribe(() => {
      this.setActStatusInfo(this._dataMgr.weekData.viewWeek);
    })

    let lastRewardAct: object = {activityCode: null, week: null};
    this._dataMgr.readyToRewardActivityCode$.subscribe(actCode => {
      const actInfo = _.where(this.activityInfo, {actId: actCode})[0];
      if (actInfo['status'] == 'complete')
        return;
      if (this._dataMgr.weekData.viewWeek == lastRewardAct['week'] && actCode == lastRewardAct['activityCode'])
        return;

      lastRewardAct['activityCode'] = _.clone(actCode);
      lastRewardAct['week'] = _.clone(this._dataMgr.weekData.viewWeek);

      this._sndMgr.playEventSound('main', 'rewardSound3');  //사운드 재생
      this._helper.openModal({type: `mainReward1`});  // 엄지척/excellent 팝업 후 보상 모달 열기
      const rewardCompSub = this._dataMgr.completeRewardAction$.subscribe(res => {
        rewardCompSub.unsubscribe();
        actInfo['status'] = 'complete';

        const weekActsData = this._dataMgr.activityList[this._dataMgr.weekData.viewWeek];
        weekActsData[actInfo['actId']]['completeYn'] = 'Y';

        // 주차별 6개 액티비티 완료
        let completeWeekActCnt: number = 0;
        _.each(weekActsData, d => {
          if (d['completeYn'] == 'Y')
            completeWeekActCnt++;
        })
        if (completeWeekActCnt == this.activityInfo.length) {
          const sub = this._dataMgr.epilogEnded$.subscribe(() => {
            sub.unsubscribe();
            this._helper.openModal({type: `weeklyComplete`});
          })
        }

        if (!_.isNull(this._dataMgr.afterContentTargetComp)) {
          const subEpilog = this._dataMgr.epilogEnded$.subscribe(() => {
            subEpilog.unsubscribe();
            console.log('after content - target comp with parent : ', this._dataMgr.afterContentTargetComp);
            this._dataMgr.isSetProgressWeekSlidePos = true;
            window.history.go(-2);
            this._dataMgr.afterContentTargetComp = null;
          })
        }
        this._dataMgr.playEpilog$.next(`week${this._dataMgr.weekData.seqOfCourseWeek}.mp4`);
      });
    });
  }

  private processDemoUser() {  // 데모일 때 check it 제외
    if (this._dataMgr.isDemo) {
      // this.activityInfo.length = 5;
      this.activityInfo.splice(3, 1);
    }
  }

  private afterInit() {  // 학기 및 월별 프롤로그, 메인BGM, 가이드 어포던스 재생 초기화
    const isInitPrologPlayed = this._dataMgr.getFirstStatus('initPrologVideo');
    const isMonthlyPrologPlayed = this._dataMgr.getFirstStatus('prologVideo')[this._dataMgr.getWeekGroupNum(this._dataMgr.weekData.viewWeek)];

    if ( !isMonthlyPrologPlayed ) {
      this._dataMgr.monthlyPrologEnded$.subscribe(() => {
        this.processBGMAndGuideAffordance();
      })
    }
    else if ( !isInitPrologPlayed ) {
      this._dataMgr.initPrologEnded$.subscribe(() => {
        this.processBGMAndGuideAffordance();
      })
    }
    else
      this.processBGMAndGuideAffordance();
  }

  private processBGMAndGuideAffordance() {
    this._sndMgr.isAfterInitBGM = true;
    this._dataMgr.setFirstStatus('BGMOff', this._dataMgr.getFirstStatus('BGMOff'));
    this._sndMgr.bgmPlay('/main');
    this.touchGuideOpen('init');
  }

  public checkNotBuyWeekAndOutOfSlide(offset: number) {
    const data = this._dataMgr.weekData;
    const targetWeek = data.viewWeek + offset;
    if (this._dataMgr.getWeekType(targetWeek) == 'notPermitted' && !_.contains(targetWeek, data.untilThisWeek))
      this._helper.openModal({type: 'notBuyWeek'});
  }

  private monsterSpriteChangeTimer = setInterval(() => {}, 0);
  private monsterSpriteChangeTimer2 = setTimeout(() => {}, 0);
  private week2SprinteType: string = '_type1';
  public changeWeek(week: number) {
    const data = this._dataMgr.weekData;
    if (!_.contains(data.untilThisWeek, week) || week == 0) {
      this._helper.openModal({type: 'commonModal', msg: "유효하지 않은 주차입니다."});
      this.dataInitialized = false;
      document.getElementsByClassName('hr-group')[0]['style']['display'] = 'none';
      return;
    }
    this._dataMgr.setViewWeek(week);

    switch (this._dataMgr.getWeekType(week)) {
      case 'noPoly':
        this._helper.openModal({type: 'noPoly'});
        break;
      case 'notPermitted':
        this._helper.openModal({type: 'notBuyWeek'});
        break;
    }

    let grp = this._dataMgr.getWeekGroupNum(week);
    if (!this._dataMgr.checkPrologPlayComplete(grp))
      this._dataMgr.playProlog$.next(['prolog_' + (grp + 1) + '.mp4', grp]);

    // 마지막 에필로그 재생
    // if ( _.last(this._dataMgr.weekData.validWeek) == week && !this._dataMgr.getFirstStatus('epilogVideo') )
    //   this._dataMgr.playVideoOnDemand$.next({type: 'totalEpilog'});

    if (week == 2) {  // 2주차 동물의 스프라이트 예외 처리
      this.week2SprinteType = '_type1';
      this.monsterSpriteChangeTimer = setInterval(() => {
        this.week2SprinteType = '_type2';
        this.monsterSpriteChangeTimer2 = setTimeout(() => {
          this.week2SprinteType = '_type1';
        }, 3000);
      }, 7000);
    }
    else {
      clearInterval(this.monsterSpriteChangeTimer);
      clearTimeout(this.monsterSpriteChangeTimer2);
      this.week2SprinteType = '';
    }

    this.setActStatusInfo(week);
  }

  private setActStatusInfo(week: number) {
    // 액티비티 완료, 미완료, 미실행 여부에 대한 하단 버튼 상태 세팅
    _.each(this.activityInfo, (d) => {
      switch (this._dataMgr.activityList[week][d['actId']]['completeYn']) {
        case 'Y':
          d.status = 'complete';
          break;
        case 'N':
          d.status = 'incomplete';
          break;
        default:
          d.status = 'default';
      }
    });
  }

  private getActsStatusOfWeek(week: number): string {
    let total: number;
    if (this._dataMgr.isDemo)
      total = 5;
    else
      total = 6;

    for (let act of this.activityInfo) {
      // console.log(act);
      if (act['status'] == 'complete')
        total--;
    }

    if (total == 0)
      return "_complete1";
    else
      return "_after_leg" + total.toString() + this.week2SprinteType;
  }

  public getCharacterStyle(viewWeek: number): string { // 몬스터 치료완료, 남은 상처에 따라 스프라이트 class 이름 return
    switch (this._dataMgr.getWeekType(viewWeek)) {
      case 'learningWeek':
        return 'week' + this._dataMgr.weekData.seqOfCourseWeek.toString() + this.getActsStatusOfWeek(viewWeek);
      case 'notPermitted':
        break;
      case 'noPoly':
        break;
    }
  }

  public playMonsterHurtSound() { // 몬스터 클릭시 상태에 따른 대사 재생
    if ( this._dataMgr.getWeekType(this._dataMgr.weekData.viewWeek) == 'learningWeek' ) {
      let hurtOrThanks: string;
      let familyOrder: string;
      this._dataMgr.weekData.seqOfCourseWeek%4 == 0 ? familyOrder = '4' : familyOrder = (this._dataMgr.weekData.seqOfCourseWeek%4).toString();
      this.getActsStatusOfWeek(this._dataMgr.weekData.viewWeek) == '_complete1' ? hurtOrThanks = 'Thanks' : hurtOrThanks = 'Hurt';
      const random = this._helper.generateRandom(1, 3).toString();

      this._sndMgr.playEventSound('main', 'monster' + familyOrder + hurtOrThanks + random );
    }
  }

  public getSeasonStyle(): string {
    if (this._dataMgr.weekData.viewWeek <= this._dataMgr.weekData.lastWeekOfSeason1)
      return 'season1';
    else
      return 'season2';
  }

  public getMonsterBG(): string {  // 몬스터별 근접 배경 설정
    return (this._dataMgr.getWeekGroupNum(this._dataMgr.weekData.viewWeek)+1).toString();
  }

  public openMainContentFrame(activityCode: string) {
    switch (this._dataMgr.getWeekType(this._dataMgr.weekData.viewWeek)) {
      case 'noPoly':
        this._helper.openModal({type: 'noPoly'});
        break;
      case 'notPermitted':
        this._helper.openModal({type: 'notBuyWeek'});
        break;
      default:
        this._sndMgr.playEventSound('main', activityCode + 'Click');
        const subs = this._dataMgr.loadMainContentsData(activityCode)
          .subscribe(res => {
            subs.unsubscribe();
            const param = {url: res['url'], activityCode: res['activityCode']};
            console.log('activityCode : ', activityCode);
            if (activityCode === 'MP1') {
              console.log('activityCode : ', this._dataMgr.mainContentsData['param']['runType']);
              param['runType'] = this._dataMgr.mainContentsData['param']['runType'];
            }
            this._helper.openContentFrame('contents', param);
          });
    }
  }

  public isTouchGuideOpen: boolean = false;
  public touchGuideOpen(type: string) { // 가이드 어포던스 열기
    // console.log('guide open call');
    if (!this._dataMgr.getFirstStatus('initGuideAffordancePlayed')) {
      this.isTouchGuideOpen = true;
      setTimeout(() => {
        // console.log('timeout touch guide, isTouchGuideOpen? ', this.isTouchGuideOpen);

        if (this.isTouchGuideOpen)
          this.touchGuideClose();
      }, 5000);
      this._dataMgr.setFirstStatus('initGuideAffordancePlayed', true);
    }
  }
  public touchGuideClose() {  // // 가이드 어포던스 닫기
    this.isTouchGuideOpen = false;
    this.touchGuideEl.nativeElement.remove();
  }

  ngOnDestroy() {
    clearInterval(this.monsterSpriteChangeTimer);
    clearTimeout(this.monsterSpriteChangeTimer2);
  }
}
