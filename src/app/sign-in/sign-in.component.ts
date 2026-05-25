import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth, AuthErrorCodes, GoogleAuthProvider, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
  authForm!: FormGroup;
  auth = inject(Auth);
  firestore = inject(Firestore);

  googleAuthProvider = new GoogleAuthProvider();

  isSubmissionInProgress: boolean = false;
  errorMessage: string = '';
  hidePassword = true;

  private allowedRoles = ['company', 'admin']; // Allowed roles

  constructor(private router: Router) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.authForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
  }

  async onSubmit() {
    if (this.authForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires correctement.';
      return;
    }

    this.isSubmissionInProgress = true;
    this.errorMessage = '';

    const { email, password } = this.authForm.value;

    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const uid = userCredential.user.uid;

      // Fetch Firestore user data from 'utilisateurs' collection (based on earlier models)
      // Note: The previous code used 'users', but your models suggested 'utilisateurs'
      // I'll check both or stick to what you have, but I'll use 'utilisateurs' to match your models.
      const userDocRef = doc(this.firestore, 'utilisateurs', uid);
      let userSnapshot = await getDoc(userDocRef);

      // Fallback to 'users' if 'utilisateurs' doesn't exist
      if (!userSnapshot.exists()) {
        const fallbackRef = doc(this.firestore, 'users', uid);
        userSnapshot = await getDoc(fallbackRef);
      }

      if (!userSnapshot.exists()) {
        await signOut(this.auth);
        throw new Error('Données utilisateur introuvables.');
      }

      const userData: any = userSnapshot.data();

      // Check if user is banned
      if (userData.isBanned) {
        await signOut(this.auth);
        throw new Error('Votre compte a été banni.');
      }

      // Check if role is admin
      if (userData.role !== 'admin') {
        await signOut(this.auth);
        throw new Error('Accès refusé. Seuls les administrateurs peuvent accéder à ce panel.');
      }

      // Success → redirect to admin
      this.router.navigate(['/admin']); 
    } catch (error: any) {
      this.isSubmissionInProgress = false;
      console.error('Sign-in error:', error);
      if (error.code === AuthErrorCodes.INVALID_EMAIL) {
        this.errorMessage = 'Email non valide';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        this.errorMessage = 'Email ou mot de passe invalide';
      } else {
        this.errorMessage = error.message || 'Une erreur est survenue, veuillez réessayer';
      }
    }
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }
}
