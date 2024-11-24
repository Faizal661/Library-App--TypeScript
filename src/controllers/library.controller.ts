import { Request, Response } from 'express';
import { LibraryService } from '../services/library.service';
import { Book } from '../models/Book.model';
import { Magazine } from '../models/Magazine.model';

export class LibraryController {
  private libraryService: LibraryService;
  constructor() {
    this.libraryService = new LibraryService();
  }
  
  // Render index page
  async renderIndex(req: Request, res: Response): Promise<void> {
    // console.log('isdklfjlksadjf=>')
    try {
      const items = await this.libraryService.getAllItems();
      console.log('items=>',items)
      res.render('items/index', { 
        items
      });
    } catch (error) {
      res.status(500).render('error', { error: 'Error fetching items' });
    }
  }

  // Render create page
  async renderCreate(req: Request, res: Response): Promise<void> {
    try {
      res.render('items/create')
    } catch (error) {
      res.status(500).render('error', { error: 'Error fetching item' });
    }
  }
    

  // Render edit page
  async renderEdit(req: Request, res: Response): Promise<void> {
    try {
      const item = await this.libraryService.getItemById(req.params.id);
      if (!item) {
        res.status(404).render('error', { error: 'Item not found' });
        return;
      }
      res.render('items/edit', { item });
    } catch (error) {
      res.status(500).render('error', { error: 'Error fetching item' });
    }
  }

  async renderShow(req: Request, res: Response): Promise<void> {
    try {
      const item = await this.libraryService.getItemById(req.params.id);
      if (!item) {
        res.status(404).render('layouts/main', { 
          body: 'error', 
          error: 'Item Not Found', 
          message: 'The requested item does not exist.' 
        });
        return;
      }
      res.render('layouts/main', { 
        body: 'items/show', 
        title: `Details of ${item.title}`, 
        item 
      });
    } catch (error) {
      res.status(500).render('error', { error: 'Error fetching item' });
    }
  }
  

  async addItem(req: Request, res: Response): Promise<void> {
    try {
      const { itemType, ...itemData } = req.body;
      console.log(req.body)
      let item;
  
      if (itemType === 'Book') {
        item = new Book(itemData);
      } else if (itemType === 'Magazine') {
        item = new Magazine(itemData);
      } else {
        res.status(400).render('layouts/main', { 
          body: 'error', 
          error: 'Invalid Item Type', 
          message: 'Please specify either Book or Magazine as the item type.' 
        });
        return;
      }
      console.log('before calling library service')
      await this.libraryService.addItem(item);
      res.redirect('/items');
    } catch (error) {
      res.status(500).render('error', { error: 'Error fetching item' });
    }
  }
  

  // Update item
  async updateItem(req: Request, res: Response): Promise<void> {
    try {
      const { itemType, ...itemData } = req.body;

      if (!['Book', 'Magazine'].includes(itemType)) {
        res.status(400).render('error', { error: 'Invalid item type' });
        return;
      }

      const updatedItem = await this.libraryService.updateItem(req.params.id, itemData);
      if (!updatedItem) {
        res.status(404).render('error', { error: 'Item not found' });
        return;
      }

      res.redirect(`/items/${req.params.id}`);
    } catch (error) {
      res.status(500).render('error', { error: 'Error updating item' });
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

  // Borrow item
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

  // Return item
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