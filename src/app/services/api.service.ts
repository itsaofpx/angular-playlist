import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Song } from '../models/song.model';
import { Playlist } from '../models/playlist.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}
  getSongs(): Observable<Song[]> {
    return this.http.get<Song[]>(`${this.baseUrl}/song`);
  }

  createSong(song: any): Observable<Song> {
    return this.http.post<Song>(`${this.baseUrl}/song`, song);
  }
  updateSong(id: string, song: any): Observable<Song> {
    return this.http.patch<Song>(`${this.baseUrl}/song/${id}`, song);
  }

  deleteSong(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/song/${id}`);
  }

  getPlaylists(): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(`${this.baseUrl}/playlist`);
  }

  createPlaylist(playlist: any): Observable<Playlist> {
    return this.http.post<Playlist>(`${this.baseUrl}/playlist`, playlist);
  }
  updatePlaylist(id: string, playlist: any): Observable<Playlist> {
    return this.http.patch<Playlist>(
      `${this.baseUrl}/playlist/${id}`,
      playlist
    );
  }

  deletePlaylist(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/playlist/${id}`);
  }

  getPlaylistSongs(id: string): Observable<Song[]> {
    return this.http.get<Song[]>(`${this.baseUrl}/playlist/${id}/songs`);
  }

  addSongToPlaylist(playlistId: string, songId: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/playlist/${playlistId}/songs/${songId}`,
      {}
    );
  }

  removeSongFromPlaylist(playlistId: string, songId: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/playlist/${playlistId}/songs/${songId}`
    );
  }
}
