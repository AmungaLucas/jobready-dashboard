import { AuthContextProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata = {
  title: 'Role Based Dashboard',
  description: 'Dashboard with role-based access control',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}