// components/playlist-modal/playlist-modal.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Playlist } from '../../models/playlist.model';
import { Song } from '../../models/song.model';
import { AddSongsDialogComponent } from '../add-songs-dialog/add-songs-dialog.component';

@Component({
  selector: 'app-playlist-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    AddSongsDialogComponent,
  ],
  templateUrl: './playlist-modal.component.html',
  styleUrls: ['./playlist-modal.component.scss'],
})
export class PlaylistModalComponent {
  @Input() playlist: Playlist | null = null;
  @Input() songs: Song[] = [];
  @Input() availableSongs: Song[] = [];
  @Input() isLoading = false;

  @Output() closed = new EventEmitter<void>();
  @Output() songAdded = new EventEmitter<{
    playlistId: string;
    songId: string;
  }>();
  @Output() songRemoved = new EventEmitter<{
    playlistId: string;
    songId: string;
  }>();
  @Output() playlistDeleted = new EventEmitter<string>();

  showAddSongsDialog = false;
  isRemovingSong = false;
  removingSongId: string | null = null;

  closeModal() {
    this.closed.emit();
  }

  openAddSongsDialog() {
    if (this.availableSongs.length === 0) {
      return;
    }
    this.showAddSongsDialog = true;
  }

  closeAddSongsDialog() {
    this.showAddSongsDialog = false;
  }

  onSongAdded(songId: string) {
    if (this.playlist) {
      this.songAdded.emit({
        playlistId: this.playlist.id,
        songId: songId,
      });
    }
    this.closeAddSongsDialog();
  }

  removeSong(songId: string) {
    if (!this.playlist) return;

    const song = this.songs.find((s) => s.id === songId);
    if (song && confirm(`Remove "${song.title}" from this playlist?`)) {
      this.removingSongId = songId;
      this.isRemovingSong = true;

      this.songRemoved.emit({
        playlistId: this.playlist.id,
        songId: songId,
      });

      // Reset loading state after a delay (parent will handle the actual removal)
      setTimeout(() => {
        this.isRemovingSong = false;
        this.removingSongId = null;
      }, 1000);
    }
  }

  deletePlaylist() {
    if (!this.playlist) return;

    if (
      confirm(
        `Are you sure you want to delete playlist "${this.playlist.name}"?`
      )
    ) {
      this.playlistDeleted.emit(this.playlist.id);
    }
  }
}
