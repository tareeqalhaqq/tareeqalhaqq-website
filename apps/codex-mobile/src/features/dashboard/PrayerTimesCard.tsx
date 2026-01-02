import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { colors, spacing, typography } from '@/theme';
import { PrayerTimes } from '@/services/prayerTimes';

type PrayerTimesCardProps = {
  times: PrayerTimes;
  cityLabel: string;
};

export function PrayerTimesCard({ times, cityLabel }: PrayerTimesCardProps) {
  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title}>Prayer Times</Text>
        <Text style={styles.subtitle}>{cityLabel}</Text>
      </View>
      <View style={styles.grid}>
        {Object.entries(times).map(([label, time]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.label}>{label.toUpperCase()}</Text>
            <Text style={styles.time}>{time}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.sm
  },
  title: {
    color: colors.textPrimary,
    ...typography.title
  },
  subtitle: {
    color: colors.textMuted,
    ...typography.caption
  },
  grid: {
    gap: spacing.sm
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  label: {
    color: colors.textMuted,
    ...typography.caption
  },
  time: {
    color: colors.textPrimary,
    ...typography.body,
    fontWeight: '600'
  }
});
