import { Component, OnInit } from '@angular/core';
import { BaseClubhouseComponent } from '../base.clubhouse.component';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-photo-shoot',
    templateUrl: 'photo-shoot.component.html',
    styleUrls: ['photo-shoot.component.css']
})
export class PhotoShootComponent extends BaseClubhouseComponent implements OnInit {

    ngOnInit() {
        this.activityCode = 'PS';
        this.init();
    }

    /**
     * 캐릭터 activity class를 가져온다.
     * @param week 주차 Data
     */
    private getActivityCssCharacter(weekDate) {
        const classList = new Array('default');
        if (weekDate.completeYn === 'Y') {
            classList.push('complete');
        }
        if (this.dataManagerService.weekData.thisWeek === parseInt(weekDate.weekId, 10)) {
            classList.push('this-week');
        }
        if (this.dataManagerService.weekData.thisWeek < parseInt(weekDate.weekId, 10)) {
            classList.push('disabled');
        }
        return classList.join(' ');
    }
}
