import { config } from 'dotenv';
import express from 'express';
import { CreateUserController, GetUsersController } from './controllers/users';
import { mongoClient } from './database/config';
import { CreateUserRepository } from './repositories/create-user';
import { GetUsersRepository } from './repositories/get-users';

const main = async () => {
  config();
  const app = express();

  app.use(express.json());

  const port = process.env.PORT || 3003;
  await mongoClient.connect();

  app.get('/users', async (req, res) => {
    const getUsersRepository = new GetUsersRepository();
    const getUsersControllers = new GetUsersController(getUsersRepository);
    const { body, statusCode } = await getUsersControllers.handle();
    res.status(statusCode).send(body);
  });

  app.post('/users', async (req, res) => {
    const createUserRepository = new CreateUserRepository();
    const createUserControllers = new CreateUserController(createUserRepository);
    const { body, statusCode } = await createUserControllers.handle({ body: req.body });
    console.log(statusCode);
    res.status(statusCode).send(body);
  });

  app.listen(port, () => console.log(`listening on port: ${port}!`));
};

main();
