import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekTreeComponent } from './week-tree.component';

describe('WeekTreeComponent', () => {
  let component: WeekTreeComponent;
  let fixture: ComponentFixture<WeekTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeekTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
