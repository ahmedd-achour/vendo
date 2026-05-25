import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  updateDoc, 
  deleteDoc, 
  docData
} from '@angular/fire/firestore';
import { Observable, map, switchMap, combineLatest, of, catchError } from 'rxjs';
import { Utilisateur, Produit, Signaler, Favori } from '../models/admin.models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private firestore = inject(Firestore);

  // Users
  getUsers(): Observable<Utilisateur[]> {
    const usersRef = collection(this.firestore, 'utilisateurs');
    return (collectionData(usersRef, { idField: 'id' }) as Observable<Utilisateur[]>).pipe(
      map(users => users.map(user => ({
        ...user,
        isBanned: !!user.isBanned
      }))),
      catchError(err => {
        console.error('Error fetching users:', err);
        return of([]);
      })
    );
  }

  banUser(userId: string, isBanned: boolean): Promise<void> {
    const userDoc = doc(this.firestore, 'utilisateurs', userId);
    return updateDoc(userDoc, { isBanned });
  }

  // Favorites
  getFavoris(): Observable<Favori[]> {
    const favorisRef = collection(this.firestore, 'favoris');
    return collectionData(favorisRef, { idField: 'id' }) as Observable<Favori[]>;
  }

  // Products with Favorites Count
  getProducts(): Observable<Produit[]> {
    const productsRef = collection(this.firestore, 'produits');
    const products$ = collectionData(productsRef, { idField: 'id' }) as Observable<Produit[]>;
    const favoris$ = this.getFavoris();

    return combineLatest([products$, favoris$]).pipe(
      map(([products, favoris]) => {
        return products.map(product => {
          const count = favoris.filter(f => f.produitId === product.id).length;
          return { ...product, favorisCount: count };
        });
      }),
      catchError(err => {
        console.error('Error fetching products with favoris:', err);
        return of([]);
      })
    );
  }

  deleteProduct(productId: string): Promise<void> {
    const productDoc = doc(this.firestore, 'produits', productId);
    return deleteDoc(productDoc);
  }

  // Category, Etat, and Status Analytics
  getAnalytics() {
    return this.getProducts().pipe(
      map(products => {
        const categories: { [key: string]: number } = {};
        const etats: { [key: string]: number } = {};
        const privateStatus = { prive: 0, public: 0 };
        const prices: { [key: string]: { total: number, count: number } } = {};

        products.forEach(p => {
          // Category count
          const cat = p.categorie || 'Autres';
          categories[cat] = (categories[cat] || 0) + 1;

          // Etat count
          const etat = p.etat || 'Inconnu';
          etats[etat] = (etats[etat] || 0) + 1;

          // Private status
          if (p.estPrive) privateStatus.prive++;
          else privateStatus.public++;

          // Price tracking
          if (!prices[cat]) prices[cat] = { total: 0, count: 0 };
          prices[cat].total += p.prix;
          prices[cat].count += 1;
        });

        const total = products.length || 1;
        
        const categoryData = Object.keys(categories).map(cat => ({
          name: cat,
          percentage: (categories[cat] / total) * 100
        }));

        const etatData = Object.keys(etats).map(e => ({
          name: e,
          percentage: (etats[e] / total) * 100
        }));

        const statusData = [
          { name: 'Privé', percentage: (privateStatus.prive / total) * 100 },
          { name: 'Public', percentage: (privateStatus.public / total) * 100 }
        ];

        const priceData = Object.keys(prices).map(cat => ({
          name: cat,
          avgPrice: prices[cat].total / prices[cat].count
        }));

        return { categoryData, etatData, statusData, priceData };
      })
    );
  }

  // Signaled Products
  getSignals(): Observable<Signaler[]> {
    const signalsRef = collection(this.firestore, 'signaler');
    const signals$ = collectionData(signalsRef, { idField: 'id' }) as Observable<Signaler[]>;

    return signals$.pipe(
      switchMap(signals => {
        if (!signals || signals.length === 0) return of([]);
        
        const signalDetails$ = signals.map(signal => {
          const product$ = docData(doc(this.firestore, 'produits', signal.produitId), { idField: 'id' }) as Observable<Produit | undefined>;
          const user$ = docData(doc(this.firestore, 'utilisateurs', signal.userId), { idField: 'id' }) as Observable<Utilisateur | undefined>;
          
          return combineLatest([of(signal), product$, user$]).pipe(
            map(([sig, prod, usr]) => ({
              ...sig,
              produit: prod,
              user: usr
            }))
          );
        });
        
        return combineLatest(signalDetails$);
      }),
      catchError(err => {
        console.error('Error fetching signals:', err);
        return of([]);
      })
    );
  }

  // Stats
  getStats() {
    return combineLatest([
      this.getUsers(),
      this.getProducts(),
      collectionData(collection(this.firestore, 'signaler'))
    ]).pipe(
      map(([users, products, signals]) => ({
        totalUsers: users.length,
        totalProducts: products.length,
        totalSignals: signals.length,
        bannedUsers: users.filter(u => u.isBanned).length,
        soldProducts: products.filter(p => p.estVendu).length
      })),
      catchError(err => {
        console.error('Error calculating stats:', err);
        return of({
          totalUsers: 0,
          totalProducts: 0,
          totalSignals: 0,
          bannedUsers: 0,
          soldProducts: 0
        });
      })
    );
  }
}
