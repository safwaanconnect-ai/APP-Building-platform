import { prisma } from '../index';

interface CreateApplicationInput {
  name: string;
  description?: string;
  userId: string;
  template?: string;
}

interface UpdateApplicationInput {
  name?: string;
  description?: string;
  status?: string;
  domain?: string;
}

class ApplicationService {
  async createApplication(input: CreateApplicationInput) {
    const { name, description, userId, template } = input;

    // Check user's application limit based on subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const existingAppCount = await prisma.application.count({
      where: { userId }
    });

    const limits = {
      'free': 1,
      'pro': 5,
      'enterprise': 999
    };

    const limit = limits[user.subscriptionTier as keyof typeof limits] || 1;

    if (existingAppCount >= limit) {
      throw new Error(`Application limit reached for ${user.subscriptionTier} tier`);
    }

    // Generate unique slug
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.application.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        name,
        description,
        slug,
        userId,
        deploymentConfig: template ? { template } : null
      },
      include: {
        databaseSchemas: {
          orderBy: { version: 'desc' },
          take: 1
        },
        apiEndpoints: true,
        _count: {
          select: {
            databaseSchemas: true,
            apiEndpoints: true
          }
        }
      }
    });

    return application;
  }

  async getApplications(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: {
            select: {
              databaseSchemas: true,
              apiEndpoints: true
            }
          }
        }
      }),
      prisma.application.count({
        where: { userId }
      })
    ]);

    return {
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getApplication(id: string, userId: string) {
    const application = await prisma.application.findFirst({
      where: {
        id,
        userId
      },
      include: {
        databaseSchemas: {
          orderBy: { version: 'desc' }
        },
        apiEndpoints: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!application) {
      throw new Error('Application not found');
    }

    return application;
  }

  async updateApplication(id: string, userId: string, input: UpdateApplicationInput) {
    const application = await prisma.application.findFirst({
      where: { id, userId }
    });

    if (!application) {
      throw new Error('Application not found');
    }

    // If updating name, check if slug needs to be updated
    if (input.name && input.name !== application.name) {
      const baseSlug = input.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      let slug = baseSlug;
      let counter = 1;

      while (await prisma.application.findUnique({
        where: {
          slug,
          id: { not: id } // Exclude current application
        }
      })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      input = { ...input, slug };
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: input,
      include: {
        databaseSchemas: {
          orderBy: { version: 'desc' },
          take: 1
        },
        apiEndpoints: true,
        _count: {
          select: {
            databaseSchemas: true,
            apiEndpoints: true
          }
        }
      }
    });

    return updatedApplication;
  }

  async deleteApplication(id: string, userId: string) {
    const application = await prisma.application.findFirst({
      where: { id, userId }
    });

    if (!application) {
      throw new Error('Application not found');
    }

    // Delete application (cascade will handle related records)
    await prisma.application.delete({
      where: { id }
    });

    return {
      success: true,
      message: 'Application deleted successfully'
    };
  }

  async cloneApplication(id: string, userId: string, newName: string) {
    const originalApplication = await prisma.application.findFirst({
      where: { id },
      include: {
        databaseSchemas: true,
        apiEndpoints: true
      }
    });

    if (!originalApplication) {
      throw new Error('Application not found');
    }

    if (originalApplication.userId !== userId) {
      throw new Error('You can only clone your own applications');
    }

    // Check user's application limit
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true }
    });

    const existingAppCount = await prisma.application.count({
      where: { userId }
    });

    const limits = {
      'free': 1,
      'pro': 5,
      'enterprise': 999
    };

    const limit = limits[user!.subscriptionTier as keyof typeof limits] || 1;

    if (existingAppCount >= limit) {
      throw new Error(`Application limit reached for ${user!.subscriptionTier} tier`);
    }

    // Generate unique slug for cloned app
    const baseSlug = newName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.application.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create cloned application
    const clonedApplication = await prisma.application.create({
      data: {
        name: newName,
        description: `Clone of ${originalApplication.name}`,
        slug,
        userId,
        status: 'development',
        deploymentConfig: originalApplication.deploymentConfig
      }
    });

    // Clone database schemas
    if (originalApplication.databaseSchemas.length > 0) {
      const latestSchema = originalApplication.databaseSchemas[0];

      await prisma.databaseSchema.create({
        data: {
          applicationId: clonedApplication.id,
          schemaDefinition: latestSchema.schemaDefinition,
          version: 1,
          migrationStatus: 'pending'
        }
      });
    }

    // Clone API endpoints
    for (const endpoint of originalApplication.apiEndpoints) {
      await prisma.apiEndpoint.create({
        data: {
          applicationId: clonedApplication.id,
          path: endpoint.path,
          method: endpoint.method,
          schema: endpoint.schema,
          authenticationRequired: endpoint.authenticationRequired,
          rateLimit: endpoint.rateLimit
        }
      });
    }

    return clonedApplication;
  }

  async getApplicationStats(userId: string) {
    const stats = await prisma.application.groupBy({
      by: ['status'],
      where: { userId },
      _count: {
        id: true
      }
    });

    const totalApplications = await prisma.application.count({
      where: { userId }
    });

    return {
      total: totalApplications,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.id;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

export const applicationService = new ApplicationService();