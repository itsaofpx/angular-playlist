// components/playlist-edit-modal/playlist-edit-modal.component.ts
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Playlist } from '../../models/playlist.model';

@Component({
  selector: 'app-playlist-edit-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './playlist-edit-modal.component.html',
  styleUrls: ['./playlist-edit-modal.component.scss'],
})
export class PlaylistEditModalComponent implements OnInit, OnChanges {
  @Input() isVisible = false;
  @Input() playlist: Playlist | null = null;
  @Input() songCount = 0;
  @Input() isSubmitting = false;

  @Output() modalClosed = new EventEmitter<void>();
  @Output() playlistUpdated = new EventEmitter<{
    id: string;
    name: string;
    description?: string;
  }>();

  formData = {
    name: '',
    description: '',
  };

  @HostListener('keydown.escape')
  onEscapeKey() {
    if (this.isVisible && !this.isSubmitting) {
      this.closeModal();
    }
  }

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['playlist'] && this.playlist) {
      this.initializeForm();
    }
  }

  private initializeForm() {
    if (this.playlist) {
      this.formData = {
        name: this.playlist.name,
        description: this.playlist.description || '',
      };
    }
  }

  onSubmit(form: NgForm) {
    if (form.valid && this.playlist && !this.isSubmitting) {
      const updatedData = {
        id: this.playlist.id,
        name: this.formData.name.trim(),
        description: this.formData.description?.trim() || undefined,
      };

      this.playlistUpdated.emit(updatedData);
    }
  }

  closeModal() {
    if (!this.isSubmitting) {
      this.modalClosed.emit();
      this.resetForm();
    }
  }

  onOverlayClick(event: Event) {
    if (event.target === event.currentTarget && !this.isSubmitting) {
      this.closeModal();
    }
  }

  private resetForm() {
    this.formData = {
      name: '',
      description: '',
    };
  }

  getSongCount(): number {
    return this.songCount;
  }
}
