"use client";
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/common/LoadingSpinner';

type FormFields = {
  title: string;
  description: string;
  category: string;
  image_url: string;
  platform: string;
  scale: string;
};

const initialState: FormFields = {
  title: '',
  description: '',
  category: '',
  image_url: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=400&q=80', // Default image
  platform: 'Web',
  scale: 'All'
};

export default function AddContentPage() {
  const [formState, setFormState] = useState<FormFields>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check auth status first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('You must be logged in to add content');
        setLoading(false);
        return;
      }

      // Generate a UUID for the new content
      const contentId = uuidv4();
      
      // Create content item
      const newItem = {
        id: contentId,
        title: formState.title,
        description: formState.description,
        image_url: formState.image_url,
        category: formState.category,
        attributes: {
          platform: formState.platform,
          scale: formState.scale
        },
        created_at: new Date().toISOString(),
        user_id: session.user.id
      };

      // In a real app, you would insert this into a database table
      // For this example, we'll use the local storage to simulate
      const { error: insertError } = await supabase
        .from('content_items')
        .insert(newItem);

      if (insertError) {
        throw new Error(insertError.message);
      }

      setSuccess(true);
      formRef.current?.reset();
      setFormState(initialState);

      // Redirect after delay
      setTimeout(() => {
        router.push(`/content/${contentId}`);
      }, 1500);
    } catch (err: any) {
      console.error('Error adding content:', err);
      setError(err.message || 'Failed to add content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="font-heading text-3xl font-bold mb-8 text-center text-primary">
        Add New Content
      </h1>

      {success && (
        <div className="mb-6 p-4 bg-success/10 text-success rounded-lg text-center animate-fade-in">
          Content added successfully! Redirecting...
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-error/10 text-error rounded-lg text-center animate-fade-in">
          {error}
        </div>
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="space-y-6 bg-card p-8 rounded-2xl shadow-glass animate-fade-in"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label htmlFor="title" className="font-medium mb-1 text-foreground">
              Title <span className="text-error">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formState.title}
              onChange={handleChange}
              className="input input-bordered px-4 py-2 rounded-lg bg-input border-border focus:ring-primary focus:outline-none"
              placeholder="Enter content title"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="category" className="font-medium mb-1 text-foreground">
              Category <span className="text-error">*</span>
            </label>
            <input
              type="text"
              id="category"
              name="category"
              required
              value={formState.category}
              onChange={handleChange}
              className="input input-bordered px-4 py-2 rounded-lg bg-input border-border focus:ring-primary focus:outline-none"
              placeholder="e.g. Analytics, Marketing"
            />
          </div>

          <div className="flex flex-col md:col-span-2">
            <label htmlFor="description" className="font-medium mb-1 text-foreground">
              Description <span className="text-error">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={formState.description}
              onChange={handleChange}
              rows={3}
              className="textarea textarea-bordered px-4 py-2 rounded-lg bg-input border-border focus:ring-primary focus:outline-none"
              placeholder="Describe this content feature"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="image_url" className="font-medium mb-1 text-foreground">
              Image URL
            </label>
            <input
              type="url"
              id="image_url"
              name="image_url"
              value={formState.image_url}
              onChange={handleChange}
              className="input input-bordered px-4 py-2 rounded-lg bg-input border-border focus:ring-primary focus:outline-none"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="platform" className="font-medium mb-1 text-foreground">
              Platform
            </label>
            <select
              id="platform"
              name="platform"
              value={formState.platform}
              onChange={handleChange}
              className="select select-bordered px-4 py-2 rounded-lg bg-input border-border focus:ring-primary focus:outline-none"
            >
              <option value="Web">Web</option>
              <option value="Mobile">Mobile</option>
              <option value="Web & Mobile">Web & Mobile</option>
              <option value="Cloud">Cloud</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="scale" className="font-medium mb-1 text-foreground">
              Scale
            </label>
            <select
              id="scale"
              name="scale"
              value={formState.scale}
              onChange={handleChange}
              className="select select-bordered px-4 py-2 rounded-lg bg-input border-border focus:ring-primary focus:outline-none"
            >
              <option value="All">All</option>
              <option value="Startup">Startup</option>
              <option value="SMB">SMB</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 rounded-lg bg-muted text-foreground font-semibold hover:bg-muted/70 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-secondary transition-colors disabled:opacity-70 flex items-center gap-2"
          >
            {loading ? (
              <>
                <LoadingSpinner size={20} />
                <span>Adding...</span>
              </>
            ) : (
              'Add Content'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 