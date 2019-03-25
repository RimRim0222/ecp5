import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { constant } from '../global/constans/constant';
import {DataManagerService} from "../services/data-manager.service";
import {HelperService} from "../services/helper.service";
import { _ } from 'underscore';
import $ from 'jquery';
import {SoundManagerService} from "../services/sound-manager.service";
import {CommonModule} from "../common.module";
declare var TweenMax: any;

@Component({
  selector: 'app-flashcard',
  templateUrl: './flashcard.component.html',
  styleUrls: ['./flashcard.component.css', 'flashcard.custom.component.css']
})
export class FlashcardComponent implements OnInit, AfterViewInit {
  @Input() modalDepth: string;
  @Output() openEvent = new EventEmitter();
  @Output() closeEvent = new EventEmitter();
  @ViewChild('swiperWrapper') public swiperWrapper: any;
  public swiper: any;
  public imagePath = environment.imagePath;
  public ResourceURL = environment.LCMS_ResourceURL;
  public opURL = environment.opURL;
  public cardsData: Array<object> = [];
  public cardListStyle: Array<string> = [];
  public viewCardIdx: number = 0;
  private activityCode: string;
  private isSoundPlaying: boolean = false;

  constructor(private _dataMgr: DataManagerService, protected _helper: HelperService,
              private http: HttpClient, public _sndMgr: SoundManagerService, private commonModule: CommonModule) {  }
  public config: SwiperConfigInterface = {
    keyboard: true,
    mousewheel: true,
    observer: true,
    spaceBetween: 196,
    navigation: {
      nextEl: '.main-flashcard-detail01 .btn-swiper-nextFC',
      prevEl: '.main-flashcard-detail01 .btn-swiper-prevFC',
    }
  };

  ngOnInit() {
    // this.commonModule.activityClass = 'flashcard';
    if (this._dataMgr.isMobile && this.modalDepth == '2')
      this.setEventSound();

    this._helper.openModal$.subscribe((info: object) => {
      console.log("info: ", info)
      const modalInfo = this._dataMgr.modalInfos[info['type']];
      if (this.modalDepth == modalInfo['depth'].toString()) {

        if (info['type'] == 'flashCardMain') {
          console.log('openmodal call info :', info);
          this.cardsData = [];
          this.cardListStyle = [];
          this.activityCode = info['activityCode'];
          const sub = this._dataMgr.loadFlashCardData(this._dataMgr.weekData.viewWeek, info['activityCode'], info['currCode']||null, info['learningEleCode']||null);
          sub.subscribe(() => {
            sub.unsubscribe();

            this.cardsData = this._dataMgr.flashCardData['vocabs'];

            _.each(this.cardsData || [], (d) => {
              if (!d['UPLOAD_FILE_NAME_LIST'])
                d['UPLOAD_FILE_NAME_LIST'] = '';
              else
                d['UPLOAD_FILE_NAME_LIST'] = this.ResourceURL + d['UPLOAD_FILE_NAME_LIST'];
            })

            _.each(this._dataMgr.flashCardData['questions'] || [], (d, i) => {
              let tmp = [0, 0, 0, 0];

              if (typeof d['firstAns'] == 'undefined' || d['firstAns'] == null) {
                d['firstAns'] = tmp.toString();
              }
              _.each(d['firstAns'].split(','), d => {
                let dNum = parseInt(d);
                if (Number.isInteger(dNum) && dNum > 0)
                  tmp[dNum - 1] = dNum;
              })

              this.cardsData[i]['firstAns'] = tmp;
              this.cardsData[i]['firstAnsYn'] = d['firstAnsYn'];
              this.cardsData[i]['itmCode'] = d['itmCode'];
              this.cardsData[i]['itmNo'] = d['itmNo'];
              this.cardsData[i]['examPaperCode'] = d['examPaperCode'];
              this.cardsData[i]['contentsCode'] = d['contentsCode'];

              const cont = this._dataMgr.flashCardData['contentsInfo'];
              this.cardsData[i]['currCode'] = cont['currCode'];
              this.cardsData[i]['lcmsPrdId'] = cont['lcmsPrdId'];
              this.cardsData[i]['activityCode'] = cont['activityCode'];
            });
            this.setCardStyle();

            console.log('FlashCard Processed Data :', this.cardsData);
          });
        }
        else if (info['type'] == 'flashCardDetail') {
          //this.cardsData = info['data'];
          this.cardsData = this._dataMgr.flashCardData['vocabs'];
          _.each(this.cardsData, card => {
            card['puzzleType'] = this._helper.generateRandom(1, 3);
            card['puzzleShow'] = ['block','block','block','block'];
            _.each(card['firstAns'], (d, i) => {
              if (d != 0)
                card['puzzleShow'][i] = 'none';
            });
            card['firstAnsYn'] == 'Y' ? card['clickable'] = true : card['clickable'] = false;
          });
          console.log('FlashCard detail Data :', this.cardsData);
          this.swiper = this.swiperWrapper.directiveRef.swiper();
          this.swiper.allowSlideNext = true;
          setTimeout(() => {
            this.viewCardIdx = info['cardIdx'];
            this.swiper.slideTo(info['cardIdx'], 0);
            this.addOtherZoneClickHandler();
            if (!document.querySelectorAll(".flashcard__item")[info['cardIdx']].classList.contains("complete")) {
              document.querySelector('.btn-swiper-nextFC').classList.add('swiper-button-disabled');
            }
              
            if (!this._dataMgr.isMobile)
              this.createCanvas();
          }, 50);
        }
      }
    });
  }

