import 'package:cloud_firestore/cloud_firestore.dart';

class Utilisateur {
  final String id;
  final String email;
  final String nom;
  final String prenom;
  final String telephone;
  final String emplacement;
  final String? photoUrl;
  final DateTime dateInscription;
  final bool estVisiteur;
  final bool estVerifier;
  final double? latitude;
  final double? longitude;

  Utilisateur({
    required this.id,
    required this.email,
    required this.nom,
    required this.prenom,
    required this.telephone,
    required this.emplacement,
    this.photoUrl,
    required this.dateInscription,
    this.estVisiteur = false,
    this.estVerifier = false,
    this.latitude,
    this.longitude,
  });

  factory Utilisateur.fromDocument(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    return Utilisateur(
      id: doc.id,
      email: data['email'] ?? '',
      nom: data['nom'] ?? '',
      prenom: data['prenom'] ?? '',
      telephone: data['telephone'] ?? '',
      emplacement: data['emplacement'] ?? '',
      photoUrl: data['photoUrl'],
      dateInscription: (data['dateInscription'] as Timestamp).toDate(),
      estVisiteur: data['estVisiteur'] ?? false,
      estVerifier: data['estVerifier'] ?? false,
      latitude: data['latitude'],
      longitude: data['longitude'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'email': email,
      'nom': nom,
      'prenom': prenom,
      'telephone': telephone,
      'emplacement': emplacement,
      'photoUrl': photoUrl,
      'dateInscription': dateInscription,
      'estVisiteur': estVisiteur,
      'estVerifier': estVerifier,
      'latitude': latitude,
      'longitude': longitude,
    };
  }
}
