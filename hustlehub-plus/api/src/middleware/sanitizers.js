import { body } from 'express-validator';
import sanitizeHtml from 'sanitize-html';

export const stripHtml = (field) =>
  body(field).customSanitizer((value) => {
    if (typeof value !== 'string') {
      return value;
    }

    return sanitizeHtml(value, {
      allowedTags: [],
      allowedAttributes: {},
    });
  });