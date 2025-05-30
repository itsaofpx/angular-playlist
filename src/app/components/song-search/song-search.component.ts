import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Song } from '../../models/song.model';

@Component({
  selector: 'app-song-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './song-search.component.html',
  styleUrls: ['./song-search.component.scss'],
})
export class SongSearchComponent {
  @Input() songs: Song[] = [];
  @Input() filteredSongs: Song[] = [];
  @Output() searchChanged = new EventEmitter<string>();

  searchTerm: string = '';

  onSearchChange() {
    this.searchChanged.emit(this.searchTerm);
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchChanged.emit('');
  }
}
