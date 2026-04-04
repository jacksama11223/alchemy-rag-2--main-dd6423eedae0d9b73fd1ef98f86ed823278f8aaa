
// ... (imports remain the same as previous, ensure all are included)
import React, { useMemo, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import CallToAction from './components/CallToAction';
import SocraticTutor from './components/SocraticTutor';
import LoginModal from './components/LoginModal';
import Dashboard from './components/Dashboard';
import Alchemy from './components/Alchemy';
import KnowledgeGraph from './components/KnowledgeGraph';
import NoteTaking from './components/NoteTaking';
import { DriveStorage } from './components/DriveStorage';
import { ThingsToDo } from './components/ThingsToDo'; 
import VideoCourse from './components/VideoCourse';
import Community from './components/Community'; 
import { LearnWithPeople } from './components/LearnWithPeople'; 
import { FriendManager } from './components/FriendManager';
import { GlobalTodoPanel } from './components/GlobalTodoPanel';
import About from './components/About';
import Vision from './components/Vision';
import Mission from './components/Mission';
import Story from './components/Story';
import Team from './components/Team';
import Contact from './components/Contact';
import ExploreGraph from './components/ExploreGraph';
import ExploreSearch from './components/ExploreSearch';
import ExploreCategory from './components/ExploreCategory';
import ExploreTopic from './components/ExploreTopic';
import ExploreDifficulty from './components/ExploreDifficulty';
import ExploreSkill from './components/ExploreSkill';
import FAQ from './components/FAQ';
import Account from './components/Account';
import LearningModal from './components/LearningModal';
import DrawEverything from './components/DrawEverything'; 
import { DrawingManager } from './components/DrawingManager';
import AchievementGallery from './components/AchievementGallery';
import { NeuralFeedbackWidget } from './components/NeuralFeedbackWidget';
import { NeuralBridgeProcessor } from './components/NeuralBridgeProcessor';
import { UserFlowMap } from './components/UserFlowMap';
import UserGuide from './components/UserGuide'; 
import { AdminBoard } from './components/AdminBoard'; 
import NeuralCodex from './components/NeuralCodex';
import NeuralHolodeck from './components/NeuralHolodeck';
import { FeedbackModal } from './components/FeedbackModal';
import YoutubeExtractIntegration from './components/alchemy-youtubevideo-extract/YoutubeExtractIntegration';
import { WindowManager } from './components/Dashboard-MultiTasking/components/WindowManager';
import ResetPassword from './components/ResetPassword';
import OnboardingModal from './components/OnboardingModal';
import OnboardingTour from './components/OnboardingTour';
import { Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { useLayoutStore } from './store/useLayoutStore';
import usePushNotifications from './src/hooks/usePushNotifications';

import { KnowledgeNode, SavedDrawing, AlchemyIntent, Quest, TodoTask, UserAccount, AdminUserFlow } from './types';
import { getGlobalStats } from './services/sm2Service';
import { analyzeImageForDiscussion } from './services/geminiService';
import { useGamification } from './contexts/GamificationContext'; 
import { useBehavior } from './contexts/BehaviorContext';
import { getCurrentUser, getUserNodes, saveUserNodes, logoutUser, getUserNodesByUserId, fetchUserNodesFromServer, fetchMarketplace } from './services/mockBackend';
import { socketService } from './services/socketService';

type ViewState = 'landing' | 'dashboard' | 'tutor' | 'alchemy' | 'knowledge-graph' | 'media' | 'drive' | 'digest' | 'video' | 'youtube' | 'community' | 'battle' | 'about' | 'vision' | 'mission' | 'story' | 'team' | 'contact' | 'explore-graph' | 'explore-search' | 'explore-category' | 'explore-topic' | 'explore-difficulty' | 'explore-skill' | 'faq' | 'account' | 'draw' | 'drawing-manager' | 'achievements' | 'bridge' | 'user-flow' | 'user-guide' | 'admin' | 'codex' | 'holodeck' | 'reset-password';

import { useMultiTaskStore } from './components/Dashboard-MultiTasking/store/useMultiTaskStore';
import { useAppStore } from './store/useAppStore';

function App() {
  const {
    view, setView,
    isLoginModalOpen, setIsLoginModalOpen,
    isLoggedIn, setIsLoggedIn,
    isFriendManagerOpen, setIsFriendManagerOpen,
    isTodoPanelOpen, setIsTodoPanelOpen,
    isFeedbackModalOpen, setIsFeedbackModalOpen,
    impersonatingUser, setImpersonatingUser,
    adminSession, setAdminSession,
    activeAdminFlow, setActiveAdminFlow,
    flowStepIndex, setFlowStepIndex,
    scrollToFeatures, setScrollToFeatures,
    userNodes, setUserNodes,
    selectedNode, setSelectedNode,
    activeTagFilter, setActiveTagFilter,
    focusedNodeId, setFocusedNodeId,
    quests, setQuests,
    activeAchievement, setActiveAchievement,
    tasks, setTasks,
    alchemyIntent, setAlchemyIntent,
    tutorContext, setTutorContext,
    tutorContextNode, setTutorContextNode,
    learningQueue, setLearningQueue,
    currentPlaylistIndex, setCurrentPlaylistIndex,
    currentDrawing, setCurrentDrawing,
    bridgeData, setBridgeData,
    systemNotification, setSystemNotification,
    isOnboardingModalOpen, setIsOnboardingModalOpen,
    isOnboardingTourRun, setIsOnboardingTourRun,
    toggleTodoPanel
  } = useAppStore();

  const { isSidebarOpen } = useLayoutStore();

  const user = getCurrentUser();
  usePushNotifications(user);

  const hasLoadedNodes = React.useRef(false);
  
  const { progress, addXP, rankProfile } = useGamification();
  const { logAction } = useBehavior();
  
  const stats = useMemo(() => getGlobalStats(userNodes), [userNodes]);

  const currentDebugState = {
      view,
      userNodesCount: userNodes.length,
      userNodes, 
      tasks, 
      stats,
      intent: alchemyIntent,
      selectedNode,
      tutorContextNode,
      quests, 
      activeAchievement,
      bridgeData, 
      gamification: { xp: progress.xp, level: progress.level, rankProfile: rankProfile }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
        setView('reset-password');
        return;
    }

    const user = getCurrentUser();
    if (user) {
        setIsLoggedIn(true);
        if (user.isAdmin) {
             setView('admin');
        } else {
             setView('dashboard');
             // ASYNC FETCH NODES ON LOAD
             fetchUserNodesFromServer().then(nodes => {
                 setUserNodes(nodes);
                 hasLoadedNodes.current = true;
             });
             // PRE-FETCH MARKET
             fetchMarketplace();
        }
    }

    const storedTasks = localStorage.getItem('learnai_todos');
    if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
    }
  }, []);
    
  // Fetch from backend if logged in
  useEffect(() => {
      if (localStorage.getItem('learnai_session')) {
          import('./services/mockBackend').then(module => {
              module.getTodosFromBackend().then(backendTasks => {
                  if (backendTasks && backendTasks.length > 0) {
                      setTasks(backendTasks);
                  }
              });
          });
      }
  }, [view]);

  useEffect(() => {
      // Only save user nodes if logged in AND NOT in admin view AND NOT Impersonating
      // AND we have successfully loaded nodes from server at least once
      if (isLoggedIn && view !== 'admin' && !impersonatingUser && hasLoadedNodes.current) {
          const timeoutId = setTimeout(() => {
              saveUserNodes(userNodes).then(updatedNodes => {
                  if (updatedNodes) {
                      // Check if any IDs changed (e.g. from Date.now() to MongoDB ObjectId)
                      const hasChanges = updatedNodes.some((n, i) => n.id !== userNodes[i]?.id);
                      if (hasChanges) {
                          setUserNodes(updatedNodes);
                      }
                  }
              });
          }, 1000); // Debounce for 1 second
          return () => clearTimeout(timeoutId);
      }
  }, [userNodes, isLoggedIn, view, impersonatingUser]);

  useEffect(() => {
      if (isLoggedIn && !impersonatingUser) {
          const socket = socketService.connect();
          const user = getCurrentUser();
          if (user) {
              socket.emit('user_online', { id: user.id, name: user.name, role: user.isAdmin ? 'admin' : 'user' });
              
              if (user.isAdmin) {
                  socket.emit('join_admin');
              } else {
                  socket.emit('join_user', user.id);
              }
          }

          socket.on('system_broadcast', (data) => {
              setSystemNotification({ title: data.title, message: data.message });
              setTimeout(() => setSystemNotification(null), 10000); // Auto dismiss after 10s
          });

          socket.on('feedback_updated', (data) => {
              setSystemNotification({ 
                  title: 'Phản hồi đã được cập nhật', 
                  message: `Trạng thái: ${data.status}\n${data.reply ? `Trả lời: ${data.reply}` : ''}` 
              });
              setTimeout(() => setSystemNotification(null), 10000);
          });

          return () => {
              socket.off('system_broadcast');
              socket.off('feedback_updated');
          };
      }
  }, [isLoggedIn, impersonatingUser]);

  useEffect(() => {
      if (tasks.length > 0) {
          localStorage.setItem('learnai_todos', JSON.stringify(tasks));
      }
  }, [tasks]);

  const handleStart = () => { setIsLoginModalOpen(true); };
  const handleLoginClick = () => { setIsLoginModalOpen(true); };
  const handleCloseModal = () => { setIsLoginModalOpen(false); };
  
  const handleLoginSuccess = (user: UserAccount) => { 
      setIsLoginModalOpen(false); 
      setIsLoggedIn(true); 
      
      localStorage.setItem('learnai_session', JSON.stringify(user));

      if (user.isAdmin === true) {
          setView('admin');
          logAction('view_feature', 'Login', 'Admin Logged In');
          setUserNodes([]); 
      } else {
          // Fetch real nodes on login
          fetchUserNodesFromServer().then(nodes => {
              setUserNodes(nodes);
              hasLoadedNodes.current = true;
          });
          setView('dashboard'); 
          logAction('view_feature', 'Login', 'User Logged In');
          
          if (!user.persona) {
              setIsOnboardingModalOpen(true);
          }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };
  
  const handleLogout = useCallback(() => { 
      logoutUser();
      socketService.disconnect();
      setIsLoggedIn(false); 
      setUserNodes([]);
      setView('landing'); 
      logAction('view_feature', 'Logout', 'User Logged Out');
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
      setImpersonatingUser(null);
      setAdminSession(null);
      setActiveAdminFlow(null); 
  }, [setIsLoggedIn, setUserNodes, setView, logAction, setImpersonatingUser, setAdminSession, setActiveAdminFlow]);

  // --- IMPERSONATION LOGIC ---
  const handleImpersonateUser = useCallback((targetUser: UserAccount, flow?: AdminUserFlow) => {
      const currentUser = getCurrentUser();
      if (currentUser?.isAdmin) {
          setAdminSession(currentUser); 
          setImpersonatingUser(targetUser);
          
          const targetNodes = getUserNodesByUserId(targetUser.id);
          setUserNodes(targetNodes);
          
          setView('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          
          if (flow) {
              setActiveAdminFlow(flow);
              setFlowStepIndex(0);
          } else {
              alert(`Ghost Mode Activated: Viewing as ${targetUser.name}`);
          }
      }
  }, [setAdminSession, setImpersonatingUser, setUserNodes, setView, setActiveAdminFlow, setFlowStepIndex]);

  const handleStopImpersonation = useCallback(() => {
      if (adminSession) {
          localStorage.setItem('learnai_session', JSON.stringify(adminSession));
          setImpersonatingUser(null);
          setAdminSession(null);
          setUserNodes([]); 
          setActiveAdminFlow(null);
          setView('admin'); 
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  }, [adminSession, setImpersonatingUser, setAdminSession, setUserNodes, setActiveAdminFlow, setView]);

  const handleFlowNextStep = useCallback(() => {
      if (!activeAdminFlow) return;
      const nextIndex = flowStepIndex + 1;
      if (nextIndex < activeAdminFlow.steps.length) {
          setFlowStepIndex(nextIndex);
          const nextView = activeAdminFlow.steps[nextIndex].targetView as ViewState;
          if (nextView) setView(nextView);
      } else {
          alert("Flow Completed! Returning to Admin Panel.");
          handleStopImpersonation();
      }
  }, [activeAdminFlow, flowStepIndex, setFlowStepIndex, setView, handleStopImpersonation]);
  
  const handleFlowPrevStep = useCallback(() => {
      if (flowStepIndex > 0 && activeAdminFlow) {
          const prevIndex = flowStepIndex - 1;
          setFlowStepIndex(prevIndex);
          const prevView = activeAdminFlow.steps[prevIndex].targetView as ViewState;
          if (prevView) setView(prevView);
      }
  }, [flowStepIndex, activeAdminFlow, setFlowStepIndex, setView]);

  const handleFeatureSelect = useCallback((feature: string, params?: any) => {
    logAction('view_feature', feature, `Navigated to ${feature}`);

    if (feature === 'user-guide') {
        setView('user-guide');
    }
    else if (feature === 'user-flow') {
        setView('user-flow');
    }
    else if (feature === 'bridge' && params) {
        setBridgeData(params);
        setView('bridge');
    }
    else if (feature === 'alchemy') { 
        if (params) setAlchemyIntent(params);
        else setAlchemyIntent({ type: 'create' });
        setView('alchemy'); 
    }
    else if (feature === 'knowledge-graph') { 
        if (params && params.nodeId) {
            const targetNode = userNodes.find(n => n.id === params.nodeId);
            if (targetNode) {
                setSelectedNode(targetNode);
                setFocusedNodeId(params.nodeId);
            }
        } else {
            setActiveTagFilter(null); 
            setFocusedNodeId(null); 
        }
        setView('explore-graph'); 
    }
    else if (feature === 'media') { 
        if(params) setAlchemyIntent(params);
        setView('media');
    }
    else if (feature === 'tutor') { 
        if(params && params.context) {
            setTutorContext(params.context);
            setTutorContextNode(null);
        } else {
            setTutorContext(''); 
            setTutorContextNode(null);
        }
        setView('tutor');
    }
    else if (feature === 'drive') setView('drive'); 
    else if (feature === 'digest') { 
        if(params && params.task) { /* Pre-fill logic */ }
        setView('digest'); 
    } 
    else if (feature === 'video') setView('video');
    else if (feature === 'youtube') setView('youtube');
    else if (feature === 'community') setView('community'); 
    else if (feature === 'draw') setView('drawing-manager'); 
    else if (feature === 'explore-graph') { 
        setActiveTagFilter(null); 
        setFocusedNodeId(null); 
        setView('explore-graph'); 
    }
    else if (feature === 'achievements') setView('achievements');
    else if (feature === 'codex') setView('codex');
    else if (feature === 'holodeck') setView('holodeck');
    else if (feature === 'dashboard') setView('dashboard');
    else if (feature === 'note' && params) {
         setAlchemyIntent(params); 
         setView('media');
    }
    else setView('tutor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [logAction, setView, setBridgeData, setAlchemyIntent, userNodes, setSelectedNode, setFocusedNodeId, setActiveTagFilter, setTutorContext, setTutorContextNode]);
  
  const handleGoBackToDashboard = useCallback(() => { setView('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [setView]);
  const handleGoToFeatures = useCallback(() => { if (view !== 'dashboard') setView('dashboard'); setScrollToFeatures(true); if (view === 'dashboard') setTimeout(() => { const el = document.getElementById('feature-navigation-grid'); if(el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }, [view, setView, setScrollToFeatures]);
  const handleShowAbout = useCallback(() => { setView('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [setView]);
  const handleShowVision = useCallback(() => { setView('vision'); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [setView]);
  const handleShowMission = useCallback(() => { setView('mission'); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [setView]);
  const handleShowStory = useCallback(() => { setView('story'); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [setView]);
  const handleShowTeam = useCallback(() => { setView('team'); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [setView]);
  const handleShowContact = useCallback(() => { setView('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [setView]);
  const handleShowFAQ = useCallback(() => { setView('faq'); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [setView]);
  const handleShowAccount = useCallback(() => { setView('account'); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [setView]);
  const handleBackFromAbout = useCallback(() => { isLoggedIn ? setView('dashboard') : setView('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [isLoggedIn, setView]);
  const handleBackFromFAQ = useCallback(() => { isLoggedIn ? setView('dashboard') : setView('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [isLoggedIn, setView]);

  const handleAddNode = useCallback((node: KnowledgeNode) => { 
      setUserNodes(prev => [...prev, node]); 
      setFocusedNodeId(node.id); 
      addXP(50, "Khởi tạo Khái niệm mới"); 
      logAction('create_content', 'Graph', `Created node: ${node.title}`); 
  }, [setUserNodes, setFocusedNodeId, addXP, logAction]);

  const handleAddNodes = useCallback((nodes: KnowledgeNode[]) => { 
      setUserNodes(prev => [...prev, ...nodes]); 
      addXP(nodes.length * 20, "Nhập liệu Khối lượng lớn"); 
      logAction('create_content', 'Graph', `Bulk created ${nodes.length} nodes`); 
  }, [setUserNodes, addXP, logAction]);
  
  const handleEditNodeInNoteLab = useCallback((node: KnowledgeNode) => {
      setSelectedNode(null); 
      const noteContent = JSON.stringify(node.data, null, 2);
      setAlchemyIntent({ 
          type: 'create', 
          label: `Edit: ${node.title}`,
          data: noteContent 
      });
      setView('media'); 
      logAction('view_feature', 'NoteLab', `Imported node for editing: ${node.title}`);
  }, [setSelectedNode, setAlchemyIntent, setView, logAction]);

  const handleUpdateNode = useCallback((updatedNode: KnowledgeNode) => { setUserNodes(prev => prev.map(n => n.id === updatedNode.id ? updatedNode : n)); setLearningQueue(prev => prev.map(n => n.id === updatedNode.id ? updatedNode : n)); if (selectedNode && selectedNode.id === updatedNode.id) setSelectedNode(updatedNode); }, [setUserNodes, setLearningQueue, selectedNode, setSelectedNode]);
  const handleNavigateToAlchemy = useCallback((intent: AlchemyIntent) => { setAlchemyIntent(intent); setView('alchemy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [setAlchemyIntent, setView]);
  const handleRegisterQuest = useCallback((quest: Quest) => { setQuests(prev => [...prev, quest]); if (quest.type === 'LearningPath') setView('explore-graph'); logAction('click_element', 'Quest', `Registered Quest: ${quest.title}`); }, [setQuests, setView, logAction]);
  const handleClaimQuest = useCallback((quest: Quest) => { setQuests(prev => prev.map(q => q.id === quest.id ? { ...q, completed: true } : q)); let rewardXP = 100; if (quest.reward.includes('XP')) { const match = quest.reward.match(/(\d+)/); if (match) rewardXP = parseInt(match[0]); } else if (quest.type === 'LearningPath') { rewardXP = 500; } addXP(rewardXP, `Hoàn tất Mục tiêu Nghiên cứu: ${quest.title}`); logAction('complete_task', 'Quest', `Claimed Quest: ${quest.title}`); setActiveAchievement({ title: "Mục tiêu Nghiên cứu Hoàn tất!", desc: `Hệ thống ghi nhận ${rewardXP} điểm kinh nghiệm từ "${quest.title}".` }); }, [setQuests, addXP, logAction, setActiveAchievement]);
  const handleGainXP = useCallback((amount: number, reason: string) => { addXP(amount, reason); }, [addXP]);
  const handleAddTask = useCallback(async (content: string, desc: string, priority: 1|2|3|4, dueDate: string|null, feature?: string) => { 
      const newTask: TodoTask = { id: Date.now().toString(), content: content, description: desc, priority: priority, dueDate: dueDate, projectId: 'inbox', isCompleted: false, tags: [], subtasks: [], status: 'todo', startDate: new Date().toISOString().split('T')[0], linkedFeature: feature }; 
      
      // Optimistic update
      setTasks(prev => [...prev, newTask]); 
      addXP(10, "Thiết lập Nhiệm vụ mới"); 
      logAction('create_content', 'Todo', `Added Task: ${content}`); 
      
      // Save to backend
      if (localStorage.getItem('learnai_session')) {
          import('./services/mockBackend').then(async module => {
              const savedTask = await module.saveTodoToBackend(newTask);
              if (savedTask) {
                  setTasks(prev => prev.map(t => t.id === newTask.id ? savedTask : t));
              }
          });
      }
  }, [setTasks, addXP, logAction]);
  
  const handleToggleTask = useCallback((id: string) => { 
      let updatedTask: TodoTask | null = null;
      setTasks(prev => {
          const newTasks = prev.map(t => { 
              if (t.id === id) { 
                  const completed = !t.isCompleted; 
                  if (completed) { 
                      addXP(50, `Hoàn tất: ${t.content}`); 
                      logAction('complete_task', 'Todo', `Completed Task: ${t.content}`); 
                  } 
                  updatedTask = { ...t, isCompleted: completed, completedAt: completed ? new Date().toISOString() : undefined };
                  return updatedTask; 
              } 
              return t; 
          });
          
          // Save to backend
          if (updatedTask && localStorage.getItem('learnai_session')) {
              import('./services/mockBackend').then(module => {
                  module.updateTodoInBackend(id, updatedTask!);
              });
          }
          
          return newTasks;
      }); 
  }, [setTasks, addXP, logAction]);
  const handleCategorySelect = useCallback((tag: string) => { if (tag === '') { setActiveTagFilter(null); } else { setActiveTagFilter(tag); } setView('explore-graph'); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [setActiveTagFilter, setView]);
  const handleExpandNode = useCallback((nodeTitle: string) => { handleNavigateToAlchemy({ type: 'expand', initialQuery: nodeTitle }); }, [handleNavigateToAlchemy]);
  const handleAskTutor = useCallback((node: KnowledgeNode) => { setTutorContextNode(node); setTutorContext(`Hãy giải thích chi tiết về "${node.title}".`); setView('tutor'); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [setTutorContextNode, setTutorContext, setView]);
  const handleCreateNoteFromChat = useCallback((content: string) => { handleNavigateToAlchemy({ type: 'create', initialQuery: content }); }, [handleNavigateToAlchemy]);
  const handleExplodeToFlashcards = useCallback((content: string) => { handleNavigateToAlchemy({ type: 'create', initialQuery: content }); }, [handleNavigateToAlchemy]);
  const handleSaveChatAsNode = useCallback((node: KnowledgeNode) => { 
      setUserNodes(prev => {
          const newNodes = [...prev, node];
          if (localStorage.getItem('learnai_session')) {
              import('./services/mockBackend').then(module => {
                  module.saveUserNodes(newNodes);
              });
          }
          return newNodes;
      }); 
      logAction('create_content', 'Tutor', `Saved Case Study: ${node.title}`); 
  }, [setUserNodes, logAction]);
  const handleExploreGraph = useCallback(() => { setView('explore-graph'); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [setView]);
  const handleExploreSearch = useCallback(() => { setView('explore-search'); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [setView]);
  const handleExploreCategory = useCallback(() => { setView('explore-category'); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [setView]);
  const handleExploreTopic = useCallback(() => { setView('explore-topic'); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [setView]);
  const handleExploreDifficulty = useCallback(() => { setView('explore-difficulty'); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [setView]);
  const handleExploreSkill = useCallback(() => { setView('explore-skill'); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [setView]);
  const handleNodeClick = (node: KnowledgeNode) => { setFocusedNodeId(node.id); logAction('click_element', 'Graph', `Selected node: ${node.title}`); };
  const handleNodeOpen = (node: KnowledgeNode) => { if (view !== 'explore-graph' && view !== 'knowledge-graph') { setView('explore-graph'); } setActiveTagFilter(null); setFocusedNodeId(node.id); setLearningQueue([]); setCurrentPlaylistIndex(0); setSelectedNode(node); logAction('view_feature', 'Learning', `Opened learning session for: ${node.title}`); };
  const handleDeepDive = (context: string) => { setTutorContext(context); setTutorContextNode(selectedNode); setSelectedNode(null); setView('tutor'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleStartPlaylist = (nodes: KnowledgeNode[]) => { if (nodes.length === 0) return; setLearningQueue(nodes); setCurrentPlaylistIndex(0); setSelectedNode(nodes[0]); logAction('view_feature', 'Playlist', `Started playlist with ${nodes.length} items`); };
  const handleNextNode = () => { addXP(20, "Hoàn tất đơn vị kiến thức"); if (currentPlaylistIndex < learningQueue.length - 1) { const nextIndex = currentPlaylistIndex + 1; setCurrentPlaylistIndex(nextIndex); setSelectedNode(learningQueue[nextIndex]); } else { setSelectedNode(null); setLearningQueue([]); addXP(50, "Hoàn tất Lộ trình Nghiên cứu"); logAction('complete_task', 'Playlist', 'Finished all items'); } };
  const handleMergeNodes = (nodesToMerge: KnowledgeNode[]) => { if (nodesToMerge.length < 2) return; const mergedTitle = `Tổng hợp Tri thức: ${nodesToMerge[0].title} & ${nodesToMerge.length - 1} khái niệm liên quan`; const mergedData: KnowledgeNode['data'] = { flashcards: nodesToMerge.flatMap(n => n.data?.flashcards || []), quiz: nodesToMerge.flatMap(n => n.data?.quiz || []), fillInBlanks: nodesToMerge.flatMap(n => n.data?.fillInBlanks || []), spotErrors: nodesToMerge.flatMap(n => n.data?.spotErrors || []), caseStudies: nodesToMerge.flatMap(n => n.data?.caseStudies || []), summary: nodesToMerge.map(n => n.data?.summary).filter(Boolean).join('\n\n---\n\n') }; const newNode: KnowledgeNode = { id: Date.now().toString(), title: mergedTitle, type: 'Mixed', status: 'new', tags: Array.from(new Set(nodesToMerge.flatMap(n => n.tags || []))), x: nodesToMerge.reduce((sum, n) => sum + n.x, 0) / nodesToMerge.length, y: nodesToMerge.reduce((sum, n) => sum + n.y, 0) / nodesToMerge.length, timestamp: new Date(), data: mergedData, imageUrl: nodesToMerge[0].imageUrl }; setUserNodes(prev => [...prev, newNode]); alert(`Đã hợp nhất ${nodesToMerge.length} đơn vị tri thức thành công!`); };
  const handleDeleteNodes = (nodes: KnowledgeNode[]) => { if (window.confirm("Xác nhận xóa các khái niệm này?")) { const ids = new Set(nodes.map(n => n.id)); setUserNodes(prev => prev.filter(n => !ids.has(n.id))); } };
  const handleDeleteNode = (node: KnowledgeNode) => handleDeleteNodes([node]);
  const showGlobalNav = !['dashboard', 'landing', 'alchemy', 'knowledge-graph', 'tutor', 'media', 'drive', 'digest', 'video', 'youtube', 'community', 'battle', 'explore-graph', 'explore-search', 'explore-category', 'draw', 'drawing-manager', 'achievements', 'bridge', 'user-flow', 'user-guide', 'admin', 'codex', 'holodeck'].includes(view);
  const handleOpenDrawing = (drawing: SavedDrawing) => { setCurrentDrawing(drawing); setView('draw'); };
  const handleTodoNavigate = (targetView: string) => { if (targetView === 'digest') { setView('digest'); } else { handleFeatureSelect(targetView); } setIsTodoPanelOpen(false); };
  
  const handleBridgeComplete = (target: string, processedData: any) => { 
      if (target === 'todo') {
           if (processedData.type === 'bulk-create') {
               setAlchemyIntent(processedData); 
           } else {
               handleAddTask(processedData.label, processedData.data, processedData.priority || 4, 'today', 'bridge'); 
           }
           setView('digest'); 
      } else if (target === 'note') { 
          setAlchemyIntent(processedData); setView('media'); 
      } else if (target === 'alchemy') { 
          setAlchemyIntent(processedData); setView('alchemy'); 
      } else if (target === 'graph') { 
          const newNode: KnowledgeNode = { id: Date.now().toString(), title: processedData.label, type: 'Flashcard', status: 'new', tags: ['Bridge Import'], x: 0, y: 0, timestamp: new Date(), data: { summary: processedData.data } }; handleAddNode(newNode); setView('explore-graph'); 
      } else { 
          setView('dashboard'); 
      } 
    };

  if (view === 'admin') {
      return (
          <>
              {systemNotification && (
                  <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-blue-900 border border-blue-500 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-blue-500/20 flex items-start gap-4 animate-bounce-in max-w-md w-full">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-blue-400">campaign</span>
                      </div>
                      <div className="flex-1">
                          <h4 className="font-bold text-lg mb-1">{systemNotification.title}</h4>
                          <p className="text-sm text-blue-100 whitespace-pre-wrap">{systemNotification.message}</p>
                      </div>
                      <button onClick={() => setSystemNotification(null)} className="text-blue-400 hover:text-white transition-colors">
                          <span className="material-symbols-outlined">close</span>
                      </button>
                  </div>
              )}
              <AdminBoard onLogout={handleLogout} onImpersonate={handleImpersonateUser} />
          </>
      );
  }

  const { windows } = useMultiTaskStore();
  const hasLeftSplit = windows.some(w => w.isSplit === 'left' && !w.isMinimized);
  const hasRightSplit = windows.some(w => w.isSplit === 'right' && !w.isMinimized);
  const hasTopSplit = windows.some(w => w.isSplit === 'top' && !w.isMinimized);
  const hasBottomSplit = windows.some(w => w.isSplit === 'bottom' && !w.isMinimized);

  const mainStyle: React.CSSProperties = {
    marginLeft: hasLeftSplit ? '50%' : 0,
    marginRight: hasRightSplit ? '50%' : 0,
    marginTop: hasTopSplit ? '50vh' : 0,
    marginBottom: hasBottomSplit ? '50vh' : 0,
    paddingLeft: (isLoggedIn && view !== 'landing' && view !== 'admin') ? (isSidebarOpen ? '16rem' : '4rem') : 0,
    transition: 'all 0.3s ease-in-out',
  };

  const renderAppContent = (type: string, isWindow: boolean, closeWindow?: () => void, windowId?: string, windowParams?: any) => {
    const handleWindowFeatureSelect = (feature: string, params?: any) => {
      if (isWindow && windowId) {
        const { updateWindow } = useMultiTaskStore.getState();
        
        // We still set global state for now to not break other things, 
        // but we also pass params to the window.
        if (feature === 'alchemy') { 
            if (params) setAlchemyIntent(params);
            else setAlchemyIntent({ type: 'create' });
        }
        else if (feature === 'knowledge-graph' || feature === 'explore-graph') { 
            if (params && params.nodeId) {
                const targetNode = userNodes.find(n => n.id === params.nodeId);
                if (targetNode) {
                    setSelectedNode(targetNode);
                    setFocusedNodeId(params.nodeId);
                }
            } else {
                setActiveTagFilter(null); 
                setFocusedNodeId(null); 
            }
        }
        else if (feature === 'media' && params) { 
            setAlchemyIntent(params);
        }
        else if (feature === 'tutor') { 
            if(params && params.context) {
                setTutorContext(params.context);
                setTutorContextNode(params.contextNode || null);
            } else {
                setTutorContext(''); 
                setTutorContextNode(null);
            }
        }
        else if (feature === 'note' && params) {
             setAlchemyIntent(params); 
             feature = 'media';
        }
        
        let targetType = feature;
        
        updateWindow(windowId, { type: targetType, params });
      } else {
        handleFeatureSelect(feature, params);
      }
    };

    const handleWindowNavigateToAlchemy = (intent: AlchemyIntent) => {
      if (isWindow && windowId) {
        const { updateWindow } = useMultiTaskStore.getState();
        setAlchemyIntent(intent);
        updateWindow(windowId, { type: 'alchemy', params: intent });
      } else {
        handleNavigateToAlchemy(intent);
      }
    };

    // Use windowParams if available, otherwise fallback to global state
    const currentAlchemyIntent = isWindow ? (windowParams || { type: 'create' }) : alchemyIntent;
    const currentTutorContext = isWindow ? windowParams?.context : tutorContext;
    const currentTutorContextNode = isWindow ? windowParams?.contextNode : tutorContextNode;
    const currentFocusedNodeId = isWindow ? windowParams?.nodeId : focusedNodeId;
    const activeDrawing = isWindow ? windowParams?.drawing : currentDrawing;

    switch (type) {
      case 'alchemy': return <Alchemy onBack={isWindow ? (closeWindow || (() => {})) : handleGoBackToDashboard} onShowAbout={handleShowAbout} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} onAddNode={handleAddNode} onAddNodes={handleAddNodes} onGoToGraph={() => handleWindowFeatureSelect('explore-graph')} userNodes={userNodes} onUpdateNode={handleUpdateNode} onNavigateToDistill={() => handleWindowFeatureSelect('video')} intent={currentAlchemyIntent} onGoToFeatures={handleGoToFeatures} onGoToBattle={() => handleWindowFeatureSelect('battle')} onToggleTodo={toggleTodoPanel} />;
      case 'knowledge-graph': return <KnowledgeGraph onBack={isWindow ? (closeWindow || (() => {})) : handleGoBackToDashboard} onShowAbout={handleShowAbout} onExplore={() => handleWindowFeatureSelect('explore-graph')} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} userNodes={userNodes} onNodeClick={isWindow ? (node) => handleWindowFeatureSelect('explore-graph', { nodeId: node.id }) : handleNodeOpen} onDeleteNode={handleDeleteNode} onGoToFeatures={handleGoToFeatures} />;
      case 'explore-graph': return <ExploreGraph onBack={isWindow ? (closeWindow || (() => {})) : handleGoBackToDashboard} onShowAbout={handleShowAbout} onSearch={handleExploreSearch} onCategory={handleExploreCategory} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} userNodes={userNodes} onNodeClick={isWindow ? (node) => handleWindowFeatureSelect('explore-graph', { nodeId: node.id }) : handleNodeClick} onOpenNode={(node) => handleWindowFeatureSelect('explore-graph', { nodeId: node.id })} onStartPlaylist={handleStartPlaylist} onMergeNodes={handleMergeNodes} onDeleteNodes={handleDeleteNodes} activeFilter={activeTagFilter} onClearFilter={() => setActiveTagFilter(null)} onExpandNode={handleExpandNode} onAskTutor={isWindow ? (node) => handleWindowFeatureSelect('tutor', { context: `Tôi muốn tìm hiểu sâu hơn về "${node.title}". Hãy giải thích cho tôi.`, contextNode: node }) : handleAskTutor} focusedNodeId={currentFocusedNodeId} onNavigateToAlchemy={handleWindowNavigateToAlchemy} onNavigateToFeature={handleWindowFeatureSelect} quests={quests} userXP={progress.xp} userLevel={progress.level} currentAchievement={activeAchievement} onClaimReward={handleClaimQuest} onCloseAchievement={() => setActiveAchievement(null)} onGainXP={handleGainXP} onRegisterQuest={handleRegisterQuest} onAddTask={handleAddTask} onGoToFeatures={handleGoToFeatures} onToggleTodo={toggleTodoPanel} intent={currentAlchemyIntent} onClearIntent={() => { if (isWindow && windowId) { useMultiTaskStore.getState().updateWindow(windowId, { type: 'explore-graph', params: null }); } else { setAlchemyIntent(null); } }} />;
      case 'tutor': return <SocraticTutor onBack={isWindow ? (closeWindow || (() => {})) : handleGoBackToDashboard} onShowAbout={handleShowAbout} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} initialMessage={currentTutorContext} contextNode={currentTutorContextNode} userNodes={userNodes} stats={stats} onSaveToAlchemy={isWindow ? (content) => handleWindowNavigateToAlchemy({ type: 'create', initialQuery: content }) : handleCreateNoteFromChat} onSaveCaseStudy={handleSaveChatAsNode} onUpdateNode={handleUpdateNode} onToggleTodo={toggleTodoPanel} onNavigateToFeature={handleWindowFeatureSelect} />;
      case 'draw': return activeDrawing ? <DrawEverything onBack={isWindow ? () => handleWindowFeatureSelect('draw', { drawing: null }) : () => handleFeatureSelect('drawing-manager')} onShowAbout={handleShowAbout} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} initialDrawing={activeDrawing} onToggleTodo={toggleTodoPanel} onAddNode={handleAddNode} onNavigateToAlchemy={handleWindowNavigateToAlchemy} onNavigateToFeature={handleWindowFeatureSelect} /> : <DrawingManager onBack={isWindow ? (closeWindow || (() => {})) : handleGoBackToDashboard} onOpenDrawing={isWindow ? (drawing) => handleWindowFeatureSelect('draw', { drawing }) : handleOpenDrawing} onShowAccount={handleShowAccount} onLogout={handleLogout} onNavigateToFeature={handleWindowFeatureSelect} />;
      case 'media': return <NoteTaking onBack={isWindow ? (closeWindow || (() => {})) : handleGoBackToDashboard} onShowAbout={handleShowAbout} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} onAnalyzeNote={isWindow ? (content) => handleWindowNavigateToAlchemy({ type: 'create', initialQuery: content }) : handleCreateNoteFromChat} onToggleTodo={toggleTodoPanel} onNavigateToFeature={handleWindowFeatureSelect} intent={currentAlchemyIntent} onClearIntent={() => { if (isWindow && windowId) { useMultiTaskStore.getState().updateWindow(windowId, { type: 'media', params: null }); } else { setAlchemyIntent(null); } }} />;
      case 'digest': return <ThingsToDo onBack={isWindow ? (closeWindow || (() => {})) : handleGoBackToDashboard} onShowAbout={handleShowAbout} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} intent={currentAlchemyIntent} onClearIntent={() => { if (isWindow && windowId) { useMultiTaskStore.getState().updateWindow(windowId, { type: 'digest', params: null }); } else { setAlchemyIntent(null); } }} />;
      case 'drive': return <DriveStorage onBack={isWindow ? (closeWindow || (() => {})) : handleGoBackToDashboard} onShowAccount={handleShowAccount} onNavigateToAlchemy={handleWindowNavigateToAlchemy} onToggleTodo={toggleTodoPanel} />;
      case 'community': return <Community onBack={isWindow ? (closeWindow || (() => {})) : handleGoBackToDashboard} onShowAbout={handleShowAbout} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} userNodes={userNodes} onUpdateNode={handleUpdateNode} onGoToBattle={() => handleWindowFeatureSelect('battle')} onToggleTodo={toggleTodoPanel} />;
      default: return <div className="p-4 text-white">Unknown App</div>;
    }
  };

  return (
    <div className={`flex flex-col min-h-screen font-display ${showGlobalNav ? 'bg-[#F8F9FA] dark:bg-[#101c22]' : ''}`}>
      {systemNotification && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-blue-900 border border-blue-500 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-blue-500/20 flex items-start gap-4 animate-bounce-in max-w-md w-full">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-blue-400">campaign</span>
              </div>
              <div className="flex-1">
                  <h4 className="font-bold text-lg mb-1">{systemNotification.title}</h4>
                  <p className="text-sm text-blue-100 whitespace-pre-wrap">{systemNotification.message}</p>
              </div>
              <button onClick={() => setSystemNotification(null)} className="text-blue-400 hover:text-white transition-colors">
                  <span className="material-symbols-outlined">close</span>
              </button>
          </div>
      )}
      {isLoggedIn && <NeuralFeedbackWidget />}
      {isLoggedIn && view !== 'landing' && view !== 'admin' && (
        <>
          <Sidebar />
          <CommandPalette />
        </>
      )}
      
      {impersonatingUser && !activeAdminFlow && (
          <div className="fixed top-20 right-6 z-[9999] animate-bounce-in">
              <button 
                  onClick={handleStopImpersonation}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full shadow-lg border-2 border-red-400 flex items-center gap-2"
              >
                  <span className="material-symbols-outlined animate-pulse">visibility_off</span>
                  Kết thúc Chế độ Mô phỏng ({impersonatingUser.name})
              </button>
          </div>
      )}
      
      {showGlobalNav && (
        <Header 
            onStart={handleStart} 
            onLoginClick={handleLoginClick} 
            isAppView={view !== 'landing'} 
            onShowAbout={handleShowAbout} 
            onShowFAQ={handleShowFAQ} 
            onGoToDashboard={handleGoBackToDashboard} 
            onGoToFeatures={handleGoToFeatures} 
            onShowFriends={() => setIsFriendManagerOpen(true)}
            onToggleTodo={toggleTodoPanel}
            onShowUserGuide={() => setView('user-guide')}
        />
      )}
      
      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseModal} onLoginSuccess={handleLoginSuccess} />
      
      <FriendManager isOpen={isFriendManagerOpen} onClose={() => setIsFriendManagerOpen(false)} />
      <GlobalTodoPanel 
        isOpen={isTodoPanelOpen} 
        onClose={() => setIsTodoPanelOpen(false)} 
        tasks={tasks}
        onAddTask={handleAddTask}
        onToggleTask={(id) => handleToggleTask(id)}
        currentView={view}
        onNavigate={handleTodoNavigate}
    />
      
      <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />

      {isLoggedIn && !impersonatingUser && view !== 'admin' && (
          <button 
              onClick={() => setIsFeedbackModalOpen(true)}
              className="fixed bottom-6 right-6 z-[9998] w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center transition-transform hover:scale-110 group"
              title="Gửi phản hồi"
          >
              <span className="material-symbols-outlined text-2xl group-hover:animate-bounce">forum</span>
          </button>
      )}

      {selectedNode && <LearningModal key={selectedNode.id} node={selectedNode} onClose={() => setSelectedNode(null)} onUpdateNode={handleUpdateNode} onDeepDive={handleDeepDive} playlistTotal={learningQueue.length > 0 ? learningQueue.length : undefined} playlistCurrent={learningQueue.length > 0 ? currentPlaylistIndex + 1 : undefined} onNextNode={learningQueue.length > 0 && currentPlaylistIndex < learningQueue.length - 1 ? handleNextNode : undefined} onEditInNoteLab={handleEditNodeInNoteLab} />}

      <main className="flex-grow flex flex-col relative z-0" style={mainStyle}>
        {view === 'landing' && <><Hero onStart={handleStart} /><Features /><Testimonials /><CallToAction onStart={handleStart} /></>}
        
        {view === 'dashboard' && <Dashboard stats={stats} />}
        
        {view === 'user-guide' && <UserGuide onBack={handleGoBackToDashboard} onNavigateToFeature={handleFeatureSelect} />}
        {view === 'achievements' && <AchievementGallery onBack={handleGoBackToDashboard} userNodes={userNodes} />}
        {view === 'user-flow' && <UserFlowMap onBack={handleGoBackToDashboard} />}
        {view === 'account' && <Account onBack={handleGoBackToDashboard} onLogout={handleLogout} onShowAbout={handleShowAbout} onShowFAQ={handleShowFAQ} onGoToFeatures={handleGoToFeatures} />}
        {view === 'tutor' && <SocraticTutor onBack={handleGoBackToDashboard} onShowAbout={handleShowAbout} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} initialMessage={tutorContext} contextNode={tutorContextNode} userNodes={userNodes} stats={stats} onSaveToAlchemy={handleCreateNoteFromChat} onSaveCaseStudy={handleSaveChatAsNode} onUpdateNode={handleUpdateNode} onToggleTodo={toggleTodoPanel} onNavigateToFeature={handleFeatureSelect} />}
        {view === 'alchemy' && <Alchemy onBack={handleGoBackToDashboard} onShowAbout={handleShowAbout} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} onAddNode={handleAddNode} onAddNodes={handleAddNodes} onGoToGraph={() => handleFeatureSelect('explore-graph')} userNodes={userNodes} onUpdateNode={handleUpdateNode} onNavigateToDistill={() => handleFeatureSelect('video')} intent={alchemyIntent} onGoToFeatures={handleGoToFeatures} onGoToBattle={() => setView('battle')} onToggleTodo={toggleTodoPanel} />}
        {view === 'explore-graph' && <ExploreGraph onBack={handleGoBackToDashboard} onShowAbout={handleShowAbout} onSearch={handleExploreSearch} onCategory={handleExploreCategory} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} userNodes={userNodes} onNodeClick={handleNodeClick} onOpenNode={handleNodeOpen} onStartPlaylist={handleStartPlaylist} onMergeNodes={handleMergeNodes} onDeleteNodes={handleDeleteNodes} activeFilter={activeTagFilter} onClearFilter={() => setActiveTagFilter(null)} onExpandNode={handleExpandNode} onAskTutor={handleAskTutor} focusedNodeId={focusedNodeId} onNavigateToAlchemy={handleNavigateToAlchemy} onNavigateToFeature={handleFeatureSelect} quests={quests} userXP={progress.xp} userLevel={progress.level} currentAchievement={activeAchievement} onClaimReward={handleClaimQuest} onCloseAchievement={() => setActiveAchievement(null)} onGainXP={handleGainXP} onRegisterQuest={handleRegisterQuest} onAddTask={handleAddTask} onGoToFeatures={handleGoToFeatures} onToggleTodo={toggleTodoPanel} intent={alchemyIntent} onClearIntent={() => setAlchemyIntent(null)} />}
        {view === 'explore-search' && <ExploreSearch onBack={handleExploreGraph} onShowAbout={handleShowAbout} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} onGoToFeatures={handleGoToFeatures} />}
        {view === 'explore-category' && <ExploreCategory onBack={handleGoBackToDashboard} onShowAbout={handleShowAbout} onTopicSelect={handleCategorySelect} onDifficultySelect={handleExploreDifficulty} onSkillSelect={handleExploreSkill} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} userNodes={userNodes} onGoToFeatures={handleGoToFeatures} onOpenNode={handleNodeOpen} />}
        {view === 'knowledge-graph' && <KnowledgeGraph onBack={handleGoBackToDashboard} onShowAbout={handleShowAbout} onExplore={handleExploreGraph} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} userNodes={userNodes} onNodeClick={handleNodeOpen} onDeleteNode={handleDeleteNode} onGoToFeatures={handleGoToFeatures} />}
        {view === 'explore-topic' && <ExploreTopic onBack={handleExploreCategory} onShowAbout={handleShowAbout} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} onGoToFeatures={handleGoToFeatures} />}
        {view === 'explore-difficulty' && <ExploreDifficulty onBack={handleExploreCategory} onShowAbout={handleShowAbout} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} onGoToFeatures={handleGoToFeatures} />}
        {view === 'explore-skill' && <ExploreSkill onBack={handleExploreCategory} onShowAbout={handleShowAbout} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} onGoToFeatures={handleGoToFeatures} />}
        {view === 'media' && <NoteTaking onBack={handleGoBackToDashboard} onShowAbout={handleShowAbout} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} onAnalyzeNote={handleCreateNoteFromChat} onToggleTodo={toggleTodoPanel} onNavigateToFeature={handleFeatureSelect} intent={alchemyIntent} onClearIntent={() => setAlchemyIntent(null)} />}
        {view === 'drive' && <DriveStorage onBack={handleGoBackToDashboard} onShowAccount={handleShowAccount} onNavigateToAlchemy={handleNavigateToAlchemy} onToggleTodo={toggleTodoPanel} />}
        {view === 'digest' && <ThingsToDo onBack={handleGoBackToDashboard} onShowAbout={handleShowAbout} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} intent={alchemyIntent} onClearIntent={() => setAlchemyIntent(null)} />}
        {view === 'video' && <VideoCourse onBack={handleGoBackToDashboard} onShowAbout={handleShowAbout} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} onAddNodes={handleAddNodes} onRegisterQuest={handleRegisterQuest} onToggleTodo={toggleTodoPanel} />}
        {view === 'youtube' && (
            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <YoutubeExtractIntegration onAddSource={(source) => handleNavigateToAlchemy({ type: 'create', data: source.content, label: source.metadata?.title })} />
            </div>
        )}
        {view === 'community' && <Community onBack={handleGoBackToDashboard} onShowAbout={handleShowAbout} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} userNodes={userNodes} onUpdateNode={handleUpdateNode} onGoToBattle={() => setView('battle')} onToggleTodo={toggleTodoPanel} />}
        {view === 'battle' && <LearnWithPeople onBack={() => setView('community')} userNodes={userNodes} />}
        {view === 'drawing-manager' && <DrawingManager onBack={handleGoBackToDashboard} onOpenDrawing={handleOpenDrawing} onShowAccount={handleShowAccount} onLogout={handleLogout} onNavigateToFeature={handleFeatureSelect} />}
        {view === 'draw' && currentDrawing && <DrawEverything onBack={() => setView('drawing-manager')} onShowAbout={handleShowAbout} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} initialDrawing={currentDrawing} onToggleTodo={toggleTodoPanel} onAddNode={handleAddNode} onNavigateToAlchemy={handleNavigateToAlchemy} onNavigateToFeature={handleFeatureSelect} />}
        {view === 'bridge' && bridgeData && <NeuralBridgeProcessor sourceContent={bridgeData.content} targetFeature={bridgeData.target as any} onComplete={handleBridgeComplete} onCancel={() => setView('dashboard')} />}
        {view === 'codex' && <NeuralCodex onBack={handleGoBackToDashboard} userNodes={userNodes} />}
        {view === 'holodeck' && <NeuralHolodeck onBack={handleGoBackToDashboard} />}
        {view === 'about' && <About onBack={handleBackFromAbout} onShowVision={handleShowVision} onShowMission={handleShowMission} onShowStory={handleShowStory} onShowTeam={handleShowTeam} onShowContact={handleShowContact} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} onGoToFeatures={handleGoToFeatures} />}
        {view === 'vision' && <Vision onBack={handleShowAbout} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} onGoToFeatures={handleGoToFeatures} />}
        {view === 'mission' && <Mission onBack={handleShowAbout} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} onGoToFeatures={handleGoToFeatures} />}
        {view === 'story' && <Story onBack={handleShowAbout} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} onGoToFeatures={handleGoToFeatures} />}
        {view === 'team' && <Team onBack={handleShowAbout} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} onGoToFeatures={handleGoToFeatures} />}
        {view === 'contact' && <Contact onBack={handleShowAbout} onLogout={handleLogout} onShowFAQ={handleShowFAQ} onShowAccount={handleShowAccount} onGoToFeatures={handleGoToFeatures} />}
        {view === 'faq' && <FAQ onBack={handleBackFromFAQ} onLogout={handleLogout} onShowAbout={handleShowAbout} onShowAccount={handleShowAccount} onGoToFeatures={handleGoToFeatures} />}
        {view === 'reset-password' && <ResetPassword token={new URLSearchParams(window.location.search).get('token') || ''} onSuccess={() => { window.history.replaceState({}, document.title, "/"); setView('landing'); setIsLoginModalOpen(true); }} />}
      </main>
      
      {isLoggedIn && <WindowManager renderAppContent={renderAppContent} />}
      
      {showGlobalNav && <Footer />}

      <OnboardingModal 
        isOpen={isOnboardingModalOpen} 
        onComplete={(persona) => {
          setIsOnboardingModalOpen(false);
          setIsOnboardingTourRun(true);
        }} 
      />
      <OnboardingTour 
        run={isOnboardingTourRun} 
        onComplete={() => setIsOnboardingTourRun(false)} 
      />
    </div>
  );
}

export default App;
