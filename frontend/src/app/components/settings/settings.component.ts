import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChannelApiService } from '../../services/channel-api.service';
import { TagStateService } from '../../services/tag-state.service';
import { BoardPreferencesService } from '../../services/board-preferences.service';
import { Channel } from '../../models/channel.model';
import { Tag, CreateTagDto } from '../../models/tag.model';
import { Workspace } from '../../models/workspace.enum';
import { BoardLayout } from '../../models/board-layout.enum';
import { ButtonModule } from 'primeng/button';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ColorPickerModule } from 'primeng/colorpicker';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MultiSelectModule } from 'primeng/multiselect';
import { ChipModule } from 'primeng/chip';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

/**
 * SettingsComponent
 *
 * Provides comprehensive settings management for the application.
 * Currently includes channel/context management with plans for
 * general settings and appearance customization.
 *
 * Features:
 * - Channel CRUD operations with workspace filtering
 * - Signal-based reactive state management
 * - Form validation and error handling
 * - Confirmation dialogs for destructive actions
 * - Toast notifications for user feedback
 */
@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        Tabs,
        TabList,
        Tab,
        TabPanels,
        TabPanel,
        DialogModule,
        InputTextModule,
        ColorPickerModule,
        SelectButtonModule,
        MultiSelectModule,
        ChipModule,
        MessageModule,
        ConfirmDialogModule,
        ToastModule,
        ThemeToggleComponent
    ],
    providers: [ConfirmationService, MessageService],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
    private readonly channelApi = inject(ChannelApiService);
    readonly tagState = inject(TagStateService);
    readonly boardPreferences = inject(BoardPreferencesService);
    private readonly fb = inject(FormBuilder);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly messageService = inject(MessageService);

    // Signal-based state management
    private readonly channelsSignal = signal<Channel[]>([]);
    readonly channels = this.channelsSignal.asReadonly();

    // Computed signals for filtered channels
    readonly workChannels = computed(() =>
        this.channelsSignal().filter(channel => channel.workspace === Workspace.WORK)
    );

    readonly personalChannels = computed(() =>
        this.channelsSignal().filter(channel => channel.workspace === Workspace.PERSONAL)
    );

    // UI state signals
    readonly showCreateChannelDialog = signal<boolean>(false);
    readonly editingChannel = signal<Channel | null>(null);
    readonly showCreateTagDialog = signal<boolean>(false);
    readonly editingTag = signal<Tag | null>(null);
    readonly activeTab = signal<number>(0);
    readonly isLoading = signal<boolean>(false);

    // Tag signals
    readonly tags = this.tagState.tags;
    readonly currentBoardLayout = this.boardPreferences.layout;

    // Expose enums to template
    readonly Workspace = Workspace;

    // Workspace options for select button
    readonly workspaceOptions = [
        { label: 'Work', value: Workspace.WORK },
        { label: 'Personal', value: Workspace.PERSONAL }
    ];

    // Workspace multi-select options for tags
    readonly workspaceMultiOptions = [
        { label: 'Work', value: Workspace.WORK },
        { label: 'Personal', value: Workspace.PERSONAL }
    ];

    // Board layout options
    readonly boardLayoutOptions = [
        { label: 'Traditional (3 Columns)', value: BoardLayout.TRADITIONAL },
        { label: 'Focus Mode', value: BoardLayout.FOCUS }
    ];

    // Forms
    channelForm: FormGroup;
    tagForm: FormGroup;

    constructor() {
        this.channelForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
            workspace: [Workspace.WORK, Validators.required],
            color: ['#8B7BB8', Validators.required]
        });

        this.tagForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
            color: ['#8B7BB8', [Validators.required, Validators.pattern(/^#[0-9A-F]{6}$/i)]],
            workspaces: [[], Validators.required]
        });
    }

    ngOnInit(): void {
        this.loadChannels();
        this.tagState.loadTags();
    }

    /**
     * Loads all channels from the API.
     * Updates the channels signal on success.
     */
    private loadChannels(): void {
        this.isLoading.set(true);
        this.channelApi.getChannels().subscribe({
            next: (channels) => {
                this.channelsSignal.set(channels);
                this.isLoading.set(false);
            },
            error: (error) => {
                console.error('Failed to load channels:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load channels. Please try again.'
                });
                this.isLoading.set(false);
            }
        });
    }

    /**
     * Opens the channel creation dialog.
     * Resets the form and sets workspace to WORK by default.
     */
    openCreateDialog(workspace: Workspace): void {
        this.editingChannel.set(null);
        this.channelForm.reset({
            name: '',
            workspace: workspace,
            color: '#8B7BB8'
        });
        this.showCreateChannelDialog.set(true);
    }

    /**
     * Opens the channel edit dialog.
     * Pre-fills the form with existing channel data.
     */
    openEditDialog(channel: Channel): void {
        this.editingChannel.set(channel);
        this.channelForm.patchValue({
            name: channel.name,
            workspace: channel.workspace,
            color: channel.color || '#8B7BB8'
        });
        this.showCreateChannelDialog.set(true);
    }

    /**
     * Closes the channel dialog and resets form state.
     */
    closeDialog(): void {
        this.showCreateChannelDialog.set(false);
        this.editingChannel.set(null);
        this.channelForm.reset();
    }

    /**
     * Saves the channel (create or update based on editingChannel state).
     * Validates form before submission.
     */
    saveChannel(): void {
        if (this.channelForm.invalid) {
            this.channelForm.markAllAsTouched();
            return;
        }

        const formValue = this.channelForm.value;
        const editingChannel = this.editingChannel();

        if (editingChannel) {
            this.updateChannel(editingChannel.id, formValue);
        } else {
            this.createChannel(formValue);
        }
    }

    /**
     * Creates a new channel via the API.
     * Updates local state optimistically and shows success toast.
     */
    private createChannel(channelData: { name: string; workspace: Workspace; color: string }): void {
        this.isLoading.set(true);

        // Note: Since the service doesn't have createChannel yet, this will need to be added
        // For now, we'll simulate the behavior
        const newChannel: Channel = {
            id: Math.max(0, ...this.channelsSignal().map(c => c.id)) + 1,
            name: channelData.name,
            workspace: channelData.workspace,
            color: channelData.color,
            createdAt: new Date()
        };

        // Add to local state immediately (optimistic update)
        this.channelsSignal.update(channels => [...channels, newChannel]);

        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Channel "${channelData.name}" created successfully`
        });

        this.closeDialog();
        this.isLoading.set(false);

        /* TODO: Replace with actual API call when backend is ready
        this.channelApi.createChannel(channelData).subscribe({
            next: (channel) => {
                this.channelsSignal.update(channels => [...channels, channel]);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `Channel "${channel.name}" created successfully`
                });
                this.closeDialog();
                this.isLoading.set(false);
            },
            error: (error) => {
                console.error('Failed to create channel:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to create channel. Please try again.'
                });
                this.isLoading.set(false);
            }
        });
        */
    }

    /**
     * Updates an existing channel via the API.
     * Updates local state and shows success toast.
     */
    private updateChannel(id: number, channelData: { name: string; workspace: Workspace; color: string }): void {
        this.isLoading.set(true);

        // Optimistic update
        this.channelsSignal.update(channels =>
            channels.map(channel =>
                channel.id === id
                    ? { ...channel, ...channelData }
                    : channel
            )
        );

        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Channel "${channelData.name}" updated successfully`
        });

        this.closeDialog();
        this.isLoading.set(false);

        /* TODO: Replace with actual API call when backend is ready
        this.channelApi.updateChannel(id, channelData).subscribe({
            next: (channel) => {
                this.channelsSignal.update(channels =>
                    channels.map(c => c.id === id ? channel : c)
                );
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `Channel "${channel.name}" updated successfully`
                });
                this.closeDialog();
                this.isLoading.set(false);
            },
            error: (error) => {
                console.error('Failed to update channel:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to update channel. Please try again.'
                });
                // Revert optimistic update
                this.loadChannels();
                this.isLoading.set(false);
            }
        });
        */
    }

    /**
     * Deletes a channel after user confirmation.
     * Shows confirmation dialog before proceeding.
     */
    deleteChannel(channel: Channel): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete the channel "${channel.name}"? This action cannot be undone.`,
            header: 'Delete Channel',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.performDelete(channel);
            }
        });
    }

    /**
     * Performs the actual channel deletion.
     * Updates local state and shows success toast.
     */
    private performDelete(channel: Channel): void {
        this.isLoading.set(true);

        // Optimistic update
        this.channelsSignal.update(channels =>
            channels.filter(c => c.id !== channel.id)
        );

        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Channel "${channel.name}" deleted successfully`
        });

        this.isLoading.set(false);

        /* TODO: Replace with actual API call when backend is ready
        this.channelApi.deleteChannel(channel.id).subscribe({
            next: () => {
                this.channelsSignal.update(channels =>
                    channels.filter(c => c.id !== channel.id)
                );
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `Channel "${channel.name}" deleted successfully`
                });
                this.isLoading.set(false);
            },
            error: (error) => {
                console.error('Failed to delete channel:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to delete channel. Please try again.'
                });
                // Revert optimistic update
                this.loadChannels();
                this.isLoading.set(false);
            }
        });
        */
    }

    /**
     * Gets the form control error message for display.
     * Works with both channel and tag forms.
     */
    getErrorMessage(controlName: string, formGroup?: FormGroup): string {
        // If form group not specified, try to detect based on active dialog
        const form = formGroup ||
                     (this.showCreateTagDialog() ? this.tagForm : this.channelForm);

        const control = form.get(controlName);
        if (!control || !control.errors || !control.touched) {
            return '';
        }

        if (control.errors['required']) {
            return `${this.capitalizeFirst(controlName)} is required`;
        }
        if (control.errors['minlength']) {
            return `${this.capitalizeFirst(controlName)} must be at least ${control.errors['minlength'].requiredLength} characters`;
        }
        if (control.errors['maxlength']) {
            return `${this.capitalizeFirst(controlName)} must be at most ${control.errors['maxlength'].requiredLength} characters`;
        }
        if (control.errors['pattern']) {
            return `${this.capitalizeFirst(controlName)} format is invalid`;
        }

        return 'Invalid input';
    }

    /**
     * Utility function to capitalize first letter.
     */
    private capitalizeFirst(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Gets the dialog header based on editing state.
     */
    get dialogHeader(): string {
        return this.editingChannel() ? 'Edit Channel' : 'Create Channel';
    }

    /**
     * Gets the save button label based on editing state.
     */
    get saveButtonLabel(): string {
        return this.editingChannel() ? 'Update' : 'Create';
    }

    // Tag Management Methods

    /**
     * Opens the tag creation dialog.
     * Resets the form with default values.
     */
    openCreateTagDialog(): void {
        this.editingTag.set(null);
        this.tagForm.reset({
            name: '',
            color: '#8B7BB8',
            workspaces: []
        });
        this.showCreateTagDialog.set(true);
    }

    /**
     * Opens the tag edit dialog.
     * Pre-fills the form with existing tag data.
     */
    openEditTagDialog(tag: Tag): void {
        this.editingTag.set(tag);
        this.tagForm.patchValue({
            name: tag.name,
            color: tag.color,
            workspaces: tag.workspaces
        });
        this.showCreateTagDialog.set(true);
    }

    /**
     * Closes the tag dialog and resets form state.
     */
    closeTagDialog(): void {
        this.showCreateTagDialog.set(false);
        this.editingTag.set(null);
        this.tagForm.reset();
    }

    /**
     * Saves the tag (create or update based on editingTag state).
     * Validates form before submission.
     */
    saveTag(): void {
        if (this.tagForm.invalid) {
            this.tagForm.markAllAsTouched();
            return;
        }

        const formValue = this.tagForm.value as CreateTagDto;
        const editingTag = this.editingTag();

        if (editingTag) {
            this.tagState.updateTag(editingTag.id, formValue);
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `Tag "${formValue.name}" updated successfully`
            });
        } else {
            this.tagState.addTag(formValue);
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `Tag "${formValue.name}" created successfully`
            });
        }

        this.closeTagDialog();
    }

    /**
     * Deletes a tag after user confirmation.
     * Shows confirmation dialog before proceeding.
     */
    deleteTag(tag: Tag): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete the tag "${tag.name}"? This will remove it from all tasks.`,
            header: 'Delete Tag',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.tagState.removeTag(tag.id);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `Tag "${tag.name}" deleted successfully`
                });
            }
        });
    }

    /**
     * Gets the tag dialog header based on editing state.
     */
    get tagDialogHeader(): string {
        return this.editingTag() ? 'Edit Tag' : 'Create Tag';
    }

    /**
     * Gets the tag save button label based on editing state.
     */
    get tagSaveButtonLabel(): string {
        return this.editingTag() ? 'Update' : 'Create';
    }

    // Board Layout Methods

    /**
     * Sets the board layout preference.
     * Updates the preference service and shows success message.
     */
    setBoardLayout(layout: BoardLayout): void {
        this.boardPreferences.setLayout(layout);
        this.messageService.add({
            severity: 'success',
            summary: 'Settings Updated',
            detail: `Board layout changed to ${layout === BoardLayout.FOCUS ? 'Focus Mode' : 'Traditional View'}`
        });
    }
}
