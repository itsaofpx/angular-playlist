// components/add-songs-dialog/add-songs-dialog.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Playlist } from '../../models/playlist.model';
import { Song } from '../../models/song.model';

@Component({
  selector: 'app-add-songs-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './add-songs-dialog.component.html',
  styleUrls: ['./add-songs-dialog.component.scss'],
})
export class AddSongsDialogComponent {
  @Input() playlist: Playlist | null = null;
  @Input() availableSongs: Song[] = [];

  @Output() closed = new EventEmitter<void>();
  @Output() songAdded = new EventEmitter<string>();

  addingSongId: string | null = null;

  closeDialog() {
    this.closed.emit();
  }

  addSong(songId: string) {
    this.addingSongId = songId;
    this.songAdded.emit(songId);

    setTimeout(() => {
      this.addingSongId = null;
    }, 1000);
  }

  isSongBeingAdded(songId: string): boolean {
    return this.addingSongId === songId;
  }
}
