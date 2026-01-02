export type PrayerTimes = {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

export async function fetchPrayerTimes(city = 'Makkah', country = 'Saudi Arabia') {
  const today = new Date();
  const date = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
  const response = await fetch(
    `https://api.aladhan.com/v1/timingsByCity/${date}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`
  );

  if (!response.ok) {
    throw new Error('Unable to load prayer times');
  }

  const payload = await response.json();
  const timings = payload?.data?.timings ?? {};

  return {
    fajr: timings.Fajr ?? '--',
    dhuhr: timings.Dhuhr ?? '--',
    asr: timings.Asr ?? '--',
    maghrib: timings.Maghrib ?? '--',
    isha: timings.Isha ?? '--'
  } as PrayerTimes;
}
