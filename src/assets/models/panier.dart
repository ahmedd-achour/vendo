import 'package:cloud_firestore/cloud_firestore.dart';

class Panier {
  DateTime dateCreation;
  final String userId;
  final String produitId;
  final int quantity;

  Panier({
    required this.userId,
    required this.produitId,
    required this.dateCreation,
    required this.quantity, 
  });

  factory Panier.fromDocument(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    return Panier(
      userId: data['userId'] ?? '',
      produitId: data['produitId'] ?? '',
      dateCreation: (data['dateCreation'] as Timestamp).toDate(),
      quantity: data['quantity'] ?? 0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'userId': userId,
      'produitId': produitId,
      'dateCreation': dateCreation,
      'quantity': quantity,
    };
  }
}
