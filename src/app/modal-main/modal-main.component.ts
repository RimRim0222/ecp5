import { Location } from '@angular/common';
import { constant } from '../global/constans/constant';
import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../environments/environment';
import {Power2, Circ, Elastic, TweenLite} from 'gsap/all';
import {HelperService} from "../services/helper.service";
import {DataManagerService} from "../services/data-manager.service";
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { _ } from 'underscore';
import {SoundManagerService} from "../services/sound-manager.service";
import { message } from '../global/messages/message';
declare var CustomEase: any;
declare var TweenMax: any;

@Component({
  selector: 'app-modal-main',
  templateUrl: './modal-main.component.html',
  styleUrls: ['./modal-main.component.css']
})
export class ModalMainComponent implements OnInit {
  @Input() depth: string;
  public imagePath = environment.imagePath;
  public userPath = environment.opURL;
  public urlPdf: string = "";
  public msg: string;
  public title: string;
  public character: object = {
    list: [],
    // 선택된 character
    selectedEle: { characterName: 'default' }
  };

  public helpSwiperDisplay: boolean = false;
  public help: object = {};

  public helpConfig: SwiperConfigInterface = {
    speed: 0,
    touchRatio: 0,
    keyboard: true,
    mousewheel: true,
    observer: true,
    pagination: {
      el: '.common-help01 .swiper-pagination-wrapper',
      clickable: true,
      renderBullet: function (index, className) {
        return '<span class="' + className + ' ' + className + (index + 1) + '">' + (index + 1) + '</span>';
      },
    },
    navigation: {
      nextEl: '.common-help01 .btn-swiper-next',
      prevEl: '.common-help01 .btn-swiper-prev',
    }
  };

  public viewWeekGrp: number = 1;
  public rewardClickGuideTimer: any = null;
  private closeTimer: any;
  private modalInfo: object = null;
  public message = message;
  private ignoreSendPopupClose: boolean = false;
  public rewardType: string = '1';

  constructor(public _dataMgr: DataManagerService, public _helper: HelperService,
              public _sndMgr: SoundManagerService, private _location: Location) { }

  ngOnInit() {
    this._helper.openModal$.subscribe( info => {
      const modalInfo = this._dataMgr.modalInfos[info['type']];
      // console.log('modalInfo', this._dataMgr.modalInfos[info['type']]);

      if (info['ignoreSendPopupClose'])
        this.ignoreSendPopupClose = true;

      //pdfViewer
      if (info['type'] === 'pdfViewer'
            || info['type'] === 'activitySheetPdfViewer'
            || info['type'] === 'meetGreetPdfViewer') {
        const spd = .3;
        // viewer에서 layout 깨지는 현상으로 인해 setTimeout 추가
        setTimeout(() => {
          //this.urlPdf = info['url'] || '';
          /* iframe에 history가 남아 replace로 변경함 */
          const el = document.querySelector('#modalDepth' + modalInfo['depth']);
          const elDiv = el.querySelector('.' + modalInfo['elClass']);
          elDiv.querySelector('iframe')['contentWindow'].location.replace(info['url']);
          console.log( this.urlPdf );
        }, spd * 1000);
      }

      //commonModal
      if(info['type'] === 'commonModal' || info['type'] === 'commonModal02'){
          this.msg = info['msg'];
      }else if(info['type'] === 'commonModal03'){
          this.title = info['title'];
          this.msg = info['msg'];
      }

      // help
      if (info['type'] === this._dataMgr.modalInfos.commonHelp.type) {
        this.help = this.createHelpItemLists(info);
      }
      if (info['type'] === 'profileSetup') {
        console.log('profileSetup');
        this.getMemberCharacterList();
      }

      if (this.depth == modalInfo['depth']) {
        this.modalInfo = modalInfo;
        if (info['type'] == 'mainReward1') {
          console.log("보상 모달 들어옴")
          this.rewardType = Math.floor(Math.random()*2+1).toString();
          this.viewWeekGrp = this._dataMgr.getWeekGroupNum(this._dataMgr.weekData.viewWeek) + 1;
          this.rewardClickGuideTimer = setTimeout(() => {
            // 손가락 가이드 열림
            TweenMax.fromTo(`.${modalInfo['elClass']} .touch-guide`, 0.3, {opacity: 0, display: 'none'}, {opacity: 1, display: 'block'});
          }, 3000);
          this.monsterCure = this.createMonsterCureObj(this.depth);
        }
        this.openModalLayer(modalInfo);
      }
    });
  }

