
// ... (imports remain the same)
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TodoTask, Project } from '../types';
import { TodoSidebar } from './todo/TodoSidebar';
import { TodoTaskItem } from './todo/TodoTaskItem';
import { TodoAddForm } from './todo/TodoAddForm';
import { SearchBar } from './todo/SearchBar';
import { SortControl, SortOption } from './todo/SortControl';
import { ProductivityStats } from './todo/ProductivityStats';
import { PomodoroTimer } from './todo/PomodoroTimer';
import { TaskDetailModal } from './todo/TaskDetailModal';
import { CalendarView } from './todo/CalendarView';
import { KanbanBoard } from './todo/KanbanBoard';
import { TrashBin } from './todo/TrashBin';
import { TemplateGallery } from './todo/TemplateGallery';
import { QuickNoteWidget } from './todo/QuickNoteWidget';
import { FilterBuilder, FilterCriteria } from './todo/FilterBuilder';
import { ContextMenu } from './todo/ContextMenu';
import { BulkActionToolbar } from './todo/BulkActionToolbar';
import { CalendarIntegration } from './todo/CalendarIntegration';
import { ExportImportTool } from './todo/ExportImportTool';
import { GanttChart } from './todo/GanttChart';
import { OnboardingTour } from './todo/OnboardingTour';
import { OfflineIndicator } from './todo/OfflineIndicator';
import { useGamification } from '../contexts/GamificationContext';
import { GuideTrigger } from './GuideSystem';

// NEW IMPORTS
import { ExportPlan } from './todo/ExportPlan';
import { ImportPlan } from './todo/ImportPlan';
import { ProjectManager } from './todo/ProjectManager'; // Import Project Manager
import { FeatureWindowControls } from './FeatureWindowControls';

import { getTodosFromBackend, saveTodoToBackend, deleteTodoFromBackend, getCurrentUser } from '../services/mockBackend'; // API

interface ThingsToDoProps {
    onBack: () => void;
    onShowAbout: () => void;
    onLogout: () => void;
    onShowFAQ: () => void;
    onShowAccount: () => void;
    intent?: any;
    onClearIntent?: () => void;
    onNavigateToFeature?: (feature: string, params?: any) => void; // For bridge navigation
}

