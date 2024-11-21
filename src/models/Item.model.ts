import mongoose from "mongoose";
import { BaseItem } from "./interfaces";

export interface IItem extends BaseItem {
  type: "book" | "magazine";
}

const itemSchema = new mongoose.Schema<IItem>(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ["book", "magazine"], required: true },
  },
  {
    timestamps: true,
  }
);

export const Item = mongoose.model<IItem>("Item", itemSchema);
