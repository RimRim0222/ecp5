import { Component, OnInit } from '@angular/core';
import { BaseClubhouseComponent } from '../base.clubhouse.component';

@Component({
    selector: 'app-color-magic',
    templateUrl: 'color-magic.component.html',
    styleUrls: ['color-magic.component.css']
})
export class ColorMagicComponent extends BaseClubhouseComponent implements OnInit {

    ngOnInit() {
        this.activityCode = 'CM';
        this.init();
    }
}
