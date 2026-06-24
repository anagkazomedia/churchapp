import { createContext, useEffect, useState } from "react";
import api from "../src/services/api"; // Ensure this import path is correct
import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKS_CACHE_KEY = 'cached_books_list';

export const BooksContext = createContext();

export function BooksProvider({ children }) {
    const [books, setBooks] = useState([]);
    const [isFetching, setIsFetching] = useState(false);

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

    // Initial fetch from server
    useEffect(() => {
        fetchBooks();
    }, []);

    async function fetchBooks() {
        setIsFetching(true);
        try {
            // Replace with your Django endpoint for books
            const response = await api.get('api/books/'); 
            
            setBooks(response.data);
            // Save to local storage for offline use
            await AsyncStorage.setItem(BOOKS_CACHE_KEY, JSON.stringify(response.data));
        } catch (error) {
            console.log("Books fetch failed (using cache if available):", error.message);
        } finally {
            setIsFetching(false);
        }
    }

    async function createBook(data) {
        // Django handles user association on the backend via the Token/User model
        try {
            const response = await api.post('pdf-books/', data);
            await fetchBooks(); // Refresh list after creation
            return response.data;
        } catch (error) {
            console.error("Creation error:", error.response?.data || error.message);
            throw error;
        }
    }

    async function deleteBook(id) {
        try {
            await api.delete(`pdf-books/${id}/`);
            // Update local state
            setBooks((prev) => prev.filter((b) => b.id !== id));
            // Update cache
            const updatedBooks = books.filter((b) => b.id !== id);
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