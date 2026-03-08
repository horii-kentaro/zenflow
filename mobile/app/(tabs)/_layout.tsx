import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/stores/app-store';
import { colors } from '@/constants/theme';

type TabIcon = React.ComponentProps<typeof Ionicons>['name'];

const tabs: { name: string; title: string; icon: TabIcon; iconFocused: TabIcon; badgeKey?: 'mood' | 'selfcare' | 'journal' }[] = [
  { name: 'dashboard', title: 'ホーム', icon: 'home-outline', iconFocused: 'home' },
  { name: 'mood', title: '気分', icon: 'happy-outline', iconFocused: 'happy', badgeKey: 'mood' },
  { name: 'selfcare', title: 'ケア', icon: 'leaf-outline', iconFocused: 'leaf', badgeKey: 'selfcare' },
  { name: 'journal', title: 'AI日記', icon: 'chatbubble-outline', iconFocused: 'chatbubble', badgeKey: 'journal' },
  { name: 'settings', title: '設定', icon: 'settings-outline', iconFocused: 'settings' },
];

function TabIconWithBadge({
  name,
  size,
  color,
  showBadge,
}: {
  name: TabIcon;
  size: number;
  color: string;
  showBadge: boolean;
}) {
  return (
    <View>
      <Ionicons name={name} size={size} color={color} />
      {showBadge && <View style={badgeStyles.dot} />}
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  dot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.mood.bad,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
});

export default function TabsLayout() {
  const todayStatus = useAppStore((s) => s.todayStatus);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.neutral[400],
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.neutral[100],
          height: 88,
          paddingBottom: 28,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color, size }) => {
              const showBadge = tab.badgeKey ? !todayStatus[tab.badgeKey] : false;
              return (
                <TabIconWithBadge
                  name={focused ? tab.iconFocused : tab.icon}
                  size={size}
                  color={color}
                  showBadge={showBadge}
                />
              );
            },
          }}
        />
      ))}
    </Tabs>
  );
}
