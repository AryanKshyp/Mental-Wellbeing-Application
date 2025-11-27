'use server';

import { cookies } from "next/headers";
import { createServerClient as createSupabaseServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

type SupabaseClient = ReturnType<typeof createSupabaseServerClient<Database>>;

/**
 * Creates a Supabase client for server-side operations
 * @returns Supabase client instance
 */
export async function createServerClient(): Promise<SupabaseClient> {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !(supabaseKey || supabaseServiceKey)) {
    throw new Error(
      'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and either NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY',
    );
  }

  // Use service role key if available, otherwise fallback to anon key
  const key = supabaseServiceKey || supabaseKey as string;

  return createSupabaseServerClient<Database>(
    supabaseUrl,
    key,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle cookie setting error
            console.error('Error setting cookie:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options, maxAge: 0 });
          } catch (error) {
            console.error('Error removing cookie:', error);
          }
        },
      },
    },
  );
}

/**
 * Get the current user's session
 * @returns Current session or null if not authenticated
 */
export async function getSession() {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    
    return data.session;
  } catch (error) {
    console.error('Unexpected error in getSession:', error);
    return null;
  }
}

/**
 * Get the current authenticated user
 * @returns Current user or null if not authenticated
 */
export async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session) return null;
    
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Unexpected error in getCurrentUser:', error);
    return null;
  }
}

// Export the server client for direct usage
export const createClient = createServerClient;
