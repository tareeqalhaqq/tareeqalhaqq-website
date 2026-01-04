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
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text variant="heading">Assalamu Alaikum, {displayName}</Text>
          <Button label="Sign out" variant="ghost" onPress={signOut} />
        </View>
        <Text variant="body" muted>
          Continue your path with clarity and focus.
        </Text>
      </View>

      <Card>
        <Text variant="title">Prayer Times</Text>
        {nextPrayer ? (
          <Text variant="body" style={styles.nextPrayer}>
            Next: {nextPrayer.name} · {formatTime(nextPrayer.time)}
          </Text>
        ) : null}
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
        </View>
      </Section>

      {role === "admin" ? (
        <Card>
          <Text variant="title">Admin Access</Text>
          <Text variant="body" muted>
            Manage content, metadata, and platform updates.
          </Text>
          <Button
            label="Go to Admin Panel"
            onPress={() => router.push("/admin")}
            variant="secondary"
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
  header: {
    gap: theme.spacing.xs
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  nextPrayer: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textPrimary
  },
  prayerGrid: {
    marginTop: theme.spacing.sm,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  prayerItem: {
    width: "30%",
    gap: 4
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  list: {
    gap: theme.spacing.sm
  }
});
