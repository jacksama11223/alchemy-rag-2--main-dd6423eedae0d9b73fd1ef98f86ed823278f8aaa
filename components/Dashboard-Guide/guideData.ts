export const ECOSYSTEM_CONNECTIONS: Record<string, { target: string; text: string; color: string }[]> = {
  'alchemy': [
    { target: 'knowledge-graph', text: 'Sau khi tổng hợp, xem các khái niệm liên kết trên Đồ thị.', color: '#8b5cf6' },
    { target: 'media', text: 'Lưu trữ kết quả chưng cất vào Hệ thống Ghi chú.', color: '#8b5cf6' }
  ],
  'knowledge-graph': [
    { target: 'tutor', text: 'Hỏi AI về các khái niệm trên Đồ thị.', color: '#3b82f6' },
    { target: 'digest', text: 'Lên kế hoạch học tập các node còn yếu.', color: '#3b82f6' }
  ],
  'tutor': [
    { target: 'draw', text: 'Dùng AI để gợi ý ý tưởng, sau đó vẽ Mindmap.', color: '#22c55e' },
    { target: 'media', text: 'Lưu lại các cuộc hội thoại quan trọng.', color: '#22c55e' }
  ],
  'draw': [
    { target: 'media', text: 'Đính kèm bản vẽ vào ghi chú.', color: '#f59e0b' },
    { target: 'knowledge-graph', text: 'Chuyển đổi Mindmap thành các Node kiến thức.', color: '#f59e0b' }
  ],
  'media': [
    { target: 'alchemy', text: 'Đưa ghi chú thô vào AI để chưng cất.', color: '#6366f1' },
    { target: 'drive', text: 'Quản lý file đính kèm của ghi chú.', color: '#6366f1' }
  ],
  'digest': [
    { target: 'community', text: 'Chia sẻ tiến độ học tập với cộng đồng.', color: '#14b8a6' },
    { target: 'tutor', text: 'Nhờ AI giải thích các task khó.', color: '#14b8a6' }
  ],
  'drive': [
    { target: 'media', text: 'Chèn tài liệu vào ghi chú.', color: '#0ea5e9' },
    { target: 'alchemy', text: 'Phân tích tài liệu PDF/Word bằng AI.', color: '#0ea5e9' }
  ],
  'community': [
    { target: 'knowledge-graph', text: 'Nhập khẩu các Node kiến thức từ người khác.', color: '#ec4899' },
    { target: 'digest', text: 'Cùng nhau thực hiện mục tiêu chung.', color: '#ec4899' }
  ]
};
