const request = require('supertest');
const app = require('../app'); 

beforeAll(() => {
  server = app.listen(3000); // Start the server before executing tests
});

afterAll((done) => {
  server.close(done); // Stop the server after executing tests
});

describe('Auth/Login API Contract Tests', () => {
  it('sucessfull login should return 200', async () => {
    const credentials = {
      "email":"alessandra@test.com",
      "password": "123456"
    }
    const response = await request(app).post('/auth/login').send(credentials);

    expect(response.status).toBe(200);
    expect(response.type).toEqual('application/json')
    expect(response.body.success).toEqual(true); 
  });
 
  it('unsucessfull login should return 404', async () => {
    const credentials = {
      "email":"alessandra@test.com",
      "password": "1234566"
    }
    const response = await request(app).post('/auth/login').send(credentials);

    expect(response.status).toBe(404);
    expect(response.type).toEqual('application/json')
    expect(response.body.success).toEqual(false); 
  });

  it('invalid request body should return 400', async () => {
    const credentials = {
      "email":"alessandra@test.com"
    }
    const response = await request(app).post('/auth/login').send(credentials);

    expect(response.status).toBe(400);
    expect(response.type).toEqual('application/json')
    expect(response.body.success).toEqual(false); 
  });
});


describe('Auth/Register API Contract Tests', () => {
  it('sucessfull registration should', async () => {
    const response = await request(app).get('/api/invalid-endpoint');

    expect(response.status).toBe(404); // Verifique se a resposta para um endpoint inválido retorna o código 404
  });
});


//Testar:
//router.post("/register", register);

//Login -> sucesso / login inválido/ senha inválida OK
//router.post("/login", login);

//router.post("/logout", logout);
//router.post("/refreshToken", refreshToken);
//router.get(
  //"/google",
  //passport.authenticate("google", {
   // scope: ["email", "profile"],
  //})
//);

//router.get("/google/redirect", passport.authenticate("google"), google);