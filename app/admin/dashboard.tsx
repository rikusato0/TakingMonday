import { Stack } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAppData } from '../../src/context/AppDataContext';
import type { WallEntryRow } from '../../src/services/appBackend';
import { colors, radius, space } from '../../src/theme/tokens';

export default function AdminDashboardScreen() {
  const {
    allWall,
    adminSaveWallEntry,
    adminDeleteWallEntry,
    adminReorderWall,
    admin,
    signOutAdmin,
  } = useAppData();
  const [modal, setModal] = useState<WallEntryRow | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = useCallback(() => {
    Alert.alert('Sign out?', admin?.email ?? '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          try {
            await signOutAdmin();
          } catch (e) {
            Alert.alert('Sign-out failed', (e as Error)?.message ?? 'Try again.');
          } finally {
            setSigningOut(false);
          }
        },
      },
    ]);
  }, [admin, signOutAdmin]);

  const sorted = useMemo(
    () => allWall.slice().sort((a, b) => a.sortOrder - b.sortOrder),
    [allWall],
  );

  const move = useCallback(
    async (index: number, dir: -1 | 1) => {
      const j = index + dir;
      if (j < 0 || j >= sorted.length) return;
      const ids = sorted.map((w) => w.id);
      const t = ids[index];
      ids[index] = ids[j];
      ids[j] = t;
      await adminReorderWall(ids);
    },
    [sorted, adminReorderWall],
  );

  const openNew = () => {
    const maxOrder = sorted.reduce((m, w) => Math.max(m, w.sortOrder), -1);
    setModal({
      id: `w${Date.now()}`,
      displayName: '',
      location: '',
      totalWishes: 0,
      active: true,
      sortOrder: maxOrder + 1,
    });
  };

  const openEdit = (row: WallEntryRow) => setModal({ ...row });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Wall',
          headerBackTitle: 'Back',
          headerRight: () => (
            <Pressable
              onPress={handleSignOut}
              disabled={signingOut}
              hitSlop={8}
              style={{ paddingHorizontal: space.sm, paddingVertical: 4 }}
            >
              {signingOut ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.headerRight}>Sign out</Text>
              )}
            </Pressable>
          ),
        }}
      />
      <View style={styles.toolbar}>
        <View style={{ flex: 1 }}>
          {admin?.email ? (
            <Text style={styles.signedIn} numberOfLines={1}>
              Signed in as <Text style={styles.signedInEmail}>{admin.email}</Text>
            </Text>
          ) : null}
        </View>
        <Pressable onPress={openNew} style={styles.toolBtn}>
          <Text style={styles.toolBtnText}>+ Add entry</Text>
        </Pressable>
      </View>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.displayName || '(unnamed)'}</Text>
                <Text style={styles.loc}>{item.location || '—'}</Text>
                <Text style={styles.meta}>
                  wishes {item.totalWishes} · order {item.sortOrder}{' '}
                  {item.active ? '· active' : '· hidden'}
                </Text>
              </View>
              <View style={styles.rowBtns}>
                <Pressable onPress={() => void move(index, -1)} style={styles.mini}>
                  <Text style={styles.miniText}>↑</Text>
                </Pressable>
                <Pressable onPress={() => void move(index, 1)} style={styles.mini}>
                  <Text style={styles.miniText}>↓</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.actions}>
              <View style={styles.switchRow}>
                <Text style={styles.swLabel}>Active</Text>
                <Switch
                  value={item.active}
                  onValueChange={(v) => void adminSaveWallEntry({ ...item, active: v })}
                  trackColor={{ true: colors.primary, false: '#ccc' }}
                />
              </View>
              <Pressable onPress={() => openEdit(item)} style={styles.linkBtn}>
                <Text style={styles.link}>Edit</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  Alert.alert('Delete entry?', item.displayName, [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => void adminDeleteWallEntry(item.id),
                    },
                  ]);
                }}
                style={styles.linkBtn}
              >
                <Text style={[styles.link, { color: '#c0392b' }]}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      <Modal visible={modal !== null} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{modal?.id && sorted.some((w) => w.id === modal.id) ? 'Edit' : 'Create'}</Text>
            <Text style={styles.label}>Display name</Text>
            <TextInput
              value={modal?.displayName ?? ''}
              onChangeText={(t) => modal && setModal({ ...modal, displayName: t })}
              style={styles.input}
              placeholder="Name"
            />
            <Text style={styles.label}>Location</Text>
            <TextInput
              value={modal?.location ?? ''}
              onChangeText={(t) => modal && setModal({ ...modal, location: t })}
              style={styles.input}
              placeholder="City, ST"
            />
            <View style={styles.switchRow}>
              <Text style={styles.label}>Active</Text>
              <Switch
                value={modal?.active ?? true}
                onValueChange={(v) => {
                  if (modal) setModal({ ...modal, active: v });
                }}
                trackColor={{ true: colors.primary, false: '#ccc' }}
              />
            </View>
            <View style={styles.modalActions}>
              <Pressable onPress={() => setModal(null)} style={styles.secondary}>
                <Text style={styles.secondaryText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (!modal?.displayName.trim()) {
                    Alert.alert('Name required');
                    return;
                  }
                  void adminSaveWallEntry(modal);
                  setModal(null);
                }}
                style={styles.primary}
              >
                <Text style={styles.primaryText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  toolBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.button,
  },
  toolBtnText: { color: '#fff', fontWeight: '800' },
  signedIn: { color: colors.textMuted, fontSize: 13 },
  signedInEmail: { color: colors.text, fontWeight: '700' },
  headerRight: { color: colors.primary, fontWeight: '800', fontSize: 15 },
  list: { padding: space.lg, paddingBottom: 48, gap: space.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: space.md,
  },
  cardTop: { flexDirection: 'row', gap: space.md },
  name: { fontSize: 18, fontWeight: '800', color: colors.text },
  loc: { fontSize: 15, color: colors.textMuted, marginTop: 4 },
  meta: { fontSize: 13, color: colors.textMuted, marginTop: 8 },
  rowBtns: { flexDirection: 'row', gap: space.xs },
  mini: {
    borderWidth: 1,
    borderColor: colors.border,
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  miniText: { fontSize: 18, fontWeight: '900' },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: space.md,
    gap: space.md,
    flexWrap: 'wrap',
  },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  swLabel: { fontWeight: '700', color: colors.text },
  linkBtn: { padding: space.xs },
  link: { fontWeight: '800', color: colors.primary },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: space.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: space.lg,
    gap: space.sm,
  },
  modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: space.sm },
  label: { fontWeight: '700', color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: space.md,
    fontSize: 16,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: space.md, marginTop: space.lg },
  secondary: { paddingVertical: space.sm, paddingHorizontal: space.lg },
  secondaryText: { fontWeight: '800', color: colors.textMuted },
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: space.sm,
    paddingHorizontal: space.lg,
    borderRadius: 12,
  },
  primaryText: { fontWeight: '900', color: '#fff' },
});
