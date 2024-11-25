import mongoose from 'mongoose';
import { Item, IItem } from './Item.model';

export interface IBook extends IItem {
    type: "book";
    author: string;
    isbn: string;
    publishedYear: number;
    genre: string;
    isBorrowed: boolean;
}

const bookSchema = new mongoose.Schema<IBook>({
    author: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    publishedYear: { type: Number, required: true },
    genre: { type: String, required: true },
    isBorrowed: { type: Boolean, default: false }
});

export const Book = Item.discriminator<IBook>('book', bookSchema);
