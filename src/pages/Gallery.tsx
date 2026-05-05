import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { supabase } from "@/lib/supabase";

interface GalleryMedia {
  id: string;
  file_name: string;
  public_url: string;
  mime_type: string;
  caption: string | null;
  group_id: string | null;
  created_at: string;
}

interface GalleryGroup {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

const Gallery = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [media, setMedia] = useState<GalleryMedia[]>([]);
  const [groups, setGroups] = useState<GalleryGroup[]>([]);
  const [activeGroup, setActiveGroup] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // MUST be false initially
  const [showClusters, setShowClusters] = useState(false);

  const loadGroups = async () => {
    const { data } = await supabase
      .from("gallery_groups")
      .select("id, name, slug, sort_order")
      .order("sort_order", { ascending: true });
    return data || [];
  };

  const loadMedia = async () => {
    const { data, error } = await supabase
      .from("gallery_media")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setError("Failed to load gallery.");
    return data || [];
  };

  useEffect(() => {
    Promise.all([loadMedia(), loadGroups()]).then(([mediaData, groupsData]) => {
      setMedia(mediaData);
      setGroups(groupsData);
      setLoading(false);

      // URL filter ONLY — do NOT show clusters
      const clusterSlug = searchParams.get("cluster");
      if (clusterSlug) {
        const matched = groupsData.find((g) => g.slug === clusterSlug);
        if (matched) {
          setActiveGroup(matched.id);
        }
      }
    });
  }, []);

  const filteredMedia =
    activeGroup === "all"
      ? media
      : media.filter((m) => m.group_id === activeGroup);

  const groupsWithMedia = groups.filter((g) => g.slug !== "general");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-10 px-6">
        <div className="max-w-6xl mx-auto">

          <h1 className="text-5xl text-center mb-8">Gallery</h1>

          {/* CLUSTERS (STRICTLY CONTROLLED) */}
          {!loading && showClusters && groupsWithMedia.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              <button onClick={() => setActiveGroup("all")}>
                All ({media.length})
              </button>

              {groupsWithMedia.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setActiveGroup(g.id)}
                >
                  {g.name} ({media.filter((m) => m.group_id === g.id).length})
                </button>
              ))}
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div className="text-center py-20">Loading...</div>
          )}

          {/* ERROR */}
          {error && (
            <div className="text-center py-20 text-red-500">{error}</div>
          )}

          {/* EMPTY */}
          {!loading && filteredMedia.length === 0 && (
            <div className="text-center py-20">No media</div>
          )}

          {/* GRID */}
          {filteredMedia.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia.map((item) => (
                <img
                  key={item.id}
                  src={item.public_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ))}
            </div>
          )}

          {/* TOGGLE BUTTON */}
          {!loading && groupsWithMedia.length > 0 && (
            <div className="flex justify-center pt-8">
              <button
                onClick={() => {
                  if (showClusters) {
                    setShowClusters(false);
                    setActiveGroup("all"); // reset filter
                  } else {
                    setShowClusters(true);
                  }
                }}
                className="px-6 py-2 border rounded"
              >
                {showClusters ? "Hide All" : "Show All"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Gallery;
