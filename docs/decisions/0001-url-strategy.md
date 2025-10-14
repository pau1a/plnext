# ADR 0001 — URL Strategy for Blog Posts

**Status:** Accepted  
**Context:** We want permanent post URLs that survive future taxonomy changes.  
**Decision:** Posts live at `/blog/[slug]` (flat). Categories and tags are metadata; category pages live at `/blog/category/[slug]`.  
**Consequences:** No link rot when categories are renamed or reorganised; category is decoupled from identity.
