import { Component, OnInit } from '@angular/core';
import { BaseClubhouseComponent } from '../base.clubhouse.component';

@Component({
    selector: 'app-fun-factory',
    templateUrl: 'fun-factory.component.html',
    styleUrls: ['fun-factory.component.css']
})
export class FunFactoryComponent extends BaseClubhouseComponent implements OnInit {

    ngOnInit() {
        this.activityCode = 'FF';
        this.init();
    }
}
