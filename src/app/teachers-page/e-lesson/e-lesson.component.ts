import { DataManagerService } from './../../services/data-manager.service';
import { ActivatedRoute } from '@angular/router';
import { HelperService } from './../../services/helper.service';
import { Component, OnInit } from '@angular/core';
import { TeachersPageService } from '../teachers-page.service';
import { environment } from '../../../environments/environment';
import { constant } from '../../global/constans/constant';
import { icreateContentsConfig } from '../icreate-contents-config';
import { _ } from 'underscore';
import { SoundManagerService } from 'src/app/services/sound-manager.service';
@Component({
    selector: 'app-e-lesson',
    templateUrl: '../teachers-page.component.html',
    styleUrls: ['e-lesson.component.css']
})
export class ELessonComponent implements OnInit {

    public safeURL: string = null;
    private isIframeLoaded = false;
    public child: any;
    public childFrameElementId = 'teachers-contents';
    private contentInfoFull: any = null;
    public isMobile: boolean;
    private currentMsgEventListener: any;
    private runType;
    private activityCode;
    private contentsInfo = { fileURL: null, fileName: null };

    constructor(private teachersPageService: TeachersPageService,
        private _helper: HelperService,
        protected route: ActivatedRoute) {
        this.isMobile = this.getIsMobile();
        this.setMsgEventListener(this.contentFrameEventListener, this);
    }

    public setMsgEventListener(listener, scope) {
        this.runType = icreateContentsConfig[this.getQueryParam('activityCode')][this.getQueryParam('lessonId')]['runType'];
        const lsnr = listener.bind(scope);
        window.removeEventListener( 'message', this.currentMsgEventListener);
        window.addEventListener('message', lsnr);
        this.currentMsgEventListener = lsnr;
      }

    ngOnInit() {
        this.init();
    }

    public init() {
        this.activityCode = this.getQueryParam('activityCode');
        const lessonId = this.getQueryParam('lessonId');
        let params: any = { activityCode: this.getQueryParam('activityCode'), lessonId: this.getQueryParam('lessonId') };
        const crsAuthoringCode = icreateContentsConfig[params.activityCode][params.lessonId]['courseCode'];
        const runType = icreateContentsConfig[params.activityCode][params.lessonId]['runType'];
        if (this.activityCode === 'PR') {
            this.contentsInfo['fileURL'] = icreateContentsConfig[params.activityCode][params.lessonId]['fileURL'];
            this.contentsInfo['fileName'] = icreateContentsConfig[params.activityCode][params.lessonId]['fileName'];
        }
        params = { crsAuthoringCode: crsAuthoringCode };
        this.teachersPageService.icreateContentsInfo(params).subscribe( icreateRes => {
            console.log('e-lesson res : ', icreateRes);
            if (icreateRes['answerList']) {
                console.log('icreateRes :', icreateRes);
                _.each(icreateRes['answerList'][0]['objectList'], d => {
                    d['crsAuthoringCode'] = params['crsAuthoringCode'],
                    d['projectAuthoringCode'] = icreateRes['answerList'][0]['projectAuthoringCode'],
                    d['applyYN'] = (runType === 'chant' ? 'Y' : 'N');
                });
                this.contentInfoFull = {
                    teachersYN: 'Y',
                    answerList: icreateRes['answerList'][0]['objectList']
                };
                this.safeURL = environment.resourceURL.icreate + icreateContentsConfig[this.activityCode][lessonId]['url'];
            }
        });
    }

    public getQueryParam(name: string): string {
        return (this.route.snapshot.queryParamMap.get(name) || '').toString();
    }

    public iframeOnLoad() {
        console.log('iframeOnLoad');
        console.log('contentInfoFull: ', this.contentInfoFull);
        if (!this.isIframeLoaded) {
          this.isIframeLoaded = true;
          setTimeout(() => {
            this.child = document.getElementById(this.childFrameElementId);
            this.sendMsgToChild('contents_info', this.contentInfoFull);
            // this.child.contentWindow.postMessage({op: 'setActivityMenu', from:'poly', data: {
            //     buyerYN: this._dataMgr.isDemo ? 'N' : 'Y',
            //     mobileYN: this._dataMgr.isMobile ? 'Y' : 'N',
            //     helpPageCode: this.activityCode
            //   }}, '*');
          }, constant.contentInfoSendDelaySec * 1000);
        }
    }

