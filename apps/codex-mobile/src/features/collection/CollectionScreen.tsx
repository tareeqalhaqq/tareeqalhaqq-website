import { StyleSheet, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Section } from "@/components/Section";
import { ListItem } from "@/components/ListItem";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { useAuthStore } from "@/state/authStore";
import {
  fetchCollection,
  removeFromCollection,
  togglePinned
} from "@/services/collection";
import { theme } from "@/theme/theme";

export const CollectionScreen = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: collection } = useQuery({
    queryKey: ["collection", user?.id],
    queryFn: () => fetchCollection(user?.id ?? ""),
    enabled: !!user?.id
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, pinned }: { id: string; pinned: boolean }) =>
      togglePinned(id, pinned),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collection"] })
  });

  const removeMutation = useMutation({
    mutationFn: ({ userId, bookId }: { userId: string; bookId: string }) =>
      removeFromCollection(userId, bookId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collection"] })
  });

  const pinned = collection?.filter((item) => item.pinned) ?? [];
  const saved = collection?.filter((item) => !item.pinned) ?? [];

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="heading">My Collection</Text>
        <Text variant="body" muted>
          Keep your saved knowledge close at hand.
        </Text>
      </View>

      <Section title="Pinned">
        {pinned.length > 0 ? (
          <View style={styles.list}>
            {pinned.map((item) => (
              <ListItem
                key={item.id}
                title={item.book?.title ?? "Untitled"}
                subtitle={item.book?.author}
                trailing={
                  <Button
                    label="Unpin"
                    variant="ghost"
                    onPress={() =>
                      toggleMutation.mutate({ id: item.id, pinned: false })
                    }
                  />
                }
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title="Nothing pinned"
            subtitle="Pin items to keep them at the top."
          />
        )}
      </Section>

      <Section title="Saved">
        {saved.length > 0 ? (
          <View style={styles.list}>
            {saved.map((item) => (
              <ListItem
                key={item.id}
                title={item.book?.title ?? "Untitled"}
                subtitle={item.book?.author}
                trailing={
                  <View style={styles.actions}>
                    <Button
                      label="Pin"
                      variant="ghost"
                      onPress={() =>
                        toggleMutation.mutate({ id: item.id, pinned: true })
                      }
                    />
                    <Button
                      label="Remove"
                      variant="ghost"
                      onPress={() =>
                        user?.id &&
                        removeMutation.mutate({
                          userId: user.id,
                          bookId: item.book_id
                        })
                      }
                    />
                  </View>
                }
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title="No saved items"
            subtitle="Add books from the library to see them here."
          />
        )}
      </Section>

      <Section title="Downloaded">
        <EmptyState
          title="Offline downloads coming soon"
          subtitle="Download support is planned for a later release."
        />
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
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing.xs
  }
});
