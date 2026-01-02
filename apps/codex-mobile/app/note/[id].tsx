import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { fetchNoteById, upsertNote, deleteNote } from '@/services/notes';
import { useAuth } from '@/services/auth';
import { colors, spacing, typography } from '@/theme';

export default function NoteDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const isNew = id === 'new';

  const { data } = useQuery({
    queryKey: ['note', id],
    queryFn: () => fetchNoteById(id ?? ''),
    enabled: Boolean(id && !isNew)
  });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (data) {
      setTitle(data.title ?? '');
      setContent(data.content ?? '');
    }
  }, [data]);

  const handleSave = async () => {
    if (!session?.user.id) {
      return;
    }

    await upsertNote({
      id: isNew ? undefined : id,
      user_id: session.user.id,
      title,
      content,
      updated_at: new Date().toISOString()
    });

    await queryClient.invalidateQueries({ queryKey: ['notes'] });
    router.replace('/(tabs)/notes');
  };

  const handleDelete = async () => {
    if (!id || isNew) {
      return;
    }
    await deleteNote(id);
    await queryClient.invalidateQueries({ queryKey: ['notes'] });
    router.replace('/(tabs)/notes');
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{isNew ? 'New Note' : 'Edit Note'}</Text>
          {!isNew && (
            <TouchableOpacity onPress={() => Alert.alert('Delete note?', 'This cannot be undone.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: handleDelete }
            ])}>
              <Text style={styles.delete}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
        <TextInput
          style={styles.input}
          placeholder="Note title"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.textarea}
          placeholder="Write your reflections..."
          placeholderTextColor={colors.textMuted}
          value={content}
          onChangeText={setContent}
          multiline
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save Note</Text>
        </TouchableOpacity>
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
  title: {
    color: colors.textPrimary,
    ...typography.heading
  },
  delete: {
    color: colors.danger,
    ...typography.caption
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    color: colors.textPrimary
  },
  textarea: {
    minHeight: 200,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    color: colors.textPrimary,
    textAlignVertical: 'top'
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingVertical: spacing.sm,
    alignItems: 'center'
  },
  saveText: {
    color: colors.background,
    ...typography.body,
    fontWeight: '600'
  }
});
