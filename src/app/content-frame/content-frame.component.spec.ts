import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentFrameComponent } from './content-frame.component';

describe('ContentFrameComponent', () => {
  let component: ContentFrameComponent;
  let fixture: ComponentFixture<ContentFrameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentFrameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
