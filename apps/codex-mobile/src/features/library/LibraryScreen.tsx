import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Input } from "@/components/Input";
import { Chip } from "@/components/Chip";
import { ListItem } from "@/components/ListItem";
import { EmptyState } from "@/components/EmptyState";
import { Card } from "@/components/Card";
import { Section } from "@/components/Section";
import { fetchBooks } from "@/services/books";
import { fetchCollection } from "@/services/collection";
import { useAuthStore } from "@/state/authStore";
import { theme } from "@/theme/theme";

export const LibraryScreen = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const { data: books } = useQuery({
    queryKey: ["books", search, category],
    queryFn: () => fetchBooks(search, category)
  });
  const { data: collection } = useQuery({
    queryKey: ["collection", user?.id],
    queryFn: () => fetchCollection(user?.id ?? ""),
    enabled: !!user?.id
  });

  const categories = useMemo(() => {
    const list = new Set<string>();
    books?.forEach((book) => {
      if (book.category) list.add(book.category);
    });
    return ["all", ...Array.from(list)];
  }, [books]);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="heading">Library</Text>
        <Text variant="body" muted>
          Explore the full knowledge repository.
        </Text>
      </View>

      <Section title="My Books" subtitle="Your saved and pinned readings.">
        {collection && collection.length > 0 ? (
          <View style={styles.list}>
            {collection.map((item) => (
              <ListItem
                key={item.id}
                title={item.book?.title ?? "Untitled"}
                subtitle={item.book?.author ?? "Unknown author"}
                onPress={() => router.push(`/book/${item.book_id}`)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title="No saved books yet"
            subtitle="Save a book to keep it close."
          />
        )}
      </Section>

      <Section title="All Resources" subtitle="Search the full library.">
        <Input
          placeholder="Search books and resources"
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.chips}>
          {categories.map((item) => (
            <Chip
              key={item}
              label={item === "all" ? "All" : item}
              active={category === item}
              onPress={() => setCategory(item)}
            />
          ))}
        </View>

        {books && books.length > 0 ? (
          <View style={styles.list}>
            {books.map((book) => (
              <ListItem
                key={book.id}
                title={book.title}
                subtitle={book.author}
                onPress={() => router.push(`/book/${book.id}`)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title="No results yet"
            subtitle="Try a different search or category."
          />
        )}
      </Section>

      <Section title="Store" subtitle="Premium collections and learning tools.">
        <View style={styles.storeGrid}>
          {[
            {
              title: "Premium Tafsir Pack",
              subtitle: "Curated commentaries",
              price: "$19"
            },
            {
              title: "Guided Journals",
              subtitle: "Reflection templates",
              price: "$9"
            },
            {
              title: "Audio Bundle",
              subtitle: "Scholarly lectures",
              price: "$29"
            }
          ].map((item) => (
            <Card key={item.title} style={styles.storeCard}>
              <Text variant="title">{item.title}</Text>
              <Text variant="body" muted>
                {item.subtitle}
              </Text>
              <Text variant="heading">{item.price}</Text>
            </Card>
          ))}
        </View>
      </Section>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    gap: theme.spacing.xs
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  list: {
    gap: theme.spacing.sm
  },
  storeGrid: {
    gap: theme.spacing.md
  },
  storeCard: {
    gap: theme.spacing.xs
  }
});
