// components/playlist-search/playlist-search.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Playlist } from '../../models/playlist.model';

@Component({
  selector: 'app-playlist-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './playlist-search.component.html',
  styleUrls: ['./playlist-search.component.scss'],
})
export class PlaylistSearchComponent {
  @Input() playlists: Playlist[] = [];
  @Input() filteredPlaylists: Playlist[] = [];
  @Input() searchTerm: string = '';
  @Input() playlistSongCounts: { [playlistId: string]: number } = {};

  @Output() searchChanged = new EventEmitter<string>();
  @Output() playlistSelected = new EventEmitter<Playlist>();
  @Output() playlistEdit = new EventEmitter<Playlist>();

  onSearchChange(term: string) {
    this.searchChanged.emit(term);
  }

  clearSearch() {
    this.searchChanged.emit('');
  }

  selectPlaylist(playlist: Playlist) {
    this.playlistSelected.emit(playlist);
  }

  editPlaylist(playlist: Playlist) {
    this.playlistEdit.emit(playlist);
  }

  getPlaylistSongCount(playlistId: string): number {
    return this.playlistSongCounts[playlistId] || 0;
  }

  trackByPlaylistId(index: number, playlist: Playlist): string {
    return playlist.id;
  }
}
