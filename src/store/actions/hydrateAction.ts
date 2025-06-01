import { createAction } from '@reduxjs/toolkit';
import { RootState } from '..';

export const HYDRATE = 'persist/HYDRATE';

export const hydrateStore = createAction<Partial<RootState>>(HYDRATE);
