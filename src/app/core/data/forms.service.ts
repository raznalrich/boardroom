import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase';

/** Visitor-facing forms. Rows are insert-only for the public; only admins can read them. */
@Injectable({ providedIn: 'root' })
export class FormsService {
  /** Network page "Apply for membership" pop-up. Returns an error message or null. */
  async submitMembership(v: { name: string; phone: string; email: string }): Promise<string | null> {
    const { error } = await supabase.from('membership_applications').insert({
      name: v.name.trim(), phone: v.phone.trim(), email: v.email.trim()
    });
    if (error) console.error('Membership application failed:', error.message);
    return error ? 'Something went wrong. Please try again.' : null;
  }

  /** "Submit a blog" page. Returns an error message or null. */
  async submitBlog(v: { name: string; email: string; headline: string; category: string; content: string }): Promise<string | null> {
    const { error } = await supabase.from('blog_submissions').insert({
      author_name: v.name.trim(), email: v.email.trim(), headline: v.headline.trim(), category: v.category, content: v.content.trim()
    });
    if (error) console.error('Blog submission failed:', error.message);
    return error ? 'Something went wrong. Please try again.' : null;
  }
}
