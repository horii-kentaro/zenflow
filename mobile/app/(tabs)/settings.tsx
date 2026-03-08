import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  TextInput,
  Switch,
} from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { api } from '@/lib/api';
import { router } from 'expo-router';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadow } from '@/constants/theme';

const freeFeatures = [
  { icon: 'happy-outline' as const, label: '気分記録（1日1回）' },
  { icon: 'leaf-outline' as const, label: 'セルフケアルーティン（5種類）' },
  { icon: 'chatbubble-outline' as const, label: 'AIジャーナル（1日3回）' },
  { icon: 'bar-chart-outline' as const, label: '7日間の気分チャート' },
  { icon: 'flame-outline' as const, label: '連続記録ストリーク' },
];

const proFeatures = [
  { icon: 'sparkles' as const, label: 'AIウィークリーレポート', desc: 'AIが1週間の傾向を分析・アドバイス' },
  { icon: 'bulb-outline' as const, label: 'AIパーソナライズ提案', desc: '気分に合わせた最適ルーティンを自動提案' },
  { icon: 'calendar' as const, label: '月間ムードマップ', desc: 'カレンダー形式で1ヶ月の気分を可視化' },
  { icon: 'infinite-outline' as const, label: 'AIジャーナル無制限', desc: '回数制限なしで何度でも対話' },
  { icon: 'time-outline' as const, label: '30日間の履歴', desc: 'セルフケア・気分の長期データ閲覧' },
  { icon: 'analytics-outline' as const, label: '感情の相関分析', desc: 'タグと気分の関連性をグラフ表示' },
];