  public puzzleTouchAudioPath: string;
  private puzzleTouchAudioObj;
  public puzzleSepaAudioPath: string;
  private puzzleSepaAudioObj;
  public puzzleParticleAudioPath: string;
  private puzzleParticleAudioObj;
  private setEventSound() {
    this.puzzleTouchAudioPath = environment.resourceURL.sound + 'flashcard/' + constant.sound.flashcard.puzzleTouch;
    this.puzzleSepaAudioPath = environment.resourceURL.sound + 'flashcard/' + constant.sound.flashcard.puzzleSeparate;
    this.puzzleParticleAudioPath = environment.resourceURL.sound + 'common/' + constant.sound.common.particle1;
    this.puzzleTouchAudioObj = new Audio(this.puzzleTouchAudioPath);
    this.puzzleSepaAudioObj =  new Audio(this.puzzleSepaAudioPath);
    this.puzzleParticleAudioObj = new Audio(this.puzzleParticleAudioPath);
  }

  public isShowMainCloseBtn: boolean = true;
  ngAfterViewInit() {
    const URLParam = new URLSearchParams(window.location.search);
    if ( URLParam.get('teacherYN') == 'Y' && URLParam.get('comp') == 'flashcard'
      && (URLParam.get('activityCode') == 'PF1' || URLParam.get('activityCode') == 'RF1')) {
      this.isShowMainCloseBtn = false;

      const modalInfo = this._dataMgr.modalInfos['flashCardMain'];
      if (this.modalDepth == modalInfo['depth'].toString()) {
        this._sndMgr.initAudio();
        this._dataMgr.weekData = {
          validWeek: [], permittedWeek: [], lastWeekOfSeason1: 0, viewWeek: 1, seqOfCourseWeek: 0,
          thisWeek: 0, untilThisWeek: [], firstWeekOfMonth: new Array(12), minValidWeek: 0, allWeek: [], monthNames: []
        };
        this._helper.openModal({type: 'flashCardMain', activityCode: URLParam.get('activityCode'), currCode: URLParam.get('currCode'), learningEleCode: URLParam.get('learningEleCode')});
      }
    }
  }

