import { Workspace } from './task.model';

export interface Tag {
    id: number;
    name: string;
    color: string;
    workspaces: Workspace[];
    createdAt: Date;
}

export interface CreateTagDto {
    name: string;
    color: string;
    workspaces: Workspace[];
}

export interface UpdateTagDto {
    name?: string;
    color?: string;
    workspaces?: Workspace[];
}

export interface TagFilters {
    workspace?: Workspace;
}

export interface TaskTag {
    taskId: number;
    tagId: number;
    tag: Tag;
    createdAt: Date;
}
