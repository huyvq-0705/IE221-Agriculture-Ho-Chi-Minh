import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

interface AdminAuthCheckProps {
  children: React.ReactNode;
}

export default async function AdminAuthCheck({ children }: AdminAuthCheckProps) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    redirect('/agrihcmAdmin/login');
  }

  return <>{children}</>;
}
