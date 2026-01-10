import { StyleSheet, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { ListItem } from "@/components/ListItem";
import { EmptyState } from "@/components/EmptyState";
import { fetchAthkarCategories } from "@/services/athkar";
import { theme } from "@/theme/theme";

export const AthkarScreen = () => {
  const router = useRouter();
  const { data: categories } = useQuery({
    queryKey: ["athkar-categories"],
    queryFn: fetchAthkarCategories
  });

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="heading">Athkar</Text>
        <Text variant="body" muted>
          Morning and evening remembrance, organized with clarity.
        </Text>
      </View>

      {categories && categories.length > 0 ? (
        <View style={styles.list}>
          {categories.map((category) => (
            <ListItem
              key={category.id}
              title={category.name}
              subtitle={category.time_of_day ?? "Remembrance"}
              onPress={() => router.push(`/athkar/${category.slug}`)}
            />
          ))}
        </View>
      ) : (
        <EmptyState
          title="No athkar yet"
          subtitle="Athkar content isn't available yet."
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
    gap: theme.spacing.sm
  }
});
