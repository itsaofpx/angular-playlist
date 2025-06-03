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

  currentPage = 1;
  itemsPerPage = 8;
  totalPages = 0;

  get paginatedSongs() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.songs.slice(start, start + this.itemsPerPage);
  }

  get paginationArray(): (number | string)[] {
    const pages: (number | string)[] = [];
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;

    pages.push(1);

    if (currentPage > 4) {
      pages.push('...');
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 3) {
      pages.push('...');
    }

    // Always show the last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }

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

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: string | number) {
    this.currentPage = Number(page);
  }

  updateTotalPages() {
    this.totalPages = Math.ceil(this.songs.length / this.itemsPerPage);
  }

  ngOnChanges() {
    this.updateTotalPages();
  }
}
