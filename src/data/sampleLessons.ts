export interface SampleLesson {
  id: string;
  title: string;
  subject: string;
  grade: string;
  sections: { title: string; content: string }[];
}

export const sampleLessons: SampleLesson[] = [
  {
    id: "sample-toan10",
    title: "Sự biến thiên và Đồ thị Hàm số Bậc hai (Toán 10 - Chuẩn CV 5512)",
    subject: "Toán học",
    grade: "Lớp 10",
    sections: [
      {
        title: "I. MỤC TIÊU BÀI HỌC (CV 5512/BGDĐT-GDTrH)",
        content: `<b>1. Kiến thức:</b> Học sinh hiểu được khái niệm hàm số bậc hai y = ax² + bx + c (a ≠ 0), xác định được tọa độ đỉnh, trục đối xứng.<br>
                  <b>2. Năng lực:</b> Lập được bảng biến thiên và vẽ được đồ thị hàm số bậc hai.<br>
                  <b>3. Phẩm chất:</b> Trung thực, chăm chỉ, có tinh thần hợp tác nhóm.`
      },
      {
        title: "II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU",
        content: `1. Giáo viên: Sách giáo khoa, bảng phụ, thước kẻ, phấn màu.<br>
                  2. Học sinh: Sách giáo khoa, vở ghi, giấy nháp.`
      },
      {
        title: "III. TIẾN TRÌNH DẠY HỌC (4 HOẠT ĐỘNG CHUẨN CV 5512)",
        content: `<b>Hoạt động 1: Mở đầu (Khởi động)</b><br>
                  - GV giao nhiệm vụ: Cho bài toán tìm quỹ đạo bay của quả bóng.<br>
                  - HS suy nghĩ, trả lời nhận xét về hình dạng đường bay.<br><br>
                  <b>Hoạt động 2: Hình thành kiến thức mới</b><br>
                  - GV trình bày công thức xác định đỉnh I(-b/2a; -Δ/4a).<br>
                  - HS ghi chép công thức và làm ví dụ 1 trong SGK.<br><br>
                  <b>Hoạt động 3: Luyện tập</b><br>
                  - GV cho 3 bài tập vẽ đồ thị hàm số y = x² - 4x + 3.<br>
                  - HS lên bảng làm bài, GV sửa lỗi.<br><br>
                  <b>Hoạt động 4: Vận dụng</b><br>
                  - GV giao bài tập thực tế tính chiều cao cổng Parabol tích hợp toán thực tiễn.`
      }
    ]
  },
  {
    id: "sample-van10",
    title: "Văn bản Bình Ngô Đại Cáo - Nguyễn Trãi (Ngữ văn 10)",
    subject: "Ngữ văn",
    grade: "Lớp 10",
    sections: [
      {
        title: "I. MỤC TIÊU BÀI HỌC",
        content: `<b>1. Về kiến thức:</b> Nắm được hoàn cảnh sáng tác, tư tưởng nhân nghĩa và giá trị nghệ thuật của Bình Ngô đại cáo.<br>
                  <b>2. Về năng lực:</b> Phân tích được tư tưởng nhân nghĩa của Nguyễn Trãi, rèn luyện kỹ năng đọc hiểu văn bản nghị luận cổ.<br>
                  <b>3. Về phẩm chất:</b> Bồi dưỡng lòng yêu nước, tự hào dân tộc và ý thức trách nhiệm công dân.`
      },
      {
        title: "II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU",
        content: `1. Giáo viên: SGK Ngữ văn 10, máy tính, máy chiếu, tranh ảnh tư liệu Nguyễn Trãi.<br>
                  2. Học sinh: SGK, vở soạn bài.`
      },
      {
        title: "III. TIẾN TRÌNH DẠY HỌC",
        content: `<b>Hoạt động 1: Mở đầu (Khởi động)</b><br>
                  - GV chiếu video clip ngắn về cuộc khởi nghĩa Lam Sơn.<br>
                  - HS xem và nêu cảm nhận ban đầu về khí thế anh hùng của dân tộc.<br><br>
                  <b>Hoạt động 2: Hình thành kiến thức mới</b><br>
                  - Đọc - Tìm hiểu tác giả Nguyễn Trãi và hoàn cảnh ra đời tác phẩm.<br>
                  - Đọc - Tìm hiểu chi tiết Đoạn 1: Cốt lõi tư tưởng nhân nghĩa.<br><br>
                  <b>Hoạt động 3: Luyện tập</b><br>
                  - HS thảo luận nhóm phân tích sự phát triển tư tưởng nhân nghĩa so với thời Lý - Trần.<br><br>
                  <b>Hoạt động 4: Vận dụng</b><br>
                  - Viết đoạn văn ngắn thể hiện suy nghĩ về trách nhiệm giữ gìn hòa bình ngày nay.`
      }
    ]
  },
  {
    id: "sample-anh10",
    title: "Unit 1: Family Life - Reading & Speaking (Tiếng Anh 10)",
    subject: "Tiếng Anh",
    grade: "Lớp 10",
    sections: [
      {
        title: "I. OBJECTIVES",
        content: `<b>1. Knowledge:</b> Vocabulary related to household chores and family roles.<br>
                  <b>2. Skills:</b> Reading for main ideas and specific details about benefits of doing chores.<br>
                  <b>3. Attitudes:</b> Awareness of sharing household responsibilities.`
      },
      {
        title: "II. TEACHING AIDS",
        content: `1. Teacher: Textbook, laptop, audio track, flashcards.<br>
                  2. Students: Textbooks, notebooks.`
      },
      {
        title: "III. PROCEDURE",
        content: `<b>Activity 1: Warm-up</b><br>
                  - Game: Matching household chores with corresponding pictures.<br><br>
                  <b>Activity 2: Knowledge Formation (Pre-reading & While-reading)</b><br>
                  - Teacher pre-teaches key vocabulary (breadwinner, homemaker, routine).<br>
                  - Students read the text and answer comprehension questions.<br><br>
                  <b>Activity 3: Practice (Post-reading)</b><br>
                  - Group discussion: Who should do household chores in your family?<br><br>
                  <b>Activity 4: Application</b><br>
                  - Make a weekly chore chart for family members.`
      }
    ]
  }
];
