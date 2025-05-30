import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApiService } from './services/api.service';
import { Song } from './models/song.model';
import { Playlist } from './models/playlist.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTabsModule,
    MatListModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  // ================================
  // DATA PROPERTIES
  // ================================
  songs: Song[] = [];
  playlists: Playlist[] = [];
  selectedPlaylist: Playlist | null = null;
  playlistSongs: Song[] = [];

  // Search terms
  songSearchTerm: string = '';
  playlistSearchTerm: string = '';
  filteredSongs: Song[] = [];
  filteredPlaylists: Playlist[] = [];

  // Forms
  songForm!: FormGroup;
  playlistForm!: FormGroup;
  editSongForm!: FormGroup;
  editPlaylistForm!: FormGroup;

  // Edit states
  editingSong: Song | null = null;
  editingPlaylist: Playlist | null = null;

  // Dialog states
  showAddSongsDialog = false;
  dialogPlaylist: Playlist | null = null;
  availableSongs: Song[] = [];

  // Loading states
  isLoading = false;
  isLoadingPlaylistSongs = false;
  isAddingSong = false;
  addingSongId: string | null = null;

  // Error states
  playlistSongsError: string | null = null;

  // ================================
  // NEW MODAL PROPERTIES
  // ================================
  showPlaylistModal = false;
  selectedModalPlaylist: Playlist | null = null;
  modalPlaylistSongs: Song[] = [];
  isLoadingModalPlaylistSongs = false;
  isRemovingSong = false;
  removingSongId: string | null = null;

  // Playlist song counts cache for performance
  playlistSongCounts: { [playlistId: string]: number } = {};

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.loadInitialData();
  }

  // ================================
  // INITIALIZATION METHODS
  // ================================
  private initializeForms() {
    this.songForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      artist: ['', [Validators.required, Validators.minLength(1)]],
    });

    this.playlistForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      description: [''],
    });

    this.editSongForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      artist: ['', [Validators.required, Validators.minLength(1)]],
    });

    this.editPlaylistForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      description: [''],
    });
  }

  private loadInitialData() {
    this.loadSongs();
    this.loadPlaylists();
  }

  // ================================
  // DATA LOADING METHODS
  // ================================
  loadSongs() {
    this.apiService.getSongs().subscribe({
      next: (songs) => {
        this.songs = songs;
        this.filteredSongs = [...songs];
        this.filterSongs();
        this.updatePlaylistSongCounts();
      },
      error: (error) => {
        console.error('Error loading songs:', error);
        this.showMessage('Failed to load songs', 'error');
      },
    });
  }

  loadPlaylists() {
    this.apiService.getPlaylists().subscribe({
      next: (playlists) => {
        this.playlists = playlists;
        this.filteredPlaylists = [...playlists];
        this.updatePlaylistSongCounts();
      },
      error: (error) => {
        console.error('Error loading playlists:', error);
        this.showMessage('Failed to load playlists', 'error');
      },
    });
  }

  loadPlaylistSongs(playlistId: string) {
    this.isLoadingPlaylistSongs = true;
    this.playlistSongsError = null;

    this.apiService.getPlaylistSongs(playlistId).subscribe({
      next: (songs) => {
        this.playlistSongs = songs;
        this.updateAvailableSongs();
        this.isLoadingPlaylistSongs = false;
      },
      error: (error) => {
        console.error('Error loading playlist songs:', error);
        this.playlistSongsError =
          'Failed to load playlist songs. Please try again.';
        this.playlistSongs = [];
        this.isLoadingPlaylistSongs = false;
        this.showMessage('Failed to load playlist songs.', 'error');
      },
    });
  }

  // ================================
  // NEW MODAL METHODS
  // ================================
  selectPlaylistForModal(playlist: Playlist) {
    this.selectedModalPlaylist = playlist;
    this.showPlaylistModal = true;
    this.loadModalPlaylistSongs(playlist.id);
  }

  closePlaylistModal() {
    this.showPlaylistModal = false;
    this.selectedModalPlaylist = null;
    this.modalPlaylistSongs = [];
    this.isLoadingModalPlaylistSongs = false;
    this.isRemovingSong = false;
    this.removingSongId = null;
  }

  loadModalPlaylistSongs(playlistId: string) {
    this.isLoadingModalPlaylistSongs = true;
    this.modalPlaylistSongs = [];

    this.apiService.getPlaylistSongs(playlistId).subscribe({
      next: (songs) => {
        this.modalPlaylistSongs = songs;
        this.isLoadingModalPlaylistSongs = false;
      },
      error: (error) => {
        console.error('Error loading modal playlist songs:', error);
        this.modalPlaylistSongs = [];
        this.isLoadingModalPlaylistSongs = false;
        this.showMessage('Failed to load playlist songs.', 'error');
      },
    });
  }

  openAddSongsDialogFromModal() {
    if (!this.selectedModalPlaylist) return;

    if (this.songs.length === 0) {
      this.showMessage('Add some songs first!', 'warning');
      return;
    }

    this.dialogPlaylist = this.selectedModalPlaylist;
    this.showAddSongsDialog = true;
    this.loadDialogPlaylistSongs(this.selectedModalPlaylist.id);
  }

  removeSongFromModalPlaylist(songId: string) {
    if (!this.selectedModalPlaylist) return;

    const song = this.modalPlaylistSongs.find((s) => s.id === songId);
    if (song && confirm(`Remove "${song.title}" from this playlist?`)) {
      this.removingSongId = songId;
      this.isRemovingSong = true;

      this.apiService
        .removeSongFromPlaylist(this.selectedModalPlaylist.id, songId)
        .subscribe({
          next: () => {
            // Remove from modal playlist songs
            this.modalPlaylistSongs = this.modalPlaylistSongs.filter(
              (s) => s.id !== songId
            );

            // Update playlist song count
            this.updatePlaylistSongCount(this.selectedModalPlaylist!.id);

            // If this is also the selected playlist, update those songs too
            if (this.selectedPlaylist?.id === this.selectedModalPlaylist!.id) {
              this.playlistSongs = this.playlistSongs.filter(
                (s) => s.id !== songId
              );
            }

            // If add songs dialog is open for this playlist, add song back to available
            if (
              this.showAddSongsDialog &&
              this.dialogPlaylist?.id === this.selectedModalPlaylist!.id
            ) {
              this.availableSongs.push(song);
            }

            this.showMessage('Song removed from playlist!', 'success');
            this.removingSongId = null;
            this.isRemovingSong = false;
          },
          error: (error) => {
            console.error('Error removing song from playlist:', error);
            this.showMessage(
              'Failed to remove song from playlist. Please try again.',
              'error'
            );
            this.removingSongId = null;
            this.isRemovingSong = false;
          },
        });
    }
  }

  deletePlaylistFromModal() {
    if (!this.selectedModalPlaylist) return;

    if (
      confirm(
        `Are you sure you want to delete playlist "${this.selectedModalPlaylist.name}"?`
      )
    ) {
      this.apiService.deletePlaylist(this.selectedModalPlaylist.id).subscribe({
        next: () => {
          this.removePlaylistFromArrays(this.selectedModalPlaylist!.id);
          this.closePlaylistModal();
          this.showMessage('Playlist deleted successfully!', 'success');
        },
        error: (error) => {
          console.error('Error deleting playlist:', error);
          this.showMessage(
            'Failed to delete playlist. Please try again.',
            'error'
          );
        },
      });
    }
  }

  // ================================
  // SEARCH AND FILTER METHODS
  // ================================
  filterSongs() {
    if (!this.songSearchTerm.trim()) {
      this.filteredSongs = [...this.songs];
      return;
    }

    const searchTerm = this.songSearchTerm.toLowerCase();
    this.filteredSongs = this.songs.filter(
      (song) =>
        song.title.toLowerCase().includes(searchTerm) ||
        song.artist.toLowerCase().includes(searchTerm)
    );
  }

  filterPlaylists() {
    if (!this.playlistSearchTerm.trim()) {
      this.filteredPlaylists = [...this.playlists];
      return;
    }

    const searchTerm = this.playlistSearchTerm.toLowerCase().trim();
    this.filteredPlaylists = this.playlists.filter(
      (playlist) =>
        playlist.name.toLowerCase().includes(searchTerm) ||
        (playlist.description &&
          playlist.description.toLowerCase().includes(searchTerm))
    );
  }

  clearPlaylistSearch() {
    this.playlistSearchTerm = '';
    this.filteredPlaylists = [...this.playlists];
  }

  clearSongSearch() {
    this.songSearchTerm = '';
    this.filteredSongs = [...this.songs];
  }

  // ================================
  // SONG CRUD METHODS
  // ================================
  createSong() {
    if (this.songForm.invalid) {
      this.markFormGroupTouched(this.songForm);
      return;
    }

    const songData = this.songForm.value;
    this.isLoading = true;

    this.apiService.createSong(songData).subscribe({
      next: (song) => {
        this.songs.push(song);
        this.resetFormCompletely(this.songForm);
        this.updateAvailableSongs();
        this.filterSongs();
        this.updatePlaylistSongCounts();
        this.showMessage(`"${song.title}" added successfully!`, 'success');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating song:', error);
        this.showMessage('Failed to create song. Please try again.', 'error');
        this.isLoading = false;
      },
    });
  }

  updateSong() {
    if (this.editSongForm.valid && this.editingSong) {
      this.isLoading = true;
      const updatedSong = this.editSongForm.value;

      this.apiService.updateSong(this.editingSong.id, updatedSong).subscribe({
        next: () => {
          this.updateSongInArrays(this.editingSong!.id, updatedSong);
          this.cancelEditSong();
          this.showMessage('Song updated successfully!', 'success');
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error updating song:', error);
          this.showMessage('Failed to update song. Please try again.', 'error');
        },
      });
    }
  }

  deleteSong(id: string) {
    const song = this.songs.find((s) => s.id === id);
    if (song && confirm(`Are you sure you want to delete "${song.title}"?`)) {
      this.apiService.deleteSong(id).subscribe({
        next: () => {
          this.removeSongFromArrays(id);
          this.showMessage('Song deleted successfully!', 'success');
        },
        error: (error) => {
          console.error('Error deleting song:', error);
          this.showMessage('Failed to delete song. Please try again.', 'error');
        },
      });
    }
  }

  startEditSong(song: Song) {
    this.editingSong = song;
    this.editSongForm.patchValue({
      title: song.title,
      artist: song.artist,
    });
  }

  cancelEditSong() {
    this.editingSong = null;
    this.editSongForm.reset();
  }

  // ================================
  // PLAYLIST CRUD METHODS
  // ================================
  createPlaylist() {
    if (this.playlistForm.invalid) {
      this.markFormGroupTouched(this.playlistForm);
      return;
    }

    this.isLoading = true;
    const playlistData = this.playlistForm.value;

    this.apiService.createPlaylist(playlistData).subscribe({
      next: (playlist) => {
        this.playlists.push(playlist);
        this.resetFormCompletely(this.playlistForm);
        this.filterPlaylists();
        this.playlistSongCounts[playlist.id] = 0; // Initialize count
        this.showMessage(
          `Playlist "${playlist.name}" created successfully!`,
          'success'
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating playlist:', error);
        this.showMessage(
          'Failed to create playlist. Please try again.',
          'error'
        );
        this.isLoading = false;
      },
    });
  }

  updatePlaylist() {
    if (this.editPlaylistForm.valid && this.editingPlaylist) {
      this.isLoading = true;
      const updatedPlaylist = this.editPlaylistForm.value;

      this.apiService
        .updatePlaylist(this.editingPlaylist.id, updatedPlaylist)
        .subscribe({
          next: () => {
            this.updatePlaylistInArrays(
              this.editingPlaylist!.id,
              updatedPlaylist
            );
            this.cancelEditPlaylist();
            this.showMessage('Playlist updated successfully!', 'success');
            this.isLoading = false;
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error updating playlist:', error);
            this.showMessage(
              'Failed to update playlist. Please try again.',
              'error'
            );
          },
        });
    }
  }

  deletePlaylist(id: string) {
    const playlist = this.playlists.find((p) => p.id === id);
    if (
      playlist &&
      confirm(`Are you sure you want to delete playlist "${playlist.name}"?`)
    ) {
      this.apiService.deletePlaylist(id).subscribe({
        next: () => {
          this.removePlaylistFromArrays(id);
          this.showMessage('Playlist deleted successfully!', 'success');
        },
        error: (error) => {
          console.error('Error deleting playlist:', error);
          this.showMessage(
            'Failed to delete playlist. Please try again.',
            'error'
          );
        },
      });
    }
  }

  startEditPlaylist(playlist: Playlist) {
    this.editingPlaylist = playlist;
    this.editPlaylistForm.patchValue({
      name: playlist.name,
      description: playlist.description || '',
    });
  }

  cancelEditPlaylist() {
    this.editingPlaylist = null;
    this.editPlaylistForm.reset();
  }

  // ================================
  // PLAYLIST SELECTION METHODS (Original)
  // ================================
  selectPlaylist(playlist: Playlist) {
    this.playlistSongsError = null;
    this.selectedPlaylist = playlist;
    this.loadPlaylistSongs(playlist.id);
  }

  // ================================
  // ADD SONGS DIALOG METHODS
  // ================================
  openAddSongsDialog(playlist: Playlist) {
    if (this.songs.length === 0) {
      this.showMessage('Add some songs first!', 'warning');
      return;
    }

    this.dialogPlaylist = playlist;
    this.showAddSongsDialog = true;
    this.loadDialogPlaylistSongs(playlist.id);
  }

  closeAddSongsDialog() {
    this.showAddSongsDialog = false;
    this.dialogPlaylist = null;
    this.availableSongs = [];
    this.addingSongId = null;
    this.isAddingSong = false;
  }

  addSongToPlaylist(songId: string) {
    if (!this.dialogPlaylist) return;

    this.addingSongId = songId;
    this.isAddingSong = true;

    this.apiService
      .addSongToPlaylist(this.dialogPlaylist.id, songId)
      .subscribe({
        next: () => {
          const song = this.songs.find((s) => s.id === songId);
          this.showMessage(`"${song?.title}" added to playlist!`, 'success');

          // Remove song from available songs
          this.availableSongs = this.availableSongs.filter(
            (s) => s.id !== songId
          );

          // Update playlist song count
          this.updatePlaylistSongCount(this.dialogPlaylist!.id);

          // If this is the selected playlist, add to playlist songs
          if (this.selectedPlaylist?.id === this.dialogPlaylist!.id && song) {
            this.playlistSongs.push(song);
          }

          // If this is the modal playlist, add to modal playlist songs
          if (
            this.selectedModalPlaylist?.id === this.dialogPlaylist!.id &&
            song
          ) {
            this.modalPlaylistSongs.push(song);
          }

          this.addingSongId = null;
          this.isAddingSong = false;
        },
        error: (error) => {
          console.error('Error adding song to playlist:', error);
          this.showMessage(
            'Failed to add song to playlist. Please try again.',
            'error'
          );
          this.addingSongId = null;
          this.isAddingSong = false;
        },
      });
  }

  removeSongFromPlaylist(songId: string) {
    if (!this.selectedPlaylist) return;

    const song = this.playlistSongs.find((s) => s.id === songId);
    if (song && confirm(`Remove "${song.title}" from this playlist?`)) {
      this.apiService
        .removeSongFromPlaylist(this.selectedPlaylist.id, songId)
        .subscribe({
          next: () => {
            this.playlistSongs = this.playlistSongs.filter(
              (s) => s.id !== songId
            );

            // Update playlist song count
            this.updatePlaylistSongCount(this.selectedPlaylist!.id);

            // If add songs dialog is open for this playlist, add song back to available
            if (
              this.showAddSongsDialog &&
              this.dialogPlaylist?.id === this.selectedPlaylist!.id
            ) {
              this.availableSongs.push(song);
            }

            // If modal is open for this playlist, remove from modal songs too
            if (this.selectedModalPlaylist?.id === this.selectedPlaylist!.id) {
              this.modalPlaylistSongs = this.modalPlaylistSongs.filter(
                (s) => s.id !== songId
              );
            }

            this.showMessage('Song removed from playlist!', 'success');
          },
          error: (error) => {
            console.error('Error removing song from playlist:', error);
            this.showMessage(
              'Failed to remove song from playlist. Please try again.',
              'error'
            );
          },
        });
    }
  }

  // ================================
  // UTILITY METHODS
  // ================================
  resetFormCompletely(form: FormGroup) {
    form.reset();
    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);
      control?.markAsUntouched();
      control?.markAsPristine();
      control?.setErrors(null);
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      formGroup.get(key)?.markAsTouched();
    });
  }

  getSongIndex(song: Song): number {
    return this.songs.findIndex((s) => s.id === song.id);
  }

  isSongBeingAdded(songId: string): boolean {
    return this.isAddingSong && this.addingSongId === songId;
  }

  retryLoadPlaylistSongs() {
    if (this.selectedPlaylist) {
      this.loadPlaylistSongs(this.selectedPlaylist.id);
    }
  }

  showMessage(
    message: string,
    type: 'success' | 'error' | 'warning' = 'success'
  ) {
    this.snackBar.open(message, 'Close', {
      duration: type === 'error' ? 5000 : 3000,
      panelClass: [`snackbar-${type}`],
    });
  }

  // ================================
  // PLAYLIST SONG COUNT METHODS
  // ================================
  getPlaylistSongCount(playlistId: string): number {
    return this.playlistSongCounts[playlistId] || 0;
  }

  private updatePlaylistSongCounts() {
    // Update counts for all playlists
    this.playlists.forEach((playlist) => {
      this.updatePlaylistSongCount(playlist.id);
    });
  }

  private updatePlaylistSongCount(playlistId: string) {
    this.apiService.getPlaylistSongs(playlistId).subscribe({
      next: (songs) => {
        this.playlistSongCounts[playlistId] = songs.length;
      },
      error: (error) => {
        console.error('Error loading playlist song count:', error);
        this.playlistSongCounts[playlistId] = 0;
      },
    });
  }

  // ================================
  // PRIVATE HELPER METHODS
  // ================================
  private updateSongInArrays(songId: string, updatedSong: any) {
    // Update in main songs array
    const index = this.songs.findIndex((s) => s.id === songId);
    if (index !== -1) {
      this.songs[index] = { ...this.songs[index], ...updatedSong };
    }

    // Update in playlist songs if exists
    if (this.selectedPlaylist) {
      const playlistSongIndex = this.playlistSongs.findIndex(
        (s) => s.id === songId
      );
      if (playlistSongIndex !== -1) {
        this.playlistSongs[playlistSongIndex] = {
          ...this.playlistSongs[playlistSongIndex],
          ...updatedSong,
        };
      }
    }

    // Update in modal playlist songs if exists
    if (this.selectedModalPlaylist) {
      const modalSongIndex = this.modalPlaylistSongs.findIndex(
        (s) => s.id === songId
      );
      if (modalSongIndex !== -1) {
        this.modalPlaylistSongs[modalSongIndex] = {
          ...this.modalPlaylistSongs[modalSongIndex],
          ...updatedSong,
        };
      }
    }

    this.filterSongs();
  }

  private removeSongFromArrays(songId: string) {
    // Remove from main arrays
    this.songs = this.songs.filter((song) => song.id !== songId);
    this.filteredSongs = this.filteredSongs.filter(
      (song) => song.id !== songId
    );
    this.updateAvailableSongs();

    // Remove from playlist songs
    if (this.selectedPlaylist) {
      this.playlistSongs = this.playlistSongs.filter((s) => s.id !== songId);
      this.updatePlaylistSongCount(this.selectedPlaylist.id);
    }

    // Remove from modal playlist songs
    if (this.selectedModalPlaylist) {
      this.modalPlaylistSongs = this.modalPlaylistSongs.filter(
        (s) => s.id !== songId
      );
      this.updatePlaylistSongCount(this.selectedModalPlaylist.id);
    }

    // Update all playlist song counts
    this.updatePlaylistSongCounts();
  }

  private updatePlaylistInArrays(playlistId: string, updatedPlaylist: any) {
    const index = this.playlists.findIndex((p) => p.id === playlistId);
    if (index !== -1) {
      this.playlists[index] = { ...this.playlists[index], ...updatedPlaylist };
    }

    if (this.selectedPlaylist?.id === playlistId) {
      this.selectedPlaylist = { ...this.selectedPlaylist, ...updatedPlaylist };
    }

    if (this.selectedModalPlaylist?.id === playlistId) {
      this.selectedModalPlaylist = {
        ...this.selectedModalPlaylist,
        ...updatedPlaylist,
      };
    }

    this.filterPlaylists();
  }

  private removePlaylistFromArrays(playlistId: string) {
    this.playlists = this.playlists.filter(
      (playlist) => playlist.id !== playlistId
    );
    this.filteredPlaylists = this.filteredPlaylists.filter(
      (playlist) => playlist.id !== playlistId
    );

    // Clear selected playlist if it was deleted
    if (this.selectedPlaylist?.id === playlistId) {
      this.selectedPlaylist = null;
      this.playlistSongs = [];
      this.playlistSongsError = null;
    }

    // Close modal if playlist was deleted
    if (this.selectedModalPlaylist?.id === playlistId) {
      this.closePlaylistModal();
    }

    // Close add songs dialog if playlist was deleted
    if (this.dialogPlaylist?.id === playlistId) {
      this.closeAddSongsDialog();
    }

    // Remove from song counts cache
    delete this.playlistSongCounts[playlistId];
  }

  private loadDialogPlaylistSongs(playlistId: string) {
    this.apiService.getPlaylistSongs(playlistId).subscribe({
      next: (songs) => {
        const playlistSongIds = songs.map((song) => song.id);
        this.availableSongs = this.songs.filter(
          (song) => !playlistSongIds.includes(song.id)
        );
      },
      error: (error) => {
        console.error('Error loading dialog playlist songs:', error);
        this.availableSongs = [...this.songs];
        this.showMessage('Error loading playlist songs for dialog.', 'warning');
      },
    });
  }

  private updateAvailableSongs() {
    if (!this.dialogPlaylist || !this.showAddSongsDialog) return;

    const playlistSongIds = this.playlistSongs.map((song) => song.id);
    this.availableSongs = this.songs.filter(
      (song) => !playlistSongIds.includes(song.id)
    );
  }
}
