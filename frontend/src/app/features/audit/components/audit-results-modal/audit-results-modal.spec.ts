import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditResultsModal } from './audit-results-modal';

describe('AuditResultsModal', () => {
  let component: AuditResultsModal;
  let fixture: ComponentFixture<AuditResultsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditResultsModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditResultsModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
