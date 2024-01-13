let _id = 0;

export const getId = (prefix: string = 'id-') => `${prefix}${++_id}`;
