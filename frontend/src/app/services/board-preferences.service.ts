import { Injectable, signal } from '@angular/core';
import { BoardLayout } from '../models/board-layout.enum';

const STORAGE_KEY = 'tasker_board_layout';

@Injectable({
    providedIn: 'root'
})
export class BoardPreferencesService {
    private layoutSignal = signal<BoardLayout>(this.getInitialLayout());
    readonly layout = this.layoutSignal.asReadonly();

    setLayout(layout: BoardLayout): void {
        this.layoutSignal.set(layout);
        localStorage.setItem(STORAGE_KEY, layout);
    }

    toggleLayout(): void {
        const current = this.layoutSignal();
        const next = current === BoardLayout.TRADITIONAL
            ? BoardLayout.FOCUS
            : BoardLayout.TRADITIONAL;
        this.setLayout(next);
    }

    private getInitialLayout(): BoardLayout {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && Object.values(BoardLayout).includes(stored as BoardLayout)) {
            return stored as BoardLayout;
        }
        return BoardLayout.TRADITIONAL;
    }
}
