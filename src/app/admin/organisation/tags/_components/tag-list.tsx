"use client";

import { useState } from "react";
import type { TagDefinition } from "@/lib/tags";

interface TagListProps {
  tags: TagDefinition[];
}

export function TagList({ tags }: TagListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTag, setNewTag] = useState({
    slug: "",
    name: "",
    description: "",
    aliases: "",
  });

  const handleAddTag = () => {
    // TODO: Implement add tag action
    console.log("Add tag:", newTag);
    setIsAdding(false);
    setNewTag({ slug: "", name: "", description: "", aliases: "" });
  };

  return (
    <div className="u-stack u-gap-md">
      <div className="u-flex u-justify-between u-items-center">
        <span className="u-text-sm u-text-muted">{tags.length} tags</span>
        <button
          className="button button--sm"
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
        >
          + Add
        </button>
      </div>

      {isAdding && (
        <div
          style={{
            padding: "0.75rem",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr 1fr auto", gap: "0.5rem", alignItems: "end" }}>
            <input
              type="text"
              className="input"
              value={newTag.slug}
              onChange={(e) => setNewTag({ ...newTag, slug: e.target.value })}
              placeholder="slug"
              style={{ fontSize: "0.875rem" }}
            />
            <input
              type="text"
              className="input"
              value={newTag.name}
              onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
              placeholder="Name"
              style={{ fontSize: "0.875rem" }}
            />
            <input
              type="text"
              className="input"
              value={newTag.description}
              onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
              placeholder="Description (optional)"
              style={{ fontSize: "0.875rem" }}
            />
            <input
              type="text"
              className="input"
              value={newTag.aliases}
              onChange={(e) => setNewTag({ ...newTag, aliases: e.target.value })}
              placeholder="Aliases"
              style={{ fontSize: "0.875rem" }}
            />
            <div className="u-flex u-gap-xs">
              <button className="button button--xs" onClick={handleAddTag}>
                Save
              </button>
              <button
                className="button button--xs button--ghost"
                onClick={() => {
                  setIsAdding(false);
                  setNewTag({ slug: "", name: "", description: "", aliases: "" });
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
            <th style={{ padding: "0.5rem", fontWeight: 600 }}>Slug</th>
            <th style={{ padding: "0.5rem", fontWeight: 600 }}>Name</th>
            <th style={{ padding: "0.5rem", fontWeight: 600 }}>Description</th>
            <th style={{ padding: "0.5rem", fontWeight: 600 }}>Aliases</th>
            <th style={{ padding: "0.5rem", fontWeight: 600, textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tags.map((tag) => (
            <tr key={tag.slug} style={{ borderBottom: "1px solid var(--color-border)" }}>
              <td style={{ padding: "0.5rem" }}>
                <code className="u-text-xs" style={{ color: "var(--color-text-muted)" }}>{tag.slug}</code>
              </td>
              <td style={{ padding: "0.5rem", fontWeight: 500 }}>{tag.name}</td>
              <td style={{ padding: "0.5rem", color: "var(--color-text-muted)" }}>
                {tag.description || "—"}
              </td>
              <td style={{ padding: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
                {tag.aliases && tag.aliases.length > 0 ? tag.aliases.join(", ") : "—"}
              </td>
              <td style={{ padding: "0.5rem", textAlign: "right" }}>
                <div className="u-flex u-gap-xs u-justify-end">
                  <button className="button button--xs button--ghost">Edit</button>
                  <button className="button button--xs button--ghost" style={{ color: "var(--color-red-500)" }}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
