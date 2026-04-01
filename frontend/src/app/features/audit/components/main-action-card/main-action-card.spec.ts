import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainActionCard } from './main-action-card';

describe('MainActionCard', () => {
  let component: MainActionCard;
  let fixture: ComponentFixture<MainActionCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainActionCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainActionCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
