// app/page.tsx
import { redirect } from 'next/navigation';

export default function Page() {
  // Redirects to the rollup-communication page
  redirect('/communication');
}