  public openModalLayer(modalInfo: object) {
    if (_.contains(['noPoly', 'notBuyWeek'], modalInfo['type']))
      this._sndMgr.playEventSound('common', 'noticePopup');

    const spd = .3;
    // console.log('call openModalLayer :', modalInfo);
    const el = document.querySelector('#modalDepth' + modalInfo['depth']);
    const elDiv = el.querySelector('.'+modalInfo['elClass']);

    TweenMax.to(el, spd, {display: 'block', opacity : 1, ease: Power2.easeIn});

    if (modalInfo['type'] == 'weeklyComplete' || modalInfo['type'] == 'mainClose') {
      // if (modalInfo['hideTxt']) TODO
      //
      // else
      //

      TweenMax.to(elDiv, spd, {display: 'block', opacity : 1, ease: Power2.easeIn, onComplete: () => {
        if (modalInfo['type'] !== 'mainClose') {
          this._sndMgr.playEventSound('common', 'pepperExcellent');
        }
        this.busPopOpenEvent(elDiv);
        if (modalInfo['type'] == 'weeklyComplete') {
          this.closeModal('flashCardDetail');
          this.closeTimer = setTimeout(() => {
            this.closeModal(modalInfo['type']);
          }, 5000);
        }
      }});
    }
    else
      TweenMax.to(elDiv, spd, {display: 'block', opacity: 1, ease: Power2.easeIn});

    TweenMax.fromTo(elDiv, spd, {scale: 0.7, opacity : 0, y : 0}, {scale: 1, opacity : 1, y : 0});
    setTimeout(() => {
      elDiv.classList.add('active');
      // help swiper show;
      if (modalInfo['type'] === this._dataMgr.modalInfos.commonHelp.type) {
        this.helpSwiperDisplay = true;
      }
    }, spd * 1000);
  }

  private busPopOpenEvent($wrap = null) {
    const EASE_BOUNCE_CUSTOM = CustomEase.create("custom", "M0,0 C0.14,0 0.305,0.446 0.358,0.561 0.434,0.726 0.564,0.973 0.572,1.01 0.58,0.995 0.632,0.972 0.79,0.972 0.924,0.972 1,1 1,1");

    //파티클
    TweenMax.fromTo( $wrap.querySelector('.particle'), 0.8, {scale: 0}, {scale: 1} );
    TweenMax.fromTo(
      $wrap.querySelector('.img'), 0.8, {opacity: 1, scale:0}, {opacity: 1, scale:1, ease: EASE_BOUNCE_CUSTOM} );
    // text 첫번째
    TweenMax.fromTo(
      $wrap.querySelector('.txt01'), 0.8, {opacity: 0, x: -100}, {opacity: 1, x: 0, ease: EASE_BOUNCE_CUSTOM} );
    // text 두번
    TweenMax.fromTo(
      $wrap.querySelector('.txt02'), 0.8, {opacity: 0, x: 100}, {opacity: 1, x: 0, ease: EASE_BOUNCE_CUSTOM} );
  }

  public weeklyCompleteDivClick() {
    clearTimeout(this.closeTimer);
    this.closeModal('weeklyComplete');
  }

  public closeModal(modalType: string) {
    console.log('modalType :', modalType, 'ignoreSendPopupClose:', this.ignoreSendPopupClose);

    if (modalType != 'flashCardDetail')
      this._sndMgr.playEventSound('common', 'buttonClick');

    const spd = .3;
    const el = document.querySelector('#modalDepth' + this._dataMgr.modalInfos[modalType].depth);
    const elDiv = el.querySelector('.' + this._dataMgr.modalInfos[modalType].elClass);

    this.urlPdf = '';

    TweenMax.to(el, spd, {display: 'none', opacity : 0, ease: Circ.easeOut});
    TweenMax.to(elDiv, spd, {display: 'none', opacity : 0, ease: Circ.easeOut});

    if (modalType == 'weeklyComplete')
      this.closeModal('flashCardDetail');

    setTimeout(() => {
      elDiv.classList.remove('active');
      // help swiper hide;
      if (modalType === this._dataMgr.modalInfos.commonHelp.type)
        this.helpSwiperDisplay = false;

      if (this.ignoreSendPopupClose && modalType == 'commonHelp')
        this.ignoreSendPopupClose = false;
      else if (modalType == 'commonHelp' || modalType == 'flashCardMain')
        this._dataMgr.contentPopupClose$.next();
    }, spd * 1000);

    if (modalType == 'mainClose'){
      setTimeout(() => {
        TweenLite.set(elDiv.querySelector('.particle'), {scale: 0});
        TweenLite.set(elDiv.querySelector('.img'), {opacity: 1, scale:0});
        TweenLite.set(elDiv.querySelector('.txt01'), {opacity: 0, x: -100});
        TweenLite.set(elDiv.querySelector('.txt02'), {opacity: 0, x: 100});
      },250);
   }

  }