// ... (TodoOceanBackground remains same) ...
const TodoOceanBackground: React.FC = () => {
    // ... (Keep existing implementation)
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        // Configuration
        const BUBBLE_COUNT = 70;
        const bubbles: any[] = [];

        // Initialize Bubbles (Focus Particles)
        for (let i = 0; i < BUBBLE_COUNT; i++) {
            bubbles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2 + 0.5,
                speedY: Math.random() * 0.3 + 0.1, // Slow rising
                speedX: (Math.random() - 0.5) * 0.1,
                opacity: Math.random() * 0.4 + 0.1,
                color: Math.random() > 0.7 ? '74, 222, 128' : '56, 189, 248' // Green (Done) or Blue (Focus)
            });
        }

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            // 1. Deep Abyssal Gradient (Focus Theme)
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, '#0f172a'); // Slate 900
            gradient.addColorStop(0.5, '#020617'); // Black/Blue
            gradient.addColorStop(1, '#1e1b4b'); // Deep Indigo
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // 2. Subtle Grid Lines (Structure)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.lineWidth = 1;
            const gridSize = 60;
            // Only draw a few lines for hint of structure without distraction
            for (let x = 0; x < width; x += gridSize) {
                if (x % (gridSize * 4) === 0) { // Sparse grid
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                    ctx.stroke();
                }
            }

            // 3. Draw Particles
            bubbles.forEach(b => {
                // Mouse Interaction: Gentle push
                const dx = b.x - mouseRef.current.x;
                const dy = b.y - mouseRef.current.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < 150) {
                    const force = (150 - dist) / 150;
                    b.x += (dx / dist) * force * 1;
                    b.y += (dy / dist) * force * 1;
                }

                // Movement
                b.y -= b.speedY;
                b.x += b.speedX;

                // Reset
                if (b.y < -10) {
                    b.y = height + 10;
                    b.x = Math.random() * width;
                }
                if (b.x < 0) b.x = width;
                if (b.x > width) b.x = 0;

                ctx.beginPath();
                ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${b.color}, ${b.opacity})`;
                // Subtle glow
                ctx.shadowBlur = 4;
                ctx.shadowColor = `rgba(${b.color}, 0.5)`;
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            requestAnimationFrame(animate);
        };

        const animId = requestAnimationFrame(animate);

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

export const ThingsToDo: React.FC<ThingsToDoProps> = ({ onBack, onShowAbout, onLogout, onShowFAQ, onShowAccount, intent, onClearIntent, onNavigateToFeature }) => {
    // --- STATE ---
    const [tasks, setTasks] = useState<TodoTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Default projects
    const defaultProjects: Project[] = [
        { id: 'inbox', name: 'Inbox', color: 'text-gray-400', icon: 'inbox' },
        { id: 'learning', name: 'Học tập', color: 'text-red-400', icon: 'school' },
        { id: 'work', name: 'Công việc', color: 'text-green-400', icon: 'work' },
        { id: 'personal', name: 'Cá nhân', color: 'text-blue-400', icon: 'person' },
    ];
    const [projects, setProjects] = useState<Project[]>(defaultProjects);
    
    const [activeView, setActiveView] = useState('inbox'); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    
    // Updated Prefill State
    const [prefilledContent, setPrefilledContent] = useState('');
    const [prefilledDesc, setPrefilledDesc] = useState('');
    const [prefilledPriority, setPrefilledPriority] = useState<1|2|3|4>(4);

    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState<SortOption>('date');
    const [selectedTaskForModal, setSelectedTaskForModal] = useState<TodoTask | null>(null);
    const [showTemplates, setShowTemplates] = useState(false);

    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, task: TodoTask } | null>(null);
    const [showFilterBuilder, setShowFilterBuilder] = useState(false);
    const [activeFilters, setActiveFilters] = useState<FilterCriteria[]>([]);
    const [showSettings, setShowSettings] = useState(false);

    // AI Planning State
    const [showPlanCreator, setShowPlanCreator] = useState(false);
    const [pendingPlanData, setPendingPlanData] = useState<{ title: string, tasks: any[] } | null>(null);
    
    // Project Management State
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null); // New state for edit mode

    const { addXP } = useGamification();

    // --- DATA LOADING ---
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const data = await getTodosFromBackend();
            setTasks(data);
            
            const savedProjects = localStorage.getItem('learnai_todo_projects');
            if (savedProjects) {
                setProjects(JSON.parse(savedProjects));
            }
            setIsLoading(false);
        };
        loadData();
    }, []);

    useEffect(() => {
        // Save projects to local storage for now (could be API)
        localStorage.setItem('learnai_todo_projects', JSON.stringify(projects));
    }, [projects]);

    // --- INTENT HANDLING ---
    useEffect(() => {
        if (intent) {
            // Handle Bulk Import (from Tutor Plan or Bridge)
            if (intent.type === 'bulk-create' && Array.isArray(intent.tasks)) {
                 // Trigger Import Modal instead of direct add for better UX
                 setPendingPlanData({
                     title: intent.label || "Kế hoạch được nhập",
                     tasks: intent.tasks
                 });
                 // Clear intent after consuming
                 if (onClearIntent) onClearIntent();
                 
            } 
            // Handle Single Import
            else if (intent.label) {
                setIsAdding(true);
                setPrefilledContent(intent.label);
                if (intent.data) setPrefilledDesc(intent.data);
                if (intent.priority) setPrefilledPriority(intent.priority as 1|2|3|4);
                if (onClearIntent) onClearIntent();
            }
        }
    }, [intent]);

    // --- HELPER: Convert AI Task to App Task ---
    const convertAndAddTasks = (aiTasks: any[]) => {
        const newTasksPromises = aiTasks.map((t) => {
            // Calculate due date based on offset
            let dueDate = null;
            if (t.dueDateOffset !== undefined) {
                const date = new Date();
                date.setDate(date.getDate() + t.dueDateOffset);
                dueDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
            } else if (t.dueDate === 'today') {
                dueDate = 'today';
            } else if (t.dueDate === 'tomorrow') {
                dueDate = 'tomorrow';
            }

            const newTask: TodoTask = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5), // Temp ID
                content: t.content,
                description: t.description || '',
                priority: (t.priority || 3) as 1|2|3|4,
                dueDate: dueDate,
                projectId: activeView !== 'inbox' && !['today', 'upcoming', 'completed', 'trash'].includes(activeView) ? activeView : 'inbox', // Respect current view context if project
                isCompleted: false,
                tags: t.tags || [],
                subtasks: t.subtasks ? t.subtasks.map((st: string) => ({ id: Math.random().toString(), content: st, isCompleted: false })) : [],
                status: 'todo',
                startDate: new Date().toISOString().split('T')[0]
            };
            
            return saveTodoToBackend(newTask);
        });

        Promise.all(newTasksPromises).then((savedTasks) => {
             const validTasks = savedTasks.filter(t => t !== null) as TodoTask[];
             setTasks(prev => [...prev, ...validTasks]);
             addXP(validTasks.length * 5, "Nhập kế hoạch AI");
             alert(`Đã nhập thành công ${validTasks.length} công việc.`);
             setPendingPlanData(null);
        });
    };

    // ... (Keep existing filtering logic)
    const filteredTasks = useMemo(() => {
        let result = tasks;

        if (activeView === 'trash') {
            return result.filter(t => t.isDeleted);
        } else {
            result = result.filter(t => !t.isDeleted);
        }

        if (!['calendar', 'kanban', 'gantt'].includes(activeView)) {
            result = result.filter(t => {
                // TAG FILTERING LOGIC
                if (activeView.startsWith('tag:')) {
                    const tagName = activeView.replace('tag:', '');
                    return t.tags?.includes(tagName) && !t.isCompleted;
                }

                if (activeView === 'today') return t.dueDate === 'today' && !t.isCompleted;
                if (activeView === 'upcoming') return (t.dueDate === 'tomorrow' || t.dueDate === 'upcoming') && !t.isCompleted;
                if (activeView === 'completed') return t.isCompleted;
                if (activeView === 'inbox') return (t.projectId === 'inbox' || !t.projectId) && !t.isCompleted;
                
                // Dynamic Project Filtering
                return t.projectId === activeView && !t.isCompleted;
            });
        }

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(t => t.content.toLowerCase().includes(lowerQuery) || t.description?.toLowerCase().includes(lowerQuery));
        }

        if (activeFilters.length > 0) {
            result = result.filter(task => {
                return activeFilters.every(filter => {
                    if (filter.field === 'content') return task.content.toLowerCase().includes(filter.value.toLowerCase());
                    if (filter.field === 'tag') return task.tags?.some(t => t.toLowerCase().includes(filter.value.toLowerCase()));
                    if (filter.field === 'priority') return task.priority.toString() === filter.value;
                    return true;
                });
            });
        }

        return result.sort((a, b) => {
            if (a.isMilestone && !b.isMilestone) return -1;
            if (!a.isMilestone && b.isMilestone) return 1;

            if (sortOption === 'priority') return a.priority - b.priority;
            if (sortOption === 'alpha') return a.content.localeCompare(b.content);
            if (sortOption === 'date') {
                if (a.dueDate === b.dueDate) return 0;
                if (a.dueDate === 'today') return -1;
                return 1;
            }
            return 0;
        });
    }, [tasks, activeView, searchQuery, activeFilters, sortOption]);

    const completedCount = tasks.filter(t => t.isCompleted && !t.isDeleted).length;

    // --- UNIFIED ACTIONS ---
    
    const handleAddTask = async (content: string, desc: string, priority: 1|2|3|4, date: string|null, projectId?: string, status: 'todo'|'in-progress'|'done' = 'todo') => {
        let targetProject = projectId || 'inbox';
        
        // If NO explicit projectId provided, try to infer from active view
        if (!projectId) {
             const systemViews = ['today', 'upcoming', 'completed', 'kanban', 'calendar', 'gantt', 'trash', 'inbox'];
             if (!systemViews.includes(activeView) && !activeView.startsWith('tag:')) {
                 // Active view IS a custom project or standard project
                 targetProject = activeView;
             }
        }
        
        // If adding while in a TAG view, automatically add that tag
        let initialTags: string[] = [];
        if (activeView.startsWith('tag:')) {
            initialTags.push(activeView.replace('tag:', ''));
        }

        const newTask: TodoTask = {
            id: Date.now().toString(), // Client ID for immediate display (backend will respect or replace)
            content: content,
            description: desc,
            priority: priority,
            dueDate: date || (activeView === 'today' ? 'today' : null),
            projectId: targetProject,
            isCompleted: status === 'done',
            completedAt: status === 'done' ? new Date().toISOString() : undefined,
            tags: initialTags,
            subtasks: [],
            status: status,
            startDate: new Date().toISOString().split('T')[0]
        };
        
        // Optimistic UI
        setTasks(prev => [...prev, newTask]);
        
        const saved = await saveTodoToBackend(newTask);
        if (saved) {
            setTasks(prev => prev.map(t => t.id === newTask.id ? saved : t));
        }
        
        addXP(10, "Thêm task mới");
        
        // Reset prefilled content after adding
        setPrefilledContent('');
        setPrefilledDesc('');
        setPrefilledPriority(4);
    };

    // ... (Keep existing handlers for update, delete, etc.)
    const handleUpdateTask = async (updatedTask: TodoTask) => {
        // Optimistic
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        if (selectedTaskForModal?.id === updatedTask.id) {
            setSelectedTaskForModal(updatedTask);
        }
        await saveTodoToBackend(updatedTask);
    };

    const toggleTask = (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            const nowCompleted = !task.isCompleted;
            handleUpdateTask({
                ...task,
                isCompleted: nowCompleted,
                completedAt: nowCompleted ? new Date().toISOString() : undefined,
                status: nowCompleted ? 'done' : 'todo'
            });
            if (nowCompleted) {
                // Determine XP based on priority
                let xpGain = 50; // Default (Priority 4)
                if (task.priority === 1) xpGain = 150;
                else if (task.priority === 2) xpGain = 100;
                else if (task.priority === 3) xpGain = 75;
                
                addXP(xpGain, `Hoàn thành: ${task.content}`);
            }
        }
    };

    const handleSoftDelete = async (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            handleUpdateTask({ ...task, isDeleted: true });
        }
        if (selectedTaskForModal?.id === id) setSelectedTaskForModal(null);
    };

    const handleRestore = (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
             handleUpdateTask({ ...task, isDeleted: false });
        }
    };

    const handlePermanentDelete = async (id: string) => {
        if(window.confirm("Hành động này không thể hoàn tác. Xóa vĩnh viễn?")) {
            setTasks(prev => prev.filter(t => t.id !== id));
            await deleteTodoFromBackend(id);
        }
    };

    const handleUpdateStatus = (taskId: string, status: 'todo' | 'in-progress' | 'done') => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            // Check if becoming done
            const isBecomingDone = status === 'done' && !task.isCompleted;
            
            handleUpdateTask({ 
                ...task, 
                status, 
                isCompleted: status === 'done',
                completedAt: status === 'done' ? new Date().toISOString() : undefined
            });

            if(isBecomingDone) {
                 addXP(50, "Cập nhật trạng thái: Done");
            }
        }
    };

    const handleApplyTemplate = (templateTasks: { content: string, subtasks?: string[] }[]) => {
        // This is a bulk create
        const newTasksPromises = templateTasks.map(t => {
             const newTask = {
                id: Date.now().toString() + Math.random().toString().substr(2,5),
                content: t.content,
                priority: 4 as const,
                dueDate: null,
                isCompleted: false,
                projectId: 'inbox',
                subtasks: t.subtasks?.map(st => ({ id: Math.random().toString(), content: st, isCompleted: false })) || [],
                status: 'todo' as const,
                startDate: new Date().toISOString().split('T')[0]
            };
            return saveTodoToBackend(newTask);
        });
        
        Promise.all(newTasksPromises).then((saved) => {
            const valid = saved.filter(t => t !== null) as TodoTask[];
            setTasks(prev => [...prev, ...valid]);
        });
        
        setShowTemplates(false);
    };

    // Bulk Actions
    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedTaskIds);
        if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
        setSelectedTaskIds(newSet);
    };

    const handleBulkDelete = () => {
        if(window.confirm(`Xóa ${selectedTaskIds.size} mục đã chọn?`)) {
            // Soft delete all
            selectedTaskIds.forEach(id => {
                const t = tasks.find(x => x.id === id);
                if (t) handleUpdateTask({...t, isDeleted: true});
            });
            setSelectedTaskIds(new Set());
        }
    };

    const handleBulkComplete = () => {
        let count = 0;
        selectedTaskIds.forEach(id => {
            const t = tasks.find(x => x.id === id);
            if (t && !t.isCompleted) {
                count++;
                handleUpdateTask({ ...t, isCompleted: true, status: 'done', completedAt: new Date().toISOString() });
            }
        });
        if (count > 0) addXP(count * 50, `Hoàn thành hàng loạt (${count})`);
        setSelectedTaskIds(new Set());
    };

    const handleBulkMove = () => {
        const pid = prompt("Nhập ID dự án để chuyển (inbox, learning, work, personal):");
        if(pid) {
             selectedTaskIds.forEach(id => {
                const t = tasks.find(x => x.id === id);
                if (t) handleUpdateTask({...t, projectId: pid});
            });
            setSelectedTaskIds(new Set());
        }
    };

    // Context Menu Actions
    const handleContextMenuAction = (action: string) => {
        if (!contextMenu) return;
        const task = contextMenu.task;
        
        if (action === 'delete') handleSoftDelete(task.id);
        if (action === 'tomorrow') handleUpdateTask({ ...task, dueDate: 'tomorrow' });
        if (action === 'priority_1') handleUpdateTask({ ...task, priority: 1 });
        if (action === 'duplicate') {
            const dup = { ...task, id: Date.now().toString(), content: `${task.content} (Copy)` };
            saveTodoToBackend(dup).then(saved => {
                 if(saved) setTasks(prev => [...prev, saved]);
            });
        }
        setContextMenu(null);
    };

    const getViewTitle = () => {
        if (activeView === 'inbox') return 'Inbox';
        if (activeView === 'today') return 'Hôm Nay';
        if (activeView === 'upcoming') return 'Sắp Tới';
        if (activeView === 'completed') return 'Đã Hoàn Thành';
        if (activeView === 'trash') return 'Thùng Rác';
        if (activeView === 'kanban') return 'Bảng Kanban';
        if (activeView === 'calendar') return 'Lịch Biểu';
        if (activeView === 'gantt') return 'Biểu đồ Gantt';
        if (activeView.startsWith('tag:')) return `Thẻ: ${activeView.replace('tag:', '')}`;
        return projects.find(p => p.id === activeView)?.name || activeView;
    };
    
    // --- PROJECT MANAGEMENT ---
    
    // Updated: Handle both Add and Edit
    const handleSaveProject = (projectData: Omit<Project, 'id'>) => {
        if (editingProject) {
            // Edit existing
            setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...p, ...projectData } : p));
            setEditingProject(null);
        } else {
            // Add new
            const newProject: Project = {
                id: `proj_${Date.now()}`,
                ...projectData
            };
            setProjects(prev => [...prev, newProject]);
        }
        setShowProjectModal(false);
    };

    const handleDeleteProject = (id: string) => {
        if (window.confirm("Xóa dự án này? Các công việc sẽ KHÔNG bị xóa mà chuyển về Inbox.")) {
            // Move tasks to Inbox (update backend for all tasks in project)
            tasks.filter(t => t.projectId === id).forEach(t => {
                handleUpdateTask({ ...t, projectId: 'inbox' });
            });
            
            // Remove Project
            setProjects(prev => prev.filter(p => p.id !== id));
            
            // If viewing deleted project, go to inbox
            if (activeView === id) setActiveView('inbox');
        }
    };
    
    const openNewProjectModal = () => {
        setEditingProject(null);
        setShowProjectModal(true);
    };

    const openEditProjectModal = (project: Project) => {
        setEditingProject(project);
        setShowProjectModal(true);
    };
    
    // --- NEW: PROJECT VISUALIZER (Bridge to Graph) ---
    const handleVisualizeProject = () => {
        if (!onNavigateToFeature) return;
        
        // Only active if a project is selected
        const isProjectView = projects.some(p => p.id === activeView);
        if (!isProjectView) {
            alert("Vui lòng chọn một Dự án cụ thể để trực quan hóa.");
            return;
        }
        
        if (filteredTasks.length === 0) {
            alert("Dự án chưa có công việc nào để vẽ sơ đồ.");
            return;
        }

        // Serialize current tasks in this view
        const tasksPayload = JSON.stringify(filteredTasks.map(t => ({
            id: t.id,
            content: t.content,
            priority: t.priority
        })));

        onNavigateToFeature('bridge', {
            target: 'project_to_graph',
            content: tasksPayload
        });
    };

    return (
        <div className="flex h-screen w-full bg-[#121212] text-slate-200 font-display overflow-hidden relative" onClick={() => setContextMenu(null)}>
            
            {/* BACKGROUND REPLACEMENT */}
            <TodoOceanBackground />

            <PomodoroTimer />
            <QuickNoteWidget />
            <OnboardingTour />
            <OfflineIndicator />
            <BulkActionToolbar 
                selectedCount={selectedTaskIds.size} 
                onClearSelection={() => setSelectedTaskIds(new Set())}
                onDelete={handleBulkDelete}
                onComplete={handleBulkComplete}
                onMove={handleBulkMove}
            />
            
            {/* --- MODALS --- */}
            {showTemplates && <TemplateGallery onSelectTemplate={handleApplyTemplate} onClose={() => setShowTemplates(false)} />}
            {selectedTaskForModal && <TaskDetailModal task={selectedTaskForModal} onClose={() => setSelectedTaskForModal(null)} onUpdateTask={handleUpdateTask} />}
            {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={() => setContextMenu(null)} onAction={handleContextMenuAction} />}
            
            {/* AI Planning Modals */}
            {showPlanCreator && (
                <ExportPlan 
                    onClose={() => setShowPlanCreator(false)}
                    onPlanGenerated={(data) => {
                        setPendingPlanData(data);
                        setShowPlanCreator(false);
                    }}
                />
            )}
            
            {pendingPlanData && (
                <ImportPlan 
                    planData={pendingPlanData}
                    onCancel={() => setPendingPlanData(null)}
                    onConfirm={convertAndAddTasks}
                />
            )}
            
            {/* Project Modal - Handles both Add and Edit */}
            <ProjectManager 
                isOpen={showProjectModal} 
                onClose={() => setShowProjectModal(false)}
                onSave={handleSaveProject}
                projectToEdit={editingProject || undefined}
            />

            {showSettings && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-[fadeIn_0.2s]" onClick={() => setShowSettings(false)}>
                    <div className="bg-[#1e1e1e] border border-[#333] rounded-2xl w-full max-w-lg shadow-2xl p-6 relative space-y-6" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                        <h2 className="text-xl font-bold text-white">Cài đặt & Tiện ích</h2>
                        <CalendarIntegration />
                        <ExportImportTool tasks={tasks} onImport={(imported) => {
                             // Import involves saving to backend
                             imported.forEach(t => saveTodoToBackend(t).then(s => s && setTasks(prev => [...prev, s])));
                        }} />
                    </div>
                </div>
            )}

            <TodoSidebar 
                isOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                activeView={activeView}
                setActiveView={setActiveView}
                projects={projects}
                tasks={tasks} 
                completedCount={completedCount}
                onOpenTemplates={() => setShowTemplates(true)}
                onAddProject={openNewProjectModal} // Open new
                onEditProject={openEditProjectModal} // Open edit
                onDeleteProject={handleDeleteProject}
            />

            <div className="flex-1 flex flex-col h-full relative z-10 transition-all duration-300">
                <header className="h-16 flex items-center justify-between px-6 border-b border-[#333] bg-[#121212]/90 backdrop-blur-sm sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        {!isSidebarOpen && (
                            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                                <span className="material-symbols-outlined">menu</span>
                            </button>
                        )}
                        <h2 className="text-xl font-bold text-white capitalize animate-[fadeIn_0.3s] flex items-center gap-2">
                            {activeView === 'today' && <span className="text-green-400">📅</span>}
                            {activeView === 'inbox' && <span className="text-blue-400">📥</span>}
                            {activeView === 'trash' && <span className="text-red-500">delete</span>}
                            {/* Show icon for projects */}
                            {projects.find(p => p.id === activeView) && <span className={`material-symbols-outlined text-lg ${projects.find(p => p.id === activeView)?.color}`}>{projects.find(p => p.id === activeView)?.icon || 'folder'}</span>}
                            
                            {/* Show Tag Icon */}
                            {activeView.startsWith('tag:') && <span className="material-symbols-outlined text-lg text-pink-400">label</span>}
                            
                            {getViewTitle()}
                        </h2>
                        {/* Guide Trigger */}
                        <GuideTrigger guideKey="digest" />
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Project Visualizer Button (Only visible for Projects) */}
                        {projects.some(p => p.id === activeView) && (
                            <button 
                                onClick={handleVisualizeProject}
                                className="bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/40 px-3 py-1.5 rounded-lg text-xs font-bold border border-cyan-500/30 flex items-center gap-2 transition-all animate-pulse"
                                title="Chuyển đổi sang Graph/Gantt để quản lý phụ thuộc"
                            >
                                <span className="material-symbols-outlined text-sm">hub</span>
                                Visualizer
                            </button>
                        )}

                        {/* AI Plan Trigger */}
                        <button 
                            onClick={() => setShowPlanCreator(true)}
                            className="bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 px-3 py-1.5 rounded-lg text-xs font-bold border border-purple-500/30 flex items-center gap-2 transition-all"
                        >
                            <span className="material-symbols-outlined text-sm">psychology</span>
                            AI Planner
                        </button>

                        <div className="relative">
                            <SearchBar value={searchQuery} onChange={setSearchQuery} />
                            <button 
                                onClick={() => setShowFilterBuilder(!showFilterBuilder)}
                                className={`absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white ${activeFilters.length > 0 ? 'text-blue-400' : ''}`}
                            >
                                <span className="material-symbols-outlined text-lg">filter_list</span>
                            </button>
                            {showFilterBuilder && <FilterBuilder onApplyFilter={setActiveFilters} onClose={() => setShowFilterBuilder(false)} />}
                        </div>
                        
                        <div className="w-px h-6 bg-[#333]"></div>
                        
                        <button onClick={() => setShowSettings(true)} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                            <span className="material-symbols-outlined">settings</span>
                        </button>
                        
                        <FeatureWindowControls onClose={onBack} />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:px-40 scrollbar-thin scrollbar-thumb-[#333]">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <span className="material-symbols-outlined animate-spin text-4xl text-slate-500">sync</span>
                        </div>
                    ) : (
                    <div className="max-w-4xl mx-auto pb-20 animate-[slideInUp_0.3s_ease-out] h-full flex flex-col">
                        
                        {(activeView === 'today' || activeView === 'completed') && (
                            <ProductivityStats tasks={tasks.filter(t => !t.isDeleted)} />
                        )}

                        {activeView === 'calendar' ? (
                            <CalendarView 
                                tasks={filteredTasks} 
                                onTaskClick={setSelectedTaskForModal}
                                onAdd={(date, title) => handleAddTask(title || 'Công việc mới', '', 4, date, undefined)} 
                            />
                        ) : activeView === 'kanban' ? (
                            <KanbanBoard 
                                tasks={filteredTasks} 
                                onTaskClick={setSelectedTaskForModal} 
                                onUpdateStatus={handleUpdateStatus} 
                                onAdd={(status, title) => handleAddTask(title || 'Công việc mới', '', 4, null, undefined, status as any)}
                            />
                        ) : activeView === 'gantt' ? (
                            <GanttChart tasks={filteredTasks} />
                        ) : activeView === 'trash' ? (
                            <TrashBin deletedTasks={filteredTasks} onRestore={handleRestore} onPermanentDelete={handlePermanentDelete} />
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-4">
                                    <SortControl sortOption={sortOption} onSortChange={setSortOption} />
                                    <span className="text-xs text-slate-500 font-bold bg-[#1e1e1e] px-2 py-1 rounded border border-[#333]">{filteredTasks.length} tasks</span>
                                </div>

                                <div className="space-y-1 min-h-[200px]">
                                    {filteredTasks.length === 0 && !isAdding ? (
                                        <div className="flex flex-col items-center justify-center py-24 text-center opacity-60">
                                            <div className="w-32 h-32 mb-4 bg-gradient-to-tr from-slate-800 to-transparent rounded-full flex items-center justify-center">
                                                <span className="material-symbols-outlined text-6xl text-slate-600">done_all</span>
                                            </div>
                                            <p className="text-slate-300 font-bold text-lg">Trống trơn!</p>
                                            <p className="text-slate-500 text-sm mt-1">Không tìm thấy nhiệm vụ nào.</p>
                                        </div>
                                    ) : (
                                        filteredTasks.map(task => (
                                            <TodoTaskItem 
                                                key={task.id}
                                                task={task}
                                                projects={projects}
                                                toggleTask={toggleTask}
                                                deleteTask={handleSoftDelete}
                                                onClick={setSelectedTaskForModal}
                                                isSelected={selectedTaskIds.has(task.id)}
                                                onSelect={toggleSelection}
                                                onContextMenu={(e, t) => {
                                                    e.preventDefault();
                                                    setContextMenu({ x: e.clientX, y: e.clientY, task: t });
                                                }}
                                            />
                                        ))
                                    )}
                                </div>

                                <TodoAddForm 
                                    isAdding={isAdding} 
                                    setIsAdding={setIsAdding} 
                                    onAdd={(content, desc, priority, date, projId) => handleAddTask(content, desc, priority, date, projId)} 
                                    initialContent={prefilledContent} 
                                    initialDescription={prefilledDesc}
                                    initialPriority={prefilledPriority}
                                    projects={projects} // Pass projects to form
                                    activeProjectId={activeView.startsWith('tag:') ? undefined : activeView} // Don't pass tag as project ID
                                />
                            </>
                        )}
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
};
