import { Workspace } from './workspace.enum';

export interface Channel {
    id: number;
    name: string;
    workspace: Workspace;
    color: string | null;
    createdAt: Date;
}
