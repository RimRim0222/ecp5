import { CacheManagerService } from './../services/cache-manager.service';
import { Subject } from 'rxjs/index';
import { environment } from './../../environments/environment';
import { Power2 } from 'gsap/all';
import { HelperService } from '../services/helper.service';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { DataManagerService } from './../services/data-manager.service';
import { ClubhouseService } from './clubhouse.service';
import { SoundManagerService } from './../services/sound-manager.service';
import { CommonModule } from './../common.module';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ElementRef, Injectable } from '@angular/core';
import { message } from '../global/messages/message';
declare var TweenMax: any;

/**
 * 클럽하우스 공통 컴포너트
 * 클럽하우스에 모든 컴포너트는 상속 받으세요.
 */
@Injectable()
export abstract class BaseClubhouseComponent {

    public STATIC_URL = environment.resourceURL.static;
    protected activityCode = null;
    public bgmIconClass: string = this.dataManagerService.getBGMIconClass();

    constructor(protected activatedRoute: ActivatedRoute,
        protected routes: Router,
        public clubhouseService: ClubhouseService,
        public dataManagerService: DataManagerService,
        public commonModule: CommonModule,
        protected el: ElementRef,
        public _helper: HelperService,
        public cacheManagerService: CacheManagerService, public _sndMgr: SoundManagerService) {
    }

    public config: SwiperConfigInterface = {
        keyboard: true,
        mousewheel: true,
        observer: true,
        pagination: {
            el: '.swiper-pagination-wrapper',
            clickable: true,
            renderBullet: function (index, className) {
                return '<span class="' + className + ' ' + className + (index + 1) + '">' + (index + 1) + '</span>';
            },
        },
        navigation: {
            nextEl: '.btn-swiper-next',
            prevEl: '.btn-swiper-prev',
        }
    };

    private sessionMemberData = null;
    private searchTerms = new Subject<string>();
    public weekList = null;

    // public setActivyClass(className: string): void {
    //     this.commonModule.activityClass = className;
    // }

    /**
     * 초기 정보 셋팅
     */
    protected init() {
      this._sndMgr.bgmPlay('/clubhouse');
      this.dataManagerService.isBGMOff$.subscribe(isBGMOff => {
        isBGMOff ? this.bgmIconClass = '_mute' : this.bgmIconClass = '';
      })

      this.clubhouseService.pageList = null;
        if (this.dataManagerService.initDataLoaded) {
            this.setMainWrapActivyClass();
            this.loadSingAlongInfo();
        } else {
            const subs = this.dataManagerService.initDataLoaded$.subscribe(() => {
                subs.unsubscribe();
                console.log('clubhouse - DataManager Initialized');
                this.setMainWrapActivyClass();
                this.loadSingAlongInfo();
            });
        }
    }

    /**
     * 정보
     */
    private loadSingAlongInfo() {
        const params = { 'activityCodes' : this.activityCode };
        this.clubhouseService.clubhouseInfo(params);
    }

    /*
     * 메인 wrapper activity class 적용
     */
    public setMainWrapActivyClass() {
        let className;
        switch (this.activityCode) {
            case 'PR': className = 'club-reader';
                break;
            case 'SA': className = 'club-sing-along';
                break;
            case 'PS': className = 'club-photo-shoot';
                break;
            case 'FF': className = 'club-fun-factory';
                break;
            default : className = 'club-color-magic';
        }
        this.commonModule.activityClass = className;
    }

    /**
     * contents frame open
     * @param weekData 주차정보
     */
    public openContentFrame(weekData: any) {
        if ( weekData['tlLessonYn'] !== 'Y') {
            this._helper.openModal({type: 'commonModal02', msg: message['alert.0006']['msg']});
            return;
        }

        // 현재주차보다 크면 컨텐츠 비활성화
        console.log('openContentFrame weekData :', weekData);
         // 방학 주차
        if (weekData['vacationIncludeCode'] === 'HW') {
            this._helper.openModal({type: 'noPoly'});
            return;
        } else if ( this.dataManagerService.weekData.thisWeek < parseInt(weekData.weekId, 10)) {
            this._helper.openModal({type: 'commonModal02', msg: message['contents.0010']['msg']});
            return;
        }

        this._sndMgr.playEventSound('common', 'buttonClick');
        this._helper.openModal({type: 'loading'});
        const gameTimeSub = this.dataManagerService.checkGameTime$.subscribe(isOk => {
          gameTimeSub.unsubscribe();
          if (isOk) {
            this.clubhouseService.enrollContent(weekData).subscribe(res => {
              const params = {
                memberCode: this.dataManagerService.sessionData['memberCode'],
                learningYearCode: this.dataManagerService.sessionData['learningYearCode'],
                termGbn: this.dataManagerService.sessionData['semesterGbn'],
                lcmsPrdId: weekData['lcmsPrdId'],
                currCode: weekData['currCode'],
                activityCode: weekData['activityCode'],
                learningGbn: this.dataManagerService.sessionData['semesterGbn']
              };
              this.dataManagerService.mainContentsData['param'] = params;
              this.dataManagerService.mainContentsData['contentInfoSrc'] = res['data']['Table1'][0];
              const subs = this.clubhouseService.getLcmsContents(weekData)
                .subscribe(subRes => {
                  console.log('weekData :', weekData);
                  this.cacheManagerService.getValue().subscribe( cacheRes => {
                    console.log('cacheRes :', cacheRes);
                    console.log('getLcmsContents [res] :', res);

                    if (res['data']) {
                      const data = res['data']['Table1'][0];
                      console.log(data['EXECUTE_FILE_PATH']);
                      const param = this.geneateParams(data, weekData);
                      this._helper.openContentFrame('clubhouse-contents', param);
                    } else {
                      console.log( '[' + res['serviceCode'] + ']' + res['serviceMessage']);
                      this._helper.openModal({type: 'commonModal02', msg: res['serviceMessage']});
                    }
                  });
                });
            });
          }
        })
      this.dataManagerService.checkGameTime(weekData['activityCode']);
    }

    private getTutorialCompleteYN() {
        const value = this.cacheManagerService.getCache().getParseJsonValue(this.activityCode);
        console.log('getTutorialCompleteYN : ', value);
        // value 값이 없을 intro default 값은 true 입니다.
        console.log( '4. 이 액티비티는 : ', this.activityCode, ' === ', (value['isTutorial'] ? '튜토리얼 이미 봤습니다.' : '튜토리얼 안 봤습니다.') );
        if ( value['isTutorial'] ) {
            return 'Y';
        } else {
           return 'N';
        }
    }

    private geneateParams(data, weekData) {
        const params = {
            url: data['EXECUTE_FILE_PATH'],
            crsAuthoringCode: data['CRS_AUTHORING_CODE'],
            currCode: weekData['currCode'],
            lcmsPrdId: weekData['lcmsPrdId'],
            activityCode: weekData['activityCode'],
            learningEleCode: weekData['learningEleCode'],
            completeYN: (weekData['completeYn'] == null ? '' : weekData['completeYn']),
            tutorialCompleteYN: this.getTutorialCompleteYN()
        };
        return params;
    }

    public onMouseOver(event: MouseEvent) {
        const spd = .1;
        const el = event.currentTarget;
        TweenMax.to(el, spd, {scale: 1.05, ease: Power2.easeIn});
    }

    public onMouseOut(event: MouseEvent) {
        const spd = .1;
        const el = event.currentTarget;
        TweenMax.to(el, spd, {scale: 1.00, ease: Power2.easeIn});
    }
}
