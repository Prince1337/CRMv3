import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const { confirmPassword, ...userData } = this.registerForm.value;

      this.authService.register(userData).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.isLoading = false;
          
          // Nach 2 Sekunden zur Login-Seite weiterleiten
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
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
      return `${this.getFieldDisplayName(fieldName)} ist erforderlich`;
    }
    
    if (fieldName === 'username' && field?.hasError('minlength')) {
      return 'Benutzername muss mindestens 3 Zeichen lang sein';
    }
    
    if (fieldName === 'password' && field?.hasError('minlength')) {
      return 'Passwort muss mindestens 6 Zeichen lang sein';
    }
    
    if (fieldName === 'email' && field?.hasError('email')) {
      return 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
    }
    
    if (fieldName === 'confirmPassword' && field?.hasError('passwordMismatch')) {
      return 'Passwörter stimmen nicht überein';
    }
    
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      username: 'Benutzername',
      email: 'E-Mail',
      password: 'Passwort',
      confirmPassword: 'Passwort bestätigen',
      firstName: 'Vorname',
      lastName: 'Nachname'
    };
    return displayNames[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
} 