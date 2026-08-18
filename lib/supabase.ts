import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

// Use AsyncStorage for React Native environments; on web, let supabase-js use the
// default browser storage (localStorage) so auth sessions are correctly attached
// to requests. Passing AsyncStorage in a web runtime can prevent the session
// from being used and lead to unauthenticated requests (RLS failures).
const supabaseOptions = isReactNative
    ? {
        auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    }
    : undefined;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, supabaseOptions);
