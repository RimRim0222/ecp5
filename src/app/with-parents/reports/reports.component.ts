import { HelperService } from './../../services/helper.service';
import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from './../../common.module';
import { DataManagerService } from './../../services/data-manager.service';
import { WithParentsService } from './../with-parents-service';
import { SoundManagerService } from '../../services/sound-manager.service';
import { SwiperComponent, SwiperDirective, SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { environment } from 'src/environments/environment';
import { WithParentsTranslateService } from '../with-parents.translate.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
    private currentWeek: number;
    public imagePath = environment.resourceURL.image;
    public langType: string = this._translate.translate.getDefaultLang();

    public config: SwiperConfigInterface = {
        keyboard: true,
        mousewheel: true,
        observer: true,
        speed: 300,
        spaceBetween: 0,
        navigation: {
            nextEl: '.btn-swiper-next',
            prevEl: '.btn-swiper-prev',
        }
    };

    @ViewChild(SwiperComponent) componentRef?: SwiperComponent;
    @ViewChild(SwiperDirective) directiveRef?: SwiperDirective;

  constructor(private commonModule: CommonModule,
        public _helper: HelperService,
        public _sndMgr: SoundManagerService,
      public withParentsService: WithParentsService,
      public _translate: WithParentsTranslateService,
      private dataManagerService: DataManagerService) { }

  ngOnInit() {
        this._sndMgr.bgmPlay('none');
      this.commonModule.activityClass = 'with-parents-reports';
      this.init();
  }

  init() {
      // this.withParentsService.pageList = null;
      this.withParentsService.pageList = {
          activeWeek: 0,
          weekData:{},
          result: {},
          skillAnalysis:{}
      };

      if (this.dataManagerService.initDataLoaded) {
          this.withParentsService.reportsWeek().subscribe(() => {
            // this.onClickWeekHandler(this.dataManagerService.weekData.thisWeek);
            this.currentWeek = this.dataManagerService.weekData.thisWeek;
          });
      } else {
          const subs = this.dataManagerService.initDataLoaded$.subscribe(() => {
              subs.unsubscribe();
              this.withParentsService.reportsWeek().subscribe(() => {
                // this.onClickWeekHandler(this.dataManagerService.weekData.thisWeek);
                this.currentWeek = this.dataManagerService.weekData.thisWeek;
              });
          });
      }
  }

  // 주차 클릭
  public onClickWeekHandler(week) {
    if (week['isDisabled']) {
      this.withParentsService.pageList.selectedWeekType = 'noPoly';
      this.withParentsService.pageList.selectedWeek = Number(week['weekId']);
      return false;
    } else if (week['weekId'] > this.withParentsService.thisWeek) {
      this.withParentsService.pageList.selectedWeekType = 'notReady';
      this.withParentsService.pageList.selectedWeek = Number(week['weekId']);
      return false;
    }
    this._helper.openModal({type: 'loading'});
    this.withParentsService.reportsList(week);
    this.currentWeek = Number(week['weekId']);
  }

  // 컨텐츠 실행
  public exContent(type: string = 'activity') {
    console.log('type : ', type, 'this.currentWeek : ', this.currentWeek);
    this.dataManagerService.setViewWeek(this.currentWeek);
    const subs = this.dataManagerService.loadMainContentsData('RP1')
      .subscribe(res => {
        console.log('exContent : ', res);
        subs.unsubscribe();
        if (type === 'review') {
          this.dataManagerService.convertingReviewData();
        }
        this._helper.openContentFrame('contents',
          {url: res['url'], activityCode: res['activityCode'], fromWithParentComp: 'with-parents/reports'});
      });
  }
};
