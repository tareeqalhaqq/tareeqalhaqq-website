import { StyleSheet, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Section } from "@/components/Section";
import { Button } from "@/components/Button";
import { ListItem } from "@/components/ListItem";
import { EmptyState } from "@/components/EmptyState";
import { useAuthStore } from "@/state/authStore";
import { fetchNotes } from "@/services/notes";
import { theme } from "@/theme/theme";

export const NotesScreen = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: notes } = useQuery({
    queryKey: ["notes", user?.id],
    queryFn: () => fetchNotes(user?.id ?? ""),
    enabled: !!user?.id
  });

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="heading">Notes</Text>
        <Text variant="body" muted>
          Capture reflections and keep them connected to each book.
        </Text>
      </View>

      <Section
        title="All Notes"
        trailing={<Button label="New Note" onPress={() => router.push("/note/new")} />}
      >
        {notes && notes.length > 0 ? (
          <View style={styles.list}>
            {notes.map((note) => (
              <ListItem
                key={note.id}
                title={note.title}
                subtitle={note.book_id ? "Linked to a book" : "General note"}
                onPress={() => router.push(`/note/${note.id}`)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title="No notes yet"
            subtitle="Create a note to keep your learning organized."
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
  list: {
    gap: theme.spacing.sm
  }
});
