import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Song } from '../../models/song.model';
import { markFormGroupTouched } from '../../utils/util';

@Component({
  selector: 'app-song-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './song-edit-modal.component.html',
  styleUrls: ['./song-edit-modal.component.scss'],
})
export class SongEditModalComponent implements OnInit, OnDestroy {
  @Input() song: Song | null = null;
  @Input() isLoading = false;
  @Output() songUpdated = new EventEmitter<{ title: string; artist: string }>();
  @Output() modalClosed = new EventEmitter<void>();

  editForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      artist: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  ngOnInit() {
    if (this.song) {
      this.editForm.patchValue({
        title: this.song.title,
        artist: this.song.artist,
      });
    }

    document.addEventListener('keydown', this.handleEscapeKey);

    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleEscapeKey);
    document.body.style.overflow = 'auto';
  }

  private handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.onClose();
    }
  };

  onSubmit() {
    if (this.editForm.invalid) {
      markFormGroupTouched(this.editForm);
      return;
    }

    this.songUpdated.emit(this.editForm.value);
  }

  onClose() {
    this.modalClosed.emit();
  }

  onOverlayClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
