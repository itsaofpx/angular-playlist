import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Song } from '../../models/song.model';

@Component({
  selector: 'app-song-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './song-list.component.html',
  styleUrls: ['./song-list.component.scss'],
})
export class SongListComponent {
  @Input() songs: Song[] = [];
  @Input() isLoading = false;
  @Output() searchChanged = new EventEmitter<string>();
  @Output() songDeleted = new EventEmitter<string>();
  @Output() songEdit = new EventEmitter<Song>();

  searchTerm = '';

  trackBySong(index: number, song: Song): string {
    return song.id;
  }

  onSearchChange() {
    this.searchChanged.emit(this.searchTerm);
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchChanged.emit('');
  }

  onEditSong(song: Song) {
    this.songEdit.emit(song);
  }

  onDeleteSong(song: Song) {
    if (confirm(`Are you sure you want to delete "${song.title}"?`)) {
      this.songDeleted.emit(song.id);
    }
  }
}
