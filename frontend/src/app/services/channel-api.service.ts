import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import type { Channel } from '../models/channel.model';
import { Workspace } from '../models/workspace.enum';

/**
 * ChannelApiService
 *
 * Provides channel data for organizing tasks.
 * Currently uses mock data - will be replaced with real API in v0.2.
 *
 * Mock Channels:
 * - Work: "Frontend", "Backend", "Design"
 * - Personal: "Home", "Learning", "Health"
 */
@Injectable({
  providedIn: 'root',
})
export class ChannelApiService {
  /**
   * Mock channel data for v0.1.
   * Will be replaced with backend API calls in v0.2.
   */
  private readonly mockChannels: Channel[] = [
    // Work channels
    {
      id: 1,
      name: 'Frontend',
      workspace: Workspace.WORK,
      color: '#6B9AC4',
      createdAt: new Date('2025-01-01'),
    },
    {
      id: 2,
      name: 'Backend',
      workspace: Workspace.WORK,
      color: '#7A9B76',
      createdAt: new Date('2025-01-01'),
    },
    {
      id: 3,
      name: 'Design',
      workspace: Workspace.WORK,
      color: '#C89FA7',
      createdAt: new Date('2025-01-01'),
    },
    // Personal channels
    {
      id: 4,
      name: 'Home',
      workspace: Workspace.PERSONAL,
      color: '#8B7BB8',
      createdAt: new Date('2025-01-01'),
    },
    {
      id: 5,
      name: 'Learning',
      workspace: Workspace.PERSONAL,
      color: '#6B9AC4',
      createdAt: new Date('2025-01-01'),
    },
    {
      id: 6,
      name: 'Health',
      workspace: Workspace.PERSONAL,
      color: '#7A9B76',
      createdAt: new Date('2025-01-01'),
    },
  ];

  /**
   * Get all channels, optionally filtered by workspace.
   *
   * @param workspace - Optional workspace filter (WORK or PERSONAL)
   * @returns Observable of Channel array
   */
  getChannels(workspace?: Workspace): Observable<Channel[]> {
    const channels = workspace
      ? this.mockChannels.filter((c) => c.workspace === workspace)
      : this.mockChannels;

    // Simulate network delay for realistic behavior
    return of(channels).pipe(delay(100));
  }

  /**
   * Get a single channel by ID.
   *
   * @param id - Channel ID
   * @returns Observable of Channel or undefined if not found
   */
  getChannel(id: number): Observable<Channel | undefined> {
    const channel = this.mockChannels.find((c) => c.id === id);
    return of(channel).pipe(delay(50));
  }
}
