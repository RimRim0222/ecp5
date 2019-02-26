import { HelperService } from './../../services/helper.service';
import { HttpClient } from '@angular/common/http';
import { MeetGreet } from './meet-greet';
import { environment } from './../../../environments/environment';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { DataManagerService } from './../../services/data-manager.service';
import { WithParentsService } from './../with-parents-service';
import { CommonModule } from './../../common.module';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { SoundManagerService } from 'src/app/services/sound-manager.service';
import { _ } from 'underscore';
import { message } from 'src/app/global/messages/message';
import $ from 'jquery';
declare var Audio5js: any;

@Component({
    selector: 'app-meet-greet',
    templateUrl: 'meet-greet.component.html',
    styleUrls: ['meet-greet.component.css']
})
/**
 * Meet & Greet
 * 2018.12.12 NEO
 * [공지] 2분기 13주차부터 제공되는 컨텐츠입니다.
 * 1학기는 나오지 않습니다. (Story Board 참조 v1.01 Page 13 Description 4번 참조하세요)
 */
export class MeetGreetComponent implements OnInit, OnDestroy {

    private fileRootPath = environment.resourceURL.file;
    public imagePath = environment.resourceURL.image;
    private currentSoundIndex;
    private playAudio;
    private current;
    private dataPlayAudio = {
        soundIndex: 0,
        buttonIndex: 0,
        currentEle: null,
        sounds: null,
        currentButton: null
    };

    public config: SwiperConfigInterface = {
        keyboard: true,
        mousewheel: true,
        preventClicks: true,
        observer: true,
        observeParents: true,
        pagination: {
            el: '.swiper-pagination-wrapper',
            clickable: true,
            renderBullet: function (index, className) {
                return '<span class="' + className + ' ' + className + (index + 1) + '">' + (index + 1) + '</span>';
            },
        },
        navigation: {
            nextEl: '.btn-swiper-next',
            prevEl: '.btn-swiper-prev',
        }
    };

    constructor(private route: ActivatedRoute, private routes: Router,
        private commonModule: CommonModule, public withParentsService: WithParentsService,
        private dataManagerService: DataManagerService, private http: HttpClient, public _helper: HelperService,
        public _sndMgr: SoundManagerService, protected el: ElementRef) {
        }

    ngOnInit() {
        this._sndMgr.bgmPlay('none');
        this.commonModule.activityClass = 'with-parents-meet-greet';
        this.init();
    }

    ngOnDestroy() {
        this.playAudio =  null;
    }

    init() {
        this.withParentsService.pageList = null;
        if (this.dataManagerService.initDataLoaded) {
            this.withParentsService.meetGreetList();
        } else {
            const subs = this.dataManagerService.initDataLoaded$.subscribe(() => {
                subs.unsubscribe();
                console.log('Meet-Greet - DataManager Initialized');
                this.withParentsService.meetGreetList();
            });
        }
        this.initAudio();
    }

    /**
     * PDF 이벤트 핸들러
     * @param data sticker Data
     */
    public onClickPdfHandler(meetGreet: MeetGreet) {
        this._sndMgr.playEventSound('common', 'buttonClick');
        if (this.dataManagerService.isMobile) {
            this._helper.openModal({type: 'commonModal02', msg: message['alert.0003']['msg']});
            return false;
        }
        console.log ('meet-greet.component.ts ---- ', 'data :', meetGreet);
        const filePath = encodeURI( environment.resourceURL.pdf
            + '?path=' + meetGreet.filePdf.uploadFilePath + meetGreet.filePdf.uploadFileName
            + '&oriName=' + meetGreet.filePdf.userFileName);
        console.log ('fileDownload address :' + filePath);
        this._helper.openModal({type: 'meetGreetPdfViewer', url: filePath});
    }

    /**
     * 다운로드 핸들러
     * @param meetGreet
     * @param fileExtType
     */
    public onClickDownloadHandler(meetGreet: MeetGreet, fileExtType: String) {
        // 모바일은 지원 지원 안함
        if (this.dataManagerService.isMobile) {
            this._helper.openModal({type: 'commonModal02', msg: message['alert.0005']['msg']});
            return false;
        }

        this._sndMgr.playEventSound('common', 'buttonClick');
        console.log ('meet-greet.component.ts ---- ', 'data :', meetGreet);
        let filePath = this.fileRootPath + meetGreet.filePdf.uploadFilePath + meetGreet.filePdf.uploadFileName;
        let fileUserName = meetGreet.filePdf.userFileName;
        let fileType = 'application/pdf';
        if (fileExtType.toLocaleLowerCase() === 'zip') {
            filePath = this.fileRootPath + meetGreet.fileMp3.uploadFilePath + meetGreet.fileMp3.uploadFileName;
            fileUserName = meetGreet.fileMp3.userFileName;
            fileType = 'application/zip';
        }
        this.http.get(filePath, {responseType: 'arraybuffer'})
            .subscribe(res => {
                this.commonModule.downLoadFile({data: res, name: fileUserName, type: fileType});
            });
    }

