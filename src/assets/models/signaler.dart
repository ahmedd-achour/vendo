import 'package:cloud_firestore/cloud_firestore.dart';

class Signaler {
  final String id;
  final String userId;
  final String produitId;
  final DateTime dateCreation;

  Signaler({
    required this.id,
    required this.userId,
    required this.produitId,
    required this.dateCreation,
  });

  factory Signaler.fromDocument(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    return Signaler(
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
