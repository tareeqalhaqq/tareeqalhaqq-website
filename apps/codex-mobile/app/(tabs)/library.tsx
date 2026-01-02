import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { BookCard } from '@/features/library/BookCard';
import { fetchBooks } from '@/services/library';
import { useLibraryFilters } from '@/state/libraryFilters';
import { colors, spacing, typography } from '@/theme';

export default function LibraryScreen() {
  const router = useRouter();
  const { data = [] } = useQuery({ queryKey: ['books'], queryFn: fetchBooks });
  const { search, category, setCategory, setSearch } = useLibraryFilters();

  const categories = useMemo(
    () => Array.from(new Set(data.map((book) => book.category))).filter(Boolean),
    [data]
  );

  const filtered = data.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category ? book.category === category : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <SectionHeader title="Library" subtitle="Explore all resources" />
        <TextInput
          style={styles.search}
          placeholder="Search books"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <TouchableOpacity
            style={[styles.filterChip, !category && styles.filterActive]}
            onPress={() => setCategory(null)}
          >
            <Text style={styles.filterText}>All</Text>
          </TouchableOpacity>
          {categories.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.filterChip, category === item && styles.filterActive]}
              onPress={() => setCategory(item)}
            >
              <Text style={styles.filterText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.list}>
          {filtered.map((book) => (
            <BookCard key={book.id} book={book} onPress={() => router.push(`/book/${book.id}`)} />
          ))}
          {!filtered.length && <Text style={styles.empty}>No books found.</Text>}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.md
  },
  search: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    color: colors.textPrimary
  },
  filters: {
    gap: spacing.sm
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  filterActive: {
    backgroundColor: colors.surfaceHighlight,
    borderColor: colors.accent
  },
  filterText: {
    color: colors.textSecondary,
    ...typography.caption
  },
  list: {
    gap: spacing.md
  },
  empty: {
    color: colors.textMuted,
    ...typography.body
  }
});
