// components/song-form/song-form.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { markFormGroupTouched, resetForm } from '../../utils/util';

@Component({
  selector: 'app-song-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './song-form.component.html',
  styleUrls: ['./song-form.component.scss'],
})
export class SongFormComponent {
  @Input() isLoading = false;
  @Output() songCreated = new EventEmitter<{ title: string; artist: string }>();

  songForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.songForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      artist: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  get isAddButtonDisabled(): boolean {
    const titleValue = this.songForm.get('title')?.value?.trim() || '';
    const artistValue = this.songForm.get('artist')?.value?.trim() || '';

    return (
      titleValue.length === 0 || artistValue.length === 0 || this.isLoading
    );
  }

  onSubmit() {
    const titleValue = this.songForm.get('title')?.value?.trim() || '';
    const artistValue = this.songForm.get('artist')?.value?.trim() || '';

    if (titleValue.length === 0 || artistValue.length === 0) {
      markFormGroupTouched(this.songForm);
      return;
    }

    const formValue = {
      title: titleValue,
      artist: artistValue,
    };

    this.songCreated.emit(formValue);
  }

  onClear() {
    resetForm(this.songForm);
  }

  onReset() {
    resetForm(this.songForm);
  }
}
