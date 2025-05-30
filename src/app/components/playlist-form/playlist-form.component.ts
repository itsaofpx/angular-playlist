// components/playlist-form/playlist-form.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { markFormGroupTouched, resetForm } from '../../utils/util';

@Component({
  selector: 'app-playlist-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './playlist-form.component.html',
  styleUrls: ['./playlist-form.component.scss'],
})
export class PlaylistFormComponent {
  @Input() isLoading = false;
  @Output() playlistCreated = new EventEmitter<any>();
  @Output() duplicateError = new EventEmitter<string>(); // New output for duplicate errors

  playlistForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.playlistForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      description: [''],
    });
  }

  onSubmit() {
    if (this.playlistForm.invalid) {
      markFormGroupTouched(this.playlistForm);
      return;
    }

    this.playlistCreated.emit(this.playlistForm.value);
    // Don't reset form here - let parent handle success/error
  }

  onReset() {
    resetForm(this.playlistForm);
  }

  // Method to show duplicate error snackbar
  showDuplicateError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  // Method to show success message
  showSuccessMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
    this.onReset(); // Reset form on success
  }

  isSubmitDisabled(): boolean {
    const nameControl = this.playlistForm.get('name');
    const nameValue = nameControl?.value?.trim() || '';

    return (
      this.isLoading ||
      !nameControl ||
      nameValue.length === 0 ||
      this.playlistForm.invalid
    );
  }
}
