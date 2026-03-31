import api from './authService';

export interface PartnerRequest {
    id: number;
    user_id: number;
    place_name: string;
    place_address: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    user?: {
        name: string;
        email: string;
    };
}

export const partnerService = {
    createRequest: async (data: { place_name: string; place_address: string }) => {
        const response = await api.post<PartnerRequest>('/partner-requests', data);
        return response.data;
    },

    getAllRequests: async (page: number = 1) => {
        const response = await api.get<any>(`/admin/partner-requests?page=${page}`);
        return response.data;
    },

    approveRequest: async (id: number) => {
        const response = await api.patch<{ message: string }>(`/admin/partner-requests/${id}/approve`);
        return response.data;
    },

    rejectRequest: async (id: number) => {
        const response = await api.patch<{ message: string }>(`/admin/partner-requests/${id}/reject`);
        return response.data;
    },

    getNotifications: async () => {
        const response = await api.get<NotificationResponse>('/notifications');
        return response.data;
    },

    markAsRead: async (id: number) => {
        const response = await api.patch<{ message: string }>(`/notifications/${id}/read`);
        return response.data;
    }
};

export interface NotificationResponse {
    type: 'admin' | 'user';
    count?: number; // For admin
    notifications?: PartnerRequest[]; // For user
}
