import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtbHeaderComponent } from './btb-header.component';

describe('BtbHeaderComponent', () => {
  let component: BtbHeaderComponent;
  let fixture: ComponentFixture<BtbHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtbHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BtbHeaderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
