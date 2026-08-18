import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://dryfuzamtuzcbhcxklna.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_fIo0AwftJnb8qxfHxXtPBg_THIFp2Y8';

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

// DEV: On web, add a lightweight debug wrapper for `fetch` to log outgoing
// requests to the Supabase URL and surface the `Authorization` header so
// developers can verify the session is being attached.
if (!isReactNative && typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    try {
        const originalFetch = globalThis.fetch.bind(globalThis);
        globalThis.fetch = async (input: RequestInfo, init?: RequestInit) => {
            try {
                const url = typeof input === 'string' ? input : (input as any).url ?? '';
                if (typeof url === 'string' && url.includes(SUPABASE_URL)) {
                    let authHeader: string | null | undefined = undefined;
                    if (init?.headers) {
                        const h = init.headers as any;
                        if (typeof (h as Headers).get === 'function') {
                            authHeader = (h as Headers).get('Authorization') ?? (h as Headers).get('authorization');
                        } else if (typeof h === 'object') {
                            authHeader = h['Authorization'] ?? h['authorization'];
                        }
                    } else if ((input as any)?.headers) {
                        const h = (input as any).headers;
                        if (typeof (h as Headers).get === 'function') authHeader = h.get('Authorization') ?? h.get('authorization');
                        else authHeader = h['Authorization'] ?? h['authorization'];
                    }
                    console.log('[supabase-debug] Fetch ->', url, 'Authorization:', authHeader);
                }
            } catch (e) {
                // swallow
            }
            return originalFetch(input, init);
        };
    } catch (e) {
        // ignore if fetch patching fails
    }
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, supabaseOptions);

// DEV: log current session and auth events on web so developers can verify
// that a session exists and which user is signed in (no tokens are printed).
if (!isReactNative && typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    (async () => {
        try {
            const { data } = await supabase.auth.getSession();
            console.log('[supabase-debug] session exists:', !!data.session, 'user id:', data.session?.user?.id ?? null);
        } catch (e) {
            // ignore
        }

        try {
            supabase.auth.onAuthStateChange((event, session) => {
                console.log('[supabase-debug] auth event:', event, 'user id:', session?.user?.id ?? null);
            });
        } catch (e) {
            // ignore
        }
    })();
}
