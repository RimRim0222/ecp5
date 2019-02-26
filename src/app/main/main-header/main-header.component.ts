import { Component, OnInit, Input } from '@angular/core';
import {HelperService} from "../../services/helper.service";
import {SoundManagerService} from "../../services/sound-manager.service";
import {DataManagerService} from "../../services/data-manager.service";
import {Router} from '@angular/router';
declare var TweenMax: any;

@Component({
  selector: 'app-main-header',
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.css']
})
export class MainHeaderComponent implements OnInit {
  @Input() type: string;
  public bgmIconClass: string = this._dataMgr.getBGMIconClass();
  public isGNBOpen: boolean = false;
  constructor(public _helper: HelperService, public _sndMgr: SoundManagerService, private router: Router,
              public _dataMgr: DataManagerService) { }

  ngOnInit() {
    this._helper.gnbClose$.subscribe((isMute) => {
      this.gnbMenuClose(isMute);
    });
    if (this._helper.isFirstGNBInit)
      this._helper.isFirstGNBInit = false;

    this._dataMgr.isBGMOff$.subscribe(isBGMOff => {
      isBGMOff ? this.bgmIconClass = '_mute' : this.bgmIconClass = '';
    })
  }

  public gnbMenuOpen() {
    this.isGNBOpen = true;
    const $item = Array.from(document.querySelectorAll('.hr-group .hr-group__item.main')).reverse();
    document.querySelector('.hr-group .hr-group__items.main')['style']['display'] = 'block';

    TweenMax.fromTo( $item[0], 0.4, {x: 0, opacity: 0}, {x: 0, opacity: 1} );
    $item.shift();
    TweenMax.staggerFromTo( $item, 0.2, {x: 86, opacity: 0}, {x: 0, opacity: 1}, 0.05);
  }

  public gnbMenuClose(isMute: boolean = false) {
    if (this.isGNBOpen) {
      this.isGNBOpen = false;
      if (!isMute)
        this._sndMgr.playEventSound('main', 'settingClose');
      const $item = Array.from(document.querySelectorAll('.hr-group .hr-group__item.main')).reverse();

      TweenMax.fromTo( $item[0], 0.4, {x: 0, opacity: 1}, {x: 0, opacity: 0,
          onComplete () {
            const el = document.querySelector('.hr-group .hr-group__items.main');
            if (el)
              el['style']['display'] = 'none';
          }
        }
      );
      $item.shift();
      TweenMax.staggerFromTo( $item, 0.2, {x: 0, opacity: 1}, {x: 86, opacity: 0}, 0.05 );
    }
  }

  // public checkRunFromWeekTree() {
  //   console.log('router url: ', this.router.url);
  //
  //   if (this.router.url == '/week-tree')
  //     this._dataMgr.isRunwithParentFromWeekTree = true;
  //   else
  //     this._dataMgr.isRunwithParentFromWeekTree = false;
  // }

  public openHelp() {
    console.log('viewWeek : ', this._dataMgr.weekData.viewWeek);
    if (this.router.url === '/week-tree') {
      this._helper.openModal({type: 'commonHelp', helpPage: 'weekTree'});
    } else if  ( this._dataMgr.weekData.viewWeek < 14) {
      this._helper.openModal({type: 'commonHelp', helpPage: this.type});
    } else {
      this._helper.openModal({type: 'commonHelp', helpPage: 'main_2nd'});
    }
  }
}
