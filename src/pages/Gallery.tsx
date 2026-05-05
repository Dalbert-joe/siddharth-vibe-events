// FULL FILE WITH FIXED CLUSTER TOGGLE LOGIC
// Only logic cleaned. No visual changes.

import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ImageOff, Play } from "lucide-react";
import Navigation from "@/components/Navigation";
import Modal from "@/components/Modal";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

// --- TYPES ---
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

// --- COMPONENT ---
const Gallery = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [media, setMedia] = useState<GalleryMedia[]>([]);
  const [groups, setGroups] = useState<GalleryGroup[]>([]);
  const [activeGroup, setActiveGroup] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [showClusters, setShowClusters] = useState(false);

  const loadGroups = async () => {
    const { data } = await supabase
      .from("gallery_groups")
      .select("id, name, slug, sort_order")
      .order("sort_order", { ascending: true });
    return data || [];
  };

  const loadMedia = async () => {
    const { data } = await supabase
      .from("gallery_media")
      .select("*")
      .order("created_at", { ascending: false });
    return data || [];
  };

  useEffect(() => {
    Promise.all([loadMedia(), loadGroups()]).then(([m, g]) => {
      setMedia(m);
      setGroups(g);
      setLoading(false);

      const clusterSlug = searchParams.get("cluster");
      if (clusterSlug) {
        const matched = g.find((x) => x.slug === clusterSlug);
        if (matched) {
          setActiveGroup(matched.id);
          setShowClusters(true);
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
    <div className="min-h-screen">
      <Navigation />

      <div className="pt-24 px-6">
        <div className="max-w-6xl mx-auto">

          <h1 className="text-4xl text-center mb-6">Gallery</h1>

          {/* CLUSTERS (HIDDEN BY DEFAULT) */}
          {!loading && showClusters === true && groupsWithMedia.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              <button onClick={() => setActiveGroup("all")}>All ({media.length})</button>

              {groupsWithMedia.map((g) => (
                <button key={g.id} onClick={() => setActiveGroup(g.id)}>
                  {g.name} ({media.filter((m) => m.group_id === g.id).length})
                </button>
              ))}
            </div>
          )}

          {/* MEDIA */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredMedia.map((item) => (
              <img key={item.id} src={item.public_url} />
            ))}
          </div>

          {/* TOGGLE BUTTON */}
          {!loading && groupsWithMedia.length > 0 && (
            <div className="flex justify-center py-10">
              <button
                onClick={() => {
                  if (showClusters) {
                    setShowClusters(false);
                    setActiveGroup("all");
                  } else {
                    setShowClusters(true);
                  }
                }}
              >
                {showClusters ? "Hide All" : "Show All"}
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal open={false} onClose={() => {}} title="" />
    </div>
  );
};

export default Gallery;
