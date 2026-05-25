import { Injectable, inject } from '@angular/core';
import { Auth, user, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc, docData } from '@angular/fire/firestore';
import { Observable, of, switchMap, map, shareReplay, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  // Observable for the current user's auth state
  user$ = user(this.auth).pipe(shareReplay(1));

  // Observable for the current user's Firestore data
  userData$: Observable<any> = this.user$.pipe(
    switchMap(authUser => {
      if (!authUser) return of(null);
      
      // Try 'utilisateurs' collection first
      const userDocRef = doc(this.firestore, 'utilisateurs', authUser.uid);
      return docData(userDocRef).pipe(
        switchMap(data => {
          if (data) return of(data);
          // Fallback to 'users' collection
          const fallbackRef = doc(this.firestore, 'users', authUser.uid);
          return docData(fallbackRef);
        })
      );
    }),
    shareReplay(1)
  );

  async isAdmin(): Promise<boolean> {
    const userData = await firstValueFrom(this.userData$);
    return userData?.role === 'admin';
  }

  isAuthenticated(): Observable<boolean> {
    return this.user$.pipe(map(u => !!u));
  }
}
