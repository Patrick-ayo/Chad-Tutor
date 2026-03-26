/**
 * Playlist Service
 */

import { playlistRepo } from '../repositories';
import type { Prisma } from '@prisma/client';

export interface PlaylistItemInput {
  title: string;
  description?: string;
  externalId?: string;
  externalUrl?: string;
  sequence: number;
  estimatedMinutes?: number;
  keyPoints?: string[];
  learningOutcomes?: string[];
}

export async function ingestPlaylist(
  userId: string,
  input: {
    name: string;
    description?: string;
    externalSource: string;
    externalId?: string;
    externalUrl?: string;
    estimatedHours?: number;
    thumbnailUrl?: string;
    items: PlaylistItemInput[];
  }
) {
  return playlistRepo.createPlaylist({
    ...input,
    userId,
    items: input.items.map((item) => ({
      title: item.title,
      description: item.description,
      externalId: item.externalId,
      externalUrl: item.externalUrl,
      sequence: item.sequence,
      estimatedMinutes: item.estimatedMinutes,
      keyPoints: (item.keyPoints ?? []) as Prisma.InputJsonValue,
      learningOutcomes: (item.learningOutcomes ?? []) as Prisma.InputJsonValue,
    })),
  });
}

export async function getUserPlaylists(userId: string) {
  return playlistRepo.findByUser(userId);
}

export async function getPlaylistById(userId: string, playlistId: string) {
  return playlistRepo.findById(playlistId, userId);
}

export async function linkPlaylistToSkill(
  userId: string,
  input: {
    skillId: string;
    playlistId: string;
    resourceType?: string;
    sequence?: number;
  }
) {
  return playlistRepo.linkPlaylistToSkill({
    userId,
    skillId: input.skillId,
    playlistId: input.playlistId,
    resourceType: input.resourceType,
    sequence: input.sequence,
  });
}
