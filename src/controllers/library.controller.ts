import { Request, Response } from 'express';
import { LibraryService } from '../services/library.service';

export class LibraryController {
  private libraryService: LibraryService;

  constructor() {
    this.libraryService = new LibraryService();
    this.renderIndex = this.renderIndex.bind(this);
    this.renderCreate = this.renderCreate.bind(this);
    this.addItem = this.addItem.bind(this);
    this.borrowItem=this.borrowItem.bind(this);
    this.returnItem=this.returnItem.bind(this)
  }
  
  async renderIndex(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.libraryService.getAllItems();
      res.render('items/index', {items});
    } catch (error) {
      res.status(500).render('error', { error: 'Error fetching items' });
    }
  }

  async renderCreate(req: Request, res: Response): Promise<void> {
    try {
      res.render('items/create')
    } catch (error) {
      res.status(500).render('error', { error: 'Error fetching item' });
    }
  }


  async addItem(req: Request, res: Response): Promise<void> {
    try {
      const { itemType, ...itemData } = req.body;
      let transformedData;

      if (itemType === 'Book') {
        transformedData = {
          ...itemData,
          type: 'book', 
          publishedYear: parseInt(itemData.publishedYear, 10),
          isBorrowed: false
        };
      } else if (itemType === 'Magazine') {
        transformedData = {
          ...itemData,
          type: 'magazine', 
          publicationDate: new Date(itemData.publicationDate),
          isBorrowed: false
        };
      } else {
        res.status(400).render('error', { 
          error: 'Invalid Item Type', 
          message: 'Please specify either Book or Magazine as the item type.' 
        });
        return;
      }      
      const savedItem = await this.libraryService.addItem(transformedData);      
      res.redirect('/');

    } catch (error) {
      console.error('Error in addItem:', error);
      if (error instanceof Error) {
        res.status(500).render('error', { error: error.message });
      } else {
        res.status(500).render('error', { error: 'Error adding item' });
      }
    }
  }


  // Delete item
  async deleteItem(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await this.libraryService.deleteItem(req.params.id);
      if (!deleted) {
        res.status(404).render('error', { error: 'Item not found' });
        return;
      }

      res.redirect('/items');
    } catch (error) {
      res.status(500).render('error', { error: 'Error deleting item' });
    }
  }

  async borrowItem(req: Request, res: Response): Promise<void> {
    try {
      const borrowed = await this.libraryService.borrowItem(req.params.id);
      if (!borrowed) {
        res.status(404).render('error', { error: 'Item not found or already borrowed' });
        return;
      }

      res.redirect(`/items/${req.params.id}`);
    } catch (error) {
      res.status(500).render('error', { error: 'Error borrowing item' });
    }
  }

  async returnItem(req: Request, res: Response): Promise<void> {
    try {
      const returned = await this.libraryService.returnItem(req.params.id);
      if (!returned) {
        res.status(404).render('error', { error: 'Item not found or not borrowed' });
        return;
      }

      res.redirect(`/items/${req.params.id}`);
    } catch (error) {
      res.status(500).render('error', { error: 'Error returning item' });
    }
  }
} 