import { Injectable, signal, inject } from '@angular/core';
import { Tag, CreateTagDto, UpdateTagDto } from '../models/tag.model';
import { TagApiService } from './tag-api.service';

/**
 * TagStateService
 *
 * Centralized reactive state management for tags using Angular signals.
 * Manages the tag list and loading/error states.
 * Integrates with TagApiService for backend communication.
 *
 * Signal-based architecture:
 * - Base signals: tags, loading, error
 */
@Injectable({
    providedIn: 'root'
})
export class TagStateService {
    private readonly tagApiService = inject(TagApiService);

    // Base signals
    private readonly tagsSignal = signal<Tag[]>([]);
    private readonly loadingSignal = signal<boolean>(false);
    private readonly errorSignal = signal<string | null>(null);

    // Readonly accessors
    readonly tags = this.tagsSignal.asReadonly();
    readonly loading = this.loadingSignal.asReadonly();
    readonly error = this.errorSignal.asReadonly();

    /**
     * Load tags from the API.
     * Updates loading and error states automatically.
     */
    loadTags(): void {
        this.loadingSignal.set(true);
        this.errorSignal.set(null);

        this.tagApiService.getTags().subscribe({
            next: (tags) => {
                this.tagsSignal.set(tags);
                this.loadingSignal.set(false);
            },
            error: (error) => {
                console.error('[TagStateService] Error loading tags:', error);
                this.errorSignal.set(error.message || 'Failed to load tags');
                this.loadingSignal.set(false);
            }
        });
    }

    /**
     * Create a new tag and add to state.
     * Updates loading and error states automatically.
     *
     * @param dto - Tag creation data
     */
    addTag(dto: CreateTagDto): void {
        this.loadingSignal.set(true);
        this.errorSignal.set(null);

        this.tagApiService.createTag(dto).subscribe({
            next: (tag) => {
                this.tagsSignal.update(tags => [...tags, tag]);
                this.loadingSignal.set(false);
            },
            error: (error) => {
                console.error('[TagStateService] Error creating tag:', error);
                this.errorSignal.set(error.message || 'Failed to create tag');
                this.loadingSignal.set(false);
            }
        });
    }

    /**
     * Update an existing tag.
     * Updates loading and error states automatically.
     *
     * @param id - Tag ID
     * @param dto - Fields to update
     */
    updateTag(id: number, dto: UpdateTagDto): void {
        this.loadingSignal.set(true);
        this.errorSignal.set(null);

        this.tagApiService.updateTag(id, dto).subscribe({
            next: (updatedTag) => {
                this.tagsSignal.update(tags =>
                    tags.map(t => t.id === id ? updatedTag : t)
                );
                this.loadingSignal.set(false);
            },
            error: (error) => {
                console.error('[TagStateService] Error updating tag:', error);
                this.errorSignal.set(error.message || 'Failed to update tag');
                this.loadingSignal.set(false);
            }
        });
    }

    /**
     * Delete a tag and remove from state.
     * Updates loading and error states automatically.
     *
     * @param id - Tag ID
     */
    removeTag(id: number): void {
        this.loadingSignal.set(true);
        this.errorSignal.set(null);

        this.tagApiService.deleteTag(id).subscribe({
            next: () => {
                this.tagsSignal.update(tags => tags.filter(t => t.id !== id));
                this.loadingSignal.set(false);
            },
            error: (error) => {
                console.error('[TagStateService] Error deleting tag:', error);
                this.errorSignal.set(error.message || 'Failed to delete tag');
                this.loadingSignal.set(false);
            }
        });
    }

    /**
     * Clear error message.
     */
    clearError(): void {
        this.errorSignal.set(null);
    }
}
