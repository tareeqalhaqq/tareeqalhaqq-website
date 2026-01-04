import {
  CalculationMethod,
  Coordinates,
  PrayerTimes,
  Madhab
} from "adhan";

const defaultCoordinates = new Coordinates(21.3891, 39.8579);

export const getPrayerTimes = (date = new Date()) => {
  const params = CalculationMethod.MuslimWorldLeague();
  params.madhab = Madhab.Shafi;
  const prayerTimes = new PrayerTimes(defaultCoordinates, date, params);

  return [
    { name: "Fajr", time: prayerTimes.fajr },
    { name: "Sunrise", time: prayerTimes.sunrise },
    { name: "Dhuhr", time: prayerTimes.dhuhr },
    { name: "Asr", time: prayerTimes.asr },
    { name: "Maghrib", time: prayerTimes.maghrib },
    { name: "Isha", time: prayerTimes.isha }
  ];
};
