import {account, databases} from "@/config/config";
import {Query, Permission, ID} from "appwrite";
import {appwriteConfig} from "@/config/config";

const databaseId = appwriteConfig.databaseId;
const usersCollection = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;
const chatsCollection = import.meta.env.VITE_APPWRITE_CHATS_COLLECTION_ID;
const messagesCollection = import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION_ID;

export const appwriteService = {
    /** Register User (Auth + Database Entry) */
    async registerUser(email: string, password: string, name: string) {
        try {
            // 1️⃣ Create user in Appwrite Authentication
            const user = await account.create(ID.unique(), email, password, name);

            // 2️⃣ Add user to the Database for linking with chats
            const userData = await databases.createDocument(databaseId, usersCollection, ID.unique(), {
                accountId: user.$id,
                email,
                name,
            });

            return userData;
        } catch (error: any) {
            console.error("[Register User Error]:", error);
            throw new Error("Failed to register user.");
        }
    },

    /** Sign In a User */
    async signIn(email: string, password: string) {
        try {
            return await account.createEmailPasswordSession(email, password);
        } catch (error: any) {
            console.error("[Sign In Error]:", error);
            throw new Error("Invalid email or password.");
        }
    },

    /** Logout User */
    async logout() {
        try {
            await account.deleteSession("current");
        } catch (error: any) {
            console.error("[Logout Error]:", error);
            throw new Error("Failed to log out.");
        }
    },

    /** Get the currently logged-in user */
    async getCurrentUser() {
        try {
            return await account.get();
        } catch (error: any) {
            console.error("[Get Current User Error]:", error);
            return null;
        }
    },

    /** Fetch All Registered Users (Excluding Self) */
    async getAllUsers(excludeUserId: string) {
        try {
            const users = await databases.listDocuments(databaseId, usersCollection);
            return users.documents.filter(user => user.accountId !== excludeUserId);
        } catch (error: any) {
            console.error("[Get All Users Error]:", error);
            throw new Error("Failed to fetch users.");
        }
    },

    /** Fetch Full User Profile */
    async getUserProfile(userId: string) {
        try {
            return await databases.getDocument(databaseId, usersCollection, userId);
        } catch (error: any) {
            console.error("[Get User Profile Error]:", error);
            throw new Error("Failed to fetch user profile.");
        }
    },

    /** Fetch User's Chats */
    async getUserChats(userId: string) {
        try {
            if (!userId) {
                throw new Error("Invalid userId provided for fetching chats.");
            }

            const queries = [
                Query.or([
                    Query.equal("user1Id", [userId]),
                    Query.equal("user2Id", [userId])
                ])
            ];

            const response = await databases.listDocuments(databaseId, chatsCollection, queries);
            return response.documents;
        } catch (error: any) {
            console.error("[Get User Chats Error]:", error);
            throw new Error("Failed to load chats.");
        }
    },

    /** Enhanced version: fetch user chats WITH name/email fields */
    async getUserChatsWithNames(userId: string) {
        const chats = await this.getUserChats(userId);
        // For each chat, fetch the user documents so we can attach their name/email.
        for (const chat of chats) {
            const user1Docs = await databases.listDocuments(databaseId, usersCollection, [
                Query.equal("accountId", [chat.user1Id])
            ]);
            const user2Docs = await databases.listDocuments(databaseId, usersCollection, [
                Query.equal("accountId", [chat.user2Id])
            ]);
            chat.user1Name = user1Docs.documents[0]?.name ?? "Unknown";
            chat.user2Name = user2Docs.documents[0]?.name ?? "Unknown";
            chat.user1Email = user1Docs.documents[0]?.email ?? "";
            chat.user2Email = user2Docs.documents[0]?.email ?? "";
        }
        return chats;
    },

    /** Create a New Chat */
    async createChat(user1Id: string, user2Id: string) {
        try {
            if (user1Id === user2Id) throw new Error("You cannot start a chat with yourself.");

            // Check if chat already exists
            const existingChats = await databases.listDocuments(databaseId, chatsCollection, [
                Query.or([
                    Query.and([Query.equal("user1Id", user1Id), Query.equal("user2Id", user2Id)]),
                    Query.and([Query.equal("user1Id", user2Id), Query.equal("user2Id", user1Id)])
                ])
            ]);

            if (existingChats.total > 0) return existingChats.documents[0];

            // Create new chat
            return await databases.createDocument(databaseId, chatsCollection, ID.unique(), {
                    user1Id,
                    user2Id,
                }, /*[
                Permission.read(Role.user(user1Id)),
                Permission.read(Role.user(user2Id))
            ]*/
                [
                    Permission.read('users/unverified'),
                ]);
        } catch (error: any) {
            console.error("[Create Chat Error]:", error);
            throw new Error("Failed to create chat.");
        }
    },

    /** Fetch Messages for a Chat */
    async getChatMessages(chatId: string) {
        try {
            return await databases.listDocuments(databaseId, messagesCollection, [
                Query.equal("chatId", chatId),
                Query.orderDesc("sent_at"),
            ]);
        } catch (error: any) {
            console.error("[Get Chat Messages Error]:", error);
            throw new Error("Failed to load messages.");
        }
    },

    /** Send a New Message */
    async sendMessage(chatId: string, senderId: string, content: string) {
        try {
            return await databases.createDocument(databaseId, messagesCollection, ID.unique(), {
                chatId,
                senderId,
                content,
                sent_at: new Date().toISOString(),
            });
        } catch (error: any) {
            console.error("[Send Message Error]:", error);
            throw new Error("Failed to send message.");
        }
    },

    /** Delete a Message */
    async deleteMessage(messageId: string) {
        try {
            await databases.deleteDocument(databaseId, messagesCollection, messageId);
        } catch (error: any) {
            console.error("[Delete Message Error]:", error);
            throw new Error("Failed to delete message.");
        }
    },
};
