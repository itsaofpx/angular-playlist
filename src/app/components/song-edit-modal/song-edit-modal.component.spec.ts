import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SongEditModalComponent } from './song-edit-modal.component';

describe('SongEditModalComponent', () => {
  let component: SongEditModalComponent;
  let fixture: ComponentFixture<SongEditModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongEditModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SongEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
