import { animate, transition, style, trigger, state } from '@angular/animations';
import { HelperService } from './../../services/helper.service';
import { CommonModule } from './../../common.module';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DataManagerService } from './../../services/data-manager.service';
import { WithParentsService } from './../with-parents-service';
import { SoundManagerService } from 'src/app/services/sound-manager.service';
import { environment } from 'src/environments/environment';
import { WithParentsTranslateService } from '../with-parents.translate.service';
@Component({
  selector: 'app-time-spent',
  templateUrl: './time-spent.component.html',
  styleUrls: ['./time-spent.component.css'],
  animations: [
    trigger('grow', [
      transition('void => *', [
        style({height: '{{startHeight}}px', opacity: 0}),
        animate('1s ease'),
      ], {params: {startHeight: 0}})
    ])
  ]
})
export class TimeSpentComponent implements OnInit, OnDestroy {
    @Input()
    trigger: string;
    startHeight: number;

  public imagePath = environment.resourceURL.image;
  public langType: string = this._translate.translate.getDefaultLang();

  constructor(public commonModule: CommonModule,
        public _helper: HelperService,
        public withParentsService: WithParentsService,
        private dataManagerService: DataManagerService,
        public _sndMgr: SoundManagerService,
        public _translate: WithParentsTranslateService) { }

  ngOnInit() {
        this._sndMgr.bgmPlay('none');
        this.commonModule.activityClass = 'with-parents-time-spent';
        this.init();
  }

  init() {
      this.withParentsService.pageList = null;
      if (this.dataManagerService.initDataLoaded) {
          this.withParentsService.timeSpentList();
      } else {
          const subs = this.dataManagerService.initDataLoaded$.subscribe(() => {
              subs.unsubscribe();
              console.log('Time-Spent - DataManager Initialized');
              this.withParentsService.timeSpentList();
          });
      }
  }

  public onClickWeekHandler(weekType: string){
      this.withParentsService.timeSpentList(weekType);
  }

  ngOnDestroy() {
    this.withParentsService.pageList = null;
  }
}
