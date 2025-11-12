import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../index';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all deployments for a user
router.get('/', async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const environment = req.query.environment as string;

    const skip = (page - 1) * limit;

    const where: any = {
      application: {
        userId: req.user!.id
      }
    };

    if (environment) {
      where.environment = environment;
    }

    const [deployments, total] = await Promise.all([
      prisma.deployment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          application: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }),
      prisma.deployment.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        deployments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get deployments for a specific application
router.get('/application/:applicationId', async (req: AuthRequest, res) => {
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

    const deployments = await prisma.deployment.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: deployments
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single deployment
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const deployment = await prisma.deployment.findFirst({
      where: { id: req.params.id },
      include: {
        application: {
          select: {
            id: true,
            name: true,
            slug: true,
            userId: true
          }
        }
      }
    });

    if (!deployment || deployment.application.userId !== req.user!.id) {
      return res.status(404).json({
        success: false,
        error: 'Deployment not found'
      });
    }

    res.json({
      success: true,
      data: deployment
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new deployment
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { applicationId, environment, config } = req.body;

    if (!applicationId || !environment) {
      return res.status(400).json({
        success: false,
        error: 'Application ID and environment are required'
      });
    }

    if (!['development', 'staging', 'production'].includes(environment)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid environment. Must be development, staging, or production'
      });
    }

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

    // Check if there's already a running deployment for this environment
    const existingDeployment = await prisma.deployment.findFirst({
      where: {
        applicationId,
        environment,
        status: 'running'
      }
    });

    if (existingDeployment) {
      return res.status(400).json({
        success: false,
        error: `A deployment is already running for ${environment} environment`
      });
    }

    // Create deployment record
    const deployment = await prisma.deployment.create({
      data: {
        applicationId,
        environment,
        status: 'pending',
        url: `https://${application.slug}-${environment}.saas-builder.com`,
        logs: 'Deployment initiated...'
      }
    });

    // In a real implementation, this would trigger the actual deployment process
    // For now, we'll simulate the deployment process
    setTimeout(async () => {
      try {
        await prisma.deployment.update({
          where: { id: deployment.id },
          data: {
            status: 'running',
            logs: 'Deployment completed successfully'
          }
        });

        await prisma.application.update({
          where: { id: applicationId },
          data: { status: environment }
        });
      } catch (error) {
        console.error('Error updating deployment status:', error);
      }
    }, 5000); // Simulate 5 second deployment

    res.status(201).json({
      success: true,
      data: deployment,
      message: `Deployment to ${environment} started successfully`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Stop deployment
router.post('/:id/stop', async (req: AuthRequest, res) => {
  try {
    const deployment = await prisma.deployment.findFirst({
      where: { id: req.params.id },
      include: {
        application: true
      }
    });

    if (!deployment || deployment.application.userId !== req.user!.id) {
      return res.status(404).json({
        success: false,
        error: 'Deployment not found'
      });
    }

    if (deployment.status !== 'running') {
      return res.status(400).json({
        success: false,
        error: 'Only running deployments can be stopped'
      });
    }

    // Update deployment status
    const updatedDeployment = await prisma.deployment.update({
      where: { id: req.params.id },
      data: {
        status: 'stopped',
        logs: deployment.logs + '\nDeployment stopped by user'
      }
    });

    res.json({
      success: true,
      data: updatedDeployment,
      message: 'Deployment stopped successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get deployment logs
router.get('/:id/logs', async (req: AuthRequest, res) => {
  try {
    const deployment = await prisma.deployment.findFirst({
      where: { id: req.params.id },
      include: {
        application: {
          select: {
            id: true,
            name: true,
            slug: true,
            userId: true
          }
        }
      }
    });

    if (!deployment || deployment.application.userId !== req.user!.id) {
      return res.status(404).json({
        success: false,
        error: 'Deployment not found'
      });
    }

    res.json({
      success: true,
      data: {
        deploymentId: deployment.id,
        logs: deployment.logs || 'No logs available',
        status: deployment.status,
        url: deployment.url
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;