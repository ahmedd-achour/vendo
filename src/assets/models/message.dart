import 'package:cloud_firestore/cloud_firestore.dart';

class Message {
  final String id;
  final String chatId;
  final String senderId;
  final String senderName;
  final String content;
  final DateTime timestamp;
  final bool isRead;
  final List<String> hiddenBy;

  Message({
    required this.id,
    required this.chatId,
    required this.senderId,
    required this.senderName,
    required this.content,
    required this.timestamp,
    this.isRead = false,
    this.hiddenBy = const [],
  });

  factory Message.fromDocument(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    final hiddenByList = data['hiddenBy'] as List<dynamic>?;
    final hiddenBy = hiddenByList != null
        ? List<String>.from(hiddenByList.map((e) => e.toString()))
        : <String>[];
    return Message(
      id: doc.id,
      chatId: data['chatId'] ?? '',
      senderId: data['senderId'] ?? '',
      senderName: data['senderName'] ?? '',
      content: data['content'] ?? '',
      timestamp: (data['timestamp'] as Timestamp).toDate(),
      isRead: data['isRead'] ?? false,
      hiddenBy: hiddenBy,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'chatId': chatId,
      'senderId': senderId,
      'senderName': senderName,
      'content': content,
      'timestamp': timestamp,
      'isRead': isRead,
      'hiddenBy': hiddenBy,
    };
  }

  /// Vérifie si le message est caché pour un utilisateur
  bool isHiddenForUser(String userId) {
    return hiddenBy.contains(userId);
  }
}

class Conversation {
  final String id;
  final String buyerId;
  final String buyerName;
  final String sellerId;
  final String sellerName;
  final String produitId;
  final String produitTitre;
  final String lastMessage;
  final String lastSenderId;
  final DateTime lastMessageTime;
  final int unreadCount;
  final List<String> hiddenBy;

  Conversation({
    required this.id,
    required this.buyerId,
    required this.buyerName,
    required this.sellerId,
    required this.sellerName,
    required this.produitId,
    required this.produitTitre,
    required this.lastMessage,
    this.lastSenderId = '',
    required this.lastMessageTime,
    this.unreadCount = 0,
    this.hiddenBy = const [],
  });

  factory Conversation.fromDocument(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    // Gérer hiddenBy comme une liste de Strings
    final hiddenByList = data['hiddenBy'] as List<dynamic>?;
    final hiddenBy = hiddenByList != null
        ? List<String>.from(hiddenByList.map((e) => e.toString()))
        : <String>[];

    return Conversation(
      id: doc.id,
      buyerId: data['buyerId'] ?? '',
      buyerName: data['buyerName'] ?? '',
      sellerId: data['sellerId'] ?? '',
      sellerName: data['sellerName'] ?? '',
      produitId: data['produitId'] ?? '',
      produitTitre: data['produitTitre'] ?? '',
      lastMessage: data['lastMessage'] ?? '',
      lastSenderId: data['lastSenderId'] ?? '',
      lastMessageTime: (data['lastMessageTime'] as Timestamp).toDate(),
      unreadCount: data['unreadCount'] ?? 0,
      hiddenBy: hiddenBy,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'buyerId': buyerId,
      'buyerName': buyerName,
      'sellerId': sellerId,
      'sellerName': sellerName,
      'produitId': produitId,
      'produitTitre': produitTitre,
      'lastMessage': lastMessage,
      'lastSenderId': lastSenderId,
      'lastMessageTime': lastMessageTime,
      'unreadCount': unreadCount,
      'hiddenBy': hiddenBy,
    };
  }

  /// Récupère le nom de l'autre participant
  String getOtherParticipantName(String currentUserId) {
    if (currentUserId == buyerId) {
      return sellerName;
    }
    return buyerName;
  }

  /// Récupère l'ID de l'autre participant
  String getOtherParticipantId(String currentUserId) {
    if (currentUserId == buyerId) {
      return sellerId;
    }
    return buyerId;
  }

  /// Vérifie si la conversation est cachée pour un utilisateur
  bool isHiddenForUser(String userId) {
    return hiddenBy.contains(userId);
  }
}
