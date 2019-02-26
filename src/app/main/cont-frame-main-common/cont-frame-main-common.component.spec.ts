import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContFrameExtendSampleComponent } from './cont-frame-main-common.component';

describe('ContentFrameComponent', () => {
  let component: ContFrameExtendSampleComponent;
  let fixture: ComponentFixture<ContFrameExtendSampleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContFrameExtendSampleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContFrameExtendSampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
