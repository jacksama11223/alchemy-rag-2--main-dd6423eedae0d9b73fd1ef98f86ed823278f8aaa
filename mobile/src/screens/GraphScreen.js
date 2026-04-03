import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Dimensions, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';
import {
  Brain, RefreshCcw, Sparkles, BookOpen, FileText,
  Image as ImageIcon, Link, Mic, Search, ZoomIn,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { AuthContext } from '../context/AuthContext';
import { useApiKey } from '../context/ApiKeyContext';
import { fetchKnowledgeNodes } from '../services/ragService';
import GlassCard from '../components/ui/GlassCard';

const { width, height } = Dimensions.get('window');
const GRAPH_W = width - 40;
const GRAPH_H = 320;

// ─── Node type styling ────────────────────────────────────────────────────────
const NODE_COLORS = {
  text: '#4f46e5',
  url: '#0ea5e9',
  flashcard: '#a78bfa',
  image: '#ec4899',
  audio: '#f59e0b',
  note: '#10b981',
  default: '#64748b',
};

const NODE_ICONS = {
  text: FileText,
  url: Link,
  flashcard: Brain,
  image: ImageIcon,
  audio: Mic,
  note: BookOpen,
};

// ─── Simple force-layout (static, no physics engine needed) ───────────────────
const layoutNodes = (nodes) => {
  if (!nodes.length) return [];
  const cx = GRAPH_W / 2;
  const cy = GRAPH_H / 2;
  const radius = Math.min(GRAPH_W, GRAPH_H) * 0.38;

  return nodes.map((node, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
    return {
      ...node,
      x: node.x || cx + radius * Math.cos(angle),
      y: node.y || cy + radius * Math.sin(angle),
    };
  });
};

// ─── Mini Graph View ──────────────────────────────────────────────────────────
const MiniGraph = ({ nodes, onNodePress }) => {
  const laid = layoutNodes(nodes.slice(0, 20)); // max 20 nodes rendered

  return (
    <Svg width={GRAPH_W} height={GRAPH_H}>
      {/* Edge lines between consecutive nodes */}
      {laid.map((node, i) => {
        if (i === 0) return null;
        const prev = laid[i - 1];
        return (
          <Line
            key={`edge_${i}`}
            x1={prev.x} y1={prev.y}
            x2={node.x} y2={node.y}
            stroke="rgba(99,102,241,0.2)"
            strokeWidth={1.5}
            strokeDasharray="4,4"
          />
        );
      })}
      {/* Nodes */}
      {laid.map((node) => {
        const color = NODE_COLORS[node.type] || NODE_COLORS.default;
        return (
          <G key={node.id || node._id} onPress={() => onNodePress(node)}>
            <Circle cx={node.x} cy={node.y} r={24} fill={color + '22'} stroke={color} strokeWidth={2} />
            <Circle cx={node.x} cy={node.y} r={8} fill={color} />
            <SvgText
              x={node.x}
              y={node.y + 36}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize={10}
              fontWeight="600"
            >
              {(node.title || '').substring(0, 12)}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
};

// ─── Node List Card ───────────────────────────────────────────────────────────
const NodeCard = ({ node, onPress }) => {
  const color = NODE_COLORS[node.type] || NODE_COLORS.default;
  const IconComp = NODE_ICONS[node.type] || Brain;
  const mastery = node.mastery || 0;

  return (
    <TouchableOpacity onPress={() => onPress(node)} activeOpacity={0.85}>
      <GlassCard style={styles.nodeCard} dark>
        <View style={[styles.nodeIconBox, { backgroundColor: color + '22', borderColor: color + '44' }]}>
          <IconComp size={18} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.nodeTitle} numberOfLines={1}>{node.title || 'Không có tiêu đề'}</Text>
          <View style={styles.nodeMetaRow}>
            <View style={[styles.nodeTypeBadge, { backgroundColor: color + '22' }]}>
              <Text style={[styles.nodeTypeText, { color }]}>{node.type || 'text'}</Text>
            </View>
            {node.tags?.slice(0, 2).map((tag, i) => (
              <View key={i} style={styles.tagBadge}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
          {/* Mastery bar */}
          {mastery > 0 && (
            <View style={styles.masteryBar}>
              <View style={[styles.masteryFill, { width: `${mastery}%`, backgroundColor: color }]} />
            </View>
          )}
        </View>
        <Text style={styles.masteryPct}>{mastery}%</Text>
      </GlassCard>
    </TouchableOpacity>
  );
};

// ─── Main GraphScreen ─────────────────────────────────────────────────────────
export default function GraphScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { hasApiKey } = useApiKey();

  const [nodes, setNodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('graph'); // 'graph' | 'list'
  const [selectedNode, setSelectedNode] = useState(null);

  const loadNodes = useCallback(async () => {
    const result = await fetchKnowledgeNodes();
    if (result.success) {
      setNodes(result.nodes || []);
    } else {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: result.error || 'Không thể tải nodes' });
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadNodes();
      setIsLoading(false);
    };
    init();
  }, [loadNodes]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNodes();
    setRefreshing(false);
  };

  const handleNodePress = (node) => {
    setSelectedNode(node);
  };

  const stats = {
    total: nodes.length,
    types: [...new Set(nodes.map(n => n.type))].length,
    avgMastery: nodes.length
      ? Math.round(nodes.reduce((a, n) => a + (n.mastery || 0), 0) / nodes.length)
      : 0,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#0f172a', '#1e293b', '#0f172a']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <MotiView from={{ opacity: 0, translateY: -20 }} animate={{ opacity: 1, translateY: 0 }} style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🧠 Sơ đồ Tri thức</Text>
          <Text style={styles.headerSub}>{stats.total} nodes · {stats.types} loại · Thành thạo {stats.avgMastery}%</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <RefreshCcw size={18} color="#94a3b8" />
        </TouchableOpacity>
      </MotiView>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        {[
          { label: 'Tổng Nodes', value: stats.total, icon: Brain, color: '#a78bfa' },
          { label: 'Loại tri thức', value: stats.types, icon: Sparkles, color: '#38bdf8' },
          { label: 'Thành thạo', value: `${stats.avgMastery}%`, icon: BookOpen, color: '#4ade80' },
        ].map((s, i) => (
          <MotiView key={i} from={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 80 }} style={{ flex: 1 }}>
            <GlassCard style={styles.statCard} dark>
              <s.icon size={16} color={s.color} />
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </GlassCard>
          </MotiView>
        ))}
      </View>

      {/* View Toggle */}
      <View style={styles.toggleRow}>
        {['graph', 'list'].map(mode => (
          <TouchableOpacity
            key={mode}
            style={[styles.toggleBtn, viewMode === mode && styles.toggleBtnActive]}
            onPress={() => setViewMode(mode)}
          >
            <Text style={[styles.toggleText, viewMode === mode && styles.toggleTextActive]}>
              {mode === 'graph' ? '🕸️ Đồ thị' : '📋 Danh sách'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color="#a78bfa" size="large" />
      ) : nodes.length === 0 ? (
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.emptyWrap}>
          <Brain size={56} color="#1e293b" />
          <Text style={styles.emptyTitle}>Chưa có tri thức nào</Text>
          <Text style={styles.emptyDesc}>Dùng Alchemy để xử lý tài liệu và xây dựng đồ thị tri thức</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Alchemy')}>
            <Sparkles size={16} color="#fff" />
            <Text style={styles.emptyBtnText}>Mở Alchemy</Text>
          </TouchableOpacity>
        </MotiView>
      ) : viewMode === 'graph' ? (
        <FlatList
          data={[{ key: 'graph' }]}
          renderItem={() => (
            <View style={styles.graphContainer}>
              <MiniGraph nodes={nodes} onNodePress={handleNodePress} />
              {selectedNode && (
                <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} style={styles.nodeDetail}>
                  <TouchableOpacity onPress={() => setSelectedNode(null)} style={styles.closeDetail}>
                    <Text style={styles.closeDetailText}>✕</Text>
                  </TouchableOpacity>
                  <Text style={styles.detailTitle}>{selectedNode.title}</Text>
                  <Text style={styles.detailType}>Loại: {selectedNode.type}</Text>
                  <Text style={styles.detailMastery}>Thành thạo: {selectedNode.mastery || 0}%</Text>
                  {selectedNode.tags?.length > 0 && (
                    <Text style={styles.detailTags}>Tags: {selectedNode.tags.join(', ')}</Text>
                  )}
                </MotiView>
              )}
            </View>
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a78bfa" />}
          keyExtractor={item => item.key}
        />
      ) : (
        <FlatList
          data={nodes}
          keyExtractor={(item, idx) => item.id || item._id || String(idx)}
          renderItem={({ item }) => <NodeCard node={item} onPress={handleNodePress} />}
          contentContainerStyle={styles.nodeList}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a78bfa" />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#f1f5f9' },
  headerSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  refreshBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' },

  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 14 },
  statCard: { backgroundColor: 'rgba(30,41,59,0.8)', borderRadius: 14, padding: 12, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 10, color: '#64748b', textAlign: 'center' },

  toggleRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 14, backgroundColor: 'rgba(15,23,42,0.8)', borderRadius: 14, padding: 4, gap: 4 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 11 },
  toggleBtnActive: { backgroundColor: 'rgba(99,102,241,0.3)', borderWidth: 1, borderColor: 'rgba(99,102,241,0.4)' },
  toggleText: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  toggleTextActive: { color: '#a78bfa' },

  graphContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  nodeDetail: { backgroundColor: 'rgba(30,41,59,0.95)', borderRadius: 18, padding: 18, marginTop: 16, borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)', position: 'relative' },
  closeDetail: { position: 'absolute', top: 12, right: 12, width: 28, height: 28, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  closeDetailText: { color: '#94a3b8', fontSize: 14 },
  detailTitle: { fontSize: 18, fontWeight: '700', color: '#e2e8f0', marginBottom: 8 },
  detailType: { fontSize: 13, color: '#a78bfa', marginBottom: 4 },
  detailMastery: { fontSize: 13, color: '#4ade80', marginBottom: 4 },
  detailTags: { fontSize: 12, color: '#64748b' },

  nodeList: { paddingHorizontal: 20, paddingBottom: 100 },
  nodeCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(30,41,59,0.8)', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  nodeIconBox: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  nodeTitle: { fontSize: 15, fontWeight: '700', color: '#e2e8f0', flex: 1 },
  nodeMetaRow: { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  nodeTypeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  nodeTypeText: { fontSize: 11, fontWeight: '700' },
  tagBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.06)' },
  tagText: { fontSize: 11, color: '#64748b' },
  masteryBar: { height: 3, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 8, overflow: 'hidden' },
  masteryFill: { height: '100%', borderRadius: 2 },
  masteryPct: { fontSize: 13, fontWeight: '700', color: '#475569' },

  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#334155' },
  emptyDesc: { fontSize: 14, color: '#475569', textAlign: 'center', lineHeight: 22 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#4f46e5', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16 },
  emptyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
