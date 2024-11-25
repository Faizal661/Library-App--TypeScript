import mongoose, { Document } from "mongoose";
import { BaseItem } from "./interfaces";

export interface IItem extends Document {
    title: string;
    type: "book" | "magazine";
}

const itemSchema = new mongoose.Schema<IItem>(
    {
        title: { type: String, required: true },
        type: { type: String, enum: ["book", "magazine"], required: true },
    },
    {
        timestamps: true,
        discriminatorKey: 'type'
    }
);

export const Item = mongoose.model<IItem>("Item", itemSchema);