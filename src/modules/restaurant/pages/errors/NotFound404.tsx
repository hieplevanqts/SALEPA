import { Link } from "react-router-dom";

export default function NotFound404() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-gray-400">404</h1>
      <p className="mt-4 text-lg text-gray-600">
        Trang bạn tìm không tồn tại
      </p>
      <Link
        to="/"
        className="mt-6 px-4 py-2 bg-[#FE7410] text-white rounded-lg"
      >
        Quay về trang chủ
      </Link>
    </div>
  );
}
