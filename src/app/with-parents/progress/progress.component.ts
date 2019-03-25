import { Component, OnInit } from '@angular/core';
import {DataManagerService} from "../../services/data-manager.service";
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import {CommonModule} from "../../common.module";
import { _ } from 'underscore';
import {HelperService} from "../../services/helper.service";
import {SoundManagerService} from "../../services/sound-manager.service";
import { environment } from 'src/environments/environment';
import { WithParentsTranslateService } from '../with-parents.translate.service';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent implements OnInit {

  public imagePath = environment.resourceURL.image;
  public langType: string = this._translate.translate.getDefaultLang();

  public scrollWeekIdx = 0;
  public progressData: Array<object>;
  public swiperActiveIndex = 0;
  private activityOrder = ['PP1', 'PF1', 'PP2', 'RV1', 'RF1', 'RP1', 'MP1', 'MP1', 'MP2'];
  public weekHeaderStyle: Array<object>;
  public monthName = this._dataMgr.monthNames[0];
  public config: SwiperConfigInterface = {
    speed: 300,
    spaceBetween: 0,
    slidesPerView: 5,
    navigation: {
      nextEl: '.with-parents-progress .btn-swiper-prev-week',
      prevEl: '.with-parents-progress .btn-swiper-next-week',
    }
  };

  constructor(private commonModule: CommonModule, private _dataMgr: DataManagerService,
              public _helper: HelperService, public _sndMgr: SoundManagerService,
              public _translate: WithParentsTranslateService) { }

  ngOnInit() {
    this._sndMgr.bgmPlay('none');
    this.commonModule.activityClass = 'with-parents-progress';

    if (this._dataMgr.isSetProgressWeekSlidePos) {
      this.scrollWeekIdx = this._dataMgr.weekData.viewWeek - 1;
      this._dataMgr.isSetProgressWeekSlidePos = false;
    }
    else if (this._dataMgr.weekData.thisWeek > _.max(this._dataMgr.weekData.validWeek)-5)
      this.scrollWeekIdx = this._dataMgr.weekData.thisWeek - 5;
    else if (this._dataMgr.weekData.thisWeek >= 3)
      this.scrollWeekIdx = this._dataMgr.weekData.thisWeek - 3;

    //this.monthName = this._dataMgr.monthNames[this._dataMgr.getWeekGroupNum(this.scrollWeekIdx+1)];
    this.monthName = this._dataMgr.weekData.monthNames[this.scrollWeekIdx + 1];
    this.weekHeaderStyle = _.map(this._dataMgr.weekData.allWeek, week => {
      let tmp: object;

      if (this._dataMgr.getWeekType(week) == 'noPoly')
        tmp = {title: `Week${week}`, headerCls: 'disabled'};
      else if (week <= this._dataMgr.weekData.thisWeek)
        tmp = {title: `Week${week}`, headerCls: 'default'};
      else
        tmp = {title: `Week${week}`, headerCls: 'disabled'};

      if (week == this._dataMgr.weekData.thisWeek)
        tmp = {title: `This Week`, headerCls: 'this-week'};

      return tmp;
    })
    console.log('weekHeaderStyle :', this.weekHeaderStyle);

    /* 첫주/막주 < <<    >> > 버튼 삭제 */
    //let btnPrevMonth = document.querySelector(".btn-swiper-prev-month");
    let btnPrevWeek = document.querySelector(".btn-swiper-prev-week");
    //let btnNextMonth = document.querySelector(".btn-swiper-next-month");
    let btnNextWeek = document.querySelector(".btn-swiper-next-week");

    if (this.scrollWeekIdx == 0) {
      //btnPrevMonth.classList.add("hidden");
      btnPrevWeek.classList.add("disabled");
    } else if (this.scrollWeekIdx >= this._dataMgr.weekData.allWeek.length-5) {
      //btnNextMonth.classList.add("hidden");
      btnNextWeek.classList.add("disabled");
    }
    /* //첫주 막주 < <<    >> > 버튼 삭제 */

    this.progressData = [];
    _.each(this._dataMgr.weekData.allWeek, week => {
      const weekData = {};

      if (week <= this._dataMgr.weekData.thisWeek) {
        _.each(this.activityOrder, actCode => {
          weekData[actCode] = {};
          if (this._dataMgr.getWeekType(week) == 'noPoly')
            weekData[actCode] = {btnCls: 'vacation', text: 'No e-POLY', disabled: true};
          else if (this._dataMgr.activityList[week][actCode]['completeYn'] == 'Y')
            weekData[actCode] = {btnCls: 'complete', text: 'Well done!', disabled: false};
          else
            weekData[actCode] = {btnCls: 'default', text: 'Go!', disabled: false};

          _.extend(weekData[actCode], {week: week, actCode: actCode});
        })
      }
      else {
        _.each(this.activityOrder, actCode => {
          weekData[actCode] = {week: week, actCode: actCode, btnCls: 'disabled', text: '', disabled: false};
        })
      }

      if (weekData['MP1']['btnCls'] == 'default' || weekData['MP1']['btnCls'] == 'disabled')
        weekData['MP11'] = {week: week, actCode: 'MP11', btnCls: 'disabled', text: '', disabled: true};
      else {
        weekData['MP11'] = _.clone(weekData['MP1']);
        weekData['MP11']['actCode'] = 'MP11';
      }

      this.progressData.push(weekData);
    })
    this.setReviewStyle(this._dataMgr.lastRunContentsOfProgress);

    this._dataMgr.completeAllFlashCard$.subscribe(actData => {
      this.clearReviewStyle();
      const tmp = this.progressData[actData['week']][actData['actCode']];
      tmp['btnCls'] = 'complete review';
      tmp['text'] = 'Well done!';
    })
    console.log('progress data : ', this.progressData);
  }

  public openContent(week, actCode: string, btnCls: string, listenOrChant: string = null) {
    console.log('open conte : week - ', week, ' actcode - ', actCode);
    if (parseInt(week) > this._dataMgr.weekData.thisWeek) {
      this._helper.openModal({type: 'commonModal', msg: 'Activity is not ready yet.'});
      return;
    }
    if (this._dataMgr.getWeekType(week) == 'notPermitted') {
      this._helper.openModal({type: 'notBuyWeek'});
      return;
    }
    this._dataMgr.setViewWeek(week);

    let isSayItChant: boolean = false;
    if (actCode != 'PF1' && actCode != 'RF1') {
      if (actCode == 'MP11') {
        actCode = 'MP1';
        isSayItChant = true;
      }

      const subs = this._dataMgr.loadMainContentsData(actCode)
        .subscribe(res => {
          subs.unsubscribe();

          let param = {url: res['url'], activityCode: res['activityCode'], fromWithParentComp: 'with-parents/progress'};
          if (actCode == 'MP1')
            _.extend(param, {runType: listenOrChant});

          this._helper.openContentFrame('contents', param);
        });
    }
    else
      this._helper.openModal({type: 'flashCardMain', activityCode: actCode});

    this.clearReviewStyle();

    if (!isSayItChant)
      this.setReviewStyle({week: week, actCode: actCode});
    else
      this.setReviewStyle({week: week, actCode: 'MP11'});
  }

  private setReviewStyle(data: object) {
    if (!_.isNull(data)) {
      this._dataMgr.lastRunContentsOfProgress = data;
      let targetWeekIdx = this._dataMgr.lastRunContentsOfProgress['week'] - 1;
      let targetActCode = this._dataMgr.lastRunContentsOfProgress['actCode'];
      this.progressData[targetWeekIdx][targetActCode]['btnCls'] += ' review';
    }
  }

  private clearReviewStyle() {
    if (!_.isNull(this._dataMgr.lastRunContentsOfProgress)) {
      let el = document.querySelector('.activity-lists .review');
      console.log('review el :', el);
      if (el)
        el.classList.remove('review');
    }
  }

  public slidePrev(slides: number) {
    if (this.scrollWeekIdx > slides-1)
      this.scrollWeekIdx -= slides;
    else
      this.scrollWeekIdx = 0;

    //this.monthName = this._dataMgr.monthNames[this._dataMgr.getWeekGroupNum(this.scrollWeekIdx+1)];
    this.monthName = this._dataMgr.weekData.monthNames[this.scrollWeekIdx];
  }

  public slideNext(slides: number) {
    if (this.scrollWeekIdx < _.max(this._dataMgr.weekData.validWeek) - slides - 4)
      this.scrollWeekIdx += slides;
    else
      this.scrollWeekIdx = _.max(this._dataMgr.weekData.validWeek) - 5;

    //this.monthName = this._dataMgr.monthNames[this._dataMgr.getWeekGroupNum(this.scrollWeekIdx+1)];
    this.monthName = this._dataMgr.weekData.monthNames[this.scrollWeekIdx];
    //console.log ("this.scrollWeekIdx: "+ this.scrollWeekIdx);
    //console.log ("this.monthName: "+ this._dataMgr.weekData.month[this.scrollWeekIdx]);
  }

  private eventTargetRemoveClass = setTimeout(() => {}, 0);

  public slideChangeHandler(scrollWeekIdx) {
    this.scrollWeekIdx = scrollWeekIdx;

    const eventTarget = event.target;
    eventTarget['classList'].add('active');
    this.eventTargetRemoveClass = setTimeout(() => {
      eventTarget['classList'].remove('active');
    }, 400);

    //const btnPrevMonth = document.querySelector('.btn-swiper-prev-month');
    const btnPrevWeek = document.querySelector('.btn-swiper-prev-week');
    //const btnNextMonth = document.querySelector('.btn-swiper-next-month');
    const btnNextWeek = document.querySelector('.btn-swiper-next-week');
    if (scrollWeekIdx === 0) {
      //btnPrevMonth.classList.add('disabled');
      btnPrevWeek.classList.add('disabled');
    } else if (scrollWeekIdx >= this._dataMgr.weekData.allWeek.length - 5) {
      //btnNextMonth.classList.add('disabled');
      btnNextWeek.classList.add('disabled');
    } else {
      //btnNextMonth.classList.remove('disabled');
      btnNextWeek.classList.remove('disabled');
      //btnPrevMonth.classList.remove('disabled');
      btnPrevWeek.classList.remove('disabled');
    }
    this.monthName = this._dataMgr.weekData.monthNames[scrollWeekIdx + 1];
  }
}
