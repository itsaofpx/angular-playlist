import { FormGroup } from '@angular/forms';

function resetForm(form: FormGroup) {
  form.reset();
  Object.keys(form.controls).forEach((key) => {
    const control = form.get(key);
    control?.markAsUntouched();
    control?.markAsPristine();
    control?.setErrors(null);
  });
}

function markFormGroupTouched(form: FormGroup) {
  Object.keys(form.controls).forEach((key) => {
    form.get(key)?.markAsTouched();
  });
}

export { resetForm, markFormGroupTouched };
