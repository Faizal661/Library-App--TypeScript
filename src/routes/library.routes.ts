import { Router } from 'express';
import { LibraryController } from '../controllers/library.controller';

const libraryController = new LibraryController();
const router = Router();

router.get('/', libraryController.renderIndex);
router.get('/items/create', libraryController.renderCreate);
router.get('/items/:id/edit', libraryController.renderEdit);
router.get('/items/:id', libraryController.renderShow);

router.post('/items', libraryController.addItem);
router.post('/items/:id', libraryController.updateItem);
router.post('/items/:id/delete', libraryController.deleteItem);
router.post('/items/:id/borrow', libraryController.borrowItem);
router.post('/items/:id/return', libraryController.returnItem);

export default router;
