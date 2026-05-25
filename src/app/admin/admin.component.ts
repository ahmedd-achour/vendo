import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';
import { Utilisateur, Produit, Signaler } from '../models/admin.models';
import { Observable, combineLatest, map, startWith, BehaviorSubject, Subscription } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { Auth, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  private adminService = inject(AdminService);
  private auth = inject(Auth);
  private router = inject(Router);
  private sub = new Subscription();

  activeTab: 'dashboard' | 'users' | 'products' | 'reports' = 'dashboard';

  stats$ = this.adminService.getStats();
  
  // Search and Filtering
  userSearchTerm$ = new BehaviorSubject<string>('');
  productSearchTerm$ = new BehaviorSubject<string>('');
  
  filteredUsers$!: Observable<Utilisateur[]>;
  filteredProducts$!: Observable<Produit[]>;
  signals$!: Observable<Signaler[]>;

  // Chart Data
  public categoryChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [] }]
  };
  public categoryChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Répartition par Catégorie (%)' }
    }
  };

  public etatChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{ data: [] }]
  };
  public etatChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Répartition par État (%)' }
    }
  };

  public statusChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [] }]
  };
  public statusChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Visibilité (Privé vs Public %)' }
    }
  };

  public priceChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Prix Moyen (TND)' }]
  };
  public priceChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Prix Moyen par Catégorie' }
    }
  };

  // User Profile
  selectedUser: Utilisateur | null = null;
  userProducts$!: Observable<Produit[]>;

  ngOnInit() {
    // Users with filtering
    this.filteredUsers$ = combineLatest([
      this.adminService.getUsers(),
      this.userSearchTerm$.pipe(startWith(''))
    ]).pipe(
      map(([users, term]) => {
        if (!term) return users;
        const lowerTerm = term.toLowerCase();
        return users.filter(u => 
          u.nom.toLowerCase().includes(lowerTerm) || 
          u.prenom.toLowerCase().includes(lowerTerm) || 
          u.email.toLowerCase().includes(lowerTerm)
        );
      })
    );

    // Products with filtering and favorites
    this.filteredProducts$ = combineLatest([
      this.adminService.getProducts(),
      this.productSearchTerm$.pipe(startWith(''))
    ]).pipe(
      map(([products, term]) => {
        if (!term) return products;
        const lowerTerm = term.toLowerCase();
        return products.filter(p => 
          p.titre.toLowerCase().includes(lowerTerm) || 
          p.nomVendeur.toLowerCase().includes(lowerTerm)
        );
      })
    );

    this.signals$ = this.adminService.getSignals();

    // Handle Analytics for Charts
    this.sub.add(
      this.adminService.getAnalytics().subscribe(data => {
        // Category Chart
        this.categoryChartData = {
          labels: data.categoryData.map(d => d.name),
          datasets: [{
            data: data.categoryData.map(d => parseFloat(d.percentage.toFixed(1))),
            backgroundColor: ['#4f46e5', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899']
          }]
        };

        // Etat Chart
        this.etatChartData = {
          labels: data.etatData.map(d => d.name),
          datasets: [{
            data: data.etatData.map(d => parseFloat(d.percentage.toFixed(1))),
            backgroundColor: ['#10b981', '#34d399', '#fbbf24', '#f87171', '#ef4444']
          }]
        };

        // Status Chart
        this.statusChartData = {
          labels: data.statusData.map(d => d.name),
          datasets: [{
            data: data.statusData.map(d => parseFloat(d.percentage.toFixed(1))),
            backgroundColor: ['#6366f1', '#e2e8f0']
          }]
        };

        // Price Chart
        this.priceChartData = {
          labels: data.priceData.map(d => d.name),
          datasets: [{
            data: data.priceData.map(d => parseFloat(d.avgPrice.toFixed(2))),
            backgroundColor: '#4f46e5',
            label: 'Prix Moyen (TND)'
          }]
        };
      })
    );
  }

  viewProfile(user: Utilisateur) {
    this.selectedUser = user;
    this.userProducts$ = this.adminService.getProducts().pipe(
      map(products => products.filter(p => p.idVendeur === user.id))
    );
  }

  closeProfile() {
    this.selectedUser = null;
  }

  async logout() {
    try {
      await signOut(this.auth);
      this.router.navigate(['/sign-in']);
    } catch (err) {
      console.error('Logout error:', err);
    }
  }

  setTab(tab: 'dashboard' | 'users' | 'products' | 'reports') {
    this.activeTab = tab;
  }

  onUserSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.userSearchTerm$.next(term);
  }

  onProductSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.productSearchTerm$.next(term);
  }

  toggleBan(user: Utilisateur) {
    const newStatus = !user.isBanned;
    this.adminService.banUser(user.id, newStatus).catch(err => {
      console.error('Error updating ban status:', err);
      alert('Erreur lors de la mise à jour du statut.');
    });
  }

  deleteProduct(productId: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      this.adminService.deleteProduct(productId).catch(err => {
        console.error('Error deleting product:', err);
        alert('Erreur lors de la suppression du produit.');
      });
    }
  }

  formatDate(date: any): string {
    if (!date) return 'N/A';
    if (date.toDate) return date.toDate().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
