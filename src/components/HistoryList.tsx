import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import {
  Calendar,
  Building2,
  Trash2,
  Eye,
  FileText,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import { THEME } from '../theme/tokens';

export interface HistoryItem {
  id: string;
  category: string;
  location: string;
  authorityName: string;
  date: string;
  urgency: string;
  letterText: string;
  aiSummary?: string;
  authorityEmail?: string;
  language?: string;
  tone?: string;
  status?: 'Draft' | 'Submitted' | 'In Progress' | 'Resolved';
}

interface HistoryListProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: 'Draft' | 'Submitted' | 'In Progress' | 'Resolved') => void;
  onClose: () => void;
}

export default function HistoryList({
  history,
  onSelect,
  onDelete,
  onUpdateStatus,
  onClose,
}: HistoryListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = history.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.category.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.authorityName.toLowerCase().includes(q) ||
      item.letterText.toLowerCase().includes(q)
    );
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Back to complaint workspace"
        >
          <ArrowLeft size={18} color={THEME.colors.primaryText} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>My Grievance Reports</Text>
          <Text style={styles.subtitle}>
            {history.length} saved {history.length === 1 ? 'record' : 'records'} on this device
          </Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Search size={16} color={THEME.colors.secondaryText} />
        <TextInput
          style={styles.searchInput}
          placeholder="Filter by department, location, or issue..."
          placeholderTextColor={THEME.colors.mutedText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* History Items List */}
      {filteredHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <FileText size={44} color={THEME.colors.border} />
          <Text style={styles.emptyTitle}>No reports found</Text>
          <Text style={styles.emptyDesc}>
            {searchQuery
              ? 'No complaints match your search query.'
              : 'You have not drafted any complaints yet. Reports will appear here once generated.'}
          </Text>
          <TouchableOpacity style={styles.createBtn} onPress={onClose}>
            <Text style={styles.createBtnText}>Draft a Complaint →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.historyCard}
              onPress={() => onSelect(item)}
              accessibilityRole="button"
              accessibilityLabel={`View complaint for ${item.category} at ${item.location}`}
            >
              <View style={styles.cardTopRow}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{item.category}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    item.status === 'Submitted'
                      ? styles.statusSubmitted
                      : styles.statusDraft,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      item.status === 'Submitted'
                        ? styles.statusTextSubmitted
                        : styles.statusTextDraft,
                    ]}
                  >
                    {item.status || 'Draft'}
                  </Text>
                </View>
              </View>

              <Text style={styles.authorityName} numberOfLines={1}>
                {item.authorityName}
              </Text>

              <View style={styles.metaRow}>
                <MapPin size={12} color={THEME.colors.secondaryText} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {item.location}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Calendar size={12} color={THEME.colors.secondaryText} />
                <Text style={styles.metaText}>{item.date}</Text>
              </View>

              {item.aiSummary ? (
                <View style={styles.historySummaryBox}>
                  <Sparkles size={11} color="#F47738" />
                  <Text style={styles.historySummaryText} numberOfLines={2}>
                    {item.aiSummary}
                  </Text>
                </View>
              ) : null}

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.viewBtn}
                  onPress={() => onSelect(item)}
                >
                  <Eye size={13} color={THEME.colors.brandOrange} />
                  <Text style={styles.viewBtnText}>View Letter</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => onDelete(item.id)}
                >
                  <Trash2 size={13} color={THEME.colors.error} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#0D0D0C',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E1E1C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'web' ? 'Sora, sans-serif' : undefined,
  },
  subtitle: {
    fontSize: 12,
    color: '#8E8A83',
    marginTop: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1C',
    borderRadius: THEME.radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 44,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  historyCard: {
    backgroundColor: '#161615',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 18,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(244, 119, 56, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(244, 119, 56, 0.3)',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F47738',
    fontFamily: THEME.fonts.mono,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusDraft: {
    backgroundColor: '#1E1E1C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statusSubmitted: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: THEME.fonts.mono,
  },
  statusTextDraft: {
    color: '#8E8A83',
  },
  statusTextSubmitted: {
    color: '#22C55E',
  },
  authorityName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    fontFamily: Platform.OS === 'web' ? 'Sora, sans-serif' : undefined,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#8E8A83',
  },
  historySummaryBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(244, 119, 56, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(244, 119, 56, 0.2)',
    marginTop: 6,
    marginBottom: 4,
  },
  historySummaryText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
    color: '#D8D2C7',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F47738',
  },
  deleteBtn: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#8E8A83',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
    marginBottom: 20,
  },
  createBtn: {
    backgroundColor: '#F47738',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: THEME.radii.pill,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
