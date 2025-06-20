import { SupplyRequest } from '../types';
import { fetchRequests, handleRequesterConfirmation } from './requestUtils';

export const loadMyRequests = async (token: string): Promise<SupplyRequest[]> => {
    if (!token) {
        throw new Error('Token não encontrado');
    }
    return await fetchRequests(token);
};

export const confirmDelivery = async (
    requestId: string,
    isCustom: boolean,
    token: string
): Promise<void> => {
    if (!token) {
        throw new Error('Token não encontrado');
    }
    await handleRequesterConfirmation(requestId, true, token, isCustom);
}; 