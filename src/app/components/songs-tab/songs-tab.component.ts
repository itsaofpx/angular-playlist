import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SongFormComponent } from '../song-form/song-form.component';
import { SongListComponent } from '../song-list/song-list.component';
import { SongEditModalComponent } from '../song-edit-modal/song-edit-modal.component';
import { Song } from '../../models/song.model';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-songs-tab',
  standalone: true,
  imports: [
    CommonModule,
    SongFormComponent,
    SongListComponent,
    SongEditModalComponent,
  ],
  templateUrl: './songs-tab.component.html',
  styleUrls: ['./songs-tab.component.scss'],
})
export class SongsTabComponent implements OnInit {
  @ViewChild(SongFormComponent) songForm!: SongFormComponent;

  songs: Song[] = [];
  filteredSongs: Song[] = [];
  isLoading = false;
  searchTerm = '';
  editingSong: Song | null = null;
  showEditModal = false;

  // Pagination variables
  itemsPerPage = 5; // Number of items per page
  totalPages = 0; // Total number of pages
  currentPage = 1; // Current page number

  constructor(private apiService: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadSongs();
  }

  loadSongs() {
    this.isLoading = true;
    this.apiService.getSongs().subscribe({
      next: (songs) => {
        this.songs = songs;
        this.filterSongs();
        this.updateTotalPages(); // Update total pages after loading songs
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading songs:', error);
        this.showMessage('❌ Failed to load songs', 'error');
        this.isLoading = false;
      },
    });
  }

  private updateTotalPages() {
    this.totalPages = Math.ceil(this.songs.length / this.itemsPerPage);
  }

  onSongCreated(songData: { title: string; artist: string }) {
    this.isLoading = true;
    this.apiService.createSong(songData).subscribe({
      next: (song) => {
        this.songs.push(song);
        this.filterSongs();
        this.updateTotalPages(); // Update total pages after adding song
        this.isLoading = false;

        this.showMessage(
          `🎵 "${song.title}" by ${song.artist} added successfully!`,
          'success'
        );

        if (this.songForm) {
          this.songForm.onReset();
        }
      },
      error: (error) => {
        console.error('Error creating song:', error);
        this.isLoading = false;

        if (error.status === 409) {
          const errorMessage =
            error.error?.message ||
            `🚫 Song "${songData.title}" by ${songData.artist} already exists!`;
          this.showDuplicateAlert(errorMessage);
        } else if (error.status === 400) {
          const errorMessage =
            error.error?.message ||
            '⚠️ Invalid song data. Please check your input.';
          this.showMessage(errorMessage, 'warning');
        } else {
          this.showMessage('❌ Failed to add song. Please try again.', 'error');
        }
      },
    });
  }

  onSongUpdated(songData: { title: string; artist: string }) {
    if (!this.editingSong) return;

    this.isLoading = true;
    this.apiService.updateSong(this.editingSong.id, songData).subscribe({
      next: (updatedSong) => {
        const index = this.songs.findIndex(
          (s) => s.id === this.editingSong!.id
        );
        if (index !== -1) {
          this.songs[index] = updatedSong;
          this.filterSongs();
          this.updateTotalPages(); // Update total pages after updating song
        }

        this.showMessage(
          `✅ "${updatedSong.title}" by ${updatedSong.artist} updated successfully!`,
          'success'
        );
        this.closeEditModal();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating song:', error);
        this.isLoading = false;

        if (error.status === 409) {
          const errorMessage =
            error.error?.message ||
            `🚫 Song "${songData.title}" by ${songData.artist} already exists!`;
          this.showDuplicateAlert(errorMessage);
        } else if (error.status === 400) {
          const errorMessage =
            error.error?.message ||
            '⚠️ Invalid song data. Please check your input.';
          this.showMessage(errorMessage, 'warning');
        } else {
          this.showMessage('❌ Failed to update song', 'error');
        }
      },
    });
  }

  onSongDeleted(songId: string) {
    this.apiService.deleteSong(songId).subscribe({
      next: () => {
        this.songs = this.songs.filter((s) => s.id !== songId);
        this.filterSongs();
        this.updateTotalPages(); // Update total pages after deleting song
        this.showMessage('🗑️ Song deleted successfully!', 'success');
      },
      error: (error) => {
        console.error('Error deleting song:', error);
        this.showMessage('❌ Failed to delete song', 'error');
      },
    });
  }

  onSongEdit(song: Song) {
    this.editingSong = song;
    this.showEditModal = true;
  }

  onEditModalClosed() {
    this.closeEditModal();
  }

  private closeEditModal() {
    this.showEditModal = false;
    this.editingSong = null;
  }

  onSearchChanged(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.filterSongs();
  }

  private filterSongs() {
    if (!this.searchTerm.trim()) {
      this.filteredSongs = [...this.songs];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredSongs = this.songs.filter(
        (song) =>
          song.title.toLowerCase().includes(term) ||
          song.artist.toLowerCase().includes(term)
      );
    }
    this.updateTotalPages(); // Update total pages after filtering
  }

  private showDuplicateAlert(message: string) {
    this.snackBar.open(message, '❌ Close', {
      duration: 6000,
      panelClass: ['snackbar-duplicate'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  private showMessage(
    message: string,
    type: 'success' | 'error' | 'warning' = 'success'
  ) {
    const config = {
      success: { duration: 3000, icon: '✅' },
      error: { duration: 5000, icon: '❌' },
      warning: { duration: 4000, icon: '⚠️' },
    };

    this.snackBar.open(message, `${config[type].icon} Close`, {
      duration: config[type].duration,
      panelClass: [`snackbar-${type}`],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
