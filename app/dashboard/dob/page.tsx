import DobPage from '@/app/ui/dob';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Date of Birth',
};

export default function Page() {
  return <DobPage />;
}
