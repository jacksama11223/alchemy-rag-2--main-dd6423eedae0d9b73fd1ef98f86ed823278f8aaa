
import { AdminUserFlow } from '../types';

export const USER_FLOWS_PART_1: AdminUserFlow[] = [
    {
        id: 'flow_01',
        title: 'The Alchemist First Step (Tạo bài học đầu tiên)',
        category: 'Onboarding',
        description: 'Kiểm tra quy trình từ Dashboard đến khi tạo ra Node đầu tiên bằng Alchemy.',
        steps: [
            { 
                id: 's1', 
                label: 'Dashboard Check', 
                icon: 'dashboard',
                description: 'Kiểm tra xem User có đang ở Dashboard và tải đúng Stats không.',
                targetView: 'dashboard',
                expectedStateCheck: (state) => `Nodes: ${state.userNodes.length}, View: ${state.view}`
            },
            { 
                id: 's2', 
                label: 'Enter Alchemy', 
                icon: 'science',
                description: 'Điều hướng vào Alchemy Lab.',
                targetView: 'alchemy',
                expectedStateCheck: (state) => `Intent: ${state.intent ? state.intent.type : 'None'}`
            },
            { 
                id: 's3', 
                label: 'Generate Content', 
                icon: 'auto_awesome',
                description: 'Mô phỏng việc tạo nội dung (Admin cần thao tác tay hoặc auto-fill).',
                targetView: 'alchemy' 
            },
            { 
                id: 's4', 
                label: 'Verify Graph', 
                icon: 'hub',
                description: 'Quay lại Graph để kiểm tra Node mới xuất hiện.',
                targetView: 'explore-graph',
                expectedStateCheck: (state) => `Nodes: ${state.userNodes.length} (Should be +1)`
            }
        ]
    },
    {
        id: 'flow_02',
        title: 'Morning Review Loop (Ôn tập buổi sáng)',
        category: 'Learning',
        description: 'Quy trình người dùng vào ôn tập các thẻ bài đến hạn.',
        steps: [
            { 
                id: 's1', 
                label: 'Check Due Stats', 
                icon: 'analytics',
                description: 'Dashboard phải hiển thị số lượng thẻ cần ôn (Due > 0).',
                targetView: 'dashboard',
                expectedStateCheck: (state) => `Due Stats: ${state.stats?.due || 0}`
            },
            { 
                id: 's2', 
                label: 'Open Graph Explorer', 
                icon: 'travel_explore',
                description: 'Vào màn hình khám phá để tìm thẻ.',
                targetView: 'explore-graph'
            },
            { 
                id: 's3', 
                label: 'Start Learning Session', 
                icon: 'school',
                description: 'Mở modal học tập (Learning Modal).',
                targetView: 'explore-graph', // Modal is an overlay on graph
                expectedStateCheck: (state) => `Selected Node: ${state.selectedNode ? state.selectedNode.title : 'None'}`
            }
        ]
    },
    {
        id: 'flow_03',
        title: 'Social Climber (Leo Rank)',
        category: 'Social',
        description: 'Kiểm tra tính năng xã hội và bảng xếp hạng.',
        steps: [
            { id: 's1', label: 'View Dashboard', icon: 'dashboard', description: 'Bắt đầu từ trang chủ.', targetView: 'dashboard' },
            { id: 's2', label: 'Enter Community', icon: 'diversity_3', description: 'Vào Hub cộng đồng.', targetView: 'community' },
            { 
                id: 's3', 
                label: 'Check Rank Profile', 
                icon: 'military_tech',
                description: 'Kiểm tra dữ liệu Rank Profile có load đúng không.',
                targetView: 'community',
                expectedStateCheck: (state) => `Rank: ${state.gamification?.rankProfile?.tier || 'Unknown'}`
            },
            { id: 's4', label: 'Enter Battle Arena', icon: 'swords', description: 'Chuyển sang chế độ đấu đối kháng.', targetView: 'battle' }
        ]
    },
    {
        id: 'flow_04',
        title: 'The Architect (Quy hoạch kiến thức)',
        category: 'Creation',
        description: 'Sắp xếp lại Graph và tạo liên kết.',
        steps: [
            { id: 's1', label: 'Graph View', icon: 'hub', description: 'Mở chế độ xem toàn cảnh.', targetView: 'explore-graph' },
            { id: 's2', label: 'Filter Topic', icon: 'filter_list', description: 'Lọc theo chủ đề cụ thể.', targetView: 'explore-graph' },
            { id: 's3', label: 'Merge/Link', icon: 'merge', description: 'Thao tác nối các node (Admin thực hiện thủ công để test UI).', targetView: 'explore-graph' }
        ]
    },
    {
        id: 'flow_05',
        title: 'Deep Dive Tutor (Học sâu)',
        category: 'Learning',
        description: 'Sử dụng AI Tutor để giải thích một concept.',
        steps: [
            { id: 's1', label: 'Select Node', icon: 'touch_app', description: 'Chọn một node bất kỳ từ Graph.', targetView: 'explore-graph' },
            { id: 's2', label: 'Ask Tutor', icon: 'psychology_alt', description: 'Chuyển sang giao diện Chat với Context của Node đó.', targetView: 'tutor', expectedStateCheck: (state) => `Context: ${state.tutorContextNode ? state.tutorContextNode.title : 'None'}` },
            { id: 's3', label: 'Save to Note', icon: 'save', description: 'Lưu đoạn chat thành ghi chú.', targetView: 'media' }
        ]
    }
];

