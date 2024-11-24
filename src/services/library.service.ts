import { Book, IBook } from '../models/Book.model';
import { Magazine, IMagazine } from '../models/Magazine.model';

export class LibraryService {

  private handleError(error: unknown, context: string): never {
    if (error instanceof Error) {
      throw new Error(`${context}: ${error.message}`);
    } else if (typeof error === 'string') {
      throw new Error(`${context}: ${error}`);
    } else {
      throw new Error(`${context}: An unknown error occurred`);
    }
  }

 // Get all items
 async getAllItems(): Promise<(IBook | IMagazine)[]> {
  console.log('getAll items working')

  try {
    const books = await Book.find();
    const magazines = await Magazine.find();
    return [...books, ...magazines];
  } catch (error) {
    this.handleError(error, 'Error fetching items');
    throw error; 
  }
}

async getItemById(id: string): Promise<IBook | IMagazine | null> {
  try {
    const book = await Book.findById(id);
    if (book) return book;

    const magazine = await Magazine.findById(id);
    return magazine;
  } catch (error) {
    this.handleError(error, 'Error finding item');
    throw error;
  }
}

// Add item
async addItem(item: IBook | IMagazine): Promise<IBook | IMagazine> {
  try {
    console.log('library services reached.')
    let savedItem: IBook | IMagazine;

    if ('author' in item) {
      savedItem = await new Book(item).save();
    } else if ('issueNumber' in item) {
      savedItem = await new Magazine(item).save();
    } else {
      throw new Error('Invalid item type');
    }
    console.log('services saved',savedItem)

    return savedItem;
  } catch (error) {
    this.handleError(error, 'Error adding item');
    throw error;
  }
} 

// Update item
async updateItem(id: string, itemData: Partial<IBook | IMagazine>): Promise<IBook | IMagazine | null> {
  try {
    const book = await Book.findByIdAndUpdate(id, itemData, { new: true });
    if (book) return book;

    const magazine = await Magazine.findByIdAndUpdate(id, itemData, { new: true });
    return magazine;
  } catch (error) {
    this.handleError(error, 'Error updating item');
    throw error;
  }
}

// Delete item
async deleteItem(id: string): Promise<boolean> {
  try {
    const book = await Book.findByIdAndDelete(id);
    if (book) return true;

    const magazine = await Magazine.findByIdAndDelete(id);
    return !!magazine;
  } catch (error) {
    this.handleError(error, 'Error deleting item');
    throw error;
  }
}

// Borrow item
async borrowItem(id: string): Promise<IBook | IMagazine | null> {
  try {
    const book = await Book.findById(id);
    if (book && !book.isBorrowed) {
      book.isBorrowed = true;
      return await book.save();
    }

    const magazine = await Magazine.findById(id);
    if (magazine && !magazine.isBorrowed) {
      magazine.isBorrowed = true;
      return await magazine.save();
    }

    return null;
  } catch (error) {
    this.handleError(error, 'Error borrowing item');
    throw error;
  }
}

// Return item
async returnItem(id: string): Promise<IBook | IMagazine | null> {
  try {
    const book = await Book.findById(id);
    if (book && book.isBorrowed) {
      book.isBorrowed = false;
      return await book.save();
    }

    const magazine = await Magazine.findById(id);
    if (magazine && magazine.isBorrowed) {
      magazine.isBorrowed = false;
      return await magazine.save();
    }

    return null;
  } catch (error) {
    this.handleError(error, 'Error returning item');
    throw error;
  }
}
}

export default new LibraryService();