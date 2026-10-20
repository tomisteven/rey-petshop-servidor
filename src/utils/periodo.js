const { getSystemConfigDoc } = require('./systemConfig');

const clampDay = (d) => {
  const n = parseInt(d, 10);
  if (isNaN(n)) return 1;
  return Math.min(Math.max(n, 1), 31);
};

// Construye el inicio (03:00 UTC = 00:00 Argentina) del "mes" que arranca
// el dia `day` dentro del mes calendario (year, month1 con month1 de 1 a 12).
// Si el mes no tiene ese dia (ej: 31 en febrero), se usa el ultimo dia del mes.
const buildStart = (year, month1, day) => {
  const daysInMonth = new Date(Date.UTC(year, month1, 0)).getUTCDate();
  const d = Math.min(day, daysInMonth);
  return new Date(Date.UTC(year, month1 - 1, d, 3, 0, 0, 0));
};

// Rango [start, end] del periodo mensual vigente segun el dia de inicio.
const getMonthPeriod = (diaInicio, ref = new Date()) => {
  const day = clampDay(diaInicio);
  const argStr = ref.toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
  const [y, m, d] = argStr.split('-').map(Number);

  let startY = y;
  let startM = m;
  if (d < day) {
    startM -= 1;
    if (startM < 1) {
      startM = 12;
      startY -= 1;
    }
  }

  const start = buildStart(startY, startM, day);

  let endM = startM + 1;
  let endY = startY;
  if (endM > 12) {
    endM = 1;
    endY += 1;
  }
  const nextStart = buildStart(endY, endM, day);
  const end = new Date(nextStart.getTime() - 1);

  return { start, end, year: startY, month: startM, diaInicio: day };
};

// Rango [start, end] de un periodo mensual concreto (year, month1 de 1 a 12).
const getMonthPeriodFor = (diaInicio, year, month1) => {
  const day = clampDay(diaInicio);
  const start = buildStart(year, month1, day);

  let endM = month1 + 1;
  let endY = year;
  if (endM > 12) {
    endM = 1;
    endY += 1;
  }
  const nextStart = buildStart(endY, endM, day);
  const end = new Date(nextStart.getTime() - 1);

  return { start, end, year, month: month1, diaInicio: day };
};

const getDiaInicioMes = async () => {
  try {
    const cfg = await getSystemConfigDoc();
    return clampDay(cfg.diaInicioMes);
  } catch {
    return 1;
  }
};

module.exports = { getMonthPeriod, getMonthPeriodFor, getDiaInicioMes, clampDay };
