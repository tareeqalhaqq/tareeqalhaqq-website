import { StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import {
  fetchAthkarByCategory,
  fetchAthkarCategoryBySlug
} from "@/services/athkar";
import { theme } from "@/theme/theme";

export const AthkarDetailScreen = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const { data: category } = useQuery({
    queryKey: ["athkar-category", slug],
    queryFn: () => fetchAthkarCategoryBySlug(slug ?? ""),
    enabled: !!slug
  });

  const { data: items } = useQuery({
    queryKey: ["athkar-items", category?.id],
    queryFn: () => fetchAthkarByCategory(category?.id ?? ""),
    enabled: !!category?.id
  });

  if (!category) {
    return (
      <Screen scroll>
        <EmptyState title="Loading athkar..." subtitle="Fetching content." />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="heading">{category.name}</Text>
        <Text variant="body" muted>
          {category.time_of_day ?? "Remembrance"}
        </Text>
      </View>

      {items && items.length > 0 ? (
        <View style={styles.list}>
          {items.map((item) => (
            <Card key={item.id} style={styles.card}>
              <Text style={styles.arabic}>{item.arabic_text}</Text>
              {item.transliteration ? (
                <Text variant="caption" muted>
                  {item.transliteration}
                </Text>
              ) : null}
              {item.translation ? (
                <Text variant="body">{item.translation}</Text>
              ) : null}
              {item.repeat ? (
                <Text variant="caption" muted>
                  Repeat: {item.repeat}x
                </Text>
              ) : null}
            </Card>
          ))}
        </View>
      ) : (
        <EmptyState
          title="No athkar yet"
          subtitle="Add items to this category in Supabase."
        />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    gap: theme.spacing.xs
  },
  list: {
    gap: theme.spacing.md
  },
  card: {
    gap: theme.spacing.sm
  },
  arabic: {
    fontSize: 20,
    lineHeight: 30,
    color: theme.colors.textPrimary,
    textAlign: "right"
  }
});
