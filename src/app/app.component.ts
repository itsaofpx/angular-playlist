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
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  songs: Song[] = [];
  playlists: Playlist[] = [];
  songForm: FormGroup;
  playlistForm: FormGroup;
  selectedPlaylist: Playlist | null = null;
  playlistSongs: Song[] = [];
  showAddSongsDialog = false;
  dialogPlaylist: Playlist | null = null;
  availableSongs: Song[] = [];
  editSongForm: FormGroup;
  editPlaylistForm: FormGroup;
  editingSong: Song | null = null;
  editingPlaylist: Playlist | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {
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

  ngOnInit() {
    this.loadSongs();
    this.loadPlaylists();
  }

  loadSongs() {
    this.apiService.getSongs().subscribe({
      next: (songs) => {
        this.songs = songs;
        this.updateAvailableSongs();
      },
      error: (error) => this.showMessage('Error loading songs', 'error'),
    });
  }

  loadPlaylists() {
    this.apiService.getPlaylists().subscribe({
      next: (playlists) => (this.playlists = playlists),
      error: (error) => this.showMessage('Error loading playlists', 'error'),
    });
  }

  createSong() {
    if (this.songForm.valid) {
      const songData = this.songForm.value;
      this.apiService.createSong(songData).subscribe({
        next: (song) => {
          this.songs.push(song);
          this.songForm.reset();
          this.updateAvailableSongs();
          this.showMessage(`"${song.title}" added successfully!`, 'success');
        },
        error: (error) => this.showMessage('Error creating song', 'error'),
      });
    }
  }
  startEditSong(song: Song) {
    this.editingSong = song;
    this.editSongForm!.patchValue({
      title: song.title,
      artist: song.artist,
    });
  }

  cancelEditSong() {
    this.editingSong = null;
    this.editSongForm!.reset();
  }

  updateSong() {
    if (this.editSongForm!.valid && this.editingSong) {
      this.isLoading = true;
      const updatedSong = this.editSongForm!.value;

      this.apiService.updateSong(this.editingSong.id, updatedSong).subscribe({
        next: (result) => {
          this.isLoading = false;
          this.editingSong = null;
          this.editSongForm!.reset();
          this.loadSongs();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error updating song:', error);
        },
      });
    }
  }

  createPlaylist() {
    if (this.playlistForm.valid) {
      const playlistData = this.playlistForm.value;
      this.apiService.createPlaylist(playlistData).subscribe({
        next: (playlist) => {
          this.playlists.push(playlist);
          this.playlistForm.reset();
          this.showMessage(
            `Playlist "${playlist.name}" created successfully!`,
            'success'
          );
        },
        error: (error) => this.showMessage('Error creating playlist', 'error'),
      });
    }
  }

  deleteSong(id: string) {
    const song = this.songs.find((s) => s.id === id);
    if (song && confirm(`Are you sure you want to delete "${song.title}"?`)) {
      this.apiService.deleteSong(id).subscribe({
        next: () => {
          this.songs = this.songs.filter((song) => song.id !== id);
          this.updateAvailableSongs();
          if (this.selectedPlaylist) {
            this.loadPlaylistSongs(this.selectedPlaylist.id);
          }
          this.showMessage('Song deleted successfully!', 'success');
        },
        error: (error) => this.showMessage('Error deleting song', 'error'),
      });
    }
  }
  startEditPlaylist(playlist: Playlist) {
    this.editingPlaylist = playlist;
    this.editPlaylistForm!.patchValue({
      name: playlist.name,
      description: playlist.description || '',
    });
  }

  cancelEditPlaylist() {
    this.editingPlaylist = null;
    this.editPlaylistForm!.reset();
  }

  updatePlaylist() {
    if (this.editPlaylistForm!.valid && this.editingPlaylist) {
      this.isLoading = true;
      const updatedPlaylist = this.editPlaylistForm!.value;

      this.apiService
        .updatePlaylist(this.editingPlaylist.id, updatedPlaylist)
        .subscribe({
          next: (result) => {
            this.isLoading = false;
            this.editingPlaylist = null;
            this.editPlaylistForm!.reset();
            this.loadPlaylists();
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error updating playlist:', error);
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
          this.playlists = this.playlists.filter(
            (playlist) => playlist.id !== id
          );
          if (this.selectedPlaylist?.id === id) {
            this.selectedPlaylist = null;
            this.playlistSongs = [];
          }
          this.showMessage('Playlist deleted successfully!', 'success');
        },
        error: (error) => this.showMessage('Error deleting playlist', 'error'),
      });
    }
  }

  selectPlaylist(playlist: Playlist) {
    this.selectedPlaylist = playlist;
    this.loadPlaylistSongs(playlist.id);
  }

  loadPlaylistSongs(playlistId: string) {
    this.apiService.getPlaylistSongs(playlistId).subscribe({
      next: (songs) => {
        this.playlistSongs = songs;
        this.updateAvailableSongs();
      },
      error: (error) =>
        this.showMessage('Error loading playlist songs', 'error'),
    });
  }

  openAddSongsDialog(playlist: Playlist) {
    if (this.songs.length === 0) {
      this.showMessage('Add some songs first!', 'warning');
      return;
    }

    this.dialogPlaylist = playlist;
    this.loadPlaylistSongs(playlist.id);
    this.showAddSongsDialog = true;
  }

  closeAddSongsDialog() {
    this.showAddSongsDialog = false;
    this.dialogPlaylist = null;
    this.availableSongs = [];
  }

  updateAvailableSongs() {
    if (!this.dialogPlaylist) return;

    const playlistSongIds = this.playlistSongs.map((song) => song.id);
    this.availableSongs = this.songs.filter(
      (song) => !playlistSongIds.includes(song.id)
    );
  }

  addSongToPlaylist(songId: string) {
    if (!this.dialogPlaylist) return;

    this.apiService
      .addSongToPlaylist(this.dialogPlaylist.id, songId)
      .subscribe({
        next: () => {
          const song = this.songs.find((s) => s.id === songId);
          this.showMessage(`"${song?.title}" added to playlist!`, 'success');

          this.loadPlaylistSongs(this.dialogPlaylist!.id);

          if (this.selectedPlaylist?.id === this.dialogPlaylist!.id) {
            this.selectedPlaylist = this.dialogPlaylist;
          }
        },
        error: (error) =>
          this.showMessage('Error adding song to playlist', 'error'),
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
            this.updateAvailableSongs();
            this.showMessage('Song removed from playlist!', 'success');
          },
          error: (error) =>
            this.showMessage('Error removing song from playlist', 'error'),
        });
    }
  }

  showMessage(
    message: string,
    type: 'success' | 'error' | 'warning' = 'success'
  ) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: [`snackbar-${type}`],
    });
  }
}
