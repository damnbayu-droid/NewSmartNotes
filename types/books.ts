export type BookType = 'novel' | 'non-fiction' | 'empty';

export interface Chapter {
    id: string;
    title: string;
    content: string;
    order: number;
}

export interface Book {
    id: string;
    title: string;
    author: string;
    type: BookType;
    cover: string; // Tailwind class for background
    progress: number;
    lastEdited: string;
    chapters: Chapter[];
    createdAt: number;
    updatedAt: number;
}

export const BOOK_TEMPLATES: Record<BookType, Partial<Book>> = {
    'empty': {
        type: 'empty',
        title: 'Untitled Book',
        chapters: [
            { id: '1', title: 'Chapter 1', content: '', order: 1 }
        ]
    },
    'novel': {
        type: 'novel',
        title: 'My Novel',
        chapters: [
            { id: '1', title: 'Chapter 1: The Beginning', content: 'It was a dark and stormy night...', order: 1 },
            { id: '2', title: 'Chapter 2: The Conflict', content: '', order: 2 },
            { id: '3', title: 'Chapter 3: The Climax', content: '', order: 3 },
        ]
    },
    'non-fiction': {
        type: 'non-fiction',
        title: 'Non-Fiction Title',
        chapters: [
            { id: '1', title: 'Introduction', content: '', order: 1 },
            { id: '2', title: 'Chapter 1: Concepts', content: '', order: 2 },
            { id: '3', title: 'Conclusion', content: '', order: 3 },
        ]
    }
};
