import { Component, OnInit, AfterViewInit } from '@angular/core';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import {DataManagerService} from "../../services/data-manager.service";
import {HelperService} from '../../services/helper.service';
import { CommonModule } from '../../common.module';
import {Router} from '@angular/router';
import { _ } from 'underscore';
import {SoundManagerService} from "../../services/sound-manager.service";
import { environment } from 'src/environments/environment.prod';
import { constant } from '../../global/constans/constant';
declare var TweenMax: any;

@Component({
  selector: 'app-week-tree',
  templateUrl: './week-tree.component.html',
  styleUrls: ['./week-tree.component.css']
})
export class WeekTreeComponent implements OnInit, AfterViewInit {

  public userPath = environment.opURL;
  public imagePath = environment.resourceURL.static + '/images';
  public weekGroupPerSeason: Array<Array<number>> = [[], []];
  private thisMonthIdx: number;
  public isSeason2: boolean;
  public movieBtnStyle: string = 'btn-epilogue';
  public movieIconStyle: string = 'icon-epilogue';
  private isInit: boolean = false;

  constructor(public _dataMgr: DataManagerService, private router: Router,
              protected _helper: HelperService, public _sndMgr: SoundManagerService,
              private commonModule: CommonModule) { }

  public config: SwiperConfigInterface = {
    keyboard: true,
    mousewheel: true,
    observer: true,
    spaceBetween: 196,
    touchReleaseOnEdges: true,
    navigation: {
      nextEl: '.week-tree .btn-swiper-next',
      prevEl: '.week-tree .btn-swiper-prev',
    }
  };

  ngOnInit() {
    this.commonModule.activityClass = 'week-tree';
    _.each(this._dataMgr.weekGroup, (d, i) => {
      i < 3 ? this.weekGroupPerSeason[0].push(d) : this.weekGroupPerSeason[1].push(d);
    })
    this.isSeason2 = this._dataMgr.weekData.viewWeek > this._dataMgr.weekData.lastWeekOfSeason1;
    this.setMovieTagStyle(this.isSeason2);
    this._dataMgr.setCharacterPath();

    this.thisMonthIdx = _.map(this._dataMgr.weekGroup, month => {
      return _.contains(month, this._dataMgr.weekData.thisWeek);
    }).indexOf(true);

    this.isInit = true;
    setTimeout(() => {
      this.isInit = false;
    }, 1000);
  }

  ngAfterViewInit() {
    this.weekTreeProfilePos(this._dataMgr.weekData.viewWeek);
  }

  public changeSeason(seasonIdx: number) {
    seasonIdx == 1 ? this.isSeason2 = true : this.isSeason2 = false;
    const $profile  = document.querySelector('.week-tree .icon-user');
    let viewWeekSeason = this._dataMgr.weekData.viewWeek > this._dataMgr.weekData.lastWeekOfSeason1 ? 1 : 0;
    if (viewWeekSeason != seasonIdx)
      TweenMax.to($profile, 0, {display: 'none'});
    else
      TweenMax.to($profile, 0.3, {display: 'block'});

    this.setMovieTagStyle(seasonIdx);
  }

  private setMovieTagStyle(seasonIdx: any) {
    if (seasonIdx == 1) {
      this.movieBtnStyle = 'btn-epilogue';
      this.movieIconStyle = 'icon-epilogue';
    }
    else {
      this.movieBtnStyle = 'btn-intro';
      this.movieIconStyle = 'icon-intro';
    }
  }
  public playPrologEpilogVideo() {
    if (this.isSeason2)
      this._dataMgr.playVideoOnDemand$.next({type:'epilog'});
    else
      this._dataMgr.playVideoOnDemand$.next({type:'initProlog'});
  }

  public getWeekIconStyle(week: number): string {
    return week.toString() + ' ' + (this._dataMgr.getWeekType(week) == 'noPoly' ? 'disabled' : 'default');
  }

  public getWeekFlowerStyle(week: number): string {
    let type: string;
    let completeCnt = 0;
    _.each( this._dataMgr.activityList[week], (actData, actCode) => {
      if (_.contains(['PP1','PP2','RV1','RP1','MP1','MP2'], actCode)) {
        if (actData['completeYn'] == 'Y')
          completeCnt++;
      }
    })
    if (completeCnt == 6) {
      if (week == this._dataMgr.weekData.thisWeek && this.isInit)
        type = 'ing complete motion';
      else if (week == this._dataMgr.weekData.thisWeek)
        type = 'ing complete';
      else
        type = 'complete';
    }
    else {
      if (week == this._dataMgr.weekData.thisWeek)
        type = 'ing incomplete';
      else
        type = 'incomplete';
    }

    // if (this._dataMgr.getWeekType(week) == 'noPoly' && week == this._dataMgr.weekData.thisWeek)
    //   type = 'ing-noPoly???'; // TODO this week가 방학 주차일 경우의 꽃 디자인 개선?
    if (this._dataMgr.getWeekType(week) == 'noPoly')
      type = 'disabled';
    if (week > this._dataMgr.weekData.thisWeek)
      type = 'default';

    return week.toString() + ' ' + type;
  }

