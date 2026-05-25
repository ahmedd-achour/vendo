import 'package:cloud_firestore/cloud_firestore.dart';

class Favori {
  final String id;
  final String userId;
  final String produitId;
  final DateTime dateCreation;

  Favori({
    required this.id,
    required this.userId,
    required this.produitId,
    required this.dateCreation,
  });

  factory Favori.fromDocument(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    return Favori(
      id: doc.id,
      userId: data['userId'] ?? '',
      produitId: data['produitId'] ?? '',
      dateCreation: (data['dateCreation'] as Timestamp).toDate(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'userId': userId,
      'produitId': produitId,
      'dateCreation': dateCreation,
    };
  }
}