  private paths = [
    "M322.45,104a32.79,32.79,0,0,0-18.85,5.6c-.27.17-.52.33-.75.5q-7.16,4.84-13.8,3.75a17.77,17.77,0,0,1-6-2.2c-.63-.4-1.25-.82-1.85-1.25a26.56,26.56,0,0,1-2.15-1.75V0H20c-.67,0-1.32,0-1.95.05Q0,1,0,20V275.1H109.8c.2-.3.42-.6.65-.9.43-.6.85-1.22,1.25-1.85a17.77,17.77,0,0,0,2.2-6q1.09-6.64-3.75-13.8c-.17-.23-.33-.48-.5-.75a32.79,32.79,0,0,1-5.6-18.85,33.13,33.13,0,0,1,10.3-24.5,35.8,35.8,0,0,1,50,0A33.13,33.13,0,0,1,174.6,233a32.77,32.77,0,0,1-6.25,19.8,0,0,0,0,1,0,.05l-.05.1q-6.45,10.69.7,20.5c.43.57.9,1.13,1.4,1.7h108.7V171.45A27.22,27.22,0,0,1,282,168.9q9.79-7.16,20.5-.7l.1.05a0,0,0,0,0,0,.05,32.77,32.77,0,0,0,19.8,6.25,33.13,33.13,0,0,0,24.5-10.3,35.8,35.8,0,0,0,0-49.95A33.13,33.13,0,0,0,322.45,104Z",
    "M563.219806953,20a25.48,25.48,0,0,0,-1.9500000000000455,-10.549999999999997q-4,-8.740000000000002,-16.09999999999991,-9.400000000000006c-0.6300000000001091,0,-1.2799999999999727,0,-1.9500000000000455,0h-262.55v108.6a26.56,26.56,0,0,0,2.1499999999999773,1.75c0.6000000000000227,0.4300000000000068,1.2200000000000273,0.8500000000000227,1.8500000000000227,1.25a17.77,17.77,0,0,0,6,2.200000000000017q6.649999999999977,1.0900000000000034,13.799999999999955,-3.75c0.2300000000000182,-0.1699999999999875,0.4800000000000182,-0.3300000000000125,0.75,-0.5a32.79,32.79,0,0,1,18.850000000000023,-5.6000000000000085a33.13,33.13,0,0,1,24.5,10.299999999999997a35.8,35.8,0,0,1,0,49.999999999999986a33.13,33.13,0,0,1,-24.5,10.300000000000011a32.77,32.77,0,0,1,-19.800000000000068,-6.25a0,0,0,0,1,-0.049999999999954525,-0.05000000000001137l-0.10000000000002274,-0.05000000000001137q-10.690000000000055,-6.449999999999989,-20.5,0.6999999999999886a27.22,27.22,0,0,0,-2.949999999999932,2.5v103.65000000000018h107.14999999999998a29.25,29.25,0,0,1,3.2999999999999545,3.7000000000000455q7.149999999999977,9.789999999999964,0.7000000000000455,20.5l-0.05000000000006821,0.10000000000002274a0,0,0,0,0,0,0.049999999999954525a32.77,32.77,0,0,0,-6.25,19.800000000000068a33.13,33.13,0,0,0,10.300000000000068,24.5a35.8,35.8,0,0,0,50,0a33.13,33.13,0,0,0,10.299999999999955,-24.5a32.79,32.79,0,0,0,-5.600000000000023,-18.850000000000023c-0.16999999999984539,-0.2699999999999818,-0.32999999999992724,-0.5199999999999818,-0.5,-0.75q-4.839999999999918,-7.149999999999977,-3.75,-13.800000000000068a17.77,17.77,0,0,1,2.2000000000000455,-6c0.39999999999997726,-0.6299999999999955,0.82000000000005,-1.25,1.25,-1.8500000000000227a24.81,24.81,0,0,1,2.5,-2.8999999999999773h111.09999999999997Z",
    "M168.35,253.21616221939996a32.77,32.77,0,0,0,6.25,-19.80000000000001a33.13,33.13,0,0,0,-10.300000000000011,-24.5a35.8,35.8,0,0,0,-50,0a33.13,33.13,0,0,0,-10.300000000000011,24.5a32.79,32.79,0,0,0,5.600000000000023,18.850000000000023c0.17000000000001592,0.2699999999999818,0.3299999999999841,0.5199999999999818,0.5,0.75q4.839999999999975,7.159999999999968,3.75,13.799999999999955a17.77,17.77,0,0,1,-2.200000000000017,6c-0.4000000000000057,0.6300000000000523,-0.8199999999999932,1.2500000000000568,-1.25,1.8500000000000227c-0.22999999999998977,0.30000000000001137,-0.45000000000001705,0.5999999999999659,-0.6500000000000057,0.9000000000000341h-109.74999999999997v258.00000000000045q0,20,20,20h259.05v-107.00000000000051a18.46,18.46,0,0,0,-1.6499999999999773,-1.2999999999999545c-0.5999999999999659,-0.43000000000006366,-1.2200000000000273,-0.849999999999909,-1.849999999999966,-1.25a17.77,17.77,0,0,0,-6,-2.2000000000000455q-6.650000000000034,-1.099999999999909,-13.800000000000011,3.75c-0.2300000000000182,0.17000000000007276,-0.4800000000000182,0.3300000000001546,-0.7500000000001137,0.5a32.79,32.79,0,0,1,-18.84999999999991,5.600000000000136a33.13,33.13,0,0,1,-24.5,-10.300000000000182a35.8,35.8,0,0,1,0,-49.949999999999875a33.13,33.13,0,0,1,24.5,-10.299999999999955a32.77,32.77,0,0,1,19.850000000000023,6.25a0,0,0,0,1,0.049999999999954525,0.049999999999954525l0.10000000000002274,0q10.690000000000055,6.4500000000000455,20.5,-0.7000000000000455c0.8300000000000409,-0.6299999999998818,1.650000000000034,-1.3199999999999363,2.4500000000000455,-2.0499999999999545v-109.10000000000008h-108.75000000000009c-0.5,-0.5699999999999932,-1,-1.1299999999999955,-1.4000000000000057,-1.6999999999999886q-7.150000000000006,-9.800000000000011,-0.6999999999999886,-20.5l0.05000000000001137,-0.0999999999999659a0,0,0,0,0,0.04999999999998295,-0.05000000000001137Z",
    "M446.8102868982,286.425682274q-1.099999999999909,6.650000000000034,3.75,13.800000000000011c0.16999999999995907,0.2300000000000182,0.3300000000000409,0.4800000000000182,0.5,0.75a32.79,32.79,0,0,1,5.600000000000023,18.850000000000023a33.13,33.13,0,0,1,-10.300000000000011,24.5a35.8,35.8,0,0,1,-49.94999999999999,0a33.13,33.13,0,0,1,-10.300000000000068,-24.5a32.77,32.77,0,0,1,6.250000000000057,-19.80000000000001a0,0,0,0,1,0.05000000000001137,-0.05000000000001137l0,-0.0999999999999659q6.449999999999932,-10.689999999999998,-0.7000000000000455,-20.5a29.25,29.25,0,0,0,-3.25,-3.7000000000000455h-107.14999999999998v109.15000000000003c-0.7999999999999545,0.7300000000000182,-1.6200000000000045,1.420000000000016,-2.4499999999999886,2q-9.800000000000011,7.150000000000034,-20.5,0.6999999999999886l-0.0999999999999659,-0.049999999999954525a0,0,0,0,0,0,0a32.77,32.77,0,0,0,-19.800000000000068,-6.250000000000057a33.13,33.13,0,0,0,-24.5,10.300000000000011a35.8,35.8,0,0,0,0,50a33.13,33.13,0,0,0,24.5,10.300000000000068a32.79,32.79,0,0,0,18.850000000000023,-5.600000000000023c0.2699999999999818,-0.16999999999995907,0.5199999999999818,-0.3300000000000409,0.75,-0.5q7.160000000000025,-4.840000000000032,13.800000000000011,-3.75a17.77,17.77,0,0,1,6,2.2000000000000455c0.6299999999999955,0.39999999999997726,1.25,0.8199999999999363,1.849999999999966,1.25a18.46,18.46,0,0,1,1.650000000000034,1.2999999999999545v106.9499999999997h262.5q13.75,0,18,-9.449999999999818a25.48,25.48,0,0,0,2,-10.549999999999955v-258h-111.09999999999997a24.81,24.81,0,0,0,-2.5,2.8999999999999773c-0.43000000000006366,0.6000000000000227,-0.8500000000000227,1.2200000000000273,-1.25,1.8500000000000227a17.77,17.77,0,0,0,-2.2000000000000455,6Z"
  ];
  private canvas = null;
  private createCanvas() {
    const wrap = document.querySelector('.main-flashcard-detail01__content .flashcard');
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'flashDetailOverlayForPC';
    this.canvas.width  = 578;
    this.canvas.height = 578;
    this.canvas.style.position = "absolute";
    this.canvas.style.top = '47px';
    this.canvas.style.left = '226px';
    this.canvas.style['z-index'] = '10';
    this.canvas.style.cursor = 'pointer';
    this.canvas.style.webkitUserSelect = 'none';
    wrap.appendChild(this.canvas);

    const pathResult = [];
    const ctx = this.canvas.getContext('2d');
    _.each(this.paths, (d, i) => {
      let tmp = new Path2D(d);
      tmp.closePath();
      // ctx.stroke(tmp);
      pathResult.push(tmp);
    })

    $('#flashDetailOverlayForPC').click(event => {
      const cardData = this.cardsData[this.viewCardIdx];
      if (cardData['firstAnsYn'] == 'Y') {
        this.playWordSound(true, cardData['SOUND_PATH']);
        return;
      }
      if (this.isSoundPlaying)
        return;

      let offsetX = $('#flashDetailOverlayForPC').offset().left;
      let offsetY = $('#flashDetailOverlayForPC').offset().top;
      let x = event.pageX - offsetX;
      let y = event.pageY - offsetY;
      // console.log('click x:', x, ' / y:', y);

      _.each(pathResult, (path, i) => {
        if (ctx.isPointInPath(path, x, y)) {
          // console.log('point in path :', this.puzzlePositionSuffix[i]);
          if (_.contains(cardData['firstAns'], i+1))
            return;

          this.setPuzzleData(this.puzzlePositionSuffix[i]);
          this.flashcardDetailQuizClick(this.puzzlePositionSuffix[i]);
          this.checkAllowSlide(this.viewCardIdx);
        }
      })
    })
  }

