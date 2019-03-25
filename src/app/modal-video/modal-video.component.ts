import {Component, AfterViewInit} from '@angular/core';
import {DataManagerService} from "../services/data-manager.service";
import { Subject } from 'rxjs/index';
import {SoundManagerService} from "../services/sound-manager.service";
import { environment } from 'src/environments/environment';
declare var videojs: any;

@Component({
  selector: 'app-modal-video',
  templateUrl: './modal-video.component.html',
  styleUrls: ['./modal-video.component.css']
})
export class ModalVideoComponent implements AfterViewInit {
  private wrap: any;
  private player: any;
  public playEnded$ = new Subject<string>();
  private isPlaying: boolean = false;
  private playQueue = [];
  private beforeBGMVolume: number;
  private videoEl = null;
  private videoElementId: string = 'videoEl';
  private weekGroupIdxOfProlog: number = null;
  public imagePath = environment.imagePath;

  constructor(protected _dataMgr: DataManagerService, protected _sndMgr: SoundManagerService) { }

  ngAfterViewInit() {
    this.wrap = document.getElementsByClassName('modal-video-wrap')[0];

    this._dataMgr.playProlog$.subscribe(([path, weekGroupIdx]) => {
      this.playProlog(path, weekGroupIdx);
    });
    this._dataMgr.playEpilog$.subscribe(path => {
      this.play(path, 'epilog');
    });

    // 비디오 재생
    this._dataMgr.playVideoOnDemand$.subscribe(info => {
      if (info['type'] == 'initProlog'){
        this.play('ECP5_prolog.mp4', 'onDemand');
      } else if (info['type'] == 'totalEpilog') {
        this.play('ECP5_epilog.mp4', 'totalEpilog');
      } else if (info['type'] == 'prolog') {
        this.play(`prolog_${info['idx'].toString()}.mp4`, 'onDemand');
      } else if (info['type'] == 'monthlyEpilog') {
        this.play(`epilog_${info['idx'].toString()}.mp4`, 'onDemand');
      } else if (info['type'] == 'fromContent') {
        this.play(info['name'], 'onDemand', true);
      }
    });

    const subs = this._dataMgr.initDataLoaded$.subscribe(() => {
      subs.unsubscribe();
      if (!this._dataMgr.getFirstStatus('initPrologVideo')) {
        document.getElementsByClassName('skip-video')[0]['style']['display'] = 'block';
        this.play('ECP5_prolog.mp4', 'initProlog');
        // this.play('prolog_1.mp4', 'initProlog');
      }
    })
  }

  public play(path: string, type: string, controls:boolean = false) {
    if (this.isPlaying) {
      this.playQueue.push([path, type]);
      return;
    }
    this.isPlaying = true;
    this.videoEl = document.createElement('video');
    this.videoEl.setAttribute('id', this.videoElementId);
    this.videoEl.style.display = 'block';
    this.videoEl.setAttribute("class","video-js");

    if (type == 'onDemand' && controls == true)
      document.querySelector('.modal-video-outer .btn-close')['style']['display'] = 'block';
    else
      document.querySelector('.modal-video-outer .btn-close')['style']['display'] = 'none';

    // this.videoEl == #videoEl
    /*if (type == 'onDemand' && path == "MIC_conf_170217.mp4") {
      this.videoEl.setAttribute("style", "width: 853px ; height: 480px ; left: 86px; top: 131px; padding: 0;")
    }*/

    let outerEl = document.getElementsByClassName('modal-video-outer')[0];
    outerEl.appendChild(this.videoEl);
    this.player = videojs(this.videoElementId, { autoplay:true, isFullscreen: false, controls:controls, fluid:true, preload:'auto', techOrder:["html5","flash"] });
    this._sndMgr.bgmPause();

    setTimeout(() => {
      this.player.src(environment.resourceURL.video + path);
      this.player.on('ended', () => {
        this.playEnded(type);
      })
    }, 10);

    this.wrap['style']['display'] = 'block';
    if (type == 'onDemand' && path == "MIC_conf_170217.mp4") { // this.videoEl == #videoEl_html5_api
      document.querySelector("#videoEl").setAttribute("style", "width: 853px ; height: 480px ; left: 86px; top: 131px; padding: 0;")
      document.querySelector("#videoEl_html5_api").setAttribute("style", "height: 480px !important; width: 854px !important;");
      //this.videoEl.setAttribute("style", "height: 480px !important; width: 854px !important;");
    }
    document.querySelector(".vjs-fullscreen-control").setAttribute("style", "display: none");
  }

  private playEnded(type: string = 'initProlog') {
    this.player.dispose();
    this.wrap['style']['display'] = 'none';
    this.videoEl.remove();
    // this._sndMgr.bgmAudio.volume(this.beforeBGMVolume);
    this.isPlaying = false;

    if (type == 'initProlog') {
      document.getElementsByClassName('skip-video')[0]['style']['display'] = 'none';
      this._dataMgr.setFirstStatus('initPrologVideo', true);
      this._dataMgr.initPrologEnded$.next();
    }
    else if (type == 'initPrologSkip') {
      document.getElementsByClassName('skip-video')[0]['style']['display'] = 'none';
      this._dataMgr.initPrologEnded$.next();
    }
    else if (type == 'epilog')
      this._dataMgr.epilogEnded$.next();
    else if (type == 'totalEpilog')
      this._dataMgr.setFirstStatus('epilogVideo', true);
    else if (type == 'monthlyProlog') {
      let tmp = this._dataMgr.getFirstStatus('prologVideo');
      // console.log('########### modal video tmp :', tmp);
      tmp[this.weekGroupIdxOfProlog] = true;
      this._dataMgr.setFirstStatus('prologVideo', tmp);
      // if (this._dataMgr.checkMainTouchGuideOpen)
      //   this._dataMgr.openMainTouchGuide$.next();
      this._dataMgr.monthlyPrologEnded$.next();
    }

    if (this.playQueue.length > 0) {
      const playInfo = this.playQueue.shift();

      if (playInfo[1] == 'epilog' && type == 'epilog') {
        this.playQueue = [];
        this._sndMgr.bgmResume();
      }
      else
        this.play(playInfo[0], playInfo[1]);
    }
    else
      this._sndMgr.bgmResume();
  }

  public skipVideo() {
    this.player.pause();
    this.playEnded('initPrologSkip');
  }

  public playProlog(path: string, weekGroupIdx: number) {
    this.weekGroupIdxOfProlog = weekGroupIdx;
    this.play(path, 'monthlyProlog');
  }

  public videoClose() {
    this.playEnded('fromContent');
  }
}
