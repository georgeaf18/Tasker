import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tag, CreateTagDto, UpdateTagDto, TagFilters } from '../models/tag.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TagApiService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/tags`;

    getTags(filters?: TagFilters): Observable<Tag[]> {
        let params = new HttpParams();

        if (filters?.workspace) {
            params = params.set('workspace', filters.workspace);
        }

        return this.http.get<Tag[]>(this.apiUrl, { params });
    }

    getTag(id: number): Observable<Tag> {
        return this.http.get<Tag>(`${this.apiUrl}/${id}`);
    }

    createTag(dto: CreateTagDto): Observable<Tag> {
        return this.http.post<Tag>(this.apiUrl, dto);
    }

    updateTag(id: number, dto: UpdateTagDto): Observable<Tag> {
        return this.http.patch<Tag>(`${this.apiUrl}/${id}`, dto);
    }

    deleteTag(id: number): Observable<Tag> {
        return this.http.delete<Tag>(`${this.apiUrl}/${id}`);
    }

    addTagToTask(taskId: number, tagId: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/tasks/${taskId}/tags/${tagId}`, {});
    }

    removeTagFromTask(taskId: number, tagId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/tasks/${taskId}/tags/${tagId}`);
    }
}
