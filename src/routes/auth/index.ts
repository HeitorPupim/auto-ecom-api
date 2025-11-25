import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma';
import { handleMercadoLibreCallback, getMercadoLibreAuthUrl } from './mercadolibre';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post('/auth/register', async (request, reply) => {
    try {
      const { email, password, name } = registerSchema.parse(request.body);

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return reply.code(400).send({ error: 'User already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
        },
      });

      // Generate token
      const token = fastify.jwt.sign({ id: user.id, email: user.email });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.issues });
      }
      console.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Login
  fastify.post('/auth/login', async (request, reply) => {
    try {
      const { email, password } = loginSchema.parse(request.body);

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.passwordHash);

      if (!isValid) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = fastify.jwt.sign({ id: user.id, email: user.email });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.issues });
      }
      console.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Me (Protected)
  fastify.get('/auth/me', {
    onRequest: [async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    }]
  }, async (request, reply) => {
    const { id } = request.user as { id: string };

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    return user;
  });

  // MercadoLibre Callback
  fastify.get('/auth/callback/mercadolibre', handleMercadoLibreCallback);

  // Get MercadoLibre Auth URL
  fastify.get('/auth/mercadolibre/url', getMercadoLibreAuthUrl);
}
