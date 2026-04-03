export interface GuideSection {
    title: string;
    content: string;
}

export interface GuideInfo {
    id: string;
    title: string;
    description: string;
    painPoint: string;
    sections: GuideSection[];
    demoImage: string;
}

export const GUIDE_DATA: Record<string, GuideInfo> = {
    'url': {
        id: 'url',
        title: 'Trích Xuất URL (Link bài viết)',
        description: 'Biến một bài báo dài ngoằng thành tóm tắt và flashcard trong 3 giây.',
        painPoint: 'Thầy cô gửi link bài đọc quá dài, đọc chữ nào trôi chữ đó, không biết ý chính nằm ở đâu?',
        sections: [
            { title: 'Mục đích sử dụng', content: 'Dùng để quét các bài báo, bài blog, trang Wikipedia hoặc tài liệu văn bản trên web.' },
            { title: 'Cách dùng hiệu quả nhất', content: '1. Copy đường link (URL) của bài viết.\n2. Dán vào ô trống.\n3. Bấm "Trích xuất". Hệ thống sẽ tự động loại bỏ quảng cáo, menu thừa và chỉ lấy nội dung chính để bạn học.' }
        ],
        demoImage: 'https://picsum.photos/seed/urlguide/600/300'
    },
    'youtube': {
        id: 'youtube',
        title: 'Video YouTube',
        description: 'Học từ video mà không cần cày cuốc hàng giờ đồng hồ.',
        painPoint: 'Xem video bài giảng 2 tiếng buồn ngủ quá, muốn có ngay tóm tắt và câu hỏi ôn tập để học cho lẹ?',
        sections: [
            { title: 'Mục đích sử dụng', content: 'Dùng cho các video bài giảng, TED Talks, CrashCourse, hoặc video hướng dẫn trên YouTube có phụ đề (CC).' },
            { title: 'Cách dùng hiệu quả nhất', content: '1. Copy link video YouTube.\n2. Dán vào hệ thống.\n3. Hệ thống sẽ đọc phụ đề (transcript) của video và tóm tắt lại toàn bộ nội dung quan trọng nhất.' }
        ],
        demoImage: 'https://picsum.photos/seed/ytguide/600/300'
    },
    'ocr': {
        id: 'ocr',
        title: 'Quét Ảnh (OCR)',
        description: 'Chuyển chữ trong ảnh thành văn bản có thể copy và học được.',
        painPoint: 'Chụp lén slide trên bảng hoặc chụp trang sách nhưng lười gõ lại từng chữ?',
        sections: [
            { title: 'Mục đích sử dụng', content: 'Dùng cho ảnh chụp màn hình, ảnh chụp trang sách, tài liệu in, hoặc ghi chép tay (nếu chữ rõ ràng).' },
            { title: 'Cách dùng hiệu quả nhất', content: '1. Tải ảnh lên hoặc dán (Ctrl+V) ảnh trực tiếp.\n2. Hệ thống sẽ nhận diện chữ viết.\n3. Mẹo: Bạn có thể dùng tính năng "Ghi chú (Ctrl+N)" để bôi đậm các vùng quan trọng ngay trên ảnh gốc!' }
        ],
        demoImage: 'https://picsum.photos/seed/ocrguide/600/300'
    },
    'image_analyzer': {
        id: 'image_analyzer',
        title: 'Phân Tích Ảnh Chuyên Sâu',
        description: 'Nhờ AI "nhìn" và giải thích các biểu đồ, sơ đồ phức tạp.',
        painPoint: 'Gặp một cái biểu đồ sinh học hay đồ thị toán học loằng ngoằng, đọc chữ (OCR) thì không hiểu được ý nghĩa?',
        sections: [
            { title: 'Mục đích sử dụng', content: 'Dùng cho sơ đồ tư duy (mindmap), biểu đồ, đồ thị, hình học, hoặc các hình ảnh cần sự suy luận logic chứ không chỉ là đọc chữ.' },
            { title: 'Cách dùng hiệu quả nhất', content: '1. Tải ảnh sơ đồ lên.\n2. Đặt câu hỏi cụ thể cho AI (vd: "Hãy giải thích vòng tuần hoàn nước trong hình này").\n3. AI sẽ phân tích hình ảnh và trả lời chi tiết.' }
        ],
        demoImage: 'https://picsum.photos/seed/imageguide/600/300'
    },
    'audio': {
        id: 'audio',
        title: 'Ghi Âm & Phân Tích Giọng Nói',
        description: 'Ghi âm bài giảng trên lớp và biến nó thành tài liệu ôn thi.',
        painPoint: 'Ngồi nghe thầy cô giảng trên lớp chép bài không kịp, về nhà nghe lại file ghi âm 2 tiếng thì quá nản?',
        sections: [
            { title: 'Mục đích sử dụng', content: 'Dùng để ghi âm trực tiếp bài giảng, cuộc họp, hoặc tải lên file âm thanh (mp3, wav) có sẵn.' },
            { title: 'Cách dùng hiệu quả nhất', content: '1. Bấm nút Micro để bắt đầu ghi âm trực tiếp, hoặc tải file lên.\n2. Hệ thống sẽ chuyển giọng nói thành văn bản (Transcript) và tự động tóm tắt lại các ý chính mà thầy cô đã nhấn mạnh.' }
        ],
        demoImage: 'https://picsum.photos/seed/audioguide/600/300'
    },
    'note': {
        id: 'note',
        title: 'Ghi Chú Của Bạn (NoteLab)',
        description: 'Biến ghi chép cá nhân thành bộ câu hỏi ôn tập.',
        painPoint: 'Đã cất công viết ghi chú rất đẹp trong app, nhưng lúc thi lại không biết ôn từ đâu?',
        sections: [
            { title: 'Mục đích sử dụng', content: 'Dùng để chọn các trang ghi chú bạn đã tạo trong phần NoteLab của hệ thống.' },
            { title: 'Cách dùng hiệu quả nhất', content: '1. Chọn các ghi chú quan trọng.\n2. Đưa vào "Lò luyện" (Mixer) để AI tự động tạo Flashcard và Quiz từ chính những gì bạn đã viết.' }
        ],
        demoImage: 'https://picsum.photos/seed/noteguide/600/300'
    },
    'drive': {
        id: 'drive',
        title: 'Google Drive',
        description: 'Kéo tài liệu từ Drive vào học ngay lập tức.',
        painPoint: 'Tài liệu học tập nằm rải rác trên Google Drive, mỗi lần học phải tải về máy rất mất công?',
        sections: [
            { title: 'Mục đích sử dụng', content: 'Kết nối trực tiếp với Google Drive của bạn để lấy file Docs, PDF, Slides.' },
            { title: 'Cách dùng hiệu quả nhất', content: '1. Đăng nhập Google Drive.\n2. Chọn file cần học.\n3. Hệ thống sẽ đọc trực tiếp nội dung file mà không cần bạn phải tải về máy.' }
        ],
        demoImage: 'https://picsum.photos/seed/driveguide/600/300'
    },
    'file': {
        id: 'file',
        title: 'Tải File (PDF, Word)',
        description: 'Xử lý các tài liệu học tập định dạng PDF, Word, TXT.',
        painPoint: 'Thầy cô gửi file PDF đề cương ôn tập dài 50 trang, làm sao để học nhanh?',
        sections: [
            { title: 'Mục đích sử dụng', content: 'Dùng cho các file tài liệu truyền thống lưu trên máy tính của bạn.' },
            { title: 'Cách dùng hiệu quả nhất', content: '1. Kéo thả file PDF/Word vào ô trống.\n2. Hệ thống sẽ trích xuất toàn bộ chữ trong file để bạn có thể tạo Flashcard hoặc hỏi đáp với AI.' }
        ],
        demoImage: 'https://picsum.photos/seed/fileguide/600/300'
    },
    'text': {
        id: 'text',
        title: 'Văn Bản Tự Do',
        description: 'Copy và paste nhanh gọn lẹ.',
        painPoint: 'Chỉ muốn học một đoạn văn ngắn vừa thấy trên mạng mà không muốn lưu cả trang web?',
        sections: [
            { title: 'Mục đích sử dụng', content: 'Dùng khi bạn muốn dán trực tiếp một đoạn văn bản ngắn, một đoạn code, hoặc một câu hỏi cụ thể.' },
            { title: 'Cách dùng hiệu quả nhất', content: '1. Copy đoạn văn (Ctrl+C).\n2. Dán vào ô trống (Ctrl+V).\n3. Bấm xử lý ngay lập tức.' }
        ],
        demoImage: 'https://picsum.photos/seed/textguide/600/300'
    },
    'mixer': {
        id: 'mixer',
        title: 'Kho Dữ Liệu Tạm (Mixer)',
        description: 'Trái tim của Giả kim thuật - Nơi hội tụ mọi dữ liệu.',
        painPoint: 'Đã thu thập dữ liệu từ link, từ ảnh, từ youtube rồi... giờ làm sao để gộp chúng lại học chung một lúc?',
        sections: [
            { title: 'Mục đích sử dụng', content: 'Đây là "cái vạc" chứa TẤT CẢ những dữ liệu bạn vừa thu thập từ các nguồn trên. Nó giúp bạn quản lý và xem lại dữ liệu gốc.' },
            { title: 'Cách dùng hiệu quả nhất', content: '1. Sau khi thu thập dữ liệu từ các nguồn, hãy vào đây kiểm tra lại.\n2. Bạn có thể xem lại ảnh gốc, nghe lại ghi âm, đọc lại văn bản.\n3. Chọn các dữ liệu cần thiết và chuyển sang bước "Phương Pháp Học" để AI tạo bài tập cho bạn.' }
        ],
        demoImage: 'https://picsum.photos/seed/mixerguide/600/300'
    }
};