  private afterDetailOpen3MTimer = setTimeout(() => {});
  private afterDetailOpen3MProcess() {
    clearTimeout(this.afterDetailOpen3MTimer);
    this.afterDetailOpen3MTimer = setTimeout(() => {
      if (this.cardsData[this.viewCardIdx]['firstAnsYn'] != 'Y') {
        _.each(this.puzzlePositionSuffix, d => {
          this.setPuzzleData(d);
          this.flashcardDetailQuizClick(d);
        });
        this.checkAllowSlide(this.viewCardIdx);
      }
    }, 180000);
  }

  private detailOpen3MTimer = setTimeout(() => {});
  private setCardStyle() {
    let isBeforeFirstAnsY: boolean = true;
    let isNoneActive: boolean = true;
    const tmp = [];
    _.each(this.cardsData, d => {
      if (d['firstAnsYn'] == 'Y') {
        if ( isBeforeFirstAnsY )
          isBeforeFirstAnsY = false;
        d['activeCls'] = 'complete';
      }
      else if ( !isBeforeFirstAnsY && isNoneActive) {
        d['activeCls'] = 'active motion';
        isNoneActive = false;
      }
      else
        d['activeCls'] = 'default';

      tmp.push(d['activeCls']);
    })
    if ( isNoneActive && !_.every(this.cardsData, d => { return d['activeCls'] == 'complete' }) )
      this.cardsData[0]['activeCls'] = 'active motion';
      clearTimeout(this.detailOpen3MTimer);
      this.detailOpen3MTimer = setTimeout(() => {
        if (!document.querySelector("#flashCardDetail").classList.contains("active"))
          this.openDetail(document.querySelector(".flashcard__item.active button")["name"]);
      }, 180000);

    // console.log('card styles ', tmp);
  }

