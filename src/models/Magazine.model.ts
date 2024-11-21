import mongoose from 'mongoose';
import { IItem } from './Item.model';

export interface IMagazine extends IItem {
  issueNumber: number;
  publisher: string;
  publicationDate: Date;
  isBorrowed?: boolean;
}

const magazineSchema = new mongoose.Schema<IMagazine>({
  title: { type: String, required: true },
  type: { type: String, default: 'magazine' },
  issueNumber: { type: Number, required: true },
  publisher: { type: String, required: true },
  publicationDate: { type: Date, required: true },
  isBorrowed: { type: Boolean, default: false },
}, {
  timestamps: true
});

export const Magazine = mongoose.model<IMagazine>('Magazine', magazineSchema);