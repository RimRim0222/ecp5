export class MainCache {
  ipYn = 'Y';
  public key: string = null;
  private value: string = `{"main": {}}`;

  constructor() { }

  public setValue(key, data) {
    let val = JSON.parse(this.value);
    val['main'][key] = data;
    this.value = JSON.stringify(val);
    // console.log('this.value :' + this.value);
  }

  public setValues(value) {
    this.value = JSON.stringify(value);
  }
}