export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const plan = useAppStore((s) => s.plan);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [weeklyReportEnabled, setWeeklyReportEnabled] = useState(false);

  const handleLogout = () => {
    Alert.alert('ログアウト', '本当にログアウトしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'ログアウト',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleSaveName = async () => {
    if (!nameInput.trim() || nameInput === user?.name) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      await api.patch('/api/auth/profile', { name: nameInput.trim() });
      if (user) {
        setUser({ ...user, name: nameInput.trim() });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setEditingName(false);
    } catch (e: any) {
      Alert.alert('エラー', e.message || '名前の更新に失敗しました');
    } finally {
      setSavingName(false);
    }
  };

  const handleToggleReminder = (value: boolean) => {
    setReminderEnabled(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (value) {
      Alert.alert('リマインダー', '毎日20:00にセルフケアのリマインダーを送信します。', [
        { text: 'OK' },
      ]);
    }
  };

  const handleToggleWeeklyReport = (value: boolean) => {
    setWeeklyReportEnabled(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (value) {
      Alert.alert('週間レポート', '毎週月曜日に1週間のまとめをお届けします。', [
        { text: 'OK' },
      ]);
    }
  };


  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerArea}>
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
        >
          <Text style={styles.title}>設定</Text>
        </MotiView>
      </View>

      {/* Profile Card */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 100 }}
        style={styles.profileCard}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.name || 'U')[0].toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          {editingName ? (
            <View style={styles.nameEditRow}>
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                style={styles.nameInput}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
              />
              <Pressable
                onPress={handleSaveName}
                disabled={savingName}
                style={styles.nameSaveButton}
              >
                <Ionicons name="checkmark" size={20} color={colors.primary[600]} />
              </Pressable>
              <Pressable
                onPress={() => setEditingName(false)}
                style={styles.nameCancelButton}
              >
                <Ionicons name="close" size={20} color={colors.neutral[400]} />
              </Pressable>
            </View>
          ) : (
            <Text style={styles.profileName}>{user?.name || 'ユーザー'}</Text>
          )}
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>
              {plan === 'premium' ? 'Pro' : 'Free'}
            </Text>
          </View>
        </View>
      </MotiView>

      <View style={styles.content}>
        {/* アカウント */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200 }}
        >
          <Text style={styles.sectionTitle}>アカウント</Text>
          <View style={styles.sectionCard}>
            {/* 名前 */}
            <Pressable
              onPress={() => {
                setNameInput(user?.name || '');
                setEditingName(true);
              }}
              style={({ pressed }) => [
                styles.settingRow,
                pressed && styles.settingRowPressed,
                styles.settingRowBorder,
              ]}
            >
              <Ionicons name="person-outline" size={20} color={colors.neutral[500]} />
              <Text style={styles.settingLabel}>名前</Text>
              <Text style={styles.settingValue}>{user?.name || '未設定'}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.neutral[300]} />
            </Pressable>

            {/* メール */}
            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <Ionicons name="mail-outline" size={20} color={colors.neutral[500]} />
              <Text style={styles.settingLabel}>メール</Text>
              <Text style={styles.settingValue}>{user?.email || '未設定'}</Text>
            </View>

            {/* プラン */}
            <Pressable
              onPress={() => router.push('/pricing')}
              style={({ pressed }) => [
                styles.settingRow,
                pressed && styles.settingRowPressed,
              ]}
            >
              <Ionicons name="diamond-outline" size={20} color={colors.primary[500]} />
              <Text style={styles.settingLabel}>プラン</Text>
              <View style={[styles.planTag, plan === 'premium' && styles.planTagPro]}>
                <Text style={[styles.planTagText, plan === 'premium' && styles.planTagTextPro]}>
                  {plan === 'premium' ? 'Pro' : 'Free'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.neutral[300]} />
            </Pressable>
          </View>
        </MotiView>

        {/* プランの機能 */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 250 }}
        >
          <Text style={styles.sectionTitle}>プランの機能</Text>

          {/* Free features */}
          <View style={styles.sectionCard}>
            <View style={styles.planSectionHeader}>
              <View style={styles.planSectionBadge}>
                <Ionicons name="leaf" size={14} color={colors.primary[600]} />
                <Text style={styles.planSectionBadgeText}>Free - 利用中の機能</Text>
              </View>
            </View>
            {freeFeatures.map((f, i) => (
              <View
                key={f.label}
                style={[
                  styles.featureRow,
                  i < freeFeatures.length - 1 && styles.featureRowBorder,
                ]}
              >
                <View style={styles.featureIconWrap}>
                  <Ionicons name={f.icon} size={18} color={colors.primary[500]} />
                </View>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Ionicons name="checkmark-circle" size={18} color={colors.primary[500]} />
              </View>
            ))}
          </View>

          {/* Pro features */}
          <View style={[styles.sectionCard, styles.proSectionCard]}>
            <View style={styles.planSectionHeader}>
              <View style={styles.proSectionBadge}>
                <Ionicons name="diamond" size={14} color={colors.white} />
                <Text style={styles.proSectionBadgeText}>
                  Pro - {plan === 'premium' ? '利用中' : '追加機能'}
                </Text>
              </View>
              {plan !== 'premium' && (
                <Text style={styles.proPrice}>月額980円</Text>
              )}
            </View>
            {proFeatures.map((f, i) => (
              <View
                key={f.label}
                style={[
                  styles.featureRow,
                  i < proFeatures.length - 1 && styles.featureRowBorder,
                ]}
              >
                <View style={[styles.featureIconWrap, styles.proFeatureIconWrap]}>
                  <Ionicons name={f.icon} size={18} color={plan === 'premium' ? colors.primary[500] : colors.primary[400]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureLabel}>{f.label}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
                {plan === 'premium' ? (
                  <Ionicons name="checkmark-circle" size={18} color={colors.primary[500]} />
                ) : (
                  <Ionicons name="lock-closed-outline" size={16} color={colors.neutral[300]} />
                )}
              </View>
            ))}

            {plan !== 'premium' && (
              <Pressable
                onPress={() => router.push('/pricing')}
                style={styles.upgradeRow}
              >
                <LinearGradient
                  colors={[colors.primary[500], colors.primary[700]]}
                  style={styles.upgradeButton}
                >
                  <Ionicons name="diamond" size={16} color={colors.white} />
                  <Text style={styles.upgradeButtonText}>Proにアップグレード</Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        </MotiView>

        {/* 通知 */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300 }}
        >
          <Text style={styles.sectionTitle}>通知</Text>
          <View style={styles.sectionCard}>
            {/* リマインダー */}
            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <Ionicons name="notifications-outline" size={20} color={colors.neutral[500]} />
              <View style={styles.settingLabelGroup}>
                <Text style={styles.settingLabel}>リマインダー</Text>
                <Text style={styles.settingDescription}>毎日20:00に通知</Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={handleToggleReminder}
                trackColor={{ false: colors.neutral[200], true: colors.primary[300] }}
                thumbColor={reminderEnabled ? colors.primary[600] : colors.neutral[50]}
              />
            </View>

            {/* 週間レポート */}
            <View style={styles.settingRow}>
              <Ionicons name="document-text-outline" size={20} color={colors.neutral[500]} />
              <View style={styles.settingLabelGroup}>
                <Text style={styles.settingLabel}>週間レポート</Text>
                <Text style={styles.settingDescription}>毎週月曜に配信</Text>
              </View>
              <Switch
                value={weeklyReportEnabled}
                onValueChange={handleToggleWeeklyReport}
                trackColor={{ false: colors.neutral[200], true: colors.primary[300] }}
                thumbColor={weeklyReportEnabled ? colors.primary[600] : colors.neutral[50]}
              />
            </View>
          </View>
        </MotiView>

        {/* その他 */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 400 }}
        >
          <Text style={styles.sectionTitle}>その他</Text>
          <View style={styles.sectionCard}>
            {/* プライバシーポリシー */}
            <Pressable
              onPress={() => router.push('/privacy')}
              style={({ pressed }) => [
                styles.settingRow,
                pressed && styles.settingRowPressed,
                styles.settingRowBorder,
              ]}
            >
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.neutral[500]} />
              <Text style={styles.settingLabel}>プライバシーポリシー</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.neutral[300]} />
            </Pressable>

            {/* 利用規約 */}
            <Pressable
              onPress={() => router.push('/terms')}
              style={({ pressed }) => [
                styles.settingRow,
                pressed && styles.settingRowPressed,
                styles.settingRowBorder,
              ]}
            >
              <Ionicons name="document-outline" size={20} color={colors.neutral[500]} />
              <Text style={styles.settingLabel}>利用規約</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.neutral[300]} />
            </Pressable>

            {/* ログアウト */}
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.settingRow,
                pressed && styles.settingRowPressed,
              ]}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.mood.bad} />
              <Text style={styles.settingLabelDanger}>ログアウト</Text>
            </Pressable>
          </View>
        </MotiView>

        {/* アプリ情報 */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 500 }}
          style={styles.appInfo}
        >
          <Ionicons name="leaf" size={20} color={colors.primary[400]} />
          <Text style={styles.version}>Zenflow v1.0.0</Text>
          <Text style={styles.copyright}>Made with care for your wellness</Text>
        </MotiView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  headerArea: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.extrabold,
    color: colors.neutral[900],
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    ...shadow.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  profileName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[800],
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  nameInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.neutral[800],
    borderBottomWidth: 2,
    borderBottomColor: colors.primary[500],
    paddingVertical: 2,
  },
  nameSaveButton: {
    padding: spacing.xs,
  },
  nameCancelButton: {
    padding: spacing.xs,
  },
  planBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  planBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
  content: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    ...shadow.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  settingRowPressed: {
    backgroundColor: colors.neutral[50],
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  settingLabel: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.neutral[800],
  },
  settingLabelGroup: {
    flex: 1,
  },
  settingDescription: {
    fontSize: fontSize.xs,
    color: colors.neutral[400],
    marginTop: 2,
  },
  settingLabelDanger: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.mood.bad,
  },
  settingValue: {
    fontSize: fontSize.sm,
    color: colors.neutral[400],
  },
  planTag: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  planTagPro: {
    backgroundColor: colors.primary[100],
  },
  planTagText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.neutral[500],
  },
  planTagTextPro: {
    color: colors.primary[700],
  },
  // Plan features
  planSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  planSectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  planSectionBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
  proSectionCard: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  proSectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  proSectionBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  proPrice: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.primary[600],
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  featureRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  featureIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  proFeatureIconWrap: {
    backgroundColor: colors.primary[50],
  },
  featureLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.neutral[800],
    fontWeight: fontWeight.medium,
  },
  featureDesc: {
    fontSize: fontSize.xs,
    color: colors.neutral[400],
    marginTop: 1,
  },
  upgradeRow: {
    padding: spacing.md,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  upgradeButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  version: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[500],
  },
  copyright: {
    fontSize: fontSize.xs,
    color: colors.neutral[400],
  },
});
