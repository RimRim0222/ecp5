import { CacheManagerService } from './../../services/cache-manager.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HelperService } from './../../services/helper.service';
import { DataManagerService } from './../../services/data-manager.service';
import { ActivatedRoute } from '@angular/router';
import { ClubhouseService } from './../clubhouse.service';
import { ContentFrameComponent } from '../../content-frame/content-frame.component';
import { Component } from '@angular/core';
import { _ } from 'underscore';
import {SoundManagerService} from '../../services/sound-manager.service';
import { environment } from 'src/environments/environment';
import { message } from 'src/app/global/messages/message';

@Component({
    selector: 'app-clubhouse-content-frame',
    templateUrl: '../../content-frame/content-frame.component.html',
    styleUrls: ['../../content-frame/content-frame.component.css']
})
export class ClubhouseContentFrameComponent extends ContentFrameComponent {

    private questionList = null;

    constructor(protected route: ActivatedRoute, public _dataMgr: DataManagerService,
        public _helper: HelperService, public clubhouseService: ClubhouseService,
        private cacheManagerService: CacheManagerService,
        public http: HttpClient, public _sndMgr: SoundManagerService) {
            super(route, _dataMgr, http, _helper, _sndMgr);
    }

    public initContentComp() {
        if (!this._dataMgr.initDataLoaded) {
            this._dataMgr.initDataLoaded$.subscribe(res => {
                this.initICreateParameterParsing();
                this.onEventListenerICreater();
            });
        } else {
            this.initICreateParameterParsing();
            this.onEventListenerICreater();
        }
    }

    public initICreateParameterParsing() {
        let url = this.getQueryParam('url');
        const contentInfoFull = { answerList: [] };
        const activityCode = this.getQueryParam('activityCode');
        this.tutorialCompleteYN = this.getQueryParam('tutorialCompleteYN');

        const params = new HttpParams()
          .set('currCode', this.getQueryParam('currCode'))
          .set('lcmsPrdId', this.getQueryParam('lcmsPrdId'))
          .set('activityCode', this.getQueryParam('activityCode'));
        // 비구매자
        if ( !this._dataMgr.isDemo) {
            // 캐시를 가져온다.
            this.cacheManagerService.getValue().subscribe( cacheRes => {
                console.log('cacheRes :', cacheRes);
                if (cacheRes['data']['data']) {
                    const cacheData = JSON.parse(decodeURI(cacheRes['data']['data']));
                    // console.log('4. getValue() cacheRes :', cacheData);
                    this.cacheManagerService.getCache().setValues(cacheData);
                    if (activityCode === 'FF') {
                        this.tutoCompleteYNTyped = this.cacheManagerService.getCache().getJosnValue()[activityCode]['tutoCompleteYNTyped'];
                        if (!this.tutoCompleteYNTyped) {
                            this.tutoCompleteYNTyped = '';
                        }
                        console.log('this.tutoCompleteYNTyped : ', this.tutoCompleteYNTyped);
                    }
                }
                this.clubhouseService.getEnrollQuestionList(params).subscribe(res => {
                    this.questionList = res['data'];
                    console.log('getEnrollQuestionList res :', res);
                    const crsAuthoringCode = this.getQueryParam('crsAuthoringCode');
                    if (res['data']) {
                        switch (activityCode) {
                            case 'PR':  {
                                _.each(res['data'], (d) => {
                                    contentInfoFull.answerList.push({
                                        applyYN: d['applyYn'],
                                        crsAuthoringCode: crsAuthoringCode,
                                        projectAuthoringCode: d['questionTypeCode'],
                                        objectAuthoringCode: d['itmCode'],
                                    });
                                });
                                break;
                            }
                            // SL
                            case 'SA':  {
                                // cache 데이터 저장
                                this.cacheManagerService.setTutorialCompleteYN(this.clubhouseService.activityCode, 'Y')
                                    .subscribe( () => {
                                        console.log(this.clubhouseService.activityCode, ' Tutorial Sucess');
                                    });
                                const question = {
                                    activityCode: this.getQueryParam('activityCode'),
                                    currCode: this.getQueryParam('currCode'),
                                    lcmsPrdId: this.getQueryParam('lcmsPrdId'),
                                    learningEleCode: this.getQueryParam('learningEleCode'),
                                    examPaperCode: res['data'][0]['examPaperCode'],
                                    itmCode: res['data'][0]['itmCode'],
                                    itmNo: res['data'][0]['itmNo'],
                                    contentsCode: res['data'][0]['contentsCode'],
                                    applyYn: 'Y',
                                    firstAns: 'complete',
                                    completeYn: 'Y',
                                    firstAnsYn: 'Y'
                                };

                                // 컨텐츠 완료 여부
                                if ( this.getQueryParam('completeYN') !== 'Y' ) {
                                    this.clubhouseService.enrollQuestion(question).subscribe( questionRes => {
                                        this.clubhouseService.setCompleteYn('Y');
                                    });
                                }
                                _.each(res['data'], (d) => {
                                    contentInfoFull.answerList.push({
                                        applyYN: d['applyYn'],
                                        crsAuthoringCode: crsAuthoringCode,
                                        projectAuthoringCode: d['questionTypeCode'],
                                        objectAuthoringCode: d['itmCode'],
                                    });
                                });
                                break;
                            }
                            case 'PS': {
                                _.each(res['data'], (d, idx) => {
                                    console.log('d :', d);
                                    contentInfoFull.answerList.push({
                                        applyYN:  d['applyYn'],
                                        crsAuthoringCode: crsAuthoringCode,
                                        projectAuthoringCode: d['questionTypeCode'],
                                        objectAuthoringCode: d['itmCode'],
                                        questionNumber: d['itmNo'],
                                        correctAnswer: '',
                                        userAnswer: d['firstAns'],
                                        correctYN: '',
                                        tryCount: '',
                                    });
                                });
                                break;
                            }
                            case 'CM': {
                                _.each(res['data'], (d, idx) => {
                                    // console.log('d :' + idx, 'base64 image :' + d['htmlCont']);
                                    contentInfoFull.answerList.push({
                                        applyYN: d['applyYn'],
                                        crsAuthoringCode: crsAuthoringCode,
                                        projectAuthoringCode: d['itmCode'],
                                        objectAuthoringCode: d['itmCode'],
                                        contentsActionSaveValue: d['htmlCont'],
                                        correctYN: 'Y',
                                        tryCount: 1,
                                        userAnswer: d['firstAns'],
                                    });
                                });
                                break;
                            }
                            default : {

                            }
                        }
                    }
                });
            });
        }
        url = this.opURL + url;
        this.setInitInfo(url, 'clubhouse', contentInfoFull); // parentPath - main or clubhouse 등등
        console.log('Contents iframe html :', url);
        console.log('Contents Info :', contentInfoFull);
    }

