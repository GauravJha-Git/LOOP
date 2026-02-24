
export type FeedbackType = 'BUG' | 'FEATURE' | 'CONFUSION' | 'SUGGESTION';
export type FeedbackStatus = 'NEW' | 'ACCEPTED' | 'REJECTED' | 'RESOLVED';

export interface Project {
    id: number;
    name: string;
    description: string;
    product_url: string;
    public_slug: string;
    feedback_expiry_days: number;
    created_at: string;
    expiry_date: string;
}

export interface Feedback {
    id: number;
    type: FeedbackType;
    description: string;
    status: FeedbackStatus;
}
