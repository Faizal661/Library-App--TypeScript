import { Request, Response } from 'express';
import { LibraryService } from '../services/library.service';
import { Book } from '../models/Book.model';
import { Magazine } from '../models/Magazine.model';

export class LibraryController {
  private libraryService: LibraryService;

  constructor() {
    this.libraryService = new LibraryService();
    this.renderIndex = this.renderIndex.bind(this);
    this.renderCreate = this.renderCreate.bind(this);
    this.renderEdit = this.renderEdit.bind(this);
    this.renderShow = this.renderShow.bind(this);
    this.addItem = this.addItem.bind(this);
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
      console.log('Received data:', req.body);

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
        res.status(400).render('layouts/main', { 
          body: 'error', 
          error: 'Invalid Item Type', 
          message: 'Please specify either Book or Magazine as the item type.' 
        });
        return;
      }

      console.log('Transformed data:', transformedData);
      
      const savedItem = await this.libraryService.addItem(transformedData);
      console.log('Saved item:', savedItem);
      
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

  async updateItem(req: Request, res: Response): Promise<void> {
    try {
      const { itemType, ...itemData } = req.body;
      console.log('Update data received:', req.body);

      if (!['Book', 'Magazine'].includes(itemType)) {
        res.status(400).render('error', { error: 'Invalid item type' });
        return;
      }

      // Transform the data similar to addItem
      const transformedData = {
        ...itemData,
        type: itemType.toLowerCase(),
        ...(itemType === 'Book' && {
          publishedYear: parseInt(itemData.publishedYear, 10)
        }),
        ...(itemType === 'Magazine' && {
          publicationDate: new Date(itemData.publicationDate)
        })
      };

      const updatedItem = await this.libraryService.updateItem(req.params.id, transformedData);
      if (!updatedItem) {
        res.status(404).render('error', { error: 'Item not found' });
        return;
      }

      res.redirect(`/items/${req.params.id}`);
    } catch (error) {
      console.error('Error in updateItem:', error);
      if (error instanceof Error) {
        res.status(500).render('error', { error: error.message });
      } else {
        res.status(500).render('error', { error: 'Error updating item' });
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