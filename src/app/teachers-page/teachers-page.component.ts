import { constant } from './../global/constans/constant';
import { ActivatedRoute } from '@angular/router';
import { DataManagerService } from './../services/data-manager.service';
import { Location } from '@angular/common';
import { TeachersPageService } from './teachers-page.service';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HelperService } from "../services/helper.service";
import { _ } from 'underscore';
@Component({
    selector: 'app-teachers-page',
    templateUrl: 'teachers-page.component.html',
    styleUrls: ['teachers-page.component.css']
})

export class TeachersPageComponent implements OnInit {

    public safeURL: string = null;
    private isIframeLoaded = false;
    public child: any;
    public childFrameElementId = 'teachers-contents';
    private contentInfoFull: any = null;
    public isMobile: boolean;
    private currentMsgEventListener: any;

    constructor(private teachersPageService: TeachersPageService, private _location: Location,
        private dataManagerService: DataManagerService, private _helper: HelperService,
        protected route: ActivatedRoute) {
        this.isMobile = this.getIsMobile();
        this.dataManagerService.isDemo = true;
        this.setMsgEventListener(this.contentFrameEventListener, this);
    }

    public setMsgEventListener(listener, scope) {
        const lsnr = listener.bind(scope);
        window.removeEventListener( 'message', this.dataManagerService.currentMsgEventListener);
        window.removeEventListener( 'message', this.currentMsgEventListener);
        window.addEventListener('message', lsnr);
        this.currentMsgEventListener = lsnr;
      }

    ngOnInit() {
       this.getQueryParam('currCode').length > 0
         ? this.init() : this.initContentComp() ;
    }

    public init() {
        const currCode = this.getQueryParam('currCode');
        const learningEleCode = this.getQueryParam('learningEleCode');
        const runType = this.getQueryParam('runType');
        // const params = { currCode: '198153', learningEleCode: '377' };
        let params: any = { currCode: currCode, learningEleCode: learningEleCode };
        this.teachersPageService.getLcmsContents(params).subscribe( res => {
            console.log('TeachersPageComponent res : ', res);
            if (res['data']) {
                const data = res['data']['Table1'][0];
                console.log(data['EXECUTE_FILE_PATH']);
                // const param = {
                //     url: data['EXECUTE_FILE_PATH'],
                //     crsAuthoringCode: data['CRS_AUTHORING_CODE'],
                //     projectAuthoringCode: '',
                // };
                params = { crsAuthoringCode: data['CRS_AUTHORING_CODE'] };
                this.teachersPageService.icreateContentsInfo(params).subscribe( icreateRes => {
                    console.log('icreateRes :', icreateRes);
                    _.each(icreateRes['answerList'][0]['objectList'], d => {
                        d['crsAuthoringCode'] = params['crsAuthoringCode'],
                        d['projectAuthoringCode'] = icreateRes['answerList'][0]['projectAuthoringCode'],
                        d['applyYN'] =  'N'; // (runType === 'chant' ? 'Y' : 'N');
                    });

                    this.contentInfoFull = {
                        answerList: icreateRes['answerList'][0]['objectList']
                    };
                    this.safeURL = environment.opURL + data['EXECUTE_FILE_PATH'];
                });
            }
        });
    }

    public initContentComp() {
        this.safeURL = environment.opURL + this.getQueryParam('url');
        this.contentInfoFull = {
            answerList: [
                {
                    crsAuthoringCode: '',
                    projectAuthoringCode: '',
                    applyYN : 'Y'
                }
            ]
        };
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
                    teachersYN: 'Y',
                    tutorialCompleteYN: 'Y',
                    tutoCompleteYNTyped: '',
                    runType: 'listen',
                    studyTimeLimitSec: 0,
                    studyTimeLimitMax: constant.studyTimeLimitMax,
                }}, '*');
              break;
            }
            case 'closeContent': {
                console.log('closeContent');
                window.close();
                //this.router.navigate([this.currentContentComponent.parentPath]);
              break;
            }
            case 'moveActivityMenu': {
                const iframeData = event.data['data'];
                const target = document.getElementById(this.childFrameElementId)['contentWindow'];
                switch (iframeData['type']) {
                    case 'help':
                      break;
                    case 'recordAudio':
                      switch (iframeData['command']) {
                        case 'start': {
                          break;
                        }
                        case 'stop':
                            target.postMessage({op: 'notifyDeviceOrientationResult', from: 'poly', data: {
                                type: 'record', result: 'success', fileUrl: 'hui', message: '업로드 성공', id: iframeData['id']
                            }}, '*');
                          break;
                        case 'play':
                          break;
                      }
                      break;
                    case 'video':
                      switch (iframeData['command']) {
                        case 'play':
                          break;
                      }
                      break;
                    case 'fullScreen':
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
