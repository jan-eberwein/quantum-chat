import { account, databases } from "@/config/config";
import { Query, Permission, ID } from "appwrite";
import { appwriteConfig } from "@/config/config";
import type { UserDoc, ChatDoc, MessageDoc, AppwriteAccount } from "@/lib/types";

const databaseId = appwriteConfig.databaseId;
const usersCollection = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;
const chatsCollection = import.meta.env.VITE_APPWRITE_CHATS_COLLECTION_ID;
const messagesCollection = import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION_ID;

export const appwriteService = {
  /** Register User (Auth + Database Entry) */
  async registerUser(
      email: string,
      password: string,
      name: string
  ): Promise<UserDoc> {
    try {
      // Create user in Appwrite Authentication
      const user = await account.create(ID.unique(), email, password, name);

      // Add user to the Database for linking with chats
      const userData = await databases.createDocument<UserDoc>(
          databaseId,
          usersCollection,
          ID.unique(),
          {
            accountId: user.$id,
            email,
            name,
          }
      );

      return userData;
    } catch (error: unknown) {
      console.error("[Register User Error]:", error);

      if (error instanceof Error) {
        throw new Error(`Failed to register user: ${error.message}`);
      }

      throw new Error("Failed to register user due to an unknown error.");
    }
  },

  /** Sign In a User */
  async signIn(
      email: string,
      password: string
  ): Promise<unknown> {
    try {
      // We return a session object (type from appwrite can be "Models.Session" if desired)
      return await account.createEmailPasswordSession(email, password);
    } catch (error: unknown) {
      console.error("[Sign In Error]:", error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Invalid email or password.");
    }
  },

  /** Logout User */
  async logout(): Promise<void> {
    try {
      await account.deleteSession("current");
    } catch (error: unknown) {
      console.error("[Logout Error]:", error);
      throw new Error("Failed to log out.");
    }
  },

  /** Get the currently logged-in user */
  async getCurrentUser(): Promise<AppwriteAccount | null> {
    try {
      return await account.get();
    } catch (error: unknown) {
      console.error("[Get Current User Error]:", error);
      return null;
    }
  },

  /** Fetch All Registered Users (Excluding Self) */
  async getAllUsers(excludeUserId: string): Promise<UserDoc[]> {
    try {
      const users = await databases.listDocuments<UserDoc>(
          databaseId,
          usersCollection
      );
      return users.documents.filter(
          (user) => user.accountId !== excludeUserId
      );
    } catch (error: unknown) {
      console.error("[Get All Users Error]:", error);
      throw new Error("Failed to fetch users.");
    }
  },

  /** Fetch Full User Profile */
  async getUserProfile(userId: string): Promise<UserDoc> {
    try {
      return await databases.getDocument<UserDoc>(
          databaseId,
          usersCollection,
          userId
      );
    } catch (error: unknown) {
      console.error("[Get User Profile Error]:", error);
      throw new Error("Failed to fetch user profile.");
    }
  },

  /** Fetch User's Chats */
  async getUserChats(userId: string): Promise<ChatDoc[]> {
    try {
      if (!userId) {
        throw new Error("Invalid userId provided for fetching chats.");
      }

      const queries = [
        Query.or([
          Query.equal("user1Id", [userId]),
          Query.equal("user2Id", [userId]),
        ]),
      ];

      const response = await databases.listDocuments<ChatDoc>(
          databaseId,
          chatsCollection,
          queries
      );
      return response.documents;
    } catch (error: unknown) {
      console.error("[Get User Chats Error]:", error);
      throw new Error("Failed to load chats.");
    }
  },

  /** Enhanced version: fetch user chats WITH name/email fields */
  async getUserChatsWithNames(userId: string): Promise<ChatDoc[]> {
    const chats = await this.getUserChats(userId);
    // For each chat, fetch the user documents so we can attach their name/email.
    for (const chat of chats) {
      const user1Docs = await databases.listDocuments<UserDoc>(
          databaseId,
          usersCollection,
          [Query.equal("accountId", [chat.user1Id])]
      );
      const user2Docs = await databases.listDocuments<UserDoc>(
          databaseId,
          usersCollection,
          [Query.equal("accountId", [chat.user2Id])]
      );
      chat.user1Name = user1Docs.documents[0]?.name ?? "Unknown";
      chat.user2Name = user2Docs.documents[0]?.name ?? "Unknown";
      chat.user1Email = user1Docs.documents[0]?.email ?? "";
      chat.user2Email = user2Docs.documents[0]?.email ?? "";
    }
    return chats;
  },

  /** Create a New Chat */
  async createChat(user1Id: string, user2Id: string): Promise<ChatDoc> {
    try {
      if (user1Id === user2Id) {
        throw new Error("You cannot start a chat with yourself.");
      }

      // Check if chat already exists
      const existingChats = await databases.listDocuments<ChatDoc>(
          databaseId,
          chatsCollection,
          [
            Query.or([
              Query.and([
                Query.equal("user1Id", user1Id),
                Query.equal("user2Id", user2Id),
              ]),
              Query.and([
                Query.equal("user1Id", user2Id),
                Query.equal("user2Id", user1Id),
              ]),
            ]),
          ]
      );

      if (existingChats.total > 0) {
        return existingChats.documents[0];
      }

      // Create new chat
      return await databases.createDocument<ChatDoc>(
          databaseId,
          chatsCollection,
          ID.unique(),
          { user1Id, user2Id },
          [Permission.read("users/unverified")]
      );
    } catch (error: unknown) {
      console.error("[Create Chat Error]:", error);

      if (error instanceof Error) {
        throw new Error(`Failed to create chat: ${error.message}`);
      }

      throw new Error("Failed to create chat due to an unknown error.");
    }
  },

  /** Fetch Messages for a Chat */
  async getChatMessages(chatId: string): Promise<{ documents: MessageDoc[] }> {
    try {
      // Return entire object for .documents
      return await databases.listDocuments<MessageDoc>(
          databaseId,
          messagesCollection,
          [
            Query.equal("chatId", chatId),
            Query.orderDesc("sent_at"),
          ]
      );
    } catch (error: unknown) {
      console.error("[Get Chat Messages Error]:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to load messages: ${error.message}`);
      }
      throw new Error("Failed to load messages due to an unknown error.");
    }
  },

  /** Send a New Message */
  async sendMessage(
      chatId: string,
      senderId: string,
      content: string
  ): Promise<MessageDoc> {
    try {
      return await databases.createDocument<MessageDoc>(
          databaseId,
          messagesCollection,
          ID.unique(),
          {
            chatId,
            senderId,
            content,
            sent_at: new Date().toISOString(),
          }
      );
    } catch (error: unknown) {
      console.error("[Send Message Error]:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to send message: ${error.message}`);
      }
      throw new Error("Failed to send message due to an unknown error.");
    }
  },

  /** Delete a Message */
  async deleteMessage(messageId: string): Promise<void> {
    try {
      await databases.deleteDocument(databaseId, messagesCollection, messageId);
    } catch (error: unknown) {
      console.error("[Delete Message Error]:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to delete message: ${error.message}`);
      }
      throw new Error("Failed to delete message due to an unknown error.");
    }
  },
};
