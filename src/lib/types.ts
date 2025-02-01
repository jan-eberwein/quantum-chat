export interface User {
  accountId: string;
  email: string;
  imageURL?: string;
  name: string;
}

export interface Chat {
  $id: string;
  user1Id: string;
  user2Id: string;
  user1Name?: string;
  user2Name?: string;
  user1Email?: string;
  user2Email?: string;
}

export interface Message {
  $id: string;
  chatId: string;
  senderId: string;
  content: string;
  sent_at: string;
}
