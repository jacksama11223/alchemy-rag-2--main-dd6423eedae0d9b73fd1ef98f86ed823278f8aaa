import React, { useState, useEffect, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Alert, SafeAreaView, Dimensions, ScrollView, Image } from 'react-native';
import { MotiView, MotiText } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Plus, Trash2, Database, Layers, Search, CloudUpload, Zap, FileText, File, Link as LinkIcon, Youtube, Mic, Bell, Settings, Eye } from 'lucide-react-native';
import { AuthContext } from '../src/context/AuthContext';
import { 
  addAlchemyItem, getAlchemyItems, deleteAlchemyItem,
  addAlchemyFlashcard, getAlchemyFlashcards, deleteAlchemyFlashcard 
} from '../src/services/apiAlchemyService';

const { width } = Dimensions.get('window');

// --- ALCHEMY FLOWS CONFIG ---
const ALCHEMY_FLOWS = [
  // The Architect
  { id: 'arch_quick_node', name: 'Quick Capture to Node', category: 'The Architect', description: 'Tạo 1 KnowledgeNode mới trên sơ đồ', supportedInputs: ['TEXT'], icon: <Database size={20} color="#8b5cf6" /> },
  { id: 'arch_concept_expand', name: 'Concept Expansion', category: 'The Architect', description: 'Mở rộng concept thành các node liên kết', supportedInputs: ['TEXT', 'NODE'], icon: <Layers size={20} color="#8b5cf6" /> },
  { id: 'arch_connector', name: 'The Connector', category: 'The Architect', description: 'Tìm điểm chung và nối các node lại', supportedInputs: ['NODE'], icon: <Layers size={20} color="#8b5cf6" /> },
  { id: 'arch_auto_hierarchy', name: 'Auto-Hierarchy', category: 'The Architect', description: 'Tự động phân cấp tài liệu thành sơ đồ', supportedInputs: ['PDF', 'TEXT'], icon: <Layers size={20} color="#8b5cf6" /> },
  { id: 'arch_url_to_graph', name: 'URL to Graph', category: 'The Architect', description: 'Trích xuất thực thể từ bài viết thành Graph', supportedInputs: ['URL'], icon: <LinkIcon size={20} color="#8b5cf6" /> },
  { id: 'arch_yt_to_graph', name: 'Video to Graph', category: 'The Architect', description: 'Chuyển transcript video thành sơ đồ tư duy', supportedInputs: ['YOUTUBE'], icon: <Youtube size={20} color="#8b5cf6" /> },
  
  // The Examiner
  { id: 'exam_magic_notes', name: 'Magic Notes to Cards', category: 'The Examiner', description: 'Tự động tạo bộ flashcard từ ghi chú', supportedInputs: ['TEXT', 'PDF', 'URL'], icon: <Layers size={20} color="#10b981" /> },
  { id: 'exam_mcq_gen', name: 'MCQ Generator', category: 'The Examiner', description: 'Tạo câu hỏi trắc nghiệm từ tài liệu', supportedInputs: ['TEXT', 'URL', 'PDF', 'YOUTUBE'], icon: <Search size={20} color="#10b981" /> },
  { id: 'exam_cloze_del', name: 'Cloze Deletion', category: 'The Examiner', description: 'Tạo flashcard điền vào chỗ trống', supportedInputs: ['TEXT'], icon: <FileText size={20} color="#10b981" /> },
  
  // The Refiner
  { id: 'ref_tldr', name: 'TL;DR Summarize', category: 'The Refiner', description: 'Tóm tắt ngắn gọn nội dung dài', supportedInputs: ['TEXT', 'URL', 'YOUTUBE', 'PDF'], icon: <Zap size={20} color="#f59e0b" /> },
  { id: 'ref_eli5', name: 'Explain Like I\'m 5', category: 'The Refiner', description: 'Giải thích khái niệm phức tạp một cách đơn giản', supportedInputs: ['TEXT', 'NODE'], icon: <Zap size={20} color="#f59e0b" /> },
  { id: 'ref_key_takeaways', name: 'Key Takeaways', category: 'The Refiner', description: 'Trích xuất các ý chính quan trọng nhất', supportedInputs: ['TEXT', 'URL', 'YOUTUBE'], icon: <Zap size={20} color="#f59e0b" /> },

  // The Explorer
  { id: 'exp_find_similar', name: 'Find Similar Concepts', category: 'The Explorer', description: 'Tìm các concept tương tự trong Graph', supportedInputs: ['NODE', 'TEXT'], icon: <Search size={20} color="#3b82f6" /> },
  { id: 'exp_contradictions', name: 'Find Contradictions', category: 'The Explorer', description: 'Tìm các thông tin mâu thuẫn với dữ liệu', supportedInputs: ['TEXT', 'URL'], icon: <Search size={20} color="#3b82f6" /> },

  // The Strategist
  { id: 'strat_study_plan', name: 'Generate Study Plan', category: 'The Strategist', description: 'Tạo lộ trình học tập từ mục tiêu', supportedInputs: ['TEXT'], icon: <FileText size={20} color="#ec4899" /> },
  { id: 'strat_spaced_rep', name: 'Spaced Repetition Schedule', category: 'The Strategist', description: 'Lên lịch ôn tập tối ưu', supportedInputs: ['NODE', 'TEXT'], icon: <FileText size={20} color="#ec4899" /> },

  // The Creator
  { id: 'crea_blog_post', name: 'Draft Blog Post', category: 'The Creator', description: 'Viết nháp bài blog từ các ý chính', supportedInputs: ['TEXT', 'NODE'], icon: <Plus size={20} color="#06b6d4" /> },
  { id: 'crea_analogy', name: 'Generate Analogy', category: 'The Creator', description: 'Tạo phép ẩn dụ để dễ nhớ', supportedInputs: ['TEXT', 'NODE'], icon: <Plus size={20} color="#06b6d4" /> },
];

