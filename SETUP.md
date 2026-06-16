# Tên Dự Án

Mô tả ngắn gọn về dự án của bạn.

---

## Yêu cầu

- Node.js >= 18.x
- npm / yarn / pnpm

---

## Cài đặt & Chạy

```bash
git clone https://github.com/your-org/your-repo.git
cd your-repo
npm install
cp .env.example .env.local
npm run dev
```

Truy cập [http://localhost:3000](http://localhost:3000).

---

## Biến môi trường

Tạo file `.env` ở thư mục gốc:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```
> Nên chạy khác port của server backend (pnpm dev -p PORT VD: pnpm dev -p 3001)
> Không commit file `.env` lên Git.

---

## Scripts

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Chạy development server |
| `npm run build` | Build production |
| `npm run start` | Chạy production server |
| `npm run lint` | Kiểm tra lỗi ESLint |

---

## Cấu trúc thư mục

```
├── app/                  # App Router (Next.js 13+)
│   ├── (auth)/           # Trang login, register...
│   ├── dashboard/        # Trang private
│   └── layout.tsx
├── components/           # UI components dùng chung
├── constants/            # Config, hằng số
├── lib/                  # Auth helpers, storage, api client
├── services/             # Gọi API
├── types/                # TypeScript types
└── middleware.ts         # Xử lý redirect auth
```

---

## Quy ước làm việc

- **Branch:** `feature/ten-tinh-nang` hoặc `fix/ten-loi`
- **Commit:** `feat: ...` / `fix: ...` / `chore: ...`
- **PR:** không push thẳng lên `main`