const request = require('supertest');
const app = require('../app'); 


beforeAll(() => {
  server = app.listen(3000); // Start the server before executing tests
});

afterAll((done) => {
  server.close(done); // Stop the server after executing tests
});

//TODO Validar o schema de retorno

describe('Initiatives API Contract Tests', () => {
  it('sucessfull get should return 200', async () => {
    const response = await request(app).get('/initiatives')

    expect(response.status).toBe(200);
    expect(response.type).toEqual('application/json')
    expect(response.body.success).toEqual(true); 
  });
});



describe('Initiatives API Contract Tests', () => {
  it('sucessfull get by id should return 200', async () => {
    id = '63f2e7adc5a48948e1dab8f5'
    const response = await request(app).get('/initiatives/' + '63f2e7adc5a48948e1dab8f5')

    expect(response.status).toBe(200);
    expect(response.type).toEqual('application/json')
    expect(response.body.success).toEqual(true); 
  });
});