import { Router } from 'express';
import { LibraryController } from '../controllers/library.controller';

const libraryController = new LibraryController();
const router = Router();

router.get('/', libraryController.renderIndex);
router.get('/items/create', libraryController.renderCreate);

router.post('/items', libraryController.addItem);
router.post('/items/delete/:id', libraryController.deleteItem);
router.post('/items/borrow/:id', libraryController.borrowItem);
router.post('/items/return/:id', libraryController.returnItem);

export default router;