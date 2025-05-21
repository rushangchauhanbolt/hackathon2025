import Fastify from 'fastify';

const server = Fastify();

server.get('/ping', async (request, reply) => {
  return { message: 'Server is alive!' };
});

server.post('/submit', async (request, reply) => {
  const data = request.body;
  return { message: 'Data received', received: data };
});

const port = Number(process.env.PORT || 3000);

server.listen({ port, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});