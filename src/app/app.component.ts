import { CommonModule } from './common.module';
import { Component, OnInit} from '@angular/core';
import {SoundManagerService} from './services/sound-manager.service';
import {DataManagerService} from './services/data-manager.service';
import {HelperService} from "./services/helper.service";
declare var TweenMax: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', './app.custom.component.css'],
  providers: [CommonModule]
})

export class AppComponent implements OnInit {
  public outerShow: string;
  public isMobile: string;

  constructor(private _sndMgr: SoundManagerService, public _dataMgr: DataManagerService,
              public _helper: HelperService, public commonModule: CommonModule) { }

  ngOnInit() {
      const URLParam = new URLSearchParams(window.location.search);
      if ( URLParam.get('teacherYN') !== 'Y' ) {
        this.appInitAnimation();
        this._sndMgr.initAudio();
        this._dataMgr.loadInitData();
        const subs = this._dataMgr.initDataLoaded$.subscribe(() => {
          subs.unsubscribe();
          console.log('App - DataManager Initialized');

          this.outerShow = 'outer-show';
        });
      }
  }

  private appInitAnimation() {
    const spd = 1.5;
    TweenMax.fromTo(
      document.getElementById('wrapDim'),
      spd,
      {backgroundColor:"rgba(255, 255, 255, 0)"},
      {backgroundColor:"rgba(255, 255, 255, 0.5)"}
    );
    TweenMax.fromTo(
      document.getElementById('wrapDim').querySelector('.cloud-left'),
      spd,
      {x: -600, scale: 1.5},
      {x: 0, scale: 1}
    );
    TweenMax.fromTo(
      document.getElementById('wrapDim').querySelector('.cloud-right'),
      spd,
      {x: 600, scale: 1.5},
      {x: 0, scale: 1}
    );
  }

  public emitGnbCloseEvent() {
    this._helper.gnbClose$.next();
  }
}
