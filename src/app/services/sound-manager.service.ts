import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs/index';
import { Location } from '@angular/common';
import { constant } from '../global/constans/constant';
import { _ } from 'underscore';
declare var Audio5js: any;

@Injectable({
  providedIn: 'root'
})
export class SoundManagerService {
  public isBGMOff: boolean = false;
  public bgmAudio: any;
  public eventAudio: any;
  public titleAudio: any;
  public isReadyBGMAudio: boolean = false;
  public isReadyBGMAudio$ = new Subject<boolean>();
  public isCanPlayBGMAudio: boolean = false;
  public isCanPlayBGMAudio$ = new Subject<boolean>();

  private currentBGMClass = '';
  private lastBGMPath: string;

  constructor(private _location: Location) { }

  public initAudio() {
    this._location.subscribe(moveInfo => {
      // console.log('location back event!', moveInfo.url.split("(")[0]);
      let bgmTitle = moveInfo.url.split("(")[0].split("?")[0];
      if (bgmTitle.indexOf('/clubhouse') > -1)
        bgmTitle = '/clubhouse';

      this.bgmPlay(bgmTitle);
    });

    this.bgmAudio = new Audio5js({
      swf_path: environment.resourceURL.static + '/audio5js.swf',
      throw_errors: true,
      ready: (player) => {
        console.log('bgm audio engine :', player);
        setTimeout(() => {
          console.log('bgm audio ready');
          this.isReadyBGMAudio$.next(true);
          this.isReadyBGMAudio = true;
        });
      }
    });

    this.bgmAudio.on('canplay', () => {
      // console.log('bgmAudio canplay');
      this.isCanPlayBGMAudio$.next();
      this.isCanPlayBGMAudio = true;

      this.bgmAudio.pause();
      this.bgmAudio.play();
    });
    this.bgmAudio.on('play', () => {
      // console.log('### audio play event');
    });
    this.bgmAudio.on('pause', () => {
      // console.log('### audio pause event');
    });
    this.bgmAudio.on('ended', () => {
      // console.log('### audio end event');
      this.bgmLoadFile(this.lastBGMPath,true);
    });

    this.eventAudio = new Audio5js({
      swf_path: environment.resourceURL.static + '/audio5js.swf',
      throw_errors: true,
      ready: (player) => {
        setTimeout(() => {
          console.log('event audio ready');
        });
      }
    });

    this.titleAudio = new Audio5js({
      swf_path: environment.resourceURL.static + '/audio5js.swf',
      throw_errors: true,
      ready: (player) => {
        setTimeout(() => {
          console.log('player audio ready');
        });
      }
    });
  }

  public bgmLoadFile(mp3Path: string, loop: boolean) {
    this.bgmAudio.load(mp3Path);
  }

  public isAfterInitBGM: boolean = false;
  public mainBGMSeason: string = 'spring';
  public bgmPlay(bgmCls: string) {
    // console.log('### called bgmPlay func bgmCls =', bgmCls);

    if (!this.isBGMOff && (this.currentBGMClass != bgmCls || !this.bgmAudio.playing)) {
      this.currentBGMClass = bgmCls;

      if (bgmCls == 'none')
        this.bgmAudio.pause();
      else {
        if (bgmCls == '/main')
          bgmCls = '/main-' + this.mainBGMSeason;

        this.lastBGMPath = environment.resourceURL.sound + constant.sound.bgmClass[bgmCls];
        if (this.isReadyBGMAudio)
          this.bgmLoadFile(this.lastBGMPath,true);
        else {
          const subs = this.isReadyBGMAudio$.subscribe(() => {
            subs.unsubscribe();
            this.bgmLoadFile(this.lastBGMPath,true);
          })
        }
      }
    }
  }

  public bgmPause() {
    if (!this.isAfterInitBGM)
      return;

    this.bgmAudio.pause();
  }
  public bgmResume(bgmCls = null) {
    if (!this.isAfterInitBGM)
      return;

    if ( _.isNull(bgmCls) )
      this.bgmPlay(this.currentBGMClass);
    else
      this.bgmPlay(bgmCls);
  }

  public playEventSound(category: string, soundName: string) {
    // console.log('src : ', environment.resourceURL.sound + category + '/' + constant.sound[category][soundName]);
    if (this.eventAudio == null) {
      return;
    }
    this.eventAudio.load(environment.resourceURL.sound + category + '/' + constant.sound[category][soundName]);
    this.eventAudio.on('canplay', () => {
      // console.log('event audio canplay');
      this.eventAudio.pause();
      this.eventAudio.play();
    });
  }

  public playTitleSound(category: string, soundName: string) {
    // console.log('src : ', environment.resourceURL.sound + category + '/' + constant.sound[category][soundName]);
    this.titleAudio.load(environment.resourceURL.sound + category + '/' + constant.sound[category][soundName]);
    this.titleAudio.on('canplay', () => {
      // console.log('event audio canplay');
      this.titleAudio.pause();
      this.titleAudio.play();
    });
  }

  public playSoundURL(url: string) {
    this.eventAudio.load(url);
    this.eventAudio.on('canplay', () => {
      // console.log('event audio canplay');
      this.eventAudio.pause();
      this.eventAudio.play();
    });
  }
}
