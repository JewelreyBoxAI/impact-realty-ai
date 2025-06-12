"use client";
import Link from 'next/link';
import Image from 'next/image';
import { ContentItem } from '@/types/content';

export default function ContentList({ items }: { items: ContentItem[] }) {
  return (
    <section>
      <h2 className="text-3xl font-heading font-bold text-foreground mb-8 mt-4 animate-fade-in" id="features">
        Explore Our Solutions
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {items.map((item) => (
          <Link
            href={`/content/${item.id}`}
            key={item.id}
            className="relative group rounded-2xl shadow-glass bg-card transition-transform hover:-translate-y-1 hover:shadow-xl overflow-hidden flex flex-col min-h-[320px]"
          >
            <div className="relative w-full h-48">
              <Image
                src={item.image_url}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-200"
                priority={false}
              />
            </div>
            <div className="flex flex-col flex-1 p-5">
              <h3 className="font-heading text-xl font-semibold mb-2 text-foreground">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-base mb-4 flex-1">
                {item.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2 py-1 rounded bg-muted text-xs font-medium text-accent">
                  {item.category}
                </span>
                {Object.entries(item.attributes).map(([key, value]) => (
                  <span key={key} className="px-2 py-1 rounded bg-muted text-xs font-medium text-primary">
                    {key}: {value}
                  </span>
                ))}
              </div>
              <span className="inline-block text-primary hover:underline text-sm font-semibold">
                View Details &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