export const USER_FLOWS_PART_2: AdminUserFlow[] = [
    {
        id: 'flow_06',
        title: 'The Note Taker (Ghi chú thông minh)',
        category: 'Creation',
        description: 'Kiểm tra luồng tạo ghi chú và tích hợp AI.',
        steps: [
            { id: 's1', label: 'Dashboard', icon: 'dashboard', description: 'Bắt đầu.', targetView: 'dashboard' },
            { id: 's2', label: 'Open NoteLab', icon: 'edit_note', description: 'Vào phòng ghi chú.', targetView: 'media' },
            { id: 's3', label: 'AI Deep Think', icon: 'psychology', description: 'Viết nội dung và kích hoạt AI Analyze.', targetView: 'media' },
            { id: 's4', label: 'Check Intent', icon: 'fact_check', description: 'Kiểm tra xem Intent có được xóa sau khi xử lý không.', targetView: 'media', expectedStateCheck: (state) => `Intent: ${state.intent ? 'Active' : 'Cleared'}` }
        ]
    },
    {
        id: 'flow_07',
        title: 'The Taskmaster (Quản lý công việc)',
        category: 'System',
        description: 'Quy trình thêm và quản lý Task GTD.',
        steps: [
            { id: 's1', label: 'Enter Todo', icon: 'check_circle', description: 'Vào ThingsToDo.', targetView: 'digest' },
            { id: 's2', label: 'Create Task', icon: 'add_task', description: 'Thêm một task mới.', targetView: 'digest', expectedStateCheck: (state) => `Tasks: ${state.tasks ? state.tasks.length : 0}` },
            { id: 's3', label: 'Switch View', icon: 'view_kanban', description: 'Chuyển sang Kanban hoặc Calendar.', targetView: 'digest' },
            { id: 's4', label: 'Check Completion', icon: 'done_all', description: 'Hoàn thành 1 task và kiểm tra XP.', targetView: 'digest' }
        ]
    },
    {
        id: 'flow_08',
        title: 'The Librarian (Quản lý tài liệu)',
        category: 'System',
        description: 'Tải lên và tổ chức file trong Drive.',
        steps: [
            { id: 's1', label: 'Open Drive', icon: 'folder_open', description: 'Vào Drive Storage.', targetView: 'drive' },
            { id: 's2', label: 'Upload/Create', icon: 'cloud_upload', description: 'Tải lên file hoặc tạo thư mục.', targetView: 'drive' },
            { id: 's3', label: 'Send to Alchemy', icon: 'send', description: 'Chọn file và gửi sang Alchemy để xử lý.', targetView: 'alchemy', expectedStateCheck: (state) => `Intent Source: ${state.intent?.type === 'create' ? 'Received' : 'Empty'}` }
        ]
    },
    {
        id: 'flow_09',
        title: 'The Visualizer (Vẽ và tư duy)',
        category: 'Creation',
        description: 'Sử dụng DrawEverything để phác thảo.',
        steps: [
            { id: 's1', label: 'Dashboard', icon: 'dashboard', description: 'Bắt đầu.', targetView: 'dashboard' },
            { id: 's2', label: 'Open Canvas', icon: 'brush', description: 'Vào DrawEverything.', targetView: 'draw' },
            { id: 's3', label: 'Draw & Save', icon: 'save', description: 'Vẽ hình và lưu lại.', targetView: 'draw' },
            { id: 's4', label: 'Export to Graph', icon: 'share', description: 'Xuất bản vẽ thành Node.', targetView: 'explore-graph' }
        ]
    },
    {
        id: 'flow_10',
        title: 'The Bridge Walker (Liên kết đa chiều)',
        category: 'System',
        description: 'Kiểm tra tính năng Neural Bridge giữa các module.',
        steps: [
            { id: 's1', label: 'Start at Chat', icon: 'chat', description: 'Bắt đầu ở Tutor.', targetView: 'tutor' },
            { id: 's2', label: 'Bridge to Todo', icon: 'link', description: 'Tạo Task từ Chat (Sử dụng thanh công cụ).', targetView: 'bridge' },
            { id: 's3', label: 'Confirm Task', icon: 'check', description: 'Xác nhận tạo Task trong Todo.', targetView: 'digest', expectedStateCheck: (state) => `Last View: ${state.view}` }
        ]
    }
];

