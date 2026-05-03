import { createContext, useEffect, useState } from "react";
import { databases } from "../lib/appwrite";
import { ID, Role, Permission, Query } from "react-native-appwrite";
import { useUser } from "../hooks/useUser";
import AsyncStorage from '@react-native-async-storage/async-storage'; // Add this

const DATABASE_ID = "6941469500191986b395";
const COLLECTION_ID = "books";
const BOOKS_CACHE_KEY = 'cached_books_list';

export const BooksContext = createContext();

export function BooksProvider({ children }) {
    const [books, setBooks] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const { user } = useUser();

    // Load local cache immediately on mount
    useEffect(() => {
        const loadCache = async () => {
            const cachedData = await AsyncStorage.getItem(BOOKS_CACHE_KEY);
            if (cachedData) {
                setBooks(JSON.parse(cachedData));
            }
        };
        loadCache();
    }, []);

    // Sync with server whenever the user changes
    useEffect(() => {
        if (user?.$id) {
            fetchBooks();
        }
    }, [user]);

    async function fetchBooks() {
        setIsFetching(true);
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 4000));

        try {
            const result = await Promise.race([
                databases.listDocuments(
                    DATABASE_ID, 
                    COLLECTION_ID, 
                    [Query.equal('userid', user.$id)]
                ),
                timeout
            ]);

            setBooks(result.documents);
            // Save to local storage for offline use
            await AsyncStorage.setItem(BOOKS_CACHE_KEY, JSON.stringify(result.documents));
        } catch (error) {
            console.log("Books fetch failed (using cache if available):", error.message);
        } finally {
            setIsFetching(false);
        }
    }

    async function createBook(data) {
        if (!user) throw new Error("User must be logged in to create a book");
        
        try {
            const newBook = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                { ...data, userid: user.$id },
                [
                    Permission.read(Role.user(user.$id)),
                    Permission.update(Role.user(user.$id)),
                    Permission.delete(Role.user(user.$id))
                ]
            );
            // Optimistic Update: Add to UI immediately and refresh list
            fetchBooks();
            return newBook;
        } catch (error) {
            console.error("Creation error:", error.message);
            throw error;
        }
    }

    async function deleteBook(id) {
        try {
            await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
            // Update local state by filtering out the deleted book
            setBooks((prev) => prev.filter((b) => b.$id !== id));
            // Sync the cache
            const updatedBooks = books.filter((b) => b.$id !== id);
            await AsyncStorage.setItem(BOOKS_CACHE_KEY, JSON.stringify(updatedBooks));
        } catch (error) {
            console.error("Delete error:", error.message);
        }
    }

    return (
        <BooksContext.Provider
            value={{ books, fetchBooks, createBook, deleteBook, isFetching }}
        >
            {children}
        </BooksContext.Provider>
    );
}