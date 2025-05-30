import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistsTabComponent } from './playlists-tab.component';

describe('PlaylistsTabComponent', () => {
  let component: PlaylistsTabComponent;
  let fixture: ComponentFixture<PlaylistsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistsTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
