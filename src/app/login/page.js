import { Suspense } from 'react';
import LoginClientPage from './LoginClientPage';

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginClientPage />
    </Suspense>
  );
}
