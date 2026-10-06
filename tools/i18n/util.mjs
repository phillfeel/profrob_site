// Small helpers shared by the i18n tools.

/** JSON as it is stored in i18n/: non-breaking spaces are written as escapes, so they stay visible in diffs. */
export const toJson = (obj) => `${JSON.stringify(obj, null, 2).replace(/\u00a0/g, '\\u00a0').replace(/\u202f/g, '\\u202f')}\n`;

/** Flat key → message from a nested catalogue. */
export const flatten = (obj, prefix = '', out = {}) => {
  for (const [k, v] of Object.entries(obj)) (typeof v === 'string' ? (out[`${prefix}${k}`] = v) : flatten(v, `${prefix}${k}.`, out));
  return out;
};
