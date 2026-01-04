import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { useAuthStore } from "@/state/authStore";
import { supabase } from "@/services/supabaseClient";
import { setSetupCompleted } from "@/services/setup";
import { theme } from "@/theme/theme";

export default function SetupScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [year, setYear] = useState<string>();
  const [month, setMonth] = useState<string>();
  const [day, setDay] = useState<string>();
  const [madhab, setMadhab] = useState<string>();
  const [loading, setLoading] = useState(false);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 90 }, (_, idx) => `${current - idx - 5}`);
  }, []);

  const months = useMemo(
    () => [
      { label: "Jan", value: "01" },
      { label: "Feb", value: "02" },
      { label: "Mar", value: "03" },
      { label: "Apr", value: "04" },
      { label: "May", value: "05" },
      { label: "Jun", value: "06" },
      { label: "Jul", value: "07" },
      { label: "Aug", value: "08" },
      { label: "Sep", value: "09" },
      { label: "Oct", value: "10" },
      { label: "Nov", value: "11" },
      { label: "Dec", value: "12" }
    ],
    []
  );

  const days = useMemo(() => {
    if (!year || !month) {
      return Array.from({ length: 31 }, (_, i) => `${i + 1}`.padStart(2, "0"));
    }
    const max = new Date(Number(year), Number(month), 0).getDate();
    return Array.from({ length: max }, (_, i) => `${i + 1}`.padStart(2, "0"));
  }, [month, year]);

  const formattedBirthday =
    year && month && day ? `${year}-${month}-${day}` : null;

  const completeSetup = async () => {
    if (!formattedBirthday) {
      Alert.alert("Birthday required", "Please select your birthday.");
      return;
    }
    if (!madhab) {
      Alert.alert("Select madhab", "Please choose your madhab.");
      return;
    }

    try {
      setLoading(true);
      if (user?.id) {
        await supabase
          .from("profiles")
          .update({ birth_date: formattedBirthday, madhab })
          .eq("id", user.id);
      }
    } catch (error) {
      console.warn("Unable to persist setup to Supabase", error);
    } finally {
      await setSetupCompleted(true);
      setLoading(false);
      router.replace("/");
    }
  };

  return (
    <Screen scroll>
      <Card style={styles.hero}>
        <Text variant="caption" muted>
          Tareeq Al Haqq
        </Text>
        <Text variant="heading">Welcome</Text>
        <Text variant="body" muted>
          A brief setup to personalize your experience and ensure appropriate content.
        </Text>
      </Card>

      <Card style={styles.form}>
        <Text variant="title">Your birthday</Text>
        <Text variant="body" muted>
          We use this to present age-appropriate resources and events.
        </Text>
        <View style={styles.selectorRow}>
          <Dropdown
            label="Year"
            selected={year}
            options={years}
            onSelect={setYear}
          />
          <Dropdown
            label="Month"
            selected={month}
            options={months.map((m) => m.value)}
            displayOptions={months.map((m) => m.label)}
            onSelect={setMonth}
          />
          <Dropdown
            label="Day"
            selected={day}
            options={days}
            onSelect={setDay}
          />
        </View>
      </Card>

      <Card style={styles.form}>
        <Text variant="title">Madhab</Text>
        <Text variant="body" muted>
          Select your school of jurisprudence to tailor guidance and resources.
        </Text>
        <View style={styles.madhabRow}>
          {["hanafi", "shafii", "maliki", "hanbali"].map((option) => (
            <Chip
              key={option}
              label={option.charAt(0).toUpperCase() + option.slice(1)}
              active={madhab === option}
              onPress={() => setMadhab(option)}
            />
          ))}
        </View>
        <Button
          label={loading ? "Saving..." : "Continue"}
          onPress={completeSetup}
          disabled={loading}
        />
      </Card>
    </Screen>
  );
}

type DropdownProps = {
  label: string;
  selected?: string;
  options: string[];
  displayOptions?: string[];
  onSelect: (value: string) => void;
};

const Dropdown = ({
  label,
  selected,
  options,
  displayOptions,
  onSelect
}: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const display = displayOptions ?? options;

  return (
    <View style={styles.dropdown}>
      <Text variant="caption" muted>
        {label}
      </Text>
      <Pressable
        style={styles.dropdownButton}
        onPress={() => setOpen((prev) => !prev)}
      >
        <Text variant="body" style={styles.dropdownLabel}>
          {selected ? display[options.indexOf(selected)] ?? selected : "Select"}
        </Text>
      </Pressable>
      {open ? (
        <View style={styles.dropdownList}>
          <ScrollView>
            {options.map((option, idx) => (
              <Pressable
                key={option}
                style={styles.dropdownItem}
                onPress={() => {
                  onSelect(option);
                  setOpen(false);
                }}
              >
                <Text variant="body">
                  {displayOptions ? displayOptions[idx] : option}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  hero: {
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.cardElevated
  },
  form: {
    gap: theme.spacing.sm
  },
  selectorRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    flexWrap: "wrap"
  },
  dropdown: {
    flex: 1,
    minWidth: 100,
    gap: theme.spacing.xs
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.card
  },
  dropdownLabel: {
    color: theme.colors.textPrimary
  },
  dropdownList: {
    marginTop: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.card,
    maxHeight: 200
  },
  dropdownItem: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs
  },
  madhabRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  }
});
