import { DataManagerService } from './../../services/data-manager.service';
import { HelperService } from './../../services/helper.service';
import { CommonModule } from './../../common.module';
import { environment } from './../../../environments/environment.prod';
import { Component, OnInit } from '@angular/core';
import { WithParentsTranslateService } from './../with-parents.translate.service';
import { SoundManagerService } from 'src/app/services/sound-manager.service';
import { message } from 'src/app/global/messages/message';

/**
 * 스티커 차트 컴포넌트
 */
@Component({
    selector: 'app-sticker-charts',
    templateUrl: 'sticker-charts.component.html',
    styleUrls: ['sticker-charts.component.css']
})
export class StickerChartsComponent implements OnInit {

    public imagePath = environment.resourceURL.image;
    public langType: string = this._translate.translate.getDefaultLang();

    /**
     * 스티커 목록
     */
    public stickerChartsList = {
        fileRootPath : environment.imagePath + '/with_parents_sticker_charts/',
        data: [
            { title: 'butterfly', filePahtImg : 'img01.png', filePathPdf: 'sticker_print01-converted.pdf'},
            { title: 'ladybug', filePahtImg : 'img02.png', filePathPdf: 'sticker_print02-converted.pdf'},
            { title: 'grape', filePahtImg : 'img03.png', filePathPdf: 'sticker_print03-converted.pdf'},
            { title: 'strawberry', filePahtImg : 'img04.png', filePathPdf: 'sticker_print04-converted.pdf'},
            { title: 'tree', filePahtImg : 'img05.png', filePathPdf: 'sticker_print05-converted.pdf'},
            { title: 'sunflower', filePahtImg : 'img06.png', filePathPdf: 'sticker_print06-converted.pdf'}
        ]
    };

    constructor(private commonModule: CommonModule,
        public _helper: HelperService,
        private dataManagerService: DataManagerService,
        public _translate: WithParentsTranslateService,
        public _sndMgr: SoundManagerService) {}

    ngOnInit() {
        this._sndMgr.bgmPlay('none');
        this.commonModule.activityClass = 'with-parents-sticker-charts';
    }

    /**
     * PDF 클릭 이벤트
     * @param data sticker Data
     */
    public onClickPdfHandler(data) {
        this._sndMgr.playEventSound('common', 'buttonClick');
        if (this.dataManagerService.isMobile) {
            this._helper.openModal({type: 'commonModal02', msg: message['alert.0003']['msg']});
            return false;
        }
        this._helper.openModal({type: 'pdfViewer', url: this.stickerChartsList.fileRootPath + '/pdf/' + data.filePathPdf});
    }
}
