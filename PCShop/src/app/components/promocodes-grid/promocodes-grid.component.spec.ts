import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromocodesGridComponent } from './promocodes-grid.component';

describe('PromocodesGridComponent', () => {
  let component: PromocodesGridComponent;
  let fixture: ComponentFixture<PromocodesGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromocodesGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromocodesGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
