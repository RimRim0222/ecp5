import { HttpClient } from '@angular/common/http';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import {CommonModule} from '../../common.module';
import {HelperService} from '../../services/helper.service';
import {DataManagerService} from '../../services/data-manager.service';
import {SoundManagerService} from '../../services/sound-manager.service';
import { environment } from '../../../environments/environment';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { _ } from 'underscore';
import $ from 'jquery';
import { WithParentsTranslateService } from '../../with-parents/with-parents.translate.service';
import { icreateContentsConfig } from '../icreate-contents-config';
declare var TweenMax: any;

@Component({
  selector: 'app-vocabulary-lists',
  templateUrl: '../../with-parents/vocabulary-lists/vocabulary-lists.component.html',
  styleUrls: ['../../with-parents/vocabulary-lists/vocabulary-lists.component.css']
})
export class VocabularyPrintComponent implements OnInit, AfterViewInit {
  public ResourceURL = environment.LCMS_ResourceURL;
  public imagePath = environment.resourceURL.image;
  public langType: string = this._translate.translate.getDefaultLang();
  public activityData = [
    {actCode: 'PF1', title: 'Chant it!', cls: 'active'},
    {actCode: 'RF1', title: 'Read it!', cls: 'default'},
    {actCode: 'MF2', title: 'Find it!', cls: 'default'}];
  private currentAct = 'PF1';
  private learningEleCode = null;
  private lessonId =  null;
  public currentWeekName: string;
  public isTeacher = false;
  public weekSelectorStyle: Array<object>;
  private week: number = 1;
  public vocabData;
  public isShowContainer: boolean = true;
  public isShowPreviewCloseBtn: boolean = true;
  public pdfFile = { url: null, name: null };
  public config: SwiperConfigInterface = {
    speed       : 300,
    spaceBetween: 150,
    observer: true,
    navigation  : {
      nextEl: '.vocabulary-card .btn-swiper-next',
      prevEl: '.vocabulary-card .btn-swiper-prev',
    }
  };

  constructor(private commonModule: CommonModule, public _dataMgr: DataManagerService,
              public _helper: HelperService, public _sndMgr: SoundManagerService,
              private http: HttpClient, public _translate: WithParentsTranslateService) { }

  ngOnInit() {
    this.commonModule.activityClass = 'with-parents-vocabulary-lists';
    this.isTeacher = true;
    this.isShowContainer = false;
    this.isShowPreviewCloseBtn = false;
    this._sndMgr.initAudio();

    const URLParam = new URLSearchParams(window.location.search);
    this._dataMgr.weekData = {
      validWeek: [], permittedWeek: [], lastWeekOfSeason1: 0, viewWeek: 1, seqOfCourseWeek: 0,
      thisWeek: 0, untilThisWeek: [], firstWeekOfMonth: new Array(12), minValidWeek: 0, allWeek: [], monthNames: []
    };
    this.currentAct = URLParam.get('activityCode');
    this.lessonId = URLParam.get('lessonId');
    const contents = icreateContentsConfig[this.currentAct][this.lessonId];
    this.pdfFile.name = contents['fileName'];
    this.pdfFile.url = environment.resourceURL.static + contents['fileURL'];
    this.learningEleCode = contents['learningEleCode'];

    const sub = this.loadData(contents['currCode']);
    sub.subscribe(() => {
      sub.unsubscribe();
      this.processCardData();
      this.openPrintPreview();
    });
  }

  ngAfterViewInit() {
    function wheel($div, deltaY: number){
      // console.log($div);
      let step: number = 0.2;
      let pos: number = $div['0']['scrollTop'];
      let nextPos: number = pos + (step*(deltaY));
      // console.log("pos: ", + pos + "DelatY: " + deltaY + ", Step: " + step + ", nextPos: " + nextPos);
      $div.scrollTop(nextPos);
      // $div.animate({ scrollTop: nextPos }, 'slow');
    }

    $('.withParents-vocabulary-lists__box .swiper-container').bind('mousewheel',
      function(event, delta, deltaX, deltaY) {
        // console.log(`event: ${event} , delta: ${delta} deltaX: ${deltaX} deltaY:  ${deltaY}`);
        // console.log(event.originalEvent.deltaY);
        wheel($('.withParents-vocabulary-lists__box .swiper-container'), event.originalEvent.deltaY);
        event.preventDefault();
      });
  }

  public changeActivity(actIdx: number) {
    this.currentAct = this.activityData[actIdx]['actCode'];
    _.each(this.activityData, (d, i) => {
      if (actIdx == i)
        d['cls'] = 'active';
      else
        d['cls'] = 'default';
    })
    if (this.checkInvalidWeek(this.week))
      return;

    this.loadData();
  }

  public isWeekSelectorOpen: boolean = false;
  public weekSelectorToggle(isOpen: boolean) {
    this.isWeekSelectorOpen = isOpen;

    const $target = document.querySelector('.withParents-vocabulary-lists__box .select-box');
    if (isOpen) {
      setTimeout(() => {
        document.querySelectorAll('.withParents-vocabulary-lists__box .select-box__layer .btn-select')[this.week-1]
          .scrollIntoView(false);
      }, 20);

      $target.querySelector('.select-box__wrap')['style'].height = '272px';
      TweenMax.fromTo(
        $target.querySelector('.select-box__layer'),
        0.15,
        {display: 'none', y: -20, opacity: 0},
        {display: 'block', y: 0, opacity: 1}
      );
    } else {
      $target.querySelector('.select-box__wrap')['style'].height = '52px';
      TweenMax.fromTo(
        $target.querySelector('.select-box__layer'),
        0.15,
        {display: 'block', opacity: 1},
        {display: 'none', opacity: 0}
      );
    }
  }
  public weekSelectorMouseLeave() {
    if (this.isWeekSelectorOpen)
      this.weekSelectorToggle(false);
  }

