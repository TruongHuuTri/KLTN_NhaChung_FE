import LoginForm from '@/components/auth/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo Section */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full flex items-center justify-center shadow-lg">
            <div className="text-3xl">🏠</div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Nhà Chung
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Tìm trọ tốt, tìm người bạn chung nhà
          </p>
          <p className="text-lg text-gray-800 font-medium">
            Đăng nhập Admin
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