  public setViewCard(cardIdx: number) {
    this._sndMgr.playEventSound('flashcard', 'otherCard');
    this.viewCardIdx = cardIdx;
    //this.afterDetailOpen3MProcess();
    this.checkAllowSlide(cardIdx);
  }

  public puzzlePositionSuffix: Array<string> =
    ['puzzle-top-left', 'puzzle-top-right', 'puzzle-btm-left', 'puzzle-btm-right'];

  public flashcardDetailQuizClick(target: string) {
    console.log('click :', target);
    //this.afterDetailOpen3MProcess();

    const $item = document.querySelectorAll('.main-flashcard-detail01 .swiper-slide')[this.viewCardIdx]
      .querySelector('.' + target);
    const $wrap = document.querySelector('.main-flashcard-detail01 .swiper-container');
    const direction = Math.floor(Math.random() * 2) + 1;
    const rotation = (direction === 1) ? (20 + (Math.floor(Math.random() * 15) + 1)) : -(20 + (Math.floor(Math.random() * 15) + 1));

    $item['style']['zIndex'] = 2;//선택된 퍼즐 최상위로 올림
    $item.classList.add('active');//퍼즐에 파티클 추가
    $wrap['style']['overflow'] = 'visible';//마스크 일시 제거

    TweenMax.fromTo($item, .7,
      {display: 'block', rotation: 0, y: 0, scale: 1}, {rotation: rotation, y: -100, scale: 1.08,
        onComplete () { TweenMax.to($item, .8, {display: 'none', rotation: 45, y: 1500, zIndex: 0,
            onComplete () {
              $item.classList.remove('active');
              $wrap['style']['overflow'] = 'hidden'//마스크 다시 적용
            }})
        }
      }
    )
  }

