import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import {DataManagerService} from "../services/data-manager.service";
import {HelperService} from "../services/helper.service";
import {SoundManagerService} from "../services/sound-manager.service";
// declare var AV: any;
declare var POLY: any;

interface ContentFrame {
  initContentComp: () => void;
  sendMsgToChild: (op: string, msg: object) => void;
  iframeOnLoad: () => void;
  registerOpMsgFromCourse: (op: string, fn) => void;
  child: any;
  childFrameElementId: string;
  parentPath: string;
  getQueryParam: (name: string) => string;
}

@Component({
  selector: 'app-content-frame',
  templateUrl: './content-frame.component.html',
  styleUrls: ['./content-frame.component.css']
})
export class ContentFrameComponent implements ContentFrame, OnInit, OnDestroy {
  protected opURL = environment.opURL;
  public safeURL: string = null;
  protected activityCode: string = null;
  protected contentInfoData: any;
  public child: any;
  public childFrameElementId: string;
  public parentPath: string = 'main';
  protected tutorialCompleteYN: string = 'N';
  protected tutoCompleteYNTyped: string = ''; // 1-N/2-N/3-N/4-N
  protected sayItRecordTempData = new Array(6);
  protected contentRunType = '';

  constructor(protected route: ActivatedRoute, public _dataMgr: DataManagerService, public http: HttpClient,
              public _helper: HelperService, public _sndMgr: SoundManagerService) { }

  ngOnInit() {
    this._sndMgr.bgmPlay('none');
    this._dataMgr.setMsgEventListener(this._dataMgr.contentFrameEventListener, this._dataMgr);
    this._dataMgr.currentContentComponent = this;

    // Content 진입시 현재 위치를 가져온다.
    let type = location.pathname.split('/')[1].replace('(contentWrap:contents)','');
    this.activityCode = this.getQueryParam('activityCode');
    this.childFrameElementId = 'contentsFrame_' + type + '_' + this.activityCode;

    this._dataMgr.contentPopupClose$.subscribe(() => {
      this.sendMsgToChild('notifyDeviceOrientationResult', {type: 'popupClose'});
    })

    this.initContentComp();
  }

  /**
   * Main에서 실행되는 Contents처리
   * @return [description]
   */
  public initContentComp() {
      console.log('--initMainContentComp--');
  }

  public setInitInfo(iframeURL: string, parentPath: string, contentInfoData: any) {
    this.parentPath = parentPath;
    this.contentInfoData = contentInfoData;
    this.safeURL = iframeURL;
  }

  public sendMsgToChild(op: string, msg: object) {
    const fullMsg: object = {'op': op, 'from': 'poly', 'data': msg};
    // const fullMsg = {"op":"contents_info","from":"poly","data":{"param":{"memberCode":"","learningYearCode":"","termGbn":"","lcmsPrdId":"","currCode":"","activityCode":"","contentsCode":"","crsAuthoringCode":"","learningGbn":"","correctViewYN":"Y","retakeYN":"Y","tryLimit":1},"answerList":[{"projectAuthoringCode":"","objectAuthoringCode":"","questionNumber":1,"correctAnswer":"","userAnswer":"","count":"","total":"","correctYN":"N","applyYN":"Y","tryCount":1,"answerRate":"","attachFileCode":"","attachfileURL":""}]}};
    this.child.contentWindow.postMessage(fullMsg,'*' );
    console.error('컨텐츠로 보낸 메시지: ', fullMsg);
  }

  public registerOpMsgFromCourse(op: string, fn) {
    this._dataMgr.registerIframeMsgFn(op, fn, this);
  }

  public getQueryParam(name: string): string {
    return (this.route.snapshot.queryParamMap.get(name) || '').toString();
  }

  private isIframeLoaded: boolean = false;

  public iframeOnLoad() {
    console.log('iframeOnLoad');
    if (!this.isIframeLoaded) {
      this.isIframeLoaded = true;
      this._dataMgr.loadContentsFlag = false;
       const refreshInterval = setInterval(() => {
        console.log('setInterval create');
         if (this._dataMgr.loadContentsFlag) {
            console.log('clearInterval delete');
            clearInterval(refreshInterval);
            return false;
         }
          this.child = document.getElementById(this.childFrameElementId);
          this.sendMsgToChild('contents_info', this.contentInfoData);
        },1*1000);
    }
  }

  public startRecordId: number;
  public recordStart(id) {
    this.startRecordId = id;
    var callback = function(result = null) {
      console.log('called record start callback');
      if ( Array.isArray(result) )
        this._dataMgr.sendRecordResultNotify({command:'record', result:'fail', msg:result[1], id:this.startRecordId});
    }
    POLY.callRecordStart(callback.bind(this));

  }
  public stopRecordId: number;
  public recordStop(id) {
    this.stopRecordId = id;

    var callback = function(result = null) {
      if (!Array.isArray(result))
        POLY.callRecordGetData(this.stopRecordId, this.recordUpload.bind(this));
      else
        this._dataMgr.sendRecordResultNotify({command:'record', result:'fail', msg:result[1], id:this.stopRecordId});
    }
    POLY.callRecordStop(callback.bind(this), id);
  }

  // public recordPlay(id) {
  //   const buffer = this._helper.base64ToArrayBuffer(window.localStorage.getItem('record'+id));
  //   let player = AV.Player.fromBuffer(buffer);
  //   player.on('end', () => {
  //     this._dataMgr.sendRecordResultNotify({command:'play', result:'success', msg:'played successfully', id:id});
  //   });
  //   player.on('error', (e) => {
  //     this._dataMgr.sendRecordResultNotify({command:'play', result:'fail', msg:e, id:id});
  //   });
  //   player.play();
  // }

  public recordUpload(id) {
    if (this.stopRecordId == id) {
      const filename = 'say-it_'+id+'.mp3';
      const file = this._helper.base64ToMp3File(window.localStorage.getItem('record' + id), filename);
      const url = environment.polyApiUrl + '/global/fileUploadAction';
      const formData = new FormData();
      formData.append('dirName', 'say-it');
      formData.append('file', file);

      this.http.post(url, formData, {withCredentials: true})
        .subscribe(res => {
          const fileURL = res[0]['path'] + res[0]['name'];
          this.sayItRecordTempData[id] = {
            actualFileName: res[0]['name'],
            userFileName: res[0]['originalName'],
            fileSize: res[0]['size'],
            filePath: res[0]['path'],
            thumbFileName: ''
          }
          console.log('record file url:', fileURL);
          this._dataMgr.sendRecordResultNotify({command:'record', result:'success', fileUrl:environment.resourceURL.userFile+fileURL, msg:'녹음 업로드 성공', id:this.stopRecordId});
        }, error => {
          this._dataMgr.sendRecordResultNotify({command:'record', result:'fail', msg:error, id:this.stopRecordId});
        });
    }
    else
      this._dataMgr.sendRecordResultNotify({command:'record', result:'fail', msg:'마지막 녹음과 업로드 대상 녹음의 id가 일치하지 않습니다', id:this.stopRecordId});
  }

  protected toggleIframeFullscreen(toFull: string) {
    const iframe = document.getElementById(this.childFrameElementId);
    if (toFull == 'Y') {
      console.log('컨텐츠 프레임 전체화면으로');
      const screenScale = this._helper.getScreenScale();
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
  }

  ngOnDestroy() {
    this.safeURL = null;
    console.log(this.childFrameElementId + ' component destroyed!');
  }
}
