import Dexie, { Table } from 'dexie';

export type QuestionStatus =
    | 'sprout'
    | 'growing'
    | 'bloomed'
    | 'rethinking'
    | 'dormant';

export interface Question {
    id?: number;
    title: string;
    memo?: string;
    status: QuestionStatus;
    created_at: Date;
    last_thought_at?: Date;
    last_opened_at?: Date;
    thought_count: number;
}

export interface Thought {
    id?: number;
    question_id: number;
    body: string;
    created_at: Date;
}

export interface Quote {
    id?: number;
    question_id: number;
    quote_text: string;
    source: string;
    memo?: string;
    created_at: Date;
}

export interface FieldNote {
    id?: number;
    title?: string;
    body: string;
    created_at: Date;
}

export class QuestionGardenDB extends Dexie {
    questions!: Table<Question>;
    thoughts!: Table<Thought>;
    quotes!: Table<Quote>;
    fieldnotes!: Table<FieldNote>;

    constructor() {
        super('QuestionGardenDB');
        this.version(1).stores({
            questions: '++id, status, created_at, last_thought_at, last_opened_at, thought_count',
            thoughts: '++id, question_id, created_at',
            quotes: '++id, question_id, created_at',
            fieldnotes: '++id, created_at',
        });
    }
}

export const db = new QuestionGardenDB();