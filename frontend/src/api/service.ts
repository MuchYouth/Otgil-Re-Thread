import { apiGet } from './client';
import { ClothingItem, Party, User } from '../types';

export const fetchUsers = () => apiGet<User[]>('/users');
export const fetchClothingItems = () => apiGet<ClothingItem[]>('/items');
export const fetchParties = () => apiGet<Party[]>('/parties');