  public playWordSound(isPlayable: boolean, soundPath: string) {
    if (isPlayable)
      this._sndMgr.playSoundURL(environment.opURL + soundPath);
  }

  public checkAllowSlide(cardIdx: number) {
    setTimeout(() => {
      const nextBtn = document.querySelector('.btn-swiper-nextFC');
      if (this.cardsData[cardIdx]['firstAnsYn'] == 'Y' && cardIdx < this.cardsData.length-1) {
        this.swiper.allowSlideNext = true;
        nextBtn.classList.remove('swiper-button-disabled');
      }
      else {
        this.swiper.allowSlideNext = false;
        nextBtn.classList.add('swiper-button-disabled');
      }
    }, 10)
  }

  public isCardButtonDisabled(cardIdx: number): boolean {
    if (cardIdx == 0)
      return false;
    else if (this.cardsData[cardIdx-1]['firstAnsYn'] == 'Y')
      return false;
    else
      return true;
  }

  public openDetail(itemNo: number) {
    this.openEvent.next({type:'flashCardDetail', data:this.cardsData, cardIdx:itemNo, ignoreSendPopupClose: true});
    //this.afterDetailOpen3MProcess();
  }

  public playPuzzleSoundSeq(soundPath: string, isLast: boolean) {
    this.isSoundPlaying = true;
    if (!this._dataMgr.isMobile) {
      if (!isLast)
        this._sndMgr.playEventSound('flashcard', 'puzzleTouch');
      else
        this._sndMgr.playEventSound('common', 'particle1');
    }
    else {
      if (!isLast)
        this.puzzleTouchAudioObj.play();
      else
        this.puzzleParticleAudioObj.play();
    }
    if (soundPath) {
      setTimeout(() => {
        this._sndMgr.playSoundURL(environment.opURL+soundPath);
      }, 1500);
    }

    setTimeout(() => {
      this.isSoundPlaying = false;
    }, 3300);
  }

  public processPuzzleClick(position: string, cardIdx) {
    if (!this.isSoundPlaying) {
      this.setPuzzleData(position);
      this.flashcardDetailQuizClick(position);
      this.checkAllowSlide(cardIdx);
    }
  }

  public setPuzzleData(position: string) {
    const idx:number = this.puzzlePositionSuffix.indexOf(position) + 1;
    const cardData = this.cardsData[this.viewCardIdx];

    if (_.contains(cardData['firstAns'], idx))
      return;
    else
      cardData['firstAns'][idx-1] = idx;

    if (!_.contains(cardData['firstAns'], 0)) {
      this.playPuzzleSoundSeq(cardData['SOUND_PATH'], true);
      cardData['firstAnsYn'] = 'Y';
      this.setCardStyle();

      const $item = document.querySelectorAll('.main-flashcard-detail01 .puzzle-steadfast')[this.viewCardIdx];
      const $wrap = document.querySelector('.main-flashcard-detail01 .swiper-container');
      $wrap.classList.add('active');
      $item.classList.add('complete');
      setTimeout(() => {
        $item.classList.remove('complete');
        $wrap.classList.remove('active');
      }, 3300);
      setTimeout(() => {
        cardData['clickable'] = true;
        $item['style']['cursor'] = 'pointer';
      }, 4000);

      if ( this.viewCardIdx == this.cardsData.length-1 ) {
        setTimeout(() => {
          this._helper.openModal({type: `flashcardComplete`, hideTxt: true, ignoreSendPopupClose: true});
        }, 4500);
        this.closeDetailTimer = setTimeout(() => {
          this.closeModal('flashCardDetail');
        }, 7500);
      }
    }
    else
      this.playPuzzleSoundSeq(cardData['SOUND_PATH'], false);

    const body = {
      'currCode':   cardData['currCode'],
      'lcmsPrdId':  cardData['lcmsPrdId'],
      'activityCode':cardData['activityCode'],
      'itmCode':    cardData['itmCode'],
      'itmNo':      cardData['itmNo'],
      'firstAns':   cardData['firstAns'].toString(),
      'firstAnsYn': cardData['firstAnsYn'] === 'Y' ? 'Y' : 'N',
      'applyYn': 'Y',
      'examPaperCode': cardData['examPaperCode'],
      'contentsCode': cardData['contentsCode']
    }
    console.log('setPuzzle Req body :', body);

    this._dataMgr.setFlashCardPuzzleData(body);

    if ( _.every(this.cardsData, d => { return d['firstAnsYn'] == 'Y'; }) ) {
      const body = {
        'currCode':   this.cardsData[0]['currCode'],
        'lcmsPrdId':  this.cardsData[0]['lcmsPrdId'],
        'activityCode':this.cardsData[0]['activityCode'],
        'completeYn': 'Y'
      }
      this._dataMgr.setFlashCardComplete(body);
      this._dataMgr.completeAllFlashCard$.next({week: this._dataMgr.weekData.viewWeek-1, actCode: body['activityCode']});
    }
  }