  public getMonthMonsterStyle(monthIdx: number): string {
    let monthStyle: string = 'disabled';

    if (monthIdx < this.thisMonthIdx)
      monthStyle = 'passby';
    else if (monthIdx == this.thisMonthIdx && (this._dataMgr.getWeekType(this._dataMgr.weekData.thisWeek) != 'noPoly')) {
      monthStyle = 'monster' + (this._dataMgr.weekData.validWeek.indexOf(this._dataMgr.weekData.thisWeek)+1) + ' ';
      monthStyle += this._dataMgr.getWeekStatusOfMainActs(this._dataMgr.weekData.thisWeek);
    }
    else
      monthStyle = 'disabled';

    if (monthIdx == this._dataMgr.getWeekGroupNum(this._dataMgr.weekData.viewWeek)) {
      monthStyle = 'monster' + (this._dataMgr.weekData.validWeek.indexOf(this._dataMgr.weekData.viewWeek)+1) + ' ';
      monthStyle += this._dataMgr.getWeekStatusOfMainActs(this._dataMgr.weekData.viewWeek);
    }
    if ('noPoly' == this._dataMgr.getWeekType(this._dataMgr.weekData.viewWeek)
      && monthIdx == this._dataMgr.getWeekGroupNum(this._dataMgr.weekData.viewWeek))
      monthStyle = 'disabled';

    return monthStyle;
  }

  public playMonthVideo(monthIdx: number) {
    const weeksToComplete = [];
    const tmpWeeks = this._dataMgr.weekGroup[monthIdx];
    _.each(tmpWeeks, week => {
      if ( this._dataMgr.getWeekType(week) != 'noPoly' )
        weeksToComplete.push(week);
    })
    const weekCntToComplete = weeksToComplete.length;
    let needToCompleteActsCnt = 6 * weekCntToComplete;
    _.each(this._dataMgr.activityList, (actDataOfWeek, week) => {
      if ( _.contains(weeksToComplete, parseInt(week)) ) {
        _.each(actDataOfWeek, (d, actCode) => {
          if (_.contains(constant.mainContentsActCode, actCode) && d['completeYn'] == 'Y')
            needToCompleteActsCnt--;
        })
      }
    });
    if (needToCompleteActsCnt == 0)
      this._dataMgr.playVideoOnDemand$.next({type: 'monthlyEpilog', idx:monthIdx+1});
    else
      this._dataMgr.playVideoOnDemand$.next({type: 'prolog', idx:monthIdx+1});
  }

  public getWeekButtonStyle(week: number) {
    return week > this._dataMgr.weekData.thisWeek;
  }

  public getSeasonStyle(): string {
    if( this._dataMgr.weekData.viewWeek <= this._dataMgr.weekData.lastWeekOfSeason1 )
      return 'season1';
    else
      return 'season2';
  }

  public preventGoWeekClickTimer;
  public isPreventGoWeekClick: boolean = false;
  public goSelectedWeekOfMain(week: number) {
    this.isPreventGoWeekClick = false;
    this.preventGoWeekClickTimer = setTimeout(() => {
      if (!this.isPreventGoWeekClick) {
        this._sndMgr.playEventSound("main", "otherWeekClick");
        switch (this._dataMgr.getWeekType(week)) {
          case 'noPoly':
            this._helper.openModal({type: 'noPoly'});
            break;
          case 'notPermitted':
            this._helper.openModal({type: 'notBuyWeek'});
            break;
          default:
            this.weekTreeProfilePos(week);
            setTimeout(() => {
              this._dataMgr.setViewWeek(week);
              this._sndMgr.playEventSound("main", "weekTreeStartLearning");
              this.router.navigate(['/main']);
            }, 1500)
        }
      }
    }, 1000);
  }
  public doubleClickGoWeek() {
    this.isPreventGoWeekClick = true;
    clearTimeout(this.preventGoWeekClickTimer);
  }

  private weekTreeProfilePos(nextWeek: number) {
    setTimeout(() => {
      this._sndMgr.playEventSound("main", "weekTreeMoveComplete");
    }, 500)

    const $profile  = document.querySelector('.week-tree .icon-user');
    const itemRect  = document.querySelectorAll('.week-tree .month__item-week')[nextWeek - 1].getBoundingClientRect();
    const outerRect = document.getElementById('content').getBoundingClientRect();

    // console.log('profilepos :', $profile, itemRect, outerRect);
    TweenMax.to(
      $profile,
      1, {y: '-=20',onComplete() {
        //프로필 위치 이동
          TweenMax.set( $profile,
            {x: ((itemRect.left * this.ratio()) - outerRect.left), y: itemRect.top}//2018. 11. 15. : ratio function 추가
          );
          //프로필 나타나는 모션
          TweenMax.fromTo($profile,0.3,{scaleY: 0},{scaleY: 1});
        },
        onCompleteScope:this
      }
    );
  }

  private ratio(): number {
    let ratio: number;
    if (this._dataMgr.isMobile) {
      const sw = 1024;
      const bw = document.querySelector("body").clientWidth;
      ratio = sw / bw;
      if (ratio < 1)
        ratio = 1;
    } else
      ratio = 1;
    return ratio;
  }
}
