import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { Button } from '@/components/Button';
import { PrayerTimesCard } from '@/features/dashboard/PrayerTimesCard';
import { RecentlyOpenedList } from '@/features/dashboard/RecentlyOpenedList';
import { fetchPrayerTimes } from '@/services/prayerTimes';
import { fetchReadingActivity } from '@/services/activity';
import { useAuth } from '@/services/auth';
import { supabase } from '@/services/supabase';
import { colors, spacing, typography } from '@/theme';

export default function DashboardScreen() {
  const { session } = useAuth();

  const prayerTimesQuery = useQuery({
    queryKey: ['prayer-times'],
    queryFn: () => fetchPrayerTimes('Makkah', 'Saudi Arabia')
  });

  const activityQuery = useQuery({
    queryKey: ['reading-activity', session?.user.id],
    queryFn: () => fetchReadingActivity(session?.user.id ?? ''),
    enabled: Boolean(session?.user.id)
  });

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Assalamu alaikum</Text>
            <Text style={styles.subtitle}>Continue your journey of knowledge.</Text>
          </View>
          <Button label="Sign Out" variant="secondary" onPress={() => supabase.auth.signOut()} />
        </View>

        <SectionHeader title="Prayer Times" subtitle="Daily schedule" />
        {prayerTimesQuery.data ? (
          <PrayerTimesCard times={prayerTimesQuery.data} cityLabel="Makkah, Saudi Arabia" />
        ) : (
          <Text style={styles.loading}>Loading prayer times...</Text>
        )}

        <SectionHeader title="Recently Opened" subtitle="Pick up where you left off" />
        <RecentlyOpenedList items={activityQuery.data ?? []} />

        <SectionHeader title="Quick Actions" subtitle="Jump to key areas" />
        <View style={styles.actions}>
          {['Add Note', 'Browse Library', 'Open Athkar'].map((action) => (
            <View key={action} style={styles.actionCard}>
              <Text style={styles.actionText}>{action}</Text>
            </View>
          ))}
        </View>

        <SectionHeader title="Athkar Focus" subtitle="Curated for today" />
        <View style={styles.athkarTeaser}>
          <Text style={styles.athkarTitle}>Evening Remembrance</Text>
          <Text style={styles.athkarSubtitle}>A selection of adhkar to close your day.</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md
  },
  title: {
    color: colors.textPrimary,
    ...typography.heading
  },
  subtitle: {
    color: colors.textMuted,
    ...typography.body
  },
  loading: {
    color: colors.textMuted,
    ...typography.body
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  actionText: {
    color: colors.textPrimary,
    ...typography.body,
    fontWeight: '600'
  },
  athkarTeaser: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  athkarTitle: {
    color: colors.textPrimary,
    ...typography.title
  },
  athkarSubtitle: {
    color: colors.textMuted,
    ...typography.caption
  }
});
