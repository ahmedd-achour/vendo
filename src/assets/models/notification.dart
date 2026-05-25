import 'package:cloud_firestore/cloud_firestore.dart';

enum TypeNotification {
  nouvelleCommande,
  confirmationCommande,
  nouveauMessage,
  nouveauFavori,
  produitVendu,
  autres;

  String get libelle {
    switch (this) {
      case nouvelleCommande:
        return 'Nouvelle commande';
      case confirmationCommande:
        return 'Confirmation commande';
      case nouveauMessage:
        return 'Nouveau message';
      case nouveauFavori:
        return 'Nouveau favori';
      case produitVendu:
        return 'Produit vendu';
      case autres:
        return 'Autre';
    }
  }
}

class NotificationModel {
  final String id;
  final String userId;
  final String titre;
  final String contenu;
  final TypeNotification type;
  final bool estLue;
  final DateTime dateCreation;
  final String?
  dataSupplementaire; // Pour stocker des données additionnelles (ex: commandeId, chatId)

  NotificationModel({
    required this.id,
    required this.userId,
    required this.titre,
    required this.contenu,
    required this.type,
    this.estLue = false,
    required this.dateCreation,
    this.dataSupplementaire,
  });

  factory NotificationModel.fromDocument(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    return NotificationModel(
      id: doc.id,
      userId: data['userId'] ?? '',
      titre: data['titre'] ?? '',
      contenu: data['contenu'] ?? '',
      type: TypeNotification.values.firstWhere(
        (t) => t.name == data['type'],
        orElse: () => TypeNotification.autres,
      ),
      estLue: data['estLue'] ?? false,
      dateCreation: (data['dateCreation'] as Timestamp).toDate(),
      dataSupplementaire: data['dataSupplementaire'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'userId': userId,
      'titre': titre,
      'contenu': contenu,
      'type': type.name,
      'estLue': estLue,
      'dateCreation': dateCreation,
      'dataSupplementaire': dataSupplementaire,
    };
  }
}
