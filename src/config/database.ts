import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

class Database {
  private static instance: Database;
  private connectionString: string;

  private constructor() {
    this.connectionString =  'mongodb://127.0.0.1:27017/LibraryApp';
    // console.log(this.connectionString)
  }


  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    try {
      mongoose.set('strictQuery', true);
      await mongoose.connect(this.connectionString, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4 
      });
      console.log('Successfully connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', this.handleError(error));
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', this.handleError(error));
    }
  }

  private handleError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    } else if (typeof error === 'string') {
      return error;
    } else {
      return 'An unknown error occurred';
    }
  }
}

export default Database;