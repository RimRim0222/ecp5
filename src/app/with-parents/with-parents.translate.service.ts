import { Component, OnInit, Injectable} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class WithParentsTranslateService {
    public translate: TranslateService;

    constructor(translate: TranslateService) {
        this.translate = translate;
        this.translate.addLangs(['kr', 'en']);
        this.translate.setDefaultLang('en');
    }

}
