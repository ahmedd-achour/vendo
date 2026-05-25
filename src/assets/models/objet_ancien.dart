/// Modèle pour un objet ancien en vente à prix symbolique.
class ObjetAncien {
  final String id;
  final String nom;
  final String description;
  final double prixSymbolique; // en euros
  final String categorie;
  final String? imageUrl; // optionnel, pour une future intégration d'images

  const ObjetAncien({
    required this.id,
    required this.nom,
    required this.description,
    required this.prixSymbolique,
    required this.categorie,
    this.imageUrl,
  });
factory ObjetAncien.fromMap(Map<String, dynamic> map, {required String id}) {
  return ObjetAncien(
    id: id,
    nom: map['nom'] ?? '',
    description: map['description'] ?? '',
    prixSymbolique: (map['prixSymbolique'] ?? 0).toDouble(),
    categorie: map['categorie'] ?? '',
  );
}
  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ObjetAncien &&
        other.id == id &&
        other.nom == nom &&
        other.description == description &&
        other.prixSymbolique == prixSymbolique &&
        other.categorie == categorie;
  }

  @override
  int get hashCode =>
      Object.hash(id, nom, description, prixSymbolique, categorie);

  String get prixFormate =>
      '${prixSymbolique.toStringAsFixed(prixSymbolique == prixSymbolique.round() ? 0 : 2)} €';
}