export default function Alchemy({ navigation }) {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('items'); // 'items' | 'flashcards'
  const [items, setItems] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // New State for Workspace
  const [inputContent, setInputContent] = useState('');
  const [inputType, setInputType] = useState(null);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [output, setOutput] = useState(null);

  // --- API CALLS FOR ITEMS ---
  const fetchItems = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await getAlchemyItems();
      if (result.success) {
        setItems(result.data);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const addItem = async () => {
    if (!inputContent.trim() || !user) return Alert.alert('Lỗi', 'Vui lòng nhập nội dung');
    setLoading(true);
    try {
      const newItem = {
        sourceType: inputType || 'text',
        title: inputContent.substring(0, 20) + '...',
        extractedText: inputContent,
      };
      const result = await addAlchemyItem(newItem);
      if (result.success) {
        setInputContent('');
        setInputType(null);
        fetchItems();
      } else {
        Alert.alert('Lỗi', 'Không thể lưu dữ liệu');
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const deleteItem = async (id) => {
    setLoading(true);
    try {
      const result = await deleteAlchemyItem(id);
      if (result.success) fetchItems();
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // --- API CALLS FOR FLASHCARDS ---
  const fetchFlashcards = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await getAlchemyFlashcards();
      if (result.success) {
        setFlashcards(result.data);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const addFlashcard = async () => {
    if (!inputContent.trim() || !user) return Alert.alert('Lỗi', 'Vui lòng nhập nội dung mặt trước');
    setLoading(true);
    try {
      // In a real app, you'd use the dedicated Forge backend route
      let backContent = 'Mặt sau tự động tạo...';
      
      const newCard = {
        front: inputContent,
        back: backContent,
        tags: ['Alchemy'],
      };
      const result = await addAlchemyFlashcard(newCard);
      if (result.success) {
        setInputContent('');
        fetchFlashcards();
      } else {
        Alert.alert('Lỗi', 'Không thể lưu thẻ nhớ');
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const deleteFlashcard = async (id) => {
    setLoading(true);
    try {
      const result = await deleteAlchemyFlashcard(id);
      if (result.success) fetchFlashcards();
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'items') fetchItems();
    else fetchFlashcards();
  }, [activeTab, user]);

  // --- WORKSPACE LOGIC ---
  const handleInputBlur = () => {
    if (inputContent.startsWith('http')) {
        if (inputContent.includes('youtube.com') || inputContent.includes('youtu.be')) {
            setInputType('YOUTUBE');
        } else {
            setInputType('URL');
        }
    }
    else if (inputContent.length > 0) setInputType('TEXT');
    else setInputType(null);
  };

  const availableFlowsByCategory = useMemo(() => {
    if (!inputType) return {};
    const filtered = ALCHEMY_FLOWS.filter(flow => flow.supportedInputs.includes(inputType));
    const grouped = {};
    filtered.forEach(flow => {
        if (!grouped[flow.category]) grouped[flow.category] = [];
        grouped[flow.category].push(flow);
    });
    return grouped;
  }, [inputType]);

  const handleTransmute = async () => {
    if (!selectedFlow || !inputContent) return;
    setIsProcessing(true);
    
    try {
      const { GoogleGenAI, ThinkingLevel } = require('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'dummy' });
      
      let prompt = '';
      if (selectedFlow.category === 'The Architect') {
          prompt = `Bạn là một chuyên gia xây dựng Knowledge Graph. Hãy phân tích nội dung sau và trích xuất các khái niệm chính cùng mối liên hệ giữa chúng. Trình bày dưới dạng danh sách các Node và Edge.\n\nNội dung: ${inputContent}`;
      } else if (selectedFlow.category === 'The Examiner') {
          prompt = `Bạn là một giáo viên chuyên tạo đề thi. Hãy tạo các câu hỏi trắc nghiệm hoặc flashcard từ nội dung sau để kiểm tra kiến thức.\n\nNội dung: ${inputContent}`;
      } else if (selectedFlow.category === 'The Refiner') {
          prompt = `Bạn là một biên tập viên xuất sắc. Hãy tóm tắt, chắt lọc những ý chính quan trọng nhất từ nội dung sau, giải thích sao cho thật dễ hiểu.\n\nNội dung: ${inputContent}`;
      } else if (selectedFlow.category === 'The Explorer') {
          prompt = `Bạn là một nhà nghiên cứu. Hãy tìm ra các khái niệm liên quan, các góc nhìn trái chiều hoặc những điểm mâu thuẫn từ nội dung sau.\n\nNội dung: ${inputContent}`;
      } else if (selectedFlow.category === 'The Strategist') {
          prompt = `Bạn là một cố vấn học tập. Hãy lập một lộ trình học tập hoặc kế hoạch ôn tập tối ưu dựa trên nội dung sau.\n\nNội dung: ${inputContent}`;
      } else if (selectedFlow.category === 'The Creator') {
          prompt = `Bạn là một nhà sáng tạo nội dung. Hãy sử dụng nội dung sau làm cảm hứng để viết một bài blog ngắn hoặc tạo ra một phép ẩn dụ thú vị.\n\nNội dung: ${inputContent}`;
      } else {
          prompt = `Hãy xử lý nội dung sau theo yêu cầu: ${selectedFlow.description}\n\nNội dung: ${inputContent}`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
        }
      });

      if (response.text) {
        setOutput({ result: response.text });
      } else {
        setOutput({ result: 'Không có kết quả trả về từ AI.' });
      }
    } catch (error) {
      console.error('Lỗi khi gọi Gemini:', error);
      setOutput({ result: `Lỗi xử lý AI: ${error.message}` });
    }
    
    setIsProcessing(false);
  };

  const saveOutput = async () => {
      if (!output?.result || !user?.uid) return;
      setLoading(true);
      try {
          if (selectedFlow?.category === 'The Examiner') {
              const newCard = {
                  front: inputContent.substring(0, 50) + '...',
                  back: output.result,
                  tags: ['Alchemy', selectedFlow.name],
              };
              const result = await addAlchemyFlashcard(newCard);
              if (result.success) {
                  fetchFlashcards();
                  setActiveTab('flashcards');
              } else {
                  Alert.alert('Lỗi', 'Không thể lưu thẻ nhớ');
              }
          } else {
              const newItem = {
                  sourceType: inputType || 'text',
                  title: `[${selectedFlow.name}] ${inputContent.substring(0, 20)}...`,
                  extractedText: output.result,
              };
              const result = await addAlchemyItem(newItem);
              if (result.success) {
                  fetchItems();
                  setActiveTab('items');
              } else {
                  Alert.alert('Lỗi', 'Không thể lưu dữ liệu');
              }
          }
          setInputContent('');
          setInputType(null);
          setOutput(null);
          setSelectedFlow(null);
      } catch (e) {
          console.error(e);
      }
      setLoading(false);
  }

  const renderItem = ({ item, index }) => (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', delay: index * 50 }}
      style={styles.card}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title || item.front}</Text>
        <View style={styles.tagRow}>
          <View style={styles.sourceTag}>
            <Text style={styles.sourceTagText}>
              {activeTab === 'items' ? item.sourceType?.toUpperCase() : 'FLASHCARD'}
            </Text>
          </View>
          {activeTab === 'flashcards' && (
            <Text style={styles.cardSubtitle} numberOfLines={1}>{item.back}</Text>
          )}
        </View>
      </View>
      <TouchableOpacity 
        style={styles.deleteBtn} 
        onPress={() => activeTab === 'items' ? deleteItem(item.id) : deleteFlashcard(item.id)}
      >
        <Trash2 size={18} color="#ef4444" />
      </TouchableOpacity>
    </MotiView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#ffffff', '#f8fafc']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.navigate('Dashboard')} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.title}>Lò Luyện AI</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          {/* Workspace Section */}
          <View style={styles.workspaceContainer}>
              <Text style={styles.sectionTitle}>Không gian pha chế</Text>
              <Text style={styles.sectionSubtitle}>Biến dữ liệu thô thành vàng kiến thức.</Text>

              <View style={styles.gridContainer}>
                  {/* CỘT 1: NGUYÊN LIỆU (INPUT) */}
                  <View style={styles.panel}>
                      <View style={styles.panelHeader}>
                          <Text style={styles.panelStep}>1️⃣</Text>
                          <Text style={styles.panelTitle}>Nguyên liệu</Text>
                      </View>
                      <TextInput 
                          style={styles.textArea}
                          placeholder="Dán URL, văn bản, hoặc thả file vào đây..."
                          placeholderTextColor="#94a3b8"
                          multiline
                          value={inputContent}
                          onChangeText={setInputContent}
                          onBlur={handleInputBlur}
                      />
                      {inputType && (
                          <View style={styles.inputTypeIndicator}>
                              <Text style={styles.inputTypeText}>Đã nhận diện: {inputType}</Text>
                          </View>
                      )}
                  </View>

                  {/* CỘT 2: CHẤT XÚC TÁC (INTENTS) */}
                  <View style={styles.panel}>
                      <View style={styles.panelHeader}>
                          <Text style={styles.panelStep}>2️⃣</Text>
                          <Text style={styles.panelTitle}>Phép thuật</Text>
                      </View>
                      {inputType ? (
                          <ScrollView style={styles.flowsList}>
                              {Object.keys(availableFlowsByCategory).map(category => (
                                  <View key={category} style={styles.categoryGroup}>
                                      <Text style={styles.categoryTitle}>{category}</Text>
                                      {availableFlowsByCategory[category].map(flow => (
                                          <TouchableOpacity
                                              key={flow.id}
                                              style={[
                                                  styles.flowCard,
                                                  selectedFlow?.id === flow.id && styles.flowCardSelected
                                              ]}
                                              onPress={() => setSelectedFlow(flow)}
                                          >
                                              <View style={styles.flowIconContainer}>
                                                  {flow.icon}
                                              </View>
                                              <View style={styles.flowInfo}>
                                                  <Text style={styles.flowName}>{flow.name}</Text>
                                                  <Text style={styles.flowDesc}>{flow.description}</Text>
                                              </View>
                                          </TouchableOpacity>
                                      ))}
                                  </View>
                              ))}
                              {Object.keys(availableFlowsByCategory).length === 0 && (
                                  <Text style={styles.emptyText}>Không có phép thuật nào phù hợp với nguyên liệu này.</Text>
                              )}
                          </ScrollView>
                      ) : (
                          <View style={styles.emptyPanel}>
                              <Text style={styles.emptyText}>Hãy nhập nguyên liệu để xem các phép thuật khả dụng.</Text>
                          </View>
                      )}
                  </View>

                  {/* CỘT 3: THÀNH PHẨM (OUTPUT) */}
                  <View style={styles.panel}>
                      <View style={styles.panelHeader}>
                          <Text style={styles.panelStep}>3️⃣</Text>
                          <Text style={styles.panelTitle}>Thành phẩm</Text>
                      </View>
                      <View style={styles.outputArea}>
                          {!output && !isProcessing && (
                              <TouchableOpacity 
                                  style={[styles.transmuteBtn, (!selectedFlow || !inputContent) && styles.transmuteBtnDisabled]}
                                  disabled={!selectedFlow || !inputContent}
                                  onPress={handleTransmute}
                              >
                                  <Text style={styles.transmuteBtnText}>Bắt đầu Luyện kim 🚀</Text>
                              </TouchableOpacity>
                          )}

                          {isProcessing && (
                              <View style={styles.processingContainer}>
                                  <ActivityIndicator size="large" color="#8b5cf6" />
                                  <MotiText 
                                      from={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ loop: true, duration: 1000 }}
                                      style={styles.processingText}
                                  >
                                      AI đang xử lý dữ liệu...
                                  </MotiText>
                              </View>
                          )}

                          {output && (
                              <View style={styles.resultContainer}>
                                  <View style={styles.successBanner}>
                                      <Text style={styles.successText}>Thành công! Kiểm tra kết quả bên dưới.</Text>
                                  </View>
                                  <ScrollView style={styles.resultScroll}>
                                      <Text style={styles.resultText}>{output.result}</Text>
                                  </ScrollView>
                                  <View style={styles.actionRow}>
                                      <TouchableOpacity style={styles.saveBtn} onPress={saveOutput}>
                                          <Text style={styles.saveBtnText}>Lưu vào Graph</Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity style={styles.cancelBtn} onPress={() => setOutput(null)}>
                                          <Text style={styles.cancelBtnText}>Hủy</Text>
                                      </TouchableOpacity>
                                  </View>
                              </View>
                          )}
                      </View>
                  </View>
              </View>
          </View>

          {/* History Section (Tabs & List) */}
          <View style={styles.historyContainer}>
              <Text style={styles.sectionTitle}>Kho lưu trữ</Text>
              
              {/* Tabs */}
              <View style={styles.tabContainer}>
                <TouchableOpacity 
                  style={[styles.tab, activeTab === 'items' && styles.activeTab]} 
                  onPress={() => setActiveTab('items')}
                >
                  <Database size={18} color={activeTab === 'items' ? 'white' : '#64748b'} style={{ marginRight: 8 }} />
                  <Text style={[styles.tabText, activeTab === 'items' && styles.activeTabText]}>Dữ Liệu</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.tab, activeTab === 'flashcards' && styles.activeTab]} 
                  onPress={() => setActiveTab('flashcards')}
                >
                  <Layers size={18} color={activeTab === 'flashcards' ? 'white' : '#64748b'} style={{ marginRight: 8 }} />
                  <Text style={[styles.tabText, activeTab === 'flashcards' && styles.activeTabText]}>Thẻ Nhớ</Text>
                </TouchableOpacity>
              </View>

              {/* List */}
              {loading && !isProcessing ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color="#0ea5e9" />
                </View>
              ) : (
                <View style={styles.listContainer}>
                  {(activeTab === 'items' ? items : flashcards).length > 0 ? (
                      (activeTab === 'items' ? items : flashcards).map((item, index) => (
                          <View key={item.id}>
                              {renderItem({ item, index })}
                          </View>
                      ))
                  ) : (
                    <MotiView 
                      from={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={styles.emptyContainer}
                    >
                      <Database size={48} color="#e2e8f0" />
                      <Text style={styles.emptyText}>Chưa có tinh hoa nào được lưu lại.</Text>
                    </MotiView>
                  )}
                </View>
              )}
          </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  scrollContainer: {
      flex: 1,
  },
  scrollContent: {
      padding: 16,
      paddingBottom: 40,
  },
  workspaceContainer: {
      marginBottom: 32,
  },
  sectionTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#0f172a',
      marginBottom: 4,
  },
  sectionSubtitle: {
      fontSize: 14,
      color: '#64748b',
      marginBottom: 20,
  },
  gridContainer: {
      flexDirection: width > 768 ? 'row' : 'column',
      gap: 16,
  },
  panel: {
      flex: 1,
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: '#e2e8f0',
      minHeight: 300,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.02,
      shadowRadius: 8,
      elevation: 2,
  },
  panelHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
  },
  panelStep: {
      fontSize: 18,
      marginRight: 8,
  },
  panelTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1e293b',
  },
  textArea: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#e2e8f0',
      borderRadius: 12,
      padding: 12,
      fontSize: 15,
      color: '#1e293b',
      textAlignVertical: 'top',
      backgroundColor: '#f8fafc',
  },
  inputTypeIndicator: {
      marginTop: 12,
      padding: 8,
      backgroundColor: '#f0fdf4',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#bbf7d0',
  },
  inputTypeText: {
      fontSize: 12,
      color: '#166534',
      fontWeight: '500',
      textAlign: 'center',
  },
  flowsList: {
      flex: 1,
  },
  categoryGroup: {
      marginBottom: 16,
  },
  categoryTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
      marginLeft: 4,
  },
  flowCard: {
      flexDirection: 'row',
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#f1f5f9',
      marginBottom: 8,
      alignItems: 'center',
  },
  flowCardSelected: {
      borderColor: '#c4b5fd',
      backgroundColor: '#f5f3ff',
  },
  flowIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: '#ede9fe',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
  },
  flowInfo: {
      flex: 1,
  },
  flowName: {
      fontSize: 14,
      fontWeight: '600',
      color: '#1e293b',
  },
  flowDesc: {
      fontSize: 11,
      color: '#64748b',
      marginTop: 2,
  },
  emptyPanel: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  emptyText: {
      color: '#94a3b8',
      fontSize: 13,
      textAlign: 'center',
      paddingHorizontal: 20,
  },
  outputArea: {
      flex: 1,
      borderWidth: 2,
      borderColor: '#f1f5f9',
      borderStyle: 'dashed',
      borderRadius: 16,
      backgroundColor: '#f8fafc',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
  },
  transmuteBtn: {
      backgroundColor: '#8b5cf6',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 24,
      shadowColor: '#8b5cf6',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
  },
  transmuteBtnDisabled: {
      backgroundColor: '#cbd5e1',
      shadowOpacity: 0,
      elevation: 0,
  },
  transmuteBtnText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 15,
  },
  processingContainer: {
      alignItems: 'center',
  },
  processingText: {
      marginTop: 12,
      color: '#8b5cf6',
      fontWeight: '600',
  },
  resultContainer: {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'white',
      borderRadius: 14,
      padding: 16,
  },
  successBanner: {
      backgroundColor: '#f0fdf4',
      padding: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#bbf7d0',
      marginBottom: 12,
  },
  successText: {
      color: '#166534',
      fontSize: 12,
      fontWeight: '500',
  },
  resultScroll: {
      flex: 1,
      marginBottom: 16,
  },
  resultText: {
      fontSize: 14,
      color: '#334155',
      lineHeight: 22,
  },
  actionRow: {
      flexDirection: 'row',
      gap: 8,
  },
  saveBtn: {
      flex: 1,
      backgroundColor: '#0f172a',
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
  },
  saveBtnText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 14,
  },
  cancelBtn: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: '#e2e8f0',
      borderRadius: 10,
      alignItems: 'center',
  },
  cancelBtnText: {
      color: '#64748b',
      fontWeight: '500',
      fontSize: 14,
  },
  historyContainer: {
      marginTop: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeTab: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  tabText: {
    fontWeight: 'bold',
    color: '#64748b',
    fontSize: 13,
  },
  activeTabText: {
    color: 'white',
  },
  listContainer: {
      gap: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
    paddingRight: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sourceTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sourceTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    flex: 1,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#fff1f2',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  loaderContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    opacity: 0.5,
  },
});
