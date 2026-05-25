import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// Firebase Imports
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment.development';

// Chart.js Imports
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Initialize Firebase Core
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    // Initialize Individual Services
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    // Initialize Charts
    provideCharts(withDefaultRegisterables())
  ]
};
