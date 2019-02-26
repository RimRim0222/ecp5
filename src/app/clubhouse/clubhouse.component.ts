import { HelperService } from './../services/helper.service';
import { DataManagerService } from './../services/data-manager.service';
import { ClubhouseService } from './clubhouse.service';
import { CommonModule } from './../common.module';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import {SoundManagerService} from '../services/sound-manager.service';

@Component({
    selector: 'app-clubhouse',
    templateUrl: 'clubhouse.component.html',
    styleUrls: ['clubhouse.component.css']
})
/**
 * 2018.12.12 NEO
 * [공지] 비구매자는 메인에서 1주차 컨텐츠 보기 권한입니다.
 */
export class ClubhouseComponent implements OnInit {
    public bgmIconClass: string = this.dataManagerService.getBGMIconClass();

    private demoActivityWeekMap = null;

    constructor(private activatedRoute: ActivatedRoute,
        private router: Router, private commonModule: CommonModule,
        public dataManagerService: DataManagerService, private clubhouseService: ClubhouseService,
        public _helper: HelperService, public _sndMgr: SoundManagerService) {}

    ngOnInit() {
        this._sndMgr.bgmPlay('/clubhouse');
        this.commonModule.activityClass = 'clubhouse';
        this.init();
    }

    private init() {
        const subs = this.dataManagerService.initDataLoaded$.subscribe(() => {
            subs.unsubscribe();
        });

        this.dataManagerService.isBGMOff$.subscribe(isBGMOff => {
            isBGMOff ? this.bgmIconClass = '_mute' : this.bgmIconClass = '';
        });
        this.initActivityDemoWeekList();
    }

    private initActivityDemoWeekList() {
        if (this.dataManagerService.isDemo) {
            this._helper.openModal({type: 'loading'});
            this.demoActivityWeekMap = {};
            this.clubhouseService.getDemoClubhouseWeekList()
            .subscribe(res => {
                console.log('res :', res['data']);
                if (res['data']) {
                    const weeks = res['data']['weekList'];
                    for (let i = 0; i < weeks.length; i++) {
                        if (!this.demoActivityWeekMap[weeks[i]['activityCode']]) {
                            this.demoActivityWeekMap[weeks[i]['activityCode']] = weeks[i];
                        }
                        if (weeks[i]['activityCode'] === 'PR'
                                && res['data']['thumbnailXml']
                                && res['data']['thumbnailXml'][weeks[i]['activityCode']]) {
                            const thumbnailXml = this.commonModule.xmlToJson(res['data']['thumbnailXml'][weeks[i]['activityCode']]);
                            // console.log('thumbnailXml : ', thumbnailXml);
                            const thumbnailWeek = thumbnailXml['document']['scene']['Week'][0];
                            const pdf = thumbnailWeek['PDF']['@attributes'];
                            weeks[i]['filePathPdf'] = pdf['uploadFilePath'] + pdf['uploadFileName'];
                            // console.log('weeks[i][filePathPdf] : ', weeks[i]['filePathPdf']);
                            // this.clubhouseService.currentWeekData = weeks[i];
                        }
                    }
                }
                this._helper.closeLoading();
            });
        }
    }

    /**
     * URL 이동
     */
    public onClickGoURL(activityCode: string) {
        this._sndMgr.playTitleSound('clubhouse', activityCode + 'Click');

        // 비구매자
        // this.setDemoInfo(activityCode);
        if (this.dataManagerService.isDemo) {
            this.getDemoContents(activityCode);
        // 구매자
        } else {
            const url = this.getURLByActivityCode(activityCode);
            this.router.navigate([url]);
        }
    }

    /**
     * 액티비티코드로 URL을 가져온다.
     * @param activityCode 액티비티코드
     */
    public getURLByActivityCode(activityCode: string) {
        let url = '/clubhouse';
        switch (activityCode) {
            case 'PR' : {
                url += '/poly-reader';
                break;
            }
            case 'SA' : {
                url += '/sing-along';
                break;
            }
            case 'PS' : {
                url += '/photo-shoot';
                break;
            }
            case 'FF' : {
                url += '/fun-factory';
                break;
            }
            default : {
                url += '/color-magic';
            }
        }
        return url;
    }

    /**
     * 비구매자 샘플
     */
    public getDemoContents(activityCode: string) {
        const week = this.demoActivityWeekMap[activityCode];
        const subs = this.clubhouseService.getLcmsContents(week)
        .subscribe(subRes => {
            console.log('getLcmsContents [res] :', subRes);
            if (subRes['data']) {
                console.log(subRes['data']['Table1'][0]['EXECUTE_FILE_PATH']);
                const param = {
                    url: subRes['data']['Table1'][0]['EXECUTE_FILE_PATH'],
                    memberCode: this.dataManagerService.sessionData['memberCode'],
                    learningYearCode: this.dataManagerService.sessionData['learningYearCode'],
                    termGbn: this.dataManagerService.sessionData['semesterGbn'],
                    lcmsPrdId: week['lcmsPrdId'],
                    currCode: week['currCode'],
                    activityCode: week['activityCode'],
                    learningGbn: this.dataManagerService.sessionData['semesterGbn'],
                    tutorialCompleteYN: 'N'
                };
                this._helper.openContentFrame('clubhouse-contents', param);
            } else {
                console.log( '[' + subRes['serviceCode'] + ']' + subRes['serviceMessage']);
                this._helper.openModal({type: 'commonModal02', msg: subRes['serviceMessage']});
            }
        });
    }
}
