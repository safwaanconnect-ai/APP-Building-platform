import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { prisma } from '../index';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create new API endpoint
router.post('/endpoints', validate(schemas.apiEndpointCreate), async (req: AuthRequest, res) => {
  try {
    const { applicationId, path, method, schema, authenticationRequired, rateLimit } = req.body;

    // Verify user owns the application
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: req.user!.id
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Check if endpoint already exists
    const existingEndpoint = await prisma.apiEndpoint.findFirst({
      where: {
        applicationId,
        path,
        method
      }
    });

    if (existingEndpoint) {
      return res.status(400).json({
        success: false,
        error: 'Endpoint with this path and method already exists'
      });
    }

    const endpoint = await prisma.apiEndpoint.create({
      data: {
        applicationId,
        path,
        method,
        schema,
        authenticationRequired: authenticationRequired !== false,
        rateLimit
      }
    });

    res.status(201).json({
      success: true,
      data: endpoint,
      message: 'API endpoint created successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get endpoints for an application
router.get('/endpoints/application/:applicationId', async (req: AuthRequest, res) => {
  try {
    const { applicationId } = req.params;

    // Verify user owns the application
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: req.user!.id
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    const endpoints = await prisma.apiEndpoint.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: endpoints
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single endpoint
router.get('/endpoints/:id', async (req: AuthRequest, res) => {
  try {
    const endpoint = await prisma.apiEndpoint.findFirst({
      where: { id: req.params.id },
      include: {
        application: true
      }
    });

    if (!endpoint || endpoint.application.userId !== req.user!.id) {
      return res.status(404).json({
        success: false,
        error: 'Endpoint not found'
      });
    }

    res.json({
      success: true,
      data: endpoint
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update endpoint
router.put('/endpoints/:id', async (req: AuthRequest, res) => {
  try {
    // Get the endpoint and verify ownership
    const endpoint = await prisma.apiEndpoint.findFirst({
      where: { id: req.params.id },
      include: {
        application: true
      }
    });

    if (!endpoint || endpoint.application.userId !== req.user!.id) {
      return res.status(404).json({
        success: false,
        error: 'Endpoint not found'
      });
    }

    const { path, method, schema, authenticationRequired, rateLimit } = req.body;

    // Check if new path/method conflicts with existing endpoint
    if (path || method) {
      const conflictEndpoint = await prisma.apiEndpoint.findFirst({
        where: {
          applicationId: endpoint.applicationId,
          path: path || endpoint.path,
          method: method || endpoint.method,
          id: { not: req.params.id }
        }
      });

      if (conflictEndpoint) {
        return res.status(400).json({
          success: false,
          error: 'Endpoint with this path and method already exists'
        });
      }
    }

    const updatedEndpoint = await prisma.apiEndpoint.update({
      where: { id: req.params.id },
      data: {
        ...(path && { path }),
        ...(method && { method }),
        ...(schema && { schema }),
        ...(authenticationRequired !== undefined && { authenticationRequired }),
        ...(rateLimit !== undefined && { rateLimit })
      }
    });

    res.json({
      success: true,
      data: updatedEndpoint,
      message: 'API endpoint updated successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Delete endpoint
router.delete('/endpoints/:id', async (req: AuthRequest, res) => {
  try {
    // Get the endpoint and verify ownership
    const endpoint = await prisma.apiEndpoint.findFirst({
      where: { id: req.params.id },
      include: {
        application: true
      }
    });

    if (!endpoint || endpoint.application.userId !== req.user!.id) {
      return res.status(404).json({
        success: false,
        error: 'Endpoint not found'
      });
    }

    await prisma.apiEndpoint.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'API endpoint deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate OpenAPI documentation for an application
router.get('/docs/application/:applicationId', async (req: AuthRequest, res) => {
  try {
    const { applicationId } = req.params;

    // Verify user owns the application
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: req.user!.id
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    const endpoints = await prisma.apiEndpoint.findMany({
      where: { applicationId },
      orderBy: { path: 'asc' }
    });

    // Generate OpenAPI spec
    const openApiSpec = {
      openapi: '3.0.0',
      info: {
        title: `${application.name} API`,
        version: '1.0.0',
        description: application.description || `Generated API for ${application.name}`
      },
      servers: [
        {
          url: `https://${application.slug}-production.saas-builder.com/api`,
          description: 'Production server'
        }
      ],
      paths: endpoints.reduce((paths, endpoint) => {
        const path = endpoint.path;
        const method = endpoint.method.toLowerCase();

        if (!paths[path]) {
          paths[path] = {};
        }

        paths[path][method] = {
          summary: `${method.toUpperCase()} ${path}`,
          description: 'Generated endpoint',
          tags: [path.split('/')[1] || 'default'],
          ...(endpoint.authenticationRequired && {
            security: [{ bearerAuth: [] }]
          }),
          parameters: [],
          responses: {
            '200': {
              description: 'Successful response'
            },
            '400': {
              description: 'Bad request'
            },
            '401': {
              description: 'Unauthorized'
            },
            '500': {
              description: 'Internal server error'
            }
          }
        };

        return paths;
      }, {} as any),
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    };

    res.json({
      success: true,
      data: openApiSpec
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;