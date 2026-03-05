# Quy trình development (sửa frontend thấy ngay trên browser)

## Vấn đề
Khi chạy frontend trong Docker (Colima), sửa `frontend/src/App.tsx` không phản ánh lên browser vì bind mount + môi trường container không đồng bộ file đúng cách.

## Cách chạy đúng (sửa App.tsx thấy ngay)

1. **Chỉ chạy DB + Backend trong Docker**
   ```bash
   cd /Users/hoanganh/workspace/finance_ai
   docker-compose up
   ```
   (Frontend không chạy trong Docker — service frontend đã gắn profile `with-frontend` nên mặc định không start.)

2. **Chạy frontend trên máy host**
   ```bash
   cd /Users/hoanganh/workspace/finance_ai/frontend
   npm install
   npm run dev
   ```

3. Mở browser: **http://localhost:5173**

Khi đó Vite chạy trực tiếp trên máy bạn, mọi thay đổi trong `App.tsx` (và mọi file trong `frontend/src`) sẽ được HMR phản ánh ngay, không cần refresh.

API backend vẫn ở **http://localhost:3000** (container backend), frontend đã cấu hình gọi đúng trong `src/api/client.ts`.

---

## Khi nào chạy frontend trong Docker?

Nếu bạn muốn chạy **cả stack trong Docker** (để test giống production):

```bash
docker-compose --profile with-frontend up
```

Lưu ý: trong môi trường Docker/Colima, sửa file trên host có thể vẫn không trigger HMR đúng; khi cần sửa frontend liên tục, ưu tiên dùng quy trình “frontend trên host” ở trên.

---

## Phân tích AI (OpenAI)

Trang **Phân tích tài chính** gọi backend để tạo phân tích bằng OpenAI (GPT). Để dùng phân tích thật (không mock), cấu hình **`OPENAI_API_KEY`** cho backend (ví dụ trong `backend/.env.docker`). Nếu không set, backend trả về kết quả mock.
