import { Db, MongoClient } from 'mongodb';

export const mongoClient = {
  client: undefined as unknown as MongoClient,
  db: undefined as unknown as Db,

  async connect(): Promise<void> {
    const url = process.env.MONGODB_URL as string;
    const username = process.env.MONGODB_USERNAME;
    const password = process.env.MONGODB_PASSWORD;

    const client = new MongoClient(url, {
      auth: {
        password,
        username,
      },
    });

    const db = client.db('match4action-db');

    this.client = client;
    this.db = db;

    console.log('connected to mongodb!');
  },
};
