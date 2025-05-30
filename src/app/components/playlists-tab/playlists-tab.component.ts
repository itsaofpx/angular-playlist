// components/playlists-tab/playlists-tab.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';
import { Playlist } from '../../models/playlist.model';
import { Song } from '../../models/song.model';
import { PlaylistSearchComponent } from '../playlist-search/playlist-search.component';
import { PlaylistFormComponent } from '../playlist-form/playlist-form.component';
import { PlaylistModalComponent } from '../playlist-modal/playlist-modal.component';
import { PlaylistEditModalComponent } from '../playlist-edit-modal/playlist-edit-modal.component';

@Component({
  selector: 'app-playlists-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    PlaylistSearchComponent,
    PlaylistFormComponent,
    PlaylistModalComponent,
    PlaylistEditModalComponent,
  ],
  templateUrl: './playlists-tab.component.html',
  styleUrls: ['./playlists-tab.component.scss'],
})
export class PlaylistsTabComponent implements OnInit {
  @ViewChild(PlaylistFormComponent) playlistForm!: PlaylistFormComponent;

  playlists: Playlist[] = [];
  filteredPlaylists: Playlist[] = [];
  playlistSearchTerm: string = '';
  playlistSongCounts: { [playlistId: string]: number } = {};

  // Playlist Details Modal
  showPlaylistModal = false;
  selectedModalPlaylist: Playlist | null = null;
  modalPlaylistSongs: Song[] = [];
  availableSongs: Song[] = [];
  isLoadingModalPlaylistSongs = false;

  // Edit Modal
  showEditModal = false;
  selectedEditPlaylist: Playlist | null = null;
  isSubmittingEdit = false;

  // General Loading
  isLoading = false;

  constructor(private apiService: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadPlaylists();
  }

  getTotalSongs(): number {
    return Object.values(this.playlistSongCounts).reduce(
      (total, count) => total + count,
      0
    );
  }

  getPlaylistSongCount(playlistId: string): number {
    return this.playlistSongCounts[playlistId] || 0;
  }

  loadPlaylists() {
    this.isLoading = true;
    this.apiService.getPlaylists().subscribe({
      next: (playlists) => {
        this.playlists = playlists;
        this.filteredPlaylists = [...playlists];
        this.updatePlaylistSongCounts();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading playlists:', error);
        this.showMessage('❌ Failed to load playlists', 'error');
        this.isLoading = false;
      },
    });
  }

  onSearchChanged(searchTerm: string) {
    this.playlistSearchTerm = searchTerm;
    this.filterPlaylists();
  }

  onPlaylistSelected(playlist: Playlist) {
    this.selectedModalPlaylist = playlist;
    this.showPlaylistModal = true;
    this.loadModalPlaylistSongs(playlist.id);
  }

  onPlaylistEdit(playlist: Playlist) {
    this.selectedEditPlaylist = playlist;
    this.showEditModal = true;
  }

  // ✅ UPDATED: Handle duplicate playlist creation with specific error handling
  onPlaylistCreated(playlistData: { name: string; description?: string }) {
    this.isLoading = true;
    this.apiService.createPlaylist(playlistData).subscribe({
      next: (playlist) => {
        this.playlists.push(playlist);
        this.filterPlaylists();
        this.playlistSongCounts[playlist.id] = 0;
        this.isLoading = false;

        // Show success message and reset form via ViewChild
        this.showMessage(
          `🎉 Playlist "${playlist.name}" created successfully!`,
          'success'
        );

        // Reset form after successful creation
        if (this.playlistForm) {
          this.playlistForm.onReset();
        }
      },
      error: (error) => {
        console.error('Error creating playlist:', error);
        this.isLoading = false;

        // Handle different error types
        if (error.status === 409) {
          // 🚨 DUPLICATE PLAYLIST ERROR
          const errorMessage =
            error.error?.message ||
            `🚫 Playlist "${playlistData.name}" already exists!`;
          this.showDuplicateAlert(errorMessage);
        } else if (error.status === 400) {
          // Validation error
          const errorMessage =
            error.error?.message ||
            '⚠️ Invalid playlist data. Please check your input.';
          this.showMessage(errorMessage, 'error');
        } else {
          // Generic error
          this.showMessage(
            '❌ Failed to create playlist. Please try again.',
            'error'
          );
        }
      },
    });
  }

  onModalClosed() {
    this.showPlaylistModal = false;
    this.selectedModalPlaylist = null;
    this.modalPlaylistSongs = [];
    this.isLoadingModalPlaylistSongs = false;
  }

