import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { prisma } from '../index';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create new database schema
router.post('/', validate(schemas.schemaCreate), async (req: AuthRequest, res) => {
  try {
    const { applicationId, schemaDefinition, version } = req.body;

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

    // Get the latest version if not specified
    let nextVersion = version || 1;
    if (!version) {
      const latestSchema = await prisma.databaseSchema.findFirst({
        where: { applicationId },
        orderBy: { version: 'desc' }
      });
      nextVersion = latestSchema ? latestSchema.version + 1 : 1;
    }

    const schema = await prisma.databaseSchema.create({
      data: {
        applicationId,
        schemaDefinition,
        version: nextVersion,
        migrationStatus: 'pending'
      }
    });

    res.status(201).json({
      success: true,
      data: schema,
      message: 'Database schema created successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get schemas for an application
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

    const schemas = await prisma.databaseSchema.findMany({
      where: { applicationId },
      orderBy: { version: 'desc' }
    });

    res.json({
      success: true,
      data: schemas
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get latest schema for an application
router.get('/application/:applicationId/latest', async (req: AuthRequest, res) => {
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

    const schema = await prisma.databaseSchema.findFirst({
      where: { applicationId },
      orderBy: { version: 'desc' }
    });

    if (!schema) {
      return res.status(404).json({
        success: false,
        error: 'No schema found for this application'
      });
    }

    res.json({
      success: true,
      data: schema
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update schema migration status
router.patch('/:id/migration-status', async (req: AuthRequest, res) => {
  try {
    const { migrationStatus } = req.body;

    if (!['pending', 'in_progress', 'completed', 'failed'].includes(migrationStatus)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid migration status'
      });
    }

    // Get the schema and verify ownership
    const schema = await prisma.databaseSchema.findFirst({
      where: { id: req.params.id },
      include: {
        application: true
      }
    });

    if (!schema || schema.application.userId !== req.user!.id) {
      return res.status(404).json({
        success: false,
        error: 'Schema not found'
      });
    }

    const updatedSchema = await prisma.databaseSchema.update({
      where: { id: req.params.id },
      data: { migrationStatus }
    });

    res.json({
      success: true,
      data: updatedSchema,
      message: 'Migration status updated successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Delete schema
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    // Get the schema and verify ownership
    const schema = await prisma.databaseSchema.findFirst({
      where: { id: req.params.id },
      include: {
        application: true
      }
    });

    if (!schema || schema.application.userId !== req.user!.id) {
      return res.status(404).json({
        success: false,
        error: 'Schema not found'
      });
    }

    // Don't allow deletion if it's the only schema
    const schemaCount = await prisma.databaseSchema.count({
      where: { applicationId: schema.applicationId }
    });

    if (schemaCount === 1) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete the only schema for an application'
      });
    }

    await prisma.databaseSchema.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Schema deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;