import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { SettingsComponent } from './settings.component';
import { ChannelApiService } from '../../services/channel-api.service';
import { Channel } from '../../models/channel.model';
import { Workspace } from '../../models/workspace.enum';
import { ConfirmationService, MessageService } from 'primeng/api';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let channelApiService: jest.Mocked<ChannelApiService>;
  let messageService: jest.Mocked<MessageService>;
  let confirmationService: jest.Mocked<ConfirmationService>;

  // Mock ResizeObserver for PrimeNG tabs and suppress console.error
  beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  const mockChannels: Channel[] = [
    {
      id: 1,
      name: 'Frontend',
      workspace: Workspace.WORK,
      color: '#8B7BB8',
      createdAt: new Date('2024-01-01')
    },
    {
      id: 2,
      name: 'Backend',
      workspace: Workspace.WORK,
      color: '#6B9AC4',
      createdAt: new Date('2024-01-02')
    },
    {
      id: 3,
      name: 'Home',
      workspace: Workspace.PERSONAL,
      color: '#C89FA7',
      createdAt: new Date('2024-01-03')
    }
  ];

  beforeEach(async () => {
    const channelApiSpy = {
      getChannels: jest.fn(),
      createChannel: jest.fn(),
      updateChannel: jest.fn(),
      deleteChannel: jest.fn()
    } as unknown as jest.Mocked<ChannelApiService>;

    const messageSpy = {
      add: jest.fn(),
      clear: jest.fn()
    } as unknown as jest.Mocked<MessageService>;

    const confirmationSpy = {
      confirm: jest.fn()
    } as unknown as jest.Mocked<ConfirmationService>;

    await TestBed.configureTestingModule({
      imports: [SettingsComponent, ReactiveFormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations(),
        { provide: ChannelApiService, useValue: channelApiSpy },
        { provide: MessageService, useValue: messageSpy },
        { provide: ConfirmationService, useValue: confirmationSpy }
      ]
    }).compileComponents();

    channelApiService = TestBed.inject(ChannelApiService) as jest.Mocked<ChannelApiService>;
    messageService = TestBed.inject(MessageService) as jest.Mocked<MessageService>;
    confirmationService = TestBed.inject(ConfirmationService) as jest.Mocked<ConfirmationService>;

    channelApiService.getChannels.mockReturnValue(of(mockChannels));
    channelApiService.createChannel.mockImplementation((dto) =>
      of({ id: 999, ...dto, createdAt: new Date() })
    );
    channelApiService.updateChannel.mockImplementation((id, dto) =>
      of({ id, ...dto, createdAt: new Date() } as Channel)
    );
    channelApiService.deleteChannel.mockReturnValue(of(void 0));

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should load channels on init', () => {
      expect(channelApiService.getChannels).toHaveBeenCalled();
      expect(component.channels()).toEqual(mockChannels);
    });

    it('should initialize form with default values', () => {
      expect(component.channelForm.get('name')?.value).toBe('');
      expect(component.channelForm.get('workspace')?.value).toBe(Workspace.WORK);
      expect(component.channelForm.get('color')?.value).toBe('#8B7BB8');
    });

    it('should have correct workspace options', () => {
      expect(component.workspaceOptions).toEqual([
        { label: 'Work', value: Workspace.WORK },
        { label: 'Personal', value: Workspace.PERSONAL }
      ]);
    });
  });

  describe('Computed Signals', () => {
    it('should filter work channels correctly', () => {
      expect(component.workChannels()).toHaveLength(2);
      expect(component.workChannels()[0].name).toBe('Frontend');
      expect(component.workChannels()[1].name).toBe('Backend');
    });

    it('should filter personal channels correctly', () => {
      expect(component.personalChannels()).toHaveLength(1);
      expect(component.personalChannels()[0].name).toBe('Home');
    });

    it('should update computed signals when channels change', () => {
      const newChannel: Channel = {
        id: 4,
        name: 'Fitness',
        workspace: Workspace.PERSONAL,
        color: '#7A9B76',
        createdAt: new Date()
      };

      // Simulate adding a channel
      component['channelsSignal'].update(channels => [...channels, newChannel]);

      expect(component.personalChannels()).toHaveLength(2);
      expect(component.personalChannels()[1].name).toBe('Fitness');
    });
  });

  describe('Dialog Management', () => {
    it('should open create dialog with WORK workspace', () => {
      component.openCreateDialog(Workspace.WORK);

      expect(component.showCreateChannelDialog()).toBe(true);
      expect(component.editingChannel()).toBeNull();
      expect(component.channelForm.get('workspace')?.value).toBe(Workspace.WORK);
      expect(component.channelForm.get('name')?.value).toBe('');
      expect(component.channelForm.get('color')?.value).toBe('#8B7BB8');
    });

    it('should open create dialog with PERSONAL workspace', () => {
      component.openCreateDialog(Workspace.PERSONAL);

      expect(component.showCreateChannelDialog()).toBe(true);
      expect(component.editingChannel()).toBeNull();
      expect(component.channelForm.get('workspace')?.value).toBe(Workspace.PERSONAL);
    });

    it('should open edit dialog with channel data', () => {
      const channelToEdit = mockChannels[0];
      component.openEditDialog(channelToEdit);

      expect(component.showCreateChannelDialog()).toBe(true);
      expect(component.editingChannel()).toBe(channelToEdit);
      expect(component.channelForm.get('name')?.value).toBe('Frontend');
      expect(component.channelForm.get('workspace')?.value).toBe(Workspace.WORK);
      expect(component.channelForm.get('color')?.value).toBe('#8B7BB8');
    });

    it('should close dialog and reset state', () => {
      component.openCreateDialog(Workspace.WORK);
      component.channelForm.patchValue({ name: 'Test' });

      component.closeDialog();

      expect(component.showCreateChannelDialog()).toBe(false);
      expect(component.editingChannel()).toBeNull();
      expect(component.channelForm.get('name')?.value).toBeNull();
    });
  });

  describe('Form Validation', () => {
    it('should invalidate empty name field', () => {
      const nameControl = component.channelForm.get('name');
      nameControl?.setValue('');
      nameControl?.markAsTouched();

      expect(nameControl?.valid).toBe(false);
      expect(nameControl?.errors?.['required']).toBe(true);
    });

    it('should invalidate name longer than 50 characters', () => {
      const longName = 'a'.repeat(51);
      const nameControl = component.channelForm.get('name');
      nameControl?.setValue(longName);
      nameControl?.markAsTouched();

      expect(nameControl?.valid).toBe(false);
      expect(nameControl?.errors?.['maxlength']).toBeTruthy();
    });

    it('should validate correct name', () => {
      const nameControl = component.channelForm.get('name');
      nameControl?.setValue('Valid Channel Name');

      expect(nameControl?.valid).toBe(true);
    });

    it('should require workspace selection', () => {
      const workspaceControl = component.channelForm.get('workspace');
      workspaceControl?.setValue(null);

      expect(workspaceControl?.valid).toBe(false);
      expect(workspaceControl?.errors?.['required']).toBe(true);
    });

    it('should require color selection', () => {
      const colorControl = component.channelForm.get('color');
      colorControl?.setValue('');

      expect(colorControl?.valid).toBe(false);
      expect(colorControl?.errors?.['required']).toBe(true);
    });
  });

  describe('Error Messages', () => {
    it('should return required error message', () => {
      const nameControl = component.channelForm.get('name');
      nameControl?.setValue('');
      nameControl?.markAsTouched();

      expect(component.getErrorMessage('name')).toBe('Name is required');
    });

    it('should return minlength error message', () => {
      const nameControl = component.channelForm.get('name');
      nameControl?.setErrors({ minlength: { requiredLength: 1, actualLength: 0 } });
      nameControl?.markAsTouched();

      expect(component.getErrorMessage('name')).toBe('Name must be at least 1 characters');
    });

    it('should return maxlength error message', () => {
      const nameControl = component.channelForm.get('name');
      nameControl?.setErrors({ maxlength: { requiredLength: 50, actualLength: 51 } });
      nameControl?.markAsTouched();

      expect(component.getErrorMessage('name')).toBe('Name must be at most 50 characters');
    });

    it('should return empty string for untouched control', () => {
      const nameControl = component.channelForm.get('name');
      nameControl?.setValue('');

      expect(component.getErrorMessage('name')).toBe('');
    });

    it('should return empty string for valid control', () => {
      const nameControl = component.channelForm.get('name');
      nameControl?.setValue('Valid Name');
      nameControl?.markAsTouched();

      expect(component.getErrorMessage('name')).toBe('');
    });
  });

  describe('Channel Creation', () => {
    it('should not save when form is invalid', () => {
      component.channelForm.patchValue({ name: '' });
      const initialLength = component.channels().length;

      component.saveChannel();

      expect(component.channels()).toHaveLength(initialLength);
      expect(component.channelForm.touched).toBe(true);
    });

    it('should create new channel with valid form data', () => {
      component.openCreateDialog(Workspace.WORK);
      component.channelForm.patchValue({
        name: 'New Channel',
        workspace: Workspace.WORK,
        color: '#FF0000'
      });

      component.saveChannel();

      expect(component.channels()).toHaveLength(mockChannels.length + 1);
      const newChannel = component.channels()[component.channels().length - 1];
      expect(newChannel.name).toBe('New Channel');
      expect(newChannel.workspace).toBe(Workspace.WORK);
      expect(newChannel.color).toBe('#FF0000');
    });

    it('should close dialog after successful creation', () => {
      component.openCreateDialog(Workspace.WORK);
      component.channelForm.patchValue({
        name: 'New Channel',
        workspace: Workspace.WORK,
        color: '#FF0000'
      });

      component.saveChannel();

      expect(component.showCreateChannelDialog()).toBe(false);
      expect(component.editingChannel()).toBeNull();
    });
  });

  describe('Channel Update', () => {
    it('should update existing channel', () => {
      const channelToEdit = mockChannels[0];
      component.openEditDialog(channelToEdit);
      component.channelForm.patchValue({
        name: 'Updated Frontend',
        workspace: Workspace.WORK,
        color: '#FF0000'
      });

      component.saveChannel();

      const updatedChannel = component.channels().find(c => c.id === channelToEdit.id);
      expect(updatedChannel?.name).toBe('Updated Frontend');
      expect(updatedChannel?.color).toBe('#FF0000');
    });

    it('should close dialog after successful update', () => {
      const channelToEdit = mockChannels[0];
      component.openEditDialog(channelToEdit);
      component.channelForm.patchValue({ name: 'Updated' });

      component.saveChannel();

      expect(component.showCreateChannelDialog()).toBe(false);
      expect(component.editingChannel()).toBeNull();
    });
  });

  describe('Channel Deletion', () => {
    it('should not delete channel if confirmation rejected', () => {
      const channelToDelete = mockChannels[0];
      const initialLength = component.channels().length;

      confirmationService.confirm.mockImplementation((config: any) => {
        if (config.reject) {
          config.reject();
        }
      });

      component.deleteChannel(channelToDelete);

      expect(component.channels()).toHaveLength(initialLength);
    });
  });

  describe('Dialog Header and Button Labels', () => {
    it('should show "Create Channel" header when creating', () => {
      component.openCreateDialog(Workspace.WORK);

      expect(component.dialogHeader).toBe('Create Channel');
    });

    it('should show "Edit Channel" header when editing', () => {
      component.openEditDialog(mockChannels[0]);

      expect(component.dialogHeader).toBe('Edit Channel');
    });

    it('should show "Create" button label when creating', () => {
      component.openCreateDialog(Workspace.WORK);

      expect(component.saveButtonLabel).toBe('Create');
    });

    it('should show "Update" button label when editing', () => {
      component.openEditDialog(mockChannels[0]);

      expect(component.saveButtonLabel).toBe('Update');
    });
  });

  describe('Tab Navigation', () => {
    it('should initialize with first tab active', () => {
      expect(component.activeTab()).toBe(0);
    });

    it('should update active tab', () => {
      component.activeTab.set(1);

      expect(component.activeTab()).toBe(1);
    });
  });
});
