import { supabase } from "../config/supabase";

export interface AuthResponse {
  session: any;
  user: any;
}

export interface AuthError {
  message: string;
  status: number;
}

/**
 * Sign in a user with email and password
 */
export async function signIn(
  email: string,
  password: string,
): Promise<{ data: AuthResponse | null; error: AuthError | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          status: error.status || 400,
        },
      };
    }

    return {
      data: {
        session: data.session,
        user: data.user,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: {
        message: err instanceof Error ? err.message : "Unknown error occurred",
        status: 500,
      },
    };
  }
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(
  email: string,
  password: string,
): Promise<{ data: AuthResponse | null; error: AuthError | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          status: error.status || 400,
        },
      };
    }

    return {
      data: {
        session: data.session,
        user: data.user,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: {
        message: err instanceof Error ? err.message : "Unknown error occurred",
        status: 500,
      },
    };
  }
}

/**
 * Sign out a user
 */
export async function signOut(
  token: string,
): Promise<{ error: AuthError | null }> {
  try {
    // Set the session using the access token
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: "", // We don't need refresh token for signout
    });

    if (sessionError) {
      return {
        error: {
          message: sessionError.message,
          status: sessionError.status || 400,
        },
      };
    }

    // Sign out
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        error: {
          message: error.message,
          status: error.status || 400,
        },
      };
    }

    return { error: null };
  } catch (err) {
    return {
      error: {
        message: err instanceof Error ? err.message : "Unknown error occurred",
        status: 500,
      },
    };
  }
}
