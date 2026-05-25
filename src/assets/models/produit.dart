import 'package:cloud_firestore/cloud_firestore.dart';

enum Categorie {
  bois,
  plastique,
  cuivre,
  dechet_alimentaire,
  electro_menager,
  autres,
}

enum EtatObjet {
  neuf,
  commeNeuf,
  bon,
  acceptable,
  aRestaurer;

  String get libelle {
    switch (this) {
      case neuf:
        return 'Neuf';
      case commeNeuf:
        return 'Comme neuf';
      case bon:
        return 'Bon état';
      case acceptable:
        return 'Acceptable';
      case aRestaurer:
        return 'À restaurer';
    }
  }
}

class Produit {
  final String id;
  final String titre;
  final String description;
  final double prix; // Prix en TND (Dinar Tunisien)
  final List<String> imageUrls; // Liste de plusieurs images
  final String idVendeur;
  final String nomVendeur;
  final String telephoneVendeur;
  final Categorie categorie;
  final EtatObjet etat;
  final DateTime dateCreation;
  final bool estVendu;
  final bool estPrive; // Nouveau champ pour rendre l'annonce privée

  Produit({
    required this.id,
    required this.titre,
    required this.description,
    required this.prix,
    required this.imageUrls,
    required this.idVendeur,
    required this.nomVendeur,
    required this.telephoneVendeur,
    required this.categorie,
    required this.etat,
    required this.dateCreation,
    this.estVendu = false,
    this.estPrive = false,
  });

  String get imageUrl => imageUrls.isNotEmpty ? imageUrls[0] : '';
  String get prixFormate => '$prix TND';

  factory Produit.fromDocument(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;

    // Handle both single image (backward compatibility) and multiple images
    List<String> imageUrls = [];
    if (data['imageUrls'] != null) {
      imageUrls = List<String>.from(data['imageUrls']);
    } else if (data['imageUrl'] != null) {
      imageUrls = [data['imageUrl']];
    }

    return Produit(
      id: doc.id,
      titre: data['titre'] ?? '',
      description: data['description'] ?? '',
      prix: (data['prix'] as num).toDouble(),
      imageUrls: imageUrls,
      idVendeur: data['idVendeur'] ?? '',
      nomVendeur: data['nomVendeur'] ?? '',
      telephoneVendeur: data['telephoneVendeur'] ?? '',
      categorie: Categorie.values.firstWhere(
        (c) => c.name == data['categorie'],
        orElse: () => Categorie.autres,
      ),
      etat: EtatObjet.values.firstWhere(
        (e) => e.name == data['etat'],
        orElse: () => EtatObjet.bon,
      ),
      dateCreation: (data['dateCreation'] as Timestamp).toDate(),
      estVendu: data['estVendu'] ?? false,
      estPrive: data['estPrive'] ?? false,
    );
  }
factory Produit.fromMap(Map<String, dynamic> data, {required String id}) {
    // Handle both single image (backward compatibility) and multiple images matrix
    List<String> imageUrls = [];
    if (data['imageUrls'] != null) {
      imageUrls = List<String>.from(data['imageUrls']);
    } else if (data['imageUrl'] != null) {
      imageUrls = [data['imageUrl']];
    }

    // Handle timestamps seamlessly whether raw ISO string or native Firebase Timestamp object
    DateTime parsedDate;
    if (data['dateCreation'] is Timestamp) {
      parsedDate = (data['dateCreation'] as Timestamp).toDate();
    } else if (data['dateCreation'] is String) {
      parsedDate = DateTime.parse(data['dateCreation']);
    } else {
      parsedDate = DateTime.now(); // Fallback defensive posture
    }

    return Produit(
      id: id,
      titre: data['titre'] ?? data['nom'] ?? '', // Handles 'nom' if generalized in the cart payload
      description: data['description'] ?? '',
      prix: (data['prix'] as num? ?? 0.0).toDouble(),
      imageUrls: imageUrls,
      idVendeur: data['idVendeur'] ?? '',
      nomVendeur: data['nomVendeur'] ?? '',
      telephoneVendeur: data['telephoneVendeur'] ?? '',
      categorie: Categorie.values.firstWhere(
        (c) => c.name == data['categorie'],
        orElse: () => Categorie.autres,
      ),
      etat: EtatObjet.values.firstWhere(
        (e) => e.name == data['etat'],
        orElse: () => EtatObjet.bon,
      ),
      dateCreation: parsedDate,
      estVendu: data['estVendu'] ?? false,
      estPrive: data['estPrive'] ?? false,
    );
  }


  
  Map<String, dynamic> toMap() {
    return {
      'titre': titre,
      'description': description,
      'prix': prix,
      'imageUrls': imageUrls,
      'idVendeur': idVendeur,
      'nomVendeur': nomVendeur,
      'telephoneVendeur': telephoneVendeur,
      'categorie': categorie.name,
      'etat': etat.name,
      'dateCreation': dateCreation,
      'estVendu': estVendu,
      'estPrive': estPrive,
    };
  }
}