 /* public resetPuzzleAll() {   //TESTTEST
    const cont = this._dataMgr.flashCardData['contentsInfo'];
    _.each(this._dataMgr.flashCardData['questions'], d => {
      const body = {
        'currCode':   cont['currCode'],
        'lcmsPrdId':  cont['lcmsPrdId'],
        'activityCode':cont['activityCode'],
        'itmCode':    d['itmCode'],
        'itmNo':      d['itmNo'],
        'firstAns':   " ",
        'firstAnsYn': "N",
        'examPaperCode': d['examPaperCode'],
        'contentsCode': d['contentsCode']
      };
      console.log('플래시카드 리셋 요청 :', body);
      this.http.put(environment.polyApiUrl+'/enroll/question', JSON.stringify(body),
      {headers: {'accept':'*!/!*','Content-Type': 'application/json'}, withCredentials: true})
        .subscribe(res => {
          console.log('플래시카드 리셋 완료 :', res);
        })
    });
    this.closeModal('flashCardMain');
  }
  public clearPuzzleAll() {   //TESTTEST
    if (this.cardsData[this.viewCardIdx]['firstAnsYn'] != 'Y') {
      _.each(this.puzzlePositionSuffix, d => {
        this.setPuzzleData(d);
        this.flashcardDetailQuizClick(d);
      });
      this.checkAllowSlide(this.viewCardIdx);
    }
  }*/

  public openHelp() {
    if (this.activityCode == 'PF1')
      this._helper.openModal({type: 'commonHelp', helpPage: 'flashcardChantIt', ignoreSendPopupClose: true});
    else if (this.activityCode == 'RF1')
      this._helper.openModal({type: 'commonHelp', helpPage: 'flashcardReadIt', ignoreSendPopupClose: true});
  }

  private otherZoneEl: any;
  private currentOtherZoneClickHandler: any;
  private addOtherZoneClickHandler() {
    const modalEl = document.getElementById('modalDepth2');
    this.otherZoneEl = modalEl.querySelector('.modal__dim');
    this.currentOtherZoneClickHandler = this.otherZoneClickHandler.bind(this);
    this.otherZoneEl.addEventListener('click', this.currentOtherZoneClickHandler);
  }

  private otherZoneClickHandler() {
    const allPuzzle = [1,2,3,4];
    const remainPuzzle = _.difference(allPuzzle, this.cardsData[this.viewCardIdx]['firstAns']);
    if ( remainPuzzle.length == 0 || this.isSoundPlaying )
      return;

    const targetIdx = Math.floor( Math.random()*(remainPuzzle.length-1+1) );
    const targetPuzzleName = this.puzzlePositionSuffix[remainPuzzle[targetIdx] - 1];
    this.setPuzzleData(targetPuzzleName);
    this.flashcardDetailQuizClick(targetPuzzleName);
    this.checkAllowSlide(this.viewCardIdx);
  }

  private closeDetailTimer = setTimeout(() => {});
  public closeModal(modalType: string) {
    if (modalType == 'flashCardDetail') {
      if (!this._dataMgr.isMobile)
        document.getElementById('flashDetailOverlayForPC').remove();

      this.otherZoneEl.removeEventListener('click', this.currentOtherZoneClickHandler);
      //clearTimeout(this.afterDetailOpen3MTimer);
      clearTimeout(this.closeDetailTimer);
      
      /*if (document.querySelector("#mainFlashCard").classList.contains("active")) {
        clearTimeout(this.detailOpen3MTimer2);
        this.detailOpen3MTimer2 = setTimeout(() => {
          this.openDetail(document.querySelector(".flashcard__item.active button")["name"]);
        }, 3000);
      }*/
    }
    clearTimeout(this.detailOpen3MTimer);
    this.closeEvent.next(modalType);
  }
}