export const USER_FLOWS_PART_3: AdminUserFlow[] = [
    {
        id: 'flow_11',
        title: 'The Gladiator (Đấu trường 1v1)',
        category: 'Social',
        description: 'Kiểm tra quy trình tham gia đấu hạng.',
        steps: [
            { id: 's1', label: 'Community Hub', icon: 'diversity_3', description: 'Vào khu vực cộng đồng.', targetView: 'community' },
            { id: 's2', label: 'Enter Arena', icon: 'swords', description: 'Nhấn "Vào Phòng Đấu".', targetView: 'battle' },
            { id: 's3', label: 'Setup Match', icon: 'settings', description: 'Chọn bộ thẻ và thời gian.', targetView: 'battle' },
            { id: 's4', label: 'Fight', icon: 'flash_on', description: 'Bắt đầu trận đấu (Mô phỏng).', targetView: 'battle' }
        ]
    },
    {
        id: 'flow_12',
        title: 'The Guild Master (Phòng chat)',
        category: 'Social',
        description: 'Kiểm tra tính năng AIR Room và Chat.',
        steps: [
            { id: 's1', label: 'Community Hub', icon: 'diversity_3', description: 'Vào Hub.', targetView: 'community' },
            { id: 's2', label: 'Enter Discord', icon: 'hub', description: 'Vào AIR Room (Discord View).', targetView: 'community' },
            { id: 's3', label: 'Check Channels', icon: 'chat', description: 'Kiểm tra danh sách kênh chat.', targetView: 'community' }
        ]
    },
    {
        id: 'flow_13',
        title: 'The Hunter (Săn thành tựu)',
        category: 'System',
        description: 'Kiểm tra thư viện thành tựu và gợi ý AI.',
        steps: [
            { id: 's1', label: 'Dashboard', icon: 'dashboard', description: 'Về trang chủ.', targetView: 'dashboard' },
            { id: 's2', label: 'Achievement Hall', icon: 'military_tech', description: 'Vào Đền thờ thành tựu.', targetView: 'achievements' },
            { id: 's3', label: 'Check AI Insight', icon: 'psychology', description: 'Chờ AI phân tích hành vi và đề xuất thành tựu ẩn.', targetView: 'achievements' }
        ]
    },
    {
        id: 'flow_14',
        title: 'The Daily Grinder (Nhiệm vụ ngày)',
        category: 'System',
        description: 'Kiểm tra và nhận thưởng nhiệm vụ.',
        steps: [
            { id: 's1', label: 'Graph View', icon: 'hub', description: 'Vào Sơ đồ tri thức.', targetView: 'explore-graph' },
            { id: 's2', label: 'Open Log', icon: 'assignment', description: 'Mở Quest Log (trên thanh công cụ).', targetView: 'explore-graph' },
            { id: 's3', label: 'Claim Reward', icon: 'redeem', description: 'Nhận thưởng một nhiệm vụ hoàn thành.', targetView: 'explore-graph', expectedStateCheck: (state) => `XP: ${state.gamification?.xp}` }
        ]
    },
    {
        id: 'flow_15',
        title: 'The Rank Climber (Bảng xếp hạng)',
        category: 'Social',
        description: 'Kiểm tra hiển thị Rank Profile.',
        steps: [
            { id: 's1', label: 'Community Hub', icon: 'diversity_3', description: 'Vào Hub.', targetView: 'community' },
            { id: 's2', label: 'Check Stats', icon: 'analytics', description: 'Kiểm tra thông số LP và Tier.', targetView: 'community', expectedStateCheck: (state) => `LP: ${state.gamification?.rankProfile?.lp || 0}` },
            { id: 's3', label: 'Leaderboard', icon: 'format_list_numbered', description: 'Kiểm tra danh sách top 100.', targetView: 'community' }
        ]
    }
];

