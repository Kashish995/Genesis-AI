/**
 * Safe JSON parser with validation - never crashes on invalid input
 */
export function safeParseJSON(jsonString, fallback = null) {
  if (!jsonString) return fallback;
  if (typeof jsonString === 'object') return jsonString;
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
}

/**
 * Validate an app config structure
 */
export function validateAppConfig(config) {
  const errors = [];
  
  if (!config || typeof config !== 'object') {
    return { valid: false, errors: ['Configuration must be a valid object'] };
  }

  if (!config.entities && !config.pages && !config.dashboard) {
    errors.push('Configuration must define at least one of: entities, pages, or dashboard');
  }

  if (config.entities && !Array.isArray(config.entities)) {
    errors.push('"entities" must be an array');
  }

  if (config.pages && !Array.isArray(config.pages)) {
    errors.push('"pages" must be an array');
  }

  if (config.entities) {
    config.entities.forEach((entity, i) => {
      if (!entity.name) errors.push(`Entity at index ${i} is missing "name"`);
      if (!entity.fields || !Array.isArray(entity.fields)) {
        errors.push(`Entity "${entity.name || i}" must have a "fields" array`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Extract entities from config
 */
export function extractEntities(config) {
  if (!config?.entities) return [];
  return config.entities.filter(e => e && e.name && e.fields);
}

/**
 * Extract pages from config
 */
export function extractPages(config) {
  if (!config?.pages) return [];
  return config.pages.filter(p => p && p.name);
}

/**
 * Generate default CRUD operations for an entity
 */
export function generateEntityOperations(entity) {
  return {
    list: { type: 'table', entity: entity.name, columns: entity.fields },
    create: { type: 'form', entity: entity.name, fields: entity.fields, mode: 'create' },
    edit: { type: 'form', entity: entity.name, fields: entity.fields, mode: 'edit' },
    detail: { type: 'detail', entity: entity.name, fields: entity.fields },
  };
}

/**
 * Default app config template
 */
export const DEFAULT_APP_CONFIG = {
  entities: [
    {
      name: "Task",
      icon: "CheckSquare",
      fields: [
        { name: "title", type: "string", required: true, label: "Title" },
        { name: "description", type: "text", label: "Description" },
        { name: "status", type: "select", options: ["todo", "in_progress", "done"], default: "todo", label: "Status" },
        { name: "priority", type: "select", options: ["low", "medium", "high"], default: "medium", label: "Priority" },
        { name: "due_date", type: "date", label: "Due Date" }
      ]
    }
  ],
  pages: [
    {
      name: "Dashboard",
      icon: "LayoutDashboard",
      layout: "dashboard",
      components: [
        { type: "stat_card", title: "Total Tasks", entity: "Task", metric: "count" },
        { type: "stat_card", title: "Completed", entity: "Task", metric: "count", filter: { status: "done" } },
        { type: "chart", chartType: "bar", entity: "Task", groupBy: "status", title: "Tasks by Status" },
        { type: "table", entity: "Task", title: "Recent Tasks", limit: 5 }
      ]
    },
    {
      name: "Tasks",
      icon: "CheckSquare",
      layout: "crud",
      entity: "Task"
    }
  ],
  theme: {
    primaryColor: "#3B82F6",
    name: "Default"
  }
};