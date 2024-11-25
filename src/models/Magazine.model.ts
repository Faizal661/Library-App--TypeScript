import mongoose from 'mongoose';
import { Item, IItem } from './Item.model';

export interface IMagazine extends IItem {
    type: "magazine";
    publisher: string;
    issueNumber: string;
    publicationDate: Date;
    isBorrowed: boolean;
}

const magazineSchema = new mongoose.Schema<IMagazine>({
    publisher: { type: String, required: true },
    issueNumber: { type: String, required: true, unique: true },
    publicationDate: { type: Date, required: true },
    isBorrowed: { type: Boolean, default: false }
});

export const Magazine = Item.discriminator<IMagazine>('magazine', magazineSchema);