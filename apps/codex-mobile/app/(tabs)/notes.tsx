import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { NoteCard } from '@/features/notes/NoteCard';
import { fetchNotes } from '@/services/notes';
import { useAuth } from '@/services/auth';
import { colors, spacing, typography } from '@/theme';

export default function NotesScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { data = [] } = useQuery({
    queryKey: ['notes', session?.user.id],
    queryFn: () => fetchNotes(session?.user.id ?? ''),
    enabled: Boolean(session?.user.id)
  });

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <SectionHeader title="Notes" subtitle="Global and book notes" />
          <TouchableOpacity onPress={() => router.push('/note/new')} style={styles.newButton}>
            <Text style={styles.newButtonText}>New</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.list}>
          {data.map((note) => (
            <TouchableOpacity key={note.id} onPress={() => router.push(`/note/${note.id}`)}>
              <NoteCard note={note} />
            </TouchableOpacity>
          ))}
          {!data.length && <Text style={styles.empty}>No notes yet.</Text>}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  newButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.accent
  },
  newButtonText: {
    color: colors.background,
    ...typography.caption,
    fontWeight: '600'
  },
  list: {
    gap: spacing.md
  },
  empty: {
    color: colors.textMuted,
    ...typography.body
  }
});
