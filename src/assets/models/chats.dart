import 'package:cloud_firestore/cloud_firestore.dart';

class Chats {
  final String id;
  final String reciverId;
  final String senderId;
  final String msg;


  Chats({
    required this.id,
    required this.reciverId,
    required this.senderId,
    required this.msg,
  });

  factory Chats.fromDocument(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    return Chats(
      id: doc.id,
      reciverId: data['reciverId'] ?? '',
      senderId: data['senderId'] ?? '',
      msg: data['msg'] ?? '',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'reciverId': reciverId,
      'senderId': senderId,
      'msg': msg,
    };
  }
}
