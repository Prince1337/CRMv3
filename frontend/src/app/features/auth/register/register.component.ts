import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor() {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]]
    }, { validators: this.passwordMatchValidator });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      this.disableForm();

      const registerRequest: RegisterRequest = {
        username: this.registerForm.get('username')?.value,
        email: this.registerForm.get('email')?.value,
        password: this.registerForm.get('password')?.value,
        firstName: this.registerForm.get('firstName')?.value,
        lastName: this.registerForm.get('lastName')?.value
      };

      this.authService.register(registerRequest).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.successMessage = response.message;
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.errorMessage = response.message;
            this.enableForm();
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.enableForm();
          console.error('Registrierung fehlgeschlagen:', error);
          
          if (error.status === 400) {
            this.errorMessage = 'Registrierung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.';
          } else if (error.status === 409) {
            this.errorMessage = 'Username oder Email bereits vergeben.';
          } else if (error.status === 0) {
            this.errorMessage = 'Verbindung zum Server fehlgeschlagen. Bitte überprüfen Sie Ihre Internetverbindung.';
          } else {
            this.errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
          }
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private disableForm(): void {
    this.registerForm.get('username')?.disable();
    this.registerForm.get('email')?.disable();
    this.registerForm.get('firstName')?.disable();
    this.registerForm.get('lastName')?.disable();
    this.registerForm.get('password')?.disable();
    this.registerForm.get('confirmPassword')?.disable();
  }

  private enableForm(): void {
    this.registerForm.get('username')?.enable();
    this.registerForm.get('email')?.enable();
    this.registerForm.get('firstName')?.enable();
    this.registerForm.get('lastName')?.enable();
    this.registerForm.get('password')?.enable();
    this.registerForm.get('confirmPassword')?.enable();
  }

  private passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} ist erforderlich.`;
    }
    if (field?.hasError('minlength')) {
      const requiredLength = field.getError('minlength').requiredLength;
      return `${this.getFieldDisplayName(fieldName)} muss mindestens ${requiredLength} Zeichen lang sein.`;
    }
    if (field?.hasError('maxlength')) {
      const maxLength = field.getError('maxlength').requiredLength;
      return `${this.getFieldDisplayName(fieldName)} darf maximal ${maxLength} Zeichen lang sein.`;
    }
    if (field?.hasError('email')) {
      return 'Bitte geben Sie eine gültige Email-Adresse ein.';
    }
    if (this.registerForm.hasError('passwordMismatch') && fieldName === 'confirmPassword') {
      return 'Passwörter stimmen nicht überein.';
    }
    
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      username: 'Username',
      email: 'Email',
      password: 'Passwort',
      confirmPassword: 'Passwort-Bestätigung',
      firstName: 'Vorname',
      lastName: 'Nachname'
    };
    return fieldNames[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
} 