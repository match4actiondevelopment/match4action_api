import { config } from 'dotenv';
import express from 'express';
import { GetUsersController } from './controllers/get-users';
import { GetUsersRepository } from './repositories/get-users';

config();
const app = express();

const port = process.env.PORT || 3003;

app.get('/users', async (req, res) => {
  const getUsersRepository = new GetUsersRepository();
  const getUsersControllers = new GetUsersController(getUsersRepository);
  const { body, statusCode } = await getUsersControllers.handle();
  res.send(body).status(statusCode);
});

app.listen(port, () => console.log(`listening on port: ${port}`));
