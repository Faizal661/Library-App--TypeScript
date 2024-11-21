// src/app.ts
import express from 'express';
import path from 'path';
import methodOverride from 'method-override';
import Database from './config/database';
import libraryRoutes from './routes/library.routes';

class App {
  public app: express.Application;
  private database: Database;

  constructor() {
    this.app = express();
    this.database = Database.getInstance();
    this.initializeMiddlewares();
    this.setupViewEngine();  
    this.initializeRoutes();
    this.start()
  }

  private initializeMiddlewares(): void {
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use(methodOverride('_method'));
    console.log(__dirname)
    this.app.use(express.static(path.join(__dirname, 'public'))); 
  }

  private setupViewEngine(): void {
    this.app.set('views', path.join(__dirname, 'views'));
    this.app.set('view engine', 'ejs');
  }

  private initializeRoutes(): void {
    console.log('before')

    this.app.use('/', libraryRoutes);
 
    this.app.use((req, res) => {
      res.status(404).render('error', {
        error: 'Page Not Found',
        message: 'The page you are looking for does not exist.'
      });
    });

    // Error handler middleware
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Error:', err);
      res.status(500).render('error', {
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
      });
    });
  }

  public async start(port: number = 3000): Promise<void> {
    try {
      await this.database.connect();
      this.app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
      });
    } catch (error) {
      console.error('Failed to start the application:', error);
      process.exit(1);
    }
  }
}

export default new App();