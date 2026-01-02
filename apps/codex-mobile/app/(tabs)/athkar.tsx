import { ScrollView, StyleSheet, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { CategoryCard } from '@/features/athkar/CategoryCard';
import { fetchAthkarCategories } from '@/services/athkar';
import { colors, spacing, typography } from '@/theme';

export default function AthkarScreen() {
  const router = useRouter();
  const { data = [] } = useQuery({ queryKey: ['athkar-categories'], queryFn: fetchAthkarCategories });

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <SectionHeader title="Athkar" subtitle="Morning & evening remembrances" />
        {data.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onPress={() => router.push(`/athkar/${category.id}`)}
          />
        ))}
        {!data.length && <Text style={styles.empty}>No athkar categories found.</Text>}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.md
  },
  empty: {
    color: colors.textMuted,
    ...typography.body
  }
});
