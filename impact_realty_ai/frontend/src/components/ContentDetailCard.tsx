import Image from 'next/image';
import { ContentItem } from '@/types/content';

export default function ContentDetailCard({ item }: { item: ContentItem }) {
  return (
    <div className="rounded-2xl shadow-glass bg-card p-6 flex flex-col md:flex-row gap-8">
      <div className="relative w-full md:w-64 h-56 md:h-72 flex-shrink-0">
        <Image
          src={item.image_url}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover rounded-2xl shadow"
          priority
        />
      </div>
      <div className="flex flex-col flex-1">
        <h2 className="font-heading text-3xl font-bold text-foreground mb-3">
          {item.title}
        </h2>
        <span className="inline-block bg-muted text-accent px-3 py-1 rounded-full text-xs font-semibold mb-4">
          {item.category}
        </span>
        <p className="text-muted-foreground text-lg mb-5">
          {item.description}
        </p>
        <div className="flex flex-wrap gap-3 mb-4">
          {Object.entries(item.attributes).map(([key, value]) => (
            <span key={key} className="px-3 py-1 rounded bg-primary/10 text-primary text-xs font-medium">
              {key}: {value}
            </span>
          ))}
        </div>
        <div className="flex gap-2 mt-auto">
          <button className="px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow hover:bg-secondary transition duration-200">
            Try This Feature
          </button>
          <button className="px-6 py-2 bg-muted text-primary font-semibold rounded-lg shadow hover:bg-card border border-primary/20 transition duration-200">
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
}
