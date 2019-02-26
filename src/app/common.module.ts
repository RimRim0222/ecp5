import { NgxXml2jsonService } from 'ngx-xml2json';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonModule {
    activityClass: String = 'main';

    constructor(private ngxXml2jsonService: NgxXml2jsonService, ) {}

    public file: { data: null, name: null, contentType: null, } = null;

     /**
     * xml을 json으로 변환
     * @param xmldata xml string 데이터
     */
    public xmlToJson( xmldata: string ) {
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmldata, 'text/xml');
        const obj = this.ngxXml2jsonService.xmlToJson(xml);
        console.log('--- xmlToJson ---');
        console.log(obj);
        return obj;
    }

    /**
     * 파일 다운로드
     * @param file 파일
     */
    public downLoadFile(file) {
        console.log('file', file);
        const blobURL =  window.URL.createObjectURL( new Blob([file.data], {type: file.contentType}));
        const a = document.createElement('a');
        a.href = blobURL;
        a.download = file.name;
        a.click();
        window.URL.revokeObjectURL(blobURL);
    }

    /**
     * 첫글자를 대문자로 변경해준다.
     * @param string 영문
     */
    public capitalizeFirstLetter(string) {
        //console.log(string);
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}
