import { DataManagerService } from './../services/data-manager.service';
import { Router } from '@angular/router';
import { CommonModule } from './../common.module';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { SoundManagerService } from '../services/sound-manager.service';
import { HelperService } from "../services/helper.service";
import { WithParentsTranslateService } from './with-parents.translate.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-with-parents',
    templateUrl: 'with-parents.component.html',
    styleUrls: ['with-parents.component.css']
})
export class WithParentsComponent implements OnInit {
  public bgmIconClass: string = this.dataManagerService.getBGMIconClass();
  public langType: string = (this._translate.translate.getDefaultLang() === 'kr')?'kor':'eng';
  public imagePath = environment.resourceURL.image;
  // private translate:TranslateService;

  constructor(private activatedRoute: ActivatedRoute, public _sndMgr: SoundManagerService,
              public dataManagerService: DataManagerService, public _helper: HelperService,
              private routes: Router, private commonModule: CommonModule,
              public _translate: WithParentsTranslateService) { }

  ngOnInit() {
    this._sndMgr.bgmPlay('/with-parents');
    this.commonModule.activityClass = 'with-parents';

    this.dataManagerService.isBGMOff$.subscribe(isBGMOff => {
      isBGMOff ? this.bgmIconClass = '_mute' : this.bgmIconClass = '';
    })
  }

  /**
   * 언어 변경
   * @param  type [description]
   * @return      [description]
   */
  public switchLanguage(type:string) {
      //초기화
      this.langType = (type !== 'kr')?'kor':'eng';
      this._translate.translate.setDefaultLang((type === 'en')?'kr':'en');
  }
}
