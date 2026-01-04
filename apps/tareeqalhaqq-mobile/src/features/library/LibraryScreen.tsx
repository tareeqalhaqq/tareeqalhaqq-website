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
import { Button } from "@/components/Button";
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
      <Card style={styles.hero}>
        <Text variant="caption" muted>
          Library
        </Text>
        <Text variant="heading">Explore the archive</Text>
        <Text variant="body" muted>
          Search curated texts, lectures, and guided notes built for focus.
        </Text>
        <View style={styles.stats}>
          <View style={styles.statCard}>
            <Text variant="caption" muted>
              My books
            </Text>
            <Text variant="title">{collection?.length ?? 0}</Text>
          </View>
          <View style={styles.statCard}>
            <Text variant="caption" muted>
              All resources
            </Text>
            <Text variant="title">{books?.length ?? 0}</Text>
          </View>
          <View style={styles.statCard}>
            <Text variant="caption" muted>
              Categories
            </Text>
            <Text variant="title">
              {Math.max(categories.length - 1, 0)}
            </Text>
          </View>
        </View>
      </Card>

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
              price: "$19",
              cta: "View pack"
            },
            {
              title: "Guided Journals",
              subtitle: "Reflection templates",
              price: "$9",
              cta: "Preview pages"
            },
            {
              title: "Audio Bundle",
              subtitle: "Scholarly lectures",
              price: "$29",
              cta: "See details"
            }
          ].map((item) => (
            <Card key={item.title} style={styles.storeCard}>
              <Text variant="title">{item.title}</Text>
              <Text variant="body" muted>
                {item.subtitle}
              </Text>
              <View style={styles.storeRow}>
                <Text variant="heading">{item.price}</Text>
                <Button label={item.cta} variant="secondary" />
              </View>
            </Card>
          ))}
        </View>
      </Section>
    </Screen>
  );
};

const styles = StyleSheet.create({
  hero: {
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.cardElevated
  },
  stats: {
    flexDirection: "row",
    gap: theme.spacing.sm
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.md,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4
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
  },
  storeRow: {
    marginTop: theme.spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.sm
  }
});
