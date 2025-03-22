import { nanoid } from 'nanoid';

export const id = (size = 10) => nanoid(size);
