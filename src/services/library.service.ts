import { Book, IBook } from '../models/Book.model';
import { Magazine, IMagazine } from '../models/Magazine.model';
import { Item, IItem } from '../models/Item.model';
import mongoose from 'mongoose';

// Define types for creating new items (without Document properties)
type CreateBookInput = Omit<IBook, keyof mongoose.Document | '_id'>;
type CreateMagazineInput = Omit<IMagazine, keyof mongoose.Document | '_id'>;
type CreateItemInput = CreateBookInput | CreateMagazineInput;

// Define type for update operations
type UpdateItemInput = Partial<CreateItemInput>;

export class LibraryService {
  private handleError(error: unknown, context: string): never {
    console.error(`Error in ${context}:`, error);
    if (error instanceof Error) {
      throw new Error(`${context}: ${error.message}`);
    } else if (typeof error === 'string') {
      throw new Error(`${context}: ${error}`);
    } else {
      throw new Error(`${context}: An unknown error occurred`);
    }
  }

  private validateBookData(item: CreateBookInput): void {
    const requiredFields = ['title', 'author', 'isbn', 'publishedYear', 'genre'] as const;
    const missingFields = requiredFields.filter(field => !item[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  private validateMagazineData(item: CreateMagazineInput): void {
    const requiredFields = ['title', 'publisher', 'issueNumber', 'publicationDate'] as const;
    const missingFields = requiredFields.filter(field => !item[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  // Get all items
  async getAllItems(): Promise<IItem[]> {
    try {
      const items = await Item.find().exec();
      console.log('Retrieved items:', items);
      return items;
    } catch (error) {
      this.handleError(error, 'Error fetching items');
    }
  }

  // Get item by ID
  async getItemById(id: string): Promise<IItem | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
      }
      
      const item = await Item.findById(id).exec();
      console.log(`Retrieved item with ID ${id}:`, item);
      return item;
    } catch (error) {
      this.handleError(error, 'Error finding item');
    }
  }

  // Add item
  async addItem(itemData: CreateItemInput): Promise<IItem> {
    console.log('Adding new item:', JSON.stringify(itemData, null, 2));
    try {
      let newItem: mongoose.Document;

      if (itemData.type === 'book') {
        this.validateBookData(itemData);
        newItem = new Book(itemData);
        const savedItem = await newItem.save();
      } else if (itemData.type === 'magazine') {
        this.validateMagazineData(itemData);
        newItem = new Magazine(itemData);
        const savedItem = await newItem.save();
      } else {
        throw new Error('Invalid item type');
      }

      const savedItem = await newItem.save();
      console.log('Item saved successfully:', savedItem);
      return savedItem as IItem;
    } catch (error) {
      this.handleError(error, 'Error adding item');
    }
  }

  // Update item
  async updateItem(id: string, itemData: UpdateItemInput): Promise<IItem | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
      }

      const existingItem = await Item.findById(id).exec();
      if (!existingItem) {
        throw new Error('Item not found');
      }

      // Type guard to check item type
      if (existingItem.type === 'book' && this.isBookData(itemData)) {
        this.validateBookData({ ...existingItem.toObject(), ...itemData });
      } else if (existingItem.type === 'magazine' && this.isMagazineData(itemData)) {
        this.validateMagazineData({ ...existingItem.toObject(), ...itemData });
      }

      const updatedItem = await Item.findByIdAndUpdate(
        id,
        { $set: itemData },
        { new: true, runValidators: true }
      ).exec();
      
      console.log('Item updated successfully:', updatedItem);
      return updatedItem;
    } catch (error) {
      this.handleError(error, 'Error updating item');
    }
  }

  // Type guards for update validation
  private isBookData(data: UpdateItemInput): data is Partial<CreateBookInput> {
    return 'type' in data && data.type === 'book';
  }

  private isMagazineData(data: UpdateItemInput): data is Partial<CreateMagazineInput> {
    return 'type' in data && data.type === 'magazine';
  }

  // Delete item
  async deleteItem(id: string): Promise<boolean> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
      }

      const result = await Item.findByIdAndDelete(id).exec();
      const success = !!result;
      console.log(`Item deletion ${success ? 'successful' : 'failed'} for ID: ${id}`);
      return success;
    } catch (error) {
      this.handleError(error, 'Error deleting item');
    }
  }

  // Borrow item
  async borrowItem(id: string): Promise<IItem | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
      }

      const item = await Item.findById(id).exec();
      if (!item) {
        throw new Error('Item not found');
      }

      if (item.get('isBorrowed')) {
        throw new Error('Item is already borrowed');
      }

      item.set('isBorrowed', true);
      const updatedItem = await item.save();
      console.log('Item borrowed successfully:', updatedItem);
      return updatedItem;
    } catch (error) {
      this.handleError(error, 'Error borrowing item');
    }
  }

  // Return item
  async returnItem(id: string): Promise<IItem | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
      }

      const item = await Item.findById(id).exec();
      if (!item) {
        throw new Error('Item not found');
      }

      if (!item.get('isBorrowed')) {
        throw new Error('Item is not currently borrowed');
      }

      item.set('isBorrowed', false);
      const updatedItem = await item.save();
      console.log('Item returned successfully:', updatedItem);
      return updatedItem;
    } catch (error) {
      this.handleError(error, 'Error returning item');
    }
  }

  // Search items by title or type
  async searchItems(query: string): Promise<IItem[]> {
    try {
      const items = await Item.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { type: { $regex: query, $options: 'i' } }
        ]
      }).exec();
      console.log(`Found ${items.length} items matching query: ${query}`);
      return items;
    } catch (error) {
      this.handleError(error, 'Error searching items');
    }
  }
}

export default new LibraryService();