  private createHelpItemLists(info: object) {
    const data: object = {guide: false, isArrow: false};
    let path: string;
    let helpPageCode = info['helpPage'];
    let actionTypePath: string = '';
    let mobilePath: string = '';
    if (helpPageCode == 'FF' && this._dataMgr.isMobile)
      mobilePath += `mo/`;

    if (_.contains(Object.keys(constant.helpInfo.content), helpPageCode)) {
      if (helpPageCode == 'RP1' || helpPageCode == 'FF' || helpPageCode == 'PP2') {
        if (helpPageCode == 'FF' && this._dataMgr.isMobile)
          _.extend(data, constant.helpInfo.content[helpPageCode+'_MO']['ac'+info['actionType']]);
        else
          _.extend(data, constant.helpInfo.content[helpPageCode]['ac'+info['actionType']]);

        actionTypePath += `_ac${info['actionType']}`;
      }
      else
        _.extend(data, constant.helpInfo.content[helpPageCode]);
    }
    else
      _.extend(data, constant.helpInfo.front[helpPageCode]);

    data['items']= _.map(new Array(data['count']), (d, i) => {
      return environment.resourceURL.image + `/help/${helpPageCode}/${mobilePath}img${i + 1}${actionTypePath}.jpg`;
    });
    return data;
  }

  /**
   * 캐릭터 선택
   * @param name 캐릭터 이름
   */
  public selectProfile(character) {
    console.log('character', character);
    this.character['selectedEle'] = _.clone(character);
  }

  /**
   * 캐릭터 수정
   */
  public saveCharacter() {
    if (this.character['selectedEle']['characterName'] !== 'default') {
      this._dataMgr.sessionData['character'] = this.character['selectedEle'];
      const sub = this._dataMgr.memberCharacterModify(this._dataMgr.sessionData['character'])
      .subscribe(res => {
        sub.unsubscribe();
        this._dataMgr.setCharacterPath();
        console.log('Main Contents 선택한 캐릭터 수정 완료 :', );
        this.closeModal('profileSetup');
      });
    } else if (this._dataMgr.sessionData['character'] != null) {
       const sub = this._dataMgr.memberCharacterDelete()
      .subscribe(res => {
        sub.unsubscribe();
        this._dataMgr.sessionData['character'] = null;
        this._dataMgr.setCharacterPath();
        console.log('Main Contents 선택한 캐릭터 삭제 완료 :', );
        this.closeModal('profileSetup');
      });
    } else {
      this.closeModal('profileSetup');
    }
  }

  /**
   * 원래 사진으로 복구
   */
  public restoreCharacter() {
    this.character['selectedEle']['characterName'] = 'default';
  }

  /**
   * 회원 캐릭터 목록
   */
  public getMemberCharacterList() {
    this.getMemberCharacterName();
    this._dataMgr.memberCharacterList().subscribe( res => {
      this.character['list'] = res['data'];
    });
  }

  /**
   * 캐리터 이름 가져오기
   */
  public getMemberCharacterName() {
    if (this._dataMgr.sessionData['character'] != null ) {
      this.character['selectedEle'] = this._dataMgr.sessionData['character'];
    } else {
      // (document.getElementById('bg_character') as HTMLImageElement).src = environment.opURL + this._dataMgr.sessionData['pictureUrl'];
      //console.log( document.getElementById('bg_character').style.background );
    }
  }

  private monsterCure: object;
  private createMonsterCureObj(depth): object {
    console.log("몬스터 큐어 영역")
    const self = this;
    let $item = document.querySelector(`.depth${depth} .monster-cure .item`);
    let $itemW, $itemH, outerRect, eventRect = null;
    let startX, startY, x, y, clientX, clientY = 0;

    function monsterCureMouseMoveEvent(event) {
      if (_.isNull(outerRect))
        return;

      clientX = event.clientX || event.touches[0].clientX;
      clientY = event.clientY || event.touches[0].clientY;
      x = clientX - outerRect.left + startX;
      y = clientY - outerRect.top + startY;

      if (x > 1024 - $itemW)
        x = 1024 - $itemW;
      if (y > 553 - $itemH)
        y = 553 - $itemH;
      if (y < 0)
        y = 0;
      if (x < 0)
        x = 0;
      $item['style']['transform'] = `translate(${x}px, ${y}px)`;
    }

    function monsterCureTouchMoveEvent(event) {
      const itemLeft = $item.getBoundingClientRect().left;
      const itemTop = $item.getBoundingClientRect().top;
      startX = itemLeft - event.touches[0].clientX;
      startY = itemTop - event.touches[0].clientY;
      event.preventDefault();
    }

    function monsterCureClickEvent(event) {
      const itemLeft = $item.getBoundingClientRect().left;
      if (itemLeft >= eventRect.left && itemLeft <= eventRect.right - 247) // 동물의 좌우 영역 안에 들어오는지 판단
        self.clickToCureMonster(true);
      else
        self.clickToCureMonster(false);
    }

    function init(depth) {
      setTimeout(() => {
        outerRect = document.querySelector(`.depth${depth} .monster-cure .monster-cure__outer`).getBoundingClientRect();
        eventRect = document.querySelector(`.depth${depth} .monster-cure .dim`).getBoundingClientRect();

        $itemW = $item.querySelector('.icon').clientWidth;
        $itemH = $item.querySelector('.icon').clientHeight;

        startX = -($itemW/2);
        startY = -($itemH/2);
      }, 100);
    }

    return {'init': init, 'item': $item, 'move': monsterCureMouseMoveEvent,
      'touchMove': monsterCureTouchMoveEvent, 'click': monsterCureClickEvent};
  }

