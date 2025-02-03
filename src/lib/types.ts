export interface Document {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
}

/** A user document in your "Users" collection */
export interface UserDoc extends Document {
  accountId: string;  // The Appwrite 'account' user ID
  email: string;
  name: string;
  imageURL?: string;
}

/** A chat document in your "Chats" collection */
export interface ChatDoc extends Document {
  user1Id: string;
  user2Id: string;
  // Optionally added at runtime
  user1Name?: string;
  user2Name?: string;
  user1Email?: string;
  user2Email?: string;
}

/** A message document in your "Messages" collection */
export interface MessageDoc extends Document {
  chatId: string;
  content: string;
  senderId: string;
  sent_at: string;
}

/** The user object returned by Appwrite’s `account.get()`. */
export interface AppwriteAccount {
  $id: string;
  email?: string;
  name?: string;
}