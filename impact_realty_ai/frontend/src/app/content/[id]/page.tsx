import { notFound } from 'next/navigation';
import { mockContent } from '@/utils/mockContent';
import dynamic from 'next/dynamic';

const ContentDetailCardWithSelect = dynamic(() => import('@/components/ContentDetailCardWithSelect'));

export default function ContentDetailPage({ params }: { params: { id: string } }) {
  const item = mockContent.find((c) => c.id === params.id);
  if (!item) {
    notFound();
  }
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <ContentDetailCardWithSelect item={item!} />
    </div>
  );
}
