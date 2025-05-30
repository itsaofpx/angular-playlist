import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { SongsTabComponent } from './components/songs-tab/songs-tab.component';
import { PlaylistsTabComponent } from './components/playlists-tab/playlists-tab.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatTabsModule,
    SongsTabComponent,
    PlaylistsTabComponent,
  ],
  template: `
    <mat-toolbar color="primary">
      <span>🎵 Music Playlist Manager</span>
    </mat-toolbar>

    <div class="container">
      <mat-tab-group>
        <mat-tab label="Songs">
          <app-songs-tab></app-songs-tab>
        </mat-tab>
        <mat-tab label="Playlists">
          <app-playlists-tab></app-playlists-tab>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {}