    /**
     * 사운드 이벤트 핸들러
     * @param data 사운드파일
     */
    public onClickSoundHandler(event, data, index: number) {
        console.log('data', data);
        if (this.dataPlayAudio.currentEle != null
                && index === 0
                && this.dataPlayAudio.currentEle.index() === $(event.currentTarget).index()
                && $(event.currentTarget).find('i').is('.icon-pause')) {
            this.dataPlayAudio.currentEle.find('i').removeClass('icon-pause').addClass('icon-play');
            this.dataPlayAudio.currentButton.removeClass('active');
            this.dataPlayAudio.currentEle = null;
            this.playAudio.pause();
            return false;
        }
        if (this.dataPlayAudio.currentEle != null) {
           this.dataPlayAudio.currentButton.removeClass('active');
           this.dataPlayAudio.currentEle.find('i').removeClass('icon-pause').addClass('icon-play');
        }
        if ($(event.currentTarget).is('.btn-audio')) {
            this.dataPlayAudio.currentEle = $(event.currentTarget);
        } else {
            this.dataPlayAudio.currentEle = $(event.currentTarget).parents('.td-audio').find('button.btn-audio');
        }
        if ( data instanceof Array ) {
            this.dataPlayAudio.sounds = data;
        } else {
            this.dataPlayAudio.sounds = new Array();
            this.dataPlayAudio.sounds.push(data);
        }
        console.log('this.dataPlayAudio.sounds', this.dataPlayAudio.sounds);
        this.dataPlayAudio.currentEle.find('i').removeClass('icon-play').addClass('icon-pause');
        this.dataPlayAudio.soundIndex = 0;
        this.dataPlayAudio.buttonIndex = index;
        const weekFildSound = this.dataPlayAudio.sounds[0];
        const sound = environment.opURL + weekFildSound['uploadFilePath'] + weekFildSound['uploadFileName'];
        this.playSound(sound);
    }

    public playSound(sound) {
        this.playAudio.pause();
        if (this.dataPlayAudio.sounds == null
                || this.dataPlayAudio.sounds.length < 1) {
            console.log('사운드 목록이 없습니다.');
            return false;
        }
        this.playAudio.load(sound);
        this.playAudio.on('canplay', () => {
            console.log('event audio canplay');
            this.highlightPlayNumButton();
            this.playAudio.pause();
            this.playAudio.play();
        });
    }

    public highlightPlayNumButton() {
        const buttonIndex = this.dataPlayAudio.buttonIndex;
        const buttons = this.dataPlayAudio.currentEle.parents('.td-audio').find('.audio-lists button');
        if (buttonIndex - 1 >= 0) {
            buttons.eq(buttonIndex - 1).removeClass('active');
        }
        this.dataPlayAudio.currentButton = buttons.eq(buttonIndex);
        buttons.eq(buttonIndex).addClass('active');
    }

    public initAudio() {
        this.playAudio = new Audio5js({
            swf_path: environment.resourceURL.static + '/audio5js.swf',
            throw_errors: true,
            ready: (player) => {
              setTimeout(() => {
                console.log('player audio ready');
              });
            }
        });
        this.playAudio.on('ended', () => {
            console.log('urls', this.dataPlayAudio.soundIndex);
            // console.log(currentSoundIndex < urls.length);
            this.dataPlayAudio.soundIndex++;
            this.dataPlayAudio.buttonIndex++;
            console.log('index : ', this.dataPlayAudio.soundIndex, 'total : ', this.dataPlayAudio.sounds.length);
            if (this.dataPlayAudio.soundIndex <= this.dataPlayAudio.sounds.length - 1) {
                // e-POLY Viewer 에서는 Data 방식으로 highlight 기능이 안되어 jquery를 이용한 selector로 구현함.
                // this.playAudio.load(urls[++currentSoundIndex].toString());
                // this.currentMeetGreet.fileSoundList[this.currentSoundIndex - 1]['isActive'] = false;
                // this.currentMeetGreet.fileSoundList[this.currentSoundIndex]['isActive'] = true;
                // const sound = environment.opURL
                //     + this.currentMeetGreet.fileSoundList[this.currentSoundIndex]['uploadFilePath']
                //     + this.currentMeetGreet.fileSoundList[this.currentSoundIndex]['uploadFileName'];
                const weekFildSound = this.dataPlayAudio.sounds[this.dataPlayAudio.soundIndex];
                const sound = environment.opURL + weekFildSound['uploadFilePath'] + weekFildSound['uploadFileName'];
                this.playAudio.load(sound);
                // const eleButtons = this.dataPlayAudio.currentEle.parents('.td-audio').find('.audio-lists button');
                // eleButtons.eq(this.dataPlayAudio.soundIndex - 1).removeClass('active');
                // eleButtons.eq(this.dataPlayAudio.soundIndex).addClass('active');
            } else {
                // console.log('last');
                // this.currentMeetGreet.isPlay = false;
                // this.currentMeetGreet.fileSoundList[this.currentSoundIndex - 1]['isActive'] = false;
                // this.currentSoundIndex = 0;
                this.dataPlayAudio.currentEle.find('i').removeClass('icon-pause').addClass('icon-play');
                const eleButtons = this.dataPlayAudio.currentEle.parents('.td-audio').find('.audio-lists button');
                eleButtons.eq(this.dataPlayAudio.buttonIndex - 1).removeClass('active');
            }
        });
        this.playAudio.on('error', (error) => {
            console.log('error', error);
        });
    }
}
