import { HomeContent } from '@/components/home/HomeContent';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: { q?: string; cat?: string };
}

export default function HomePage({ searchParams }: PageProps) {
  return (
    <HomeContent
      initialSearch={searchParams.q ?? ''}
      initialCategory={searchParams.cat ?? ''}
    />
  );
}