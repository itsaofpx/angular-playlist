import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SongsFormComponent } from './song-form.component';

describe('SongsFormComponent', () => {
  let component: SongsFormComponent;
  let fixture: ComponentFixture<SongsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SongsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
