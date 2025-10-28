"use client";

import { useState } from "react";
import type { CategoryDefinition } from "@/lib/categories";

interface CategoryListProps {
  categories: CategoryDefinition[];
}

export function CategoryList({ categories }: CategoryListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState({
    slug: "",
    name: "",
    description: "",
  });

  const handleAddCategory = () => {
    // TODO: Implement add category action
    console.log("Add category:", newCategory);
    setIsAdding(false);
    setNewCategory({ slug: "", name: "", description: "" });
  };

  return (
    <div className="u-stack u-gap-md">
      <div className="u-flex u-justify-between u-items-center">
        <span className="u-text-sm u-text-muted">{categories.length} categories</span>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr auto", gap: "0.5rem", alignItems: "end" }}>
            <input
              type="text"
              className="input"
              value={newCategory.slug}
              onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
              placeholder="slug"
              style={{ fontSize: "0.875rem" }}
            />
            <input
              type="text"
              className="input"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              placeholder="Name"
              style={{ fontSize: "0.875rem" }}
            />
            <input
              type="text"
              className="input"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              placeholder="Description (optional)"
              style={{ fontSize: "0.875rem" }}
            />
            <div className="u-flex u-gap-xs">
              <button className="button button--xs" onClick={handleAddCategory}>
                Save
              </button>
              <button
                className="button button--xs button--ghost"
                onClick={() => {
                  setIsAdding(false);
                  setNewCategory({ slug: "", name: "", description: "" });
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
            <th style={{ padding: "0.5rem", fontWeight: 600, textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.slug} style={{ borderBottom: "1px solid var(--color-border)" }}>
              <td style={{ padding: "0.5rem" }}>
                <code className="u-text-xs" style={{ color: "var(--color-text-muted)" }}>{category.slug}</code>
              </td>
              <td style={{ padding: "0.5rem", fontWeight: 500 }}>{category.name}</td>
              <td style={{ padding: "0.5rem", color: "var(--color-text-muted)" }}>
                {category.description || "—"}
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