    public sendMsgToChild(op: string, msg: object) {
        const fullMsg: object = {'op': op, 'from': 'poly', 'data': msg};
        // const fullMsg = {"op":"contents_info","from":"poly","data":{"param":{"memberCode":"","learningYearCode":"","termGbn":"","lcmsPrdId":"","currCode":"","activityCode":"","contentsCode":"","crsAuthoringCode":"","learningGbn":"","correctViewYN":"Y","retakeYN":"Y","tryLimit":1},"answerList":[{"projectAuthoringCode":"","objectAuthoringCode":"","questionNumber":1,"correctAnswer":"","userAnswer":"","count":"","total":"","correctYN":"N","applyYN":"Y","tryCount":1,"answerRate":"","attachFileCode":"","attachfileURL":""}]}};
        this.child.contentWindow.postMessage(fullMsg,'*' );
        console.error('컨텐츠로 보낸 메시지: ', fullMsg);
    }

    private getIsMobile(): boolean {
        const filter = "win16|win32|win64|mac";
        if (navigator.platform) {
          return 0 > filter.indexOf(navigator.platform.toLowerCase()) ? true : false;
        }
      }

    public contentFrameEventListener(event) {
        if (event.data['op']) {
          console.error('컨텐츠로부터 받은 메시지 :', event.data);

          switch (event.data['op']) {
            case 'contentInit': {
              this._helper.closeLoading();
              const target = document.getElementById(this.childFrameElementId)['contentWindow'];
              target.postMessage({op: 'notifyContentInitFinish', from:'poly'}, '*');
              target.postMessage({op: 'setActivityMenu', from:'poly', data: {
                  buyerYN: 'N',
                  mobileYN: this.isMobile ? 'Y' : 'N',
                  tutorialCompleteYN: 'Y',
                  helpPageCode: this.activityCode || '',
                  runType: this.runType
                }}, '*');
              break;
            }
            case 'closeContent': {
                console.log('closeContent');
                window.close();
              //this._location.back();
              // this.router.navigate([this.currentContentComponent.parentPath]);
              break;
            }
            case 'moveActivityMenu': {
                const iframeData = event.data['data'];
                if (iframeData['type'] === 'fullScreen') {
                    const iframe = document.getElementById(this.childFrameElementId);
                    if (iframeData['mode'] === 'Y') {
                        console.log('컨텐츠 프레임 전체화면으로');
                        const screenScale = this.getScreenScale();
                        iframe.style.position = 'fixed';
                        iframe.style.top = '0px';
                        iframe.style.left = '0px';
                        iframe.style.width = screenScale.width + 'px';
                        iframe.style.height = screenScale.height + 'px';
                        //document.getElementById(this.currentContentComponent.childFrameElementId).style.paddingBottom = '200px';
                    } else {
                        console.log('컨텐츠 프레임 기본크기로');
                        iframe.style.position = 'relative';
                        iframe.style.width   = '1024px';
                        iframe.style.height = '768px';
                    }
                } else if (iframeData['type'] === 'help') {
                    // tslint:disable-next-line:max-line-length
                    this._helper.openModal({type: 'commonHelp', actionType: iframeData['actionType'] || '', helpPage: iframeData['helpPageCode']});
                } else if (iframeData['type'] === 'printPreview') {
                    const url = encodeURI(environment.resourceURL.static + this.contentsInfo.fileURL);
                    this._helper.openModal({type: 'activitySheetPdfViewer', url: url});
                    break;
                }
                break;
            }
            case 'saveActivityQuizDetail': {
                const target = document.getElementById(this.childFrameElementId)['contentWindow'];
                target.postMessage({op: 'notifySaveActivityQuizDetail', from: 'poly'}, '*');
                break;
            }
          }
        }
    }

    public getScreenScale() {
        return {width: document.body.clientWidth, height: document.body.clientHeight};
    }

}