  public pickRewardIcon() { // 보상 아이템을 선택하고 이벤트 핸들러 등록 및 팝업을 제거
    clearTimeout(this.rewardClickGuideTimer);
    TweenMax.fromTo(`.${this.modalInfo['elClass']} .touch-guide`, 0.3, {opacity: 0, display: 'block'}, {opacity: 1, display: 'none'})
    this.closeModal('mainReward1');

    setTimeout(() => {
      const depth = this.modalInfo['depth'];
      this._helper.openModal({type: 'monsterCure'});
      this.monsterCure['init'](depth);
      document.querySelector(`.depth${depth} .monster-cure`)['style'].display = 'block';
      document.querySelector(`.depth${depth} .modal__dim`)['style'].display = 'none';

      if (!this._dataMgr.isMobile) { //PC
        document.querySelector(`.depth${depth} .monster-cure .monster-cure__outer`)
          .addEventListener('mousemove', this.monsterCure['move'], false);
        document.querySelector(`.depth${depth} .monster-cure .monster-cure__outer`)
          .addEventListener('click', this.monsterCure['click'], false);
      }
      else { //Mobile
      console.log('cure - item: ', this.monsterCure['item'], ' touchMove: ', this.monsterCure['touchMove']);
        this.monsterCure['item'].addEventListener('touchstart', this.monsterCure['touchMove'], false);
        this.monsterCure['item'].addEventListener('touchmove', this.monsterCure['move'], false);
        this.monsterCure['item'].addEventListener('touchend', this.monsterCure['click'], false);
      }
    }, 10);
  }

  public clickToCureMonster(inZone: boolean) {
    // 커서 모양 보상아이콘 -> 일반. 치료 완료
    // particle 효과

    if (inZone) {
      console.log('몬스터 치료 완료');
      const depth = this.modalInfo['depth'];
      document.querySelector(`.depth${depth} .monster-cure`)['style'].display = 'none';
      document.querySelector(`.depth${depth} .modal__dim`)['style'].display = 'block';
      //PC
      if (!this._dataMgr.isMobile) {
        document.querySelector(`.depth${depth} .monster-cure .monster-cure__outer`)
          .removeEventListener('mousemove', this.monsterCure['move'], false);
        document.querySelector(`.depth${depth} .monster-cure .monster-cure__outer`)
          .removeEventListener('click', this.monsterCure['click'], false);
      }
      //Mobile
      else {
        this.monsterCure['item'].removeEventListener('touchstart', this.monsterCure['touchMove'], false);
        this.monsterCure['item'].removeEventListener('touchmove', this.monsterCure['move'], false);
        this.monsterCure['item'].removeEventListener('touchend', this.monsterCure['click'], false);
      }
      this.closeModal(this.modalInfo['type']);
      this._dataMgr.completeRewardAction$.next();
    }
    else
      console.log('몬스터 영역 아님');
  }

  public exitBrowser() {
    //치료 완료 후
    this._sndMgr.playEventSound('common', 'buttonClick');
    setTimeout(() => {
      if (!this._dataMgr.isMobile && window['cefQuery'] != undefined) {
        window['cefQuery']({
          request: 'PolyMessage:exit',
          onSuccess: function (response) {
            console.log('exit');
          },
          onFailure: function (error_code, error_message) {
            //alert('exit fail');
          }
        });
      }
      else if (!this._dataMgr.isMobile) {
        window.open('about:blank', '_top');
        opener = window;
        window.close();
      }
      else if (this._dataMgr.getMobileOS() == 'Android')
        window['poly'] && window['poly'].exit();
      else if (this._dataMgr.getMobileOS() == 'iOS')
        window['location'].href = "jscall://callback?function=exit";
    }, 200)
  }
}
