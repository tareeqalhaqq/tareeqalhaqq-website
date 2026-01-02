import { StyleSheet, Text } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { Card } from '@/components/Card';
import { Note } from '@/services/types';

export function NoteCard({ note }: { note: Note }) {
  return (
    <Card>
      <Text style={styles.title}>{note.title}</Text>
      <Text numberOfLines={2} style={styles.body}>
        {note.content}
      </Text>
      <Text style={styles.caption}>Updated {new Date(note.updated_at).toDateString()}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.textPrimary,
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs
  },
  body: {
    color: colors.textSecondary,
    ...typography.caption
  },
  caption: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    ...typography.caption
  }
});
