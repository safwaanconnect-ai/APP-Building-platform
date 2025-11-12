import express from 'express';
import { applicationService } from '../services/applications';
import { validate, schemas } from '../middleware/validation';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../index';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create new application
router.post('/', validate(schemas.applicationCreate), async (req: AuthRequest, res) => {
  try {
    const application = await applicationService.createApplication({
      ...req.body,
      userId: req.user!.id
    });

    res.status(201).json({
      success: true,
      data: application,
      message: 'Application created successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get user's applications with pagination
router.get('/', async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await applicationService.getApplications(
      req.user!.id,
      page,
      limit
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get application statistics
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const stats = await applicationService.getApplicationStats(req.user!.id);

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single application
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const application = await applicationService.getApplication(
      req.params.id,
      req.user!.id
    );

    res.json({
      success: true,
      data: application
    });
  } catch (error: any) {
    if (error.message === 'Application not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update application
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const application = await applicationService.updateApplication(
      req.params.id,
      req.user!.id,
      req.body
    );

    res.json({
      success: true,
      data: application,
      message: 'Application updated successfully'
    });
  } catch (error: any) {
    if (error.message === 'Application not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Delete application
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const result = await applicationService.deleteApplication(
      req.params.id,
      req.user!.id
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    if (error.message === 'Application not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clone application
router.post('/:id/clone', async (req: AuthRequest, res) => {
  try {
    const { newName } = req.body;

    if (!newName || newName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'New application name is required (minimum 2 characters)'
      });
    }

    const clonedApplication = await applicationService.cloneApplication(
      req.params.id,
      req.user!.id,
      newName.trim()
    );

    res.status(201).json({
      success: true,
      data: clonedApplication,
      message: 'Application cloned successfully'
    });
  } catch (error: any) {
    if (error.message === 'Application not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Deploy application (placeholder for deployment logic)
router.post('/:id/deploy', async (req: AuthRequest, res) => {
  try {
    const { environment, config } = req.body;

    if (!['development', 'staging', 'production'].includes(environment)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid environment. Must be development, staging, or production'
      });
    }

    // Create deployment record
    const deployment = await prisma.deployment.create({
      data: {
        applicationId: req.params.id,
        environment,
        status: 'pending',
        url: `https://${req.params.id}-${environment}.saas-builder.com`
      }
    });

    // In a real implementation, this would trigger the actual deployment process
    // For now, we'll just create the record and update the application status
    await prisma.application.update({
      where: { id: req.params.id },
      data: { status: environment }
    });

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

// Get deployment history
router.get('/:id/deployments', async (req: AuthRequest, res) => {
  try {
    // First verify user owns the application
    const application = await prisma.application.findFirst({
      where: {
        id: req.params.id,
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
      where: { applicationId: req.params.id },
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

export default router;