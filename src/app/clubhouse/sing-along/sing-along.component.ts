import { Component, OnInit } from '@angular/core';
import { _ } from 'underscore';
import { BaseClubhouseComponent } from '../base.clubhouse.component';

@Component({
    selector: 'app-sing-along',
    templateUrl: 'sing-along.component.html',
    styleUrls: ['sing-along.component.css']
})
export class SingAlongComponent extends BaseClubhouseComponent implements OnInit {

    private songTabMenus = new Array('.theme', '.phonics', '.holiday');

    public tabSongs = null;

    ngOnInit() {
        this.activityCode = 'SA';
        this.init();
        this.setTabSongsList();
    }

    public openModalSongs(): void {
        this.getWrap().style.display = 'block';
    }

    public closeModalSongs(): void {
        this.getWrap().style.display = 'none';
    }

    protected getWrap(): HTMLElement {
        return document.querySelector('#singAlong01');
    }

    /**
     * @param index tab index
     */
    public selectedModalSongs(index: number): void {
        _.each(this.songTabMenus, (d) => {
            (this.getWrap().querySelector(d) as HTMLElement).style.display = 'none';
        });
        (this.getWrap().querySelector(this.songTabMenus[index - 1]) as HTMLElement).style.display = 'block';
        this.tabModalSongs(index);
    }

    /**
     * 탭 메뉴 및 컨텐츠 활성화
     * @param index 탭 index
     */
    public tabModalSongs(index: number) {
        this._sndMgr.playEventSound('common', 'buttonClick');
        const wrapEle: HTMLElement = this.getWrap();
        console.log(wrapEle.querySelectorAll('.tab__item'));

        if ( wrapEle.style.display === 'none') {
            this.tabModalSongsPhonicsType();
            this.openModalSongs();
        }

        const tabClass = ['active', 'default'];
        Array.from(wrapEle.querySelectorAll('.tab__item')).map(($item, idx) => {
            if (idx === (index - 1)) {
                $item.classList.add(tabClass[0]);
                $item.classList.remove(tabClass[1]);
                (wrapEle.querySelector(this.songTabMenus[idx]) as HTMLElement).style.display = 'block';
            } else {
                $item.classList.remove(tabClass[0]);
                $item.classList.add(tabClass[1]);
                (wrapEle.querySelector(this.songTabMenus[idx]) as HTMLElement).style.display = 'none';
            }
        });
    }

    public tabModalSongsPhonicsType() {
        const wrapEle: HTMLElement = this.getWrap();
        const sessionMemberData = this.dataManagerService.sessionData;
        const semesterGbn: string = sessionMemberData['semesterGbn']; // '02';
        wrapEle.querySelector('.phonics').className = 'phonics type' + semesterGbn;
        const srcTest = (semesterGbn === '01') ? ['type2', 'type1'] : ['type1', 'type2'];
        Array.from(wrapEle.querySelectorAll('.phonics img')).map(($item, idx) => {
            $item.setAttribute('src', $item.getAttribute('src').replace(srcTest[0], srcTest[1]));
        });
        if (semesterGbn === '02') {
            (wrapEle.querySelector('.phonics__normal') as HTMLElement).style.display = 'block';
        } else {
            (wrapEle.querySelector('.phonics__normal') as HTMLElement).style.display = 'none';
        }
    }

    /**
     *
     */
    public setTabSongsList() {
        this.clubhouseService.singAlognTabsongsList()
        .subscribe(res => {
            console.log('tabsongs : ', res);
            this.tabSongs = res;
        });
    }


    public openTabContentFrame(tabSongType: string, arrayIndex: number) {
        this._sndMgr.playEventSound('common', 'buttonClick');
        this._helper.openModal({type: 'loading'});
        const url = (this.tabSongs != null ? this.tabSongs['contentsRootPath']
                        + this.tabSongs[tabSongType][arrayIndex]['contentsURL'] : null);
        this._helper.openContentFrame('clubhouse-contents', {url: url, activityCode: 'SA'});
    }

}
