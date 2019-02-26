import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from "rxjs/index";
import {Router} from '@angular/router';
import { _ } from 'underscore';
import {Power2, Circ} from 'gsap/all';
declare var TweenMax: any;

@Injectable({
  providedIn: 'root'
})

export class HelperService {
  public openModal$ = new Subject<object>();
  public gnbClose$ = new Subject<boolean>();
  public isBgmMute: boolean = false;
  public isFirstGNBInit = true;

  constructor(private router: Router, private http: HttpClient) { }

  public contains(array, delegate) {
    return _.contains(array, delegate);
  }

  public splitNumberDigits(num): Array<number> {
    let output = [],
        sNumber = num.toString();

    for (let i = 0, len = sNumber.length; i < len; i += 1) {
      output.push(+sNumber.charAt(i));
    }
    return output;
  }

  public openModal(modalInfo: object) {
    this.openModal$.next(modalInfo);
  }
  public closeLoading() {
    // console.log('close loading######');
    setTimeout(() => {
      TweenMax.to(document.getElementById('modalDepth3'), 0, {display: 'none'});
    }, 10);
  }

  public openContentFrame(path: string, params: object) {
    this.router.navigate([{outlets: {contentWrap: path}}],{ queryParams: params});
  }

/*  public base64ToArrayBuffer(base64) {
    var binary_string =  window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }*/

  public base64ToMp3File(base64, fileName): File {
    var binary_string =  window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return new File([bytes], fileName, {type: 'audio/mpeg'});
  }

  /**
   * Index of Multidimensional Array
   * @param arr {!Array} - the input array
   * @param k {object} - the value to search
   * @return {Array}
   */
  public getIndexOfK(arr, k): Array<number> {
    for (var i = 0; i < arr.length; i++) {
      var index = arr[i].indexOf(k);
      if (index > -1) {
        return [i, index];
      }
    }
  }

  public getScreenScale() {
    return {width: document.body.clientWidth, height: document.body.clientHeight};
  }

  private tweenSpd = 0.3;
  public layerOpenId($target, callback = null) {
    if (callback !== null) {
      TweenMax.to($target, this.tweenSpd, {display: 'block', opacity : 1, ease: Power2.easeIn, onComplete: callback});
    } else {
      TweenMax.to($target, this.tweenSpd, {display: 'block', opacity : 1, ease: Power2.easeIn});
    }
    TweenMax.fromTo(`${$target} .modal__content > div`, this.tweenSpd,
      {scale: 0.7, opacity : 0, y : 0},
      {scale: 1, opacity : 1, y : 0}
    );
    setTimeout(() => {
      document.querySelector(`${$target} .modal__content > div`).classList.add('active');
    }, 300);
  }
  public layerCloseId($target, callback = null) {
    if (callback !== null) {
      TweenMax.to($target, this.tweenSpd, {display: 'none', opacity : 0, ease: Power2.easeOut, onComplete: callback});
    } else {
      TweenMax.to($target, this.tweenSpd, {display: 'none', opacity : 0, ease: Circ.easeOut});
    }

    setTimeout(() => {
      document.querySelector(`${$target} .modal__content > div`).classList.remove('active');
    }, 300);
  }

  public chuckArray(myArray, chunk_size){
    var results = [];
    while (myArray.length) {
      results.push(myArray.splice(0, chunk_size));
    }
    return results;
  }

  public generateRandom(min, max) {
    let ranNum = Math.floor(Math.random()*(max-min+1)) + min;
    return ranNum;
  }
}
