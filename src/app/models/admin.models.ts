export interface Utilisateur {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  emplacement: string;
  photoUrl?: string;
  dateInscription: Date;
  estVisiteur: boolean;
  estVerifier: boolean;
  isBanned: boolean; // Added for the admin panel
  latitude?: number;
  longitude?: number;
}

export interface Produit {
  id: string;
  titre: string;
  description: string;
  prix: number;
  imageUrls: string[];
  idVendeur: string;
  nomVendeur: string;
  telephoneVendeur: string;
  categorie: string;
  etat: string;
  dateCreation: Date;
  estVendu: boolean;
  estPrive: boolean;
  favorisCount?: number; // Added for the metrics
}

export interface Favori {
  id: string;
  userId: string;
  produitId: string;
  dateCreation: Date;
}

export interface Signaler {
  id: string;
  userId: string;
  produitId: string;
  dateCreation: Date;
  // We'll likely want to join this with product and user info for the UI
  produit?: Produit;
  user?: Utilisateur;
}
