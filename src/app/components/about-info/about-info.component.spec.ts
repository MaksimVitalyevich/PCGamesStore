import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutInfoComponent } from './about-info.component';

describe('AboutInfoComponent', () => {
  let component: AboutInfoComponent;
  let fixture: ComponentFixture<AboutInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
