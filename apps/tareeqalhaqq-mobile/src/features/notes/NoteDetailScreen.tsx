import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { useAuthStore } from "@/state/authStore";
import { createNote, deleteNote, fetchNotes, updateNote } from "@/services/notes";
import { theme } from "@/theme/theme";

export const NoteDetailScreen = () => {
  const { id, bookId } = useLocalSearchParams<{ id: string; bookId?: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isNew = id === "new";

  const { data: notes } = useQuery({
    queryKey: ["notes", user?.id],
    queryFn: () => fetchNotes(user?.id ?? ""),
    enabled: !!user?.id && !isNew
  });

  const existing = notes?.find((note) => note.id === id);

  const [title, setTitle] = useState(existing?.title ?? "");
  const [content, setContent] = useState(existing?.content ?? "");
  const [location, setLocation] = useState(existing?.location ?? "");

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setContent(existing.content);
      setLocation(existing.location ?? "");
    }
  }, [existing]);

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!user?.id) {
        throw new Error("Missing user session.");
      }

      if (isNew) {
        return createNote({
          user_id: user.id,
          book_id: bookId ?? null,
          title,
          content,
          location: location || null
        });
      }

      return updateNote(id ?? "", {
        title,
        content,
        location: location || null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      router.back();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteNote(id ?? ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      router.back();
    }
  });

  if (!isNew && !existing) {
    return (
      <Screen scroll>
        <EmptyState title="Note not found" subtitle="Return to notes and try again." />
      </Screen>
    );
  }

  const handleDelete = () => {
    Alert.alert("Delete note?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate() }
    ]);
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="heading">{isNew ? "New Note" : "Edit Note"}</Text>
        <Text variant="body" muted>
          {bookId ? "Linked to a specific book." : "A general note for your library."}
        </Text>
      </View>

      <View style={styles.form}>
        <Input placeholder="Title" value={title} onChangeText={setTitle} />
        <Input
          placeholder="Content"
          value={content}
          onChangeText={setContent}
          multiline
          style={styles.textArea}
        />
        <Input
          placeholder="Location / reference"
          value={location}
          onChangeText={setLocation}
        />
      </View>

      <View style={styles.actions}>
        <Button label={saveMutation.isPending ? "Saving..." : "Save"} onPress={() => saveMutation.mutate()} />
        {!isNew ? (
          <Button label="Delete" variant="secondary" onPress={handleDelete} />
        ) : null}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    gap: theme.spacing.xs
  },
  form: {
    gap: theme.spacing.sm
  },
  textArea: {
    minHeight: 160,
    textAlignVertical: "top"
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing.sm
  }
});
