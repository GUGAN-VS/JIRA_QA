import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricalReports } from './historical-reports';

describe('HistoricalReports', () => {
  let component: HistoricalReports;
  let fixture: ComponentFixture<HistoricalReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricalReports]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoricalReports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
