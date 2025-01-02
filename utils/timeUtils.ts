/**
 * Converte uma string no formato "HHmm" para minutos do dia (0..1440).
 * Aceita casos que podem “cruzar” a meia-noite (ex.: "2345" ~ "0130"),
 * mas aqui retornamos sempre um número [0..1440), sem lógica de "inverter".
 * @param str - String representando o horário (ex.: "0730" = 07:30).
 * @returns Número de minutos desde 00:00. Se inválido (ex.: "5555"), retorna 0.
 */
export function parseTimeString(str: string): number {
  // Se for exatamente "0000", consideramos 1440 (24h do mesmo dia).
  if (str === '0000') {
    return 1440;
  }

  if (!/^\d{4}$/.test(str)) return 0;
  const hh = parseInt(str.slice(0, 2), 10);
  const mm = parseInt(str.slice(2), 10);

  if (hh > 23 || mm > 59) return 0; // valor "invalido" => interpretamos como ERRO (0)
  return hh * 60 + mm;
}


/**
 * Normaliza strings para comparação case-insensitive e sem acentos.
 * @param str - String original.
 * @returns String normalizada.
 */
export function normalizeString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}
