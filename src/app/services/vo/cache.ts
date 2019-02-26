import value from "*.json";

/**
 * Meet Greet Value Object
 */
export class Cache {
    ipYn = 'Y';
    key: string = null;
    private value: string = null;
    // private value: any =  {
    //     PR : { isTutorial : false },
    //     SA : { isTutorial : false },
    //     PS : { isTutorial : false },
    //     FF : { isTutorial : false },
    //     CM : { isTutorial : false },
    // };

    constructor() {
        this.initJsontoStringValue();
    }

    /**
     * 값 초기화
     */
    public initJsontoStringValue() {
        const val = {
            PR : { isTutorial : false },
            SA : { isTutorial : false },
            PS : { isTutorial : false },
            FF : { isTutorial : false, tutoCompleteYNTyped: '' },
            CM : { isTutorial : false },
        };
        this.value = JSON.stringify(val);
    }

    /**
     * json을 string 으로 변경한다.
     * @param activityCode 액티비티 코드
     */
    public getParseJsonValue(activityCode: string) {
        // console.log('getParseJsonValue() value : ', this.value);
        const val = JSON.parse(this.value);
        console.log('getParseJsonValue() value : ' , val);
        return val[activityCode];
    }

    /**
     * cache > value 안에 일부 key값에 data를 변경한다.
     * 예) 'PR' : { isTutorial : false }
     * @param key value key값
     * @param data value에 담을 data
     */
    public setValue(key, data) {
        const val = JSON.parse(this.value);
        console.log('setValue :', val);
        val[key] = data;
        this.value = JSON.stringify(val);
        console.log('this.value :' + this.value);
    }

    /**
     * cache > value를 전체를 변경한다.
     * this.value = value;
     * @param value cache value에 변경할 값(value)
     */
    public setValues(value) {
        this.value = JSON.stringify(value);
    }

    public getJosnValue() {
        return JSON.parse(this.value);
    }
}