  private checkInvalidWeek(week: number): boolean {
    if (this._dataMgr.getWeekType(week) == 'noPoly') {
      this._helper.openModal({type: 'noPoly'});
      return true;
    }
    if (this._dataMgr.getWeekType(week) == 'notPermitted') {
      this._helper.openModal({type: 'notBuyWeek'});
      return true;
    }
    return false;
  }

  public changeWeek(week: number) {
    if (this.checkInvalidWeek(week)) {
      this.weekSelectorToggle(false);
      return;
    }
    this.weekSelectorToggle(false);
    this.week = week;
    this.currentWeekName = `Week ${week}`;
    this.loadData();
  }

  private loadData(currCode = null) {
    console.log('learningEleCode', this.learningEleCode);
    const sub = this._dataMgr.loadFlashCardData(this.week, this.currentAct, currCode, this.learningEleCode);

    if (_.isNull(currCode)) {
      sub.subscribe(() => {
        sub.unsubscribe();
        this.processCardData();
      })
    }
    else
      return sub;
  }

  public onClickDownloadHandler() {
      this._sndMgr.playEventSound('common', 'buttonClick');
      this.http.get(this.pdfFile.url, {responseType: 'arraybuffer'})
          .subscribe(res => {
              this.commonModule.downLoadFile({data: res, name: this.pdfFile.name, type: 'application/pdf'});
          });
  }

  private processCardData() {
    this.vocabData = _.clone(this._dataMgr.flashCardData);
    _.each(this.vocabData['vocabs'], d => {
      d['WORD_NAME'] = d['WORD_NAME'] || '';
      d['WORD_NAME'].length >= 12 ? d['txtCls'] = 'high' : d['txtCls'] = 'low';
    })
  }

  public viewCardIdx = 0;
  public openDetail(idx: number) {
    this._helper.layerOpenId('#vocabularyCard01', () => {

    });
    if (idx > 0) {
      setTimeout(() => {
        this.viewCardIdx = idx;
      }, 50)
    }
    else {
      this.viewCardIdx = idx;
      document.querySelector('.vocabulary-card .btn-swiper-prev').classList.add('swiper-button-disabled');
    }
  }
  public playWordSound(path: string) {
    this._sndMgr.playSoundURL(environment.opURL + path);
  }

  public closeDetail() {
    this._helper.layerCloseId('#vocabularyCard01', () => {

    });
  }

  public setViewCard(idx: number) {
    this.viewCardIdx = idx;
    if (idx == 0)
      document.querySelector('.vocabulary-card .btn-swiper-prev').classList.add('swiper-button-disabled');
    else
      document.querySelector('.vocabulary-card .btn-swiper-prev').classList.remove('swiper-button-disabled');
  }

  public cardViewModes = [
    {mode: 'all',     txt: 'Text & Picture',cls: 'active'},
    {mode: 'text',    txt: 'Text',         cls: 'default'},
    {mode: 'picture', txt: 'Picture',      cls: 'default'}
    ];
  public currentCardViewMode = 'all';

  public setCardViewMode(idx: number) {
    this._sndMgr.playSoundURL(environment.opURL + this.vocabData['vocabs'][this.viewCardIdx]['SOUND_PATH']);
    this.currentCardViewMode = this.cardViewModes[idx]['mode'];
    _.each(this.cardViewModes, (d, i) => {
      idx == i ? d['cls'] = 'active' : d['cls'] = 'default'
    });
  }

  public updatePreviewTrigger = false;
  public pagedDataForPrint: Array<Array<object>>;
  public openPrintPreview() {
    this.pagedDataForPrint = this._helper.chuckArray(_.clone(this.vocabData['vocabs']), 2);
    this.updatePreviewTrigger = true;
    this._helper.layerOpenId('#vocabularyPrint01', () => {

    });
  }
  public closePrintPreview() {
    this._helper.layerCloseId('#vocabularyPrint01', () => {

    });
  }

  public printLayouts = ['size2by1', 'size2by2', 'size2by4'];
  public currentPrintLayout = 'size2by1';
  public setPrintLayout(idx: number) {
    this._sndMgr.playEventSound('common', 'checkboxClick');
    this.currentPrintLayout = this.printLayouts[idx];

    this.updatePreviewTrigger = false;
    if (idx == 0)
      this.pagedDataForPrint = this._helper.chuckArray(_.clone(this.vocabData['vocabs']), 2);
    else if (idx == 1)
      this.pagedDataForPrint = this._helper.chuckArray(_.clone(this.vocabData['vocabs']), 4);
    else
      this.pagedDataForPrint = this._helper.chuckArray(_.clone(this.vocabData['vocabs']), 8);

    setTimeout(() => {
      this.updatePreviewTrigger = true;
    }, 100);
  }

  public currentPrintCardStyle = 'all';
  public setPrintCardStyle(style: string) {
    this._sndMgr.playEventSound('common', 'checkboxClick');
    this.currentPrintCardStyle = style;
  }

  public print() {
    const body = document.querySelector('body');
    const wrap = document.getElementById('wrap');
    const printContents = document.querySelector('.vocabulary-print01 .preview__box').innerHTML;
    const printDiv = document.createElement('div');
    printDiv.className = "print-div";

    body.appendChild(printDiv);
    printDiv.innerHTML = printContents;
    wrap.style.display = 'none';
    window.print();
    wrap.style.display = 'block';
    printDiv.remove();
  }
}
