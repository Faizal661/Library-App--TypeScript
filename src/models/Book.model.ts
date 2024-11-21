import mongoose from 'mongoose';
import { IItem } from './Item.model';

export interface IBook extends IItem {
  author: string;
  isbn: string;
  publishedYear: number;
  genre: string;
  isBorrowed?: boolean;
}

const bookSchema = new mongoose.Schema<IBook>({
  title: { type: String, required: true },
  type: { type: String, default: 'book' },
  author: { type: String, required: true },
  isbn: { type: String, required: true, unique: true },
  publishedYear: { type: Number, required: true },
  genre: { type: String, required: true },
  isBorrowed: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const Book = mongoose.model<IBook>('Book', bookSchema);
