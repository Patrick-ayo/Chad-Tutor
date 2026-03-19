/**
 * Playlist Repository
 *
 * Data access layer for learning playlists and items.
 */

import { prisma, TransactionClient } from './base.repo';
import type { Prisma } from '@prisma/client';

export type LearningPlaylist = Prisma.LearningPlaylistGetPayload<{
  include: {
    items: true;
  };
}>;

export interface PlaylistItemInput {
  title: string;
  description?: string;
  externalId?: string;
  externalUrl?: string;
  sequence: number;
  estimatedMinutes?: number;
  keyPoints?: Prisma.InputJsonValue;
  learningOutcomes?: Prisma.InputJsonValue;
}

export async function createPlaylist(
  data: {
    userId: string;
    name: string;
    description?: string;
    externalSource: string;
    externalId?: string;
    externalUrl?: string;
    estimatedHours?: number;
    thumbnailUrl?: string;
    items: PlaylistItemInput[];
  },
  tx?: TransactionClient
): Promise<LearningPlaylist> {
  const client = tx || prisma;

  return client.learningPlaylist.create({
    data: {
      userId: data.userId,
      name: data.name,
      description: data.description,
      externalSource: data.externalSource,
      externalId: data.externalId,
      externalUrl: data.externalUrl,
      estimatedHours: data.estimatedHours,
      thumbnailUrl: data.thumbnailUrl,
      resourceCount: data.items.length,
      items: {
        create: data.items.map((item) => ({
          title: item.title,
          description: item.description,
          externalId: item.externalId,
          externalUrl: item.externalUrl,
          sequence: item.sequence,
          estimatedMinutes: item.estimatedMinutes,
          ...(item.keyPoints !== undefined && { keyPoints: item.keyPoints }),
          ...(item.learningOutcomes !== undefined && {
            learningOutcomes: item.learningOutcomes,
          }),
        })),
      },
    },
    include: {
      items: {
        orderBy: { sequence: 'asc' },
      },
    },
  });
}

export async function findById(
  id: string,
  tx?: TransactionClient
): Promise<LearningPlaylist | null> {
  const client = tx || prisma;
  return client.learningPlaylist.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { sequence: 'asc' },
      },
    },
  });
}

export async function findByUser(
  userId: string,
  tx?: TransactionClient
): Promise<LearningPlaylist[]> {
  const client = tx || prisma;
  return client.learningPlaylist.findMany({
    where: { userId },
    include: {
      items: {
        orderBy: { sequence: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function linkPlaylistToSkill(
  data: {
    userId: string;
    skillId: string;
    playlistId: string;
    resourceType?: string;
    sequence?: number;
  },
  tx?: TransactionClient
) {
  const client = tx || prisma;
  return client.skillPlaylistLink.upsert({
    where: {
      userId_skillId_playlistId_resourceType: {
        userId: data.userId,
        skillId: data.skillId,
        playlistId: data.playlistId,
        resourceType: data.resourceType ?? 'primary',
      },
    },
    create: {
      userId: data.userId,
      skillId: data.skillId,
      playlistId: data.playlistId,
      resourceType: data.resourceType ?? 'primary',
      sequence: data.sequence ?? 0,
    },
    update: {
      sequence: data.sequence ?? 0,
    },
  });
}

export async function findSkillPlaylists(
  userId: string,
  skillId: string,
  tx?: TransactionClient
) {
  const client = tx || prisma;
  return client.skillPlaylistLink.findMany({
    where: { userId, skillId },
    include: {
      playlist: {
        include: {
          items: {
            orderBy: { sequence: 'asc' },
          },
        },
      },
    },
    orderBy: [
      { sequence: 'asc' },
      { createdAt: 'asc' },
    ],
  });
}
