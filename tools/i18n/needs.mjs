/** Text that differs between languages: Cyrillic, the rouble sign, decimal commas, grouped thousands, dd.mm.yyyy dates.
 *  Language-neutral text (digits, Latin names, times) needs no message. Used by the generator, the extractor and the coverage check. */
export const NEEDS = /[А-Яа-яЁё₽]|\d,\d|\d[\u00a0 ]\d{3}(?!\d)|\d{1,2}\.\d{1,2}\.\d{4}/;
