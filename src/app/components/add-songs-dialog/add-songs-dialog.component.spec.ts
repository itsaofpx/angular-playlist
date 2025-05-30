import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSongsDialogComponent } from './add-songs-dialog.component';

describe('AddSongsDialogComponent', () => {
  let component: AddSongsDialogComponent;
  let fixture: ComponentFixture<AddSongsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSongsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSongsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
