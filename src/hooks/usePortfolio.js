/**
 * PUBLIC PORTFOLIO DATA HOOK
 * No Supabase config: show local preview data (not production records).
 * With Supabase: fetch profile, site settings, and published collections.
 * Only approved visitor comments are fetched through a database RPC.
 */
import { useEffect, useState } from "react";
import { configured, supabase } from "../lib/supabase.js";
import { preview } from "../data/preview.js";
import { readPublic, readSingleton } from "../lib/api.js";

export function usePortfolio() {
  const [state, setState] = useState({
    data: configured ? null : preview,
    loading: configured,
    error: "",
  });

  useEffect(() => {
    // In preview mode there is no live database to query.
    if (!configured) return;

    let alive = true;

    async function load() {
      try {
        // Independent collections can load at the same time.
        const names = [
          "skills",
          "projects",
          "project_images",
          "experience",
          "education",
          "certificates",
          "services",
          "social_links",
        ];
        const [profile, settings, ...results] = await Promise.all([
          readSingleton("profiles"),
          readSingleton("site_settings"),
          ...names.map(readPublic),
        ]);

        // Use the public-safe RPC, NOT the private comments table.
        let comments = [];
        const { data: approved, error: rpcError } = await supabase.rpc(
          "get_approved_comments",
        );
        if (!rpcError) comments = approved || [];

        // Convert the array of collection results into a named data object.
        if (alive) {
          setState({
            data: {
              profile,
              site_settings: settings,
              comments,
              ...Object.fromEntries(names.map((name, i) => [name, results[i]])),
            },
            loading: false,
            error: "",
          });
        }
      } catch (error) {
        if (alive) {
          setState({ data: null, loading: false, error: error.message });
        }
      }
    }

    load();

    // Avoid setting React state if the component is unmounted mid-request.
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
