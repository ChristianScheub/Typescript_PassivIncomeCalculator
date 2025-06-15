import { createAction } from '@reduxjs/toolkit';
import { StoreState } from '..';

export const HYDRATE = 'hydrate/HYDRATE';

export const hydrateStore = createAction<Partial<StoreState>>(HYDRATE);