  onEditModalClosed() {
    this.showEditModal = false;
    this.selectedEditPlaylist = null;
    this.isSubmittingEdit = false;
  }

  // ✅ UPDATED: Handle duplicate playlist updates
  onPlaylistUpdated(updatedData: {
    id: string;
    name: string;
    description?: string;
  }) {
    this.isSubmittingEdit = true;

    this.apiService
      .updatePlaylist(updatedData.id, {
        name: updatedData.name,
        description: updatedData.description,
      })
      .subscribe({
        next: (updatedPlaylist) => {
          // Update the playlist in the arrays
          const index = this.playlists.findIndex(
            (p) => p.id === updatedData.id
          );
          if (index !== -1) {
            this.playlists[index] = updatedPlaylist;
            this.filterPlaylists(); // Refresh filtered list
          }

          this.showMessage(
            `✅ Playlist "${updatedPlaylist.name}" updated successfully!`,
            'success'
          );
          this.onEditModalClosed();
        },
        error: (error) => {
          console.error('Error updating playlist:', error);
          this.isSubmittingEdit = false;

          // Handle duplicate error on update
          if (error.status === 409) {
            const errorMessage =
              error.error?.message ||
              `🚫 Playlist "${updatedData.name}" already exists!`;
            this.showDuplicateAlert(errorMessage);
          } else {
            this.showMessage('❌ Failed to update playlist', 'error');
          }
        },
      });
  }

  onSongAddedToPlaylist(data: { playlistId: string; songId: string }) {
    this.apiService.addSongToPlaylist(data.playlistId, data.songId).subscribe({
      next: () => {
        this.loadModalPlaylistSongs(data.playlistId);
        this.updatePlaylistSongCount(data.playlistId);
        this.showMessage('🎵 Song added to playlist!', 'success');
      },
      error: (error) => {
        console.error('Error adding song to playlist:', error);

        // Handle duplicate song in playlist
        if (error.status === 409) {
          this.showMessage('🚫 Song is already in this playlist!', 'warning');
        } else {
          this.showMessage('❌ Failed to add song to playlist', 'error');
        }
      },
    });
  }

  onSongRemovedFromPlaylist(data: { playlistId: string; songId: string }) {
    this.apiService
      .removeSongFromPlaylist(data.playlistId, data.songId)
      .subscribe({
        next: () => {
          this.modalPlaylistSongs = this.modalPlaylistSongs.filter(
            (s) => s.id !== data.songId
          );
          this.updatePlaylistSongCount(data.playlistId);
          this.showMessage('🗑️ Song removed from playlist!', 'success');
        },
        error: (error) => {
          console.error('Error removing song from playlist:', error);
          this.showMessage('❌ Failed to remove song from playlist', 'error');
        },
      });
  }

  onPlaylistDeleted(playlistId: string) {
    this.apiService.deletePlaylist(playlistId).subscribe({
      next: () => {
        this.playlists = this.playlists.filter((p) => p.id !== playlistId);
        this.filterPlaylists();
        delete this.playlistSongCounts[playlistId];
        this.onModalClosed();
        this.showMessage('🗑️ Playlist deleted successfully!', 'success');
      },
      error: (error) => {
        console.error('Error deleting playlist:', error);
        this.showMessage('❌ Failed to delete playlist', 'error');
      },
    });
  }

  private filterPlaylists() {
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

  private loadModalPlaylistSongs(playlistId: string) {
    this.isLoadingModalPlaylistSongs = true;
    this.modalPlaylistSongs = [];

    this.apiService.getPlaylistSongs(playlistId).subscribe({
      next: (songs) => {
        this.modalPlaylistSongs = songs;
        this.isLoadingModalPlaylistSongs = false;
        this.loadAvailableSongs(playlistId);
      },
      error: (error) => {
        console.error('Error loading playlist songs:', error);
        this.modalPlaylistSongs = [];
        this.isLoadingModalPlaylistSongs = false;
        this.showMessage('❌ Failed to load playlist songs', 'error');
      },
    });
  }

  private loadAvailableSongs(playlistId: string) {
    this.apiService.getSongs().subscribe({
      next: (allSongs) => {
        const playlistSongIds = this.modalPlaylistSongs.map((song) => song.id);
        this.availableSongs = allSongs.filter(
          (song) => !playlistSongIds.includes(song.id)
        );
      },
      error: (error) => {
        console.error('Error loading available songs:', error);
        this.availableSongs = [];
      },
    });
  }

  private updatePlaylistSongCounts() {
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
        console.error('Error updating playlist song count:', error);
        this.playlistSongCounts[playlistId] = 0;
      },
    });
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
