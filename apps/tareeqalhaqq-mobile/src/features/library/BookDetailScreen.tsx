import { StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Button } from "@/components/Button";
import { Section } from "@/components/Section";
import { ListItem } from "@/components/ListItem";
import { EmptyState } from "@/components/EmptyState";
import { fetchBookById } from "@/services/books";
import {
  addToCollection,
  fetchCollectionItem,
  removeFromCollection
} from "@/services/collection";
import { fetchNotes } from "@/services/notes";
import { upsertReadingActivity } from "@/services/readingActivity";
import { useAuthStore } from "@/state/authStore";
import { theme } from "@/theme/theme";

export const BookDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: book } = useQuery({
    queryKey: ["book", id],
    queryFn: () => fetchBookById(id ?? ""),
    enabled: !!id
  });

  const { data: collectionItem } = useQuery({
    queryKey: ["collection-item", user?.id, id],
    queryFn: () => fetchCollectionItem(user?.id ?? "", id ?? ""),
    enabled: !!user?.id && !!id
  });

  const { data: notes } = useQuery({
    queryKey: ["notes", user?.id, id],
    queryFn: () => fetchNotes(user?.id ?? "", id ?? ""),
    enabled: !!user?.id && !!id
  });

  const addMutation = useMutation({
    mutationFn: () => addToCollection(user?.id ?? "", id ?? ""),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collection"] })
  });

  const removeMutation = useMutation({
    mutationFn: () => removeFromCollection(user?.id ?? "", id ?? ""),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collection"] })
  });

  const handleOpen = async () => {
    if (user?.id && id) {
      await upsertReadingActivity(user.id, id);
    }
  };

  if (!book) {
    return (
      <Screen scroll>
        <EmptyState title="Loading book..." subtitle="Fetching details." />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="heading">{book.title}</Text>
        <Text variant="body" muted>
          {book.author ?? "Unknown author"}
        </Text>
      </View>

      {book.description ? (
        <Text variant="body">{book.description}</Text>
      ) : null}

      <View style={styles.actions}>
        <Button label="Open" onPress={handleOpen} />
        {collectionItem ? (
          <Button
            label="Remove"
            variant="secondary"
            onPress={() => removeMutation.mutate()}
          />
        ) : (
          <Button
            label="Save to Collection"
            variant="secondary"
            onPress={() => addMutation.mutate()}
          />
        )}
      </View>

      <Section
        title="Notes"
        trailing={
          <Button
            label="Add"
            variant="ghost"
            onPress={() => router.push(`/note/new?bookId=${id}`)}
          />
        }
      >
        {notes && notes.length > 0 ? (
          <View style={styles.list}>
            {notes.map((note) => (
              <ListItem
                key={note.id}
                title={note.title}
                subtitle={note.location ?? "Book note"}
                onPress={() => router.push(`/note/${note.id}`)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title="No notes yet"
            subtitle="Add your first reflection for this book."
          />
        )}
      </Section>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    gap: theme.spacing.xs
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing.sm
  },
  list: {
    gap: theme.spacing.sm
  }
});
