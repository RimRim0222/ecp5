import { Component, OnInit } from '@angular/core';
import { SingAlongComponent } from 'src/app/clubhouse/sing-along/sing-along.component';
import { environment } from 'src/environments/environment';
declare var Audio5js: any;

@Component({
    selector: 'app-songs',
    templateUrl: 'songs.component.html',
    styleUrls: ['songs.component.css']
})

export class SongsComponent extends SingAlongComponent implements OnInit {

    public tab: String = this.getQueryParam('tab');
    public semesterGbn: String = this.getQueryParam('semesterGbn');

    ngOnInit() {
        this.init();
    }

    protected init() {
        this._sndMgr.initAudio();
        this.setTabSongsList();
    }
    public getQueryParam(name: string): string {
        return (this.activatedRoute.snapshot.queryParamMap.get(name) || '').toString();
    }

    public openTabContentFrame(tabSongType: string, arrayIndex: number) {
        this._sndMgr.playEventSound('common', 'buttonClick');
        this._helper.openModal({type: 'loading'});
        const url = (this.tabSongs != null ? this.tabSongs['contentsRootPath']
                        + this.tabSongs[tabSongType][arrayIndex]['contentsURL'] : null);
        //this._helper.openContentFrame('teachers-contents', {url: url, teacherYN: 'Y'});
        this.routes.navigateByUrl('teachers-page?teacherYN=Y&url='+url);
    }

    public exitBrowser() {
        this._sndMgr.playEventSound('common', 'buttonClick');
        window.open(window.location.href, '_self');
        window.close();
      }
}