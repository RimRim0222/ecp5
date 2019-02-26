import { Component, OnInit } from '@angular/core';
import { BaseClubhouseComponent } from '../base.clubhouse.component';

@Component({
    selector: 'app-poly-reader',
    templateUrl: 'poly-reader.component.html',
    styleUrls: ['poly-reader.component.css']
})
export class PolyReaderComponent extends BaseClubhouseComponent implements OnInit {

    ngOnInit() {
        this.activityCode = 'PR';
        this.init();
    }

}
