import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Section } from "@/components/Section";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { ListItem } from "@/components/ListItem";
import { EmptyState } from "@/components/EmptyState";
import { useAuthStore } from "@/state/authStore";
import { signOut } from "@/services/auth";
import { fetchRecentReading } from "@/services/readingActivity";
import { getPrayerTimes } from "@/services/prayerTimes";
import { formatTime } from "@/utils/format";
import { theme } from "@/theme/theme";

export const DashboardScreen = () => {
  const router = useRouter();
  const { user, role } = useAuthStore();
  const { data: recent } = useQuery({
    queryKey: ["reading", user?.id],
    queryFn: () => fetchRecentReading(user?.id ?? ""),
    enabled: !!user?.id
  });

  const prayerTimes = useMemo(() => getPrayerTimes(), []);
  const nextPrayer = prayerTimes.find((item) => item.time > new Date());
  const displayName =
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "Friend";

  return (
    <Screen scroll>
      <Card style={styles.hero}>
        <View style={styles.heroHeader}>
          <Text variant="caption" muted>
            Today
          </Text>
          <Button label="Sign out" variant="ghost" onPress={signOut} />
        </View>
        <Text variant="heading" style={styles.heroTitle}>
          Assalamu Alaikum, {displayName}
        </Text>
        <Text variant="body" muted>
          Curated knowledge, athkar, and tools to keep you on the path.
        </Text>
        <View style={styles.heroActions}>
          <Button
            label="Continue Reading"
            onPress={() => router.push("/library")}
            variant="primary"
          />
          <Button
            label="View Athkar"
            onPress={() => router.push("/athkar")}
            variant="secondary"
          />
        </View>
      </Card>

      <Card>
        <View style={styles.sectionHeader}>
          <Text variant="title">Prayer Times</Text>
          {nextPrayer ? (
            <Text variant="body" style={styles.nextPrayer}>
              Next: {nextPrayer.name} · {formatTime(nextPrayer.time)}
            </Text>
          ) : null}
        </View>
        <View style={styles.prayerGrid}>
          {prayerTimes.map((item) => (
            <View key={item.name} style={styles.prayerItem}>
              <Text variant="caption" muted>
                {item.name}
              </Text>
              <Text variant="body">{formatTime(item.time)}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Section title="Quick Actions">
        <View style={styles.actions}>
          <Button label="Library" variant="secondary" onPress={() => router.push("/library")} />
          <Button label="Athkar" variant="secondary" onPress={() => router.push("/athkar")} />
          <Button label="Notes" variant="secondary" onPress={() => router.push("/notes")} />
          <Button label="Collections" variant="ghost" onPress={() => router.push("/collection")} />
        </View>
      </Section>

      {role === "admin" ? (
        <Card style={styles.adminCard}>
          <Text variant="caption" muted>
            Admin
          </Text>
          <Text variant="title">Platform Controls</Text>
          <Text variant="body" muted>
            Manage resources, metadata, athkar, and categories securely.
          </Text>
          <Button
            label="Go to Admin Panel"
            onPress={() => router.push("/admin")}
            variant="primary"
          />
        </Card>
      ) : null}

      <Section title="Recently Opened">
        {recent && recent.length > 0 ? (
          <View style={styles.list}>
            {recent.map((item) => (
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
            title="No recent reading yet"
            subtitle="Open a book to see it here."
          />
        )}
      </Section>
    </Screen>
  );
};

const styles = StyleSheet.create({
  hero: {
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.cardElevated,
    position: "relative"
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  heroTitle: {
    letterSpacing: 0.3
  },
  heroActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    flexWrap: "wrap"
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline"
  },
  nextPrayer: {
    color: theme.colors.textPrimary
  },
  prayerGrid: {
    marginTop: theme.spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  prayerItem: {
    width: "30%",
    gap: 4,
    paddingVertical: theme.spacing.xs
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  adminCard: {
    gap: theme.spacing.xs,
    borderColor: theme.colors.accentSoft
  },
  list: {
    gap: theme.spacing.sm
  }
});
