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
import { fetchBooks } from "@/services/books";
import { theme } from "@/theme/theme";

export const LibraryScreen = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const { data: books } = useQuery({
    queryKey: ["books", search, category],
    queryFn: () => fetchBooks(search, category)
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
  }
});