    public onEventListenerICreater() {
        this.registerOpMsgFromCourse('moveActivityMenu', function (d) {
            switch (d['type']) {
                case 'fullScreen': {
                    const iframe = document.getElementById(this.childFrameElementId);
                    if (d['mode'] === 'Y') {
                        console.log('컨텐츠 프레임 전체화면으로');
                        const screenScale = this.getScreenScale();
                        iframe.style.position = 'fixed';
                        iframe.style.top = '0px';
                        iframe.style.left = '0px';
                        iframe.style.width = screenScale.width + 'px';
                        iframe.style.height = screenScale.height + 'px';
                    } else {
                        console.log('컨텐츠 프레임 기본크기로');
                        iframe.style.position = 'relative';
                        iframe.style.width   = '1024px';
                        iframe.style.height = '768px';
                    }
                    break;
                }
                case 'printPreview' : {
                    if (this._dataMgr.isMobile) {
                        this._helper.openModal({type: 'commonModal', msg: message['alert.0003']['msg']});
                        break;
                    }
                    const url = encodeURI( environment.resourceURL.pdf
                        + '?path=' + this.clubhouseService.currentWeekData['filePathPdf']
                        + '&oriName=' + this.clubhouseService.currentWeekData['filePdfName']);
                    this._helper.openModal({type: 'activitySheetPdfViewer', url: url});
                    break;
                }
                case 'help': {
                    if (d['helpPageCode'] === 'FF'
                        || d['helpPageCode'] === 'PS') {
                        this._helper.openModal({type: 'commonHelp', actionType: d['actionType'], helpPage: d['helpPageCode']});
                    } else {
                        this._helper.openModal({type: 'commonHelp', helpPage: d['helpPageCode']});
                    }
                    break;
                }
                default: {
                }
            }
        });

        this.registerOpMsgFromCourse('saveActivityQuizDetail', function (d) {
            const target = document.getElementById(this.childFrameElementId)['contentWindow'];
            if ( !this._dataMgr.isDemo) {
                console.log('퀴즈 저장', d);
                if (d['answerList']) {
                    switch (this.clubhouseService.activityCode) {
                        // Poly Reader
                        case 'PR': {
                            if ( this.getQueryParam('completeYN') === 'Y' ) {
                                target.postMessage({op: 'notifySaveActivityQuizDetail', from: 'poly'}, '*');
                                break;
                            }
                            const questions = new Array();
                            _.each(d['answerList'], (answer, idx) => {
                                if (answer['applyYN'] === 'Y') {
                                    const question = {
                                        activityCode: this.getQueryParam('activityCode'),
                                        currCode: this.getQueryParam('currCode'),
                                        lcmsPrdId: this.getQueryParam('lcmsPrdId'),
                                        learningEleCode: this.getQueryParam('learningEleCode'),
                                        contentsCode: this.questionList[0]['contentsCode'],
                                        examPaperCode: this.questionList[0]['examPaperCode'],
                                        itmCode: answer['objectAuthoringCode'],
                                        itmNo: answer['questionNumber'],
                                        completeYn: 'Y',
                                        applyYn: answer['applyYN'],
                                        firstAns: answer['userAnswer'],
                                        firstAnsYn: 'Y'
                                    };
                                    questions.push(question);
                                }
                                console.log(questions);
                            });
                            this.clubhouseService.enrollQuestions(questions).subscribe( () => {
                                this.clubhouseService.setCompleteYn('Y');
                                target.postMessage({op: 'notifySaveActivityQuizDetail', from: 'poly'}, '*');
                                this.cacheManagerService.setTutorialCompleteYN(this.clubhouseService.activityCode, 'Y').subscribe( res => {
                                    console.log(this.clubhouseService.activityCode, ' Tutorial Sucess');
                                });
                            });
                            break;
                        }
                        // color magic
                        case 'CM': {
                            const applyYN = d['answerList'][0]['applyYN'];
                            if (applyYN === 'Y') {
                                const contentsActionSaveValue = d['answerList'][0]['contentsActionSaveValue'];
                                // console.log('contentsActionSaveValue', contentsActionSaveValue);
                                // base64 data to File
                                console.log('contentsActionSaveValue : ', contentsActionSaveValue);
                                if (contentsActionSaveValue !== '') {
                                    const orginalFileName = 'color-magic_' + 'week_01' + '.png';
                                    const file: File = this.covertbaseEncodeDatatoImageFile(contentsActionSaveValue, orginalFileName);
                                    // 업로드
                                    this.submitFileUpload(file).subscribe(res => {
                                        console.log('res :', res);
                                        const fileURL = res[0]['path'] + res[0]['name'];
                                        console.log('file url : ' + fileURL);
                                        // 현재 주차 썸네일데이터를 넣는다.
                                        this.clubhouseService.currentWeekData['filePathThumbnail'] = contentsActionSaveValue;
                                        const question = {
                                            activityCode: this.getQueryParam('activityCode'),
                                            currCode: this.getQueryParam('currCode'),
                                            lcmsPrdId: this.getQueryParam('lcmsPrdId'),
                                            learningEleCode: this.getQueryParam('learningEleCode'),
                                            contentsCode: this.questionList[0]['contentsCode'],
                                            examPaperCode: this.questionList[0]['examPaperCode'],
                                            itmCode: d['answerList'][0]['projectAuthoringCode'],
                                            itmNo: d['answerList'][0]['questionNumber'],
                                            actualFileName: res[0]['name'],
                                            userFileName: res[0]['originalName'],
                                            fileSize: res[0]['size'],
                                            filePath: res[0]['path'],
                                            htmlCont: contentsActionSaveValue,
                                            applyYn: 'Y',
                                            firstAns: res[0]['userAnswer'],
                                            completeYn: 'Y',
                                            firstAnsYn: 'Y'
                                        };
                                        this.clubhouseService.enrollQuestion(question).subscribe( () => {
                                            this.clubhouseService.setCompleteYn('Y');
                                            this.cacheManagerService.setTutorialCompleteYN(this.clubhouseService.activityCode, 'Y')
                                                .subscribe( () => {
                                                    console.log(this.clubhouseService.activityCode, ' Tutorial Sucess');
                                                });
                                            target.postMessage({op: 'notifySaveActivityQuizDetail', from: 'poly'}, '*');
                                        });
                                    });
                                } else {
                                    target.postMessage({op: 'notifySaveActivityQuizDetail', from: 'poly'}, '*');
                                }
                            }
                            break;
                        }
                        // Photo Shoot, Fun Factory 데이터 저장
                        default: {
                            if ( this.getQueryParam('completeYN') === 'Y'
                                    || ( this.getQueryParam('completeYN') === 'N'
                                            && d['answerList'][0]['level'] === 1 ) ) {
                                target.postMessage({op: 'notifySaveActivityQuizDetail', from: 'poly'}, '*');
                                break;
                            }
                            const questions = new Array();
                            const completeYn = ( d['answerList'][0]['level'] === 1 ) ? 'N' : 'Y';
                            const tutoCompleteYNTyped = d['answerList'][0]['tutoCompleteYNTyped'] ?
                                                            d['answerList'][0]['tutoCompleteYNTyped'].join('/') || '' : '';
                            console.log('tutoCompleteYNTyped : ', tutoCompleteYNTyped);
                            _.each(d['answerList'], (answer, idx) => {
                                const question = {
                                    activityCode: this.getQueryParam('activityCode'),
                                    currCode: this.getQueryParam('currCode'),
                                    lcmsPrdId: this.getQueryParam('lcmsPrdId'),
                                    learningEleCode: this.getQueryParam('learningEleCode'),
                                    contentsCode: this.questionList[0]['contentsCode'],
                                    examPaperCode: this.questionList[0]['examPaperCode'],
                                    questionTypeCode: answer['projectAuthoringCode'],
                                    itmCode: answer['objectAuthoringCode'],
                                    itmNo: answer['questionNumber'],
                                    firstAns: answer['userAnswer'],
                                    firstAnsYn: 'Y',
                                    applyYn: answer['applyYN'],
                                    awswerSeq: answer['tryCount'],
                                    completeYn: completeYn,
                                };
                                questions.push(question);
                            });
                            this.clubhouseService.enrollQuestions(questions).subscribe( questionRes => {
                                this.clubhouseService.setCompleteYn(completeYn);
                                this.cacheManagerService.setTutorialComplete(this.clubhouseService.activityCode, tutoCompleteYNTyped)
                                    .subscribe( () => {
                                        console.log(this.clubhouseService.activityCode, ' Tutorial Sucess');
                                    });
                                target.postMessage({op: 'notifySaveActivityQuizDetail', from: 'poly'}, '*');
                            });
                        }
                    }
                }
            } else {
                target.postMessage({op: 'notifySaveActivityQuizDetail', from: 'poly'}, '*');
            }
        });
    }

    public getScreenScale() {
        return {width: document.body.clientWidth, height: document.body.clientHeight};
    }

    /**
     * 파일 업로드
     * @param file 파일
     */
    public submitFileUpload(file: File) {
        return this.clubhouseService.uploadFile('color-magic', file);
    }

    /**
     * base64 데이트를 파일로 변경해준다.
     * CORS로 인한 권한 오류로 사용불가
     * @param dataURL 데이터 주소
     * @param fileName 파일명
     */
    private covertbaseEncodeDatatoImageFile(base64EncodeData, fileName) {
        const arr = base64EncodeData.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]);
        let  n: number = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], fileName, {type: mime});
    }


    /**
     * 이미지 base64 encode 파일로 변경해준다.
     */
    public convertImageFileToBase64Encode(url, callback) {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = image.width; // or 'width' if you want a special/scaled size
            canvas.height = image.height; // or 'height' if you want a special/scaled size

            canvas.getContext('2d').drawImage(image, 0, 0);
            // callback(canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, ''));
            // ... or get as Data URI
            callback(canvas.toDataURL('image/png'));
        };
        image.src = url;
    }

}