export const USER_FLOWS_PART_4: AdminUserFlow[] = [
    {
        id: 'flow_16',
        title: 'The Scholar (Hướng dẫn sử dụng)',
        category: 'System',
        description: 'Kiểm tra hệ thống hướng dẫn tương tác (User Guide).',
        steps: [
            { id: 's1', label: 'Dashboard', icon: 'dashboard', description: 'Bắt đầu.', targetView: 'dashboard' },
            { id: 's2', label: 'Open Guide', icon: 'local_library', description: 'Truy cập Học Viện (User Guide).', targetView: 'user-guide' },
            { id: 's3', label: 'Select Module', icon: 'touch_app', description: 'Chọn một module hướng dẫn bất kỳ (VD: Alchemy).', targetView: 'user-guide' },
            { id: 's4', label: 'Tour Test', icon: 'play_circle', description: 'Chạy thử Interactive Tour.', targetView: 'user-guide' }
        ]
    },
    {
        id: 'flow_17',
        title: 'The Identity Manager (Tài khoản)',
        category: 'System',
        description: 'Kiểm tra trang quản lý tài khoản và cài đặt.',
        steps: [
            { id: 's1', label: 'Dashboard', icon: 'dashboard', description: 'Bắt đầu.', targetView: 'dashboard' },
            { id: 's2', label: 'Open Account', icon: 'person', description: 'Vào trang Tài khoản.', targetView: 'account' },
            { id: 's3', label: 'Check Data', icon: 'badge', description: 'Kiểm tra thông tin cá nhân và ID.', targetView: 'account' }
        ]
    },
    {
        id: 'flow_18',
        title: 'The Knowledge Architect (Graph Control)',
        category: 'Creation',
        description: 'Sử dụng bảng điều khiển thống nhất (Unified Control Panel) trong Graph.',
        steps: [
            { id: 's1', label: 'Enter Graph', icon: 'hub', description: 'Vào Sơ đồ tri thức.', targetView: 'explore-graph' },
            { id: 's2', label: 'Open Omni Menu', icon: 'widgets', description: 'Mở menu công cụ (Dock dưới).', targetView: 'explore-graph' },
            { id: 's3', label: 'Data Center', icon: 'analytics', description: 'Mở Data Management Panel.', targetView: 'explore-graph' },
            { id: 's4', label: 'Coding Studio', icon: 'code', description: 'Chuyển sang tab Coding Studio.', targetView: 'explore-graph' }
        ]
    },
    {
        id: 'flow_19',
        title: 'The System Keymaster (API Key)',
        category: 'System',
        description: 'Kiểm tra tính năng quản lý API Key.',
        steps: [
            { id: 's1', label: 'Dashboard', icon: 'dashboard', description: 'Bắt đầu.', targetView: 'dashboard' },
            { id: 's2', label: 'Scroll Down', icon: 'arrow_downward', description: 'Cuộn xuống phần API Key Manager.', targetView: 'dashboard' },
            { id: 's3', label: 'Toggle Visibility', icon: 'visibility', description: 'Mở panel nhập key.', targetView: 'dashboard' }
        ]
    },
    {
        id: 'flow_20',
        title: 'The Neural Bridge (Cross-App)',
        category: 'System',
        description: 'Kiểm tra tính năng Neural Bridge chuyển dữ liệu giữa các App.',
        steps: [
            { id: 's1', label: 'Start Tutor', icon: 'school', description: 'Bắt đầu tại Gia sư AI.', targetView: 'tutor' },
            { id: 's2', label: 'Send Message', icon: 'chat', description: 'Gửi tin nhắn mẫu.', targetView: 'tutor' },
            { id: 's3', label: 'Bridge Trigger', icon: 'link', description: 'Hover tin nhắn và chọn công cụ Bridge (VD: Alchemy).', targetView: 'bridge' },
            { id: 's4', label: 'Verify Destination', icon: 'check_circle', description: 'Kiểm tra chuyển hướng đúng đích.', targetView: 'alchemy', expectedStateCheck: (state) => `View: ${state.view}` }
        ]
    }
];
