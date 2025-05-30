import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SongsTabComponent } from './songs-tab.component';

describe('SongsTabComponent', () => {
  let component: SongsTabComponent;
  let fixture: ComponentFixture<SongsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongsTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SongsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
