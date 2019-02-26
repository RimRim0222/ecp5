import { constant } from '../../global/constans/constant';
import { Component } from '@angular/core';
import { ContentFrameComponent } from '../../content-frame/content-frame.component';
import { _ } from 'underscore';

@Component({
  selector: 'app-cont-frame-main-common',
  templateUrl: './cont-frame-main-common.component.html',
  styleUrls: ['./cont-frame-main-common.component.css']
})
export class ContFrameMainCommonComponent extends ContentFrameComponent {
  public isRecvSaveCompleted: boolean = false;
  public didIncompleteSaving: boolean = false;
  public fromWithParentComp = null;

  public initContentComp() {
    let url = this.getQueryParam('url');
    this.contentRunType = this.getQueryParam('runType') || '';
    this.fromWithParentComp = this.getQueryParam('fromWithParentComp') || null;
    this.tutorialCompleteYN = this._dataMgr.getFirstStatus('mainTutorialComplete')[this.activityCode];

    this.registerOpMsgFromCourse('saveActivityQuizDetail', function (d) {
      console.log('학습저장 요청 받음');

      const answerListSrc: Array<object> = d['answerList'];
      let answerListResult = [];

      //console.log( 'this.isRecvSaveCompleted : ', _.every(d['answerList'], answer => { return answer['applyYN'] == 'Y'; }));
      if ( _.every(d['answerList'], answer => { return answer['applyYN'] == 'Y'; }) ) { // 보상 여부 판단
        this.isRecvSaveCompleted = true;
        console.log("보상ok. this.isRecvSaveCompleted = true;")
      }

      _.each(answerListSrc, (d, key) => {
        answerListResult[key] = _.clone(this.contentInfoData['param']);

        let mapName: string;
        this.activityCode == 'MP1' ? mapName = 'sayItQuiz' : mapName = 'quiz';
        _.each(constant.contentInfoAnswerListPropNameMap[mapName], (courseName, dbName) => {
          answerListResult[key][dbName] = answerListSrc[key][courseName] || "";
        });
        answerListResult[key]['completeYn'] = this.isRecvSaveCompleted ? 'Y' : 'N';
        console.log("보상 플래그 this.isRecvSaveCompleted: ", this.isRecvSaveCompleted)
        answerListResult[key]['examPaperCode'] = this._dataMgr.mainContentsData['answerList'][key]['crsAuthoringCode'];
        answerListResult[key]['contentsCode'] = this._dataMgr.mainContentsData['answerList'][key]['contentsCode'];
      });

      _.each(answerListResult, (d, i) => {
        _.extend(d, this.sayItRecordTempData[i]);
      });

      const tuto = this._dataMgr.getFirstStatus('mainTutorialComplete');
      tuto[this.activityCode] = 'Y';
      this._dataMgr.setFirstStatus('mainTutorialComplete', tuto);

      if ( this._dataMgr.mainContentsData['isReview']) {
        this.isRecvSaveCompleted = false;
        this._dataMgr.sendMainActSaveCompleteNotifyToContent();
        return;
      } else if (answerListResult.length == 0) {
        this._dataMgr.saveMainContentsData(answerListResult[0]);
      } else {
        this._dataMgr.saveMainContentsData(answerListResult);
      }

      console.log('save answer ### ', answerListResult);
    });

    switch (this.activityCode) {

      case 'PP1': // Chant it
        this.registerOpMsgFromCourse('moveActivityMenu', function (d) {
          switch (d['type']) {
            case 'flashCard':
              this._helper.openModal({type: 'flashCardMain', activityCode: 'PF1'});
              break;
            case 'help': {
              this.openHelp(d);
              break;
            }
            case 'fullScreen': {
              this.toggleIframeFullscreen(d['mode']);
              break;
            }
          }
        });
        url = this.opURL + url;
        break;

      case 'PP2': // Play it
        this.registerOpMsgFromCourse('moveActivityMenu', function (d) {
          switch (d['type']) {
            case 'help':
              this.openHelp(d);
              break;
          }
        });
        url = this.opURL + url;
        break;

      case 'RV1': // Read it
        this.registerOpMsgFromCourse('moveActivityMenu', function (d) {
          switch (d['type']) {
            case 'flashCard':
              this._helper.openModal({type: 'flashCardMain', activityCode: 'RF1'});
              break;
            case 'help': {
              this.openHelp(d);
              break;
            }
            case 'fullScreen': {
              this.toggleIframeFullscreen(d['mode']);
              break;
            }
          }
        });
        url = this.opURL + url;
        break;

      case 'RP1': // Check it
        this.registerOpMsgFromCourse('moveActivityMenu', function (d) {
          switch (d['type']) {
            case 'help':
              this.openHelp(d);
              break;
          }
        });
        url = this.opURL + url;
        break;

      case 'MP1': // Say it
        this.registerOpMsgFromCourse('moveActivityMenu', function (d) {
          switch (d['type']) {
            case 'help':
              this.openHelp(d);
              break;
            case 'recordAudio':
              switch (d['command']) {
                case 'start':
                  this.recordStart(d['id']);
                  break;
                case 'stop':
                  this.recordStop(d['id']);
                  break;
                case 'play':
                  this.recordPlay(d['id']);
                  break;
              }
              break;
            case 'video':
              switch (d['command']) {
                case 'play':
                  this.videoPlay(d['name']);
                  break;
              }
              break;
          }
        });
        url = this.opURL + url;
        break;

      case 'MP2': // Find it
        this.registerOpMsgFromCourse('moveActivityMenu', function (d) {
          switch (d['type']) {
            case 'help':
              this.openHelp(d);
              break;
          }
        });
        url = this.opURL + url;
        break;


      case 'PF1':  // Chant Flashcard
        this.registerOpMsgFromCourse('moveActivityMenu', function (d) {
          switch (d['type']) {
            case 'flashCard': {
              this._helper.openModal({type: 'flashCardMain', activityCode: 'PF1'});
              break;
            }
          }
        });
        url = this.opURL + url;
        break;

      case 'RF1':  // Read Flashcard
        this.registerOpMsgFromCourse('moveActivityMenu', function (d) {
          switch (d['type']) {
            case 'flashCard': {
              this._helper.openModal({type: 'flashCardMain', activityCode: 'RF1'});
              break;
            }
          }
        });
        url = this.opURL + url;
        break;


      /*case 'TEST': {  //TESTTEST
        this.registerOpMsgFromCourse('customOP', function (d) {
          console.log('Received PP2 custom op!!!');
          console.log('custom op data :', d);
          console.log('msg source :', this.childFrameElementId); // scope test
        });

        this.registerOpMsgFromCourse('startVoiceRecord', function (d) {
          console.log('startVoiceRecord 메시지 수신');
          const target = document.getElementById(this.childFrameElementId)['contentWindow'];
          target.postMessage({op: 'notifyStartVoiceRecord', from: 'poly'}, '*');
        });

        this.registerOpMsgFromCourse('saveActivityCompStatus', function (d) {
          console.log('학습저장 - 단일문항');
        });
        this.registerOpMsgFromCourse('moveActivityMenu', function (d) {
          switch (d['type']) {
            case 'flashCard': {
              this._helper.openModal({type: 'flashCardMain', activityCode: 'PF1'});
              break;
            }
            case 'flashCard2': {
              this._helper.openModal({type: 'flashCardMain', activityCode: 'RF1'});
              break;
            }
            case 'help': {
              console.log('도움말 열기');
              // if ()
              this._helper.openModal({type: 'commonHelp', actionType: d['actionType'], helpPageCode: d['helpPageCode']})
              break;
            }
            case 'fullScreen':
              if (d['mode'] == 'Y') {
                console.log('컨텐츠 프레임 전체화면으로');
              }
              else {
                console.log('컨텐츠 프레임 기본크기로');
              }
              break;
            case 'recordAudio':
              switch (d['command']) {
                case 'start':
                  this.recordStart(d['id']);
                  break;
                case 'stop':
                  this.recordStop(d['id']);
                  break;
                case 'play':
                  this.recordPlay(d['id']);
                  break;
              }
              break;
            case 'video':
              switch (d['command']) {
                case 'play':
                  this.videoPlay(d['name']);
                  break;
              }
              break;
          }
        });

        if (window['iframeTestURL'])
          url = window['iframeTestURL'];
        else {
          // url = 'http://192.168.100.117:8080/ko/pc/html/iframe-test.html';
          url = 'http://localhost:8080/ko/pc/html/iframe-test.html';
        }
        break;
      }*/

      default:
        url = this.opURL + url;
    }

    let contentInfoFull = {
      param: this._dataMgr.mainContentsData['param'],
      answerList: this._dataMgr.mainContentsData['answerList']
    };

    /*//TESTTEST
    if (window['projectAuthoringCode']) {
      this._dataMgr.mainContentsData['answerList'] = new Array(window['objectAuthoringCode'].length);

      contentInfoFull['answerList'] = _.map(this._dataMgr.mainContentsData['answerList'], (d, i) => {
        return {
          applyYN: 'N',
          objectAuthoringCode: window['objectAuthoringCode'][i],
          projectAuthoringCode: window['projectAuthoringCode'],
          // userAnswer: window['userAnswer'][i],
          userAnswer: 'test',
          questionNumber: i+1,
          skillCode: ''
        };
      })
    }*/
    this.setInitInfo(url, 'main', contentInfoFull); // parentPath - main or clubhouse 등등
    // console.log('Contents iframe html :', url);
    // console.log('Contents Info :', contentInfoFull);
  }

  public openHelp(data: any) {
    this._helper.openModal({type: 'commonHelp', actionType: data['actionType']||'', helpPage: data['helpPageCode']});
  }

  private videoPlay(fileName: string) {
    this._dataMgr.playVideoOnDemand$.next({type: 'fromContent', name: fileName});
  }
}
